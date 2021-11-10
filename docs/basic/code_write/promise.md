问：Promise 中是如何实现回调函数返回值穿透的？

答: 在then中返回一个新的promise

问：Promise 出错后，是怎么通过“冒泡”传递给最后那个捕获异常的函数？

答：出错后通过包装成promise.reject形式返回，如果then中没有第二个参数处理异常，则继续返回promise.reject,直到被 onReject 函数处理或 catch 语句捕获为止。




参考：
[BAT前端经典面试问题：史上最最最详细的手写Promise教程](https://juejin.cn/post/6844903625769091079)
[面试官：“你能手写一个 Promise 吗”](https://zhuanlan.zhihu.com/p/183801144)