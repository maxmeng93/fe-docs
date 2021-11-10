## 模板编译

模板编译的主要目标是生成渲染函数.

渲染函数的作用是每次执行它, 它就会使用当前最新的状态生成一份新的 vnode, 然后使用这个 vnode 进行渲染.
模版编译成渲染函数有三部分内容

1. 模板解析成 AST --> 解析器
2. 遍历 AST 标记静态节点 --> 优化器
3. 使用 AST 生成代码字符串 --> 代码生成器

![compile](/assets/vue/compiler/1.png)

## Vue 模板渲染的原理是什么？

vue 中的模板 template 无法被浏览器解析并渲染，因为这不属于浏览器的标准，不是正确的 HTML 语法，所有需要将 template 转化成一个 JavaScript 函数，这样浏览器就可以执行这一个函数并渲染出对应的 HTML 元素，就可以让视图跑起来了，这一个转化的过程，就成为模板编译。

模板编译又分三个阶段，解析 parse，优化 optimize，生成 generate，最终生成可执行函数 render。

- parse 阶段：使用大量的正则表达式对 template 字符串进行解析，将标签、指令、属性等转化为抽象语法树 AST。
- optimize 阶段：遍历 AST，找到其中的一些静态节点并进行标记，方便在页面重渲染的时候进行 diff 比较时，直接跳过这一些静态节点，优化 runtime 的性能。
- generate 阶段：将最终的 AST 转化为 render 函数字符串

## 标记静态节点

例子:

```js
let html = `
  <div>
    <p>{{msg}}</p>
    <span>静态节点</span>
  </div>
`;
```

以上例子中，span 节点因为其内容是纯文本，因此它的 ast.static 一定为 true. 如何做静态节点标记, 下面来看下源码

```js
export function optimize(root: ?ASTElement, options: CompilerOptions) {
  if (!root) return;
  isStaticKey = genStaticKeysCached(options.staticKeys || "");
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}
```

optimize 函数 先调用 markStatic 标记静态节点，然后调用 markStaticRoots 来标记静态根节点

## 静态节点类型

- node.type === 1 : <code>元素节点</code>
  1. 如果是普通元素节点，并且使用了 v-pre 指令，则是静态节点，例如：
  ```js
  // 是静态节点
  let html = `<div v-pre>{{msg}}</div>`;
  ```
  2.  如果是普通元素，在没有使用 v-pre 指令的情况下，还必须同时满足：没有动态绑定属性、没有使用 v-if、没有使用 v-for、不是内置组件 slot/component、是平台保留标签、不是带有 v-for 的 template 标签的直接子节点、节点的所有属性的 key 都是静态 key，例如
  ```js
  // 是静态节点
  let html = '<div class="box"></div>';
  ```
- node.type === 2 : <code>带变量的动态文本节点</code>. node.static = false 非静态节点

```js
// 不是静态节点
let html = `<div>{{msg}}</div>`;
```

- node.type === 3 : <code>不带变量的纯文本节点</code>. node.static = true 静态节点

```js
// 是静态节点
let html = `<div>Hello, Vue.js</div>`;
```

在 markStatic 方法中，它首先调用 isStatic 方法来判断当前 ast 是否为一个静态节点，其代码如下

```js
function markStatic(node: ASTNode) {
  node.static = isStatic(node);
  // ...
}
function isStatic(node: ASTNode): boolean {
  if (node.type === 2) {
    // expression
    return false;
  }
  if (node.type === 3) {
    // text
    return true;
  }
  return !!(
    node.pre ||
    (!node.hasBindings && // no dynamic bindings
      !node.if &&
      !node.for && // not v-if or v-for or v-else
      !isBuiltInTag(node.tag) && // not a built-in
      isPlatformReservedTag(node.tag) && // not a component
      !isDirectChildOfTemplateFor(node) &&
      Object.keys(node).every(isStaticKey))
  );
}
```

## 标记静态根节点

标记静态节点后，接着要标记静态根节点

```js
function markStaticRoots(node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    // ......
    if (
      node.static &&
      node.children.length &&
      !(node.children.length === 1 && node.children[0].type === 3)
    ) {
      node.staticRoot = true;
      return;
    } else {
      node.staticRoot = false;
    }
    // ......
  }
}
```

::: tip
如果当前节点 static 属性为 true 了，要标记它为静态根节点的话，还必须满足它的子节点不能只有一个纯文本节点，因为这样做其优化成本要大于其收益
:::
