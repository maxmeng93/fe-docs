module.exports = {
  base: '/fe-docs/',
  lang: 'zh-CN',
  title: '前端小册',
  description: '前端小册',
  markdown: {
    lineNumbers: false,
  },
  themeConfig: {
    repo: 'maxmeng93',
    displayAllHeaders: true,
    lastUpdated: 'Last Updated',
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '前端工程化',
        link: '/engineering/babel/',
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
          text: 'babel',
          children: [
            { text: 'babel7小抄', link: '/engineering/babel/' },
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