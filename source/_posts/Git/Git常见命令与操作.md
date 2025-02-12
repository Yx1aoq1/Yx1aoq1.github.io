---
title: Git常见命令与操作
categories:
  - Git
tags:
  - Git
date: 2025-02-11 21:30:36
---

### 配置命令

```bash
# 查看配置
git config --list

#列出Repository配置
git config --local --list

#列出全局配置
git config --global --list

#列出系统配置
git config --system --list

#配置
git config --global user.name "your name"
git config --global user.email "youremail@github.com"
```

### 拉取与推送

#### fetch

将某个远程主机的更新，全部取回本地

- `git fetch [<repository>]`：取回仓库所有分支的更新

- `git fetch <repository> <branch>`：取回指定分支的更新

- `git fetch origin <remote-branch>:<local-branch>`：将指定的远程分支的更新拉到指定的某个本地分支下

#### pull

从远程仓库拉取当前分支的更新内容

- `git pull [<repository>]`：如果本地和远程仓库的代码需要合并，默认采用`merge`的方式合并

- `git pull --rebase`：指定使用`rebase`的方式合并代码

#### push

将本地的修改推送到远程仓库

- `git push [<repository>]`

- `git push origin -d <branch>`：删除远程仓库的分支

- `git push -u origin <branch>`：将当前本地分支推送到远程并命名

### 分支管理

#### branch

列出、创建或删除分支

- `git branch`，查看本地分支；

- `git branch <branch>`：创建分支，但是不切换当前分支

- `git branch -r`：查看远程分支

- `git branch -a`：查看本地与远程分支

- `git branch -d <branch>`：删除指定分支；`-D`等同于`-d --force`，强制删除指定分支

- `git branch -m [<oldbranch>] <newbranch>`：移动/重命名分支；`-M`等同于`-m --force`

#### checkout

切换分支或恢复工作目录树文件

- `git checkout <branch>`，切换到对应名称的分支

- `git checkout -b <newbranch> [<basebranch>]`：从指定分支创建并切换到新分支；如果未指明分支，从当前所在分支创建

- `git checkout -B <newbranch> [<指定basebranch>]`：重置分支（删除已存在的分支且重新创建，分支不存在也不会报错）

- `git checkout -f <branch>`：强制切换到某分支，会丢失当前所在分支的已更改内容

- `git checkout -- <./filename>`：撤销指定文件或全部文件的更改

#### merge

将两个或多个开发历史合并在一起

- `git merge <branch>`：将当前分支与指定的分支名称合并，默认使用快速合并

- `git merge <branch> --no-ff`：使用非快速合并

- `git merge <branch> --squash`：将合并结果压缩为一个提交，并且不会保留源分支的提交历史

##### 图解

- 快速合并：不会创建新的提交，而是合并当前分支中合并的分支上的提交

  ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/merge-ff.png?imageSlim)

- 三方合并：创建一个新的合并提交，提交的父提交指向活动分支和要合并的分支。

  ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/merge-no-ff.png?imageSlim)

- Squash Merge：创建一个新的合并提交，不会保留对合入分支的引用。

  ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/merge-s.png?imageSlim)

#### rebase

在另一个基端之上重新应用提交（将分支的基础从一个提交改成另一个提交，使其看起来就像是从另一个提交中创建了分支一样）

- `git rebase <newparent> [<branch>]`：允许我们访问`<newparent>`中最新提交的命令，并将我们的`<branch>`提交移到它上面

- `git rebase --onto`：

  - 丢弃某些提交：如图，执行`git rebase --on c2 c4 main`，会丢弃 c3、c4 提交，并将 c5 作为一个新的提交记录连到 c2 上，可用于回退代码

    ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git-rebase-d.png?imageSlim)

  - 更精确的合并：当`feature/b`是从`feature/a`拉出分支并开发时，此时我想要仅保留`feature/b`的提交 c3，可以执行`git rebase main feature/a feature/b`，则可以将 c3 提交的父提交节点改成`main`分支的最后提交节点。

    ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git-rebase-m.png?imageSlim)

- `git rebase -i [startpoint] [endpoint]`：用于修改提交记录，可以将多条 commit 删除或合并

  ![rebase示意图](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/5/2/1631fdf49c668a35~tplv-t2oaga2asx-jj-mark:3024:0:0:0:q75.png)

##### 比较

- 使用`git merge`合并分支：

  ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git-merge.png?imageSlim)

- 使用`git rebase`合并分支：

  ![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/git-rebase.png?imageSlim)

使用`git rebase`合并的好处是，可以维护一条干净整洁没有冗余`commit`分支，而不像`merge`那样会产生新的提交，但是它也是有弊端的：

- 如果涉及到已经推送过的提交，需要强制推送才能将本地  `rebase`  后的提交推送到远程。因此绝对不要在一个公共分支（也就是说还有其他人基于这个分支进行开发）执行  `rebase`，否则其他人之后执行  `git pull`  会合并出一条令人困惑的本地提交历史，进一步推送回远程分支后又会将远程的提交历史打乱

- 对新手不友好，新手很有可能在交互模式中误操作「丢失」某些提交（但其实是能够找回的）

- 假如你频繁的使用  `rebase`  来集成主分支的更新，一个潜在的后果是你会遇到越来越多需要合并的冲突。尽管你可以在  `rebase`  过程中处理这些冲突，但这并非长久之计，更推荐的做法是频繁的合入主分支然后创建新的功能分支，而不是使用一个长时间存在的功能分支。

因此操作`rebase`时，最好的做法是先将主分支的内容`rebase`到功能分支，解决好冲突之后，再把功能分支`merge`到主分支上。

#### cherry-pick

- `git cherry-pick <commit>`：将指定的提交（commit）应用于其他分支。

### 撤销

#### reset

重置当前 HEAD 到指定的状态

- `git reset <commit>`：将代码回退到某个指定提交

- `git reset --soft`：只回退 HEAD

- `git reset --mixed`：回退部分,包括 HEAD，index

- `git reset --hard`： 回退全部，包括 HEAD，index，working tree

- `git reset HEAD`：暂存区文件撤销 (不覆盖工作区)

### 文件暂存

将本地修改临时暂存

#### stash

- `git stash save -a "message"`：添加修改

- `git stash list`：查看所有暂存历史

- `git stash drop <stash>`：删除某个暂存

- `git stash pop`：将暂存恢复到工作区

- `git stash clear`：删除全部暂存内容

### 常见问题的处理

1. 仓库的初始化：

```bash
# 初始化本地仓库
git init
# 链接本地仓库与远端仓库
git remote add origin <url>
```

2. `git reset`之后如何恢复：

- 使用`git reflog`查看操作日志，可以找回被回退的提交的哈希值

  ```bash
  $ git reflog
  b7057a9 HEAD@{0}: reset: moving to b7057a9
  98abc5a HEAD@{1}: commit: more stuff added to foo
  b7057a9 HEAD@{2}: commit (initial): initial commitit
  ```

- 使用`git reset <hash>`回退到之前的状态
