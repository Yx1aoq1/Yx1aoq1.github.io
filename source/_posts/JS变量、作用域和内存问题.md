---
title: JS变量、作用域和内存问题
date: 2017-08-15 20:30:52
tags: [JavaScript]
---
## 变量

### 数据类型

在JavaScript中，数据类型分为基本类型和引用类型。
* **基本类型：**数字，字符，布尔值，undefined，null
* **引用类型：**数组，对象，函数
* **区别：**基本类型的值是可以修改的，而引用类型的值不可修改
<!--more-->

```JavaScript
//eg1
var num = 4;
num = 3; //这里的值操作并不是修改，而是覆盖

//eg2
var str = 'string';
var anotherStr = str.replace('s',''); 
//字符串操作方法replace在执行后并不会改变原来的值str，而是生成一个新的字符串anotherStr

```
基本类型是无法添加属性的，但是它们却存在各自的方法以及属性。这是因为每一个基本类型都存在它们自己的包装对象，如数字的包装对象是`Number`，字符的包装对象是`String`。包装对象包含了这个类型的属性和方法。

### 堆栈

在JavaScript中，数据采用堆栈的方式保存。内存分为栈和堆。栈内存是有序排列，每个栈有序号，并且大小是固定的，在读取的时候是按顺序读取的。堆内存是无序排列，大小不固定。因为基本类型是不可修改的，大小不会改变，所以基本类型是保存在栈内存中的。而引用类型是保存在堆内存中的。

因为引用类型保存在堆中，如果直接在堆中查找会很困难，并且相当的消耗资源，所以引用类型会通过地址来定位，地址则保存在有序的栈中。
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/stack&heap-1.png)

### 变量的比较

```javascript
//基本类型的比较
var xmScore = 4;
var xhScore =4;
console.log(xmScore === xhScore) //true

//引用类型的比较
var xm = {
  age: 18,
  score: 4
};
var xh = {
  age: 18,
  score: 4
};
console.log(xm === xh); //false
```
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/stack&heap-2.png)
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/stack&heap-3.png)
在引用类型中，只有指向同一个引用，变量才是相等的。


```javascript
var xm = {
  age: 18,
  score: 4
};
var xh = xm; //xm保存的是对象的地址，将地址赋值给xh，所以xh所指向和xm是同一个引用
console.log(xm === xh); //true;
```
那么如何比较两个引用类型的属性值是不是相同呢？我们无法通过直接的方式对它们进行比较，只能通过循环遍历它们内部的属性和值来进行比较。
```javascript
function equalObjs(a,b) {
  for(var p in a) {
    if(a[p] !== b[p] return false;
  }
  return true;
}

function equalArrays(a,b) {
  if(a.length !== b.length) return false;
  for(var i = 0; i < a.length; i ++) {
    if(a[i] !== b[i]) return false;
  }
  return true;
}
```

### 变量的复制

当两个变量指向的是同一个引用类型的时候，如果其中一个变量的属性值发生了改变，那么另一个变量的属性值也会发生改变。如果我们想将一个引用类型赋值给另一个，并且不想发生上述情况的话，还是要用遍历的方式去生成一个新的对象。
```javascript
function copyObj(obj) {
  var newObj = {};
  for(var p in obj) {
   newObj[p] = obj[p];
  }
  return newObj;
}
```
以上的方法便是**浅拷贝**，之所以是‘浅’,是因为当这个对象有一个属性值是数组的话，在进行拷贝的时候，生成的两个对象中的数组其实是指向同一个引用的，这样我们就无法将两个对象完完全全的分开了。那如何进行深拷贝呢？jQuery中提供了一个方法，既可以进行深拷贝，也可以进行浅拷贝。
* `$.extend(deep,target,object1,objectN)`
参数说明：
`deep`：可选。布尔值。指是否深度合并对象，默认`false`。
`target`：目标对象，其他对象的成员属性将被附加到该对象上。
`object1`：可选。指第一个被合并的对象。
`objectN`：可选。指第N个被合并的对象。

