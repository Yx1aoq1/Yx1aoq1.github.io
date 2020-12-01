---
categories:
  - Vue
---
在前面两篇响应原理解析中，主要是实现了`Vue`中的`data`与`methods`与视图的交互，而这篇主要是要唠一唠`watch`与`computed`的具体实现。

## Watch

还是用那个老例子，在`new Vue`时，我们加了一个`watch`监听`message`的变化，在监听到变化的时候在控制台打印出旧值与新值：

```js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  watch: {
    message: function (newValue, oldValue) {
      console.log(`${oldValue} --> ${newValue}`)
    }
  },
  methods: {
    changeMsg () {
      this.message = 'Hello World!'
    }
  }
})
```

### initWatch

我们在实例化`Vue`的`initState`过程中加上一个`initWatch`的方法：

```js
function initWatch (vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      // handler可以是多个回调函数的数组
      // 对每个回调函数按顺序创建watcher
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

`initWatch`的实际作用就是批量调用`createWatcher`来处理需要监听的`key`。而`createWatcher`内部实际调用的是`Vue`提供的实例方法`$watch`。

```js
function createWatcher (vm, expOrFn, handler, options) {
  // 判断handler的是否是对象，如果是对象则是有传入options的情况
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 如果传入的handler是字符类型，说明对应的回调函数被定义在vm实例上
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```
### 实现$watch

这里我们回顾一下文档上`$watch`的用法：

`vm.$watch( expOrFn, callback, [options] )`

* **参数**：
  * `{string | Function} expOrFn`
  * `{Function | Object} callback`
  * `{Object} [options]`
    * `{boolean} deep`
    * `{boolean} immediate`
* **返回值**：`{Function} unwatch`
* **用法**：

```js
// 键路径
vm.$watch('a.b.c', function (newVal, oldVal) {
  // 做点什么
})

// 函数
vm.$watch(
  function () {
    // 表达式 `this.a + this.b` 每次得出一个不同的结果时
    // 处理函数都会被调用。
    // 这就像监听一个未被定义的计算属性
    return this.a + this.b
  },
  function (newVal, oldVal) {
    // 做点什么
  }
)

// 返回一个取消观察函数，用来停止触发回调：
var unwatch = vm.$watch('a', cb)
// 之后取消观察
unwatch()
```

* **选项：deep**

为了发现对象内部值的变化，可以在选项参数中指定 `deep: true`。注意监听数组的变更不需要这么做。

```js
vm.$watch('someObject', callback, {
  deep: true
})
vm.someObject.nestedValue = 123
// 触发回调函数
```

* **选项：immediate**

在选项参数中指定 `immediate: true` 将立即以表达式的当前值触发回调：

```js
vm.$watch('a', callback, {
  immediate: true
})
// 立即以 `a` 的当前值触发回调
```

而`$watch`的实现，实际上是对`Watcher`对象的一种封装，`$watch`中主要是处理`immediate`，实际上`immediate`就是在创建`Watcher`对象后立即执行回调函数。在使用`Vue`的时候，有时候我们会将在`created`执行的一些处理用`immediate`替代，**但是需要注意的是，`immediate`的执行是早于`created`的**。

```js
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this
  // 判断传入的cb是否是一个对象，如果是对象则调用createWatcher进行处理
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  // 生成一个Watcher对象
  const watcher = new Watcher(vm, expOrFn, cb, options)
  // 配置immediate为true，立即执行传入的回调函数
  if (options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
```

### 完善Watcher类



