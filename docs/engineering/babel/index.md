---
title: babel7 小抄
---

## What is Babel?

`Babel` 是一个工具链，主要用于将采用 `ECMAScript` 2015+ 语法编写的代码转换为向后兼容的 `JavaScript` 语法，以便能够运行在当前和旧版本的浏览器或其他环境中，`Babel` 可以做下面几件事：

- 语法转换（`es-higher` => `es-lower`）
- 通过 `Polyfill` 处理在目标环境无法转换的特性（通过 `core-js` 实现）
- 源码转换（`codemods`、`jscodeshift`）
- 静态分析（`lint`、根据注释生成 `API` 文档等）

我们配置 `presets`（预设，一组插件）和 `plugins`（插件）来告诉 `Babel` 要做什么，当多个插件或预设处理同一个代码块时，会根据配置中的顺序执行。规则如下：

- 插件比预设先运行
- 插件从前往后执行
- 预设从后往前执行

## @babel/cli

`Babel` 附带的命令行工具，可以从命令行执行编译文件

## @babel/core

是我们使用 Bable 进行转码的核心 npm 包，我们使用的 babel-cli、babel-node 都依赖这个包，因此我们在前端开发的时候，都需要安装这个包。

## @babel/polyfill

babel 默认只转换语法，而不转换 API，对于 Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法(比如 Object.assign)都不会转码。因此需要 `Polyfill` 来为这些新特性提供支持。

从 Babel 7.4.0 开始，这个包已经被弃用。可以直接引入 `core-js/stable` `regenerator-runtime/runtime` 这两个包来实现相同的功能。

还可以通过 `@babel/preset-env` 和 `useBuiltIns: usage` 参数，来实现 Polyfill 自动引入。

## @babel/runtime

Babel 转译后的代码要实现源代码同样的功能需要借助一些帮助函数，这些帮助函数可能重复出现在一些模块中，导致编译后文件体积变大，为了解决这个问题，提供了单独的包 `@babel/runtime` 供编译模块复用工具函数。

启用插件 `@babel/plugin-transform-runtime` 后，`Babel` 就会使用 `@babel/runtime` 下的工具函数。

## @babel/plugin-transform-runtime

是对 Babel 编译过程中产生的 helper 方法进行重新利用(聚合)，以达到减少打包体积的目的。此外还有个作用是为了避免全局补丁污染，对打包过的 bundler 提供"沙箱"式的补丁。

## @babel/preset-env

这是一个智能预设，依赖 `browserslist`, `compat-table`（这个库维护着每个特性在不同环境的支持情况）, `electron-to-chromium` 实现了特性的精细按需引入。

支持的主要参数有：`target`、`useBuiltIns`、`corejs` 等：

### target

项目支持的目标环境，建议使用 browserslist 代替此参数来指定环境。

### useBuiltIns

此选项配置如何处理 `polyfill`。可选值有:

- `false` 不做 polyfill
- `entry` 考虑目标环境缺失的 API 模块, 引入相关的 API 补齐模块(polyfill)
- `usage` 除了会考虑目标环境缺失的 API 模块，同时考虑我们项目代码里使用到的 ES6 特性。只有我们使用到的 ES6 特性 API 在目标环境缺失的时候，Babel 才会引入 core-js 的 API 补齐模块。usage 不需要我们在入口文件（以及 webpack 的 entry 入口项）引入 polyfill，Babel 发现 useBuiltIns 的值是"usage"后，会自动进行 polyfill 的引入源代码。

### corejs

此配置可以是任何受支持的 `core-js` 版本。此配置只有在与 `useBuiltIns: usage` 或 `useBuiltIns: entry` 一起使用时才有效，可以确保 `@babel/preset-env` 注入你指定版本的 `core-js`。

建议指定次要版本，否则 `3` 将被解释为 `3.0` 可能不包含最新的 polyfill。

## @babel 系列包

`Babel` 是一个 `monorepo` 项目，`packages` 下面有一百多个包。

@babel/plugin-xx，满足这种标记的包都是 Babel 插件。主要用来加强 transform，parser 能力。plugins 主要有三种类型：

1. babel-plugin-transform-xx：转换插件，主要用来加强转换能力。
2. babel-plugin-syntax-xx：主要是扩展编译能力。
3. babel-plugin-proposal-xx：用来编译和转换在提案中的属性。

## 最小化配置

创建一个项目，并安装依赖：

```bash
# 新建一个文件夹
mkdir babel-demo & cd babel-demo

# 生成 package.json 文件
yarn init -y

# 安装依赖
yarn add -D @babel/cli @babel/core @babel/plugin-transform-runtime @babel/preset-env
```

新建 `babel.config.json` 文件夹，将下面的配置复制进去：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

修改 `package.json` 文件

```diff
{
  "name": "babel-demo",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
+   "build": "npx babel ./index.js --out-file build.js"
  },
  "devDependencies": {
    "@babel/cli": "^7.15.7",
    "@babel/core": "^7.15.8",
    "@babel/plugin-transform-runtime": "^7.15.8",
    "@babel/preset-env": "^7.15.8"
  },
+ "browserslist": [
+   "> 1%",
+   "last 2 versions",
+   "not dead"
+ ],
  "dependencies": {}
}
```

最小化配置的示例 demo 完整代码，可以点击[这里](https://github.com/maxmeng93/babel-demo/tree/esnext)查看。

## 参考资料

- Babel 中文官网：https://www.babeljs.cn/docs/
- Babel Plugins List：https://www.babeljs.cn/docs/plugins-list
- 不可多得的 Babel 小抄：https://mp.weixin.qq.com/s/lVd-kXDUH7kSwkYQEvQO4Q
