/**
 * Rehype plugin: optimize local images in markdown content.
 *
 * - Converts local PNG/JPEG images to WebP (800w max, quality 80)
 * - Generates 1x (800w) and 2x (1600w) srcset variants
 * - Copies SVGs to dist/_images/ with content-hash naming
 * - Adds loading="lazy" and decoding="async" to all images
 * - Adds referrerpolicy="no-referrer" to external images
 * - Writes output to dist/_images/<contenthash>.webp (or .svg)
 */
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { VFile } from "vfile";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";

const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const OUTPUT_DIR = "dist/_images";

interface ImageFile {
  src: string;
  resolvedPath: string;
  hash: string;
  width: number;
  height: number;
}

function isExternalUrl(src: string): boolean {
  return /^https?:\/\//i.test(src) || src.startsWith("//");
}

function isSvg(src: string): boolean {
  return /\.svg$/i.test(src);
}

function isLocalPath(src: string): boolean {
  return src.startsWith("./") || src.startsWith("../");
}

function contentHash(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

function ensureOutputDir() {
  const dir = path.resolve(OUTPUT_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function processImage(
  src: string,
  vfileDir: string,
): Promise<ImageFile | null> {
  try {
    const fullPath = path.resolve(vfileDir, src);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[rehype-image] Image not found: ${fullPath}`);
      return null;
    }

    const originalBuffer = fs.readFileSync(fullPath);
    const metadata = await sharp(originalBuffer).metadata();

    if (!metadata.width) return null;

    const hash = contentHash(originalBuffer);
    const outputWidth = Math.min(metadata.width, MAX_WIDTH);
    const aspectRatio = metadata.height
      ? metadata.height / metadata.width
      : 1;
    const outputHeight = Math.round(outputWidth * aspectRatio);

    const outputDir = ensureOutputDir();

    // Generate 1x version
    const img1x = `${hash}.webp`;
    const img1xPath = path.join(outputDir, img1x);
    if (!fs.existsSync(img1xPath)) {
      await sharp(originalBuffer)
        .resize(outputWidth, outputHeight, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(img1xPath);
    }

    // Generate 2x version (if original is large enough)
    let img2x: string | null = null;
    const r2xWidth = Math.min(metadata.width, MAX_WIDTH * 2);
    if (r2xWidth > outputWidth) {
      img2x = `${hash}@2x.webp`;
      const img2xPath = path.join(outputDir, img2x);
      if (!fs.existsSync(img2xPath)) {
        await sharp(originalBuffer)
          .resize(r2xWidth, Math.round(r2xWidth * aspectRatio), {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toFile(img2xPath);
      }
    }

    return { src, resolvedPath: fullPath, hash, width: outputWidth, height: outputHeight };
  } catch (err) {
    console.warn(`[rehype-image] Failed to process ${src}:`, err);
    return null;
  }
}

/** Compute hash and copy SVG to dist/_images/<hash>.svg. Returns the hash or null. */
function copySvg(fullPath: string): string | null {
  try {
    const buf = fs.readFileSync(fullPath);
    const hash = contentHash(buf);
    const outputDir = ensureOutputDir();
    const outputPath = path.join(outputDir, `${hash}.svg`);
    if (!fs.existsSync(outputPath)) {
      fs.copyFileSync(fullPath, outputPath);
    }
    return hash;
  } catch (err) {
    console.warn(`[rehype-image] Failed to copy SVG ${fullPath}:`, err);
    return null;
  }
}

export default function rehypeImageOptimizer() {
  /**
   * Track processed images across all pages (plugin-level cache).
   * Keyed by resolved absolute path → hash, so the same image
   * processed from multiple notes reuses the cached output filename.
   */
  const processedMap = new Map<string, { hash: string }>();

  return async (tree: Root, file: VFile) => {
    const vfilePath = file.path;
    if (!vfilePath) return;

    const vfileDir = path.dirname(vfilePath);

    const imgNodes: { node: Element; index: number; parent: Element }[] = [];

    visit(tree, "element", (node: Element, index, parent: Element | undefined) => {
      if (node.tagName === "img" && node.properties?.src && parent) {
        const src = String(node.properties.src);
        if (isLocalPath(src) && !isExternalUrl(src)) {
          imgNodes.push({ node, index: index!, parent });
        }
        if (isExternalUrl(src)) {
          node.properties.loading = "lazy";
          node.properties.decoding = "async";
          node.properties.referrerpolicy = "no-referrer";
        }
      }
    });

    for (const { node } of imgNodes) {
      const src = String(node.properties.src!);
      const alt = String(node.properties.alt || "");
      const fullPath = path.resolve(vfileDir, src);

      // Check cache
      let cached = processedMap.get(fullPath);

      if (!cached) {
        if (isSvg(src)) {
          const hash = copySvg(fullPath);
          if (hash) {
            cached = { hash };
            processedMap.set(fullPath, cached);
          }
        } else {
          const result = await processImage(src, vfileDir);
          if (result) {
            cached = { hash: result.hash };
            processedMap.set(fullPath, cached);
          }
        }
      }

      if (cached) {
        if (isSvg(src)) {
          node.properties.src = `/_images/${cached.hash}.svg`;
          node.properties.loading = "lazy";
        } else {
          // Replace with optimized WebP with srcset
          const src1x = `/_images/${cached.hash}.webp`;
          const src2x = `/_images/${cached.hash}@2x.webp`;
          node.properties.src = src1x;
          node.properties.srcset = `${src1x} 1x, ${src2x} 2x`;
          node.properties.sizes = `(max-width: ${MAX_WIDTH}px) 100vw, ${MAX_WIDTH}px`;
          node.properties.loading = "lazy";
          node.properties.decoding = "async";
        }
      } else {
        // Processing failed: add lazy loading but keep original src as fallback
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }

      if (!node.properties.alt && alt) {
        node.properties.alt = alt;
      }
    }
  };
}
