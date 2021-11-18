---
title: 写一个 Babel 插件
---

通过一个 🌰，来学习

## 前言

本文是 Babel 进阶内容，浏览之前要对 babel 的使用、生态和基本原理有过一定的了解。Babel 插件本质是修改 AST，因此也要对 AST 有一定的认识。

## What? 做什么

先看下面这段代码：

```js
function sum(a, b) {
  return a + b;
}

console.log(sum(1, 2)); // 3
console.log(sum(1, 2, 3)); // 3
let sum2 = sum(1, 2, 3, 4);
console.log(sum2); // 3
```

函数 `sum` 定义时只接受 2 个参数，因此传入多个数字也没有用，只会计算前 2 个参数的和。现在我们写一个 babel 插件，使 `sum` 接受一个数组，并返回数组每一项相加后的和。并且要把历史代码中调用 `sum` 的代码也改成数组参数。

完成后的插件应该将上面的代码转换成以下：

```js
function sum(nums) {
  return nums.reduce((sum, next) => sum + next, 0);
}

sum([1, 2]); // 3
sum([1, 2, 3]); // 6
let sum2 = sum([1, 2, 3, 4]);
console.log(sum2); // 10
```

## How? 怎么做

### 插件结构

先新建一个 js 文件，把插件的架子搭好。

```js
module.exports = function (api) {
  // types：@babel/types
  // template：@babel/template
  const { types: t, template } = api;

  return {
    name: 'babel-plugin-any',
    pre(state) {},
    visitor: {},
    post(state) {},
  };
};
```

`pre`、`post` 方法分别在遍历开始和结束后执行，可以用来设置缓存、分析、清理等。`visitor` 对象通过 **访问者模式** 依次访问每个节点，babel 插件的主要代码就是写在这里。

### 找到要修改的 `sum`

要根据方法名修改 AST，可以在 `visitor` 定义 `Identifier` 方法，这个方法会遍历代码中的所有标识符，只要找到标识符是 `sum` 的节点，第一步就成功了。

```js
module.exports = function (api) {
  return {
    visitor: {
      Identifier(path) {
        const { node } = path;
        if (!node) return;

        if (node.name === 'sum') {
          //
        }
      },
    },
  };
};
```

`path` 是当前标识符的路径，`path` 包含了很多当前路径的[元数据](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#paths%E8%B7%AF%E5%BE%84)。 `path.node` 代表当前正在访问的节点（node），可以根据节点的名称是否等于 `sum`，来判断是否进入了将要修改的节点。

> `Identifier() { ... }` 是 `Identifier: { enter() { ... }}` 的简写。

每次 AST 遍历中，有两次机会访问同一节点，分别是**进入**和**退出**。完整的访问者方法可以这样定义：

```js
{
  Identifier: {
    enter() {
      console.log('进入节点');
    },
    exit() {
      console.log('退出节点');
    }
  }
}
```

找到 `sum` 标识符后，先拿到当前标识符的父节点（要修改的节点在当前标识符的父节点下）。

```js
if (node.name === 'sum') {
  // 拿到当前 Identifier 的父节点
  const parent = path.parent;

  if (parent.type === 'CallExpression') {
    // 处理函数调用
  }

  if (parent.type === 'FunctionDeclaration') {
    // 处理函数定义
  }
}
```

### 修改函数调用参数

先使用 `t.arrayExpression()` 方法创建一个数组节点，然后再将原函数参数遍历后添加到此数组节点中，接着将此数组节点设置为 `parent`（parent 在此处表示函数调用表达式）的参数。

```js
if (parent.type === 'CallExpression') {
  const params = t.arrayExpression();
  const args = parent.arguments;

  for (let i = 0; i < args.length; i++) {
    params.elements.push(args[i]);
  }
  parent.arguments = [params];

  return;
}
```

### 修改函数定义参数及函数体

修改函数定义 AST 稍微复杂一点，请看以下代码。先是修改函数参数，再接着修改函数体。这里的 `t` 其实就是 `@babel/types`，你可以在插件中调用它所有的方法。

```js
if (parent.type === 'FunctionDeclaration') {
  // 将sum函数接受的2个参数，改为一个参数
  parent.params = [t.identifier('nums')];

  // 修改函数体
  parent.body = t.blockStatement([
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.identifier('nums'), t.identifier('reduce')),
        [
          t.arrowFunctionExpression(
            [t.identifier('sum'), t.identifier('next')],
            t.binaryExpression('+', t.identifier('sum'), t.identifier('next'))
          ),
          t.numericLiteral(0),
        ]
      )
    ),
  ]);

  return;
}
```

上面修改函数体的代码是比较复杂的，那么可以简化吗？答案是：可以。我们的需求是将 `return a + b;` 改成 `return nums.reduce((sum, next) => sum + next, 0);`，对于这种固定、大段的代码，可以使用 `@babel/template` 来做，也就是在上面插件结构那里的 `api.template`。下面请看具体写法：

```js
if (parent.type === 'FunctionDeclaration') {
  // 将sum函数接受的2个参数，改为一个参数
  parent.params = [t.identifier('nums')];

  // 利用 @babel/template 简化以上代码写法
  parent.body = template(`{
    return nums.reduce((sum, next) => sum + next, 0);
  }`)();

  return;
}
```

可以看到 `template` 将旧的写法大大的简化了。你可以将 `template` 看作是函数，它可以设置占位符，然后通过传入的参数，来填充占位符。此处不展开讲解，有兴趣的可以查看[文档](https://babel.docschina.org/docs/en/babel-template/)。

现在一个插件的功能就写完了。执行命令 `yarn build`，查看生成的代码是否符合预期。文章中的代码已经上传[GitHub](https://github.com/maxmeng93/babel-plugin-any)，需要的自取。

## 参考资料

- Babel 插件手册：https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md
- JavaScript 常见 AST 梳理：https://blog.csdn.net/weixin_40906515/article/details/118004822
- 创建 AST 节点写法示例：https://www.jianshu.com/p/b66593151f0f
