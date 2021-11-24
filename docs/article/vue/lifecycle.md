---
title: 跟着源码学：Vue 生命周期
---

## 前言

> 每个 Vue 实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，这给了用户在不同阶段添加自己的代码的机会。

下面就是 Vue 官方的生命周期图示：
![生命周期](/images/vue/lifecycle.png)

## callHook

所有的生命周期钩子方法都是由下面这个 `callHook` 函数触发的。这个方法在 Vue 源码中的位置是 `src/core/instance/lifecycle`。

```js
export function callHook(vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  const handlers = vm.$options[hook];
  const info = `${hook} hook`;
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}
```

`callHook` 接受 2 个参数：`vm` 和 `hook`。`vm` 就是要触发钩子函数的组件，`hook` 是要触发的钩子名称。函数的逻辑非常简单，就是根据传入的 `hook` 字符串，拿到对应组件 `vm` 上与之匹配的生命周期函数数组。然后遍历执行 `invokeWithErrorHandling`，这个方法是用来调用方法并处理错误，在 `callHook` 中可以理解为 `handlers[i].call(vm)`。

关于这里为什么是钩子函数数组？因为如果组件使用了混入（mixin）对象时，混入对象选项会和组件选项进行合并。同名的钩子函数将合并为一个数组，并且混入对象的钩子会在组件自身钩子之前被调用。选项合并这里不深入讲，选项合并发生在组件初始化时，感兴趣的朋友可以查看源码 `src/core/instance/init.js` 中的 `Vue.prototype.init` 和 `mergeOptions()` 的实现。

```js
Vue.prototype._init = function (options?: Object) {
  ...

  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options);
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    );
  }

  ...
};
```

## beforeCreate & created

`beforeCreate` 和 `created` 钩子是在组件初始化时被 `callHook()` 触发执行的。这段代码同样在 `src/core/instance/init.js` 中。

```js
Vue.prototype._init = function (options?: Object) {
  ...

  initLifecycle(vm)

  initEvents(vm)

  initRender(vm)

  // 执行 beforeCreate 钩子
  callHook(vm, 'beforeCreate')

  initInjections(vm)

  // src/core/instance/state.js
  // 这个方法用于初始化props、methods、data、computed、watch
  // 因 beforeCreate 钩子触发在此之前，因此无法获取到这些数据
  initState(vm)

  initProvide(vm)

  // 执行 created 钩子
  callHook(vm, 'created')

  ...

  // 实例挂载
  // beforeCreate 和 created 钩子发生在实例挂载之前，此时DOM还没渲染，因此这两个钩子不能获取、修改DOM
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
};
```

从上面的 `_init` 方法可以看出，在初始化阶段做了很多事情，包括初始化生命周期、事件监听、渲染、数据、方法及触发对应的钩子，初始化完成后会执行 `vm.$mount()` 方法，执行这个方法后就进入了挂载阶段。

通过以下的代码可以看到实际执行的是 `mountComponent` 方法。

```js
// src/platforms/web/runtime/index.js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

## beforeMount & mounted

`beforeMount` 和 `mounted` 钩子在挂载阶段触发，代码在 `src/core/instance/lifecycle.js` 文件的 `mountComponent` 函数。

```js
export function mountComponent(
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el;

  ...

  // 触发 beforeMount钩子
  callHook(vm, 'beforeMount')

  let updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    // 将实例标记为已挂载，并触发 mounted 钩子
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

1. 进入 `mountComponent` 函数后，首先会触发 `beforeMount` 钩子；
2. 然后会实例化一个 `watcher`（watcher 的过程在其他文章讲），在 `watcher` 内部会执行 `updateComponent()`，也就是执行了 `vm._update(vm._render(), hydrating)`；
3. 最后如果 `vm.$vnode == null` 成立，则将此实例标记为已挂载，并触发 `mounted` 钩子。

`vm.$vnode` 代表当前组件的父实例的虚拟 DOM，如果为 `null` 则代表当前实例为根节点，即 `new Vue({})` 的实例。

```js{6}
// src/core/instance/render.js
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree

  ...
}
```

这说明现在触发的 `mounted` 钩子只是对于当前项目的根实例，而不包括普通的组件，那么这些组件是在什么时候 `mounted` 呢？其实就是在上面第二步 `vm._update`，这里会开专门的文章讲，这里不赘述。

## beforeUpdate & updated

这两个钩子是在数据更新时执行，上面分析 `mountComponent` 时，已经看到了 `before` 方法里面执行了 `callHook(vm, 'beforeUpdate')`，那么 `before` 是在哪里执行呢？

```js{12,21}
// src/core/observer/scheduler.js
function flushSchedulerQueue() {
  let watcher, id;

  queue.sort((a, b) => a.id - b.id);

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before(); // before() => callHook(vm, 'beforeUpdate') 触发beforeUpdate钩子
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
  }

  const updatedQueue = queue.slice();

  callUpdatedHooks(updatedQueue);
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated') // 触发updated钩子
    }
  }
}
```

## beforeDestroy & destroyed

这两个钩子是在组件销毁阶段 `$destroy` 方法中触发的。

```js{7,32}
// src/core/instance/lifecycle.js
Vue.prototype.$destroy = function () {
  const vm: Component = this;
  if (vm._isBeingDestroyed) {
    return;
  }
  callHook(vm, 'beforeDestroy');
  vm._isBeingDestroyed = true;
  // remove self from parent
  const parent = vm.$parent;
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm);
  }
  // teardown watchers
  if (vm._watcher) {
    vm._watcher.teardown();
  }
  let i = vm._watchers.length;
  while (i--) {
    vm._watchers[i].teardown();
  }
  // remove reference from data ob
  // frozen object may not have observer.
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--;
  }
  // call the last hook...
  vm._isDestroyed = true;
  // invoke destroy hooks on current rendered tree
  vm.__patch__(vm._vnode, null);
  // fire destroyed hook
  callHook(vm, 'destroyed');
  // turn off all instance listeners.
  vm.$off();
  // remove __vue__ reference
  if (vm.$el) {
    vm.$el.__vue__ = null;
  }
  // release circular reference (#6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null;
  }
};
```

进入 `$destroy` 方法后，如果已经开始销毁了就跳出函数，否则执行销毁动作。先触发 `beforeDestroy` 钩子，接着将此实例标记为已经开始销毁，然后执行一些列的销毁动作，如：从父实例中销毁对自身的引用 `remove(parent.$children, vm)`、删除监听器 `watcher`、触发子组件的销毁方法 `vm.__patch__(vm._vnode, null)`。然后触发 `destroyed` 钩子，最后关闭实例监听器。
