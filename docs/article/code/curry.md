**函数柯里化**是一种转换，将 `f(a,b,c)` 转换为可以被以 `f(a)(b)(c)` 的形式进行调用。JavaScript 实现通常都保持该函数可以被正常调用，并且如果参数数量不足，则返回偏函数。

**偏函数**是把一个函数的某些参数固定住（也就是设置默认值），返回一个新函数，调用这个新函数会更简单。

```js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
```

```js
function sum(a, b, c) {
  return a + b + c;
}

const sumCurry = curry(sum);
sumCurry(1)(2)(3); // 6
sumCurry(1, 2, 3); // 6

const sumCurry10 = sumCurry(10);
sumCurry10(1)(2); // 13
sumCurry10(3)(4); // 17
```
