---
title: 【JS设计模式】装饰者模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-09-06 17:58:55
---
## 装饰者模式

装饰者模式的定义：

> 在不改变对象自身的基础上，在程序运行期间给对象动态地添加职责。

为什么使用装饰者模式呢？

在传统的面向对象语言中，给对象添加功能常常使用**继承**的方式，但是继承的方式并不灵活，还会带来许多问题：一方面导致超类和子类之间的强耦合性，**当超类改变时，子类也会随之改变**；另一方面，继承这种功能复用方式通常称为“白箱复用”，“白箱”是相对可见性而言的，在继承方式中，**超类的内部细节是对子类可见的，继承常常被认为破坏了封装性**。

因此，与继承相比，装饰者是一种更轻便灵活的做法，是一种“**即用即付**”的方式，比如天冷了就多穿一件外套，需要飞行时就在头上擦一支竹蜻蜓。

### 函数功能扩展

在JavaScript中可以很方便地给某个对象扩展属性和方法，但却很难在不改动某个函数源代码地情况下，给该函数添加一些额外的功能。要想为函数添加一些功能，最简单粗暴的方法就是直接改写该函数，但这违反了“开放-封闭”原则。

```js
var a = function () {
  alert(1)
}
// 改写
var a = function () {
  alert(1)
  alert(2)
}
```

另一种常见的方法，就是通过保存引用的方式来改写某个函数：

```js
var a = function () {
  alert(1)
}
// 改写
var _a = a
a = function () {
  _a()
  alert(2)
}
```

这样的代码当然是符合”开放-封闭“原则的，但也存在问题：

* 必须维护`_a`这个中间变量，虽然看起来并不起眼，但如果函数的装饰链很长，或者需要装饰的函数变多，这些中间遍历的数量也会越来越多
* `this`劫持问题，举个例子：

```js
var _getElementById = document.getElementById

document.getElementById = function (id) {
  alert(1)
  return _getElementById(id)
}

var button = document.getElementById('button')
```

当你执行以上代码的时候会发现控制台报错：

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/QQ截图20200906155818.png)

由于`_getElementById`是一个全局函数，当调用一个全局函数时，`this`是指向`window`的，而`document.getElementById`方法的内部实现的`this`引用是指向`document`，所以就产生了报错。所以使用现在的方式给函数增加功能并不保险。

改进：

```js
var _getElementById = document.getElementById

document.getElementById = function (id) {
  alert(1)
  return _getElementById.apply(document, arguments)
}
```

### AOP装饰函数

```js
Function.prototype.before = function (beforefn) {
  const __self = this // 保存原函数的引用
  return function () { // 返回包含了原函数和新函数的“代理”函数
    beforefn.apply(this, arguments) // 执行新函数，修正this
    return __self.apply(this, arguments) // 执行原函数
  }
}

Function.prototype.after = function (afterfn) {
  const __self = this
  return function () {
    const ret = __self.apply(this, arguments) // 执行原函数
    afterfn.apply(this, arguments)
    return ret
  }
}
```

`Function.prototype.before`接收一个函数作为参数，然后返回一个”代理“函数，这个“代理”函数只是在结构上像代理而已，并不承担代理的职责（比如控制对象的访问等）。它的工作是把请求分别转发给新添加的函数和原函数，并且负责保证他们的执行顺序，让新添加的函数在原函数之前执行（前置装饰），这样就实现了动态装饰的效果。`Function.prototype.after`的原理同上。

```js
// 实现和上面例子一样的功能
document.getElementById = document.getElementById.before(function () {
  alert(1)
})
```

值得一提的是，上面的AOP实现是在`Function.prototype`上添加`before`和`after`方法，但许多人不喜欢这种污染原型的方式，那么我们可以做一些变通，把原函数和新函数都作为参数传入`before`和`after`：

```js
var before = function (fn, beforefn) {
  return function () {
    beforefn.apply(this, arguments)
    return fn.apply(this, arguments)
  }
}

var a = before(
  function () { console.log(3) },
  function () { console.log(2) }
)

a = before(a, function () { console.log(1)} )
a() // 1 2 3
```

### 装饰者模式与代理模式

装饰者模式与代理模式的对比：

* 相同之处：
  * 都描述了怎样为对象提供一定程序上的间接引用
  * 它们的实现部分都保留了对另一个对象的引用，并且向那个对象发送请求
* 不同之处：
  * 代理模式的目的是，当直接访问本体不方便或不符合需要时，为这个本体提供一个替代者。代理为本体提供一些额外的功能，代理与本体之间的关系是确定的
  * 装饰者模式的作用是为对象动态加入行为，这些行为和关系是不确定的
  * 代理模式通常只有一层代理-本体的引用，而装饰者模式经常会形成一条长长的装饰链

## 装饰者模式的应用

### TypeScript 装饰器

**▼方法装饰器**

参数：

* **target**—— 当前对象的原型，假设`Employee`是对象，那么 target 就是 `Employee.prototype`
* **propertyKey** —— 方法的名称
* **descriptor** —— 方法的属性描述符，即 `Object.getOwnPropertyDescriptor(Employee.prototype, propertyKey)`

