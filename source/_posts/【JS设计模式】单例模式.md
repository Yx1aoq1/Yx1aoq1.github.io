---
title: 【JS设计模式】单例模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-17 15:38:56
---
## 单例模式

单例模式的定义：

> 保证一个类权仅有一个实例，并提供一个访问它的全局访问点。

## 实现单例模式

**核心思想**：用变量标记当前是否已经为某个类创建过对象，如果是，在下次获取该类实例时直接返回之前创建的对象。

### 例子-1

```js
const Singleton = function (name) {
  this.name = name
  this.instance = null
}

Singleton.prototype.getName = function (name) {
  alert(this.name)
}

Singleton.getInstance = function (name) {
  if (!this.instance) {
    this.instance = new Singleton(name)
  }
  return this.instance
}

const a = Singleton.getInstance('sven1')
const b = Singleton.getInstance('sven2')

console.log(a === b) // true
```

* 优点：实现简单
* 缺点：增加了类的“不透明性”，`Singleton`类的使用者必须知道这是一个单例类，跟以往通过`new xxx`的方式来获取对象不同，这里得用`Singleton.getInstance`来获取对象。

### 例子-2（透明的单例模式）

```js
let Singleton = (function () {
  let instance
  let Singleton = function (name) {
    if (instance) {
      return instance
    }
    this.name = name
    return instance = this
  }
  
  return Singleton
})()

const a = new Singleton('sven1')
const b = new Singleton('sven2')

console.log(a === b) // true
```

* 优点：实现了透明性
* 缺点：不符合“单一职责原则”，`Singleton`不仅负责了创建对象、还负责了赋值操作`this.name = name`。

### 例子-3（用代理实现单例模式）

```js
const Singleton = function (name) {
  this.name = name
}

const ProxySingleton = (function () {
  let instance
  return function (name) {
    if (!instance = new ) {
      instance = new Singleton(name)
    }
    
    return instance
  }
})()

const a = new ProxySingleton('sven1')
const b = new ProxySingleton('sven2')

console.log(a === b) // true
```

* 优点：符合“单一职责原则”

## JavaScript中的单例模式

对于传统的面向对象语言，单例对象从“类”中创建而来。需要某个对象，就必须先定义一个类，对象总是从类中创建而来。但是JavaScript是一门无类语言，所以我们只需要**创建一个“唯一”的对象**。

全局变量虽然不是单例模式，但在JavaScript开发中，我们经常会把全局变量当成单例来使用，因为其符合“**只有一个实例，并提供全局访问**”的条件。但是全局变量存在很多问题，它很容易造成**命名空间污染**。

**减少命名污染的方式**：

* 使用命名空间

```js
var MyApp = {}

MyApp.namespace = function (name) {
  var parts = name.split('.')
  var current = MyApp
  for (let i in parts) {
    if (!current[parts[i]]) {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }
}
// 创建命名空间
MyApp.namespace('event')
MyApp.namespace('dom.style')

console.dir(MyApp) // { namespace: [Function], event: {}, dom: { style: {} } }
```

* 使用闭包封装私有变量

```js
var user = (function () {
  var __name = 'sven',
      __age = 29
  return {
    getUserInfo: function () {
      return __name + '-' + __age
    }
  }
})()
```

文章参考：
《JavaScript设计模式与开发实践》