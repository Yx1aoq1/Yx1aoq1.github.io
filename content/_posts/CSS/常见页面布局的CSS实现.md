---
title: 常见页面布局的CSS实现
categories:
  - CSS
tags:
  - CSS
date: 2025-02-27 19:13:03
---

### 居中

#### 水平居中

对于水平居中一般可以使用如下四种方式：

- 对于行内元素我们可以在父元素上设置`text-align:center;`来实现
  
  ```css
  .center {
    text-align: center;
  }
  ```

- 对于定长块级元素我们可以使用`margin: 0 auto;`来实现
  
  ```css
  .center {
    width: 130px;
    margin: 0 auto;
  }
  ```

- 我们可以在父元素上使用`flex`布局来实现
  
  ```css
  .center {
    display: flex;
    justify-content: center;
  }
  ```

- 我们可以在父元素上使用`grid`布局来实现
  
  ```css
  .center {
    display: grid;
    justify-content: center;
  }
  ```

#### 垂直居中

对于垂直居中一般可以使用如下四种方式：

- 我们可以在父元素上设置`line-height`等于`height`来实现
  
  ```css
  .center {
    height: 100px;
    line-height: 100px;
  }
  ```

- 我们可以在父元素上使用`flex`布局来实现
  
  ```css
  .center {
    display: flex;
    align-items: center;
  }
  ```

- 我们可以在父元素上使用`grid`布局来实现
  
  ```css
  .center {
    display: grid;
    align-content: center;
  }
  ```

- 我们可以在父元素上使用`table`布局来实现
  
  ```css
  .center {
    display: table-cell;
    vertical-align: middle;
  }
  ```

#### 水平垂直居中

- **绝对定位**
  
  ```css
  .center {
    position: absolute;
    width: 200px;
    height: 100px;
    background: red;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }
  ```

- **绝对定位加负外边距**：需要知道居中元素的具体宽高，不然负的`margin`没法设置
  
  ```css
  .center {
    position: absolute;
    width: 200px;
    height: 100px;
    background: red;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -50px;
  }
  ```

- **绝对定位加平移**：不需要考虑居中盒子的具体宽高
  
  ```css
  .center {
    position: absolute;
    width: 200px;
    height: 100px;
    background: red;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  ```

- **使用 flex 实现**
  
  ```css
  .center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ```

- **使用 grid 实现**
  
  ```css
  .center {
    display: grid;
    /* align-content和justify-content的简写 */
    place-content: center;
  }
  ```
* **使用 table 加外边距实现**，需注意：
  
  - `display: table`时`padding`会失效
  
  - `display: table-row`时`margin、padding`同时失效
  
  - `display: table-cell`时`margin`会失效
  
  ```css
  .box {
    height: 300px;
    width: 600px;
    display: table-cell;
    vertical-align: middle;
  }
  
  .child {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }
  ```

### 等高布局

等高布局一般把网页垂直分成几部分，每一部分的高度是取这几个模块中最高的那个。效果如下

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/flex-denggao.png?imageSlim)

```html
<div class="wrap">
  <div class="left">left</div>
  <div class="content">content</div>
  <div class="right">right</div>
</div>
```

#### flex 布局实现

```css
.wrap {
  display: flex;
  min-height: 100%;
}

.left {
  flex-basis: 100px;
  background-color: #e7ece7;
}

.right {
  flex-basis: 100px;
  background-color: #c7cca9;
}

.content {
  height: 200px;
  flex-grow: 1;
  background-color: #fac5cc;
}
```

#### gird 布局实现

```css
.wrap {
  display: flex;
  min-height: 100%;
  grid-template-columns: 100px auto 100px;
}

.left {
  background-color: #e7ece7;
}

.right {
  background-color: #c7cca9;
}

.content {
  height: 200px;
  background-color: #fac5cc;
}
```

#### table 布局实现

```css
.wrap {
  display: table;
  min-height: 100%;
}

.left {
  width: 100px;
  display: table-cell;
  background-color: #e7ece7;
}

.right {
  width: 100px;
  display: table-cell;
  background-color: #c7cca9;
}

.content {
  display: table-cell;
  height: 200px;
  background-color: #fac5cc;
}
```

### 单栏布局

单栏布局我们常用在网页框架上，一般我们把网页分为  `header`、`content`、`footer`三部分。

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/flex-danlan.png?imageSlim)

#### 顶底部都不固定

- **使用 padding 加负 margin 实现**
  
  ```html
  <div class="wrap">
    <div class="header">header</div>
    <div class="content">content</div>
  </div>
  <div class="footer">footer</div>
  ```
  
  ```css
  .wrap {
    min-height: 100%;
    padding-bottom: 50px;
    overflow: auto;
    box-sizing: border-box;
  }
  
  .header {
    height: 50px;
    background-color: #e7ece7;
  }
  
  .footer {
    height: 50px;
    margin-top: -50px;
    background-color: #c7cca9;
  }
  
  .content {
    height: 200px;
    background-color: #fac5cc;
  }
  ```