### 参数传递

```javascript
function fn(a,b) {
  return a + b;
} // 在函数里声明的a与b是形参
fn(1,2); //在调用函数时传入的参数是实参
```
当我们将实参传入到函数的时候，实参和形参做的其实是赋值的操作。
```javascript
//eg1 当变量为基本类型时
function addTen(num) {
  return num + 10;
}
var score = 10;
addTen(score);
//相当于
num = score;

//eg2 当变量为引用类型时
function setName(obj) {
  return obj.name = 'xm';
}
var person = {};
setName(person);
```
当传递的参数是引用类型时，也相当于`obj = person`，因为引用类型赋值时是对地址进行复制的，所以`obj`与`person`实际上指向的都是同一个引用，所以我们对`obj`的修改也能反应到`person`上。

### 类型检测

`typeof`：返回字符串类型。可以区分基本类型，但是无法区分引用类型（`null`，对象和数组返回的都是`object`）。
`instanceof`：用来测试一个对象在其原型链中是否存在一个构造函数的`prototype`属性，返回布尔值。可以判断引用类型具体是哪种，只能用于判断引用类型。用法`[] instanceof Array`。

## 作用域

> 变量的作用域可理解为变量起作用的范围，它包括两点：变量的生命周期；在哪里可以访问到变量

### 全局与局部

在JS中，变量的作用域分为两种：全局变量和局部变量
全局变量的声明方式有两种：
```javascript
var n = 999; //直接在外部声明
function f1() {
  i = 888; //在函数内部声明，但是不适用var命令
}
```
全局变量的生命周期是只有当所有的程序执行完毕之后，全局变量才会被销毁。而局部变量是在执行完这个函数，就会被销毁。
在JS中，局部变量指的就是在函数中声明的变量，因为在JS中并不存在块级作用域。块级作用域指的是用`{}`包含的域。在其他语言，例如C++，`if`和`for`中声明的变量在外部也是无法访问到的。但是JS中，在`if`和`for`中声明的变量在整个函数内部都可以访问。
```
for(var i = 0; i < 10; i ++) { }
//等同于
var i = 0;
for(i < 10; i ++) { }
```

### 变量的作用域链

```javascript
var name = 'xm';
funuction fn(argument) {
  var name = 'xh';
  var sex = 'male';
  function fn2(argument) {
    var name = 'xhei';
    var age = 18;
  }
}
```

所有全局空间中的属性和方法，都是属于window的（`window.name = 'xm';`）。全局作用域的变量对象是window。局部作用域的变量对象则是看不见的（`fn.sex`与`fn.fn2`不存在）。
作用域有一个特点，就是在查找变量的时候会先在自己变量的范围中查找，如果找不到，就会沿着作用域网上查找。
**作用链：** 也称“链式作用域”，指的是子对象会一级一级地向上寻找所以父对象的变量。所以，父对象的所以变量，子对象都是可见的，反之则不成立。
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/variable-1.png)

* **延长作用域链**

```javascript
var person = {};
person.name = 'xm';
person.sex = 'male';
var score = 4;

with(person) {
  name = 'xh';
  sex = 'female';
  score = 44;
}

console.log(person.name); //xh
console.log(person.sex); //female
console.log(score); //44
```
使用`with`的时候，当修改`name`与`sex`时，此时查找的作用域是`person`，但是`person`中并不存在`score`这个属性，于是with就随着作用域链查找到`window`下的`score`，并将其修改为44。但是延长作用域链会使得查询时间变长，所以并不推荐使用。

* **闭包**

