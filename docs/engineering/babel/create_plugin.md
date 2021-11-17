---
title: 写一个 Babel 插件
---

写一个 babel 插件完成下面的需求。

先看下面这段代码：

```js
function sum(a, b) {
  return a + b;
}

sum(1, 2); // 3

sum(1, 2, 3); // 3
```

函数 `sum` 定义时只接受 2 个参数，因此传入多个数字也没有用，只会计算前 2 个参数的和。现在我们写一个 babel 插件，使 `sum` 接受一个数组，并返回数组每一项相加后的和。并且要把历史代码中调用 `sum` 的代码也改成数组参数。

完成后的插件应该将上面的代码转换成以下：

```js
function sum(nums) {
  return nums.reduce((sum, next) => sum + next, 0);
}

sum([1, 2]); // 3

sum([1, 2, 3]); // 6
```

## 插件结构

先新建一个 js 文件，把插件的架子搭好。

```js
module.exports = function (api) {
  const { types: t } = api;

  return {
    name: 'babel-plugin-any',
    pre(state) {},
    visitor: {},
    post(state) {},
  };
};
```

`pre`、`post` 方法分别在遍历开始和结束后执行，可以用来设置缓存、分析、清理等。`visitor` 对象通过 **访问者模式** 依次访问每个节点。

## 参考资料

- Babel 插件手册：https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md
