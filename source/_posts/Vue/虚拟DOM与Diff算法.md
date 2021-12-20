---
title: 虚拟DOM与Diff算法
categories:
  - Vue
tags:
  - Vue
  - Vitual DOM
  - Diff
date: 2021-12-19 23:17:38
---

## 虚拟DOM

在React、Vue两个前端框架中，都使用了虚拟DOM的概念，虚拟DOM是什么呢？其实它的本质是JavaScript对象，用来模拟真实的DOM节点。

虚拟 DOM 节点目前是一个规范化的数据结构，类似如下所示：

```js
{
  tag: 'div',
  data: {
    style: {
      backgroundColor: 'blue'
    },
  },
  children: {
    tag: null,
    data: null,
    children: '文本内容'
  }
}
```

使用这个数据结构，最终可以转化为 DOM 节点，等价于如下所示 DOM 元素：

```html
<div style="background-color: blue">
  文本内容
</div>
```

### 为什么要使用虚拟DOM

* 我们都知道，前端性能优化的一个秘诀就是尽可能地减少DOM操作，不仅仅是因为DOM操作的性能差，更是因为频繁的变动DOM会造成浏览器的回流与重绘，因此当我们加了一层虚拟DOM之后，通过对比前后的变化，再更新到真实DOM上，就能有效的减少操作真实DOM的次数。
* 省略手动DOM操作，可以提升开发效率
* 可以更好的跨平台
  * 浏览器平台渲染DOM
  * 服务端渲染SSR（Nuxt.js/Next.js），前端是Vue向的，后者是React向
  * 原生应用（Weex/React Native）
  * 小程序（mpvue/uni-app）等

### 缺点

* 首次渲染大量DOM时，由于多了一层虚拟DOM的计算，会比innerHTML插入慢。虚拟DOM需要在内存中维护一份DOM的副本。
* 如果你的场景是虚拟DOM大量更改，这是合适的。但是单一的、频繁的更新的话，虚拟DOM将会花费更多的时间处理计算的工作。比如，你有一个DOM节点相对较少的页面，用虚拟DOM，它实际上有可能会更慢。但是对于大多数单页应用，都会更快。这也是为啥React和Vue中的更新用了异步的方法，频繁更新时，只更新最后一次的。

## Tree Diff

### Vue2 算法 —— snabbdom.js

