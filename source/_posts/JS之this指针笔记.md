---
title: JS之this指针笔记
date: 2017-07-08 13:48:43
tags: [JavaScript]
---
## this指针
> this是Javascript语言的一个关键字。它代表函数运行时，自动生成的一个内部对象，只能在函数内部使用。随着函数使用场合的不同，this的值会发生变化。但是有一个总的原则，那就是this指的是，调用函数的那个对象。

* **定义在全局中的函数**
```javascript
function test() {
  this.x = 1; //此处的this指的是window
}
x = 0; //在全局修改这个x，函数中这个this.x也是会一起改变的
```
* **作为对象方法的调用**
```javascript
function test() {
  alert(this.x);
}

var o = {};
o.x = 1;
o.m = test;
o.m(); //1
```
* **作为构造函数调用**
```javascript
var o = {
  test: function () {
    this.x = 1;
  } //这是定义在对象中的函数，而此时this指的是对象o
}
```
## this指向的改变
```javascript
var o = {
  test: function () {
    //在构造函数的时候也会调用其他的函数，所以this的指向就会变
    $(this.xx).on("click",function(){
      //比如调用了on绑定事件的函数，那么这个函数里的this就不是对象o了
    })
  } 
}
```
在javascript中有几个函数是可以改变this的指向的
```javascript
var xm = {
  name: "小明",
  sex: "男",
  age: "18",
  say: function() {
    alert(this.name + "," + this.sex + "," + this.age);
  }
}

var xh = {
  name: "小红",
  sex: "女",
  age: "20"
}
```
* `apply(thisObj,[argArray])`
参数：替换目标对象（如果为空，则指的是window对象），数组（存放所需要的参数）
定义：应用某一对象的一个方法，用另一个对象替换当前对象
```javascript
xm.say.apply(xh); //小红,女,20
```

* `call(thisObj,arg1,arg2...)`
参数：替换目标对象，需要的参数arg1,arg2...
定义：应用某一对象的一个方法，用另一个对象替换当前对象
```javascript
xm.say.call(xh); //小红,女,20
```

* `bind(thisObj)(arg1,arg2...)`
参数：替换目标对象，需要的参数arg1,arg2...
定义：创建一个新函数，称为绑定函数，当调用这个绑定函数时，绑定函数会以创建它时传入 bind()方法的第一个参数作为 this，传入 bind() 方法的第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数。
说明：bind是在EcmaScript5中扩展的方法（IE6,7,8不支持）
```javascript
xm.say.bind(xh)(); //小红,女,20
```

* `$.proxy(fn,context)`
参数：函数，函数所在的对象的名称
定义：用于向上下文指向不同对象的元素添加事件。
```javascript
test = function() {
  this.txt = "这是一个对象属性";
  $("div").click($.proxy(this.myClick,this));
  //本来调用click的话，this会指向div，但是使用$.proxy后this还是test
};

test.prototype.myClick = function(event) {
  alert(this.txt);
  alert(event.currentTarget.nodeName);
};

var x = new test();
```
