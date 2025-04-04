---
title: Vue3源码学习——快速Diff
categories:
  - Vue
tags:
  - Vue
  - diff
date: 2025-02-12 13:37:18
---

### Vue2 Diff

Vue2 的 Diff 主要是采用双端 Diff 算法，通过四个指针（旧头、旧尾、新头、新尾）进行交叉对比，虽然能快速处理头尾相同的情况，但在节点顺序复杂变化时表现较差。当新旧节点的中间部分顺序不一致时，Vue 2 需遍历旧节点查找匹配项，导致时间复杂度升高到  **O(n²)**

### 示例场景

**旧节点**：A B C D E

**新节点**：C A D E G

**Vue2 的处理流程**：

1. 查找与 C 相同的节点的位置，将 C 插入到 A 之前

2. 头头相同，patch A 节点

3. 查找与 D 相同的节点的位置，将 D 插入到 B 之前

4. 新头旧尾相同，将 E 插入到 B 之前

5. 查找与 G 相同的节点的位置，未找到，作为新节点插入到 B 之前

6. 删除 B 节点

由于第一个循环就不满足头尾比较的任何一种匹配情况，所以复杂度为 O(n²) ，并且还做了 4 次 `DOM` 移动的操作。

### Vue3 Diff

Vue3 细化了 Diff 节点比较的过程，并对示例这种复杂的情况作了一定的算法优化，我们结合源码来逐步分析 Vue3 Diff 的步骤。

#### 从两端开始比较

此步骤可以用 O(n) 的复杂度将一些首尾相同的节点比较完毕，快速处理简单情况

##### 从头开始比较

```js
let i = 0 // 起始索引
const l2 = c2.length // 新节点数组长度
let e1 = c1.length - 1 // 老节点数组结束索引
let e2 = l2 - 1 // 新节点数组结束索引

// 1. 从头部开始同步节点
while (i <= e1 && i <= e2) {
  const n1 = c1[i]
  const n2 = c2[i]
  // 如果是相同节点，证明可以复用节点，执行patch操作
  if (isSameVNodeType(n1, n2)) {
    patch(n1.key, n2.key)
  } else {
    // 否则，中断循环
    break
  }
  // 每有一个相同的节点，起始索引加1
  i++
}
```

##### 从尾开始比较

```js
// 2. 从尾部开始同步节点
while (i <= e1 && i <= e2) {
  const n1 = c1[e1]
  const n2 = c2[e2]
  // 判断是相同节点则复用
  if (isSameVNodeType(n1, n2)) {
    patch(n1.key, n2.key)
  } else {
    break
  }
  e1--
  e2--
}
```

#### 其他情况

##### 新节点还有，旧节点没了

如果双端比较完后，新节点还有多，老节点没了，那么，多出来的执行 mount 操作即可；

```js
// 3. 新节点还有，老节点没了
if (i > e1) {
  if (i <= e2) {
    // 添加多出来的节点
    while (i <= e2) {
      mount(c2[i].key)
      i++
    }
  }
}
```

##### 老节点还有，新节点没了

如果双端比较完后，老节点还有多，新节点没了，那么，多出来的执行 unmount 操作即可：

```js
// 4. 老节点还有，新节点没了
if (i > e2) {
  while (i <= e1) {
    unmount(c1[i].key)
    i++
  }
}
```

##### 乱序情况

两端的节点比较完毕，剩下中间的节点是乱序的。如果两个乱序节点比较，如果直接暴力比较，在遍历一个数组的时候，再遍历另个数组，时间复杂度很高，为减少时间复杂度，这里使用空间换时间的做法，先将一个数组转为 map，在遍历一个数组的时候，直接在 map 中查询，时间复杂度就能减低很多。

