export interface Translations {
  site: {
    name: string;
    description: string;
  };
  nav: {
    home: string;
    about: string;
    recents: string;
    notes: string;
    tags: string;
    resources: string;
    toolbox: string;
  };
  categories: {
    chem: string;
    cs: string;
    mathphy: string;
    others: string;
  };
  categoryMeta: {
    chem: { emoji: string; desc: string };
    cs: { emoji: string; desc: string };
    mathphy: { emoji: string; desc: string };
    others: { emoji: string; desc: string };
    resources: { emoji: string; desc: string };
    toolbox: { emoji: string; desc: string };
  };
  home: {
    hero: string;
    tagline: string;
    recentUpdates: string;
    noNotes: string;
    viewAll: string;
    whatIsThis: string;
    whatIsThisP1: string;
    whatIsThisP2: string;
    techStack: string;
    techStackItems: { name: string; desc: string; url?: string }[];
    githubStar: string;
    contactTitle: string;
    contactItems: { label: string; url: string; note?: string }[];
    contactSidebarNote: string;
    exploreByCategory: string;
  };
  about: {
    title: string;
    license: string;
    actionsTitle: string;
    actions: string[];
    donationText: string;
    donationImage: string;
  };
  recents: {
    title: string;
    description: string;
    empty: string;
  };
  notes: {
    title: string;
    description: string;
    empty: string;
  };
  tags: {
    title: string;
    tagCount: (count: number) => string;
    notesCount: (count: number, tag: string) => string;
  };
  resources: {
    title: string;
    description: string;
    wip1: string;
    wip2: string;
  };
  toolbox: {
    title: string;
    description: string;
    wip: string;
  };
  footer: {
    copyright: string;
    icp: string;
  };
  header: {
    toggleLanguage: string;
    breadcrumbHome: string;
  };
  seo: {
    homeDescription: string;
    aboutDescription: string;
    recentsDescription: string;
    notesDescription: string;
    tagsDescription: string;
    resourcesDescription: string;
    toolboxDescription: string;
  };
  rss: {
    title: string;
    description: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    closeAriaLabel: string;
  };
  viewCount: string;
  comments: string;
  guestbook: string;
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
}
