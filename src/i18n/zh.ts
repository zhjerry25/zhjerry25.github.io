import type { Translations } from "./types";

export const zh = {
  site: {
    name: "Astrc",
    description: "个人知识库",
  },
  nav: {
    home: "首页",
    about: "关于",
    recents: "最近更新",
    notes: "笔记",
    tags: "标签",
    resources: "资源",
    toolbox: "工具箱",
  },
  categories: {
    chem: "化学",
    cs: "计算机",
    mathphy: "数理",
    others: "其他",
  },
  categoryMeta: {
    chem: {
      emoji: "🧪",
      desc: "化学原理、反应和实验笔记。",
    },
    cs: {
      emoji: "💻",
      desc: "算法、系统和软件工程笔记。",
    },
    mathphy: {
      emoji: "📐",
      desc: "数学方法和物理概念。",
    },
    others: {
      emoji: "📝",
      desc: "各种杂项笔记和想法。",
    },
    resources: {
      emoji: "📚",
      desc: "精选链接、参考资料和学习材料。",
    },
    toolbox: {
      emoji: "🧰",
      desc: "我常用的工具、实用程序和工作流。",
    },
  },
  home: {
    hero: "Astrc",
    tagline:
      "一个个人知识库，涵盖化学、计算机科学、数学、物理以及我正在学习的各种内容。笔记、资源和工具——松散整理，持续更新。",
    recentUpdates: "最近更新",
    noNotes: "暂无笔记，请稍后再来！",
    viewAll: "查看所有笔记 →",
    whatIsThis: "这是什么？",
    whatIsThisP1:
      "这是我的个人知识库——一个记录所学、整理资源、分享工具的地方。它不是一个精美的博客，而是一个不断生长和演变的笔记集合。",
    whatIsThisP2:
      "你会发现化学讲义与计算机科学速查表相伴，物理推导与工具评测相邻。所有内容通过标签关联，侧边栏导航可以帮助你找到方向。",
    exploreByCategory: "按分类浏览",
  },
  about: {
    title: "关于我",
    content: "关于我",
  },
  recents: {
    title: "最近更新",
    description: "所有分类的笔记。",
    empty: "暂无笔记，请稍后再来！",
  },
  notes: {
    title: "笔记",
    description: "所有分类的笔记。",
    empty: "暂无笔记，开始写吧！",
  },
  tags: {
    title: "标签",
    tagCount: (count: number) =>
      `所有笔记中共有 ${count} 个标签。`,
    notesCount: (count: number, _tag: string) =>
      `共有 ${count} 篇笔记带有此标签。`,
  },
  resources: {
    title: "资源",
    description: "我收集的精选链接、参考资料和学习材料。",
    wip1: "此页面正在建设中，资源将很快按主题整理。",
    wip2: "目前可以先查看笔记部分的内容。",
  },
  toolbox: {
    title: "工具箱",
    description: "我日常使用的工具、实用程序和工作流。",
    wip: "此页面正在建设中，工具和实用程序将很快列在这里。",
  },
  footer: {
    copyright:
      "Copyright © 2026-present by Jerry is licensed under CC BY-SA 4.0",
    icp: "xxx备xxx号",
  },
  header: {
    toggleLanguage: "切换到英文",
    breadcrumbHome: "首页",
  },
  seo: {
    homeDescription: "一个涵盖化学、计算机科学、数学和物理的个人知识库。笔记、资源和工具——松散整理，持续更新。",
    aboutDescription: "关于我和这个知识库。",
    recentsDescription: "所有分类的最近笔记。",
    notesDescription: "按分类和标签浏览所有笔记。",
    tagsDescription: "浏览笔记中使用的所有标签。",
    resourcesDescription: "精选链接、参考资料和学习材料。",
    toolboxDescription: "我日常使用的工具、实用程序和工作流。",
  },
  rss: {
    title: "Astrc 笔记",
    description: "个人知识库",
  },
  search: {
    placeholder: "搜索笔记...",
    noResults: "未找到结果。",
    closeAriaLabel: "关闭搜索",
  },
  viewCount: "次阅读",
  comments: "评论",
  guestbook: "留言板",
  notFound: {
    title: "页面未找到",
    message: "您要找的页面不存在。",
    goHome: "回到首页",
  },
} as const satisfies Translations;
