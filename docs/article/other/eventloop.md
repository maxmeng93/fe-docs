浏览器中 JavaScript 的执行流程和 Node.js 中的流程都是基于 事件循环（Event Loop）的。

> 每个宏任务后，引擎会立即执行微任务队列中的所有任务，然后再执行其他的宏任务，或渲染，或进行其他操作。 ———— JavaScript.info

![eventloop](/images/other/eventloop.png)

## 分类

- 宏任务

整体代码 script、`setTimeout`、`setInterval`、`setImmediate`、`requestAnimationFrame`、IO、UI 交互事件

- 微任务

`Promise(.then/catch/finally)`、`process.nextTick`、`MutationObserver`、`queueMicrotask(func)`（这个方法可以让 `func` 在微任务队列中执行）

## 事件循环算法

1. 从 宏任务 队列（例如 “script”）中出队（dequeue）并执行最早的任务。
2. 执行所有 微任务：

- 当微任务队列非空时：
  - 出队（dequeue）并执行最早的微任务。

3. 如果有变更，则将变更渲染出来。
4. 如果宏任务队列为空，则休眠直到出现宏任务。
5. 转到步骤 1。

## 总结

1. 代码有同步和异步的区别，JS 引擎遇到同步代码时会将其放入主线程中先执行。
2. 遇到异步代码时，会将其放入异步任务队列等待执行。异步任务又分为微任务和宏任务，它们分别会进入不同的队列中。
3. 当主进程中的代码执行完毕时，会将异步任务队列中的代码放到主线程中执行。微任务队列会优先于宏任务队列被放到主线程中执行，如果进入主线程执行的微任务执行时又产生了新的微任务，那么主线程执行完毕后，会继续优先把微任务放入主线程执行，直至微任务队列排空。
4. 宏任务队列中的任务进入主进程执行。
5. 继续步骤 2，这个过程会不断重复，也就是所谓的事件循环（Event Loop）。

## 参考

- [事件循环：微任务和宏任务](https://zh.javascript.info/event-loop)
- [微任务](https://zh.javascript.info/microtask-queue)
- [setTimeout+Promise+Async 输出顺序](https://juejin.cn/post/7016298598883131423)
- [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.cn/post/6844903512845860872)
