## 介绍

单例模式模式，在该实例不存在的情况下，可以通过一个方法创建一个类来实现创建类的新实例；如果类已经存在，它会简单返回该对象的引用。

## 实现

```js
class Singleton {
  constructor(title) {
    this.title = title;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Singleton('单例');
    }
    return this.instance;
  }
}

const obj1 = Singleton.getInstance();
const obj2 = Singleton.getInstance();
console.log(obj1 === obj2); // true
```
