---
title: Git常见命令与操作
categories:
  - Git
tags:
  - Git
date: 2020-12-04 21:21:32
---

## merge

`merge` 是一个比较常用的命令，很多时候使用起来比较简单，但有的时候却会有一些不符合直觉的现象。

### Fast-Forward Merge: 快进式合并

![image-20201204213747411](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201204213747411.png)

* 默认不生成merge commit
* 可以通过`--no-ff`禁用

当合并的两个分支满足祖孙/父子关系时，Git 默认会使用快进式合并，最常见的场景是 `pull`，`pull` 的本质是 `fetch` + `merge`，由于一般在执行 `pull` 的时候远端分支相对本地分支是快进的，Git 可以直接合并，默认情况下不会产生 `merge commit`，但也可以通过参数 `--no-ff` 来禁止快进式合并。

### Three-Way Diff Merge：三路合并

![image-20201204213914188](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201204213914188.png)

当合并两个分支的commit时，Git会采用三路合并算法，选取当前分支节点 `B3` 与目标分支节点 `F3` 的公共祖先节点 `B1` 作为基准（base），将这三个节点的文件依次进行比较

* 如果 `B3`、`F3` 的某个文件和 `B1` 中的相同，那么不产生冲突；
* 如果 `B3` 或 `F3` 只有一个和 `B1` 相比发生变化，那么该文件将会采用该变化了的版本；
* 如果 `B3`、`F3` 和 `B1` 相比都发生了变化，且变化不相同，那么则产生冲突，需要手动去合并；

- 如果 `B3`、`F3` 都发生了变化，且变化相同，那么不产生冲突，自动采用该变化的版本。

