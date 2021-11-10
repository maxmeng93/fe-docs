webpack3，打包后精简的代码。只参考。下面以 webpack5 打包的代码来讲解
![webpack_require](/assets/webpack/12.png)

## CommonJS 规范

webpack 打包 使用 cjs 规范的 js 文件

```js
// helloworld.js
function helloworld() {}

module.exports = helloworld;
```

```js
// utils.js
function utils() {}

module.exports = utils;
```

```js
// index.js
const helloworld = require("./helloworld");
const utils = require("./utils");

function test() {}

test();
helloworld();
utils();
```

打包后的文件(整理后)：

```js
(function () {
  // webpackBootstrap
  var __webpack_modules__ = {
    20: function (module) {
      function helloworld() {}
      module.exports = helloworld;
    },
    21: function (module) {
      function utils() {}
      module.exports = utils;
    },
  };
  // The module cache
  var __webpack_module_cache__ = {};
  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = (__webpack_module_cache__[moduleId] = {
      // no module.id needed
      // no module.loaded needed
      exports: {},
    });
    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    // Return the exports of the module
    return module.exports;
  }
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  !(function () {
    var helloworld = __webpack_require__(20);
    var utils = __webpack_require__(21);
    function test() {}
    test();
    helloworld();
    utils();
  })();
})();
```

### 源码解析

整理后的 bundle.js，是很简洁的，显然可以看出是一个 IIFE(立即执行函数), 接下来分析下

- \_\_webpack_modules\_\_: 定义 webpack_modules 对象，以 moduleId 为 key；value 为模块方法，参数为{exports: {}}
- \_\_webpack_module_cache\_\_: 模块缓存对象, 初始值为空对象，作用是缓存已经加载过的模块
- \_\_webpack_require\_\_: 模块加载函数，参数为 moduleId
  - 通过 \_\_webpack_module_cache\_\_，判断模块是否有缓存，如果有则返回缓存模块的 exports 对象，即 module.exports
  - 若模块无缓存，则通过 \_\_webpack_modules\_\_、moduleId，找到模块方法，并执行模块方法，给 module.exports 赋值
  ```js
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  ```
  - \_\_webpack_require\_\_ 返回已赋值的 module.exports

从上述代码可以看到，在执行模块函数时传入了三个参数，分别为 <code>module</code>、<code>module.exports</code>、<code>\_\_webpack_require**</code>
其中 module、module.exports 的作用和 CommonJS 中的 <code>module</code>、<code>module.exports</code> 的作用是一样的，而 <code>\_\_webpack_require**</code> 相当于 CommonJS 中的 <code>require</code>

目前为止可以发现 webpack 自定义的模块规范完美适配 CommonJS 规范

## ES6 module

将刚才用 CommonJS 规范编写的三个文件换成用 ES6 module 规范来写，再执行打包

```js
// index.js
import helloworld from "./helloworld";
import utils from "./utils";

function test() {}

test();
helloworld();
utils();
```

```js
(function () {
  // webpackBootstrap
  "use strict";
  var __webpack_modules__ = {
    20: function (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        default: function () {
          return /* binding */ helloworld;
        },
      });
      function helloworld() {}
    },

    21: function (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        default: function () {
          return /* binding */ utils;
        },
      });
      function utils() {}
    },
  };
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // 省略
  }

  /* webpack/runtime/define property getters */
  !(function () {
    // define getter functions for harmony exports
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();

  /* webpack/runtime/hasOwnProperty shorthand */
  !(function () {
    __webpack_require__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  })();

  /* webpack/runtime/make namespace object */
  !(function () {
    // define __esModule on exports
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();

  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  !(function () {
    __webpack_require__.r(__webpack_exports__);
    var _helloworld__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
    var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);

    function test() {}

    test();
    (0, _helloworld__WEBPACK_IMPORTED_MODULE_0__.default)();
    (0, _utils__WEBPACK_IMPORTED_MODULE_1__.default)();
  })();
})();
```

### 源码分析

