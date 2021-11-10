## patch

虚拟 DOM 最核心部分是 patch, 它可以将 vnode 渲染成真实的 DOM. patch, 渲染真实 DOM 时, 并不是暴力覆盖原有 DOM, 而是比对新旧两个 vnode 之间有哪些不同, 根据对比结果找出需要更新的节点进行更新. 故 patch 实际作用是在现有 DOM 上进行修改来实现更新视图

## patch

```js
return function patch(oldVnode, vnode, hydrating, removeOnly) {
  // 新的不存在，删除
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue = []

  // 老的不存在，新增
  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  }
  // 两者都存在，更新
  else {
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // 比较两个vnode
      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
    } else {
      ...
    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```

分析 <code>patch</code> 方法，两个 <code>vnode</code> 进行对比，结果无非就是三种情况

1. 新的不存在，表示要删除旧节点
2. 老的不存在，表示要新增节点
3. 都存在，进行更新，这里又分成了两种情况

- 其他情况，比如根组件首次渲染
- 不是真实节点，且新旧节点的是同一类型的节点（根据 key 和 tag 等来判断）

## 根组件首次渲染

先来分析下 3.1 的情况. 举例:
:::details

```js
<div id="demo">
  I am {{name}}.
</div>
<script>
  const app = new Vue({
    el: '#demo',
    data: {
      name: 'ayou',
    },
  })
</script>
```

:::
第一次进入到 patch 这个函数的时候是根组件挂载时，此时因为 oldVnode 为 demo 这个<code>真实的 DOM 元素</code>, 我们会走到这里：

```js
if (isRealElement) {
  // either not server-rendered, or hydration failed.
  // create an empty node and replace it
  // 真实节点转为虚拟节点，并把真实节点放到 oldVnode.elm 上
  oldVnode = emptyNodeAt(oldVnode);
}

// replacing existing element
const oldElm = oldVnode.elm;
const parentElm = nodeOps.parentNode(oldElm);

// 创建真实的 dom 或者组件并插入到 parentElm
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm,
  // 新的 dom 会放到旧的 dom 的后面，所以有一瞬间两者都会存在
  // 这样的好处是第一次渲染可以避免对 children 进行无谓的 diff，当然这种做法仅适用于 hydrating 为 false 的时候
  nodeOps.nextSibling(oldElm)
);
```

做的内容有(createElm 下面再分析):

1. 将真实节点转为虚拟节点
2. 得到旧节点的父元素
3. 通过 vnode 创建真实的节点并插入到旧节点的后面，所以有一瞬间会同时存在两个 id 为 demo 的 div

![first-render](/assets/vue/vnode/5.png)

先跳过中间 isDef(vnode.parent) 这一段. 这里会执行 removeVnodes 把旧的元素给删除掉，因此界面才最终显示一个 id 为 demo 的 div

### 接下来简要分析下 createElm

首先创建了一个 tag 类型的元素，并赋值给 vnode.elm。因为传进来的 vnode 是原生标签，所以最后会走到

```js
const data = vnode.data;
const children = vnode.children;
const tag = vnode.tag;
// .....
vnode.elm = vnode.ns
  ? nodeOps.createElementNS(vnode.ns, tag)
  : nodeOps.createElement(tag, vnode);
// .....
createChildren(vnode, children, insertedVnodeQueue);
if (isDef(data)) {
  // 事件、属性等等初始化
  invokeCreateHooks(vnode, insertedVnodeQueue);
}
// 插入节点
insert(parentElm, vnode.elm, refElm);
```

其中 createChildren 中又调用了 createElm：

```js
function createChildren(vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    if (process.env.NODE_ENV !== "production") {
      checkDuplicateKeys(children);
    }
    for (let i = 0; i < children.length; ++i) {
      createElm(
        children[i],
        insertedVnodeQueue,
        vnode.elm,
        null,
        true,
        children,
        i
      );
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
  }
}
```

不停递归地调用 createElm, 最后执行 insert(parentElm, vnode.elm, refElm) 的时候，vnode.elm 就是一颗完整的 dom 树了，执行完 insert 以后，这颗树就插入到了 body 之中

## 新旧节点的是同一类型的节点

:::details

```js
<div id="demo">
  <p>I am {{name}}</p>
</div>
<script>
  const app = new Vue({
    el: "#demo",
    data: {
      name: "ayou",
    },
    mounted() {
      setTimeout(() => {
        this.name = "you";
      }, 2000);
    },
  });
</script>
```

:::
我们在定时器中对 name 进行了重新赋值，此时会触发组件的更新，最终走到 patch 函数:

```js
// ...
if (!isRealElement && sameVnode(oldVnode, vnode)) {
  // patch existing root node
  // 比较两个vnode
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
}
// ...
```

我们去掉一些我们暂时不关心的代码，看看 patchVnode

```js
function patchVnode(
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray,
  index,
  removeOnly
) {
  if (oldVnode === vnode) {
    return
  }
  ...
  // 获取两个节点孩子节点数组
  const oldCh = oldVnode.children
  const ch = vnode.children
  // 属性更新
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef((i = data.hook)) && isDef((i = i.update))) i(oldVnode, vnode)
  }
  // 内部比较
  // 新节点不是文本节点
  if (isUndef(vnode.text)) {
    // 都有孩子，进行孩子的更新
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch)
        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      // 新的有孩子，老的没孩子
      if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(ch)
      }
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      // 批量新增
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      // 老的有孩子，新的没孩子，批量删除
      removeVnodes(oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    // 文本节点更新
    nodeOps.setTextContent(elm, vnode.text)
  }
}
```

