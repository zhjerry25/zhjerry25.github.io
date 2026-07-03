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
      desc: "各种化学内容，包括但不限于学科笔记和论文分享",
    },
    cs: {
      emoji: "💻",
      desc: "业余计算机的学习",
    },
    mathphy: {
      emoji: "📐",
      desc: "数学方法和物理概念",
    },
    others: {
      emoji: "📝",
      desc: "各种杂项笔记和想法",
    },
    resources: {
      emoji: "📚",
      desc: "存放收集的电子材料、参考资料和链接",
    },
    toolbox: {
      emoji: "🧰",
      desc: "工具分享和网站未来内嵌的工具",
    },
  },
  home: {
    hero: "Astrc",
    tagline:
      "本站名为Astrc，是一个高中生的个人知识库，主要更新化学、计算机、数理和其它我感兴趣的领域的内容 ^_^ 整理笔记、资源和工具，欢迎关注",
    recentUpdates: "最近更新",
    noNotes: "暂无笔记，请稍后再来！",
    viewAll: "查看所有笔记 →",
    whatIsThis: "这是什么？",
    whatIsThisP1:
      "这是我在26年夏建立的一个个人网页，存储我的笔记和资源，欢迎阅读和转载。你可以点击<strong>侧边标签页 (或移动端左上方按钮)</strong> 切换栏目",
    whatIsThisP2:
      "本网站<strong>不是</strong>人工智能包揽生成，也<strong>没有</strong>使用模板",
    techStack: "技术栈",
    techStackItems: [
      { name: "框架", desc: "Astro / Tailwind CSS", url: "https://astro.build" },
      { name: "评论", desc: "Giscus", url: "https://giscus.app" },
      { name: "统计", desc: "GoatCounter", url: "https://www.goatcounter.com" },
    ],
    githubStar:
      '如果觉得不错，欢迎在 <a href="https://github.com/zhjerry25/zhjerry25.github.io" target="_blank" rel="noopener noreferrer">Github</a> 支持，你的一个star是对我莫大的鼓励 ♪( ´▽｀)',
    contactTitle: "除此之外，以下是我的一些联系方式",
    contactItems: [
      { label: "我的Github主页", url: "https://github.com/zhjerry25", note: "欢迎关注我的其它项目" },
      { label: "我的Bilibili主页", url: "https://space.bilibili.com/3546913020316468" },
      { label: "我的QQ账号", url: "https://user.qzone.qq.com/2640514109" },
      { label: "我的知乎首页", url: "https://www.zhihu.com/people/38-94-76-75" },
    ],
    contactSidebarNote:
      "欢迎支持我在其它平台的内容！（如果有的话）<br>你也可以随时通过访问网页<strong>侧栏下方</strong>的图标跳转",
    exploreByCategory: "按分类浏览",
  },
  about: {
    title: "关于",
    license:
      "除额外说明外，本网站遵循<strong>CC BY-SA 4.0协议</strong>，这意味着你可以自由复制、分发、展示和演绎我的作品，只要你给予适当的署名，并在相同的许可证下分享衍生作品",
    actionsTitle: "你可以",
    actions: [
      "使用Github账号对本网站页面进行评论，还可以发表情",
      "通过我的联系方式，对本网站提出意见/交个朋友",
      "通过我的联系方式，为本网站贡献有意义的资源/工具",
    ],
    donationText:
      "如果这个网站的内容对你有帮助，欢迎请我喝杯咖啡 ☕<br>域名每年大约 $11，你的支持会让作者连夜更新 ♪( ´▽｀)",
    donationImage: "赞赏码",
  },
  recents: {
    title: "最近更新",
    description: "所有分类中最近的笔记",
    empty: "暂无笔记，请稍后再来！",
  },
  notes: {
    title: "笔记",
    description: "所有分类的笔记",
    empty: "暂无笔记，请稍后再来！",
  },
  tags: {
    title: "标签",
    tagCount: (count: number) =>
      `所有笔记中共有 ${count} 个标签`,
    notesCount: (count: number, _tag: string) =>
      `共有 ${count} 篇笔记带有此标签`,
  },
  resources: {
    title: "资源",
    description: "存放收集的电子材料、参考资料和链接",
    wip1: "此页面正在建设中，资源将很快按主题整理",
    wip2: "目前可以先查看笔记部分的内容",
  },
  toolbox: {
    title: "工具箱",
    description: "工具分享和网站未来内嵌的工具",
    wip: "此页面正在建设中，工具和实用程序未来会列在这里",
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
    homeDescription: "本站名为Astrc，是一个高中生的个人知识库，主要更新化学、计算机、数理和其它我感兴趣的领域的内容 ^_^ 整理笔记、资源和工具，欢迎关注",
    aboutDescription: "关于我和这个知识库",
    recentsDescription: "所有分类的最近笔记",
    notesDescription: "按分类和标签浏览所有笔记",
    tagsDescription: "浏览笔记中使用的所有标签",
    resourcesDescription: "存放收集的电子材料、参考资料和链接",
    toolboxDescription: "工具分享和网站未来内嵌的工具",
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
