---
title: 【JS设计模式】代理模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-19 13:53:06
---
## 代理模式

代理模式的定义：

> 给某一个对象提供一个代理对象，并由代理对象控制对原对象的引用。

### 举个例子 —— 小明追MM的故事

小明决定给A送花，由于害羞，小明找了认识A的B帮忙完成这件事。

```js
var Flower = function () {}

var xm = {
  sendFlower: (target) => {
    var flower = new Flower()
    target.receiveFlower(flower)
  }
}

var A = {
  receiveFlower: (flower) => {
    console.log('收到花' + flower)
  }
}

xiaoming.sendFlower(A)
```

接下来，我们引入代理B，通过B给A送花。

```js
var B = {
  receiveFlower: (flower) => {
    A.receiveFlower(flower)
  }
}

xiaoming.sendFlower(B)
```

这就是一个简单的代理模式。当然此处的代理模式并没有什么其他的作用，只是的简单地转交给本体。

**▼升级**

假设A心情好时收到花，小明的成功率为60%，而心情差时成功率为0。作为A的好友B，可以监听到A什么时候心情好，然后选择A心情好时帮小明送花，以提高小明的成功率。

```js
var B = {
  receiveFlower: (flower) => {
    A.listenGoodMood(() => {
      A.receiveFlower(flower)
    })
  }
}

var A = {
  receiveFlower: (flower) => {
    console.log('收到花' + flower)
  },
  listenGoodMood (fn) => {
    setTimeout(() => fn, 10000)
  }
}

xiaoming.sendFlower(B)
```

以上这个例子，就体现了代理模式的作用。

## 代理模式的分类

* **保护代理**：控制不同权限的对象对目标对象的访问，但在JavaScript并不容易实现包含代理，因为我们无法判断谁访问了某个对象。
* **虚拟代理**：把一些开销很大的对象，延迟到真正需要它的时候才去创建。就比如上面代理B监听到 A 的好心情时才送花的操作。
* **缓存代理**：为一些开销很大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参数与之前的一致，可以直接返回前面存储的计算结果。
* **防火墙代理**：控制网络资源的访问，保护主题不让“坏人”接近。
* **远程代理**：为一个对象在不同的地址空间提供局部代表，在Java中，远程代理可以是另一个虚拟机中的对象。
* **智能引用代理**：取代了简单额指针，它在访问对象时执行一些附加的操作，比如计算一个对象被引用的次数。
* **写时复制代理**：通常用户复制一个庞大对象的情况。写时复制代理延迟了复制的过程，当对象被真正修改时，才对它进行复制操作。写时复制代理是虚拟代理的一种变体，DLL（操作系统中的动态链接库）是其典型运用场景。

## 代理模式的应用

### 虚拟代理实现图片预加载

创建一个普通的本体对象，这个对象负责往页面中创建一个`img`标签，并且提供一个对外的`setSrc`接口，可以给标签设置`src`属性。

```js
var myImage = (function () {
  var imgNode = document.createElement('img')
  document.body.appendChild(imgNode)
  
  return {
    setSrc: function (src) {
      imgNode.src = src
    }
  }
})()
```

当网速很慢的时候，我们会发现在图片被加载好之前会有一段很长的空白时间。现在我们引入`proxyImage`代理对象，在图片被真正加载好之前，放一张占位的loading.gif来提示用户图片正在加载：

```js
var proxyImage (function () {
  var img = new Image
  img.onload = function () {
    myImage.setSrc(this.src)
  }
  return {
    setSrc: function (src) {
      myImage.setSrc('loading.gif')
      img.src = src
    }
  }
})
```

### 虚拟代理合并HTTP请求

假设我们做一个文件同步的功能，当我们选中一个`checkbox`对象时，它对应的文件就会被同步到另外一台备用服务器上，我们给每个`checkbox`绑定点击事件：

```html
<body>
  <input type="checkbox" id="1" />
  <input type="checkbox" id="2" />
  <input type="checkbox" id="3" />
  <input type="checkbox" id="4" />
  <input type="checkbox" id="5" />
  <input type="checkbox" id="6" />
</body>
```

