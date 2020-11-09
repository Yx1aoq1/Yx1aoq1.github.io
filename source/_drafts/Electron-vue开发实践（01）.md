## Electron简要介绍

## Electron-vue实践

### 项目初始化

在[electron-vue](https://legacy.gitbook.com/book/simulatedgreg/electron-vue)的文档中有介绍通过`vue-cli`脚手架创建项目模板，考虑到`vue-cli`已经升级至`4.x`版本，所以没有使用用脚手架模板的方式创建项目，而是引入了[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)。

使用`vue-cli`创建一个新的项目：

```
vue create hello-world
```

接着在项目文件夹内安装插件`electron-builder`：

```
vue add electron-builder
```

执行完成之后你会发现项目文件产生了一些变化：

![image-20201029140554207](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201029140554207.png)

之后执行`yarn run electron:serve`就可以启动项目：

![image-20201029143146380](https://images-1300309047.cos.ap-chengdu.myqcloud.com/blog/image-20201029143146380.png)