---
title: JS定时器与单线程
date: 2017-09-25 21:28:25
tags: [JavaScript]
---
## JavaScript单线程

众所周知，JavaScript语言是单线程的，简而言之就是在同一时间内只能执行一段代码，如果这段代码很长很长，后续的代码也只能等待前一段代码执行完才能够执行。

这里有个例子：
```javascript
var date = new Date();
//打印才进入时的时间
console.log('first time: ' + date.getTime());
//一秒后打印setTimeout里匿名函数的时间
setTimeout(function(){
  var date1 = new Date();
  console.log('second time: ' + date1.getTime() );
  console.log( date1.getTime() - date.getTime() );
},1000);
//重复操作
for(var i=0; i < 10000 ; i++){
  console.log(1);
}
```

`setTimeout`是一个定时器，设定在1000ms之后运行定义的回调函数，但是从上一个例子可以得到，执行回调函数的时间与代码开始执行的时间间隔并不是1000ms，而是大于1000ms。

其中的原因便是因为JavaScript是单线程的，在1000ms的时候主线程正在执行for循环，所以`setTimeout`只能等待for循环执行完毕之后才能执行，时间自然超过了1000ms。

但是这里仍然有一个疑问，假设`setTimeout`后续还有两个函数，一个函数的执行时间是1000ms，另一个是2000ms，那`setTimeout`会在紧跟着的第一个函数执行完就插队执行吗？

```javascript
var startTime = new Date();
setTimeout(function() {
  console.log("hellow world");
}, 1000);
while(new Date() - startTime < 1000) {}
console.log("wait");
while(true) {}
```

答案是并不会，`setTimeout`只有在后续代码全部执行完之后才会执行它的回调函数，所以以上的代码永远也无法打印出`hellow world`。

## JavaScript运行机制

我们可以将运行的任务分成两组，一种是同步任务，一种是异步任务。同步任务是指在主线程上排队执行的任务，只有前一个任务执行完，才能执行后一个任务；异步任务指的是，不进入主线程、而是进入“任务队列”的任务。只有“任务队列”通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。

所以当一段代码有异步操作时，执行过程是这样的：

* 所有同步任务都在主线程上执行，形成一个执行栈。
* 主线程之外，还存在一个“任务队列”。只要异步任务有了运行结果，就不在“任务队列”中放置一个事件。
* 一旦“执行栈”中的所有同步任务执行完毕，系统就会读取“任务队列”，看看里面面有哪些事件。那些对应的异步任务，结束等待状态，进入执行栈开始执行。
* 主线程不断重复上面的第三步。

所以，**只有在主线程任务执行完毕之后，系统才会去读取“任务队列”。**

## 任务队列

"任务队列"中的事件，除了IO设备的事件以外，还包括一些用户产生的事件（比如鼠标点击、页面滚动等等）。只要指定过回调函数，这些事件发生时就会进入"任务队列"，等待主线程读取。

"任务队列"是一个先进先出的数据结构，排在前面的事件，优先被主线程读取。主线程的读取过程基本上是自动的，只要执行栈一清空，"任务队列"上第一位的事件就自动进入主线程。

主线程不断从“任务队列”中读取事件的过程又称为**Event Loop**。

## setTimeout与setInterval

### setTimeout

关于`setTimeout`在上述已经说的蛮清楚了，还有一点是关于`setTimeout(func,0)`。
当设置定时器为0ms时，回调函数func也不会再0ms的时候就执行，而是采取尽可能快的执行。即当主线程程序都执行完毕，进入空闲就会立刻执行func。而相对于还在任务队列中的其他等待的程序，`setTimeout(func,0)`相当于插了队。

### setInterval

`setInterval`是重复定时器，它在执行的时候有一条规则：仅当没有该定时器的任何其他**代码实例**时，才能将定时器代码添加到任务队列中。

假设没有这条规则，因为指定的时间是定时器插入到任务队列的时间，如果主线程的运行时间非常长，此时`setInterval`的回调函数被多次插入到任务队列中，当主线程空闲时，定时器便会连续执行措辞而之间不会有任何的间隔。

```javascript
setInterval(function() {
  var startTime = new Date();
  while(Date.now - startTime < 350) {}
}, 200);
var startTime = new Date();
while(Date.now() - startTime < 300) {}
```

由于存在上述所说的规则，某些间隔会被跳过，多个定时器的代码执行之间的间隔可能会比预期的小。我们可以画一个流程图：

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/settimeout.png)

在605ms处第一个定时器代码仍然在运行，同时在代码队列中已经有了另一个定时器的代码实例。所以在这个时间点上的定时器代码 不会被添加到队列中。

所以在使用setInterval做动画时要注意两个问题：

* 不能使用固定步长作为做动画，一定要使用百分比: 开始值 + (目标值 - 开始值) * （Date.now() - 开始时间）/ 时间区间
* 如果主进程运行时间过长，会出现跳帧的现象

为了避免setInterval的两个缺点，可以使用链式`setTimeout()`：
```
setTimeout(function(){     //其他处理
  setTimeout(arguments.callee, interval); }, interval);
```

文章参考：
[Javascript定时器学习笔记](https://yq.aliyun.com/wenji/1646)
[阮一峰 —— JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)