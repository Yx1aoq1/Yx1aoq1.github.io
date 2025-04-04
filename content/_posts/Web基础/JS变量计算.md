---
title: JS变量计算
date: 2017-08-24 20:53:29
categories: 
  - Web基础
tags: 
  - JavaScript
---
## typeof 运算符

```javascript
typeof undefined // undefined
typeof 'abc' // string
typeof 123 // number
typeof true // boolean
typeof {} // object
typeof [] // object
typeof null // object
typeof console.log // function
```

## 变量运算 - 强制类型转换

### 字符串拼接

```javascript
var a = 100 + 10 // 110
var b = 100 + '10' // '10010'
```
当使用减运算时：
```javascript
var c = '100' - 10 // 90
```

### == 运算符

```javascript
100 == '100' // true
0 == '' // true
null == undefined // true
```
`==`与`===`的区别：`===`是严格等于，只有类型完全相同才会返回`true`
```javascript
null === null
undefined === undefined
null === undefined // false
NaN === NaN // false
```
什么时候用`==`什么时候用`===`：jQuery源码中推荐写法，只有下述情况才用`==`，其他时候都用`===`。
```javascript
if(a == null) {
  // 这里相当于 a === null || a === undefined
}
```

### if语句

```javascript
var a = true;
if(a) { //... } 

var b = 100; // true
if(b) { //... }

var c = ''; // false
if(c) { //... }
```
`if`中被判定为`false`的几个值：`0`,`NaN`,`''`,`null`,`undefined`

### 逻辑运算

```javascript
console.log(10 && 0) // 0
console.log('' || 'abc') // 'abc'
console.log(!window.abc) // true

// 判断一个变量会被当做 true 还是 false
var a = 100;
console.log(!!a) //true
```