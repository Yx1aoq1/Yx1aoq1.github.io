---
title: Vue中使用SvgIcon组件
categories:
  - Vue
tags:
  - Vue
date: 2020-11-10 11:33:13
---

### 在`src/components/`下创建`SvgIcon`组件

```vue
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"/>
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  computed: {
    iconName () {
      return `#icon-${this.iconClass}`
    },
    svgClass () {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    },
  },
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
```

### 在`src/`下创建一个`icons`目录，目录结构如下：

![img](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/166a4060f570529f)

`index.js`文件内容：

```js
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)
```

### 在`main.js`中引入

```js
import '@/icons'
```

### 修改默认的`loader`:

`vue-cli3`中的`vue.config.js`配置：

```js
chainWebpack: config => {
  // 将 icons 目录排除在 svg 默认规则之外
  config.module
    .rule('svg')
    .exclude.add(resolve('src/icons'))
    .end()
  // 用 svg-sprite-loader 处理 icons 下的 svg
  config.module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('src/icons'))
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({
    	symbolId: 'icon-[name]'
  	})
    .end()
},
```

### 如何使用？

* 把`.svg`文件放到`src/icons/svg`的目录下；
* 点击`svg`查看源码，修改`fill`属性， `fill="currentColor"`，或者`fill=""`，如果无此属性，就不用管，这样做是可以让外部控制icon的颜色，或随父元素的color；
* 注意`svg`命名和`SvgIcon`命名一致，看一下最终使用：

```vue
<svg-icon icon-class="go-back"></svg-icon>
```



参考链接：

* [在vue项目中优雅的使用Svg](https://juejin.im/post/6844903697999200263#heading-2)