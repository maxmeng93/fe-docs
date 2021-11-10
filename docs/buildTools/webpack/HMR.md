webpack、webpack-cli、webpack-dev-server、webpack-dev-middleware 版本如下：

```js
"webpack": "5.11.1",
"webpack-cli": "4.3.1",
"webpack-dev-server": "3.11.1"
"webpack-dev-middleware": "3.7.2"
```

## websocket

有了 HTTP 协议，为什么还需要<code>WebSocket</code>?

答：HTTP 协议有一个缺陷：通信只能由客户端发起

WebSoket 特点：服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息

```js
var ws = new WebSocket("wss://echo.websocket.org");
// 实例对象的onopen属性，用于指定连接成功后的回调函数
ws.onopen = function (evt) {
  console.log("Connection open ...");
  ws.send("Hello WebSockets!");
};
// 实例对象的onmessage属性，用于指定收到服务器数据后的回调函数
ws.onmessage = function (evt) {
  console.log("Received Message: " + evt.data);
  ws.close();
};
// 实例对象的onclose属性，用于指定连接关闭后的回调函数
ws.onclose = function (evt) {
  console.log("Connection closed.");
};
// 输出：
// "Connection open ..."
// "Received Message: Hello WebSockets!"
// "Connection closed."
```

![socket](/assets/webpack/27.png)

## 热更新实现

HMR 作为一个 Webpack 内置的功能，可以通过 HotModuleReplacementPlugin 或--hot 开启

```js
devServer: {
  // ...
  hot: true,
  // ...
}
```

项目启动后，进行构建打包，控制台会输出构建过程，我们可以观察到生成了一个 Hash 值：<code>a93fd735d02d98633356</code>

![hash](/assets/webpack/28.png)

在我们每次修改代码保存后，控制台都会出现 Compiling…字样，触发新的编译中...可以在控制台中观察到：

- 新的 Hash 值：a61bdd6e82294ed06fa3
- 新的 json 文件： a93fd735d02d98633356.hot-update.json
- 新的 js 文件：index.a93fd735d02d98633356.hot-update.js

![hash](/assets/webpack/29.png)

结论：上次输出的<code>Hash</code>会作为本次编译新生成的文件标识，本次输出的<code>Hash</code>会作为下次热更新的标识

```js
openPhotoAlbum() {
  this.appSDK.openPhotoAlbum(true, res => {
    console.log('res', res) //
  })
}
// 更改后
openPhotoAlbum() {
  this.appSDK.openPhotoAlbum(true, res => {
    console.log('res2', res) //
  })
}
```

更改 Vue 文件 openPhotoAlbum 方法的打印语句，保存文件后，从 webpack 服务的打印可知，此时 HMR 热更新产生了两个新文件<code>main.1925dbfa6ec6ac69aef2.hot-update.js</code>、<code>main.1925dbfa6ec6ac69aef2.hot-update.json</code>

```python
asset main.1925dbfa6ec6ac69aef2.hot-update.js 12.5 KiB [emitted] [immutable] [hmr] (name: main)
asset index.html 771 bytes [emitted]
asset main.1925dbfa6ec6ac69aef2.hot-update.json 28 bytes [emitted] [immutable] [hmr]
```

接下来看看浏览器怎么处理热更新的

1. 浏览器的<code>WebSocket</code>服务，接收到本次热更新产生的 Hash <code>3ba7245632a597574ef3</code>
   ![hash](/assets/webpack/30.png)
2. 浏览器判断本次接收的 Hash，如果与上次相同，则代表本次编译没修改文件；如果与上次 Hash 不同，则请求.json 和.js 文件
   ![json](/assets/webpack/31.png)

- c 表示当前要热更新的文件对应的是 main 模块
- js 文件：是本次修改的代码。格式化并删除部分代码后显示如下，js 是要更新的模块, 也使用了<code>JSONP</code>原理