在实际应用中，我们有时候可能也需要在函数外部调用函数内部的变量，但是由于作用链这个机制，在函数外部是取不到这个变量的，所以需要绕点弯子。
```javascript
function f1() {
  var n = 999;
  function f2() {
    alert(n); //999
  }
  return f2; //将f2作为返回值
}

var result = f1();
result(); //999
```
以上代码中的f2函数就是闭包，也就是闭包可以理解为**"定义在一个函数内部的函数"**。
* **闭包的两个用途**：
  * 读取函数内部的变量，是将函数内部和函数外部连接起来的一座桥梁。
  * 将某些变量的值始终保持在内存中。（JS的垃圾回收机制）

### JS解析机制-预解析

JS在解析代码的时候，会先进性预解析，进行完预解析后，才开始逐行解析。
```javascript
var name = 'xm';
var age = 18;
function fn(argument) {
  console.log(name);
  var name = 'xh';
  var age = 10;
}
fn(); //undefined
```
就以上代码来看，这个JS中包含了两个作用域，那么预解析就会分别在两个作用域中进行。首先它会将所有的`var`找出来，并且将所有的变量都赋值为`undefined`。然后查找该域中的`function`，并直接进行声明。也就是说函数在域解析的时候就已经声明好了，但是变量值都还是`undefined`。
```javascript
//window域预解析
var name = undefiied;
var age = undefined;
function fn(argument) {
  console.log(name);
  var name = 'xh';
  var age = 10;
}

//fn域预解析
var name = undefined;
var age = undefined;

//逐行解析
name = 'xm';
age = 18;
fn(argument) {
  console.log(name); //此时fn中的name被预解析赋值为undefined，所有打印出的结果为undefined
  name = 'xh';
  age = 10;
}
```
在预解析的机制中，如果变量名与函数名冲突，预解析的时候会只保留函数。如果函数名和函数名冲突的时候，则后面声明的函数会保留。
```javascript
console.log(a);
a = 1; //预解析不解析没有var的变量，所以浏览器会报错
```

## 内存

### 垃圾回收机制
**垃圾回收机制：**释放无用的数据，回收内存。可分为自动和手动。JS会自动的帮我们回收垃圾。其原理就是，找出没用的数据，打上标记，释放内存，并按照一定的周期执行。
**标识无用数据的策略：**
  * **标记清除：**垃圾收集器在运行的时候会给存储在内存中的所有变量一次性都加上标记，然后去掉环境中的变量以及被这些环境中的变量所引用的变量的标记。**环境中的变量**指的是这些变量还没有离开它的执行环境。对于局部变量来说，当这个函数执行完毕之后，这些局部变量就相当于离开了这个函数的执行环境。如果这个函数还在执行中，就表示这个变量还在环境中。排除一些还未离开环境的变量，剩下的变量便是以及离开了它的执行环境的变量，垃圾回收机制会将这些变量全部清除。目前几乎所有的浏览器使用的垃圾回收机制都是标记清除，只不过在时间间隔上有略微的区别。
  * **引用计数：**引用计数并不常用。它会跟踪计数每个数据所被引用的次数。当我们声明一个变量，并将一个引用类型的值赋值给这个变量时，这个数据就被这个变量引用过一次。如果这个值又被赋值给另外一个变量，则引用次数加一。如果这个变量被赋予了新的引用数据，这原来的数据的引用次数会减一。当引用次数为0时，这个值就会被清除。
  * **循环引用问题：**
  
```javascript
function fn(argument) {
  var xm = {}; //1
  var xh = {}; //1
}
fun();
xm = null; //0
xh = null; //0

functioni fn(argument) {
  var xm = {}; //1
  var xh = {}; //1
  xm.wife = xh; //2
  xh.husband = xm; //2
}
fn();
xm = null; //1
xh = null; //1
```
由于`xm`与`xh`相互引用，导致最后其占用的内存无法被清除，如果循环次数很多的话，就会导致内存占用的越来越多。

### 管理内存

为了让网页节约内存占用，我们有时候需要手动解除引用，即将这些值置为`null`。而需要我们手动解除的是全局变量，局部变量的内存因为垃圾回收机制会自动的清除。