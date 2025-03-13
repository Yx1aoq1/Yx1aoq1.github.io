---
title: React初学笔记
categories:
  - React
tags:
  - React
date: 2025-03-13 12:19:28
---

### 应用入口

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode 启用组件树内部的额外开发行为和警告
// createRoot 以在浏览器 DOM 元素中创建根节点显示内容

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

### 创建组件

React 比较推崇的是函数式组件的写法，一个组件就是一个 function，return 的内容为一段 JSX 。组件的命名风格为大写驼峰，如果函数是组件则**一定需要以大写开头**，否则会报错。

```tsx
export default function Profile() {
  return <img src="https://i.imgur.com/MK3eW3Am.jpg" alt="Katherine Johnson" />
}
```

React 组件**必须返回单个 JSX 元素**，当有多个相邻元素时，需要使用 Fragment（`<>` 与 `</>`）包裹。

```tsx
export default function Square() {
  return (
    <>
      <button className="square">X</button>
      <button className="square">X</button>
    </>
  )
}
```

#### 定义 state 数据

封装一个 React 的组件的一个重要过程就是找出组件内精简且完整的 state 数据表示。那么什么是 state 呢？state 的作用是用来记录组件的状态和变化的，这些状态和变化主要是会通过一些用户交互而改变，这些改变又必须要同步到视图上。

通常，怎样的数据会是一个 state 呢？

- 在组件被创建到其销毁的过程中，这个数据是会变化的
- 这个数据不是根据其他 state 数据或 props 计算而得出的
- 这个数据需要在视图上进行展示

```tsx
import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  const handleClick = () => {
    // 多次更新同一个 state，需要用传入函数的方式更新
    setCount((v) => v + 1)
  }
  return (
    <>
      <h1>{count}</h1>
      <button onClick={handleClick}>update</button>
    </>
  )
}
```

在数据更新上，set 一个 state 数据有一个和 Vue 非常不一样的点，即对于引用类型数据的操作上。例如改变对象的某个属性，在 Vue 中，是可以改变原对象的某个属性去直接做修改的，如：

```tsx
obj.name = 'xxx'
```

但在 React 中则不同，React 遵循的是 immutable 编程规范，它要求在编写程序时避免对数据进行修改，而是应该创建新的数据副本来进行修改。这样的好处是可以避免出现意外的数据修改，提高程序的可靠性和可维护性。

```tsx
const [person, setPerson] = useState({
  name: 'xm',
  age: 18
})
const [personList, setPersonList] = useState([])
// 更新对象的某个属性
setPerson({
  ...user,
  name: 'xh'
})
// 向对象中新增元素
setPersonList([...personList, { name: 'li', age: 11 }])
setPersonList(personList.concat([{ name: 'li', age: 11 }]))
// 删除对象中的元素
setPersonList(personList.filter((p) => p.age < 20))
```