```js
var synchronousFile = function (id) {
  console.log('开始同步文件，id 为: ' + id)
}

var checkbox = document.getElementsByTagName('input')

for (let i = 0, c; c = checkbox[ i++ ];) {
  c.onclick = function () {
    if (this.checked) {
      synchronousFile(this.id)
    }
  }
}
```

但是如果点击过快的话，就会造成后台频繁的请求，因此可以通过一个代理函数`proxySynchronousFile`来收集一段时间之内的请求，最后一次性发送给服务器：

```js
var proxySynchronousFile = (function () {
  var cache = [],
      timer
  return function (id) {
    cache.push(id)
    if (timer) {
      return
    }
    timer = setTimeout(function () {
      synchronousFile(cache.join(','))
      clearTimout(timer)
      timer = null
      cache.length = 0
    }, 2000)
  }
})
```

### 缓存代理计算乘积

```js
var mult = function () {
  var a = 1
  for (var i = 0, l = arguments.length; i < l; i++) {
    a *= arguments[i]
  }
  return a
}

mult(2,3)
mult(2,3,4)
```

加入缓存代理：

```js
proxyMult = (function () {
  var cache = {}
  return function () {
    var args = Array.prototype.join.call(arguments, ',')
    if (args in chache) {
      return cache[args]
    }
    return cache[args] = mult.apply(this, arguments)
  }
})()
```

### ES6中的Proxy对象

Proxy对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。

简单来说，Proxy对象可以让你对JavaScript中一切合法的对象的基本操作进行**自定义**。用法：

```js
let p = new Proxy(target, handler)
```

**▼例子**

```js
let obj = {
  a: 1,
  b: 2
}

const p = new Proxy(obj, {
  get (target, key, value) {
    if (key === 'c') {
      return '我是一个自定义的结果'
    } else {
      return target
    }
  },
  
  set(target, key, value) {
    if (value === 4) {
      target[key] = '我是自定义的一个结果'
    } else {
      target[key] = value
    }
  }
})

console.log(obj.a) // 1
console.log(obj.c) // undefined
console.log(p.a) // 1
console.log(p.c) // 我是自定义的一个结果

obj.name = '李白'
console.log(obj.name) // 李白
obj.age = 4
console.log(obj.age) // 4
 
p.name = '李白'
console.log(p.name) // 李白
p.age = 4
console.log(p.age) // 我是自定义的一个结果
```

**▼Proxy所能代理的范围**

```js
handler.getPrototypeOf() // 在读取代理对象的原型时触发该操作，比如在执行 Object.getPrototypeOf(proxy) 时
 
handler.setPrototypeOf() // 在设置代理对象的原型时触发该操作，比如在执行 Object.setPrototypeOf(proxy, null) 时
 
handler.isExtensible() // 在判断一个代理对象是否是可扩展时触发该操作，比如在执行 Object.isExtensible(proxy) 时
 
handler.preventExtensions() // 在让一个代理对象不可扩展时触发该操作，比如在执行 Object.preventExtensions(proxy) 时
 
handler.getOwnPropertyDescriptor() // 在获取代理对象某个属性的属性描述时触发该操作，比如在执行 Object.getOwnPropertyDescriptor(proxy, "foo") 时
 
handler.defineProperty() // 在定义代理对象某个属性时的属性描述时触发该操作，比如在执行 Object.defineProperty(proxy, "foo", {}) 时
 
handler.has() // 在判断代理对象是否拥有某个属性时触发该操作，比如在执行 "foo" in proxy 时
 
handler.get() // 在读取代理对象的某个属性时触发该操作，比如在执行 proxy.foo 时
 
handler.set() // 在给代理对象的某个属性赋值时触发该操作，比如在执行 proxy.foo = 1 时
 
handler.deleteProperty() // 在删除代理对象的某个属性时触发该操作，比如在执行 delete proxy.foo 时
 
handler.ownKeys() // 在获取代理对象的所有属性键时触发该操作，比如在执行 Object.getOwnPropertyNames(proxy) 时
 
handler.apply() // 在调用一个目标对象为函数的代理对象时触发该操作，比如在执行 proxy() 时
 
handler.construct() // 在给一个目标对象为构造函数的代理对象构造实例时触发该操作，比如在执行new proxy() 时
```

文章参考：
《JavaScript设计模式与开发实践》