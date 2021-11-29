## 实现

```js
class Pubsub {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(type, callback) {
    const events = this.events;
    if (events[type]) {
      if (!events[type].includes(callback)) {
        events[type].push(callback);
      }
    } else {
      events[type] = [callback];
    }
  }

  // 触发事件
  emit(type, ...arg) {
    const callbacks = this.events[type] || [];
    callbacks.forEach((cb) => {
      cb(arg);
    });
  }

  // 根据 type 和 callback 移除对应的订阅
  remove(type, callback) {
    const events = this.events[type];
    if (events) {
      const index = events.indexOf(callback);
      if (index !== -1) events.splice(index, 1);
    }
  }

  // 根据 type 移除所有的订阅
  clear(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }

  // 结合单例模式，可以实例化全局唯一的发布订阅
  static getInstance() {
    if (!this.instance) {
      this.instance = new Pubsub();
    }
    return this.instance;
  }
}

const pubsub = Pubsub.getInstance();

const fn = () => console.log('success1');
pubsub.on('success', fn);
pubsub.on('success', () => {
  console.log('success2');
});
pubsub.emit('success');
// "success1"
// "success2"

pubsub.remove('success', fn);
pubsub.emit('success');
// "success2"

pubsub.clear('success');
pubsub.emit('success');
// 这里没有任何输出
```
