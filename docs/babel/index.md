Babel 摘要能加深对 Babel 理解，加深 Babel 工程化配置理解。工程化配置可参考工具：[H5-SDK](https://github.com/0zcl/h5-sdk)

- @babel/cli: Babel 附带了一个内置的命令行，可以用来从命令行编译文件
- @babel/core：将所有内容包装在转换 api 中的核心模块。如：transform、transformFile 接口
- [presets(预设)](https://babeljs.io/docs/en/presets): 抛出包含 babel 插件的数组。是一个可以共享的配置。
- @babel/preset-env: 智能预设，允许你使用最新的 JavaScript。无需关心语法转换的细节

### babel 插件

[babel 插件](https://babeljs.io/docs/en/plugins#docsNav)
[preset-env](https://babeljs.io/docs/en/babel-preset-env)

- We leverage these data sources to maintain mappings of which version of our supported target environments gained support of a JavaScript syntax or browser feature, as well as a mapping of those syntaxes and features to Babel transform plugins and core-js polyfills
- 该预设除了包含所有稳定的转码插件，还可以根据我们设定的目标环境进行针对性转码

## @babel/preset-env

重点要学习的参数项有<code>targets</code>、<code>useBuiltIns</code>、<code>modules</code>和<code>corejs</code>这四个，能掌握这几个参数项的真正含义，就已经超过绝大部分开发者了

- target: 设置了 target，就不使用<code>browserslist</code>配置。不设置 targets，那么就使用 browserslist 的配置。正常情况下，我们推荐使用 browserslist 的配置而很少单独配置@babel/preset-env 的 targets
- useBuiltIns："usage" | "entry" | false。默认取 false.
  - false: 没有配置该参数项或是取值为 false 的时候，不做 polyfill
  - "entry": 考虑目标环境缺失的 API 模块, 引入相关的 API 补齐模块(polyfill)
  - "usage": Babel 除了会考虑目标环境缺失的 API 模块，同时考虑我们项目代码里使用到的 ES6 特性。只有我们使用到的 ES6 特性 API 在目标环境缺失的时候，Babel 才会引入 core-js 的 API 补齐模块。usage 不需要我们在入口文件（以及 webpack 的 entry 入口项）引入 polyfill，Babel 发现 useBuiltIns 的值是"usage"后，会自动进行 polyfill 的引入
    源代码。注意：这里并没有引入 polyfill
    ```javascript
    //  import "core-js/stable";
    //  import "regenerator-runtime/runtime";
    const a = new Promise((reslove, reject) => {
      console.log("1111111");
    });
    ```
    打包后的代码
    ```javascript
    "use strict";
    require("core-js/modules/es.promise.js");
    //  import "core-js/stable";
    //  import "regenerator-runtime/runtime";
    const a = new Promise((reslove, reject) => {
      console.log("1111111");
    }); // fn()
    ```
- modules："amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false, defaults to "auto". 指定打包后的语法。 该参数项值是'auto'或不设置的时候，会发现我们转码前的代码里 import 都被转码成 require 了
- corejs: defaults to "2.0". 建议指定小版本。如"3.0", 而不是"3"。只有 useBuiltIns 设置为'usage'或'entry'时，才会生效。确保 <font color=#d0c387>@babel/preset-env</font> 注入 polyfills(core-js 库提供支持)

#### 'entry'与'usage'的区别

'entry'这种方式不会根据我们实际用到的 API 进行针对性引入 polyfill，而'usage'可以做到。另外，在使用的时候，'entry'需要我们在项目入口处手动引入 polyfill，而'usage'不需要

## 插件或预设 执行顺序

如果两个插件或预设都要处理同一个代码片段，那么会根据插件和预设的顺序来执行。规则如下：

- 插件比预设先执行
- 插件执行顺序是插件数组从前向后执行
- 预设执行顺序是预设数组从后向前执行

## @babel/polyfill

- [Babel includes a polyfill that includes a custom regenerator runtime and core-js](https://babeljs.io/docs/en/babel-polyfill)

```javascript
import "core-js/stable";
import "regenerator-runtime/runtime";
```

- 从 babel7.4 开始，官方不推荐再使用@babel/polyfill 了，因为@babel/polyfill 本身其实就是两个 npm 包的集合：core-js 与 regenerator-runtime.
- 官方推荐直接使用这两个 npm 包。虽然@babel/polyfill 还在进行版本升级，但其使用的 core-js 包为 2.x.x 版本，而 core-js 这个包本身已经发布到了 3.x.x 版本了，@babel/polyfill 以后也不会使用 3.x.x 版本的包了。新版本的 core-js 实现了许多新的功能，例如数组的 includes 方法

#### polyfill 有多种含义

可以是指 polyfill.js，也可以是 babel-polyfill，也可以是@babel/polyfill，也可以是 core-js 和 regenerator-runtime 等等。我们应该根据语境来理解其具体指代。总体来说，提到 polyfill 这个词，一般就是指我们开发过程需要对环境的缺失 API 特性提供支持

## browserslist

[browserslist](https://github.com/browserslist/browserslist)browserslist 配置用来指定代码最终要运行在哪些浏览器或 node.js 环境
Autoprefixer、postcss 等就可以根据我们的 browserslist，来自动判断是否要增加 CSS 前缀（例如'-webkit-'）。browserslist 在很多前端工具都使用到。如：

- Autoprefixer
- Babel
- postcss-preset-env
- eslint-plugin-compat
- stylelint-no-unsupported-browser-features
- postcss-normalize
- obsolete-webpack-plugin

除了写在 package.json 里，也可以单独写在工程目录下.browserslistrc 文件里

```javascript
 "browserslist": [
    "> 1%",
    "not ie <= 8"
  ]
```

上面的配置含义是，目标环境是<code>市场份额大于 1%的浏览器</code>并且<code>不考虑 IE8 及以下的 IE 浏览器</code>

既然@babel/preset-env 可以通过 browserslist 针对目标环境不支持的语法进行语法转换，那么<strong>是否也可以对目标环境不支持的特性 API 进行部分引用呢？</strong>这样我们就不用把完整的 polyfill 全部引入到最终的文件里，可以大大减少体积。

## @babel/runtime

辅助函数：@babel/preset-env 在做语法转换的时候，注入了这些函数声明，以便语法转换后使用

问题：如果每个文件里都使用了 class 类语法，那会导致每个转换后的文件上部都会注入这些相同的函数声明。这会导致我们用构建工具打包出来的包非常大。

解决：这些函数声明都放在一个 npm 包【@babel/runtime】里，需要使用的时候直接从这个包里引入到我们的文件里。这样即使上千个文件，也会从相同的包里引用这些函数。通过 webpack 这一类的构建工具打包的时候，我们只会把使用到的 npm 包里的函数引入一次，这样就做到了复用，减少了体积
![@babel/runtime](/assets/babel/babel-runtime.jpg)
\_classCallCheck, \_defineProperties 与 \_createClass 这个三个辅助函数就在图片所示的位置

## @babel/plugin-transform-runtime

问题：这么多辅助函数要一个个记住并手动引入，平常人是做不到的，我也做不到

解决：Babel 插件@babel/plugin-transform-runtime 就来帮我们解决这个问题。@babel/plugin-transform-runtime 有三大作用，其中之一就是自动移除语法转换后内联的辅助函数（inline Babel helpers），使用@babel/runtime/helpers 里的辅助函数来替代。这样就减少了我们手动引入的麻烦。
源文件：

```javascript
class Person {
  sayname() {
    return "name";
  }
}
var john = new Person();
console.log(john.sayname());
```

打包后：

```javascript
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _classCallCheck2 = _interopRequireDefault(
  require("@babel/runtime/helpers/classCallCheck")
);
var _createClass2 = _interopRequireDefault(
  require("@babel/runtime/helpers/createClass")
);

var Person = /*#__PURE__*/ (function () {
  function Person() {
    (0, _classCallCheck2.default)(this, Person);
  }

  (0, _createClass2.default)(Person, [
    {
      key: "sayname",
      value: function sayname() {
        return "name";
      },
    },
  ]);
  return Person;
})();

var john = new Person();
console.log(john.sayname());
```

问题：每个转换后的文件上部都会注入这些相同的函数声明，那为何不用 webpack 一类的打包工具去掉重复的函数声明，而是要单独再引一个辅助函数包？

答 ：webpack 在构建的时候，是基于模块来做去重工作的。每一个函数声明都是引用类型，在堆内存不同的空间存放，缺少唯一的地址来找到他们。所以 webpack 本身是做不到把每个文件的相同函数声明去重的。因此我们需要单独的辅助函数包，这样 webpack 打包的时候会基于模块来做去重工作

:::tip
[\_\_webpack_require\_\_](https://webpack.docschina.org/api/module-variables/#webpack_require-webpack-specific)
webpack 对于 ES 模块/CommonJS 模块的实现，是基于自己实现的 webpack_require，所以代码能跑在浏览器中。具体可看[webpack 加载原理](../buildTools/webpack/__webpack_require__.md)
:::
