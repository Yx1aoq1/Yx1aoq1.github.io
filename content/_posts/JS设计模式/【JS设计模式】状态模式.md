---
title: 【JS设计模式】状态模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-09-06 19:15:27
---
## 状态模式

状态模式的定义：

> **允许一个对象在其内部状态改变时来改变它的行为**，对象看起来似乎修改了它的类。在状态模式中，我们把状态封装成独立的类，并将请求委托给当前的状态对象，所以当对象内部的状态改变时，对象会有不同的行为。状态模式的关键就是区分对象的内部状态。

### 举个例子 —— 电灯程序

**▼普通的实现**

```js
var Light = function () {
  this.state = 'off' // 给电灯设置初始状态off
  this.button = null // 电灯开关按钮
}

Light.prototype.init = function () {
  var button = document.createElement('button')
  var self = this
  
  button.innerHTML = '开关'
  this.button = document.body.appendChild(button)
  this.button.onclick = function () {
    self.buttonWasPressed()
  }
}

Light.prototype.buttonWasPressed = function () {
  if (this.state === 'off') {
    console.log('开灯')
    this.state = 'on'
  } else if (this.state === 'on') {
    console.log('关灯')
    this.state = 'off'
  }
}

var light = new Light()
light.init()
```

随着科技进步，现在的电灯很明显已经不再是单纯的两种状态。许多电灯的开关表现为：第一次按打开弱光，第二次按打开强光，第三次按关闭电灯。我们来改造上面的程序：

```js
Light.prototype.buttonWasPressed = function () {
  if (this.state === 'off') {
    console.log('弱光')
    this.state = 'weakLight'
  } else if (this.state === 'weakLight') {
    console.log('强光')
    this.state = 'strongLight'
  } else if (this.state === 'strongLight') {
    console.log('关灯')
    this.state = 'off'
  }
}
```

这个程序存在以下缺点：

* 违反“开放-封闭”原则，每次新增或者修改`light`的状态，都需要改动`buttonWasPressed`方法中的代码，使得`buttonWasPressed`称为一个非常不稳定的方法
* 如果增加更多的状态，那么`buttonWasPressed`将变得越来越庞大且难以维护
* 状态切换不明显，仅仅表现为对`state`变量赋值，实际开发中很容易漏掉
* 堆砌`if`、`else`语句，代码显得不优雅且难以阅读

**▼使用状态模式**

```js
// OffLightState
var OffLightState = function (light) {
  this.light = light
}

OffLightState.prototype.buttonWasPressed = function () {
  console.log('弱光') // 切换时对应的行为
  this.light.setState(this.light.weakLightState) // 状态切换到weakLightState
}
```

```js
// WeakLightState
var WeakLightState = function (light) {
  this.light = light
}

WeakLightState.prototype.buttonWasPressed = function () {
  console.log('强光') // 切换时对应的行为
  this.light.setState(this.light.strongLightState) // 状态切换到strongLightState
}
```

```js
// StrongLightState
var StrongLightState = function (light) {
  this.light = light
}

StrongLightState.prototype.buttonWasPressed = function () {
  console.log('关灯') // 切换时对应的行为
  this.light.setState(this.light.offLightState) // 状态切换到offLightState
}
```

```js
// 改写Light类
var Light = function () {
  this.offLightState = new OffLightState(this)
  this.weakLightState = new WeakLightState(this)
  this.strongLightState = new StrongLightState(this)
  this.button = null
}

Light.prototype.init = function () {
  var button = document.createElement('button')
  var self = this
  
  button.innerHTML = '开关'
  this.currState = this.offLightState
  this.button = document.body.appendChild(button)
  this.button.onclick = function () {
    self.currState.buttonWasPressed()
  }
}

Light.prototype.setState = function (newState) {
  this.currState = newState
}

var light = new Light()
light.init()
```

当我们需要为`light`对象增加一种新的状态时，只需要增加一个新的状态类，再稍稍改变一些现有的代码即可。

```js
// SuperStrongLightState
var SuperStrongLightState = function (light) {
  this.light = light
}

SuperStrongLightState.prototype.buttonWasPressed = function () {
  console.log('关灯')
  this.light.setState(this.light.offLightState) // 状态切换到offLightState
}
```

```js
// 修改StrongLightState
var StrongLightState = function (light) {
  this.light = light
}

StrongLightState.prototype.buttonWasPressed = function () {
  console.log('超强光') // 切换时对应的行为
  this.light.setState(this.light.superStrongLightState) // 状态切换到offLightState
}
```

```js
// 改写Light类
var Light = function () {
  this.offLightState = new OffLightState(this)
  this.weakLightState = new WeakLightState(this)
  this.strongLightState = new StrongLightState(this)
  this.superStrongLightState = new SuperStrongLightState(this)
  this.button = null
}
```

**▼使用抽象类定义状态类**

```js
var State = function () {}

State.prototype.buttonWasPressed = function () {
  throw new Error('父类的buttonWasPressed方法必须被重写')
}

var SuperStrongLightState = function (light) {
  this.light = light
}

SuperStrongLightState.prototype = new State()

SuperStrongLightState.prototype.buttonWasPressed = function () {
  console.log('关灯')
  this.light.setState(this.light.offLightState) // 状态切换到offLightState
}
```

## 总结

### 优缺点

* 优点：
  * 定义了状态与行为之间的关系，并将它们封装在一个类里。通过增加新的状态类，很容易增加新的状态和转换
  * 避免`Context`无限膨胀，状态的逻辑被分布在状态类中，也去掉了`Context`中原本过多的条件分支
  * 用对象代替字符串来记录当前状态，使得状态的切换一目了然
  * `Context`中的请求动作和状态类中封装的行为可以非常容易地独立变化而互不影响
* 缺点：
  * 在系统中增加许多状态类，使得系统会因此增加许多对象
  * 逻辑分散在状态类中，虽然避开了条件分支语句，但也造成了逻辑分散地问题，无法在一个地方就看出整个状态机地逻辑



文章参考：
《JavaScript设计模式与开发实践》