---
title: 【JS设计模式】职责链模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-25 16:10:41
---
## 职责链模式

职责链模式的定义：

> 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，值到有一个对象处理它为止。

### 举个例子 —— 电商网优惠券

假设我们负责一个售卖手机的电商网站，经过分别交纳500元定金和200元定金的两轮预订后（订单已在此时生成），现在已经到了正式购买的阶段。

公司针对支付过定金的用户有一定的优惠政策。在正式购买后，已经支付过500元定金的用户会收到100元的商城优惠券，200元定金的用户可以收到50元的优惠券，而之前没有支付定金的用户只能进入普通购买模式，也就是没有优惠券，且在库存有限的情况下不一定保证能买到。

**▼普通情况的实现**

```js
/**
 * @param {number} orderType 订单类型
 * @param {boolean} pay 是否已经支付定金
 * @param {number} stock 用于普通购买的手机库存数量
 */
var order = function (orderType, pay, stock) {
  if (orderType === 1) {
    if (pay) {
      console.log('500 元定金预购, 得到 100 元优惠券')
    } else { // 未支付定金，降级到普通模式
      if (stock > 0) { // 用于普通购买的手机还有库存
        console.log('普通购买，无优惠券')
      } else {
        console.log('手机库存不足')
      }
    }
  } else if (orderType === 2) {
    if (pay) {
      console.log('200 元定金预购, 得到 50 元优惠券')
    } else {
      if (stock > 0) {
        console.log('普通购买，无优惠券')
      } else {
        console.log('手机库存不足')
      }
    }
  } else if (orderType === 3) {
    if (stock > 0) {
      console.log('普通购买，无优惠券')
    } else {
      console.log('手机库存不足')
    }
  }
}

order(1, true, 500) // 输出： 500 元定金预购, 得到 100 优惠券
```

可以发现以上的代码存在缺陷：

* 代码量巨大而且`if...else`判断过多过于复杂

* 后续的维护性差，如果想增加一种优惠模式就得在其中再加上一段`if..else`

**▼使用职责链模式重构**

```js
var order500 = function (orderType, pay, stock) {
  if (oderType === 1 && pay) {
    console.log('500 元定金预购, 得到 100 元优惠券')
  } else {
    order200(orderType, pay, stock) // 将请求传递给 200 元订单
  }
}

var order200 = function (orderType, pay, stock) {
  if (oderType === 2 && pay) {
    console.log('200 元定金预购, 得到 50 元优惠券')
  } else {
    orderNormal(orderType, pay, stock) // 将请求传递给普通订单
  }
}

var orderNormal = function (orderType, pay, stock) {
  if (stock > 0) {
    console.log('普通购买，无优惠券')
  } else {
    console.log('手机库存不足')
  }
}

order(1, true, 500) // 输出： 500 元定金预购, 得到 100 优惠券
```

可以看到重构之后的代码结构比原来清晰了许多，去掉了许多嵌套的条件分支语句。但是任然存在问题：请求再链条传递中的顺序非常僵硬，传递请求的代码被耦合再了业务函数中。这依然违反了开放-封闭原则。

```js
var order500 = function (orderType, pay, stock) {
  if (oderType === 1 && pay) {
    console.log('500 元定金预购, 得到 100 元优惠券')
  } else {
    order200(orderType, pay, stock) // order200 和 order500 耦合在一起
  }
}
```

**▼灵活可拆分的职责链节点**

```js
var order500 = function (orderType, pay, stock) {
  if (oderType === 1 && pay) {
    console.log('500 元定金预购, 得到 100 元优惠券')
  } else {
    return 'nextSuccessor' // 我不知道下一个节点是谁，反正把请求往后面传递
  }
}

var order200 = function (orderType, pay, stock) {
  if (oderType === 2 && pay) {
    console.log('200 元定金预购, 得到 50 元优惠券')
  } else {
    return 'nextSuccessor'
  }
}

var orderNormal = function (orderType, pay, stock) {
  if (stock > 0) {
    console.log('普通购买，无优惠券')
  } else {
    console.log('手机库存不足')
  }
}

// 定义构造函数Chain，负责链式传递
var Chain = function (fn) {
  this.fn = fn
  this.successor = null
}

Chain.prototype.setNextSuccessor = function (successor) {
  return this.successor = successor
}

Chain.prototype.passRequest = function () {
  var ret = this.fn.apply(this, arguments)
  
  if (ret === 'nextSuccessor') {
    return this.successor && this.successor.passRequest.apply(this.successor, arguments)
  }
  
  return ret
}
```

```js
// 包装节点
var chainOrder500 = new Chain(order500)
var chainOrder200 = new Chain(order200)
var chainOrderNormal = new Chain(orderNormal)
// 指定节点在职责链中的顺序
chainOrder500.setNextSuccessor(chainOrder200)
chainOrder200.setNextSuccessor(chainOrderNormal)
// 使用
chainOrder500.passRequest(1, true, 500) // 输出： 500 元定金预购, 得到 100 优惠券
```

通过更改，我们可以自由灵活地增加、移除和修改链中地节点顺序，假设某天网站运营人员又想出了支持300元地定金购买，那么我们就在该链中增加一个节点即可：

```js
var order300 = function () {
  // 具体实现
}

var chainOrder300 = new Chain(order300)
chainOrder500.setNextSuccessor(chainOrder300)
chainOrder300.setNextSuccessor(chainOrder200)
```

**▼异步地职责链**

在异步地场景中，很明显`ret === 'nextSuccessor'`这种判断方式是无用的。所以要给`Chain`类再增加一个原型方法`next`，表示手动传递请求给职责链的下一个节点。

```js
Chain.prototype.next = function () {
  return this.successor && this.successor.passRequest.apply(this.successor, arguments)
}
```

```js
var fn1 = new Chain(function () {
  console.log(1)
  return 'nextSuccessor'
})

var fn2 = new Chain(function () {
  console.log(2)
  var self = this
  setTimeout(function () {
    self.next()
  }, 1000)
})

var fn3 = new Chain(function () {
  console.log(3)
})

fn1.setNextSuccessor(fn2).setNextSuccessor(fn3)
fn1.passRequest()
```

**▼用AOP实现职责链** 

```js
Function.prototype.after = function (fn) {
  var self = this
  return function () {
    var ret = self.apply(this, arguments)
    if (ret === 'nextSuccessor') {
      return fn.apply(this, arguments)
    }
    
    return ret
  }
}

var order = order500.after(order200).after(orderNormal)
order( 1, true, 500 ) // 输出：500 元定金预购，得到 100 优惠券
```

## 总结

### 优缺点

* 优点

  * 分离各自条件函数，使每个条件的处理都互不影响

  * 可以灵活地拆分重组，有利于维护

  * 可以手动指定起始节点，请求并不是非得从链中的第一个节点开始传递

* 缺点
  * 不能保证某个请求一定会被链中的节点处理。在这种情况下，我们可以在链尾增加一个保底的接受者节点来处理这种即将离 开链尾的请求
  * 职责链使得程序中多了一些节点对象，可能再某一次的请求传递过程中，大部分节点并没有起到实质性作用。从性能方面考虑，我们要避免过长的职责链带来的性能损耗。

文章参考：
《JavaScript设计模式与开发实践》