```js
// 处于中间的乱序节点
const s1 = i // 记录剩下老节点的起始位置
const s2 = i // 记录剩下新节点的起始位置
// 5.1 将剩下未执行比较的新节点数组转map
// key就是节点的key，value是新节点数组的index
const keyToNewIndexMap = new Map()
for (i = s2; i <= e2; i++) {
  const nextChild = c2[i]
  if (nextChild) {
    keyToNewIndexMap.set(nextChild, i)
  }
}
```

###### 遍历老节点，进行 patch 和 unmount 操作

```js
// 5.2 遍历剩余老节点，把能处理的处理了（patch, unmout）
let j
let patched = 0 // 记录已经patch的节点数量
const toBePatched = e2 - s2 + 1 // 需要patch的数量，就是剩下所有的新节点的数量
let moved = false // 记录是否有节点移动
// 记录最大的新节点索引，用于辅助判断是否有节点移动的
let maxNewIndexSoFar = 0
// 用于记录剩下的节点是否有移动，索引是剩余新节点index（从0开始），值是老节点下标
const newIndexToOldIndexMap = new Array(toBePatched)

// 初始化为0
for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

// 遍历剩下的老节点
for (i = s1; i <= e1; i++) {
  const prevChild = c1[i]
  // 如果已经没有需要patch的节点了，证明后面的节点都是要删除的，直接删除
  if (patched >= toBePatched) {
    unmount(prevChild)
    continue
  }

  let newIndex // 新节点数组的index
  if (prevChild) {
    // 如果有key，直接从map中获取index
    newIndex = keyToNewIndexMap.get(prevChild)
  } else {
    // 针对部分没有key的节点，遍历剩余新节点数组
    for (j = s2; j <= e2; j++) {
      if (newIndexToOldIndexMap[j - s2] === 0 && prevChild === c2[j]) {
        newIndex = j
        break
      }
    }
  }
  // 如果找不到新节点的索引，证明老节点没法复用，删除
  if (newIndex === undefined) {
    unmount(prevChild)
  } else {
    // 每次找到可以复用的节点，设置值为老节点索引加1
    newIndexToOldIndexMap[newIndex - s2] = i + 1
    // 记录新节点的索引，如果索引突然变小了，证明有节点的位置变了
    if (newIndex >= maxNewIndexSoFar) {
      maxNewIndexSoFar = newIndex
    } else {
      moved = true
    }
    patch(prevChild, c2[newIndex])
    patched++
  }
}
```

###### 进行节点的移动和新增

乱序节点的复用和删除操作已经做完了，剩下的几点就是要移动或者新增的。如何移动效率最高，这里涉及到一个算法，**最长递增子序列**。

什么是“最长递增子序列”呢？举个例子，数组`[0, 7, 8, 9, 3, 4, 5]`的最长递增子序列为`[0, 7, 8, 9]`或`[0, 3, 4, 5]`，即递增趋势的最长的子数组。最长递增子序列的解并不是唯一，但是我们只需要拿到其中一个解即可。

为什么需要获得最长递增子序列呢？因为只要找出最长的子序列，那么只要移动剩下的节点，就可以保证移动的次数最少。**只要保证索引是递增的，这个子序列的相对位置就是不变的**。

```js
// 5.3 移动和新建
// 获取最长递增子序列
const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []

j = increasingNewIndexSequence.length - 1

// 此循环为从后往前查找，DOM插入元素的API为insertBefore
// 倒叙遍历方便使用前一个节点作为锚点值
for (i = toBePatched - 1; i >= 0; i--) {
  const nextIndex = s2 + i // i是相对坐标，要加上起始值，转为新节点真实坐标
  const nextChild = c2[nextIndex]
  const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1] : undefined

  // 如果没有进行patch操作，证明是新增节点
  if (newIndexToOldIndexMap[i] === 0) {
    mount(nextChild)
  } else if (moved) {
    // 如果没有稳定的子序列（e.g. 数组倒序）或者 当前节点不在稳定序列中，移动节点
    if (j < 0 || i !== increasingNewIndexSequence[j]) {
      move(nextChild, anchor)
    } else {
      j--
    }
  }
}
```

