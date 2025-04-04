---
title: 【JS设计模式】策略模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-18 17:58:05
---
## 策略模式

在程序设计中，我们常常遇到一种情况：要实现某一个功能，有多种方案可以选择。针对不同的情况，使用不同的方案。要解决这个问题，就会使用到策略模式。

策略模式的定义：

> 定义一系列的算法，把它们一个个封装起来，并且使它们可以互相替换。

### 举个例子 —— 发奖金

假设绩效分为A、B、C、D四个等级，绩效A的可以获得1.75倍工资，B获得1.5倍，C获得1倍，D获得0.5倍。下面实现一个计算绩效金额的函数：

```js
function calcBonus (level, salary) {
  switch (level) {
    case 'A':
      return 2 * salary
    case 'B':
      return 1.75 * salary
    case 'C':
      return salary
    case 'D':
      return 0.5 * salary
  }
}

calcBonus('A', 5000) // 10000
```

这段代码简单，但存在几个问题：

* 代码量庞大，需要覆盖所有的绩效等级，这样就要写很多case
* 缺乏扩展性，假设增加一个绩效等级，或者调整等级系数，需要修改内部方法
* 算法复用性差，如果在程序其他地方使用，只能复制粘贴

**▼改进-1**

```js
function performanceA (salary) {
  return 2 * salary
}

function performanceB (salary) {
  return 1.75 * salary
}

function performanceC (salary) {
  return salary
}

function performanceD (salary) {
  return 0.5 * salary
}

function calcBonus (level, salary) {
  switch (level) {
    case 'A':
      return performanceA(salary)
    case 'B':
      return performanceB(salary)
    case 'C':
      return performanceC(salary)
    case 'D':
      return performanceD(salary)
  }
}

calcBonus('A', 5000) // 10000
```

上面这段代码，把绩效的计算算法抽了出来，解决了复用性问题，其他地方可以直接拿去计算某个等级的绩效。但依然没有解决扩展和代码量的问题。

**▼改进-2**

```js
let performanceA =  function () {}

performanceA.prototype.calculate = (salary) => {
  return 2 * salary
}

let Bonus = () => {
  this.salary = null
  this.strategy = null
}

Bonus.prototype.setSalary = (salary) => {
  this.salary = salary
}

Bonus.prototype.setStrategy = (strategy) => {
  this.strategy = strategy
}

Bonus.prototype.getBonus = () => {
  // 把计算奖金的操作委托给对应的策略对象
  return this.strategy.calculate(this.salary)
}

// 计算
let bonus = new Bonus() 
bonus.setSalary(5000)
bonus.setStrategy(new performanceA())
// bonus本身没有能力计算，而是把请求委托给了之前设置的的策略对象
bonus.getBonus()
```

策略模式的目的就是**将算法的使用与算法的实现分离开来**。一个基于策略模式的程序至少由两部分组成，一部分是一组策略类，策略类封装了具体的算法，并负责具体的计算过程。第二个部分是环境类Context，Context接受客户的请求，随后把请求委托给某一个策略类。

当然我们可以对上面的代码进行简化：

```js
let strategies = {
  'A': (salary) => {
    return 2 * salary
  }
}

let calcBonus = (level, salary) => {
  return strategies[level](salary)
}
```

## 策略模式的应用

### 缓动动画 

**▼动画原理**

把一些差距不大的原画以较块的帧数播放，来达到视觉上的动画效果。

**▼JavaScript如何实现帧数播放**

在 JavaScript中，可以通过连续改变元素的某个CSS属性，比如 left 、 top 、 background-position 来实现动画效果。

**▼实现代码**

