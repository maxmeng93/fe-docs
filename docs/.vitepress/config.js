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
    editLinkText: '为本文纠错',
    lastUpdated: '上次更新',
    nav: [
      {
        text: '文章列表',
        link: '/article/babel/ast',
        activeMatch: '^/article/'
      },
      {
        text: 'leetcode',
        link: '/leetcode/1.two-sum',
        activeMatch: '^/leetcode/'
      }
    ],
    sidebar: {
      '/article/': [
        {
          text: 'Babel',
          collapsable: true,
          children: [
            { text: 'Babel系列包介绍和最小化配置', link: '/article/babel/use' },
            { text: '抽象语法树AST和Bable原理', link: '/article/babel/ast' },
            { text: '学习写一个简单的Babel插件', link: '/article/babel/create_plugin' },
          ]
        },
        {
          text: 'Vue',
          collapsable: true,
          children: [
            // { text: '组件渲染', link: '/article/vue/render' },
            // { text: '组件更新', link: '/article/vue/update' },
            { text: '生命周期', link: '/article/vue/lifecycle' },
            { text: '响应式原理', link: '/article/vue/reactive' },
          ]
        },
        // {
        //   text: 'React',
        //   collapsable: true,
        //   children: [
        //     { text: 'react', link: '/article/react/' }
        //   ]
        // },
        {
          text: '手写代码',
          collapsable: true,
          children: [
            { text: 'throttle - 节流', link: '/article/code/throttle' },
            { text: 'debounce - 防抖', link: '/article/code/debounce' },
            { text: 'curry - 柯里化', link: '/article/code/curry' },
            { text: 'Promise 封装 Worker', link: '/article/code/worker' },
          ]
        },
        {
          text: '设计模式',
          collapsable: true,
          children: [
            { text: '设计模式', link: '/article/design-pattern/' },
            { text: '发布订阅模式', link: '/article/design-pattern/pub-sub' },
            // { text: '工厂模式', link: '/article/design-pattern/factory' },
            { text: '单例模式', link: '/article/design-pattern/singleton' },
            { text: '策略模式', link: '/article/design-pattern/strategy' },
            { text: '观察者模式', link: '/article/design-pattern/observer' },
            // { text: '访问者模式', link: '/article/design-pattern/visitor' },
            { text: '代理模式', link: '/article/design-pattern/proxy' },
            // { text: '装饰者模式', link: '/article/design-pattern/decorator' },
          ]
        },
        {
          text: '网络',
          collapsable: true,
          children: [
            { text: 'HTTP 缓存', link: '/article/net/http-cache' }
          ]
        },
        {
          text: '其他',
          collapsable: true,
          children: [
            { text: 'EventLoop', link: '/article/other/eventloop' }
          ]
        }
      ],
      '/leetcode': [
        {
          text: '数组',
          children: [
            {
              text: '1.两数之和',
              link: '/leetcode/1.two-sum'
            },
            {
              text: '88.合并两个有序数组',
              link: '/leetcode/88.merge-sorted-array'
            },
            {
              text: '283.移动零',
              link: '/leetcode/283.move-zeroes'
            },
            {
              text: '448.找到所有数组中消失的数字',
              link: '/leetcode/448.find-all-numbers-disappeared-in-an-array'
            }
          ],
        },
        {
          text: '链表',
          children: [
            {
              text: '21.合并两个有序链表',
              link: '/leetcode/21.merge-two-sorted-lists'
            },
            {
              text: '83.删除链表中的重复元素',
              link: '/leetcode/83'
            },
            {
              text: '141.环形链表',
              link: '/leetcode/141'
            },
            {
              text: '142.环形链表 II',
              link: '/leetcode/142'
            }
          ]
        },
        {
          text: '动态规划',
          children: [
            {
              text: '70.爬楼梯', link: '/leetcode/70.climbing-stairs'
            }
          ]
        },

      ],
    }
  }
}