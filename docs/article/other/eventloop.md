JavaScript 是一门单线程语言，为了使主线程不阻塞，EventLoop 就应运而生了。EventLoop 是 JavaScript 的执行机制。

## 分类

### 宏任务

setTimeout、setInterval、setImmediate、IO、UI 交互事件

### 微任务

Promise.then、Promise.catch、Promise.finally、process.nextTick、MutaionObserver

## 参考

- [setTimeout+Promise+Async 输出顺序](https://juejin.cn/post/7016298598883131423)
- [Event loop](http://blog.maxmeng.top/2020/04/03/JS%E4%B8%AD%E7%9A%84%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF-Event-loop/)
- [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.cn/post/6844903512845860872)
