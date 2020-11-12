## 数据驱动

Vue 的一个核心思想是数据驱动。所谓数据驱动，是指视图是有数据驱动生成的，我们对视图的更改，不会直接操作DOM，而是通过修改数据。

以一个最简单模板作为的例子：

```html
<div id="app">
  {{ message }}
</div>
```

```js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

最终的页面上会渲染出`Hello Vue!`。那么Vue是如何将`data`中的数据渲染到DOM上的呢？

## Vitrual Dom

我们知道，浏览器解析一个HTML，需要以下步骤：

* 创建DOM Tree
* 创建Style Rules
* 构建Render Tree
* 布局Layout
* 绘制Painting

当每次对真实DOM进行操作的时候，浏览器都会从构建DOM树开始从头到尾执行一遍流程，因此真实的DOM操作代价十分昂贵，操作频繁还会引起页面卡顿从而影响用户体验。**而Vitrual DOM就是为了解决这个浏览器性能问题才被创造出来的**。

Vitrual DOM在执行DOM的更新操作后，不会直接操作真实DOM，而是将更新的内容保存到本地JS对象中，然后一次性attach到DOM树上，通知浏览器进行DOM绘制避免大量无谓的计算。

### Virual Dom的优势

* **跨平台：**Virtual DOM是以JavaScript对象为基础而不依赖真实平台环境，所以使它具有了跨平台的能力，比如浏览器平台、Weex、Node等。
* **提高DOM操作效率：**DOM操作的执行速度远不如JavaScript的运算速度快，因此把大量的DOM操作搬运到JavaScript中，运用patching算法来计算出真正需要更新的节点，可以最大限度地减少DOM操作，从而显著提高性能。
* **提升渲染性能：**在大量、频繁的数据更新下，依托diff算法，能够对视图进行合理、高效的更新。

### `VNode`

`VNode`就是Vue中描述Virtual DOM的类：

```js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
```

### 如何创建VNode

当我们创建了一个`template`

```js
<div id="app">
  {{ message }}
</div>
```

相当于我们编写了如下`render`函数：

```js
render: function (createElement) {
  return createElement('div', {
    attrs: {
      id: 'app'
    }
  }, this.message)
}
```

其中`createElement`函数就是用来生成`VNode`的：

```js
function createElement (
	context
)
```

