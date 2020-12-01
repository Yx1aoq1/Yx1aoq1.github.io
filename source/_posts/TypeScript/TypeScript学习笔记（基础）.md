---
title: TypeScript学习笔记（基础）
categories:
  - TypeScript
tags:
  - TypeScript
date: 2019-05-26 14:35:02
---
## TS 是什么

> TS是一个应用程序级的JavaScript开发语言，是JavaScript的超集，可以编译成纯JavaScript，并遵循JavaScript的语法和语义。

▼ **TS与JS相比，有什么优势**
* TS 与 JS 对比，最主要是增加了静态类型，这样就能在调试的时候做到类型检查，越界检查，在构建的时候就可以发现问题，可以减少潜在的BUG
* 提供了类、模块和接口，更有利于构建组件

对比TS，其实ES6也已经对JS做了一些类、模块之类的改进，那么为什么还要学习TS呢？其实由TS的名字就可以感受到，它的重点：`Type`，JS本身与大部分其他语言的不同之处就在于弱类型，声明一个变量，它就可以是任何类型，这就给代码的管理上造成了隐患。强类型的本意就在于用规则约束自己的代码，有了这些规则，自然而然的就能够避免一些低级的BUG。当然，BUG是永远不可能消失滴。

TS能够更好的帮助管理大型工程，也可以减少代码中一堆isxxx的类型判断。并且TS提供了定义对象类型的接口（Interfaces），对于开发，我们只需要在接口处标明类型，其它的内部过程交由 ts 推理就好，这也减少了许多额外的工作。

## TS 中的类型

### 基础类型

```ts
let isDone: boolean = false // 布尔值
let num: number = 100 // 数值
let str: string = 'Hello' // 字符串（支持模板字符串${}）

function alertName(): void { // 空值，表示没有任何返回值的函数
  alert('My name is Tom') // 变量声明为void并没有什么用，因为只能是null 或 undefined
}

let u: undefined = undefined // undefined
let n: null = null // null
// 与 void 区别在与其他类型可以赋值为 undefined 或 null 而不报错，但是不能赋值为 void

let anyThing: any = 'hello' // 任意值
// 在任意值上访问任何属性都是允许的
console.log(anyThing.myName)
console.log(anyThing.myName.firstName)
// 也允许调用任何方法
anyThing.setName('Jerry')
anyThing.setName('Jerry').sayHello()
anyThing.myName.setFirstName('Cat')
// 对它的任何操作，返回的内容的类型都是任意值
```

### 联合类型

```ts
// 声明一个变量时，可以指定它为多种类型
//因为不确定是哪种类型，只能访问联合类型共有的属性和方法
let myFavoriteNumber: string | number
myFavoriteNumber = 'seven'
myFavoriteNumber =  7
```

### 数组与函数

```ts
// 定义后数组内只能存在这种类型的值
let fibonacci: number[] = [1,  1,  2,  3,  5]

// 限定输入类型和输出类型，及参数的个数
function sum (x: number, y: number): number {
  return x + y
}
sum(1, 2)
```

## TS 中的接口

```ts
// 用于定义对象的类型
// 定义好后，指定的变量多一个类型或少一个类型都不可以
interface Person = {
  name: string,
  age: number
}

let tom: Person = {
  name: 'Tom',
  age: 25
}

// 用可选类型和任意属性来灵活拓展，只读属性来设定不可修改
interface Person {
  readonly id: number
  name: string
  age?: number
  [propName: string]: any
}

let tom: Person = {
  id: 89757, // 创建时赋值后便不可修改
  name: 'Tom',
  gender: 'male'
}

// 定义数组接口和函数接口
interface Eg {
  [index: number]: number, // 数组类型
  (x: number, y: number): number// 函数类型
}
```

## TS 中的类

### ES6 的类
```ts
class Human{
  constructor (name) {
    this.name = name
  }
  sayHi () {
    return `My name is ${this.name}`
  }
  get name () { // 存取器
    return 'Jack'
  }
  set name (value) {
    console.log('setter:' + value)
  }
  static isHuman (a) { // 静态方法
    return a instanceof Human
  }
}

let a = new Human('Tom')
a.sayHi() // My name is Tome
Human.isHuman(a) // true

// 继承
class Chinese extend Human {
  constructor (name) {
    super(name) // 调用父类的 constructor(name)
  }
  sayHi()  {
    return 'China,' + super.sayHi() // 调用父类的 sayHi()
  }
}
```

### ES7 的类
```ts
// 支持在构造函数外定义变量
class Human{
  name: 'Tom'
  constructor () {
    // ...
  }
}

// 支持定义静态变量
class Human{
  static name = 'Tom'
  constructor () {
    // ...
  }
}

Human.name // Tom
```

### TS 的类
* 支持ES6、ES7的类定义
* 增加三种修饰符`public`、`private`、`protected`，对，和当年学 C++ 一模一样
* 支持抽象类（过于抽象，还不知道如何使用）
* 支持定义类型（和接口类似）

```ts
class Human{
  public name: string
  public constructor (name: string) {
    this.name = name
  }
  private sayHi (): string {
    return `My name is ${this.name}`
  }
}
```
