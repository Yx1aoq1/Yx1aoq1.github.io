---
title: 【JS设计模式】享元模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-24 14:42:55
---
## 享元模式

享元模式的定义：

> 运用共享技术，有效地支持大量地细粒度的对象，以避免对象之间拥有相同内容而造成多余的性能开销。享元模式是一种用时间换空间的优化模式。

### 举个例子 —— 内衣工厂

假设有个内衣工厂，目前的产品有50种男士内衣和50种女士内衣，为了推销产品，工厂决定生产一些塑料模特来穿上他们的内衣拍成广告照片。正常情况下需要50个男模特和50个女模特，然后让他们每人分别穿上一件内衣来拍照。

**▼普通情况的实现**

```js
var Modal = function (sex, underwear) {
  this.sex = sex
  this.underwear = underwear
}

Modal.prototype.takePhoto = function () {
  console.log('sex=' + this.sex + ' underwear=' + this.underwear)
}

for (let i = 0; i <= 50; i ++) {
  var maleModal = new Modal('male', 'underwear' + i)
  maleModal.takePhoto()
}

for (let i = 0; i <= 50; i ++) {
  var femaleModel = new Modal('female', 'underwear' + i)
  femaleModel.takePhoto()
}
```

由于每有一种内衣，就需要一个对应的对象，如果有非常多的内衣种类，那么产生非常多的对象，就会使程序崩溃。但是很显然，我们并不需要那么多的模特来各穿一种内衣，只需要有一个男模特和女模特，然后每次更换他们身上的内衣就可以了。这便是享元模式的思想。

**▼使用享元模式**

```js
var Modal = function (sex) {
  this.sex = sex
}

Modal.prototype.takePhoto = function () {
  console.log('sex=' + this.sex + ' underwear=' + this.underwear)
}
// 创建一个男模特和女模特
var maleModal = new Modal('male')
var femaleModal = new Modal('female')
// 给男模特依次穿上所有男装并拍照
for (let i = 0; i <= 50; i ++) {
  maleModal.underwear = 'underwear' + i
  maleModal.takePhoto()
}
// 给女模特依次穿上所有女装并拍照
for (let i = 0; i <= 50; i ++) {
  femaleModal.underwear = 'underwear' + i
  femaleModal.takePhoto()
}
```

### 使用享元模式

享元模式要求将对象的属性划分为内部状态与外部状态（即属性）。享元模式的目标是尽量减少共享对象的数量，而如何划分内部状态与外部状态，可以参考以下经验：

* 内部状态存储于对象内部
* 内部状态可以被一些对象共享
* 内部状态独立于具体的场景，通常不会改变
* 外部状态取决于具体的场景，并根据场景而变化，外部状态不能被共享

剥离了外部状态的对象成为共享对象，外部状态在必要时被传入共享对象来组装成一个完整的对象。虽然组装外部状态的过程需要花费一定的时间，但是可以大大减少系统中的对象数量。因此，**享元模式是一种用时间换空间的优化模式**。

但是上面的例子中的`Modal`还不是一个完整的享元模式，它还存在以下两个问题：

* 我们通过构造函数显式`new`出了男女两个`modal`对象，而在其他系统中，也许并不是一开始就需要所有的共享对象的
* 给`modal`对象手动设置了`underwear`外部状态，在更复杂的系统中，这不是一个最好的方式，因为外部状态可能会相当复杂，他们与共享对象的联系会变得困难

我们可以通过一个对象工厂来解决第一个问题，只有当某种共享对象真正被需要时，它才从工厂中被创建出来。对于第二个问题，可以用一个管理器来记录对象相关的外部状态，使这些外部状态通过某个钩子与共享对象联系起来。

### 完整例子 —— 文件上传

现有一个文件上传功能，可以选择依次排队上传，也可以一次性选择多个文件上传。每个文件都对应一个JavaScript上传对象的创建，可想而知，如果一次性选择了上千个文件同时上传，那么不可避免地就要出现页面卡死地情况了。

**▼普通情况的实现**

```js
var Upload = function (uploadType, fileName, fileSize) {
  this.uploadType = uploadType
  this.fileName = fileName
  this.fileSize = fileSize
  this.dom = null
}

Upload.prototype.init = function (id) {
  var that = this
  this.id = id
  this.dom = document.createElement('div')
  this.dom.innerHTML = `<span>文件名称：${this.fileName}，文件大小：${this.fileSize}</span><button class="delFile">删除</button>`
  this.dom.querySelector('.delFile').onClick = function () {
    this.delFile()
  }
  document.body.appendChild(this.dom)
}

Upload.prototype.delFile = function () {
  if (this.fileSize < 3000) {
    return this.dom.parentNode.removeChild(this.dom)
  }
  
  if (window.confirm('确定删除该文件吗？' + this.fileName)) {
    return this.dom.parentNode.removeChild(this.dom)
  }
}

var startUpload = function (uploadType, files) {
  for (let i = 0, file; file = files[i++];) {
    var uploadObj = new Upload(uploadType, file.fileName, file.fileSize)
    uploadObj.init(uuid)
  }
}
```