上面是去除多余代码的 bundle.js，执行\_\_webpack_require**之前，执行了\_\_webpack_require**.r

```js
__webpack_require__.r(__webpack_exports__);
var _helloworld__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);
```

## **webpack_require**.r()

给 exports 对象，添加<code>\_\_esModule</code>、<code>Symbol.toStringTag</code>这两个属性

```js
__webpack_require__.r = function (exports) {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  }
  Object.defineProperty(exports, "__esModule", { value: true });
};
```

![esModule](/assets/webpack/13.png)

执行完\_\_webpack_require**.r(\_\_webpack_exports**)，给\_\_webpack_exports**添加属性后，则执行\_\_webpack_require**(20), \_\_webpack_require**与前面讲的是一样的，不赘述了。
\_\_webpack_require**中会执行 moduleId 对应的模块方法，以其中 moduleId=20 为例，分析下

```js
    20: (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
          "default": function() { return /* binding */ helloworld; }
        });
        function helloworld() {}
      })
```

- \_\_webpack_require**.r(\_\_webpack_exports**)：给\_\_webpack_exports**添加 Symbol.toStringTag、**esModule 属性

## **webpack_require**.o()

- \_\_webpack_require\_\_.o(): 判断 obj 是否有 prop 属性

```js
__webpack_require__.o = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
```

## **webpack_require**.d()

```js
__webpack_require__.d = function (exports, definition) {
  for (var key in definition) {
    if (
      __webpack_require__.o(definition, key) &&
      !__webpack_require__.o(exports, key)
    ) {
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: definition[key],
      });
    }
  }
};
```

- Object.defineProperty(obj, key, { enumerable: true, get: fn }): get 当访问该属性时，会调用此函数 fn
- \_\_webpack_require\_\_.d(): 传入两个参数, 如下，其中 helloworld 是导入模块（export default 方式导出）

```js
__webpack_exports__、
{
  "default": function() { return /* binding */ helloworld; }
}
```

- 给 module.exports 添加 default 属性，对应的 value 为 function() { return helloworld; }
  ![webpack_require.d](/assets/webpack/14.png)

## export default 本质

\_\_webpack_require\_\_.d()为什么要给 module.exports 添加 default 属性？ 这就要说下 export default 的本质

```js
//a.js
const str = "export default的内容";
export default str;
```

```js
//b.js
import StrFile from "a";
//导入的时候没有花括号
```

本质上，a.js 文件的 export default 输出一个叫做 default 的变量，然后系统允许你引入的时候为它取任意名字

目前为止可以发现 webpack 自定义的模块规范 也能完美适配 ES6 规范

## **webpack_require**.n()

回顾：**webpack_require**.r() 函数的作用是给 **webpack_exports** 添加一个 \_\_esModule 为 true 的属性，表示这是一个 ES6 module
添加这个属性有什么用呢? 主要是为了处理混合使用 ES6 module 和 CommonJS 的情况

utils.js 使用 cjs 规范导出，导入使用 ES6 规范 <code>import utils from './utils'</code>

```js
// utils.js
function utils() {
  console.log("utils");
}

module.exports = utils;
```

打包后，重点看下

```js
!(function () {
  __webpack_require__.n = function (module) {
    var getter =
      module && module.__esModule
        ? function () {
            return module["default"];
          }
        : function () {
            return module;
          };
    __webpack_require__.d(getter, { a: getter });
    return getter;
  };
})();
```

- 加载 utils.js 模块，并将该模块的导出对象作为参数传入 \_\_webpack_require\_\_.n() 函数。
- \_\_webpack_require\_\_.n 分析该 export 对象是否是 ES6 module，如果是则返回 module['default'] 即 export default 对应的变量。如果不是 ES6 module 则直接返回 export

## 按需加载

也叫异步加载、动态导入，即只在有需要的时候才去下载相应的资源文件

见[懒加载](./lazy-load.md)

参考：
[深入了解 webpack 模块加载原理](https://segmentfault.com/a/1190000024457777)
