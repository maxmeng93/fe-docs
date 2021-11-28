---
title: 跟着源码学：Vue 响应式原理
---

响应式原理可能是在面试中出现频率最高的 Vue 面试题了，本文通过深入解读源码来分析其原理。

## Object.defineProperty

在深入源码先，要先了解实现响应式的基础： `Object.defineProperty(obj, prop, descriptor)`，具体使用方法可以查看[文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。这里只需要知道 `obj` 是要监听变化的对象，`prop` 是
