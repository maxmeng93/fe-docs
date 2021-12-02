JavaScript 是单线程的，当 JS 引擎处理一些耗时的任务时，可能会导致 UI 渲染卡顿，为了解决这种问题，可以使用 `Web Worker`。

由于主线程和 Worker 线程不在同一个上下文中，他们使用数据通信的方式交互，通过 postMessage 发送消息、监听 message 事件接收消息（可以通过 addEventListener 或 onmessage 这两个 API）。

## 使用 `Promise` 封装 `Web Worker`

```ts
export default class PromiseWorker {
  private handlerMap: Map<number, Function> = new Map();

  private worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      const resolve = this.handlerMap.get(type);
      if (!resolve) return;
      resolve(data);
      this.handlerMap.delete(type);
    };
  }

  postMessage(message: WorkerMessage) {
    const { type } = message;
    return new Promise((resolve) => {
      this.worker.postMessage(message);
      this.handlerMap.set(type, resolve);
    });
  }
}
```

使用方式：

```ts
/** 主线程 */
const worker = new PromiseWorker(new Worker());
worker.postMessage({ type: '', data: {} }).then(data => {
  console.log(data);
});


/** worker线程 */
self.onmessage = async(event: MessageEvent) => {
  const { type, data } = event.data;
  switch (type) {
    case 'TYPE_1':
      // 处理任务
      const data = await ...;
      // 回复
      self.postMessage({type, data});
      break;
    case ...
  }
}
```

## Web Worker 的局限性

- DOM 操作限制 Worker 线程和主线程的 window 是不在一个全局上下文中运行的，因此我们无法在 Worker 中访问到 document、window、parent 这些对象，也不能访问 DOM 元素。但是，可以获取 navigator、location 对象。这跟 JavaScript 被设计成单线程也是有关系的，试想多个线程同时对同一个 DOM 操作，就会出现冲突。
- 数据通信限制 Worker 和主线程的通信可以传递对象和数组，他们是通过拷贝的形式传递的，这意味着，我们不能传递不能被序列化的数据，比如说函数，否则会报错。
- 无法访问 localStorage。
- 同源限制 分配给 Worker 线程运行的脚本文件，需要和主线程的脚本文件同源。
- 脚本限制 Worker 线程不能执行 alert、confirm，但是可以获取 setTimeout、XMLHttpRequest 等浏览器 API。
- 文件限制 为了安全，Worker 线程无法读取本地文件，即不能打开本机的文件系统（ file:// ），它所加载的脚本必须来自网络，且需要与主线程的脚本同源。
