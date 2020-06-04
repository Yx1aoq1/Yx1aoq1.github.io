---
title: Vue.js学习笔记（02）
date: 2018-07-25 20:13:45
categories: 
  - Vue相关
tags: 
  - Vue
  - Vue生命周期
---
## Vue实例化输入的选项对象[基本介绍](https://cn.vuejs.org/v2/api/#data)

当我们`new`一个Vue实例的时候，包含了如下几个基本的属性：

### data

**作用：**声明双向绑定的数据，可以是对象或者函数，**当定义组件的时候，`data`只能是函数**


```html
<template>
  <div id="app">hello, {{ name }}</div>
</template>
```
```js
var app = new Vue({
  el: '#app',
  data: {
    name: 'xiaoming'
  }
})
```

### props

**作用：**用于接受来自父组件的数据，对象允许配置高级选项，如类型检测`type`，自定义校验`require validator`，默认值`default`
```html
<blog-post title="my Vue"></blog-post>
```
```js
Vue.component('blog-post', {
  props: ['title'],
  template: '<h3>{{ title }}</h3>'
})
// 比较简单的组件示例，在项目中并不会这样使用组件，而是通过路由的方式
```
▼ **设置默认和校验**
```js
Vue.component('bkog-post', {
  props: {
    title: {
      type: String,
      default: 'title',
      required: true,
      validator: function (value) {
        return value != 'abc'
      }
    }
  }
})
```

### propsData

**作用：**创建实例时传递`props`，主要作用是方便测试。基本上，没有用过

### computed

**作用：**用来定义一些需要计算得到的数据，计算的结果会被缓存，除非依赖的响应式属性变化才会重新计算
```js
var vm = new Vue({
  data: { a: 1 },
  computed: {
    aDouble () {
      return this.a * 2
    }
  }
})
```

### methods

**作用：**用来定义实例的一些处理方法，如绑定的事件等。**注意，在`methods`不能使用箭头函数来定义函数**
```js
var vm = new Vue({
  data: { a: 1 },
  methods: {
    plus () {
      this.a ++
    }
  }
})
```

### watch

**作用：**用来观察实例中数据的变化。数据类型可以是字符串、函数、对象和数组。**同样，不能使用箭头函数来定义函数**
```js
var vm = new Vue({
  data: { a: 1, b: 2， c: 3 },
  watch: {
    a (curVal, oldVal) {
      console.log(`new: %s, old: %s`, curVal, oldVal)
    },
    b: 'someMethod', // 这里的someMehod是对应的处理函数的名字
    c: {
      handler: function (curVal, oldVal) { /*...*/ },
      deep: true, //深度 watcher，为了发现对象内部值的变化
      immediate: true // 立即以表达式的当前值触发回调
    }
  }
})
```

## Vue的生命周期

每个Vue实例被创建时，都会经历一系列的初始化过程，同时也会调用相应的生命周期钩子，我们可以利用这些钩子，在合适的时机执行相应的操作，下图即是官网上的生命周期图示：
![](https://cn.vuejs.org/images/lifecycle.png)

## 生命周期钩子函数

<span style="font-size: 20px; color: #199475;">▶ **beforeCreate**</span> 实例创建前，此时无法访问到`el`属性和`data`属性

---

<span style="font-size: 20px; color: #199475;">▶ **created**</span> 实例创建完成，属性已经绑定，但是DOM还未生成，`el`属性还无法访问

▼ **关于属性**
不仅仅是`data`属性，还有`props`和`method`都在`created`的时候绑定完成

---
<span style="font-size: 20px; color: #199475;">▶ **beforeMount**</span> 模板编译/挂在之前，**只有绑定了`el`属性，才会执行到这里，否则到`created`就已经停止生命周期**

▼ **关于模板编译的顺序**
* 当实例对象中有`template`参数的时候，则将其作为模板编译成`render`函数
* 如果没有`template`参数时，则将外部HTML作为模板编译
* 在Vue对象中还有一个`render`函数，它是以`createElement`作为参数，然后做渲染操作，可以直接嵌入JSX，它的执行优先级高于`template`与`outer HTML`

---

<span style="font-size: 20px; color: #199475;">▶ **mounted**</span> 模板编译/挂在之后，**此时data数据绑定在页面上是以虚拟DOM的形式存在的**

---

<span style="font-size: 20px; color: #199475;">▶ **beforeUpdate && updated**</span> data数据更新之前 && 更新之后，组件重新渲染

---

<span style="font-size: 20px; color: #199475;">▶ **beforeDestroy && destroyed**</span> 实例销毁之前 && 销毁之后，销毁之后所有的绑定都会被解除，事件监听也会被移除，同时子实例也同时被销毁