```js
function logMethod (target: Object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value
  descriptor.value = function (...args: any[]) {
    // 将 greet 的参数列表转换为字符串
    const params = args.map(a => JSON.stringify(a)).join();
    // 调用 greet() 并获取其返回值
    const result = method.apply(this, args);
    // 转换结尾为字符串
    const r = JSON.stringify(result);
    // 在终端显示函数调用细节
    console.log(`Call: ${propertyKey}(${params}) => ${r}`);
    // 返回调用函数的结果
    return result;
  }
  return descriptor
}

class Employee {
  constructor(private firstName: string, private lastName: string) {
    this.firstName = firstName
    this.lastName = lastName
  }

  @logMethod
  greet(message: string): string {
    return `${this.firstName} ${this.lastName} says: ${message}`
  }
}

const emp = new Employee('Mohan Ram', 'Ratnakumar')
emp.greet('hello')
// Call: greet("hello") => "Mohan Ram Ratnakumar says: hello" 
```

**▼属性装饰器**

参数：

* **target**—— 当前对象的原型，假设`Employee`是对象，那么 target 就是 `Employee.prototype`
* **propertyKey** —— 方法的名称

```js
function logParameter (target: Object, propertyKey: string) {
  // 属性值
  let _val = target[propertyKey]
  // 属性读取访问器
  const getter = () => {
    console.log(`Get: ${propertyKey} => ${_val}`)
    return _val
  }
  // 属性写入访问器
  const setter = (newVal: any) => {
    console.log(`Set: ${propertyKey} => ${newVal}`)
    _val = newVal
  }
  // 删除属性
  if (delete target[propertyKey]) {
    // 创建新属性及其读取访问器、写入访问器
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    })
  }
}

class Employee {
  @logParameter
  name: string|undefined;
}

const emp = new Employee()
emp.name = 'Mohan Ram'
console.log(emp.name)

// Set: name => Mohan Ram
// Get: name => Mohan Ram
// Mohan Ram
```

**▼参数装饰器**

参数：

* **target**—— 当前对象的原型，假设`Employee`是对象，那么 target 就是 `Employee.prototype`
* **propertyKey** —— 方法的名称
* **index** —— 参数数组中的位置

```js
function logParameter(target: Object, propertyKey: string, index: number) {
  // 为相应方法生成元数据键，以储存被装饰的参数的位置
  const metadataKey = `log_${propertyKey}_parameters`
  if (Array.isArray(target[metadataKey])) {
    target[metadataKey].push(index)
  }
  else {
    target[metadataKey] = [index]
  }
}

class Employee {
  greet(@logParameter message: string): string {
    return `hello ${message}`
  }
}

const emp = new Employee()
emp.greet('hello')
console.log(emp['log_greet_parameters'])
// [ 0 ]
```

**▼访问器装饰器**

访问器不过是类声明中属性的读取访问器和写入访问器。**访问器装饰器**应用于访问器的**属性描述符**，可用于观测、修改、替换访问器的定义。

```js
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('decorator - sets the enumeration part of the accessor')
    descriptor.enumerable = value
  }
}

class Employee {
  private _salary: number
  private _name: string

  @enumerable(false)
  get salary() { return `Rs. ${this._salary}` }

  set salary(salary: any) { this._salary = +salary }

  @enumerable(true)
  get name() {
    return `Sir/Madam, ${this._name}`
  }

  set name(name: string) {
    this._name = name
  }
}

const emp = new Employee();
emp.salary = 1000;
for (let prop in emp) {
  console.log(`enumerable property = ${prop}`)
}
/*
decorator - sets the enumeration part of the accessor
decorator - sets the enumeration part of the accessor
enumerable property = _salary
enumerable property = name
*/
```

**▼类装饰器**

类装饰器应用于类的构造器，可用于观测、修改、替换类定义。

```js
function logClass(target: Function) {
  // 保存一份原构造器的引用
  const original = target
  // 生成类的实例的辅助函数
  function construct (constructor: Function, args: any[]) {
    const c: any = function () {
      return new constructor()
    }
    return new c()
  }
  // 新构造器行为
  const f: any = function (...args: any[]) {
    console.log(`New: ${original['name']} is created`)
    return construct(original, args)
  }
  // 复制 prototype 属性，保持 intanceof 操作符可用
  f.prototype = original.prototype
  // 返回新构造器（将覆盖原构造器）
  return f
}

@logClass
class Employee {}

let emp = new Employee()
console.log('emp instanceof Employee')
console.log(emp instanceof Employee)
/*
New: Employee is created 
emp instanceof Employee 
true
*/
```

**▼装饰器工厂**

由于每种装饰器都有它自身的调用签名，我们可以使用装饰器工厂来泛化装饰器调用。

```js
function log (...args) {
  switch (args.length) {
    case 3:
      // 可能是方法装饰器或参数装饰器
      // 如果第三个参数是数字，那么它是索引，所以这是参数装饰器
      if (typeof args[2] === 'number') {
        return logParameter.apply(this, args)
      }
      return logMethod.apply(this, args)
    case 2:
      // 属性装饰器
      return logProperty.apply(this, args)
    case 1:
      // 类装饰器
      return logClass.apply(this, args)
    default:
      // 参数数目不合法
      throw new Error('Not a valid decorator')
  }
}

@log
class Employee {
  @log
  private name: string

  constructor(name: string) {
    this.name = name
  }

  @log
  greet(@log message: string): string {
    return `${this.name} says: ${message}`
  }
}
```



文章参考：
《JavaScript设计模式与开发实践》

[使用 TypeScript 装饰器装饰你的代码](https://juejin.im/post/6844903876605280269#heading-7)