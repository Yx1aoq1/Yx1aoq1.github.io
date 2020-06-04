---
title: Webpack学习笔记
date: 2018-01-15 14:13:32
categories: 
  - 项目自动化
tags: 
  - Webpack
---
## Webpack 基本介绍

▼ **什么是Webpack：**
webpack是近期最火的一款模块加载器兼打包工具，它能把各种资源，例如JS（含JSX）、coffee、样式（含less/sass）、图片等都作为模块来使用和处理。
我们可以直接使用 require(XXX) 的形式来引入各模块，即使它们可能需要经过编译（比如JSX和sass），但我们无须在上面花费太多心思，因为 webpack 有着各种健全的加载器（loader）在默默处理这些事情。
▼ **为什那么要使用Webpack：**
现今的很多网页其实可以看做是功能丰富的应用，它们拥有着复杂的JavaScript代码和一大堆依赖包。为了简化开发的复杂度，前端社区涌现出了很多好的实践方法：
* **模块化**，让我们可以把复杂的程序细化为小的文件；
* 类似于TypeScript这种在JavaScript基础上拓展的开发语言：使我们能够实现目前版本的JavaScript不能直接使用的特性，并且之后还能转换为JavaScript文件使浏览器可以识别；
* Scss，less等CSS预处理器；
* ...

这些改进确实大大的提高了我们的开发效率，但是利用它们开发的文件往往需要进行额外的处理才能让浏览器识别,而手动处理又是非常繁琐的，这就为Webpack类的工具的出现提供了需求。

## Webpack 的使用

### 安装
我们常规直接使用 npm 的形式来安装（全局安装）：
```
$ npm install webpack -g
```
如果常规项目还是把依赖写入 package.json 包更人性化（局部安装）：
```
$ npm init // 生成package.json文件，写入一些如作者、版本等基本信息
$ npm install webpack --save-dev
```

### 配置
每个项目下都必须配置有一个 webpack.config.js，就是一个配置项，告诉 webpack 它需要做什么。
```js
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
  //插件项
  plugins: [commonsPlugin],
  //页面入口文件配置
  entry: {
    index : './src/js/page/index.js'
  },
  //入口文件输出配置
  output: {
    path: 'dist/js/page',
    filename: '[name].js'
  },
  module: {
    //加载器配置
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.js$/, loader: 'jsx-loader?harmony' },
      { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
    ]
  },
  //其它解决方案配置
  resolve: {
    root: 'E:/github/flux-example/src', //绝对路径
    extensions: ['', '.js', '.json', '.scss'],
    alias: {
      AppStore : 'js/stores/AppStores.js',
      ActionType : 'js/actions/ActionType.js',
      AppAction : 'js/actions/AppAction.js'
    }
  }
};
```
▼ **plugins：**
插件项，这里我们使用了一个 CommonsChunkPlugin 的插件，它用于提取多个入口文件的公共脚本部分，然后生成一个 common.js 来方便多页面之间进行复用。
▼ **entry：**
页面入口文件配置，output 是对应输出项配置（即入口文件最终要生成什么名字的文件、存放到哪里），其语法大致为：
```js
{
  entry: {
    page1: "./page1",
    //支持数组形式，将加载数组中的所有模块，但以最后一个模块作为输出
    page2: ["./entry1", "./entry2"]
  },
  output: {
   path: "dist/js/page",
   filename: "[name].bundle.js"
  }
}
```
该段代码最终会生成一个 page1.bundle.js 和 page2.bundle.js，并存放到 ./dist/js/page 文件夹下。
▼ **module.loaders：**
告知 webpack 每一种文件都需要使用什么加载器来处理：
```js
module: {
  //加载器配置
  loaders: [
    //.css 文件使用 style-loader 和 css-loader 来处理
    { test: /\.css$/, loader: 'style-loader!css-loader' },
    //.js 文件使用 jsx-loader 来编译处理
    { test: /\.js$/, loader: 'jsx-loader?harmony' },
    //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
    { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
    //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
    { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
  ]
}
```
如上，"-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
**所有的加载器都需要通过 npm 来加载，并建议查阅它们对应的 readme 来看看如何使用。**
如：url-loader，它会将样式中引用到的图片转为模块来处理，使用该加载器需要先进行安装：
```
npm install url-loader -save-dev
```
配置信息的参数“?limit=8192”表示将所有小于8kb的图片都转为base64形式（其实应该说超过8kb的才使用 url-loader 来映射到文件，否则转为data url形式）。
▼ **resolve：**
其它解决方案配置
```js
resolve: {
  //查找module的话从这里开始查找
  root: 'E:/github/flux-example/src', //绝对路径
  //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
  extensions: ['', '.js', '.json', '.scss'],
  //模块别名定义，方便后续直接引用别名，无须多写长长的地址
  alias: {
    AppStore : 'js/stores/AppStores.js',//后续直接 require('AppStore') 即可
    ActionType : 'js/actions/ActionType.js',
    AppAction : 'js/actions/AppAction.js'
  }
}
```
### 运行

```
$ webpack --display-error-details
```
后面的参数“--display-error-details”是推荐加上的，方便出错时能查阅更详尽的信息（比如 webpack 寻找模块的过程），从而更好定位到问题。
其他主要的参数有：
```
$ webpack --config XXX.js   //使用另一份配置文件（比如webpack.config2.js）来打包
$ webpack --watch   //监听变动并自动打包
$ webpack -p    //压缩混淆脚本，这个非常非常重要！
$ webpack -d    //生成map映射文件，告知哪些模块被最终打包到哪里了
```

## 实战应用

项目文件夹结构如下图：
![](https://github.com/Yx1aoq1/Yx1aoq1.github.io/raw/master/images/webpack-1.png)

* src目录下的文件夹存放源代码，dist目录下存放打包过后的代码
```js
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/index.js', // 以index.js为入口
  output: {
    filename: 'js/canvas-filter.bundle.js', // 打包后生成的文件
    path: path.resolve(__dirname,'./dist') // 使用绝对路径
  },
  module: {
    rules: [
      { // 使js中能够require css 文件的loader
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      },
      { // 使得less文件能够解析成css的loader
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader',
          'postcss-loader'
        ]
      },
      { // 使得能够正确引用图片文件路径的loader
        test: /\.(png|jpg|gif|svg)$/i,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    // 再项目中使用jquery时所需要的配置
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    // 使用webpack-dev-server，开启本地服务器
    hot: true,
    inline: true
  }
}
```

