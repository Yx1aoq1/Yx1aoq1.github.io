---
title: Vue响应式原理（03）
categories:
  - Vue
tags:
  - Vue
date: 2020-12-01 20:58:09
---
在前面两篇响应原理解析中，主要是实现了`Vue`中的`data`与`methods`与视图的交互，而这篇主要是要唠一唠`watch`与`computed`的具体实现，完善重要的`Watcher`类。

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
      console.log(oldValue, '-->' , newValue)
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

为了发现**对象内部值**的变化，可以在选项参数中指定 `deep: true`。注意监听数组的变更不需要这么做。如果数组元素中含有对象，则可以监听到数组内部对象的变化。

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

而`$watch`的实现，实际上是对`Watcher`对象的一种封装，它主要是处理的是`immediate`，实际上`immediate`就是在创建`Watcher`对象后立即执行回调函数。在使用`Vue`的时候，有时候我们会将在`created`执行的一些处理用`immediate`替代，**但是需要注意的是，`immediate`的执行是早于`created`的**。

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

由于多了一个`deep`的配置项，我们在`Watcher`中需要新增一个`options`的入参，以及多了一个解除监听的`teardown`方法：

```js
export default class Watcher {
  constructor (
    vm,
    expOrFn,
    cb,
    options
  ) {
    vm._watchers.push(this)
    // 新增传入配置项deep
    if (options) {
      this.deep = !!options.deep
    } else {
      this.deep = false
    }
    this.vm = vm
    this.cb = cb
    this.id = ++uid
    // 存放Dep依赖的数组
    this.deps = []
    this.depIds = new Set()
    this.expression = expOrFn.toString()
    // expOrFn支持传入函数，如果是函数，直接赋值给getter
    // 当执行getter时，会同时触发expOrFn中所依赖的参数的依赖收集
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 当expOrFn不是函数时，则是类似`a.b.c`这样的属性路径
      // parsePath主要功能就是返回一个函数，函数的执行结果则是获取该路径的值
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
      }
    }
    this.value = this.get()
  }

  get () {
    pushTarget(this)
    const vm = this.vm
    // 这里的 this.getter 会触发对应data的defineProperty
    // 触发后会将这个Watcher添加到Dep的队列中
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      // 当deep为true时，收集子属性的依赖
      traverse(value)
    }
    // 执行完成后退出Watcher队列
    popTarget()
    return value
  }

  addDep (dep) {
    const id = dep.id
    // 保证同一数据不会被添加多个观察者
    if (!this.depIds.has(id)) {
      // 将自己加入到当前dep的subs队列
      this.depIds.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  update () {
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }

  teardown () {
    // 获取这个观察对象的所有依赖
    // 在所有依赖中遍历地删掉当前的观察对象
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}
```

在上面的代码中，如果传入了`deep`配置，则需要在执行`popTarge()`之前调用`traverse`来处理`deep`的逻辑，这样才能保证子集收集的依赖是当前这个`Watcher`。

`traverse`实际上做的就是递归遍历`value`的所有子属性，来触发它的依赖：

```js
const seenObjects = new Set()

export function traverse (val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    // 如果传入的值不是数组、对象，或者已被冻结，那么直接返回
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    // 如果传入的之是一个响应对象，收集其依赖
    // 并且保证收集的依赖id不会重复
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    // 对数组对象进行遍历
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    // 对对象类型的数据遍历所有的key
    // 在使用val[key[i]]的时候，会触发getter
    // 由于这个步骤是在popTarge()之前触发的，所以当前的Watcher会被收集
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
```

## Computed

`computed`有两种设值方式，下面我们用这个例子来解析一下过程：

```js
var app = new Vue({
  el: '#app',
  data: {
    name: 'World',
  },
  computed: {
    message () {
      return `Hello,${this.name}`
    },
    message2: {
      get: function () {
        return `Goodbye, ${this.name}`
      },
      set: function (value) {
        this.name = Math.random()
      }
    }
  },
  methods: {
    changeMsg () {
      this.message2 = '1'
    }
  }
})
```

### initComputed

我们知道计算属性的结果会被缓存，且只有在计算属性所依赖的响应式属性或者说计算计算属性的返回值发生变化时才会重新计算。我们配置了一个`lazy`参数，当`lazy`值被设置为`true`的`Watcher`对象，不会立即求值。

```js
const computedWatcherOptions = { lazy: true }

function initComputed (vm, computed) {
  // Object.create(null)创建出来的对象没有原型，它不存在__proto__属性
  const watchers = vm._computedWatchers = Object.create(null)
  // 遍历computed上定义的key
  for (const key in computed) {
    const userDef = computed[key]
    // 处理computed的两种定义方式
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 生成一个Watcher对象
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    )
    // 将computed定义的key挂载到Vue实例上，为了可以通过this.xxx获取
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
  }
}

function defineComputed (target, key, userDef) {
  // 初始化getter与setter
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? createComputedGetter(key)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  // 将定义的computed key 定义到vm实例上，并且配置的getter与setter进行数据劫持
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

### 对计算属性进行数据劫持

```js
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```

可以发现`computed`上的属性的`getter`和我们原来在`defineReactive`定义的`getter`是有不同的。它通过`watcher.dirty`属性来判断是否要对值进行重新计算。

```js
export default class Watcher {
  constructor (
    vm,
    expOrFn,
    cb,
    options
  ) {
    vm._watchers.push(this)
    if (options) {
      this.deep = !!options.deep
      this.lazy = !!options.lazy
    } else {
      this.deep = this.lazy = false
    }
    this.vm = vm
    this.cb = cb
    this.id = ++uid
    // computed计算属性使用的参数
    this.dirty = this.lazy
    // 存放Dep依赖的数组
    this.deps = []
    this.depIds = new Set()
    this.expression = expOrFn.toString()
    // expOrFn支持传入函数，如果是函数，直接赋值给getter
    // 当执行getter时，会同时触发expOrFn中所依赖的参数的依赖收集
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 当expOrFn不是函数时，则是类似`a.b.c`这样的属性路径
      // parsePath主要功能就是返回一个函数，函数的执行结果则是获取该路径的值
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
      }
    }
    // lazy 为 true 的 Watcher，不会立即计算出结果 
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  get () {
    pushTarget(this)
    const vm = this.vm
    // 这里的 this.getter 会触发对应data的defineProperty
    // 触发后会将这个Watcher添加到Dep的队列中
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      // 当deep为true时，收集子属性的依赖
      traverse(value)
    }
    // 执行完成后退出Watcher队列
    popTarget()
    return value
  }
	// 触发computed计算
  // 计算完成之后dirty则会被设置为false
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  addDep (dep) {
    const id = dep.id
    // 保证同一数据不会被添加多个观察者
    if (!this.depIds.has(id)) {
      // 将自己加入到当前dep的subs队列
      this.depIds.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  update () {
    // 判断是否是lazy watcher，如果是，则将dirty设置为true
    // 当数据被使用的时候，就会触发对应的getter，这个时候就会触发evaluate计算结果
    if (this.lazy) {
      this.dirty = true
    } else {
      this.run()
    }
  }

  run () {
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }

  teardown () {
    // 获取这个观察对象的所有依赖
    // 在所有依赖中遍历地删掉当前的观察对象
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}
```