Vue2的Diff实现主要参考的是[snabbdom](https://github.com/snabbdom/snabbdom)。

这是snabbdom中vnode的定义：

```js
export interface VNodeData {
    props?: Props
    attrs?: Attrs
    class?: Classes
    style?: VNodeStyle
    dataset?: Dataset
    on?: On
    hero?: Hero
    attachData?: AttachData
    hook?: Hooks
    key?: Key
    ns?: string // for SVGs
    fn?: () => VNode // for thunks
    args?: any[] // for thunks
    [key: string]: any // for any other 3rd party module
}

export type Key = string | number

const interface VNode = {
    sel: string | undefined, // 选择器
    data: VNodeData | undefined, // VNodeData上面定义的VNodeData
    children: Array<VNode | string> | undefined, //子节点,与text互斥
    text: string | undefined, // 标签中间的文本内容
    elm: Node | undefined, // 转换而成的真实DOM
    key: Key | undefined // 字符串或者数字
}
```

这里我们跳过创建vnode的过程，直接看它的核心patch过程。

#### patch

patch函数主要是做一个中继站，将新旧节点相同的情况与新旧节点不同的情况划分为两种处理：

![](/images/patch.png)

源码：

```js
return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {    
    let i: number, elm: Node, parent: Node
    const insertedVnodeQueue: VNodeQueue = []
    // cbs.pre就是所有模块的pre钩子函数集合
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()
    // isVnode函数时判断oldVnode是否是一个虚拟DOM对象
    if (!isVnode(oldVnode)) {
        // 若不是即把Element转换成一个虚拟DOM对象
        oldVnode = emptyNodeAt(oldVnode)
    }
    // sameVnode函数用于判断两个虚拟DOM是否是相同的,源码见补充1;
    if (sameVnode(oldVnode, vnode)) {
        // 相同则运行patchVnode对比两个节点;
        patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
        elm = oldVnode.elm! // !是ts的一种写法代码oldVnode.elm肯定有值
        // parentNode就是获取父元素
        parent = api.parentNode(elm) as Node

        // createElm是用于创建一个dom元素插入到vnode中(新的虚拟DOM)
        createElm(vnode, insertedVnodeQueue)

        if (parent !== null) {
            // 把dom元素插入到父元素中,并且把旧的dom删除
            api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))// 把新创建的元素放在旧的dom后面
            removeVnodes(parent, [oldVnode], 0, 0)
        }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
        insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    return vnode
}
```

补充1：sameVnode函数

```js
function sameVnode(vnode1: VNode, vnode2: VNode): boolean { // 通过key和sel选择器判断是否是相同节点
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}
```

#### patchNode

patchNode函数主要处理两个相同节点的`text`与`children`的对比。

![](/images/patchNode.png)

源码：

```js
function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    const hook = vnode.data?.hook
    hook?.prepatch?.(oldVnode, vnode)
    const elm = vnode.elm = oldVnode.elm!
    const oldCh = oldVnode.children as VNode[]
    const ch = vnode.children as VNode[]
    if (oldVnode === vnode) return
    if (vnode.data !== undefined) {
        for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
        vnode.data.hook?.update?.(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) { // 新节点的text属性是undefined
        if (isDef(oldCh) && isDef(ch)) { // 当新旧节点都存在子节点
            if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue) // 并且他们的子节点不相同执行updateChildren函数
        } else if (isDef(ch)) { // 只有新节点有子节点
            // 当旧节点有text属性就会把''赋予给真实dom的text属性
            if (isDef(oldVnode.text)) api.setTextContent(elm, '') 
            // 并且把新节点的所有子节点插入到真实dom中
            addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
        } else if (isDef(oldCh)) { // 若旧节点有子节点,就把所有的子节点删除
            removeVnodes(elm, oldCh, 0, oldCh.length - 1)
        } else if (isDef(oldVnode.text)) { // 把''赋予给真实dom的text属性
            api.setTextContent(elm, '')
        }
    } else if (oldVnode.text !== vnode.text) { // 若旧节点的text与新节点的text不相同
        if (isDef(oldCh)) { // 若旧节点有子节点,就把所有的子节点删除
            removeVnodes(elm, oldCh, 0, oldCh.length - 1)
        }
        api.setTextContent(elm, vnode.text!) // 把新节点的text赋予给真实dom
    }
    hook?.postpatch?.(oldVnode, vnode) // 更新视图
}
```

#### updateChildren (划重点)

这个部分的函数可以分为三个部分，部分1：声明变量，部分2：**同级节点比较（四种命中查找，Diff优化策略）**，部分3：循环结束的收尾工作。

**同级别节点比较**的**五种**情况：

1. `oldStartVnode/newStartVnode`（旧开始节点/新开始节点）相同
2. `oldEndVnode/newEndVnode`（旧结束节点/新结束节点）相同
3. `oldStartVnode/newEndVnode`（旧开始节点/新结束节点）相同
4. `oldEndVnode/newStartVnode`（旧结束节点/新开始节点）相同
5. **特殊情况当1、2、3、4的情况都不符合**的时候就会执行，在`oldVnodes`里面寻找跟`newStartVnode`一样的节点然后位移到`oldStartVnode`,若没有找到在就`oldStartVnode`创建一个

我们来一一探究每种情况的实现方式：

**▼情况1：旧开始节点与新开始节点相同**

若符合情况1：

* 执行`patchVnode`更新节点
* `oldStartIdx++/newStartIdx++`

<img src="/images/updateChildren-1.GIF" style="zoom: 25%;" />

**▼情况2：旧结束节点与新结束节点相同**

若符合情况2：

* 执行`patchVnode`更新节点
* `oldEndIdx--/newEndIdx--`

<img src="/images/updateChildren-2.GIF" style="zoom: 25%;" />

**▼情况3：旧开始节点与新结束节点相同**

* 执行`patchVnode`更新节点
* `oldCh[oldStartIdx]对应的真实dom`位移到`oldCh[oldEndIdx]对应的真实dom`后
* `oldStartIdx++/newEndIdx--`

<img src="/images/updateChildren-3.GIF" style="zoom: 25%;" />

**▼情况4：旧结束节点与新开始节点相同**

* 执行`patchVnode`更新节点
* `oldCh[oldEndIdx]对应的真实dom`位移到`oldCh[oldStartIdx]对应的真实dom`前
* `oldEndIdx--/newStartIdx++`

<img src="/images/updateChildren-4.GIF" style="zoom: 25%;" />

**▼情况5：**

* 遍历`oldCh`找到与`newStartNode`相同的节点
* 当可以找到相同节点时，将相同的节点插入到`oldStartNode`前
* 当无法找到相同节点时，在`oldStartNode`前新增一个新节点

<img src="/images/updateChildren-5.GIF" style="zoom: 25%;" />

```js
function updateChildren(
    parentElm: Node,
    oldCh: VNode[],
    newCh: VNode[],
    insertedVnodeQueue: VNodeQueue
  ) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: KeyToIndexMap | undefined;
    let idxInOld: number;
    let elmToMove: VNode;
    let before: any;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) { // 情况1：旧开始节点与新开始节点相同
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) { // 情况2：旧结束节点与新结束节点相同
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // 情况3：旧开始节点与新结束节点相同
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        // 将oldStartVnode插入到oldEndVnode之后
        api.insertBefore(
          parentElm,
          oldStartVnode.elm!,
          api.nextSibling(oldEndVnode.elm!)
        );
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // 情况4：旧结束节点与新开始节点相同
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        // 将oldEndVnode插入到oldStartVnode之前
        api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === undefined) { // 情况5：前几种匹配都没有命中
          // 遍历oldCh，生成一个Map
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        // 在oldCh中找到与newStartVnode Key相同的节点
        idxInOld = oldKeyToIdx[newStartVnode.key as string];
        if (isUndef(idxInOld)) {
          // 当未找到相同Key节点时，创建新的DOM，并插入到oldStartVnode之前
          // New element
          api.insertBefore(
            parentElm,
            createElm(newStartVnode, insertedVnodeQueue),
            oldStartVnode.elm!
          );
        } else {
          // 当找到相同Key节点时
          elmToMove = oldCh[idxInOld];
          // 节点标签不同，创建新的DOM，并插入到oldStartVnode之前
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(
              parentElm,
              createElm(newStartVnode, insertedVnodeQueue),
              oldStartVnode.elm!
            );
          } else {
            // 节点标签相同，更新节点，并插入到oldStartVnode之前
            // 旧节点置为undefined
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined as any;
            api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }

    if (newStartIdx <= newEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
      addVnodes(
        parentElm,
        before,
        newCh,
        newStartIdx,
        newEndIdx,
        insertedVnodeQueue
      );
    }
    if (oldStartIdx <= oldEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
```