###### 最长递增子序列算法实现

```js
/**
 * 获取最长递增子序列
 *
 * @param {*} arr
 * @returns
 */
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  // 遍历数组
  for (i = 0; i < len; i++) {
    // 取出当前元素
    const arrI = arr[i]

    // 只看进行过patch的数据
    if (arrI !== 0) {
      j = result[result.length - 1]
      // 如果当前元素比最后一个元素要大
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i) // 将当前索引存入结果索引
        continue
      }

      u = 0
      v = result.length - 1
      // 二分查找，在结果数组中找到当前值得位置
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      // 将当前值替换到比它大一点的位置
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1] // 存起来
        }
        result[u] = i
      }
    }
  }

  // 修正索引
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```

### 示例场景

我们再看同一个场景下，Vue 3 Diff 的步骤：

1. 从两端开始比较，结果： `i = 0` `e1 = 4` `e2 = 4`

2. 将剩下未执行比较的新节点数组转`Map`：`{'C' => 0, 'A' => 1, 'D' => 2, 'E' => 3, 'G' => 4}`

3. 遍历剩余老节点：
   
   - A 在 `keyToNewIndexMap` 可获取对应值 `1`，记录 `newIndexToOldIndexMap[1]` 为 `0+1`，记录 `maxNewIndexSoFar` 为 1，Patch A
   
   - B 在 `keyToNewIndexMap` 获取不到对应值，删除节点 B
   
   - C 在`keyToNewIndexMap` 可获取对应值 `0`，记录 `newIndexToOldIndexMap[0]` 为 `2+1`，由于 `newIndex < maxNewIndexSoFar`，记录`moved = true`，Patch C
   
   - D 在 `keyToNewIndexMap` 可获取对应值 `2`，记录 `newIndexToOldIndexMap[2]` 为 `3+1`，记录 `maxNewIndexSoFar` 为 2，Patch D
   
   - E 在 `keyToNewIndexMap` 可获取对应值 `3`，记录 `newIndexToOldIndexMap[3]` 为 `4+1`，记录 `maxNewIndexSoFar` 为 3，Patch E
   
   - 获取最终的 `newIndexToOldIndexMap`：`[3, 1, 4, 5, 0]`

4. 获取最长递增子序列 `[1, 2, 3]`，倒叙遍历 `newIndexToOldIndexMap`
   
   * 获取 `newIndexToOldIndexMap[4]`，值为`0`，证明是新增，新增节点 G，插入位置在最后
   
   * 获取 `newIndexToOldIndexMap[3]`，值非0，证明是移动，下标 `3` 在最长递增子序列中，表示改节点不需要移动
   
   * 获取 `newIndexToOldIndexMap[2]`，值非0，证明是移动，下标 `2` 在最长递增子序列中，表示改节点不需要移动
   
   * 获取 `newIndexToOldIndexMap[1]`，值非0，证明是移动，下标 `1` 在最长递增子序列中，表示改节点不需要移动
   
   * 获取 `newIndexToOldIndexMap[0]`，值非0，证明是移动，下标 `0` 不在最长递增子序列中，节点需要移动。将 C 移动到 A 之前。

可以看出，在Vue3 Diff处理的情况下，`DOM`移动只做了一次，而且算法的复杂度为 O(nlogn)，相较于 Vue2 有性能上的提升。

### 其他优化

除了算法上的优化，Vue3 还做了以下的性能提升点：

* **静态提升**：Vue3中对不参与更新的元素，会做静态提升，只会被创建一次，在渲染时直接复用，这样就免去了重复的创建节点，优化了运行时候的内存占用。

* **事件监听缓存**：默认情况下绑定事件的行为会被视为动态绑定，所以每次都会追踪它的变化，开启缓存后，没有了静态标记，下次diff时可以直接用。
