## 工作流程

```js
<div id="app">
  <div>{{ fullName }}</div>
</div>;
var vm = new Vue({
  el: "#app",
  data: {
    firstName: "first",
    lastName: "last",
  },
  computed: {
    // 计算属性的 getter
    fullName() {
      // `this` 指向 vm 实例
      return this.firstName + this.lastName;
    },
  },
});
```

:::tip
温馨提示：computed 内使用的 data 属性，下文统称为“依赖属性”
:::
入口文件: /src/core/instance/index.js 调用了<code>initMixin(Vue)</code> -> /src/core/instance/init.js 调用了<code>initState(vm)</code>

```js
// 源码位置: /src/core/instance/state.js
function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  // 初始化 computed
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

initComputed

```js
// 源码位置：/src/core/instance/state.js
function initComputed(vm: Component, computed: Object) {
  // 1
  const watchers = (vm._computedWatchers = Object.create(null));

  for (const key in computed) {
    const userDef = computed[key];
    // 2
    const getter = typeof userDef === "function" ? userDef : userDef.get;

    if (!isSSR) {
      // 3
      watchers[key] = new Watcher(vm, getter || noop, noop, { lazy: true });
    }
    if (!(key in vm)) {
      // 4
      defineComputed(vm, key, userDef);
    }
  }
}
```

- 实例上定义 \_computedWatchers 对象，用于存储“计算属性 Watcher”
- 获取计算属性的 getter，需要判断是函数声明还是对象声明
- 创建<code>计算属性 watcher</code>实例，getter 作为参数传入，它会在依赖属性更新时进行调用，并对计算属性重新取值。这部分下面会讲
- defineComputed 对计算属性进行数据劫持

defineComputed 如何对计算属性做数据劫持?

```js
// 源码位置：/src/core/instance/state.js
const noop = function () {};
// 1
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
};

