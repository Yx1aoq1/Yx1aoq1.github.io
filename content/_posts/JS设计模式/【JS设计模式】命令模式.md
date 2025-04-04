---
title: 【JS设计模式】命令模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-21 14:07:17
---
## 命令模式

命令模式的定义：

> 用于将一个请求封装成一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或者记录请求日志，以及执行可撤销的操作。

命令模式最常见的**应用场景**是：有时候需要向某些对象发送请求，但是并不知道请求的接收者是谁，也不知道被请求的操作是什么。**此时希望用一种松耦合的方式来设计程序，使得请求发送者和请求接收者能够消除彼此之间耦合的关系**。

例如客人向一个餐厅订餐，需要向厨师发出请求，但是完全不知道这些厨师的名字和联系方式，也不知道厨师炒菜的方法和步骤。命令模式把客人的订单请求封装成一个`command`对象，也就是订餐中的订单，订单通过服务员传给厨师，厨师便知道了自己需要做什么菜，怎么安排。这样一来，客人就不必知道厨师的名字，从而解开了请求调用者和请求接收者之间的耦合关系。

### 举个例子 —— 菜单程序

假设有一个用户界面，上面有许多的Button，每个Button对应不同的操作。

```html
<body>
  <button id="button1">按钮1</button>
  <button id="button2">按钮2</button>
  <button id="button3">按钮3</button>
</body>
<script>
  var button1 = document.getElementById('button1')
  var button2 = document.getElementById('button2')
  var button3 = document.getElementById('button3')
</script> 
```

我们为每个菜单绑定一个不同的事件：

**▼简单的做法**

```js
var bindClick = function (button, fn) {
  button.onclick = fn
}

var MenuBar = {
  refresh: function () {
    console.log('刷新菜单界面')
  }
}

var SubMenu = {
  add: function () {
    console.log('增加子菜单')
  },
  delete: function () {
    console.log('删除子菜单')
  }
}

bindClick(button1, MenuBar.refresh)
bindClick(button2, SubMenu.add)
bindClick(button3, SubMenu.delete)
```

**▼使用命令模式**

```js
var setCommand = function (button, command) {
  button.onclick = function () {
    command.execute()
  }
}

var MenuBar = {
  refresh: function () {
    console.log('刷新菜单界面')
  }
}

var RefreshMenuBarCommand = function (receiver) {
  return {
  	execute: function () {
      receiver.refresh()
    }
  }
}

var refreshMenuBarCommand = RefreshMenuBarCommand(MenuBar)

setCommand(button1, refreshMenuBarCommand)
```

对比以上的两种实现方法，会发现，命令模式引入了`command`对象和`receiver`这两个无中生有的对象，把简单的事情复杂化了。但是如果我们把“绑定菜单事件”作为一个客户操作，第一个实现方式中，你必须清楚的知道`MenuBar`内部的方法。而在命令模式中，则通过`RefreshMenuBarCommand`做了内部的处理，客户只需要使用`RefreshMenuBarCommand`，而并不需要知晓`MenuBar`中用什么方式来实现。

## 命令模式的应用

### 撤销命令

在之前的策略模式中实现了一个`Animate`动画，假设页面上有一个`input`输入框与一个`button`按钮，在输入框中输入数字，并点击按钮后，页面上的小球就会水平移动输入的距离。

```html
<body>
  <div id="ball" style="position:absolute;background:#000;width:50px;height:50px;"></div>
  输入小球移动后的位置：<input id="pos" />
  <button id="moveBtn">开始移动</button>
  <button id="undoBtn">撤销</button>
</body>
```

此时，我们希望增加一个“撤销”按钮，点击后小球将还原到移动前的位置：

**▼使用命令模式**

```js
var ball = document.getElementById('ball')
var pos = document.getElementById('pos')
var moveBtn = document.getElementById('moveBtn')
var undoBtn = document.getElementById('undoBtn')

var MoveCommand = function (receiver, pos) {
  this.receiver = receiver
  this.pos = pos
  this.oldPos = null
}

MoveCommand.prototype.execute = function () {
  this.receiver.start('left', this.pos, 1000, 'strongEaseOut')
  this.oldPos = this.receiver.dom.getBoundingClientRect()[this.receiver.propertyName]
}

MoveCommand.prototype.undo = function () {
  this.receiver.start('left', this.oldPos, 1000, 'strongEaseOut')
}

var moveCommand

moveBtn.onclick = function () {
  var animate = new Animate(ball)
  moveCommand = new MoveCommand(animate, pos.value)
  moveCommand.execute()
}

undoBtn.onclick = function () {
  moveCommand.undo()
}
```

### 撤销与重做

上面的例子是如何撤销一个命令，但很多时候，我们需要撤销的是一系列命令。比如一个围棋程序，现在已下了10步棋，我们想悔棋到第5步，我们可以把所有执行过的命令都存储在一个历史列表中，然后倒叙循环来依次执行这些命令的`undo`操作，直到循环执行到第5步。

然而，在某些情况下无法顺利地利用`undo`操作让对象回到`execute`之前地状态，比如在一个Canvas画图地程序中，很难为命令对象定义一个擦除某条曲线的`undo`操作。**这个时候最好的办法是先清除画布，然后把执行过的命令再重新执行一遍**。这是逆转不可逆命令的一个好办法。

### 其他命令

* **宏命令**：一组命令的集合，通过执行宏命令的方式，可以一次执行一批命令。
* **智能命令**：不需要接收者存在的命令，即不需要向命令对象传参数`receiver。`
* **傻瓜命令**：与智能命令相对应，即需要`receiver`参数的命令。并且只负责把客户的请求转交给接收者来执行，目的是让请求发起者和请求接收者之间解耦。

文章参考：
《JavaScript设计模式与开发实践》