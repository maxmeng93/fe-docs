**Promise**

```js
// 3个状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  // 状态
  status = PENDING;
  // 成功后的值
  value = null;
  // 失败后的原因
  reason = null;
  // 成功回调函数
  onFulfilledCallbacks = [];
  // 失败回调函数
  onRejectedCallbacks = [];

  constructor(executor) {
    try {
      // 接受一个执行器，然后立即执行
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED:
      this.value = value;

      while(this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(value);
      }
    }
  }

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;

      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason)
      }
    }
  }

  then(onFulfilled, onRejected) {
    // 如果不传，就使用默认函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const instance = new MyPromise((resolve, reject) => {

      const fulfilledMicrotask = () =>  {
        // 创建一个微任务等待 instance 完成初始化
        queueMicrotask(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = realOnFulfilled(this.value);
            // 传入 resolvePromise 集中处理
            resolvePromise(instance, x, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
      }

      const rejectedMicrotask = () => {
        // 创建一个微任务等待 instance 完成初始化
        queueMicrotask(() => {
          try {
            // 调用失败回调，并且把原因返回
            const x = realOnRejected(this.reason);
            // 传入 resolvePromise 集中处理
            resolvePromise(instance, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      }

      // 判断状态
      if (this.status === FULFILLED) {
        fulfilledMicrotask();
      } else if (this.status === REJECTED) {
        rejectedMicrotask();
      } else if (this.status === PENDING) {
        // 等待
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
        // 等到执行成功失败函数的时候再传递
        this.onFulfilledCallbacks.push(fulfilledMicrotask);
        this.onRejectedCallbacks.push(rejectedMicrotask);
      }

    });

    return instance;
  }

  catch(onRejected) {
    this.then(undefined, onRejected);
  }

  finally(fn) {
    return this.then(value => {
      return MyPromise.resolve(fn()).then(() => {
        return value;
      });
    }, error => {
      return MyPromise.resolve(fn()).then(() => {
        throw error;
      });
    });
  }

  static resolve(parameter) {
    if (parameter instanceof MyPromise) {
      return parameter;
    }

    return new MyPromise(resolve => {
      resolve(parameter);
    });
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(promiseList) {
    return new MyPromise((resolve, reject) => {
      const result = [];
      const length = promiseList.length;
      let count = 0;

      if (length === 0) {
        return resolve(result);
      }

      promiseList.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          count++;
          result[index] = value;
          if (count === length) {
            resolve(result);
          }
        }, reason => {
          reject(reason);
        });
      });
    });
  }

  static allSettled = promiseList => {
    return new MyPromise(resolve => {
      const length = promiseList.length;
      const result = [];
      let count = 0;

      if (length === 0) {
        return resolve(result);
      } else {
        for (let i = 0; i < length; i++) {
          const currentPromise = MyPromise.resolve(promiseList[i]);
          currentPromise.then(value => {
            count++;
            result[i] = {
              status: 'fulfilled',
              value: value
            }
            if (count === length) {
              return resolve(result);
            }
          }, reason => {
            count++;
            result[i] = {
              status: 'rejected',
              reason: reason
            }
            if (count === length) {
              return resolve(result);
            }
          });
        }
      }
    });
  }

  static race(promiseList) {
    return new MyPromise((resolve, reject) => {
      const length = promiseList.length;

      if (length === 0) {
        return resolve();
      } else {
        for (let i = 0; i < length; i++) {
          MyPromise.resolve(promiseList[i]).then(value => {
            return resolve(value);
          }, reason => {
            return reject(reason);
          });
        }
      }
    });
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (typeof x === 'object' || typeof x === 'function') {
    // x 为 null 直接返回，走后面的逻辑会报错
    if (x === null) {
      return resolve(x);
    }

    let then;
    try {
      // 把 x.then 赋值给 then
      then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      let called = false;
      try {
        then.call(
          x, // this 指向 x
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量 called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 error：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
        if (called) return;

        // 否则以 error 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}
```

## 参考

[从一道让我失眠的 Promise 面试题开始，深入分析 Promise 实现细节](https://juejin.cn/post/6945319439772434469)
