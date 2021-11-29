## [观察者模式](https://github.com/MuYunyun/blog/blob/main/BasicSkill/%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F/%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F.md)

`Object.defineProperty`
使用 Object.defineProperty(obj, props, descriptor) 实现观察者模式, 其也是 vue 双向绑定 的核心, 示例如下(当改变 obj 中的 value 的时候, 自动调用相应相关函数):

```js
var obj = {
  data: { list: [] },
};

Object.defineProperty(obj, 'list', {
  get() {
    return this.data['list'];
  },
  set(val) {
    console.log('值被更改了');
    this.data['list'] = val;
  },
});
```

`Proxy`
Proxy/Reflect 是 ES6 引入的新特性, 也可以使用其完成观察者模式, 示例如下(效果同上):

```js
var obj = {
  value: 0,
};

var proxy = new Proxy(obj, {
  set: function (target, key, value, receiver) {
    // {value: 0}  "value"  1  Proxy {value: 0}
    console.log('调用相应函数');
    Reflect.set(target, key, value, receiver);
  },
});

proxy.value = 1; // 调用相应函数
```
