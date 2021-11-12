## What is Babel?

`Babel` 是一个工具链，主要用于将采用 `ECMAScript` 2015+ 语法编写的代码转换为向后兼容的 `JavaScript` 语法，以便能够运行在当前和旧版本的浏览器或其他环境中，`Babel` 可以做下面几件事：

- 语法转换（`es-higher` => `es-lower`）
- 通过 `Polyfill` 处理在目标环境无法转换的特性（通过 `core-js` 实现）
- 源码转换（`codemods`、`jscodeshift`）
- 静态分析（`lint`、根据注释生成 `API` 文档等）

Babel 最主要的配置是 `presets`（预设）和 `plugins`（插件），当多个插件或预设处理同一个代码块时，会根据配置中的顺序执行。规则如下：

- 插件比预设先运行
- 插件从前往后执行
- 预设从后往前执行

## @babel/cli

`Babel` 附带的命令行工具，可以从命令行执行编译文件

## @babel/core

`Babel` 核心模块。

## @babel/preset-env

这是一个智能预设，允许你使用最新的 `JavaScript`，并根据你设置的目标环境，执行代码转译。

支持的主要参数有：

### target

项目支持的目标环境，建议使用 browserslist 代替此参数来指定环境。

### useBuiltIns

此选项配置如何处理 polyfill。

### corejs

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