```js
/**
 * 策略类
 * @param {number} t 动画已消耗的时间
 * @param {number} b 小球的原始位置
 * @param {number} c 小球的目标位置
 * @param {number} d 动画持续的总时间
 */
let tween = {
  linear: (t, b, c, d) => {
    return c * t / d + b
  },
  easeIn: (t, b, c, d) => {
    return c * ( t /= d ) * t + b
  },
  strongEaseIn: (t, b, c, d) => {
    return c * ( t /= d ) * t * t * t * t + b
  },
  strongEaseOut: (t, b, c, d) => {
    return c * ( ( t = t / d - 1) * t * t * t * t + 1 ) + b
  },
  sineaseIn: (t, b, c, d) => {
    return c * ( t /= d) * t * t + b
  },
  sineaseOut: (t, b, c, d) => {
    return c * ( ( t = t / d - 1) * t * t + 1 ) + b
  }
}
```

```js
// 定义Animate类
class Animate {
  constructor (dom) {
    this.dom = dom // 进行运动的dom节点
    this.startTime = 0 // 动画开始时间
    this.startPos = 0 // 动画开始时，dom节点的初始位置
    this.endPos = 0 // 动画结束后，dom节点的目标位置
    this.propertyName = null // dom节点需要倍改变的css属性名
    this.easing = null // 缓动算法
    this.duration = null // 动画持续时间
  }
  
  start (propertyName, endPos, duration, easing) {
    this.startTime = +new Date()
    this.startPos = this.dom.getBoundingClientRect()[ propertyName ]
    this.propertyName = propertyName
    this.endPos = endPos
    this.duration = duration
    this.easing = tween[ easing ]
    const timer = setInterval(() => { // 启动定时器，开始执行动画
      if (this.step() === false) { // 如果动画已结束，则清除定时器
        clearInterval(timer)
      }
    }, 19)
  }
  
  step () {
    const t = +new Date()
    if (t >= this.startTime + this.duration) {
      this.update(this.endPos)
      return false
    }
    const pos = this.easing(t - this.startTime, this.startPos, this.endPos - this.startPos, this.duration)
    this.update(pos)
  }
  
  update (pos) {
    this.dom.style[this.propertyName] = pos + 'px'
  }
}
```

```js
// 动画演示
const div = document.getElementById('div')
const animate = new Animate(div)
animate.start('left', 500, 1000, 'strongEaseOut')
```

### 表单校验

假设有一个注册页面，点击注册按钮，需要校验如下几条逻辑：

* 用户名不能为空
* 密码长度不能少于6位
* 手机号码必须符合格式

```html
<html>
  <body>
    <form action="http://xxx.com/register" id="registerForm" method="post">
      请输入用户名：<input type="text" name="userName" />
      请输入密码：<input type="password" name="password" />
      请输入手机号码：<input type="text" name="phoneNumber" />
      <button>提交</button>
    </form>
    <script>
    	var registerForm = document.getElementById('registerForm')
      registerForm.onsubmit = function () {
        if (registerForm.userName.value === '') {
          alert('用户名不能为空')
          return false
        }
        if (registerForm.password.value.length < 6) {
          alert('密码长度不能少于 6 位')
          return false
        }
        if (!/(^1[3|5|8][0-9]{9}$)/.test( registerForm.phoneNumber.value )) {
          alert ('手机号码格式不正确')
          return false
        }
      }
    </script>
  </body>
</html>
```

这是实现需求的最简单的方式，但是它存在一些问题：

* `registerForm.onsubmit`函数比较庞大，包好了许多`if-else`语句，这些语句需要覆盖所有的校验规则
* `registerForm.onsubmit`函数缺乏弹性，如果增加了一种新的校验规则，或者想把密码的长度校验从6改成8，都必须改动到内部代码，违反了开放-封闭原则
* 算法复用性差，如果在其他地方有相同的校验，则只能将这段代码复制过去

**▼使用策略模式优化**

