---
title: Git原理与使用
categories:
  - Git
tags:
  - Git
date: 2020-06-08 15:40:50
---
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

* [A collection of .gitignore templates](https://github.com/github/gitignore)

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

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_theory.png)

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

当我们项目创建`src/demo/hello.js` ，并将新增的文件通过`git add .`添加到暂存区，`objects`目录就发生了变化：

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
git cat-file -t c9cd42
blob

git cat-file -p c9cd42
console.log('hello world')
```

当我们使用`git commit -m "first commit"`将刚才的文件提交到本地仓库后`objects`目录又发生了变化：

```
objects
 ├── 53
 │   └── 6dd923bd684d2373fdacb33d5ea6557794e5d8
 ├── 76
 │   └── 383186b73408802ae55f43c3a628e9d40b058a
 ├── 9e
 │   └── a57c327b834cf5b03b9fe2a4e5c8c65709cd9d
 ├── c9
 │   └── cd42ff26372a5fadc90b3367ce2a8899e89bf1
 ├── f5
 │   └── a19897a5baa4f49c65fbfc21a4fb5e72c9d025
 ├── info
 └── pack
```

我们再查看一下新增的文件的信息：

```
git cat-file -t 536dd9
tree

git cat-file -p 536dd9
040000 tree 76383186b73408802ae55f43c3a628e9d40b058a    src

git cat-file -t 763831
tree

git cat-file -p 763831
040000 tree 9ea57c327b834cf5b03b9fe2a4e5c8c65709cd9d    demo

git cat-file -t 9ea57c
tree

git cat-file -p 9ea57c
100644 blob c9cd42ff26372a5fadc90b3367ce2a8899e89bf1    hello.js

git cat-file -t f5a198
commit

git cat-file -p f5a198
tree 536dd923bd684d2373fdacb33d5ea6557794e5d8
author yanxq <yanxq@***.com> 1591585739 +0800
committer yanxq <yanxq@***.com> 1591585739 +0800

first commit
```

可以看到，提交之后，有两种新的文件类型被加入到objects中：`tree`和`commit`。

### commit

从上面的输出，我们可以观察到`tree` `commit` `blob` 三者的关系：

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_relation.png)

* commit是对象关系的入口；
* tree对象用于描述目录结构，每个目录节点都会用一个tree对象表示。目录间、目录文件间的层次关系会在tree对象的内容中体现；
* 每个commit都会有一个root tree对象；
* blob对象为tree对象的叶子节点，它的内容即为文件的内容。

上面仅是一次commit后的关系图，我们对`hello.js`进行修改，再做一次提交：

```
objects
 ├── 0e
 │   └── 04ddec35fc3ae1017560919a871cb985a25a6b
 ├── 38
 │   └── 21ef4ac1e4e5ad22b30dad8e223c3c36aebe32
 ├── 4b
 │   └── 412670e7358b727a0497ee46a342657c3404a6
 ├── 53
 │   └── 6dd923bd684d2373fdacb33d5ea6557794e5d8
 ├── 5b
 │   └── b92f266d7ea248728c810b1f1fb0e3ff4da926
 ├── 60
 │   └── 4775cbccb2a61fcb906df8f04b37e453ecc60f
 ├── 76
 │   └── 383186b73408802ae55f43c3a628e9d40b058a
 ├── 9e
 │   └── a57c327b834cf5b03b9fe2a4e5c8c65709cd9d
 ├── c9
 │   └── cd42ff26372a5fadc90b3367ce2a8899e89bf1
 ├── f5
 │   └── a19897a5baa4f49c65fbfc21a4fb5e72c9d025
 ├── info
 └── pack
```

再对objects中新增的文件进行查看后，我们可以得出新的关系图：

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_commit_1.png)

当我们修改了文件`hello.js`时，会发现，文件对象blob，文件夹src、demo所对应的tree对象都发生了重建，新的commit对象将上一次的commit对象作为parent。

如果我们移动文件的文件夹目录，而不对文件进行修改，则关系图如下：

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_commit_2.png)

由于`hello.js`未发生改变，所以在新建了src、demo2目录的tree对象之后，对未改变的`hello.js`文件tree对象进行了复用。

当我们沿着最新的commit对象往下查看时，就能获取到当前仓库的最新结构布局及各个blob对象的最新内容，这说明，**commit的本质就是一个快照**。

### 默克尔树（Merkle Tree）

从上面的变更我们可以发现，**无论是哪种对象，一旦放入objects就是不可变的**。例如我们对`hello.js`进行了修改，git也只是根据`hello.js`的最新内容**创建一个新的blob对象**，而不是修改或替换掉第一版`hello.js`对应的blob对象。

对应目录的tree对象也是如此，当我们修改了二级目录之后，git会新生成对应的tree对象，而不是去修改原先已存在的tree对象。

实际上，git tree 对象的组织本身就是一颗[默克尔树]([https://baike.baidu.com/item/%E6%A2%85%E5%85%8B%E5%B0%94%E6%A0%91](https://baike.baidu.com/item/梅克尔树))。

### branch & tag

在`.git/refs`下存放了分支及tag信息。当我们创建一个新的dev分支：

```
git branch dev
```

`.git/refs`下的目录就会发生变化：

```
refs
 ├── heads
 │   ├── dev
 │   └── master
 └── tags
