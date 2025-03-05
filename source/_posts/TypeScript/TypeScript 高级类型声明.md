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

交叉类型说简单点就是将多个类型合并成一个类型，其语法规则和逻辑 “与” 的符号一致。这意味着你可以将给定的类型 A 与类型 B 或更多类型合并，并获得具有所有属性的单个类型。

```ts
T & U
```

```ts
type LeftType = {
  id: number
  left: string
}

type RightType = {
  id: number
  right: string
}

type IntersectionType = LeftType & RightType

function showType(args: IntersectionType) {
  console.log(args)
}

showType({ id: 1, left: 'test', right: 'test' })
// Output: {id: 1, left: "test", right: "test"}
```

#### 联合类型（|）

联合类型的语法规则和逻辑 “或” 的符号一致，表示其类型为连接的多个类型中的任意一个。联合类型使你可以赋予同一个变量不同的类型。

```ts
T | U
```

```ts
type UnionType = string | number

function showType(arg: UnionType) {
  console.log(arg)
}

showType('test')
// Output: test

showType(7)
// Output: 7
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

#### NonNullable

从`T`中剔除`null`和`undefined`

```ts
NonNullable<T>
```

```ts
type NonNullableType = string | number | null | undefined

function showType(args: NonNullable<NonNullableType>) {
  console.log(args)
}

showType('test')
// Output: "test"

showType(1)
// Output: 1

showType(null)
// Error: Argument of type 'null' is not assignable to parameter of type 'string | number'.

showType(undefined)
// Error: Argument of type 'undefined' is not assignable to parameter of type 'string | number'.
```

### infer 关键字

`infer`这个词的含义即 推断，实际作用可以用四个字概括：**类型推导**。它会在类型未推导时进行占位，等到真正推导成功后，它能准确地返回正确的类型。

举个例子，我们在解包数组里的数据类型时，如果不使用`infer`，通常是按以下方式去做的：

```ts
type Ids = number[]
type Names = string[]

type Unpacked<T> = T extends Names ? string : T extends Ids ? number : T

type idType = Unpacked<Ids> // idType 类型为 number
type nameType = Unpacked<Names> // nameType 类型为string
```

但是如果使用`infer`则会变得非常简单

```ts
type Unpacked<T> = T extends (infer R)[] ? R : T

type idType = Unpacked<Ids> // idType 类型为 number
type nameType = Unpacked<Names> // nameType 类型为string
```

在 TypeScript 中，**对象、类、数组和函数的返回值类型**都是协变关系，而**函数的参数类型**是逆变关系，所以  `infer`  位置如果在函数参数上，就会遵循逆变原则。

- **当`infer`在协变的位置上时，同一类型变量的多个候选类型将会被推断为联合类型，**

- **当`infer`在逆变的位置上时，同一类型变量的多个候选类型将会被推断为交叉类型。**

```ts
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never
type T10 = Foo<{ a: string; b: string }> // string
type T11 = Foo<{ a: string; b: number }> // string | number
```

```ts
type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never
type T20 = Bar<{ a: (x: string) => void; b: (x: string) => void }> // string
type T21 = Bar<{ a: (x: string) => void; b: (x: number) => void }> // string & number
```

### never 类型

就像在数学中我们使用**零**来表示没有的数量一样，我们需要一个类型来表示类型系统中的**不可能**。

#### 限制函数参数

由于我们永远无法赋值给一个  `never`  类型，因此我们可以使用它来对各种用例的函数施加限制。

```ts
interface Foo {
  type: 'foo'
}

interface Bar {
  type: 'bar'
}

type All = Foo | Bar

function handleValue(val: All) {
  switch (val.type) {
    case 'foo':
      // 这里 val 被收窄为 Foo
      break
    case 'bar':
      // val 在这里是 Bar
      break
    default:
      // val 在这里是 never
      const exhaustiveCheck: never = val
      break
  }
}
```

以上面的代码为例子，注意在 `default`里面我们把被收窄为 `never` 的 val 赋值给一个显式声明为 `never` 的变量。如果一切逻辑正确，那么这里应该能够编译通过。

但是假如后来有一天你的同事改了 All 的类型：`type All = Foo | Bar | Baz` 然而他忘记了在 `handleValue`里面加上针对 Baz 的处理逻辑，这个时候在 default branch 里面 val 会被收窄为 Baz，导致无法赋值给 `never`，产生一个编译错误。所以通过这个办法，你可以确保 `handleValue`总是穷尽 所有 All 的可能类型。

#### 表示理论上无法到达的分支

```ts
type A = 'foo'
type B = A extends infer C
  ? C extends 'foo'
    ? true
    : false // 仅在这个（）表达式里, C 是一个局部 A（而不是直接使用了全局的 A）
  : never // 不应该走到这里，但是我们不得不用 never 占位
```

#### 从联合类型中过滤出联合属性

```ts
type Foo = {
  name: 'foo'
  id: number
}

type Bar = {
  name: 'bar'
  id: number
}

type All = Foo | Bar

type ExtractTypeByName<T, G> = T extends { name: G } ? T : never

type ExtractedType = ExtractTypeByName<All, 'foo'> // ExtractedType 计算结果为 Foo
```

相当于`type ExtractedType = Foo | never`而联合属性`never`会过滤掉`never`

#### 过滤映射类型

```ts
type Filter<Obj extends Object, ValueType> = {
  [Key in keyof Obj as ValueType extends Obj[Key] ? Key : never]: Obj[Key]
}

interface Foo {
  name: string
  id: number
}

type Filtered = Filter<Foo, string> // {name: string;}
```

当我们有条件地将映射类型中的[key 重新映射](https://link.juejin.cn/?target=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2F2%2Fmapped-types.html%23key-remapping-via-as 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as')  到`never`  时，这些 key 就会被过滤掉。
