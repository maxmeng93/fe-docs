---
title: 抽象语法树（AST）
---

现代前端构建在 AST 之上，无论是 ESlint、Babel、Webpack，还是 css 处理器、代码压缩，都是站立在 AST 的肩膀上。在深入前端工程化之前，先了解一些关于 AST 的知识。

## AST 是什么？

> 在计算机科学中，抽象语法树（Abstract Syntax Tree，AST），或简称语法树（Syntax tree），是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。

> 之所以说语法是“抽象”的，是因为这里的语法并不会表示出真实语法中出现的每个细节。比如，嵌套括号被隐含在树的结构中，并没有以节点的形式呈现；而类似于 if-condition-then 这样的条件跳转语句，可以使用带有两个分支的节点来表示。

如果看完定义如果还是一脸懵逼，那么就上一个简单的 🌰 ，看看把一个简单函数转成 AST 后的样子。示例中的 AST 可以通过网站 [astexplorer](https://astexplorer.net/)在线生成。

```js
// 源码
function sum(a, b) {
  return a + b;
}
```

```json
// 生成的 AST
{
  "type": "Program",
  "start": 0,
  "end": 37,
  "body": [
    {
      "type": "FunctionDeclaration",
      "start": 0,
      "end": 37,
      "id": {
        "type": "Identifier",
        "start": 9,
        "end": 12,
        "name": "sum"
      },
      "expression": false,
      "generator": false,
      "async": false,
      "params": [
        {
          "type": "Identifier",
          "start": 13,
          "end": 14,
          "name": "a"
        },
        {
          "type": "Identifier",
          "start": 16,
          "end": 17,
          "name": "b"
        }
      ],
      "body": {
        "type": "BlockStatement",
        "start": 19,
        "end": 37,
        "body": [
          {
            "type": "ReturnStatement",
            "start": 22,
            "end": 35,
            "argument": {
              "type": "BinaryExpression",
              "start": 29,
              "end": 34,
              "left": {
                "type": "Identifier",
                "start": 29,
                "end": 30,
                "name": "a"
              },
              "operator": "+",
              "right": {
                "type": "Identifier",
                "start": 33,
                "end": 34,
                "name": "b"
              }
            }
          }
        ]
      }
    }
  ],
  "sourceType": "module"
}
```

可以看到 AST 每一层都拥有相似的结构：

```json
{
  "type": "FunctionDeclaration",
  "id": {},
  "params": [],
  "body": []
}
```

```json
{
  "type": "Identifier",
  "name": ""
}
```

```json
{
  "type": "BinaryExpression",
  "left": "",
  "operator": "",
  "right": ""
}
```

这样的每一层结构也被叫做 节点（Node）。 一个 AST 可以由单一的节点或是成百上千个节点构成。 它们组合在一起可以描述用于静态分析的程序语法。

每一个节点都有如下所示的接口：

```ts
interface Node {
  type: string;
}
```

`type` 字段表示节点的类型（如：`FunctionDeclaration`、`Identifier`、`BinaryExpression`）。每一种类型的节点还定义了一些附加属性来进一步描述该节点。

还有一些属性用来描述该节点在原始代码中的位置。

```json
{
  "type": "",
  "start": 0,
  "end": 55,
  "loc": {
    "start": {
      "line": 1,
      "column": 0
    },
    "end": {
      "line": 3,
      "column": 1
    }
  }
}
```

## 生成 AST 的步骤

生成 AST 分为两个阶段，分别是词法分析（Lexical Analysis）和语法分析（Syntactic Analysis）。

### 词法分析

词法分析阶段把字符串形式的代码转换为令牌（tokens）流。
你可以把令牌看作是一个扁平的语法片段数组。

```js
a + b;
```

```js
[
  { type: {}, value: 'a', start: 0, end: 1, loc: {} },
  { type: {}, value: '+', start: 2, end: 3, loc: {} },
  { type: {}, value: 'b', start: 4, end: 5, loc: {} },
];
```

每一个 `type` 有一组属性来描述该令牌：

```js
{
  type: {
    label: 'name',
    keyword: undefined,
    beforeExpr: false,
    startsExpr: true,
    rightAssociative: false,
    isLoop: false,
    isAssign: false,
    prefix: false,
    postfix: false,
    binop: null,
    updateContext: null
  }
}
```

### 语法分析

语法分析阶段会把一个令牌流转换成 AST 的形式。 这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。
