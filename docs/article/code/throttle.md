**throttle（节流）**

在规定时间内内最多触发一次传入的函数。如果在这个规定时间内触发多次函数，则只有一次生效。
应用：上拉加载，监听 scroll 事件，即使页面一直在滑动，也只能每过规定时间触发一次事件。

```js
// 原理：
// 1）先定义一个变量 flag
// 2）当 flag === true，停止执行
// 3）当 flag === false，先将 flag 设置为 true，然后设置定时器，并且在定时器执行完成前，不可设置新的定时器
// 4）经过 delay 时间后，上一步设置的定时器被触发，将 flag 设置为 false，并执行节流函数传入的方法 fun。
// 5）因上一个定时器已被触发，且 flag === false，当节流函数再次被触发时，将可以设置新的定时器
function throttle(fun, delay = 500) {
  // 定义一个 Boolean 类型的变量 flag
  // true：已经设置过一个定时器，且还没有执行
  // false：没有设置过定时器或者上一个定时器已经执行完成
  let flag = false;
  return function () {
    // 如果已经设置过定时器，则不继续执行
    if (flag) {
      return;
    }
    // 将 flag 设置为 true，说明下面将设置一个定时器
    flag = true;
    let _this = this;
    let args = arguments;
    // 设置一个 delay 后执行的定时器
    setTimeout(function () {
      // 将 flag 设置为 false，且会执行节流函数接收到的函数 fun
      // 这个定时器执行完成后，节流函数可以设置新的定时器
      flag = false;
      fun.apply(_this, args);
    }, delay);
  };
}
```
