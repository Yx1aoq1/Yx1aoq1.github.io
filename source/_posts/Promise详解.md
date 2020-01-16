title: Promise详解
tags:
  - JavaScript
  - ES6
categories:
  - JS相关
date: 2019-12-03 17:23:00
---
## Promise

### 基本介绍

> Promise 是异步编程的一种解决方案，可以将它看成一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

<!--more-->

## Promise

### 基本介绍

> Promise 是异步编程的一种解决方案，可以将它看成一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

▼ **Promise 三种状态**
* `pending` —— 进行中
* `fulfilled` —— 已成功
* `rejected` —— 已失败

▼ **Promise 特点**
* 对象的状态不受外界影响。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
* 一旦状态改变，就不会再变，任何时候都可以得到这个结果。状态的改变只有两种可能：`pending -> fulfilled`、`pending -> rejected`

▼ **Promise API**
```js

new Promise((resolve, reject) => {
  resolve(value)
  // 返回 fulfilled ，value 可以在then中获取
  reject(value)
  // 返回 rejected ，value 可以在then中获取
})

promise.then(value => {
  // 异步执行成功
}, error => {
  // 异步执行失败
})

promise.catch(error => {
  // 异步结果为失败时调用
  // 或者是上一个回调中有抛出异常
})

promise.finally(error => {
  // 不管 Promise 对象最后状态如何，都会执行的操作
})

Promise.all([p2, p3, p4])
// p1, p2, p3 为 Promise 实例
// 只有 p1, p2, p3 都变成 fulfilled 时 all 返回的状态才会变成 fulfilled
// 只要其中一个状态为 rejected 就变为 rejected

Promise.race([p1, p2, p3])
// 同 all，不同的是状态只要有一个改变，race 返回的状态就会跟着变化

Promise.allSettled([p1, p2, p3])
// 只有灯所有的 Promise 实例都返回结果，才会执行结束（不管是返回成功还是失败）
// 其返回的状态永远都是 fulfilled

Promise.any([p1, p2, p3])
// 只要有一个状态变为 fulfilled，状态就会变成 fulfilled
// 全部都 rejected 才会 rejected
// 与 all 相对应

Promise.resolve($.ajax('/whatever.json'))
// 将现有对象转为 Promise 对象
// 相当于 new Promise(resolve => $.ajax('/whatever.json'))
// 如果所传参数不是 Promise 对象或者没有 then 方法，则返回一个状态为 resolved 的 Promise 实例

Promise.reject('error')
// 返回一个新的 Promise 实例，该实例的状态为 rejected
```

### 为什么使用

传统的异步回调，在多层依赖的情况下，会有“回调地狱”的问题：

```js
setTimeout(() => {
  console.log(111);
  setTimeout(() => {
    console.log(222);
    setTimeout(() => {
      console.log(333);
      setTimeout(() => {
        console.log(444);
        // 你还可以放置更多
        ...
      }, 4000);
    }, 3000);
  }, 2000)
}, 1000);
```

而如果换成Promise就不会有这样的问题：

```js
 // promise 解决
function f1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(111), 1000);
  }).then(data => console.log(data));
}
function f2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(222), 2000);
  }).then(data => console.log(data));
}
function f3() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(333), 3000);
  }).then(data => console.log(data));
}
function f4() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(444), 4000);
  }).then(data => console.log(data));
}
f1().then(f2).then(f3).then(f4);
```

### [Promise源码](https://chromium.googlesource.com/v8/v8/+/3.29.45/src/promise.js?autodive=0%2F)

### 面试问题

▼ **已有一个Promise对象的实例A，封装一个函数让他执行超时时抛出错误**

```js
function timeoutError (t) {
  return new Promise ((resolve, reject) => {
    resolve(A)
    setTimeout(reject, t)
  })
}
```
使用的知识点为`resolve(A)`实际等同于`new Promise(resolve => A)`

## Async/Await

`async`与`await`是ES2017中提出的，是`Promise`的语法糖，使得异步代码书写起来更像同步代码，更易于阅读和理解。

我们可以用上面的例子来对比一下多层回调的情况：

* `Async/Awiat`版本：

```js
async doIt function () {
  await f1()
  await f2()
  await f3()
  await f4()
  // do something...
}
```

乍看之下可能没什么差别，但是如果有需要参数传递时，就可以看出`Async/Awiat`的优越性：

```js
function waiter (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(time), time);
  })
} 
```


* `Promise` 版本：

```js
waiter(100)
  .then(time1 => {
    return waiter(time1).then(time2 => [time1, time2])
  })
  .then(([time1, time2]) => {
    doSomething(time1, time2)
  })

```

* `Async/Awiat` 版本：

```js
async doIt function () {
  await time1 = waiter(100)
  await time2 = waiter(time1)
  doSomething(time1, time2)
}
```

可以看出，使用`Async/Awiat`的代码更加的简洁和好理解，如果有需要处理错误，则也和同步代码一样使用`try catch`即可。
