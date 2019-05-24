---
title: iconfont使用方法
date: 2017-03-26 09:12:56
categories: 知识碎片
tags:
  - iconfont
---
实习的时候需要用到iconfont，然而看了官方文档觉得一脸懵逼，找了一下教程

首先在[Iconfont-阿里巴巴矢量图标库](http://www.iconfont.cn/)上将需要的图标点击购物车按钮加入**暂存库**。
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/iconfont-img-1.png)

<!--more-->

实习的时候需要用到iconfont，然而看了官方文档觉得一脸懵逼，找了一下教程

首先在[Iconfont-阿里巴巴矢量图标库](http://www.iconfont.cn/)上将需要的图标点击购物车按钮加入**暂存库**。
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/iconfont-img-1.png)

选择所有要用的图标后，**存储为项目**，给它命名。然后在**图标管理-图标应用项目**中找到这个项目，获取在线连接，把里面的代码复制到CSS中。
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/iconfont-img-2.png)

在HTML中需要使用到图标时，使用iconfont类名。
```html
<i class="iconfont">&#xe600;</i>
```
里面写上你想用的图标下面的Unicode：
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/iconfont-img-3.png)

可以通过控制iconfont类的属性改变图标的样式：
```css
.iconfont{
	font-family:"iconfont";
	font-size:16px;
	font-style:normal;
	-webkit-font-smoothing: antialiased;
        -webkit-text-stroke-width: 0.2px;
        -moz-osx-font-smoothing: grayscale; 
        padding-left:20px
}
```

也可以下载到本地使用。图标都加入暂存架后选择**下载到本地**，会得到以下几个文件：
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/iconfont-img-4.png)
浏览器打开demo.html可以看到每个图标的Unicode，把**iconfont.css**里的代码复制到css里面，把下面四个文件放到css可以引用到的文件夹里就可以了。下载使用的一个缺点是添加图标的话要重新把所有图标再下载一遍覆盖原来的文件，如果是在线链接只要重新生成一次链接就好了。

***
作者：班星灿
链接：https://www.zhihu.com/question/25952487/answer/71917554
来源：知乎