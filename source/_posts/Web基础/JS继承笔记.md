---
title: JS继承笔记
date: 2017-07-07 22:02:11
categories: 
  - Web基础
tags: 
  - JavaScript
---
在传统的基于Class的语言如Java、C++中，继承的本质是扩展一个已有的Class，并生成新的Subclass。
由于这类语言严格区分类和实例，继承实际上是类型的扩展。但是，JavaScript并不存在类，所以需要通过其他的方法模拟出“类”。

看了阮一峰的继承博文，理了理里面各种属性的关系，整理成一张图，大概是这样：
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/jicheng-1.png)
通过prototype属性，实例dogA和实例dogB可以共同享有species属性，并且实现了联动修改，节约了内存占用。

在以上基础下，得出了几种继承方法：
```javascript
//现有两个构造函数

function Animal() {
  this.species = "动物";
}

function Cat(name,color) {
  this.name = name;
  this.color = color;
}
```

## 构造函数的继承

* **构造函数绑定：**使用`call`或`apply`方法，将父对象的构造函数绑定在子对象上
```javascript
function Cat(name,color) {
  Animal.apply(this.arguments);
  this.name = name;
  this.color = color;
}
var cat1 = new Cat("大毛","黄色");
alert(cat1.species); //动物
```

* **prototype模式：**将“猫”的prototype对象指向一个Animal的实例，那么“猫”的实例就能继承Animal了
```javascript
Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;
//由于修改了Cat的prototype属性，所以Cat.prototype.constructor会指向Animal
//但是constructor是必须指向其构造函数的，所以要修正成Cat
var cat1 = new Cat("大毛","黄色");
alert(cat1.species); //动物
```

* **直接继承prototype：**由于Animal对象中，不变的属性都可以直接写入Animal.prototype。所以，我们也可以让Cat()跳过 Animal()，直接继承Animal.prototype。
```javascript
funtion Animal() {}
Animal.prototype.species = "动物";

Cat.prototype = Animal.prototype;
Cat.prototype.constructor = Cat;
```
	此方法虽然提高了效率（不用执行和建立Animal的实例），但有一个缺点，就是如果修改了Cat.prototype.species，那么Animal.prototype.species也会联动修改。

* **利用空对象作中介：**（重点方法）
```javascript
var F = function() {}
F.prototype = Animal.prototype;
Cat.prototype = new F();
Cat.prototype.constructor = Cat;
```
	可以将此方法封装为一个函数
```javascript
function extend(child,parent) {
  var temp = function() {};
  temp.prototype = parent.prototype;
  child.prototype = new temp();
  child.prototype.constructor = child;
  child.uber = parent.prototype;//为了实现继承的完备性，纯属备用性质
}
```
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/jicheng-2.png)
