/**
 * Pagefind search modal — vanilla JS
 *
 * Opens on #search-toggle click or Cmd+K / Ctrl+K.
 * Uses Pagefind's JS API against the index written to dist/pagefind/.
 * In dev mode (no index yet), the modal opens but shows a loading state.
 */

const MODAL_ID = "search-modal";
const INPUT_ID = "search-input";
const RESULTS_ID = "search-results";
const BACKDROP_ID = "search-backdrop";
const CLOSE_BTN_ID = "search-close-btn";

let pagefind = null;
let pagefindLoading = false;
let pagefindFailed = false;

async function loadPagefind() {
  if (pagefind) return true;
  if (pagefindFailed) return false;
  if (pagefindLoading) {
    let tries = 0;
    while (pagefindLoading && tries < 50) {
      await new Promise((r) => setTimeout(r, 100));
      tries++;
    }
    return !!pagefind;
  }
  pagefindLoading = true;
  try {
    // Use a variable so the bundler cannot statically resolve this path
    const pagefindPath = "/pagefind/pagefind.js";
    pagefind = await import(/* @vite-ignore */ pagefindPath);
    return true;
  } catch {
    pagefindFailed = true;
    return false;
  } finally {
    pagefindLoading = false;
  }
}

/* ---- DOM helpers ---- */

function el(id) {
  return document.getElementById(id);
}

function isOpen() {
  return el(MODAL_ID)?.classList.contains("show");
}

function openModal() {
  const modal = el(MODAL_ID);
  if (!modal) return;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  const input = el(INPUT_ID);
  if (input) {
    input.value = "";
    setTimeout(() => input.focus(), 50);
  }
  // Reset results
  const results = el(RESULTS_ID);
  if (results) results.innerHTML = "";
}

function closeModal() {
  const modal = el(MODAL_ID);
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

/* ---- i18n for dynamic messages ---- */

function isZh() {
  return document.documentElement.lang?.startsWith("zh");
}

function t(key) {
  const map = {
    results: isZh() ? "条结果" : "results",
    loading: isZh() ? "正在加载搜索索引..." : "Loading search index...",
    noIndex: isZh() ? "搜索索引不可用（开发模式）。请先运行 npm run build。" : "Search index unavailable (dev mode). Please run npm run build.",
    typeToSearch: isZh() ? "输入关键词开始搜索..." : "Type to search...",
  };
  return map[key] || key;
}

/* ---- Search ---- */

let debounceTimer = null;

async function doSearch(query) {
  const resultsEl = el(RESULTS_ID);
  if (!resultsEl) return;

  if (!query || query.trim().length < 1) {
    resultsEl.innerHTML = `<p class="search-hint">${t("typeToSearch")}</p>`;
    return;
  }

  const available = await loadPagefind();
  if (!available) {
    resultsEl.innerHTML = `<p class="search-hint">${t("noIndex")}</p>`;
    return;
  }

  try {
    const search = await pagefind.search(query.trim());
    if (!search || !search.results || search.results.length === 0) {
      // No results fallback text comes from data attr set in Astro
      const noResultsText =
        resultsEl.dataset.noResults || (isZh() ? "未找到结果。" : "No results found.");
      resultsEl.innerHTML = `<p class="search-hint">${noResultsText}</p>`;
      return;
    }

    const countText = `${search.results.length} ${t("results")}`;
    let html = `<p class="search-count">${countText}</p><ul class="search-list">`;

    for (const result of search.results.slice(0, 20)) {
      const data = await result.data();
      // Determine language from URL — results from /en/ vs /zh/
      const langPrefix = data.url.startsWith("/zh/") ? "zh" : "en";
      const langLabel = langPrefix === "zh" ? "中文" : "EN";
      html += `
        <li class="search-result-item">
          <a href="${data.url}" class="search-result-link">
            <span class="search-result-title">${data.meta?.title || data.url}</span>
            <span class="search-result-lang">${langLabel}</span>
          </a>
          <p class="search-result-excerpt">${data.excerpt || ""}</p>
        </li>`;
    }
    html += "</ul>";
    resultsEl.innerHTML = html;
  } catch (err) {
    console.error("Pagefind search error:", err);
    resultsEl.innerHTML = `<p class="search-hint">${isZh() ? "搜索出错，请重试。" : "Search error, please try again."}</p>`;
  }
}

function onInput(e) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
}

/* ---- Event bindings ---- */

function bind() {
  // Open: search button click
  el("search-toggle")?.addEventListener("click", () => {
    if (isOpen()) closeModal();
    else openModal();
  });

  // Open: Cmd+K / Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (isOpen()) closeModal();
      else openModal();
    }
    // Close: Escape
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      closeModal();
    }
  });

  // Close: backdrop click
  el(BACKDROP_ID)?.addEventListener("click", () => closeModal());

  // Close: close button click
  el(CLOSE_BTN_ID)?.addEventListener("click", () => closeModal());

  // Input
  el(INPUT_ID)?.addEventListener("input", onInput);

  // Eager-load Pagefind on open (warm cache)
  el("search-toggle")?.addEventListener("click", loadPagefind, { once: true });
  document.addEventListener("keydown", function preload(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      loadPagefind();
      document.removeEventListener("keydown", preload);
    }
  });
}

// Run after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bind);
} else {
  bind();
}