- **使用 flex 实现**
  
  ```html
  <div class="wrap">
    <div class="header">header</div>
    <div class="content">content</div>
    <div class="footer">footer</div>
  </div>
  ```
  
  ```css
  .wrap {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    height: 50px;
    background-color: #e7ece7;
  }
  
  .footer {
    height: 50px;
    background-color: #c7cca9;
  }
  
  .content {
    flex-grow: 1;
    background-color: #fac5cc;
  }
  ```

#### 顶部固定

- **使用 padding 加负 margin 加 fixed 实现顶部固定布局**
  
  ```html
  <div class="header">header</div>
  <div class="wrap">
    <div class="content">content</div>
  </div>
  <div class="footer">footer</div>
  ```
  
  ```css
  .header {
    height: 50px;
    width: 100%;
    position: fixed;
    background-color: #e7ece7;
  }
  
  .wrap {
    min-height: 100%;
    overflow: auto;
    box-sizing: border-box;
  }
  
  .content {
    margin-top: 50px;
    height: 200px;
    background-color: #fac5cc;
  }
  
  .footer {
    height: 50px;
    margin-top: -50px;
    background-color: #c7cca9;
  }
  ```
* **使用 flex 加 fixed 定位实现**
  
  ```html
  <div class="wrap">
    <div class="header">header</div>
    <div class="content">content</div>
    <div class="footer">footer</div>
  </div>
  ```
  
  ```css
  .wrap {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    height: 50px;
    width: 100%;
    position: fixed;
    background-color: #e7ece7;
  }
  
  .content {
    margin-top: 50px;
    flex-grow: 1;
    height: 200px;
    background-color: #fac5cc;
  }
  
  .footer {
    height: 50px;
    background-color: #c7cca9;
  }
  ```

#### 底部固定

- **使用 padding 加负 margin 实现底部固定布局**
  
  ```html
  <div class="wrap">
    <div class="header">header</div>
    <div class="content">content</div>
  </div>
  <div class="footer">footer</div>
  ```
  
  ```css
  .wrap {
    height: 100%;
    padding-bottom: 50px;
    overflow: auto;
    box-sizing: border-box;
  }
  
  .header {
    height: 50px;
    background-color: #e7ece7;
  }
  
  .content {
    height: 200px;
    background-color: #fac5cc;
  }
  
  .footer {
    height: 50px;
    margin-top: -50px;
    background-color: #c7cca9;
  }
  ```

- **使用 flex 加 fixed 定位实现**
  
  ```html
  <div class="wrap">
    <div class="header">header</div>
    <div class="content">content</div>
    <div class="footer">footer</div>
  </div>
  ```
  
  ```css
  .wrap {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    height: 50px;
    background-color: #e7ece7;
  }
  
  .content {
    margin-top: 50px;
    flex-grow: 1;
    height: 200px;
    background-color: #fac5cc;
  }
  
  .footer {
    height: 50px;
    width: 100%;
    position: fixed;
    background-color: #c7cca9;
  }
  ```

### 两栏布局

两栏布局就是一边固定，另外一边自适应

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/two-columns.png?imageSlim)

- **左 float，然后右 margin-left（右边自适应）**
  
  ```html
  <div class="aside"></div>
  <div class="main"></div>
  ```
  
  ```css
  .aside {
    width: 100px;
    height: 100%;
    float: left;
    background-color: #e7ece7;
  }
  
  .main {
    height: 100%;
    margin-left: 100px;
    background-color: #fac5cc;
  }
  ```

- **右 float，然后右 margin-right（左边自适应）**
  
  ```html
  <div class="aside"></div>
  <div class="main"></div>
  ```
  
  ```css
  .aside {
    width: 100px;
    height: 100%;
    float: right;
    background-color: #e7ece7;
  }
  
  .main {
    height: 100%;
    margin-right: 100px;
    background-color: #fac5cc;
  }
  ```

- **absolute 定位加 margin-left（右边自适应）**
  
  ```html
  <div class="wrap">
    <div class="aside">aside</div>
    <div class="main">main</div>
  </div>
  ```
  
  ```css
  .wrap {
    height: 100%;
    position: relative;
  }
  
  .aside {
    width: 100px;
    height: 100%;
    position: absolute;
    background-color: #e7ece7;
  }
  
  .main {
    height: 100%;
    margin-left: 100px;
    background-color: #fac5cc;
  }
  ```