patchVnode 做了两件事：

1. 更新属性. 略
2. 更新 children 或者更新文本<code>setTextContent</code>

更新 <code>chidren</code> 有几种情况:

1. 新旧节点都有孩子，进行孩子的更新
2. 新的有孩子，旧的没有孩子，进行批量添加
3. 新的没有孩子，旧的有孩子，进行批量删除

新增和删除都比较简单，这里就暂时先不讨论。下面着重分析的是 updateChildren, 也是 diff 算法的核心.
使用<code>双指针算法</code>来对比新旧两个 vnode 的 children, 找出最小操作补丁.

![patch](/assets/vue/vnode/4.png)

在新⽼两组 vnode 节点的左右头尾两侧都有⼀个变量标记，在遍历过程中这⼏个变量都会向中间靠拢。当 oldStartIdx > oldEndIdx 或者 newStartIdx > newEndIdx 时结束循环。以下是遍历规则：
⾸先，oldStartIdx、oldEndIdx 与 newStartIdx、newEndIdx 两两<code>交叉⽐较</code>，共有 4 种情况:

1. oldStartIdx 与 newStartIdx 所对应的 node 是 sameVnode

![updateChildren](/assets/vue/vnode/6.png)

2. oldEndIdx 与 newEndIdx 所对应的 node 是 sameVnode

![updateChildren](/assets/vue/vnode/7.png)

3. oldStartIdx 与 newEndIdx 所对应的 node 是 sameVnode

![updateChildren](/assets/vue/vnode/8.png)

这种情况不仅要进行两者的 patchVNode，还需要将旧的节点移到 oldEndIdx 后面. 4. oldEndIdx 与 newStartIdx 所对应的 node 是 sameVnode

![updateChildren](/assets/vue/vnode/9.png)

同样，这种情况不光要进行两者的 patchVNode，还需要将旧的节点移到 oldStartIdx 前面

如果四种情况都不匹配，就尝试从旧的 children 中找到一个 sameVnode)(个人理解: 此时循环以新 vnode 为主体)，这里又分成两种情况:

1. 找到了

![updateChildren](/assets/vue/vnode/10.png)

这种情况首先进行两者的 patchVNode，然后将旧的节点移到 oldStartIdx 前面 2. 没找到

![updateChildren](/assets/vue/vnode/11.png)

这种情况首先会通过 newStartIdx 指向的 vnode 创建一个新的元素，然后插入到 oldStartIdx 前面

### 哈希表优化查找

```js
// oldKeyToIdx是一个对象, 保存了oldVond的key和index下标
if (isUndef(oldKeyToIdx)) {
  oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
}
idxInOld = isDef(newStartVnode.key)
  ? oldKeyToIdx[newStartVnode.key]
  : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
// ......
function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) {
      map[key] = i;
    }
  }
  return map;
}
```

如果 newStartVnode 有标记 key, 那么 直接 去 <code>oldKeyToIdx</code>查找, 看看 旧结点 中是否有和 newStartVnode 一样的结点.

最后，如果新旧子节点中有任何一方遍历完了，还需要做一个收尾工作，这里又分为两种情况:

```js
if (oldStartIdx > oldEndIdx) {
  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
  addVnodes(
    parentElm,
    refElm,
    newCh,
    newStartIdx,
    newEndIdx,
    insertedVnodeQueue
  );
} else if (newStartIdx > newEndIdx) {
  removeVnodes(oldCh, oldStartIdx, oldEndIdx);
}
```

1. 旧的先遍历完

![updateChildren](/assets/vue/vnode/12.png)

这种情况需要将新的 children 中未遍历的节点进行插入. 2. 新的先遍历完

![updateChildren](/assets/vue/vnode/13.png)

这种情况需要将旧的 children 中未遍历的节点进行删除

到此，整个 patch 的过程就大致分析完了

## diff 原理总结

- 当数据发生改变时，订阅者 watcher 就会调用 patch 给真实的 DOM 打补丁
- 通过 isSameVnode 进行判断，相同则调用 patchVnode 方法
- patchVnode 做了以下操作：
  - 找到对应的真实 dom，称为 el
  - 如果都是文本节点且文本不相等，将 el 文本节点设置为 Vnode 的文本节点. 即更新文本内容.
  - 如果 oldVnode 有子节点而 VNode 没有，则删除 el 子节点
  - 如果 oldVnode 没有子节点而 VNode 有，则将 VNode 的子节点真实化后添加到 el
  - 如果两者都有子节点，则执行 updateChildren 函数比较子节点
- updateChildren 主要做了以下操作：
  - 设置新旧 VNode 的头尾指针
  - 新旧头尾指针进行比较，循环向中间靠拢，根据情况调用 patchVnode 进行 patch 重复流程、调用 createElem 创建一个新节点，从哈希表寻找 key 一致的 VNode 节点再分情况操作

参考:
[Vue 源码之 patch 详解](https://juejin.cn/post/6850418110911119374#heading-0)
[面试官：你了解 vue 的 diff 算法吗？说说看](https://vue3js.cn/interview/vue/diff.html#%E4%B8%89%E3%80%81%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90)
