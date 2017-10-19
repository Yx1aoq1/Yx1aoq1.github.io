---
title: JS面向对象学习笔记
date: 2017-08-16 21:20:29
tags: [JavaScript]
---
## 面向对象（OOP）的概念

对于面向对象，有以下几个概念：
* 一切事物皆对象
* 对象具有封装和继承特性
* 对象与对象之间使用消息通信，各自存在信息隐藏

**对象有哪些特性？**
* **封装性：**通过封装可以为对象内部的数据提供不同级别的保护，避免了外界的干扰和不确定性。
* **继承：**很好的支持了代码的重用性，通过一个类派生一个新的类，这个新类不仅可以具有原来的类的特性，还可以拥有新的特性。
* **多态：**多态指的不同类的对象对同一消息作出不同的响应。

**面向对象的优点：**易维护、易复用、易扩展，由于面向对象有封装、继承、多态的特性，可以设计出低耦合的系统，使系统更加灵活、易于维护。

JavaScript作为一门面向对象的语言，却并不是通过**类**来实现面向对象的，而是通过**原型（prototype）**。那么这两者实现面向对象究竟有什么区别呢？

### 基于类vs基于原型

基于类的面向对象语言，比如Java和C++，是构建在两个不同实体的概念之上的：即类和实例。
* **类（class）：**定义了所有具有某一组特征对象的属性（可以将Java中的方法和变量以及C++中的成员都视作属性）。类是抽象的事物，而不是其所描述的全部对象中的任何特定的个体。
* **实例（instance）：**类的实例化体系；或者说，是类的一个成员。实例具有和其父类完全一致的属性。


```java
//定义类
public class Person {
  String name;
  int age;
  void walking() {
  }
  void sleeping() {
  }
  Person(x,y) {
    name = x;
    age = y;
  }//类的构造函数
}
//实例化
Person xm = new Person('xm',18);
```

其中，创建类的实例必须调用类的构造方法。类的构造方法是一类和类同名的方法，用于创建类的实例并初始化对象。
而对于JavaScript，我们不需要定义一个类，而只需要定义一个构造函数，然后通过这个构造函数就可以创建实例。
```javascript
function Person(name,age) {
  this.name = name;
  this.age = age;
}

var xm = new Person('xm',18);
```
### new操作符

在Java中，new操作符做的是在内存中开辟一个空间，然后生成的实例会通过指针指向这个空间。
在JS中，new操作符不仅仅在内存开辟了一个空间，还进行了另外的**两个步骤**
* 将实例的`._proto_`指向构造函数的`prototype`属性。
* 调用构造函数来初始化实例对象。（`call`、`apply`）

### 原型对象

对象不仅仅有自己独特的属性，例如`Person`，每个`Person`的实例对象不仅有属于自己的姓名与年龄，还有许多共用的方法。如果在每个对象的实例中都存一份方法就会造成空间的浪费。

在Java中，共用的方法会采用静态的方式用`static`修饰将这些方法定义成静态成员，这些静态成员会存放在另外的内存空间中，直到该类被卸载的时候才会被回收。

而在JS中，则引入了原型对象。原型对象就是构造函数的`prototype`属性，这个属性存放着实例对象需要共享的属性和方法，而那些不需要共享的属性和方法就放在构造函数里面。而在这个原型对象中则存在一个`constructor`属性来指向该原型实例的构造函数。

## 原型链

由于JS中，实例是对象，函数是对象，原型也是对象，他们都包含各自的`_proto_`属性，`constructor`属性和`prototype`属性，它们相互指来指去，就形成了一条原型链。

以`Person`这个构造函数为例，我们创建了它的实例`xm`，于是以下的原型链中我们就包含了三种不同的对象，一个是实例，一个是构造函数，还有构造函数的原型对象。其中`_proto_`其实是浏览器为我们提供的非标准的查看对象原型的访问器，并不是真实存在的属性，所以用虚线表示。

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/prototype.png)

### 属性查找

当查找一个对象的属性时，JS会向上遍历原型链，直到找到给定名称的属性为止，如果查找到原型链的终点（null）时，仍然没有找到，则会返回`undefined`。

## 创建对象

* 基于Object对象创建

```javascript
var person = new Object();
person.name = 'xm';
person.age = 18;
person.getName = function() {
  return this.name;
}
```
* 字面量的方式：清晰的查找对象包含的属性和方法

```javascript
var person = {
  name: 'xm',
  age: 18,
  getName: function() {
    return this.name;
  }
}
```
* 工厂模式：用于批量创建多构造类似的对象，缺点是无法识别对象的类型（都是Object）。

```javascript
functioni createPerson(name,age) {
  var o = new Object();
  o.name = name;
  o.age = age;
  o.getName = function() {
    return this.name;
  }
  return o;
}
var person = createPerson('xm',18);
```
* 构造函数模式

```javascript
function Person(name,age) {
  this.name = name;
  this.age = age;
  this.getName = function() {
    return this.name;
  }
}
var person = new Person('xm',18);
```
* `Object.create(prototype, descriptors)`：是E5中提出的一种新的对象创建方式。它会新建一个对象，并且让这个对象的原型指向参数`prototype`。
参数说明：
`prototype`：必需。要用作原型的对象，可以为`null`。
`descriptors`：可选。包含一个或多个属性描述符的JavaScript对象。

```javascript
var var obj = Object.create({x:1});
obj.hasOwnProperty('x');//false
```