**▼使用享元模式**

```js
var Upload = function (uploadType) {
  this.uploadType = uploadType // 内部状态
}
// Upload.prototype.init 函数也不再需要，因为 upload 对象初始化的工作被放在了 uploadManager.add 函数里面，接下来只需要定义 Upload.prototype.del 函数即可
Upload.prototype.delFile = function (id) {
  // uploadManager.setExternalState 方法给共享对象设置正确的 fileName 与 fileSize
  uploadManager.setExternalState(id, this)
  if (this.fileSize < 3000) {
    return this.dom.parentNode.removeChild(this.dom)
  }
  
  if (window.confirm('确定删除该文件吗？' + this.fileName)) {
    return this.dom.parentNode.removeChild(this.dom)
  }
}

// 定义一个工厂来创建Upload对象
var UploadFactory = (function () {
  var createdflyWeightObjs = {}
  
  return {
    create: function (uploadType) {
      if (createdFlywightObj[uploadType]) {
        return createdflyWeightObjs[uploadType]
      }
      return createdflyWeightObjs[uploadType] = new Upload(uploadType)
    }
  }
})()

// 管理器封装外部状态
var uploadManager = (function () {
  var uploadDatabase = {}
  
  return {
    add: function (id, uploadType, fileName, fileSize) {
      var flyWeightObj = UploadFactory.create(uploadType)
      var dom = document.createElement('div')
      dom.innerHTML = `<span>文件名称：${this.fileName}，文件大小：${this.fileSize}</span><button class="delFile">删除</button>`
      dom.querySelector('.delFile').onClick = function () {
        flyWeightObj.delFile(id)
      }
      document.body.appendChild(dom)
      
      uploadDatabase[id] = {
        fileName,
        fileSize,
        dom
      }
      
      return flyWeightObj
    },
    setExternalState: function (id, flyWeightObj) {
      var uploadData =  uploadDatabase[id]
      for (let i in uploadData) {
        flyWeightObj[i] = uploadData[i]
      }
    }
  }
})()

// 上传文件函数
var startUpload = function (uploadType, files) {
  for (let i = 0, file; file = files[i++];) {
    var uploadObj = uploadManager.add(uuid, uploadType, file.fileName, file.fileSize)
  }
}
```

## 总结

享元模式是一种很好地性能优化方案，但它也会带来一些复杂性问题（例如前面例子中增加了`factory`对象与`manager`对象），在大部分不必要使用享元模式地环境下，这些开销是可以避免的。

### 使用享元模式的前置条件

* 一个程序中使用了大量相似的对象
* 由于使用了大量对象，造成很大的内存开销
* 对象的大多数状态都可以变为外部状态
* 剥离出对象的外部状态之后，可以用相对较少的共享对象取代大量对象

对于一些小型程序中，**如果性能与内存的消耗对程序执行的影响不大时，使用享元模式往往会增加代码逻辑的复杂性**，往往会收到负面效果。

### 对象池

对象池也是一种性能优化方案，其跟享元模式有一些相似之处，但没有分离内部状态和外部状态的过程。

```js
// 对象池工厂函数
var objectPoolFactory = function (createObjFn) {
  var objectPool = []
  
  return {
    create: function () {
      var obj = objectPool.length === 0
      	? createObjFn.apply(this, arguments)
      	: objectPool.shift()
    },
    recover: function (obj) {
      objectPool.push(obj)
    }
  }
}
// objectPoolFactory 来创建一个装载一些 iframe 的对象池
var iframeFactory = objectPoolFactory(function () {
  var iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  iframe.onload = function () {
    iframe.onload = null // 防止iframe重复加载的bug
    iframeFactory.recover(iframe) // iframe 加载完成之后回收节点
  }
  return iframe
})

var iframe1 = iframeFactory.create()
iframe1.src = 'http://baidu.com'
var iframe2 = iframeFactory.create()
iframe2.src = 'http://QQ.com'
setTimeout(function () {
  var iframe3 = iframeFactory.create()
  iframe3.src = 'http://163.com'
 }, 3000)
```

运行代码后会发现，`iframe3`使用的是`iframe1`加载完成后回收的iframe节点，页面最后只创建了两个`iframe`。

![image-20200824144159559](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20200824144159559.png)

文章参考：
《JavaScript设计模式与开发实践》