* **absolute 定位加 margin-right（左边自适应）**
  
  ```html
  <div class="wrap">
    <div class="aside">aside</div>
    <div class="main">main</div>
  </div>
  ```
  
  ```css
  .wrap {
    height: 100%;
    position: relative;
  }
  
  .aside {
    width: 100px;
    height: 100%;
    position: absolute;
    right: 0;
    background-color: #e7ece7;
  }
  
  .main {
    height: 100%;
    margin-right: 100px;
    background-color: #fac5cc;
  }
  ```

* 使用 flex 实现
  
  ```html
  <div class="wrap">
    <div class="aside">aside</div>
    <div class="main">main</div>
  </div>
  ```
  
  ```css
  .wrap {
    display: flex;
    height: 100%;
  }
  
  .aside {
    flex: 0 0 100px;
    background-color: #e7ece7;
  }
  
  .main {
    flex: 1 1;
    background-color: #fac5cc;
  }
  ```

* **使用 grid 实现**
  
  ```html
  <div class="wrap">
    <div class="aside">aside</div>
    <div class="main">main</div>
  </div>
  ```
  
  ```css
  .wrap {
    display: grid;
    grid-template-columns: 100px auto;
    height: 100%;
  }
  
  .aside {
    flex: 0 0 100px;
    background-color: #e7ece7;
  }
  
  .main {
    flex: 1 1;
    background-color: #fac5cc;
  }
  ```

### 三栏布局

三栏布局就是两边固定，中间自适应布局

![](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/three-columns.png?imageSlim)

- **position + margin-left + margin-right 实现三栏布局**
  
  ```html
  <div class="left"></div>
  <div class="middle"></div>
  <div class="right"></div>
  ```
  
  ```css
  .left {
    position: absolute;
    left: 0;
    top: 0;
    width: 100px;
    height: 100%;
    background-color: #e7ece7;
  }
  
  .middle {
    margin-left: 100px;
    margin-right: 100px;
    height: 100%;
    background-color: #fac5cc;
  }
  
  .right {
    position: absolute;
    right: 0;
    top: 0;
    width: 100px;
    height: 100%;
    background-color: #c7cca9;
  }
  ```

- **float + margin-left + margin-right 实现三栏布局**
  
  ```html
  <div class="left"></div>
  <div class="right"></div>
  <div class="middle"></div>
  ```
  
  ```css
  .left {
    float: left;
    width: 100px;
    height: 100%;
    background-color: #e7ece7;
  }
  
  .middle {
    margin-left: 100px;
    margin-right: 100px;
    height: 100%;
    background-color: #fac5cc;
  }
  
  .right {
    float: right;
    width: 100px;
    height: 100%;
    background-color: #c7cca9;
  }
  ```

- **flex 实现三栏布局**
  
  ```html
  <div class="wrap">
    <div class="left"></div>
    <div class="middle"></div>
    <div class="right"></div>
  </div>
  ```
  
  ```css
  .wrap {
    display: grid;
    grid-template-columns: 100px auto 100px;
    height: 100%;
  }
  
  .left {
    height: 100%;
    background-color: #e7ece7;
  }
  
  .middle {
    height: 100%;
    background-color: #fac5cc;
  }
  
  .right {
    height: 100%;
    background-color: #c7cca9;
  }
  ```
* **圣杯布局**：主要用到了浮动和和相对定位
  
  ```html
  <div class="wrap">
    <div class="middle">middle</div>
    <div class="left">left</div>
    <div class="right">right</div>
  </div>
  ```
  
  ```css
  .wrap {
    padding: 0 100px 0 100px;
    height: 100%;
  }
  
  .left {
    width: 100px;
    height: 100%;
    float: left;
    margin-left: -100%;
    position: relative;
    left: -100px;
    background-color: #e7ece7;
  }
  
  .middle {
    width: 100%;
    height: 100%;
    float: left;
    background-color: #fac5cc;
  }
  
  .right {
    width: 100px;
    height: 100%;
    float: left;
    margin-left: -100px;
    position: relative;
    right: -100px;
    background-color: #c7cca9;
  }
  ```

* **双飞翼布局**
  
  ```html
  <div class="wrap">
    <div class="middle">middle</div>
  </div>
  <div class="left">left</div>
  <div class="right">right</div>
  ```
  
  ```css
  .wrap {
    float: left;
    width: 100%;
    height: 100%;
  }
  
  .left {
    width: 100px;
    height: 100%;
    float: left;
    margin-left: -100%;
    background-color: #e7ece7;
  }
  
  .middle {
    height: 100%;
    margin-left: 100px;
    margin-right: 100px;
    background-color: #fac5cc;
  }
  
  .right {
    width: 100px;
    height: 100%;
    float: left;
    margin-left: -100px;
    background-color: #c7cca9;
  }
  ```