```js
// main.1925dbfa6ec6ac69aef2.hot-update.js
self["webpackHotUpdate_i61_h5_sdk"]("main", {
  "./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./example/src/API.vue?vue&type=script&lang=js&":
    function (module, exports, __webpack_require__) {
      "use strict";

      var _Object$defineProperty = __webpack_require__(
        /*! @babel/runtime-corejs3/core-js-stable/object/define-property */ "./node_modules/@babel/runtime-corejs3/core-js-stable/object/define-property.js"
      );

      _Object$defineProperty(exports, "__esModule", {
        value: true,
      });

      exports.default = void 0;

      var _default = {
        data: function data() {
          return {};
        },
        computed: {},
        methods: {
          openPhotoAlbum: function openPhotoAlbum() {
            this.appSDK.openPhotoAlbum(true, function (res) {
              console.log("res2", res);
            });
          },
        },
      };
      exports.default = _default;
    },
});
```

## 源码解析

- 浏览器是如何知道本地代码重新编译了，并迅速请求了新生成的文件？
  答：derServer 会通过 compiler 的 done 钩子来监听 webpack 的编译结束，只要编译结束就触发钩子，通过 websocket 给浏览器发送通知。浏览器拿到本次编译产生的 Hash，如果与上次相同，则代表本次编译没修改文件；如果与上次 Hash 不同，则请求.json 和.js 文件
- 是谁告知了浏览器？
  答：编译结束后，本地的 WebSocket 服务给浏览器发通知，ok 和 hash 事件，浏览器就可以拿到本次编译产生的 Hash

带着疑问来看源码吧

## 一、webpack-dev-server 启动本地服务

webpack-dev-server 的 package.json 中的 bin 命令，可以找到命令的入口文件 bin/webpack-dev-server.js

```js
// node_modules/webpack-dev-server/bin/webpack-dev-server.js
// 生成webpack编译主引擎 compiler
let compiler = webpack(config);
// 启动本地服务
let server = new Server(compiler, options, log);
server.listen(options.port, options.host, (err) => {
  if (err) {
    throw err;
  }
});
```

看看 new Server 做了啥

```js
// node_modules/webpack-dev-server/lib/Server.js
class Server {
    constructor() {
        this.setupApp();
        this.createServer();
    }
    setupApp() {
        // 依赖了express
    	this.app = new express();
    }
    createServer() {
        this.listeningApp = http.createServer(this.app);
    }
    listen(port, hostname, fn) {
        return this.listeningApp.listen(port, hostname, (err) => {
            // 启动express服务后，启动websocket服务
            this.createSocketServer();
        }
    }
}
```

1. 启动 webpack, 生成 compiler 实例。compiler 上有很多方法，比如可以启动 webpack 所有编译工作，以及监听本地文件的变化。
2. 使用 express 框架启动本地 server，让浏览器可以请求本地的静态资源。
3. 本地 server 启动之后，再去启动 websocket 服务。通过 websocket，可以建立本地服务和浏览器的双向通信。

## 二、修改 webpack.config.js 的 entry 配置

启动本地服务前，调用了<code>updateCompiler -> updateCompiler -> addEntries</code>，addEntries 中有 2 段关键性代码。一个是获取 websocket 客户端代码路径，另一个是根据配置获取 webpack 热更新代码路径。

```js
// node_modules/webpack-dev-server/lib/Server.js
updateCompiler(this.compiler, this.options);

// node_modules/webpack-dev-server/utils/updateCompiler.js
addEntries(webpackConfig, options);

// node_modules/webpack-dev-server/lib/utils/addEntries.js
const clientEntry = `${require.resolve(
  "../../client/"
)}?${domain}${sockHost}${sockPath}${sockPort}`;

/** @type {(string[] | string)} */
let hotEntry;

if (options.hotOnly) {
  hotEntry = require.resolve("webpack/hot/only-dev-server");
} else if (options.hot) {
  hotEntry = require.resolve("webpack/hot/dev-server");
}
```

修改后的 webpack 入口配置如下：

```js
// 修改后的entry入口
{ entry:
    { index:
        [
            // 上面获取的clientEntry
            'xxx/node_modules/webpack-dev-server/client/index.js?http://localhost:8080',
            // 上面获取的hotEntry
            'xxx/node_modules/webpack/hot/dev-server.js',
            // 开发配置的入口
            './src/index.js'
    	],
    },
}
```

为什么要新增了 2 个文件？在入口默默增加了 2 个文件，那就意味会一同打包到 bundle 文件中去。

### webpack-dev-server/client/index.js

