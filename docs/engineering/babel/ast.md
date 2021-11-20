---
title: 抽象语法树（AST）
---

现代前端构建在 AST 之上，无论是 ESlint、Babel、Webpack，还是 css 处理器、代码压缩，都是站立在 AST 的肩膀上。在深入学习 Babel 之前，先了解一些关于 AST 的知识。

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

### 词法分析/扫描（Scanning）

词法分析阶段从左向右逐行扫描源程序的字符，识别出各个单词，确定单词的类型，将识别出的单词转换成统一的词法单元（token）形式。

`token` <种别码，属性值>
| 单词类型 | 种别 | 种别码 |
| -------- | -------------------------------------------------------------------- | :--------------------------: |
| 关键字 | if、else、then、... | 一词一码 |
| 标识符 | 变量名、方法名、... | 多词一码 |
| 常量 | 数字、字符串、布尔值 | 一型一码 |
| 运算法 | 算术（+ - \* / ++ --）<br> 关系（> < == != >= <=）<br>逻辑（& \| ~） | 一词一码 <br>或<br> 一型一码 |
| 界限符 | ; () = {} | 一词一码 |

举个例子: `a + b`，这段程序通常会被分解成为下面这些词法单元: `a`、`+`、`b`，空格是否被当成此法单元，取决于空格在这门语言中的意义。

下面的代码就是利用[词法分析网站](https://esprima.org/demo/parse.html)解析 `a + b` 后得到的词法单元序列（toekns）。

```js
[
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '+' },
  { type: 'Identifier', value: 'b' },
];
```

对于词法分析感兴趣的同学可以阅读 `@babel/parser` 中的词法分析方法 [Tokenizer](https://github.com/babel/babel/blob/master/packages/babel-parser/src/tokenizer/index.js)。

### 语法分析（Parsing）

语法分析器从词法分析器输出的 token 序列中识别出各类短语，并转换成 AST 的形式。 这个阶段会使用 token 中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。

## Babel 工作流程

![babel工作流](/images/babel/babel.jpeg)

Babel 工作流程分为三步：`Parse`、`Transform`、`Generator`。

### Parse 解析

第一步，`Babel` 会利用 `@babel/parse` 包提供的方法，经过 `词法分析` 和 `语法分析` 两个步骤，将源代码解析为抽象语法树（AST）的形式。

### Transform 转换

第二步，在得到源代码的 AST 后，`Babel` 会使用 `@babel/traverse` 遍历整个 AST，并在此过程中根据需求修改 AST。

#### Visitors（访问者）

在此过程中，Babel 会维护一个 `visitor` 对象，这里对象里定义了用于在 AST 中获取具体节点的方法。下面请看一个例子：

```js
const visitor = {
  Identifier(path) {
    // 输出当前标识符的名字
    console.log(path.node.name);
  },
  FunctionDeclaration(path) {
    // 输出函数定义的名字
    console.log(path.node.name);
  },
};
```

> 注意：`Identifier() { ... }` 是 `Identifier: { enter() { ... } }` 的简写形式。

上面的 `visitor` 对象中定义了 2 个方法，分别是 `Identifier` 和 `FunctionDeclaration`。`Identifier` 方法在遍历到 `type: Identifier` 的节点时会执行，而 `FunctionDeclaration` 方法会在节点的 `type` 为 `FunctionDeclaration` 时执行。

所以在下面的代码中 `Identifier()` 会被调用四次。

```js
function square(n) {
  return n * n;
}

// Identifier() 会打印出以下内容
// square
// n
// n
// n
```

这些调用都发生在**进入**节点时，不过我们也可以在**退出**时调用访问者方法。将访问者方法修改一下：

```js
const visitor = {
  Identifier: {
    enter(path) {
      // 进入时
    },
    exit(path) {
      // 退出时
    },
  },
};
```

#### Paths（路径）

访问者方法接收一个 `path` 对象参数，这个对象代表当前节点的路径。可以通过 `path` 访问当前节点、当前节点的父节点、还有其他 Babel 添加到该路径上的一些[元数据](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#paths%E8%B7%AF%E5%BE%84)。

```json
// path 对象
{
  "parent": {
    "type": "FunctionDeclaration",
    "id": {...},
    ....
  },
  "node": {
    "type": "Identifier",
    "name": "square"
  },
  ...
}
```

#### State（状态）

#### Scopes（作用域）

### Generator 生成

## 参考资料

- AST 详解与运用：https://zhuanlan.zhihu.com/p/266697614
- ESTree AST 规范：https://github.com/estree/estree
