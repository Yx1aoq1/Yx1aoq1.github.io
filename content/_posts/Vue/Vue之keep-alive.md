---
title: Vue之keep-alive使用指南
author: Yx1aoq1
tags:
  - Vue
categories:
  - Vue
date: 2020-01-16 16:11:00
---
## 需求

在做业务的时候经常会碰到这样的互动需求：

* 用户前进时，总是进入一个新的页面（不使用缓存）
* 用户后退时，需要保留之前的操作（使用缓存）

在`vue-router`中，切换路由时并不会保存组件的状态，而是会重新创建新组件，走一遍完整的生命周期，我们要实现上面的需求，就需要使用`keep-alive`组件来解决。

## [keep-alive](https://cn.vuejs.org/v2/api/#keep-alive)

通过结合`router-view`我们就可以实现缓存页面的问题：

```html
<keep-alive>
  <router-view v-if="isKeepAlive" :key="keepAliveKey" transition transition-mode="out-in"></router-view>
</keep-alive>
<router-view v-if="!isKeepAlive" transition transition-mode="out-in"></router-view>
```

`isKeepAlive`的判断可以通过`$route.meta`来配置哪些路由需要缓存，而`keepAliveKey`可以简单的使用`$route.fullPath`，根据使用场景而定。

因为使用了`keep-alive`，不论是前进还是后退，我们总会进入到缓存的组件，那么怎么才能进入新页面呢？首先可以想到的是使用`$destroy`删除组件，但是实际操作的时候发现缓存依然存在。于是通过万能的搜索找到了一个解决方案：[Vue 全站缓存之 keep-alive ： 动态移除缓存](https://juejin.im/post/5b610da4e51d45195c07720d#heading-1)

简而言之就是需要自己找到`keep-alive`的实例手动删除，并销毁组件。


```js
const destroy = (key) => {
  // 找到keepAlive组件
  const keepAliveVm = global.keepAliveVm // 具体怎么找到keeyAlive组件自己看情况
  const cache = keepAliveVm.cache
  cosnt keys = keepAliveVm.keys
  // 删除keys
  if (keys.indexOf(key) > -1) keys.splice(keys.indexOf(key), 1)
  // 删除cache
  delete cache[key]
  // $destroy组件
  vnodes[key].$destroy()
}
```

▼ **注意点：** 在使用`max`时同样会存在缓存不删除的情况，需要自己手动删除。

## 需求实现

### 如何判断页面的前进后退

我们可以在配置路由时，给每个页面设置层级关系：

```js
routes: [
  { path: '/list', component: List, meta: { level: 1 } },
  { path: '/edit', component: Edit, meta: { level: 2 } }
]
```

然后在Vue全局注册一个混入方法，在每次路由切换的时候判断层级变化，控制是否要删除缓存：

```js
Vue.mixin({
  befroeRouteLeave (to, from, next) {
    if (from && from.meta.level && to.meta.level && from.meta.level > to.meta.level) {
      // 如果是后退，则删除组件缓存
      const keepAliveVm = this.$vnode.parent.componentInstance
      const { keys, cache } = keepAliveVm
      const key = this.$route.fullPath
      if (keys.indexOf(key) > -1) keys.splice(keys.indexOf(key), 1)
      delete cache[key]
      this.$destroy()
    }
  }
})
```

### 如何触发缓存页面数据的更新

如果使用了`keep-alive`，再重新渲染这个组件的时候不会再触发生命周期的`created`和`mounted`，而是触发`activated`。所以我们可以在`activated`中去执行我们想要的数据更新：

```js
Vue.mixin({
  created () {
    this.pageEnter && this.pageEnter()
  },
  activated () {
    this.pageEnter && this.pageEnter()
  }
})
```