## 组合模式

我们知道，地球和其他的行星，围绕着太阳，组成了太阳系，而多个类似太阳系这样的星系，可以组成阔大的宇宙。而在程序设计中，也有一些和”事物是由相似的子事物构成“类似的思想。组合模式就是用小的子对象来构建更大的对象，而这些小的子对象本身也许是由更小的”孙对象构成的“。

组合模式的定义：

> 组合模式将对象组合成树形结构，以表示”部分-整体“的层次结构。通过对象的多态性表现，使得用户对单个对象的使用具有一致性。

组合模式的常见应用有：导航菜单、文件目录、DOM文档树

### 举个例子 —— 文件夹扫描

```js
class Folder {
  constructor (name) {
    this.name = name
    this.files = []
  }
  
  add (file) {
    this.files.push(file)
  }
  
  scan () {
    console.log(`开始扫描文件夹：${this.name}`)
    this.files.forEach(file => {
      file.scan()
    })
  }
}

class File {
  constructor (name) {
    this.name = name
  }
  
  add (file) {
    throw new Error('文件下不能再添加文件')
  }
  
  scan () {
    console.log(`开始扫描文件：${this.name}`)
  }
}

let folder = new Folder('学习资料')
let folder1 = new Folder('JavaScript')
let folder2 = new Folder('JQuery')

let file1 = new File('JavaScript设计模式与开发实践')
let file2 = new File('精通JQuery')
let file3 = new File('重构与模式')

folder1.add(file1)
folder2.add(file2)

folder.add(folder1)
folder.add(folder2)
folder.add(file3)

folder.scan()
/*
开始扫描文件夹：学习资料
开始扫描文件夹：JavaScript
开始扫描文件：JavaScript设计模式与开发实践
开始扫描文件夹：JQuery
开始扫描文件：精通JQuery
开始扫描文件：重构与模式
*/
```

通过上面这个例子，我们可以看到，在组合模式中，我们在处理”扫描“这个操作的时候，并不会关心我们执行的对象是文件夹还是文件，并且在遍历的时候，只需要操作最顶端的对象。

我们可以总结出组合模式的**特点**：

* 表示”部分-整体“的层次结构，生成树形结构
* 叶对象和组合对象具有一致性（操作与数据结构一致）
* 自上而下的请求流向，从组合对象传递给叶对象
* 调用顶层对象，会自行遍历其下的叶对象执行

### 透明性的安全问题

组合模式的透明性，指的是组合对象与叶对象的接口保持一致，外部调用时无需区分。但是这会带来一些问题，如上述的文件目录的例子，文件（叶对象）下不可再添加文件，因此需要在文件类的`add()`方法中抛出异常以作提醒。

### 一些值得注意的地方

* 组合模式不是父子关系

虽然组合模式是一种树形结构，但其组合对象与叶对象并不是父子关系，而是一种HAS-A（聚合）关系。组合对象把请求委托给它所包含的所有叶对象，它们能够合作的关键是拥有相同的接口。

* 对叶对象操作的一致性

叶对象除了与组合对象接口一致以外，操作也必须保持一致性。

举个例子：公司要发过节费，那么通知步骤就是从公司到各个部门，再到各个小组，最后到达每个员工的邮箱里，这个过程是可以使用组合模式的。但是如果是要给今天过生日的员工发生一封生日祝福的邮件，就无法使用组合模式了。因为这里只有一部分员工是”过生日“，而一部分并不是，无法对他们进行统一的操作，除非把所有过生日的员工都挑出来对他们进行统一的操作，这样才可以使用组合模式。

* 双向映射关系

一个叶对象可能属于多个组合对象，这样对象之间的关系并不是严格意义上的层次结构，这种情况下是不适合使用组合模式的。这种复合情况下我们必须给树节点和叶节点建立双向映射关系，简单的做法就是给组合对象和叶对象都增加集合来保存对象的引用。这样会使对象之间的耦合性增强，修改和增删一个对象都会变得困难，此时可以引入中介模式来管理这些对象。

* 用职责链模式提高组合模式的性能

在组合模式中，如果树的结构比较复杂，节点数很多，在遍历树的过程中，性能方面也许表现得不够理想，一种方案就是借助职责链模式来避免遍历整颗树。

### 引用父对象

我们在上面得例子中提到：”组合模式是**自上而下的请求流向**“，但在某些情况中，我们可能会想逆转传递过程，比如文件删除的时候，实际上是从这个文件所在的上层文件夹中删除该文件的。

因此我们需要在子对象中保留父对象的引用：

```js
class Folder {
  constructor (name) {
    this.name = name
    this.parent = null
    this.files = []
  }
  
  add (file) {
    file.parent = this // 设置父对象引用
    this.files.push(file)
  }
  
  scan () {
    console.log(`开始扫描文件夹：${this.name}`)
    this.files.forEach(file => {
      file.scan()
    })
  }
  
  remove () {
    if (!this.parent) return
    const files = this.parent.files
    files.forEach((file, index) => {
      if (file === this) {
        files.splice(index, 1)
      }
    })
  }
}

class File {
  constructor (name) {
    this.name = name
    this.parent = null
  }
  
  add (file) {
    throw new Error('文件下不能再添加文件')
  }
  
  scan () {
    console.log(`开始扫描文件：${this.name}`)
  }
  
  remove () {
    if (!this.parent) return
    const files = this.parent.files
    files.forEach((file, index) => {
      if (file === this) {
        files.splice(index, 1)
      }
    })
  }
}
```

```js
file1.remove() // 删除 file1
folder.scan()
/*
开始扫描文件夹：学习资料
开始扫描文件夹：JavaScript
开始扫描文件夹：JQuery
开始扫描文件：精通JQuery
开始扫描文件：重构与模式
*/
```

当我们对文件夹或者文件执行`remove()`时，实际上会遍历它所在的父节点列表来进行删除。

## 总结

### 应用场景

* 表示对象的部分-整体层次结构。在构造完成后，可以通过请求树的顶层对象对一整棵树进行统一操作，并且能够很方便的增加与删除树的节点，符合开放-封闭原则。
* 客户希望统一对待树中的所有对象。客户在调用方法时不用关心当前处理的是组合对象还是叶对象，它们会各自做自己正确的事情。

### 优缺点

* 优点：
  * 忽略组合对象和单个对象的差别，对外一致接口使用
  * 解耦调用者与复杂元素之间的联系，处理方式变得简单
* 缺点：
  * 树叶对象接口一致，无法区分，只有在运行时方可辨别
  * 包裹对象创建太多，额外增加内存负担

