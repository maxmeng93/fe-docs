:::warning
实现一个分时函数。把 1 秒创建 1000 个 DOM 节点，改成每隔 200 毫秒创建 10 个节点，这样不用短时间在页面中创建大量的 DOM
:::
答：

```js
/**
sumArr: 总数的列表
count: 每次间隔创建的数量
interval: 间隔时间
*/
function timChunk(creatDom, sumArr, count, interval) {
  const start = function () {
    for (let i = 0; i < count; i++) {
      creatDom(sumArr.shift());
    }
  };
  return function () {
    const timer = setInterval(() => {
      if (sumArr.length === 0) {
        clearInterval(timer);
        return;
      }
      start();
    }, interval || 200);
  };
}

// 测试
function creatDom(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  document.body.appendChild(div);
}
window.onload = function () {
  const arr = [];
  for (let i = 0, len = 100000; i < len; i++) {
    arr.push(i);
  }
  // 一次性添加dom
  // for (let i=0, len=arr.length; i < len; i++) {
  //   creatDom(i)
  // }
  // 每200毫秒，创建10个
  const renderList = timChunk(creatDom, arr, 10, 200);
  renderList();
};
```

一次性生成

![batchInit](/assets/basic/code_write/13.png)

分时生成

- 优点：将大任务分解成小任务，达到不阻塞浏览器的效果
- 缺点：整个长列表渲染时间相对来说，会更长

![timeChunk](/assets/basic/code_write/14.png)

参考:
[分时函数](https://segmentfault.com/a/1190000040143919?utm_source=tag-newest)
