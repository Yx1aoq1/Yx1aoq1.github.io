---
title: TypeScript 高级类型声明
categories:
  - TypeScript
tags:
  - TypeScript
date: 2025-02-27 23:13:56
---

### 泛型

泛型通过一对尖括号来表示(`<>`)，尖括号内的字符被称为*类型变量*，这个变量用来表示类型。

```ts
interface GenericType<T> {
  id: number
  name: T
}

function showType(args: GenericType<string>) {
  console.log(args)
}

showType({ id: 1, name: 'test' })
// Output: {id: 1, name: "test"}

function showTypeTwo(args: GenericType<number>) {
  console.log(args)
}

showTypeTwo({ id: 1, name: 4 })
// Output: {id: 1, name: 4}}
```

### 高级类型

#### 交叉类型（&）

交叉类型说简单点就是将多个类型合并成一个类型，其语法规则和逻辑 “与” 的符号一致。

```ts
T & U
```

#### 联合类型（|）

联合类型的语法规则和逻辑 “或” 的符号一致，表示其类型为连接的多个类型中的任意一个。

```ts
T | U
```

#### 类型别名（type）

前面提到的交叉类型与联合类型如果有多个地方需要使用，就需要通过类型别名的方式，给这两种类型声明一个别名。类型别名与声明变量的语法类似，只需要把  `const`、`let`  换成  `type`  关键字即可。

```ts
type Alias = T | U
```

##### `type`和`interface`的相同点与不同点

- 都可以描述一个对象或者函数
  
  ```ts
  interface User {
    name: string
    age: number
  }
  
  interface SetUser {
    (name: string, age: number): void
  }
  
  type User = {
    name: string
    age: number
  }
  
  type SetUser = (name: string, age: number): void
  ```
* 都可以实现类型的拓展，但是语法不相同
  
  ```ts
  interface Name {
    name: string
  }
  
  interface User extends Name {
    age: number
  }
  
  type Name = {
    name: string
  }
  
  type User = Name & { age: number }
  ```

* `type`可以声明基本类型别名，联合类型，元组等类型，但是`interface`不行

* 当有重名的`interface`声明时，ts 会自动合并声明，但是`type`不行

#### 类型索引（keyof）

`keyof`  类似于  `Object.keys` ，用于获取一个接口中 Key 的联合类型。

```ts
interface Button {
  type: string
  text: string
}

type ButtonKeys = keyof Button
// 等效于
type ButtonKeys = 'type' | 'text'
```

#### 类型约束（extends）

这里的  `extends`  关键词不同于在 class 后使用  `extends`  的继承作用，泛型内使用的主要作用是对泛型加以约束。

```ts
type BaseType = string | number | boolean

// 这里表示 copy 的参数
// 只能是字符串、数字、布尔这几种基础类型
function copy<T extends BaseType>(arg: T): T {
  return arg
}
```

`extends`  经常与  `keyof`  一起使用，例如我们有一个方法专门用来获取对象的值，但是这个对象并不确定，我们就可以使用  `extends`  和  `keyof`  进行约束。

```ts
function getValue<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}

const obj = { a: 1 }
const a = getValue(obj, 'a')
```

#### 类型映射（in）

`in`  关键词的作用主要是做类型的映射，遍历已有接口的 key 或者是遍历联合类型。下面使用内置的泛型接口  `Readonly`  来举例。

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

interface Obj {
  a: string
  b: string
}

type ReadOnlyObj = Readonly<Obj>
```

`P in keyof T`相当于`P in 'a' | 'b'` ，相当于执行了一次 forEach 的逻辑

最后等同的效果为：

```ts
interface ReadOnlyObj {
  readonly a: string
  readonly b: string
}
```

#### 条件类型（U ? X : Y）

条件类型的语法规则和三元表达式一致，经常用于一些类型不确定的情况。

```ts
T extends U ? X : Y
```

### 工具泛型

#### Partial

用于将一个接口的所有属性设置为可选状态

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

#### Required

与  `Partial`  相反，就是将接口中所有可选的属性改为必须的。

```ts
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

#### Readonly

会转换类型的所有属性，以使它们无法被修改

```ts
interface ReadonlyType {
  id: number
  name: string
}

function showType(args: Readonly<ReadonlyType>) {
  args.id = 4
  console.log(args)
}

showType({ id: 1, name: 'Doe' })
// Error: Cannot assign to 'id' because it is a read-only property.
```

#### Record

此工具可帮助你构造具有给定类型`T`的一组属性`K`的类型。将一个类型的属性映射到另一个类型的属性时，`Record`非常方便。

```ts
interface EmployeeType {
  id: number
  fullname: string
  role: string
}

let employees: Record<number, EmployeeType> = {
  0: { id: 1, fullname: 'John Doe', role: 'Designer' },
  1: { id: 2, fullname: 'Ibrahima Fall', role: 'Developer' },
  2: { id: 3, fullname: 'Sara Duckson', role: 'Developer' }
}
```

#### Pick

用于提取接口的某几个属性

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

```ts
interface Todo {
  title: string
  completed: boolean
  description: string
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false
}
```

#### Omit

`Omit`的作用与`Pick`类型正好相反。 不是选择元素，而是从类型`T`中删除`K`个属性。

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

```ts
interface Todo {
  title: string
  completed: boolean
  description: string
}

type TodoPreview = Omit<Todo, 'description'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false
}
```

#### Extract

`Extract`允许你通过选择两种不同类型中的共有属性来构造新的类型。也就是从`T`中提取所有可分配给`U`的属性。

```ts
Extract<T, U>
```

```ts
interface FirstType {
  id: number
  firstName: string
  lastName: string
}

interface SecondType {
  id: number
  address: string
  city: string
}

type ExtractType = Extract<keyof FirstType, keyof SecondType>
// Output: "id"
```

#### Exclude

与`Extract`不同，`Exclude`通过排除两个不同类型中已经存在的共有属性来构造新的类型。  它会从`T`中排除所有可分配给`U`的字段。

```ts
Exclude<T, U>
```

```ts
interface FirstType {
  id: number
  firstName: string
  lastName: string
}

interface SecondType {
  id: number
  address: string
  city: string
}

type ExcludeType = Exclude<keyof FirstType, keyof SecondType>

// Output; "firstName" | "lastName"
```
