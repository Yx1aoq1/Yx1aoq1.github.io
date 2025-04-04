---
title: 异步编程之promise与trigger
date: 2017-07-15 16:13:01
categories: 
  - Web基础
tags: 
  - JavaScript
  - 异步
---
这周的学习任务：`promise`与`trigger`

## 异步编程

> Javascript语言将任务的执行模式分为同步（Synchronous）和异步（Asynchronous），“同步模式”指的是后一个任务只有等待前一个任务完成之后才能执行，程序执行顺序与任务的排列顺序是一致的、同步的。而“异步模式”指的是每个任务有一个或多个回调函数，前一个任务结束后，不是执行后一个任务，而是执行回调函数，后一个任务则是不等前一个任务结束就执行，所以程序的执行顺序与任务的排列顺序是不一致的、异步的。

### 实现异步编程的四种方法

* **回调函数**

回调函数可以理解为，被另一个函数调用的函数。
可以想成这样一个应用场景：
```javascript
f1(); //一个十分耗时的函数
f2(); //等待f1执行完才能执行的函数
f3(); //等待f1执行完才能执行的函数
```
Javascript语言的执行环境是"单线程"，就是指一次只能完成一件任务。所以上面函数的执行顺序会是`f1->f2->f3`，但如果`f3`是一个与页面加载有关的函数，那就比较蛋疼了，因为它必须等待`f1`与`f2`都执行完才能执行，这就导致了页面加载时间过长，体验很不好。
```javascript
function f1(callback) {
  //f1执行代码
  callback();
}

f1(f2);
f3();
```
如果采用回调函数的方法（异步），函数的执行顺序就可以变成`f1->f3->f2`，加载时间就节省了`f2`执行的时间，也算是一点优化了。
**优点：** 简单、容易理解和部署。
**缺点：** 不利于代码的阅读和维护，各个部分之间高度耦合，流程会很混乱，而且每个任务只能指定一个回调函数。

* **事件监听**

事件监听指的是采用事件驱动模式，任务的执行不取决于代码的顺序，而取决于某个事件是否发生。jQuery中有许多事件，例如`click`、`keydown`之类的，可以通过`on`来绑定。
```javascript
f1.on('click',f2); //在发送点击事件之后，会执行f2函数
```
而`trigger`的作用是，可以通过`$.Event('eventName')`来自定义一个事件，然后通过`trigger`触发这个事件。
```javascript
var $null = $({}); //绑定空对象
var hideEvent = $.Event('hide.tab');

function f1() {
  //f1执行代码
  f1.trigger('hide.tab');
}

$null.on('hide.tab',f2);
```
当`f1`执行完后就会触发`hide.tab`事件，从而开始执行`f2`。
而且这个自定义的事件可以通过`trigger`绑定在多个函数之中，也就是说，可以通过多个操作来触发同一个事件。也可以实现两个不同模块的相互通信，比如一个子函数可以调用父函数的方法，那么父函数如果要调用子函数的方法要怎么办呢？这个时候就可以利用`trigger`来触发事件，然后通过事件绑定调用子函数的方法。
**优点：** 比较容易理解，可以绑定多个事件，每个事件可以指定多个回调函数，而且可以"去耦合"，有利于实现模块化。
**缺点：** 整个程序都要变成事件驱动型，运行流程会变得很不清晰。

* **发布/订阅**

发布/订阅可以理解为存在一个“信号中心”，某个任务执行完成，就向信号中心“发布”（publish）一个信号，其他任务可以向信号中心“订阅”（subscribe）这个信号，从而知道什么时候自己可以开始执行。这就叫做"发布/订阅模式"，又称“观察者模式”。
实现步骤如下：
```javascript
jQuery.subscribe('done',f2); //通过订阅中心jQuery订阅"done"信号

function f1() {
  //f1执行代码
  jQuery.public('done'); //f1执行完后，向信号中心发布"done"信号，引发f2执行
}

jQuery.unsubscribe('done',f2); //取消订阅
```
**优点：** 可以通过查看"消息中心"，了解存在多少信号、每个信号有多少订阅者，从而监控程序的运行。

* **deferred对象**

deferred对象就是jQuery的回调函数解决方案，可以通过链式写法执行回调函数。
```javascript
f1().then(f2);

function f1(){
  var dfd = $.Deferred();
　// f1的任务代码
　dfd.resolve();
　return dfd.promise;
}
```
**优点：** 回调函数变成了链式写法，程序的流程可以看得很清楚，而且有一整套的配套方法，可以实现许多强大的功能。它还有一个前面三种方法都没有的好处：如果一个任务已经完成，再添加回调函数，该回调函数会立即执行。所以，你不用担心是否错过了某个事件或信号。

## deferred对象详解

### deferred对象的应用场景

* **让异步操作代码像同步代码那样书写和阅读，流程更加清晰**
* **优化ajax的嵌套执行**

原本我们在执行`ajax`的时候，如果这个请求中还有`ajax`请求，就会有以下这种写法：
```javascript
$.ajax({
  url: "test.html",
  success: function() {
    $.ajax({
      url: ...,
      success: function() {
        ....
      }
    });
  }
});
```
我们可以将两个`ajax`分开封装
```javascript
function A() {
  return $.ajax({
    url: "test.html",
    ...
  });
}

function B() {
  return $.ajax({
    url: "...",
    ...
  });
}

$.when(A(),B()).then(function() {
  dosth();
});
```

### 方法总结

* `$.Deferred()`：生成一个deferred对象
* `deferred.done()`：指定操作成功时的回调函数
* `deferred.fail()`：指定操作失败时的回调函数
* `deferred.promise()`：没有参数时，返回一个新的deferred对象，该对象的运行状态无法改变；接受参数时，作用为在参数对象上部署deferred接口。
* `deferred.resolve()`：手动改变deferred对象的运行状态为“已完成”，从而立即触发`done()`方法
* `deferred.reject()`：与deferred.resolve()正好相反，调用后将deferred对象的运行状态变为"已失败"，从而立即触发fail()方法
* `$.when()`：为多个操作指定回调函数。当所有操作都成功时执行`done()`
* `deferred.then()`：有时为了省事，可以把`done()`和`fail()`合在一起写，这就是`then()`方法
