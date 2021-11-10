## 组件里的 data 必须是一个函数返回的对象，而不能就只是一个对象?

由于组件可以多次复用，因此需要通过工厂函数模式返回一个对象，组件每次实例化时(复用组件)调用 data()函数返回新的数据对象.

如果 data 仍然是一个纯粹的对象，则组件每次实例时将引用同一个数据对象

源码简析

```js
export function initState(vm: Component) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
}

function initData(vm: Component) {
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? getData(data, vm) : data || {};
  const keys = Object.keys(data);
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    // data属性的命名不能和props、methods中的命名冲突
    if (process.env.NODE_ENV !== "production") {
      if (methods && hasOwn(methods, key)) {
        // ....warn
      }
    }
    if (props && hasOwn(props, key)) {
      // ....warn
      // 是不能以$或者_开头
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key);
    }
  }
  observe(data, true /* asRootData */);
}
export function getData(data: Function, vm: Component): any {
  // 执行data函数, 执行新的数据对象
  return data.call(vm, vm);
}
```

## proxy 代理

我们经常会直接使用 this.xxx 的形式直接访问 props 或者 data 中的值，这是因为 Vue 为 props 和 data 默认做了 proxy 代理

```js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
};
// proxy(vm, `_data`, key)执行
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

Vue 中为什么使用 this.xxx 就能直接访问 data, props 中的属性?

因为在初始化 State 中, 会使用 proxy 对 vm 做数据劫持, 当访问 this.xxx 实际上是访问 this.\_data.xxx 或者 this.\_props.xxx

```js
const name = this.name;
this.name = "BBB";
// 等价于
const name = this._data.name;
this._data.name = "BBB";
```

## Vue 中的 key 有什么用?

<code>高效的更新虚拟 DOM</code>

Vnode 进行 patch 时会调用 sameNode 方法, 判断两个 Vnode 是否为同一个. sameNode 方法使用 key 值是否相等来进行判断：

```js
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag &&
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)))
  );
}
```

### 举例:

![key](/assets/vue/vnode/1.png)

我们希望可以在 B 和 C 之间加一个 F，Diff 算法默认执行起来是这样的：
![key](/assets/vue/vnode/2.png)

C 更新成 F，D 更新成 C，E 更新成 D，最后再插入 E，发生了 4 次 vnode 结构变化. 是不是很没有效率？

使用 key 来给每个节点做一个唯一标识，Diff 算法就可以正确的识别此节点，找到正确的位置区插入新的节点。

![key](/assets/vue/vnode/3.png)

只需 发生 1 次 vnode 结构变化

[v-for 为什么要加 key，能用 index 作为 key 么](https://www.cnblogs.com/youhong/p/11327062.html)