第 1 步 webpack-dev-server 初始化 的过程中，启动的是本地服务端的 websocket。那客户端也就是我们的浏览器, 因此需要把 websocket 客户端通信代码塞到 bundle 文件中

### webpack/hot/dev-server.js

要是用于检查更新逻辑的 ？？？ 见下面第五点

## 三、监听 webpack 编译结束

修改好入口配置后，又调用了 setupHooks 方法。这个方法是用来注册监听事件的，监听每次 webpack 编译完成。

```js
setupHooks() {
  const addHooks = (compiler) => {
    const { done } = compiler.hooks;
    // 监听webpack的done钩子，tapable提供的监听方法
    done.tap('webpack-dev-server', (stats) => {
      this._sendStats(this.sockets, this.getStats(stats));
      this._stats = stats;
    });
  };
}
```

当监听到一次 webpack 编译结束，就会调用\_sendStats 方法通过 websocket 给浏览器发送通知，ok 和 hash 事件，这样浏览器就可以拿到最新的 hash 值了，做检查更新逻辑。

```js
// 通过websoket给客户端发消息
_sendStats() {
    this.sockWrite(sockets, 'hash', stats.hash);
    this.sockWrite(sockets, 'ok');
}
```

## 四、webpack 监听文件变化

每次修改代码，就会触发编译。说明我们还需要监听本地代码的变化，主要是通过 setupDevMiddleware 方法实现的。

webpack-dev-middleware 和 webpack-dev-server 的区别

- webpack-dev-server: 只负责启动服务和前置准备工作
- webpack-dev-middleware: 所有文件相关的操作都抽离到 webpack-dev-middleware 库，主要是本地文件的编译、输出和监听
  接下来看看<code>webpack-dev-middleware</code>做了什么事:

```js
// node_modules/webpack-dev-middleware/index.js
compiler.watch(options.watchOptions, (err) => {
  if (err) {
    /*错误处理*/
  }
});
// 通过“memory-fs”库将打包后的文件写入内存
setFs(context, compiler);
```

- 调用 compiler.watch 方法。compiler 主要做了 2 件事
  1. 先对本地文件代码进行编译打包，也就是 webpack 的一系列编译流程
  2. 编译结束后，开启对本地文件的监听，当文件发生变化，重新编译，编译完成之后继续监听。
- 执行 setFs 方法。利用<code>memory-fs</code>库将编译后的文件打包到内存。这就是为什么在开发的过程中，你会发现 dist 目录没有打包后的代码，因为都在内存中。原因就在于访问内存中的代码比访问文件系统中的文件更快

为什么代码的改动保存会自动编译，重新打包？

答：compiler.watch 监听本地文件的变化，通过文件的生成时间是否有变化

## 五、浏览器接收到热更新的通知

当监听到一次 webpack 编译结束，\_sendStats 方法就通过 websoket 给浏览器发送通知，检查下是否需要热更新。下面重点讲的就是\_sendStats 方法中的 ok 和 hash 事件都做了什么？

那浏览器是如何接收到 websocket 的消息呢？回忆下第 2 步骤增加的入口文件，也就是 websocket 客户端代码。

```js
"xxx/node_modules/webpack-dev-server/client/index.js?http://localhost:8080";
```

这个文件的代码会被打包到 bundle.js 中，运行在浏览器中。来看下这个文件的核心代码吧。

```js
// webpack-dev-server/client/index.js
var socket = require("./socket");
var onSocketMessage = {
  hash: function hash(_hash) {
    // 更新currentHash值
    status.currentHash = _hash;
  },
  ok: function ok() {
    sendMessage("Ok");
    // 进行更新检查等操作
    reloadApp(options, status);
  },
};
// 连接服务地址socketUrl，?http://localhost:8080，本地服务地址
socket(socketUrl, onSocketMessage);

function reloadApp() {
  if (hot) {
    log.info("[WDS] App hot update...");

    // hotEmitter其实就是EventEmitter的实例
    var hotEmitter = require("webpack/hot/emitter");
    hotEmitter.emit("webpackHotUpdate", currentHash);
  }
}
```

socket 方法建立了 websocket 和服务端的连接，并注册了 2 个监听事件。

1. hash 事件，更新最新一次打包后的 hash 值。
2. ok 事件，进行热更新检查。

