---
title: Flex布局
categories:
  - CSS
tags:
  - flex
date: 2025-02-15 12:53:55
---

### 基本概念

Flexbox布局也叫Flex布局，弹性盒子布局。它的**目标**是提供一个更有效地布局、对齐方式，并且能够使父元素在子元素的大小未知或动态变化情况下仍然能够分配好子元素之间的间隙。**主要思想**是使父元素能够调整子元素的宽度、高度、排列方式，从而更好的适应可用的布局空间。设定为flex布局的元素能够放大子元素使之尽可能填充可用空间，也可以收缩子元素使之不溢出。

Flex布局更适合小规模的布局，可以简便、完整、响应式的实现各种页面布局。但是，设为Flex布局以后，其子元素的`float`、`clear`和`vertical-align`属性将失效。Flex弹性盒模型的优势在于只需声明布局应该具有的⾏为，⽽不需要给出具体的实现⽅式，浏览器负责完成实际布局，当布局涉及到不定宽度，分布对⻬的场景时，就要优先考虑弹性盒布局。

### 父元素属性

想要使用flex布局，首先需要给父元素指定为flex布局，这样容器内的元素才能实现flex布局：

```css
.container {
    display: flex | inline-flex;
}
```

这里有两种方式可以设置flex布局，使用`display: flex;`会生成一个块状的flex容器盒子，使用`display: inline-flex;`会生成一个行内的flex容器盒子。

* **flex-direction**：
  
  ```css
  flex-direction: row | row-reverse | column | column-reverse
  ```
  
  * `row`：默认值，沿水平主轴从左到右排列，起点在左沿
  
  * `row-reverse`：沿水平主轴从右到左排列，起点在右沿
  
  * `column`：沿垂直主轴从上到下排列，起点在上沿
  
  * `column-reverse`：沿垂直主轴从下到上排列，起点在下沿

* **flex-wrap**：
  
  ```css
  flex-wrap: nowrap | wrap | wrap-reverse
  ```
  
  * `nowrap`：默认值，不换行。当主轴的长度是固定并且空间不足时，项目尺寸会随之进行调整，而不会换行。
  
  * `wrap`：换行，第一行在上面
  
  * `wrap-reverse`：换行，第一行在下面

* **flex-flow**：
  
  ```css
  flex-flow: <flex-direction> <flex-wrap>
  ```
  
  是 `flex-direction` 属性和`flex-wrap`属性的简写，默认为:`flex-flow:row nowrap`，用处不大，最好还是分开来写。

* **justify-content**：
  
  ```css
  justify-content: flex-start | flex-end | center | space-between | space-around
  ```
  
  * `flex-start`：默认值，元素在主轴上**左对齐**（**上对齐**）
  
  * `flex-end`：元素在主轴上**右对齐**（**下对齐）**
  
  * `center`：元素在主轴上**居中对齐**
  
  * `space-between`：元素在主轴上**两端对齐**，元素之间间隔相等
  
  * `space-around`：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

* **align-item**：
  
  ```css
  align-item: flex-start | flex-end | center | baseline | stretch
  ```
  
  * `flex-start`：交叉轴的起点对齐（上面或左边）
  
  * `flex-end`：交叉轴的终点对齐（下面或右边）
  
  * `center`：交叉轴的中点对齐
  
  * `baseline`：以元素的第一行文字的基线对齐
  
  * `stretch`：默认值，如果元素未设置高度或设为auto，将占满整个容器的高度

* **align-content**：
  
  ```css
  align-content: flex-start | flex-end | center | space-between | space-around | stretch
  ```
  
  多根轴线对齐方式。如果元素只有一根轴线，该属性不起作用。那这个轴线数怎么确定呢？实际上这主要是由flex-wrap属性决定的，当flex-wrap 设置为 nowrap 时，容器仅存在一根轴线，因为项目不会换行，就不会产生多条轴线。当 flex-wrap 设置为 wrap 时，容器可能会出现多条轴线，这时就需要去设置多条轴线之间的对齐方式。

### 子元素属性

* **order**：
  
  ```css
  order: <integer>
  ```
  
  属性用来定义项目的排列顺序。数值越小，排列越靠前，默认为`0`。

* `flex`：
  
  ```css
  flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
  ```
  
  `flex`属性是`flex-grow`, `flex-shrink` 和 `flex-basis`的简写，后两个属性可选。默认值为：`flex:0 1 auto。`
  
  * `none`：即有剩余空间时，不放大也不缩小，最终尺寸通常表现为最大内容宽度。
  
  * `flex-grow`：定义项目的放大比例，默认为0，即如果存在剩余空间时也不放大；如果所有项目的flex-grow属性都设置为1，那么它们会均分剩余的空间；如果其中一个项目的flex-grow属性设置为2，其他均为1，那么它占据的剩余空间就是其他项目的两倍。
  
  * `flex-shrink`：定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小；所有项目的 flex-shrink 属性都为 1，当空间不足时，都将等比例缩小；如果一个项目的 flex-shrink 属性为 0，其他项目都为 1，则空间不足时，前者不缩小。
  
  * `flex-basis`：定义了在分配多余空间之前，项目占据的主轴空间，浏览器会根据这个属性来计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。

* `align-self`：
  
  ```css
  align-self: auto | flex-start | flex-end | center | baseline | stretch
  ```
  
  允许单个项目有与其他项目不一样的对齐方式，可覆盖`align-items`属性。默认值为`auto`，表示继承父元素的`align-items`属性，如果没有父元素，则等同于`stretch`。