```js
// 校验规则抽成策略类
var strategies = {
  isNonEmpty: function (value, errorMsg) { // 不为空
    if (value === '') {
      return errorMsg
    }
  },
  minLength: function (value, length, errorMsg) { // 限制最小长度
    if (value.length < length) {
      return errorMsg
    }
  },
  isMobile: function (value, errorMsg) { // 手机号码格式
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
      return errorMsg
    }
  }
}
// Validator类
var Validator = function () {
  this.cache = []
}

Validator.prototype.add = function (dom, rule, errorMsg) {
  // rule 为 策略名称:策略参数 的格式
  var ary = rule.split(':')
  this.cache.push(function () {
    var strategy = ary.shift()
    ary.unshift(dom.value)
    ary.push(errorMsg)
    // ary = [dom.value, strategyParams, errorMsg]
    return strategies[strategy].apply(dom, ary)
  })
}

Validator.prototype.start = function () {
  for (var i = 0, validatorFunc; validatorFunc = this.cache[ i++ ];) {
    var msg = validatorFunc()
    if (msg) {
      return msg
    }
  }
}
// 使用环境
var validateFunc = function () {
  var validator = new Validator()
  
  validator.add(registerForm.userName, 'isNonEmpty', '用户名不能为空')
  validator.add(registerForm.password, 'minLength:6', '密码长度不能少于6')
  validator.add(registerForm.phoneNumber, 'isMobile', '手机号码格式不正确')
  
  var errorMsg = validator.start()
  return errorMsg
}

var registerForm = document.getElementById('registerForm')
registerForm.onsubmit = function () {
  var errorMsg = validateFunc()
  if (errorMsg) {
    alert(errorMsg)
    return false
  }
}
```

使用策略模式重构代码之后，我们仅仅通过“配置”的方式就可以完成一个表单的校验，这些校验规则可以复用在程序的任何地方，还能作为插件的形式，方便地移植到其他项目中。

**▼进阶——同时校验多个规则**

```js
// 修改Validator类
var Validator = function () {
  this.cache = []
}

Validator.prototype.add = function (dom, rules) {
  var self = this
  for (var i = 0, rule; rule = rules[ i++ ];) {
    (function (rule) {
      // rule 为 策略名称:策略参数 的格式
      var strategyAry = rule.strategy.split(':')
      var errorMsg = rule.errorMsg
      self.cache.push(function () {
        var strategy = strategyAry.shift()
        strategyAry.unshift(dom.value)
        strategyAry.push(errorMsg)
        // strategyAry = [dom.value, strategyParams, errorMsg]
        return strategies[strategy].apply(dom, strategyAry)
      })
    })(rule)
  }
}

Validator.prototype.start = function () {
  for (var i = 0, validatorFunc; validatorFunc = this.cache[ i++ ];) {
    var msg = validatorFunc()
    if (msg) {
      return msg
    }
  }
}
// 使用环境
var validateFunc = function () {
  var validator = new Validator()
  
  validator.add(registerForm.userName, [{
    strategy: 'isNonEmpty',
    errorMsg: '用户名不能为空'
  }, {
    strategy: 'minLength:10',
    errorMsg: '用户名长度不能小于10位'
  }])
  
  var errorMsg = validator.start()
  return errorMsg
}

var registerForm = document.getElementById('registerForm')
registerForm.onsubmit = function () {
  var errorMsg = validateFunc()
  if (errorMsg) {
    alert(errorMsg)
    return false
  }
}
```

## 总结

### 优缺点

* 优点：
  * 利用组合、委托和多态等技术和思想，可以有效避免多重条件的选择语句
  * 提供了开放-封闭原则的完美支持，将算法封装在独立的strategy中，使得它们易于切换、理解与扩展
  * 利用组合和委托来让Context拥有执行算法的能力，这也是继承的一种更轻便的代替方案
* 缺点：
  * 使用策略模式会在程序中增加许多策略类或策略对象
  * 必须了解所有的strategy，才能正确的选择一个合适的strategy。而向客户暴露strategy的实现方式是违反最少知识原则的

文章参考：
《JavaScript设计模式与开发实践》