## Git 是什么

> Git是一种分布式版本控制系统。

其中，“分布式”的概念是什么呢？“分布式”是相对于“集中式”来说的。把数据集中保存再服务器节点，所有的客户节点都从服务节点获取数据的版本控制系统叫做集中式版本控制系统，比如svn就是典型的集中式版本控制系统。与之相对的，Git的数据不止保存在服务器上，同时也完整的保存在本地计算机上，所以我们称Git为分布式的。

**Git的优点：**

* 本地是版本库的完整镜像，因此支持离线工作
* 绝大多数操作都只需要访问本地文件和资源，而且与每个提交都是所有文件的完整副本，因此速度非常快

**Git的缺点：**

* 只能全量整体，而不能以子目录和分支为单位进行更新、提交等操作
* 子目录和分支不能单独进行权限控制
* 由于每个提交都是所有文件的完整副本，因此更占磁盘空间

## Git 配置

### 用户信息

```yaml
git config --global user.name "John Doe"
git config --global user.email johndoe@example.com
```

设置的用户名与邮箱地址会被记录到Git的每一次提交中。

### .gitignore

`.gitignore`文件主要作用是配置不需要纳入版本控制的文件或目录。文件参考的开源项目：

[A collection of .gitignore templates]: https://github.com/github/gitignore

## Git 基本概念

### 版本库

当你创建一个Git项目时，项目目录下会有一个隐藏的`.git`子目录。这个目录是git用来跟踪管理版本库的。

### 哈希值

Git 数据库中保存的信息都是以文件内容的哈希值来索引，即一种由 40 个十六进制字符（0-9 和 a-f）组成的字符串（SHA-1算法），是基于Git 中文件的内容或目录结构计算出来的。

### 文件状态

在Git中，文件有三种状态：

* **已修改（modified）** - 表示修改了文件，但还没保存到数据库中
* **已暂存（staged）** - 表示对一个已修改文件的当前版本做了标记，使之包含在下此提交的快照中
* **已提交（committed）** - 表示数据已经安全的保存在本地数据库中

### 工作区域

不同状态的文件在Git中处于不同的工作区域：

* **工作区（working）** - 当你`git clone`一个项目到本地，相当于在本地克隆了项目的一个副本。工作区是对项目的某个版本独立提取出来的内容。这些从 Git 仓库的压缩数据库中提取出来的文件，放在磁盘上供你使用或修改。
* **暂存区（staging）** - 暂存区是一个文件，保存了下次将提交的文件列表信息，一般在 Git 仓库目录中。有时候也被称作“索引”，不过一般说法还是叫暂存区。
* **本地仓库（local）** - 提交更新，找到暂存区域的文件，将快照永久性存储到 Git 本地仓库。
* **远程仓库（remote）** - 以上几个工作区都是在本地。为了让别人可以看到你的修改，你需要将你的更新推送到远程仓库。同理，如果你想同步别人的修改，你需要从远程仓库拉取更新。

![](F:\work\my_file\Yx1aoq1.github.io\source\images\企业微信截图_15910673447735.png)

## Git 命令

![](F:\work\my_file\Yx1aoq1.github.io\source\images\企业微信截图_15910674397999.png)

常用操作的参考资源：

[Git的奇技淫巧]: https://github.com/521xueweihan/git-tips
[Git 风格指南]: https://github.com/aseaday/git-style-guide

## Git 原理

### objects

每个git仓库的所有数据都存储在`.git`目录下：

```
.git
 ├── COMMIT_EDITMSG
 ├── config
 ├── description
 ├── HEAD
 ├── hooks/
 ├── index
 ├── info/
 ├── logs/
 ├── objects/
 └── refs/
```

而在这些目录和文件中，又以`objects`路径下的数据内容最多，也最重要。

这是一个处于初始状态的git仓库，其`.git`目录下的结构是这样的：

```
.git
 ├── config
 ├── description
 ├── HEAD
 ├── hooks
 │   ├── applypatch-msg.sample
 │   ├── commit-msg.sample
 │   ├── fsmonitor-watchman.sample
 │   ├── post-update.sample
 │   ├── pre-applypatch.sample
 │   ├── pre-commit.sample
 │   ├── pre-push.sample
 │   ├── pre-rebase.sample
 │   ├── pre-receive.sample
 │   ├── prepare-commit-msg.sample
 │   └── update.sample
 ├── info
 │   └── exclude
 ├── objects
 │   ├── info
 │   └── pack
 └── refs
     ├── heads
     └── tags
```

当我们项目下添加新的文件夹，并添加文件，将新增的文件通过`git add`添加到暂存区，`objects`目录就发生了变化：

```
objects
 ├── c9
 │   └── cd42ff26372a5fadc90b3367ce2a8899e89bf1
 ├── info
 └── pack
```

`objects`目录下是一些以哈希值命名的文件和目录，其中目录由两个字符组成，是每个object哈希值的前两个字符。哈希值的后续字符串用于命名对应的object文件。

通过命令`git cat-file`命令，我们可以查看object的类型和内容：

```
git cat-flie -t c9cd42ff26
blob

git cat-file -p c9cd42ff26
console.log('hello world')
```

当我们使用`git commit`将刚才的文件提交到本地仓库后`objects`目录又发生了变化：

```
objects
 ├── 2f
 │   └── 5a0b954e393d2058188b0de344c6c333f3d4fd
 ├── 9e
 │   └── a57c327b834cf5b03b9fe2a4e5c8c65709cd9d
 ├── c9
 │   └── cd42ff26372a5fadc90b3367ce2a8899e89bf1
 ├── info
 └── pack
```

我们再查看一下新增的文件的信息：

```
git cat-file -t 2f5a0b954e
commit

git cat-file -p 2f5a0b954e
tree 9ea57c327b834cf5b03b9fe2a4e5c8c65709cd9d
...

first commit

git cat-file -t 9ea57c327b
tree

git cat-file -p 9ea57c327b
100644 blob c9cd42ff26372a5fadc90b3367ce2a8899e89bf1    hello.js
```

可以看到，提交之后，有两种新的文件类型被加入到objects中：`tree`和`commit`。

### 每个commit都是一个git仓库的快照

以一个`commit`为入口，我们可以把objects下的所有对象都联系起来：



## 项目中的实践 （Git Flow）

## Git 相关学习资源

