---
title: 事件循环（Even Loop）
categories:
  - Web基础
tags:
  - Even Loop
date: 2025-03-03 18:37:02
---

> JS 是一门**单线程的非阻塞的**脚本语言，这表示在同一时刻最多也只有一个代码段执行。

**对单线程的理解**：

由于 JS 有 DOM API 可以操作 DOM，如果 JS 是多线程的话，有一个线程添加 DOM 而另一个线程删除 DOM，就会导致矛盾，因此 JS 被设计成单线程的。即使有了 Web Worker 标准出现，也有很多限制，必需受主线程的控制。

**对非阻塞的理解**：

如果 JS 是阻塞的，那么当发起一个 I/O 操作时，等待结果返回的这段时间里，代码应该是无法执行的，而 JS 主线程和渲染进程是互斥的，因此可能造成浏览器假死的状态。事实 JS 是非阻塞的，那它要怎么实现异步任务呢，靠的就是事件循环。

### 事件循环

了解事件循环前，我们先理清楚以下几个概念。

* **同步任务**：指的是在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务。

* **异步任务**：指的是不进入主线程，某个异步任务可以执行了，该任务才会进入主线程执行。

其中，异步任务又分为**宏任务**（`macrotask`）与**微任务**（`microtask`）

#### 宏任务

- script(整体代码)
- setTimeout/setInterval
- I/O
- UI 渲染
- postMessage
- MessageChannel
- requestAnimationFrame
- setImmediate(Node.js 环境)

#### 微任务

- new Promise().then()
- MutaionObserver
- process.nextTick(Node.js 环境）

#### 大致流程

简单的说，事件循环（`eventLoop`）是单线程的JavaScript在处理异步事件时进行的一种循环过程，具体来讲，对于异步事件它会先加入到事件队列中挂起，等主线程空闲时会去执行事件队列中的事件。

![](https://camo.githubusercontent.com/5cdf8ffe82f770b43ab122824fc36dcf6ff6173b7194a2f01618bec18c068cb8/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f36316566626332302d376362382d313165622d383566362d3666616337376330633962332e706e67)

从上面我们可以看到，同步任务进入主线程，即主执行栈，异步任务进入任务队列，主线程内的任务执行完毕为空，会去任务队列读取对应的任务，推入主线程执行。上述过程的不断重复就是事件循环。

![](https://camo.githubusercontent.com/9df714a6e1a59fffa15a2787e0f8e2a10752e6edf49102936f9b53ec01372b01/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f36653830653565302d376362382d313165622d383566362d3666616337376330633962332e706e67)

按照这个流程，它的执行机制是：

- 执行一个宏任务，如果遇到微任务就将它放到微任务的事件队列中
- 当前宏任务执行完成后，会查看微任务的事件队列，然后将里面的所有微任务依次执行完

> **在同一轮任务队列中，同一个微任务产生的微任务会放在这一轮微任务的后面，产生的宏任务会放在这一轮的宏任务后面**
> 
> **在同一轮任务队列中，同一个宏任务产生的微任务会马上执行，产生的宏任务会放在这一轮的宏任务后面**

##### 为什么先微后宏

因为当我们的主线程的代码执行完毕之后，在Event Loop执行之前，首先会尝试DOM渲染，这个时候，微任务是在DOM渲染之前执行，DOM渲染完成了之后，会执行宏任务。

### 经典题目

```js
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}
console.log('script start')
setTimeout(function () {
  console.log('setTimeout')
}, 0)
async1()
new Promise(function (resolve) {
  console.log('promise1')
  resolve()
}).then(function () {
  console.log('promise2')
})
console.log('script end')
```

题目理解的关键：

1. `async/awiat`函数中，`await`之后的内容是微任务

2. `new Promise`执行时传入的函数是同步任务，`then`之后的内容才是微任务

3. `setTimeout`传入的函数是宏任务

因此上面代码的执行顺序是：

```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

### 理解setTimeout

如果有一个 setTimeout(()=>{}, 1000)，这个回调是什么时候进入到事件循环队列里排队呢，是执行到 setTimeout 的时候，还是等 1000ms 之后呢？

答案是：回调函数 **不会在 `setTimeout` 被调用时立即进入队列**，而是 **在 1000ms 定时结束后被放入宏任务队列**，等待事件循环处理。

##### **完整执行流程**

1. **调用 `setTimeout` 时**
   
   - JS 引擎将回调注册到浏览器的 **Timer 模块**（属于 Web API）
   - **开始计时 1000ms**，但此时回调尚未进入任何队列

2. **1000ms 计时结束后**
   
   - 浏览器将回调放入 **宏任务队列（MacroTask Queue）**
   - 如果主线程此时空闲，则立即执行；否则需等待当前任务执行完毕

3. **事件循环调度**
   
   - 当 **调用栈（Call Stack）为空** 时，事件循环从宏任务队列取出回调执行
