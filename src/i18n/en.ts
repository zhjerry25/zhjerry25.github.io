import type { Translations } from "./types";

export const en = {
  site: {
    name: "Astrc",
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
      desc: "Notes on chemical principles, reactions, and lab work.",
    },
    cs: {
      emoji: "💻",
      desc: "Algorithms, systems, and software engineering notes.",
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
      desc: "Curated links, references, and learning materials.",
    },
    toolbox: {
      emoji: "🧰",
      desc: "Tools, utilities, and workflows I use.",
    },
  },
  home: {
    hero: "Home",
    tagline:
      "A personal knowledge base covering chemistry, computer science, mathematics, physics, and whatever else I'm learning. Notes, resources, and tools — loosely organized, constantly evolving.",
    recentUpdates: "Recent Updates",
    noNotes: "No notes yet. Check back soon!",
    viewAll: "View all notes →",
    whatIsThis: "What is this?",
    whatIsThisP1:
      "This is my personal knowledge garden — a place where I write down what I learn, organize resources I find useful, and share tools that make my workflow better. It's not a polished blog; it's a living collection of notes that grow and evolve over time.",
    whatIsThisP2:
      "You'll find chemistry lecture notes alongside computer science cheatsheets, physics derivations next to random tool reviews. Everything is connected by tags, and the sidebar navigation should help you find your way around.",
    exploreByCategory: "Explore by Category",
  },
  about: {
    title: "About Me",
    content: "About Me",
  },
  recents: {
    title: "Recents",
    description: "All notes across all categories.",
    empty: "No notes yet. Check back soon!",
  },
  notes: {
    title: "Notes",
    description: "All notes across every category.",
    empty: "No notes yet. Start writing!",
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
      "Curated links, references, and learning materials I've found useful.",
    wip1:
      "This page is a work in progress. Resources will be organized by topic soon.",
    wip2: "For now, check out the Notes sections for content.",
  },
  toolbox: {
    title: "Toolbox",
    description: "Tools, utilities, and workflows I use regularly.",
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
      "A personal knowledge base covering chemistry, computer science, mathematics, and physics. Notes, resources, and tools — loosely organized, constantly evolving.",
    aboutDescription: "About me and this knowledge base.",
    recentsDescription: "All recent notes across all categories.",
    notesDescription: "Browse all notes organized by category and tags.",
    tagsDescription: "Browse all tags used across notes.",
    resourcesDescription:
      "Curated links, references, and learning materials.",
    toolboxDescription: "Tools, utilities, and workflows I use regularly.",
  },
  rss: {
    title: "Astrc Notes",
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
