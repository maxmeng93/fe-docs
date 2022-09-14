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
        link: '/leetcode/1',
        activeMatch: '^/leetcode/'
      },
      {
        text: 'three.js',
        link: '/threejs/camera',
        activeMatch: '^/threejs/'
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
            { text: 'Promise', link: '/article/code/promise' },
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
            { text: '1.两数之和', link: '/leetcode/1' },
            { text: '88.合并两个有序数组', link: '/leetcode/88' },
            { text: '283.移动零', link: '/leetcode/283' },
            { text: '448.找到所有数组中消失的数字', link: '/leetcode/448' },
            { text: '704.二分查找', link: '/leetcode/704' },
          ],
        },
        {
          text: '链表',
          children: [
            { text: '21.合并两个有序链表', link: '/leetcode/21' },
            { text: '83.删除链表中的重复元素', link: '/leetcode/83' },
            { text: '141.环形链表', link: '/leetcode/141' },
            { text: '142.环形链表 II', link: '/leetcode/142' },
            { text: '160.相交链表', link: '/leetcode/160' },
            { text: '206.反转链表', link: '/leetcode/206' },
            { text: '234.回文链表', link: '/leetcode/234' },
            { text: '876.链表的中间结点', link: '/leetcode/876' },
          ]
        },
        {
          text: '树',
          children: [
            { text: '94.二叉树的中序遍历', link: '/leetcode/94' },
            { text: '101.对称二叉树', link: '/leetcode/101' },
            { text: '104.二叉树的最大深度', link: '/leetcode/104' },
            { text: '144.二叉树的前序遍历', link: '/leetcode/144' },
            { text: '145.二叉树的后序遍历', link: '/leetcode/145' },
            { text: '226.翻转二叉树', link: '/leetcode/226' },
          ],
        },
        {
          text: '动态规划',
          children: [
            { text: '70.爬楼梯', link: '/leetcode/70' },
          ]
        },
        {
          text: '排序',
          children: [
            { text: '912.排序数组', link: '/leetcode/912' }
          ]
        },
      ],
      '/threejs': [
        { text: 'Camera', link: '/threejs/camera' },
      ]
    }
  }
}