## 虚拟DOM

### 什么是虚拟DOM

> 虚拟DOM（Virtual Dom），也就是我们常说的虚拟节点，是用JS对象来模拟真实DOM中的节点。

真实的元素节点：

```html
<div id="wrap">
  <p class="title">Hello world!</p>
</div>
```

Virtual Dom：

```js
{
  tag: 'div',
  attrs: {
    id: 'wrap'
  },
  children: [
    {
      tag: 'p',
      text: 'Hello world!',
      attrs: {
        class: 'title'
      }
    }
  ]
}
```

### 为什么使用虚拟DOM

我们知道，浏览器解析一个HTML，需要以下步骤：

* 创建DOM Tree
* 创建Style Rules
* 构建Render Tree
* 布局Layout
* 绘制Painting

当每次对真实DOM进行操作的时候，浏览器都会从构建DOM树开始从头到尾执行一遍流程，因此真实的DOM操作代价十分昂贵，操作频繁还会引起页面卡顿从而影响用户体验。**而虚拟DOM就是为了解决这个浏览器性能问题才被创造出来的**。

虚拟DOM在执行DOM的更新操作后，不会直接操作真实DOM，而是将更新的内容保存到本地JS对象中，然后一次性attach到DOM树上，通知浏览器进行DOM绘制避免大量无谓的计算。

### 虚拟DOM的优势

* **跨平台：**Virtual DOM是以JavaScript对象为基础而不依赖真实平台环境，所以使它具有了跨平台的能力，比如浏览器平台、Weex、Node等。
* **提高DOM操作效率：**DOM操作的执行速度远不如JavaScript的运算速度快，因此把大量的DOM操作搬运到JavaScript中，运用patching算法来计算出真正需要更新的节点，可以最大限度地减少DOM操作，从而显著提高性能。
* **提升渲染性能：**在大量、频繁的数据更新下，依托diff算法，能够对视图进行合理、高效的更新。

## DIFF算法

当数据发生变化时，Vue是如何更新视图的？首先，需要根据真实的DOM生成Virtual DOM，当Virtual DOM的数据发生改变后会生成一个新的VNode，新的VNode与oldVNode对比，把不同的地方修改在真实的DOM上，再将oldVNode更新为新的VNode。

> diff过程就是调用patch函数，比较新老节点，一边比较一边给真实DOM打补丁(patch)；

