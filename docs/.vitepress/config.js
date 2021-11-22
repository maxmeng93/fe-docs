module.exports = {
  base: '/fe-docs/',
  lang: 'zh-CN',
  title: '前端小册',
  description: '前端小册',
  markdown: {
    lineNumbers: false,
  },
  themeConfig: {
    repo: 'maxmeng93/fe-docs',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: '帮助改善此页面',
    lastUpdated: '最后更新时间',
    nav: [
      {
        text: '文章列表',
        link: '/article/babel/ast',
        activeMatch: '^/article/'
      },
    ],
    sidebar: {
      '/article/': [
        {
          text: 'Babel',
          children: [
            { text: 'Babel系列包介绍和最小化配置', link: '/article/babel/use' },
            { text: '抽象语法树AST和Bable原理', link: '/article/babel/ast' },
            { text: '学习写一个简单的Babel插件', link: '/article/babel/create_plugin' },
          ]
        },
        {
          text: 'Vue',
          children: [
            { text: '响应式原理', link: '/article/vue/reactive' }
          ]
        },
        // {
        //   text: 'React',
        //   children: [
        //     { text: 'react', link: '/article/react/' }
        //   ]
        // },
        {
          text: '手写代码',
          children: [
            { text: 'throttle - 节流', link: '/article/code/throttle' },
            { text: 'debounce - 防抖', link: '/article/code/debounce' },
          ]
        }
      ],
    }
  }
}