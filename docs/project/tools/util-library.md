## 实现

工程上还是很全面的。采用了 tsc 做<code>类型检查</code>，ts 来做<code>代码编译</code>。当然使用 babel 来做代码编译也是可以的，babel 方案可见 h5-sdk

![project](/assets/project/4.png)

![project](/assets/project/5.png)

1. 构建。缩短构建时间。使用 webpack 来打包，ts-loader 进行代码编译，<code>transpileOnly: true</code>关闭打包构建时 ts-loader 的类型检查，然后使用<code>fork-ts-checker-webpack-plugin 插件</code>，fork-ts 插件会在单独的进程来做 ts 类型检查。缩短构建时间

```js
// build/webpack.config.js
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    libraryTarget: "umd",
    library: "utilsLibrary",
    libraryExport: "default",
    filename: "utils-library.js",
    path: path.resolve(__dirname, "../dist"),
  },
  // devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: [
          {
            loader: "ts-loader",
            options: {
              // 使用此选项，会关闭类型检查. 缩短使用 ts-loader 时的构建时间.
              transpileOnly: true,
              configFile: path.resolve(__dirname, "../tsconfig.json"),
              // 给.vue文件加上.ts后缀，方便ts-loader处理
              // appendTsSuffixTo: [/\.vue$/]
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(), new ForkTsCheckerWebpackPlugin()],
};
```

注意了。<code>libraryExport: 'default'</code>是必需的，因为 src/index.ts 中，是通过<code>export default</code>导出的

```js
import { Obj } from "../types";
const cache: Obj = {};

function importAll(r: __WebpackModuleApi.RequireContext): void {
  r.keys().forEach((key: string) => {
    if (key === "./index.ts") return;
    const fnName: string = key.split("/").pop() || "";
    const fnKey: string = fnName.split(".")[0];
    cache[fnKey] = r(key).default;
  });
}

importAll(require.context("./", true, /\.ts$/));

export default cache;
```

2. 拓展性强。在 index.ts 中，使用了 webpack 的[require.context](https://webpack.docschina.org/guides/dependency-management/#requirecontext)，最终导出的对象的<code>key 是 src 目录下的文件名，value 是文件对应的函数</code>。在添加新的函数时，只需创建新的文件，并在文件中导出函数即可。

## 总结

在开发进程中，经常在一个或者多项目开发时多次使用常用的函数，导致代码冗余，维护困难。希望封装公共函数库，统一维护常用的函数。我独立负责函数库的开发，并且发包。使用了 webpack+ts-loader 进行构建打包；采用一个.ts 文件对应一个函数的形式，最终在 src/index 抛出封装好的对象，key 为文件名，value 为文件对应的函数。函数库上线后，在 B 端和 H5 广泛使用，提高了开发效率。
