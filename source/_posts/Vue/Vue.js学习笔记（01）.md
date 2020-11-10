---
title: Vue.js学习笔记（01）
date: 2017-10-19 21:25:58
categories: 
  - Vue
tags: 
  - Vue
  - MVC
  - MVVM
---
> Vue.js 是用于构建交互式的 Web 界面的库。它提供了 MVVM 数据绑定和一个可组合的组件系统，具有简单、灵活的 API。

▼ **什么是MVVM：**
MVVM(Model View ViewModel)是一种基于MVC的设计，开发人员在HTML上写一些Bindings,利用一些指令绑定，就能在Model和ViewModel保持不变的情况下，很方便的将UI设计与业务逻辑分离，从而大大的减少繁琐的DOM操作。
* **Model**
代表我们整个webapp所需要的数据模型，一个典型的例子就是用户信息Model,它应该含有(姓名，年龄等属性)。Model含有大量信息，但它并不具有任何行为逻辑，它只是数据，因而它不会影响浏览器如何展示数据。
* **View**
View这个词出现频率最多的地方应该是MVC。在MVC设计中，View是唯一与用户交互的地方，或者说它是Model变化后的直观反映。在MVVM中，View被认为是主动的而非被动的。一个被动的View时只它只能任由“他人”（Controller）摆布，自己却不能改变任何东西，如利用Jquery操作DOM。而MVVM中View是具有主动性的，因为它包括了一些数据绑定，事件，和行为，这些都会直接影响Model和ViewModel的。它不但负责保持View自己身的行为（展示），而还会将自身的变化同步到ViewModel中。
* **ViewModel**
ViewModel可以被看作是MVC中的Controller,它主要负责数转换（用一定的业务逻辑），它负责将Model的变化反应到View上，而当View自身有变化时也会同步Model进行改变。你可以把ViewModel看作一个藏在View后面的好帮手，它把View需要的数据暴露给它，并且富于View一定的行为能力。

## MVC 和 MVVM 的比较

刚发现了一篇关于几个模型的博文[从Script到Code Blocks、Code Behind到MVC、MVP、MVVM](http://www.cnblogs.com/indream/p/3602348.html)
在这里，简单的对这两个比较常见的设计模型进行一些比较：

### MVC结构图

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/mvc.png)

### MVVM结构图

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/mvvm.png)

### MVC的优点

由于前端的发展，出现了多页应用和Web App这种东西，使得前端不仅仅做的是简单的数据展示了。使用MVC，有下列一些优点：
* 简化代码
* 减少重复
* 集中精神编写业务逻辑
* 易于扩充
* 数据触发事件
* 面向数据编程

### MVC缺点

MVC虽然将需求和UI的相关工作分化成了三份，但是由于它们三者的三角关系使得维护很成问题。**在MVC，当你有变化的时候你需要同时维护三个对象和三个交互，这显然让事情复杂化了。**

MVVM与MVC最大的区别在于，MVVM切断了View层和Model层的联系，让View层只和ViewModel层交互，而ViewModel再和Model层交互。在MVVM中，**View和ViewModel间没有了MVP的界面接口，而是直接交互，用数据“绑定”的形式让数据更新的事件不需要开发人员手动去编写特殊用例，而是自动地双向同步。**

随着HTML5的发展，Web App的应用越来越广泛，甚至能媲美Nativ eApp（大部分安卓或IOS应用），但随之也暴露出了三个痛点问题：
* 开发者在代码中大量调用相同的 DOM API, 处理繁琐 ，操作冗余，使得代码难以维护。
* 大量的DOM 操作使页面渲染性能降低，加载速度变慢，影响用户体验。
* 当 Model 频繁发生变化，开发者需要主动更新到View ；当用户的操作导致 Model 发生变化，开发者同样需要将变化的数据同步到Model 中， 这样的工作不仅繁琐，而且很难维护复杂多变的数据状态。

### MVVM优点

在MVVM中，ViewModel 通过双向数据绑定把 View 层和 Model 层连接了起来，而View 和 Model 之间的同步工作完全是自动的，无需人为干涉，因此开发者只需关注业务逻辑，不需要手动操作DOM, 不需要关注数据状态的同步问题，复杂的数据状态维护完全由 MVVM 来统一管理，这就完美的解决了以上的问题。

## Vue.js的MVVM应用

![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/vuejs.png)

* **Observer**：数据监听器，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者，内部采用Object.defineProperty的getter和setter来实现；
* **Compile**：指令解析器，它的作用对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数；
* **Watcher**：订阅者， 作为连接 Observer 和 Compile 的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数；
* **Dep**：消息订阅器，内部维护了一个数组，用来收集订阅者（Watcher），数据变动触发notify 函数，再调用订阅者的 update 方法


## 搭建开发环境

使用git，输入指令
```python
# 安装vue-cli
$ cnpm install -g vue-cli
# 创建一个基于 "webpack" 模板的新项目
$ vue init webpack my-project
# 安装依赖
$ cd my-project
$ cnmp install
# 开启项目
$ npm run dev
```

## 模板解析
`index.html`：放在项目根目录下，是项目的入口
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>blog-project</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- app为一个组件，默认调用src里的main.js -->
  </body>
</html>
```

`src/main.js`：注册组件app
```javascript
//import表示导入组件，ES6语法
import Vue from 'vue'   //导入vue框架
import App from './App'   //同级目录下的App.vue
import router from './router'   //同级目录下的router文件夹


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }  //注册一个app
})
```

`src/App.vue`：组件的主要代码，包括`template`、`script`、`style`
```html
<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view/>
    <!-- 渲染路径匹配到的视图组件，方便渲染你指定路由对应的组件 -->
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

`router/index.js`： 创建路由并配置路由映射 ，并通过export输出router到main.js文件中
```javascript
import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld' 
// 在这里引入另一个名为HelloWorld的组件
// 即components目录下的HelloWorld.vue

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: HelloWorld
    }
  ]
})
```