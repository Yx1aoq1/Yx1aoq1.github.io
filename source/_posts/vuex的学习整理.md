---
title: vuex的学习整理
date: 2019-05-09 20:22:24
categories: Vue相关
tags:
  - Vuex
---
## Vuex是什么
> Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

上面是copy自官方的解释，在我的理解看来，vuex相当于复杂版的evenBus，管理项目中一些各个地方都需要使用到的数据，各个地方可能触发的事件。

## 示例
先写一个十分简单的vuex
```js
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: 'todo one', done: true },
      { id: 2, text: 'todo two', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    }
  },
  mutations: {
    setTodoDone (state, index) {
      state.todos[index].done = true
    }
  },
  actions: {
    setTodoDoneAfterTime (state, time) {
      setTimeout(() => {
        state.todos.map(todo => {
          todo.done = true
        })
      }, time)
    }
  }
})

store.commit('setTodoDone', 2) // 触发 mutations
store.dispatch('setTodoDoneAfterTime', 1000) // 触发 actions
```

## 核心概念
### State
存储状态数据，每次变化时可以触发vue的computed，并触发更新相关联的DOM
```js
export default {
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
```

但是如果每次取值都要通过声明一个计算属性，那未免也太过麻烦了，所以vuex提供了一个简便的方法`mapState`
```js
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from 'vuex'

export default {
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,
    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',
    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState (state) {
      return state.count + this.localCount
    }
  })
}
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 `mapState` 传一个字符串数组
```js
computed: mapState([
  // 映射 this.count 为 store.state.count
  'count'
])
```

### Getter
类似于vue中的computed，获取从store中派生出的一些状态，例如对列表进行过滤并计数，并且与computed一样可以缓存状态的变化
同样，在获取getters时也有一个简便的方法`mapGetters`
```js
import { mapGetters } from 'vuex'

export default {
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
```

如果你想将一个 getter 属性另取一个名字，使用对象形式：
```js
mapGetters({
  // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
  doneCount: 'doneTodosCount'
})
```

### Mutation
更改store中状态的唯一方法就是提交mutation，mutation其实就类似与事件的触发
**注意点：**
* 对象添加新属性时和vue中一样，必须使用set方法才能触发更新，或者使用新对象替换老对象

```js
state.obj = {...state.obj, newProp: 123}
```

* 使用常量替代Mutation事件类型

```js
// mutation-types.js
export const SOME_MUTATION = 'SOME_MUTATION'
```
```js
// store.js
import Vuex from 'vuex'
import { SOME_MUTATION } from './mutation-types'

const store = new Vuex.Store({
  state: { ... },
  mutations: {
    // 我们可以使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
    [SOME_MUTATION] (state) {
      // mutate state
    }
  }
})
```

* Mutation 必须是同步函数
* 辅助函数 `mapMutations`

```js
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

### Actions
Action 类似于 mutation，不同在于：
* Action 提交的是 mutation，而不是直接变更状态。
* Action 可以包含任意异步操作。
* `mapActions`

```js
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

### Module
对复杂的store对象进行模块的划分
```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

**注意点：**
* 默认情况下，模块内部的 action、mutation 和 getter 是注册在**全局命名空间**的——这样使得多个模块能够对同一 mutation 或 action 作出响应。如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。

```js
// 触发绑定命名空间的state mapGetters等函数时
computed: {
  ...mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
methods: {
  ...mapActions('some/nested/module', [
    'foo', // -> this.foo()
    'bar' // -> this.bar()
  ])
}
```
