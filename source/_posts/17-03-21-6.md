---
title: JSON学习笔记
date: 2017-03-21 18:16:43
tags: [JSON]
---
> JSON = JavaScript Object Notation （JavaScript对象表示法）
> JSON 是存储和交换文本信息的语法，类似XML。它采用键值对的方式来组织，易于人们阅读和编写，同时也易于及其解析和生成
> JSON 是独立于语言的，也就是说不管什么语言，都可以解析json，只需要按照json的规则来就行

<!--more-->

## 与XML比较
* 长度比xml短
* 读写速度更快
* json可以使用Javascript内建的方法直接进行解析，转换成Javascript对象，非常方便

## 语法规则
* JSON数据的书写格式：名称/值对
名称/值对组合中的名称写在前面（在双引号中），值对写在后面（同样在双引号中），中间用冒号隔开：比如`"name":"jane"`
* 可以使用的数据类型
	* 数字（整数或浮点数）
	* 字符串（双引号）
	* 逻辑值（true or false）
	* 数组（ [...] ）
	* 对象（ {...} ）
	* null

## JSON解析
* eval和JSON.parse
* 尽可能使用`JSON.parse()`方法解析字符串本身，该方法可以捕捉JSON中的语法错误。eval使用存在风险，特别是第三方JSON数据存在恶意代码时。
```javascript
var jsondata = '{"staff":[{"name":"aaa","age":70},{"name":"bbb","age":12}]}';
var jsonobj = JSON.parse(jsondata);
//解析完毕
alert(jsonobj.staff[0].name);
//直接对对象进行操作
```
* **tip：** `JSON.stringify()`方法是将对象解析成JSON
```javascript
var a = {a:1,b:2}
JSON.stringify(a) //"{"a":1,"b":2}"
```