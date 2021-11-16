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
        text: '首页',
        link: '/'
      },
      {
        text: '前端工程化',
        link: '/engineering/ast/',
        activeMatch: '^/engineering/'
      },
      // {
      //   text: 'TypeScript',
      //   link: '/typescript/',
      //   activeMatch: '^/typescript/'
      // }
    ],
    sidebar: {
      '/engineering/': [
        {
          text: 'AST',
          link: '/engineering/ast/'
        },
        {
          text: 'babel',
          children: [
            { text: 'babel7小抄', link: '/engineering/babel/' },
            { text: '写一个 Babel 插件', link: '/engineering/babel/create_plugin' },
          ]
        },
        // {
        //   text: 'webpack',
        //   children: [
        //     { text: 'webpack', link: '/engineering/webpack/' }
        //   ]
        // },
        // {
        //   text: 'eslint',
        //   link: '/engineering/eslint/'
        // },
        // {
        //   text: 'vite',
        //   link: '/engineering/vite/'
        // }
      ],
      // '/typescript/': [],
    }
  }
}