当然也可以安装[immer](https://zh-hans.react.dev/learn/updating-arrays-in-state#write-concise-update-logic-with-immer)插件，这样使用一些直接更改原数据的方法也没有问题了。

#### 组件通信

##### 父子通信

在 React 中，父组件与子组件如果需要进行数据传递，则需要通过 props 传参的方式来进行通信。

```tsx
import { useState } from 'react'

function MyInput({ value, onValueChange }) {
  return <input value={value} onChange={onValueChange} />
}

export default function App() {
  const [value, setValue] = useState('')
  const handleInput = (e) => {
    setValue(e.target.value)
  }
  return <MyInput value={value} onValueChange={handleInput} />
}
```

当然，React 中也有插槽，默认的插槽使用的是 children 这个变量名，也可以传入具名插槽。

```tsx
function Panel({ title, children, footer }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      <p>{children}</p>
      <div>{footer}</div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Panel title="关于" footer={<p>作者：A</p>}>
        阿拉木图人口约200万，是哈萨克斯坦最大的城市。它在 1929 年到 1997 年间都是首都。
      </Panel>
      <Panel title="词源" footer={<p>作者：B</p>}>
        这个名字来自于
        алма，哈萨克语中“苹果”的意思，经常被翻译成“苹果之乡”。事实上，阿拉木图的周边地区被认为是苹果的发源地，Malus
        sieversii 被认为是现今苹果的祖先。
      </Panel>
    </>
  )
}
```

##### 多层级组件间通信

对于多层级，如果用 props 一级一级传则有点麻烦，所以 React 给了一个`useContext`的 hooks：

```tsx
import { createContext, useContext } from 'react'

const ThemeContext = createContext('')

function Button() {
  const theme = useContext(ThemeContext)
  const className = 'button-' + theme
  return <button className={className}>submit</button>
}

export default function MyApp() {
  return (
    <ThemeContext.Provider value="dark">
      <Button />
    </ThemeContext.Provider>
  )
}
```

##### Reducer

对于拥有许多状态更新逻辑的组件来说，过于分散的事件处理程序可能会令人不知所措。对于这种情况，你可以将组件的所有状态更新逻辑整合到一个外部函数中，这个函数叫作 **reducer**。

```tsx
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)
```

使用`useReducer`与`useState`很类似，区别在于`dispatch`的用法，它传入的参数类似于一个发布订阅事件的订阅操作，需要传入对应的操作 type 与参数。如下的一个 TODO 列表的例子：

```tsx
import { useReducer } from 'react'
import AddTask from './AddTask.js'
import TaskList from './TaskList.js'

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text
    })
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task
    })
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId
    })
  }

  return (
    <>
      <h1>布拉格的行程安排</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList tasks={tasks} onChangeTask={handleChangeTask} onDeleteTask={handleDeleteTask} />
    </>
  )
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false
        }
      ]
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task
        } else {
          return t
        }
      })
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id)
    }
    default: {
      throw Error('未知 action: ' + action.type)
    }
  }
}

let nextId = 3
const initialTasks = [
  { id: 0, text: '参观卡夫卡博物馆', done: true },
  { id: 1, text: '看木偶戏', done: false },
  { id: 2, text: '打卡列侬墙', done: false }
]
```

#### 引用值 Ref

当你希望组件“记住”某些信息，但又不想让这些信息 [触发新的渲染](https://zh-hans.react.dev/learn/render-and-commit) 时，你可以使用 **ref**：

```tsx
import { useRef } from 'react'

export default function Counter() {
  let ref = useRef(0)

  function handleClick() {
    ref.current = ref.current + 1
    alert('你点击了 ' + ref.current + ' 次!')
  }

  return <button onClick={handleClick}>点我！</button>
}
```

也可以用 ref 来访问 DOM 元素：

```tsx
import { useRef } from 'react'

export default function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>聚焦输入框</button>
    </>
  )
}
```

#### Effect

useEffect 正如它的名字一样，他可以在函数组件中使用一些副作用，我们可以用来模拟一些生命周期操作。 useEffect 拥有两个参数，第一个参数是一个回调函数，它会在完成一些状态更新以及组件渲染后被触发，第二个参数是一个数组是一个可选的参数。

useEffect 的规则如下：

- 当第二个不存在时，在第一次初始化和每次重新渲染后都会触发回调。
- 当数组存在并有值时，如果数组中的任何值发生更改，则每次渲染后都会触发回调。
- 当它是一个空数组时，回调只会被触发一次，类似于 componentDidMount。
- 每个 useEffect 都可以返回一个清除函数。

```tsx
const serverUrl = 'https://localhost:1234'

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId)
    connection.connect()
    return () => {
      connection.disconnect()
    }
  }, [roomId])
  // ...
}
```

一般来说，useEffect 可以用来做例如需要在组件渲染销毁的生命周期时做事件的监听和卸载，或者是根据某写值的变化做一些回调动作。
