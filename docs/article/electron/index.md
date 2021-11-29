## electron

https://juejin.cn/post/6844904029231775758
http://www.electronjs.org/docs/api/ipc-main
http://www.electronjs.org/docs/api/ipc-renderer

### 构成

Chromium + Nodejs + Native APIs = electron

### 主从进程模型

1. 主进程
   进程间通信、窗口管理
   全局通用服务。
   一些只能或适合在主进程做的事情。例如浏览器下载、全局快捷键处理、托盘、session。
   维护一些必要的全局状态
   上面说的通用混合层也跑在这个进程。通过 Node C++ 插件暴露接口。

2. 渲染进程
   负责 Web 页面的渲染, 具体页面的业务处理。

3. Service Worker
   负责静态资源缓存。缓存一些网络图片、音频。保证静态资源的稳定加载。

### 通信

ipcMain 从主进程到渲染进程的异步通信。是 EventEmitter 的实例。

ipcRenderer

方法：
共同方法
on(channel, listener)
once(channer, listener)
removeListener(channel, mlistener)
removeAllListeners(channel)

ipcMain 方法
handle(channel, listener)
handleOnce(channel, listener)
removeHandler(channel)

ipcRenderer 方法
send(channel, ...args)
invoke(channel, ...args) 返回 Promise
sendSync(channel, ...args)
postMessage(channel, message, [transfer])
sendTo(webContentsId, channel, ...args)
sendToHost(channel, ...args)

```js
// 在主进程中.
const { ipcMain } = require('electron');
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.reply('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = 'pong';
});

//在渲染器进程 (网页) 中。
const { ipcRenderer } = require('electron');
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg); // prints "pong"
});
ipcRenderer.send('asynchronous-message', 'ping');
```