当 socket 收到 ok, 即触发 ok 事件，会调用 reloadApp 方法，reloadApp 又利用 node.js 的 EventEmitter，发出<code>webpackHotUpdate</code>事件

为什么不直接进行检查更新呢？

答：个人理解就是为了更好的维护代码，以及职责划分的更明确。websocket 仅仅用于客户端（浏览器）和服务端进行通信。而真正做事情的活还是交回给了 webpack。

那 webpack 怎么做的呢？再来回忆下第 2 步。入口文件还有一个文件没有讲到，就是：

```js
"xxx/node_modules/webpack/hot/dev-server.js";
```

这个文件的代码同样会被打包到 bundle.js 中，运行在浏览器中。这个文件做了什么就显而易见了吧！先瞄一眼代码：

```js
// node_modules/webpack/hot/dev-server.js
var check = function check() {
  module.hot
    .check(true)
    .then(function (updatedModules) {
      // 容错，直接刷新页面
      if (!updatedModules) {
        window.location.reload();
        return;
      }

      // 热更新结束，打印信息
      if (upToDate()) {
        log("info", "[HMR] App is up to date.");
      }
    })
    .catch(function (err) {
      window.location.reload();
    });
};

var hotEmitter = require("./emitter");
hotEmitter.on("webpackHotUpdate", function (currentHash) {
  lastHash = currentHash;
  check();
});
```

这里 webpack 监听到了 webpackHotUpdate 事件，并获取最新了最新的 hash 值，然后终于进行检查更新了。检查更新呢调用的是<code>module.hot.check</code>方法。
简单说下 module.hot.check，这里会获取本次编译的 Hash，利用上一次保存的 Hash，请求.json 和.js 文件。

其实后续还有 hotApply 热更新模块替换，我就不再往下深入研究了，有兴趣可见：[轻松理解 webpack 热更新原理](https://juejin.cn/post/6844904008432222215#heading-0)

## 面试

问 1：说下热更新原理

答：

1. webpack-dev-server 启动了两个服务，一个用于提供静态资源访问，一个是 WebSocket，用于本地和浏览器双向通信
2. webpack 服务根据修改的内容，会生成两个补丁文件：.json 和.js 文件
3. webpack-dev-server 通过 compiler 的 done 钩子，监听编译结束，编译结束时，WebSocket 服务端向客户端浏览器的 WebSocket 发送 ok 和 hash
4. 浏览器收到通知后，会发起 http 请求去服务器获取.json 和.js 文件。利用 JSONP 解析.js 文件并局部刷新页面

问 2：WebSocket 是长连接还是短连接？有了 HTTP 协议，为什么还需要 WebSocket？

答：
长连接。因为 WebSocket 可以双向通信

问 3：浏览器是如何知道本地代码重新编译了，并迅速请求了新生成的文件？

答：webpack-dev-server 通过 compiler 的 done 钩子来监听 webpack 编译的结束，只要 webpack 编译结束就触发钩子，通过 WebSocket 服务端给客户端浏览器发送通知(含有本次编译产生的 hash)，浏览器收到通知后，再发起 HTTP 请求新生成的文件

问 4：为什么浏览器能够收到 WebSocket 服务端的通知？

答：websocket 客户端运行在浏览器中，所以浏览器能收到 WebSocket 服务端的通知。webpack-dev-server 会调用<code>addEntries</code>给 webpack 的 entry 入口添加<code>webpack-dev-server/client</code>客户端代码，而客户端的代码包含了 WebSocket 客户端通信的代码，最终 WebSocket 客户端通信的代码会添加的 build.js 中，运行来浏览器中。因此 websocket 客户端运行在浏览器中，所以浏览器能收到 WebSocket 服务端的通知。

问 5：为什么代码的改动保存会 自动编译？

答：compiler.watch 监听本地文件的变化，通过判断文件生成时间是否变化

Webpack 如何实现热更新的呢？首先是建立起浏览器端和服务器端之间的通信，浏览器会接收服务器端推送的消息，如果需要热更新，浏览器发起 http 请求去服务器端获取打包好的资源解析并局部刷新页面

[轻松理解 webpack 热更新原理](https://juejin.cn/post/6844904008432222215#heading-0)
[【Webpack 进阶】聊聊 Webpack 热更新以及原理](https://juejin.cn/post/6939678015823544350#comment)
