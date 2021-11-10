## cluster原理

如果多个Node进程监听同一个端口时会出现 Error:listen EADDRIUNS的错误，而cluster模块为什么可以让多个子进程监听同一个端口呢?

## Node.js进程通信原理
进程间通信有哪些？


[深入理解Node.js 中的进程与线程](https://juejin.cn/post/6844903908385488903#heading-0)
[通过源码解析 Node.js 中 cluster 模块的主要功能实现](https://cnodejs.org/topic/56e84480833b7c8a0492e20c)
[图解Node.js Cluster原理](https://cloud.tencent.com/developer/article/1829824)
https://github.com/ElemeFE/node-interview/blob/master/sections/zh-cn/process.md#cluster