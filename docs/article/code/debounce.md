**debounce（防抖）**

在事件被触发 n 秒后再执行，如果在这 n 秒内又被触发，则重新计时。
应用：输入框联想搜索，监听 input 事件，只有用户在规定时间内没有输入新的内容时，才会触发事件。

```js
// 原理：
// 1）先定义一个 timer 变量
// 2）清掉上一个定时器
// 3）设置新的定时器，并赋值给 timer
function debounce(fun, delay = 500) {
  // 先定义一个 timer 变量，会将下面设置的定时器保存到这个变量中
  let timer;
  return function () {
    let _this = this;
    let args = arguments;
    // 清掉上一个定时器
    clearTimeout(timer);
    // 设置新的定时器
    timer = setTimeout(function () {
      fun.apply(_this, args);
    }, delay);
  };
}
```
