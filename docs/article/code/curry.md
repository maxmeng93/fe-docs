**函数柯里化**

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
```