export function defineComputed(
  target: any,
  key: string,
  userDef: Object | Function
) {
  // 判断是否为服务端渲染
  const shouldCache = !isServerRendering();
  if (typeof userDef === "function") {
    // 2
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    // 2
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  // 3
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

1. sharedPropertyDefinition 是计算属性初始的属性描述对象
2. 计算属性使用 <code>函数声明</code> 或 <code>对象声明</code>, (浏览器环境)执行 createComputedGetter 返回的函数 赋值的 defineProperty.get
3. 对计算属性进行数据劫持，sharedPropertyDefinition 作为第三个给参数传入

下面看看 createComputedGetter 的实现

```js
// 源码位置：/src/core/instance/state.js
function createComputedGetter(key) {
  return function computedGetter() {
    // 1
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // 2
      if (watcher.dirty) {
        watcher.evaluate();
      }
      // 3
      if (Dep.target) {
        watcher.depend();
      }
      // 4
      return watcher.value;
    }
  };
}
```

1. 取出对应的“计算属性 Watcher
2. watcher.dirty 是实现计算属性缓存的触发点，当 watcher.dirty 为 true 时, 才会执行 watcher.evaluate 对计算属性重新求值
3. 依赖属性收集<code>渲染 watcher</code>
   第 3 点, 为什么依赖属性收集 render watcher? 这个下面会解释

## computed 缓存

在创建 computed watcher 的时候, lazy 为 true, dirty 的初始值等同于 lazy

```js
new Watcher(vm, getter || noop, noop, { lazy: true });
```

也就是说, 在初始化 computed 中, 会实例化 computed watcher, 实例化后的 computed watcher 的 lazy 属性为 true, 所以此时 watcher.value 为 undefined

```js
class Watcher {
  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    // ......
    this.lazy = !!options.lazy;
    // dirty 初始值等同于 lazy
    this.dirty = this.lazy; // for lazy watchers
    this.value = this.lazy ? undefined : this.get();
  }
}
```

初始化 computed 结束后, 会执行$mount, 初始化渲染界面. 以文章开头的例子, 初始化渲染界面时, 由于使用到了<code>fullname</code>, 触发 computed <code>数据劫持 get</code>. 前面已经讲过, 计算属性进行数据劫持 get 实际上是 执行 computedGetter 函数.

## 核心代码

再来看下核心代码吧!

```js
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
// .....
function evaluate() {
  this.value = this.get();
  this.dirty = false;
}
```

执行 computedGetter 函数, 由于实例化的 computed watcher.dirty 为 true, 所以会执行 watcher.evaluate(), evaluate 做了两件事

- 调用 this.get(), 即执行 computed 函数, 将结果赋值给 watcher.value
- 将 watcher.dirty 置为 false. 下次再获取计算属性时, 就无需再次执行 evaluate, 只需直接返回缓存的 watcher.value.
  ::: tip
  虽然 watcher.dirty 置为 false, 但 watcher.lazy 还是 true
  :::

## 依赖收集

上面讲了, 为了将结果缓存到 watcher.value, 需要调用 this.get(), 即执行 computed 函数. 然而执行 computed 函数时, 可不是那么简单! computed 函数会获取 <code>依赖属性</code>, 触发 数据劫持 get. 那么初始化渲染界面后, computed 依赖属性 对应的 dep 队列 有几个 watcher? 分别是什么? 下面我们来分析一下

想搞清楚依赖收集, 必须要知道 Dep.target(即 watcher 实例), dep 分别是啥! 才能把 watcher 实例放入属性对应的 dep 队列中.

### 收集计算属性 Watcher

其实 this.get()函数中, 调用 pushTarget()就把当前的 watcher 入栈, 并赋值给 Dep.target.

```js
Dep.target = null;
let stack = []; // 存储 watcher 的栈

export function pushTarget(watcher) {
  // 入栈
  stack.push(watcher);
  Dep.target = watcher;
}

export function popTarget() {
  // 出栈
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
```

在界面初始化时, 具体来说是$beforeMount 之后, $mounted 之前, 会实例化 <code>渲染 watcher</code>

```js
function mountComponent(vm, el, hydrating) {
  callHook(vm, "beforeMount");
  var updateComponent;

  updateComponent = function () {
    // 渲染页面
    vm._update(vm._render(), hydrating);
  };

  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before: function before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, "beforeUpdate");
        }
      },
    },
    true /* isRenderWatcher */
  );
  hydrating = false;

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, "mounted");
  }
  return vm;
}
```

此时, 先将<code>渲染 watcher</code>入栈, 并赋值给<code>Dep.target</code>
在页面渲染过程中遇到计算属性，对其取值，因此执行 watcher.evaluate 的逻辑，接着调用 this.get

```js
get () {
  // 1
  pushTarget(this)
  let value
  const vm = this.vm
  value = this.getter.call(vm, vm) // 计算属性求值
  popTarget()
  this.cleanupDeps()
  return value
}
```

pushTarget 轮到“计算属性 Watcher”入栈，并挂载到 Dep.target，此时<strong>栈中为 [渲染 Watcher, 计算属性 Watcher]</strong>

this.getter 对计算属性求值，在获取依赖属性时，会触发依赖属性的 <code>数据劫持 get</code>，执行 dep.depend 收集依赖（“计算属性 Watcher”）, 此时<code>依赖属性 对应的 dep 队列 [计算属性 Watcher]</code>

### 收集渲染 Watcher

this.getter 求值完成执行<code>popTragte</code>，“计算属性 Watcher”出栈，Dep.target 设置为“渲染 Watcher”，此时的 Dep.target 是“渲染 Watcher”
在核心代码中, 有如下代码:

```js
if (Dep.target) {
  watcher.depend();
}
```

watcher.depend 将 当前 watcher, 即 Dep.target, 即渲染 watcher. 放入依赖属性的 dep 队列中. 此时<code>依赖属性 对应的 dep 队列 [计算属性 Watcher, 渲染 watcher]</code>

```js
depend() {
  // deps 内存储的是依赖属性的 dep
  let i = this.deps.length
  while (i--) {
    this.deps[i].depend()
  }
}
```

![deps](/assets/vue/reactive/5.png)

### 为什么依赖属性要收集渲染 Watcher

模板上没有使用到依赖属性，页面渲染时，那么依赖属性是不会收集 “渲染 Watcher”的。此时依赖属性里只会有“计算属性 Watcher”，当依赖属性被修改，只会触发“计算属性 Watcher”的 update。而计算属性的 update 里仅仅是将 dirty 设置为 true，并没有立刻求值，那么计算属性也不会被更新。

所以需要收集“渲染 Watcher”，在执行完“计算属性 Watcher”后，再执行“渲染 Watcher”。页面渲染对计算属性取值，执行 watcher.evaluate 才会重新计算求值，页面计算属性更新

## 依赖依集总结

![deps](/assets/vue/reactive/6.png)

依赖属性的 dep 队列至少会有两个 watcher[计算属性 Watcher, 渲染 watcher]

## 面试

1. computed 是如何初始化的, 初始化之后做了那些事情?

答:

- 实例化 computed watcher, 将 computed watcher 存入 vm.\_computedWatchers 对象中. 初始化时 watcher.dirty 为 true
- 通过 defineProperty 对 computed 属性 做数据劫持
- 界面渲染时, 获取 computed 属性, 触发数据劫持 get, 由于 watcher.dirty 为 true, 会执行 computed 函数

2. 为什么我们改变了 data 中的属性值后, computed 会重新计算, 它是如何实现的?
   修改了依赖属性, computed 会重新计算.
   依赖收集:

- 依赖属性对应的 dep 队列[计算属性 Watcher]. 页面渲染获取 computed 属性时, 会执行 computed 函数. 触发了依赖属性 数据劫持 get, 将 computed watcher 放入 依赖属性对应的 dep 队列
- 依赖属性对应的 dep 队列[计算属性 Watcher, 渲染 watcher]. computed 中执行 watcher.depend. 将渲染 watcher 放入 依赖属性的 dep 队列
  总之, computed 在页面渲染之后, 依赖属性的 dep 队列至少会有两个 watcher[计算属性 Watcher, 渲染 watcher]

当依赖属性变化时, 先执行计算属性 Watcher 的 update, 将 watcher.dirty 置为 true, 表示需要重新计算. 接着执行渲染 watcher 的 update 回调, 页面渲染对 computed 属性取值, 由于 computed watcher.dirty 为 true, 会执行 computed watcher.evaluate 重新计算求值
![dirty](/assets/vue/reactive/4.png)

3. computed 它是如何缓存值的, 当我们下次访问该属性的时候, 是怎样读取缓存数据的?
   通过 computed watcher.dirty 控制是否使用缓存

将缓存结果赋值给 computed watcher.value

- dirty 为 true: 重新计算, 更新 watcher.value
- dirty 为 false: 使用缓存, 直接返回

参考:
[Computed - 源码版](https://mp.weixin.qq.com/s?__biz=MzUxNjQ1NjMwNw==&mid=2247484234&idx=1&sn=70a9dea79d5f1b5aaacbe828fa5815e1&chksm=f9a66956ced1e0407f5ac7a3722f9784327b121763e73de9011b4fcb852d530d44632717021c&cur_album_id=1619085427984957440&scene=190#rd)
[手摸手带你理解 Vue 的 Computed 原理](https://www.cnblogs.com/chanwahfung/p/13193897.html)
