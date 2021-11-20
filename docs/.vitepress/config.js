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
        link: '/engineering/babel/ast.html',
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
          text: 'Babel',
          children: [
            { text: 'Babel系列包介绍和最小化配置', link: '/engineering/babel/' },
            { text: '抽象语法树AST和Bable原理', link: '/engineering/babel/ast' },
            { text: '学习写一个简单的Babel插件', link: '/engineering/babel/create_plugin' },
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