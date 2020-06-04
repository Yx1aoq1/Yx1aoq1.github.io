---
title: DOM基础知识巩固
date: 2017-10-02 13:15:36
categories: 
  - Web基础
tags: 
  - DOM
  - BOM
  - HTML
---
## DOM本质
DOM（Document Object Model）是浏览器将文档转换成的一个树形对象模型，使之能够识别并且进行js操作。

## DOM节点操作

### 获取DOM节点

* `document.getElementById`
* `document.getElementsByTagName`
* `document.getElementsByClassName`
* `document.querySelectorAll`

### property与attribute

虽然property与attribute两者皆可翻译为“属性”，但二者的本质实际上是有很大区别的。

* property是DOM中的属性，是JavaScript里的对象；
* attribute是HTML标签上的特性，它的值只能够是字符串；

例如在html中有一段这样的代码：
```html
<input id="test" value="1" sth="whatever">
```
我们在js中来获取这个DOM对象：
```javascript
var test = document.getElementById('test');
console.log(test);
console.log(test.id); // 'test'
console.log(test.value); // 1
console.log(test.sth) // undefined
```
由于每一个DOM对象都会有它的默认的基本属性，在创建的时候只会创建这些基本属性，自定义的属性是不会直接放在DOM中的。对比一下的代码：
```html
<input id="test-2" >
```
```javascript
var test_2 = document.getElementById('test-2');
console.log(test_2.value); // null
```
虽然没有在标签中定义`value`，但由于它是DOM默认的基本属性，所以在DOM初始化的时候它还是会被创建。由此我们可以得出结论：

* DOM有其默认的基本属性，而这些属性就是所谓的“property”，无论如何，它们都会在初始化的时候再DOM对象上创建。
* 如果在TAG对这些属性进行赋值，那么这些值就会作为初始值赋给DOM的同名property。

那么标签上的sth定义在哪里呢？

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/dom-1.png)

也就是说，attributes是属于property的一个子集，它保存了HTML标签上定义的属性。如果再进一步探索attitudes中的每一个属性，会发现它们并不是简单的对象，它是一个Attr类型的对象，拥有NodeType、NodeName等属性。注意，打印attribute属性不会直接得到对象的值，而是获取一个包含属性名和值的字符串。
```javascript
console.log(test.attibutes.sth); // 'sth="whatever"'
```
由此可以得出：

* HTML标签中定义的属性和值会保存该DOM对象的attributes属性里面；
* 这些attribute属性的JavaScript中的类型是Attr，而不仅仅是保存属性名和值这么简单；

那么，如果我们更改property和attribute的值会出现什么效果呢？执行如下语句：
```javascript
test.value = 'new value of prop';
console.log(test.value); // 'new value of prop'
console.log(test.arrtibutes.value); // 'value="1"'
```
如果反过来，效果又是如何呢？
```javascript
test.attributes.value = 'new value of attr';
console.log(test.value); // 'new value of attr'
console.log(test.attributes.value); // 'new value of attr'
```
此时，页面中的输入栏得到更新，property中的value也发生了变化。此外，执行下面语句也会得到一样的结果：
```javascript
test.attributes.value.nodeValue = 'new value of attr';
```
由此，可得出结论：

* property能够从attribute中得到同步；
* attribute不会同步property上的值；
* attribute和property之间的数据绑定是单向的，attribute->property；
* 更改property和attribute上的任意值，都会将更新反映到HTML页面中；

### DOM操作

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/dom-2.png)

有关DOM操作，主要注意点在于性能方面的影响，优化DOM操作方法有：
* 减少DOM访问次数
* 多次访问同一DOM，应该用局部变量缓存该DOM
* 尽可能使用querySelector，而不是使用获取HTML集合的API
* 注意重排（reflow）和重绘（repaint）
* 使用事件委托，减少绑定事件的数量

### 重排（重构）&重绘

重绘并不一定导致重排，比如修改某个元素的颜色，只会导致重绘；而重排之后，浏览器需要重新绘制受重排影响的部分。导致重排的原因有：

* 添加或删除DOM元素
* 元素位置、大小、内容改变
* 浏览器窗口大小改变
* 滚动条出现

**最小化重排、重绘的建议：**

* 不要再修改布局信息的时候，去查询布局信息
* 修改一个元素的多个style时，一次性修改，而不是多次，能用css的class解决的，就尽量不用内联样式
* :hover会降低响应速度，在处理很大的列表时，避免使用

## BOM操作
BOM（Browser Object Model）指的是浏览器对象模型，主要用途：
* 检测浏览器的类型
* 拆解url的各部分

### navigator

`navigator`对象：包含大量有关Web浏览器的信息，用于检测浏览器及操作系统。
常用方法有：
* `navigator.userAgent` //用户代理头的字符串表示

### screen

`screen`对象：用于获取某些关于用户屏幕的信息。
常用方法有：
* `screen.width/height` //屏幕的宽度与高度，以像素计 
* `screen.availWidth/availHeight` //窗口可以使用的屏幕的宽度和高度，以像素计 
* `screen.colorDepth` //用户表示颜色的位数，大多数系统采用32位 
* `window.moveTo(0, 0); `
* `window.resizeTo(screen.availWidth, screen.availHeight); ` //填充用户的屏幕

### location

`location`对象：表示载入窗口的URL。
常用方法有：
* `location.href` //当前载入页面的完整URL
* `location.portocol` //URL中使用的协议，即双斜杠之前的部分，如http
* `location.host` //服务器的名字，如www.wrox.com
* `location.hostname` //通常等于host，有时会省略前面的www
* `location.port` //URL声明的请求的端口，默认情况下，大多数URL没有端口信息，如8080
* `location.pathname` //URL中主机名后的部分，如/pictures/index.htm
* `location.search` //执行GET请求的URL中的问号后的部分，又称查询字符串，如?param=xxxx
* `location.hash` //如果URL包含#，返回该符号之后的内容，如#anchor1
* `location.assign("http:www.baidu.com");` //同location.href，新地址都会被加到浏览器的历史栈中
* `location.replace("http:www.baidu.com");` //同assign()，但新地址不会被加到浏览器的历史栈中，不能通过back和forward访问
* `location.reload(true | false);` //重新载入当前页面，为false时从浏览器缓存中重载，为true时从服务器端重载，默认为false

### history

`history`对象：浏览器窗口的历史
常用方法有：
* `history.go(-1);` //访问浏览器窗口的历史，负数为后退，正数为前进
* `history.back();` //同上
* `history.forward();` //同上
* `history.length` //可以查看历史中的页面数