```

查看新增的dev文件的内容：

```
cat refs/heads/dev
32f09baa858ccab22164c5732b51273a43acfea2

git log --oneline
32f09ba (HEAD -> master, dev) fourth commit
11220dd third commit
604775c second commit
f5a1989 first commit
```

对比发现，dev文件中的内容恰是最新的commit对象。

而当我们打一个tag：

```
git tag v0.0.1
```

`.git/refs`下的目录变化：

```
refs
 ├── heads
 │   ├── dev
 │   └── master
 └── tags
     └── v0.0.1
```

```
cat refs/tags/v0.0.1
32f09baa858ccab22164c5732b51273a43acfea2
```

和dev分支一样，它的内容也是最新的commit对象。说明分支和tag，都是一个**指向某个commit对象的“指针”**。

## 项目中的实践 （Git Flow）

### Git Flow常用的分支

* **Production 分支**：也就是我们经常使用的Master分支，这个分支最近发布到生产环境的代码，最近发布的Release， 这个分支只能从其他分支合并，不能在这个分支直接修改
* **Develop 分支**：这个分支是我们是我们的主开发分支，包含所有要发布到下一个Release的代码，这个主要合并与其他分支，比如Feature分支
* **Feature 分支**：这个分支主要是用来开发一个新的功能，一旦开发完成，我们合并回Develop分支进入下一个Release
* **Release分支**：当你需要发布一个新Release的时候，我们基于Develop分支创建一个Release分支，完成Release后，我们合并到Master和Develop分支
* **Hotfix分支**：当我们在Production发现新的Bug时候，我们需要创建一个Hotfix, 完成Hotfix后，我们合并回Master和Develop分支，所以Hotfix的改动会进入下一个Release

### Git Flow如何工作

#### 初始分支

所有在Master分支上的Commit应该Tag

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_flow_master.png)

#### Feature 分支

分支名 feature/*

Feature分支做完后，必须合并回Develop分支, 合并完分支后一般会删点这个Feature分支，但是我们也可以保留

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_flow_feature.png)

#### Release分支

分支名 release/*

Release分支基于Develop分支创建，打完Release分之后，我们可以在这个Release分支上测试，修改Bug等。同时，其它开发人员可以基于开发新的Feature (记住：**一旦打了Release分支之后不要从Develop分支上合并新的改动到Release分支**)

发布Release分支时，合并Release到Master和Develop， 同时在Master分支上打个Tag记住Release版本号，然后可以删除Release分支了。

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_flow_release.png)

#### 维护分支 Hotfix

分支名 hotfix/*

hotfix分支基于Master分支创建，开发完后需要合并回Master和Develop分支，同时在Master上打一个tag

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git_flow_hotfix.png)

### Git Flow代码示例

* 创建dev分支

```
git branch dev-1.0.0
git push -u origin dev-1.0.0
```

* 开始新Feature开发（创建功能分支）

```
git checkout -b feature-1.0.0-xx dev-1.0.0
# 可以不提交到远程仓库
git push -u origin feature-1.0.0-xx

git status
git add
git commit
```

* 完成Feature

```
git pull origin dev-1.0.0
git checkout dev-1.0.0
git merge --no-ff feature-1.0.0-xx
git push origin dev-1.0.0
# 删除功能分支
git branch -d feature-1.0.0-xx
# 如果提交到远程仓库，也要删除
git push origin --delete feature-1.0.0-xx
```

* 开始Release

```
git checkout -b release-1.0.0 dev-1.0.0
# 修复bug之类的提交
git commit
```

* 完成Release

```
git checkout master
git merge --no-ff release-1.0.0
git push

git checkout dev-1.0.0
git merge --no-ff release-1.0.0
git push

git branch -d release-1.0.0
# 如果提交到远程仓库，也要删除
git push origin --delete release-1.0.0

git tag -a v1.0.0 master
git push --tags
```

* 开始Hotfix

```
git checkout -b hotfix-1.0.1 master
```

* 完成Hotfix

```
git checkout master
git merge --no-ff hotfix-1.0.1
git push

# 合并到当前正在开发的分支
git checkout dev-2.0.0
git merge --no-ff hotfix-1.0.1
git push

git branch -d hotfix-1.0.1

git tag -a v1.0.1 master
git push --tags
```

## Git 相关学习资源

* [Learn Git Branching](https://learngitbranching.js.org)
* [git-recipes](https://github.com/geeeeeeeeek/git-recipes)
* [Pro Git（第二版）](https://www.progit.cn/)



文章参考：

* [Git 从入门到精通](https://juejin.im/post/5c8296f85188257e3941b2d4#heading-10)
* [图解git原理的几个关键概念](https://tonybai.com/2020/04/07/illustrated-tale-of-git-internal-key-concepts/)
* [Git 在团队中的最佳实践--如何正确使用Git Flow](https://www.cnblogs.com/cnblogsfans/p/5075073.html)

