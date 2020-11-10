---
title: 【JS设计模式】迭代器模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-08-19 17:03:52
---
## 迭代器模式

迭代器模式的定义：

> 提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。迭代器模式在很多语言中，一般用于定义一种统一的数据访问接口，使得多种数据结构都可以用统一的方式进行遍历。

### JavaScript 中的迭代器

**▼JQuery中的迭代器**

```js
$.each([1, 2, 3], function (i, n) {
  console.log('当前下标：' + i)
  console.log('当前的值：' + n)
})

// 遍历jQuery对象
// 例如有如下的一个html片段
/*
<ul id="list">
	<li>114</li>
 	<li>514</li>
</ul>
*/
$('#list li').each(function (i, n) {
  console.log($(n).text())
})
```

**▼Array的forEach方法**

```js
const arr = [1, 2, 3]
arr.forEach((v, i) => {
  console.log('当前下标：' + i)
  console.log('当前的值：' + v)
})
```

**▼实现一个each函数**

```js
const each = function (ary, callback) {
  for (let i = 0, l = ary.length; i < l; i ++) {
    callback.call(ary[i], i, ary[i]) // 把下标和元素当作参数传给callback
  }
}

each([1, 2, 3], (i, n) => {
  console.log([i, n])
})
```

### 内部迭代器

上面实现的`each`函数，函数内部已经定义好了迭代规则，它完全接手整个迭代过程，外部只需要一次初始调用。这就是内部迭代器。由于内部迭代器的迭代规则已经被提前规定，`each`函数无法同时迭代两个数组。

比如需要判断两个数组的值是否完全相等时，使用`each`函数实现：

```js
const compare = function (ary1, ary2) {
  if (ary1.length !== ary2.length) {
    throw new Error('ary1 和 ary2 不相等')
  }
  each(ary1, (i, n) => {
    if (n !== ary2[i]) {
      throw new Error('ary1 和 ary2 不相等')
    }
  })
  console.log('ary1 和 ary2 相等')
}
```

### 外部迭代器

外部迭代器必须显式地请求迭代下一个元素。外部迭代器增加了一些调用的复杂度，但相对也增强了迭代器的灵活性，可以手工控制迭代的过程或顺序。

```js
const Iterator = function (obj) {
  let current = 0
  
  const next = function () {
    current += 1
  }
  
  const isDone = function () {
    return current >= obj.length
  }
  
  const getCurrItem = function () {
    return obj[current]
  }
  
  return {
    next,
    isDone,
    getCurrItem
  }
}
```

使用外部迭代器实现`compare`函数：

```js
const compare = function (iterator1, iterator2) {
  while (!iterator1.isDone() && !iterator2.isDone()) {
    if (iterator1.getCurrItem() !== iterator2.getCurrItem()) {
      throw new Error('ary1 和 ary2 不相等')
    }
    iterator1.next()
    iterator2.next()
  }
  console.log('ary1 和 ary2 相等')
}

const iterator1 = Iterator([1, 2, 3])
const iterator2 = Iterator([1, 2, 3])

compare(iterator1, iterator2)
```

### 倒序迭代器

```js
const reverseEach = function (ary, callback) {
  for (let l = ary.length - 1; l >= 0; l --) {
    callback(l, ary[l])
  }
}
```

### 中止迭代器

```js
const each = function (ary, callback) {
  for (let i = 0, l = ary.length; i < l; i ++) {
    if (callback(i, ary[i]) === false) {
      break
    }
  }
}
```

## 迭代器模式的应用

### ES6中的for...of与Iterator模式

```js
const arr = [1,1,4,5,1,4]
 
for(let item of arr) {
  console.log(item)
}
```

使用`for...of`遍历数组，也是一种外部迭代器模式。在ES6中，一种数据结构只要按照规定实现了`Iterator`接口，就可以使用`for...of`来循环遍历。默认的`Iterator`接口部署在数据结构的`Symbol.iterator`属性。或者说，只要一个数据结构具有`Symbol.iterator`属性，就可以任务是“可遍历的”。

```js
let myObj = {
  [Symbol.iterator]: function () {
    let index = 0
    return {
      next: function () {
        index ++
        return {
          value: index,
          done: index >= 10
        }
      }
    }
  }
}
// for...of遍历
for (let i of myObj) {
  console.log(i)
}

// 也可以直接获取这个迭代器进行遍历
let it = myObj[Symbol.iterator]()
for (let i = it.next(); i.done !== true; i = it.next()){
  console.log(i.value)
}
```

ES6原生具备Iterator接口的数据结构有下面几种：

* Array
* Map
* Set
* String
* TypedArray（数组内的元素只能是强类型的数值，例如int8, int16，用于直接操作底层二进制数据）
* 函数的 arguments 对象
* NodeList （dom元素的子节点列表）

文章参考：
《JavaScript设计模式与开发实践》