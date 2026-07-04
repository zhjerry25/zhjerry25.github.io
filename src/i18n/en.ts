import type { Translations } from "./types";

export const en = {
  site: {
    name: "Aether",
    description: "Personal knowledge base",
  },
  nav: {
    home: "Home",
    about: "About",
    recents: "Recents",
    notes: "Notes",
    tags: "Tags",
    resources: "Resources",
    toolbox: "Toolbox",
  },
  categories: {
    chem: "Chemistry",
    cs: "Computer Science",
    mathphy: "Math & Physics",
    others: "Others",
  },
  categoryMeta: {
    chem: {
      emoji: "🧪",
      desc: "Various chemistry content — notes, papers, and more.",
    },
    cs: {
      emoji: "💻",
      desc: "Computer science explorations.",
    },
    mathphy: {
      emoji: "📐",
      desc: "Mathematical methods and physics concepts.",
    },
    others: {
      emoji: "📝",
      desc: "Miscellaneous notes and thoughts.",
    },
    resources: {
      emoji: "📚",
      desc: "A collection of digital materials, references, and links.",
    },
    toolbox: {
      emoji: "🧰",
      desc: "Tool recommendations and utilities coming to the site.",
    },
  },
  home: {
    hero: "Aether-archive",
    tagline:
      "Aether-ar is the personal knowledge base of a high school student, covering chemistry, computer science, math & physics, and whatever else catches my interest ^_^ Notes, resources, and tools.",
    recentUpdates: "Recent Updates",
    noNotes: "No notes yet. Check back soon!",
    viewAll: "View all notes →",
    whatIsThis: "What is this?",
    whatIsThisP1:
      "This is a personal website I built in the summer of '26 to store my notes and resources — feel free to read and share. Navigate using the <strong>sidebar tabs (or the top-left button on mobile)</strong> to explore different sections.",
    whatIsThisP2:
      "This site is <strong>not</strong> fully AI-generated, and it's <strong>not</strong> built from a template.",
    techStack: "Tech Stack",
    techStackItems: [
      { name: "Framework", desc: "Astro / Tailwind CSS", url: "https://astro.build" },
      { name: "Comments", desc: "Giscus", url: "https://giscus.app" },
      { name: "Analytics", desc: "GoatCounter", url: "https://www.goatcounter.com" },
    ],
    githubStar:
      'If you like this, consider dropping a star on <a href="https://github.com/zhjerry25/zhjerry25.github.io" target="_blank" rel="noopener noreferrer">GitHub</a> — your support means the world to me ♪( ´▽｀)',
    contactTitle: "You can also find me here",
    contactItems: [
      { label: "My GitHub", url: "https://github.com/zhjerry25", note: "check out my other projects too" },
      { label: "My Bilibili", url: "https://space.bilibili.com/3546913020316468" },
      { label: "My QQ", url: "https://user.qzone.qq.com/2640514109" },
      { label: "My Zhihu", url: "https://www.zhihu.com/people/38-94-76-75" },
    ],
    contactSidebarNote:
      "Follow me on other platforms too! (when I get around to it)<br>You can also jump to them anytime via the icons at the <strong>bottom of the sidebar</strong>.",
    exploreByCategory: "Explore by Category",
  },
  about: {
    title: "About",
    license:
      "Unless otherwise noted, all content on this site is licensed under <strong>CC BY-SA 4.0</strong>. This means you are free to copy, distribute, display, and remix my work, as long as you give appropriate credit and share any derivative works under the same license.",
    actionsTitle: "You can",
    actions: [
      "Comment on any page using your GitHub account (emoji reactions too!)",
      "Send feedback or just say hi via my contact info",
      "Contribute useful resources or tools through my contact info",
    ],
    donationText:
      "If the content here has helped you, consider buying me a coffee ☕<br>The domain costs about $11/year — your support keeps the author up all night writing more ♪( ´▽｀)",
    donationImage: "Donation QR Code",
  },
  recents: {
    title: "Recents",
    description: "Latest notes across all categories.",
    empty: "No notes yet. Check back soon!",
  },
  notes: {
    title: "Notes",
    description: "All notes across every category.",
    empty: "No notes yet. Check back soon!",
  },
  tags: {
    title: "Tags",
    tagCount: (count: number) =>
      `${count} ${count === 1 ? "tag" : "tags"} across all notes.`,
    notesCount: (count: number, tag: string) =>
      `${count} ${count === 1 ? "note" : "notes"} tagged with `,
  },
  resources: {
    title: "Resources",
    description:
      "A collection of digital materials, references, and links.",
    wip1:
      "This page is a work in progress. Resources will be organized by topic soon.",
    wip2: "For now, check out the notes sections for content.",
  },
  toolbox: {
    title: "Toolbox",
    description: "Tool recommendations and utilities coming to the site.",
    wip: "This page is a work in progress. Tools and utilities will be listed here soon.",
  },
  footer: {
    copyright: "Copyright © 2026-present by Jerry is licensed under CC BY-SA 4.0",
    icp: "xxx备xxx号",
  },
  header: {
    toggleLanguage: "Switch to Chinese",
    breadcrumbHome: "Home",
  },
  seo: {
    homeDescription:
      "Aether-ar is the personal knowledge base of a high school student, covering chemistry, computer science, math & physics, and whatever else catches my interest ^_^ Notes, resources, and tools.",
    aboutDescription: "About me and this knowledge base.",
    recentsDescription: "All recent notes across all categories.",
    notesDescription: "Browse all notes organized by category and tags.",
    tagsDescription: "Browse all tags used across notes.",
    resourcesDescription:
      "A collection of digital materials, references, and links.",
    toolboxDescription: "Tool recommendations and utilities coming to the site.",
  },
  rss: {
    title: "Aehter-ar Notes",
    description: "Personal knowledge base",
  },
  search: {
    placeholder: "Search notes...",
    noResults: "No results found.",
    closeAriaLabel: "Close search",
  },
  viewCount: "views",
  comments: "Comments",
  guestbook: "Guestbook",
  notFound: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    goHome: "Go to Home",
  },
} as const satisfies Translations;
