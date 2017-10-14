---
title: Sublime Text3前端插件分享
date: 2017-02-28 16:05:18
tags: [Sublime]
---

自从寒假抛弃了DW开始用Sublime Text3，一直沉浸在它的好用上面，打代码超快！界面又超好看！超爱哦！有几个关于前端的插件特别特别好，下面是安利

<!--more-->

***
* **Emmet:**
快速编写HTML+CSS代码，快捷键**ctrl+E**
[关于如何速写的教程](http://www.iteye.com/news/27580)
* **JSFormat:**
Javascript的代码格式化插件
* **Less:**
LESS高亮插件
* **All Autocomplete:**
搜索所有打开的文件来寻找匹配的提示词
* **AutoFileName:**
自动检索并补齐文件路径
* **CSScomb:**
使用指定排序方法对CSS的属性进行排序，快捷键**ctrl+alt+C**
虽然好像很厉害的样子但是我安装了之后一直没有反应，还未找到办法
* **Doc​Blockr:**
生成优美注释,输入`/*`、`/**`然后回车
* **ConvertToUTF8:**
通过本插件，您可以编辑并保存目前编码不被 Sublime Text 支持的文件，特别是中日韩用户使用的 GB2312，GBK，BIG5，EUC-KR，EUC-JP ，ANSI等
* **Nodejs:**
node代码提示
* **Trailing spaces:**
检测并一键去除代码中多余的空格,一键删除多余空格：CTRL+SHITF+T（需配置）
* **FileDiffs:**
比较当前文件与选中的代码、剪切板中代码、另一文件、未保存文件之间的差别。可配置为显示差别在外部比较工具，精确到行
* **HTML-CSS-JS Prettify:**
美化代码格式，需要安装node.js才能使用，快捷键**ctrl+alt+H**，可以自动对齐
* **ColorHighlighter:**
可以显示颜色代码的颜色，看上去一目了然
* **ChineseLocalization:**
汉化插件
* **BracketHighlighter:**
括号以及标签层级显示
* **Sidebarenhancements:**
扩展鼠标右键菜单，可以直接open with浏览器，超方便
* **SublimeCodeIntel:**
可以快速提示补全标签，但是有个缺点就是打了分号之后会弹出提示框，然后换行的时候各种误打一堆烂七八糟的代码，在网上找了挺久的办法终于找到一个可行的，附上
打开*Package Settings > SublimeCodeIntel > Key Bindings - User*,输入代码

```python
[
	{
		"keys": [";"], "command": "run_macro_file",
	  	"args": {"file": "Packages/User/unAutoSemiColon.sublime-macro"}
	}
]
```
然后打开 *Preferences > Browser Package > User*，保存文件名为*unAutoSemiColon.sublime-macro*
```python
[
    {
        "args":
        {
            "characters": ";"
        },
        "command": "insert"
    }
]
```
之后打分号再也不会出现提示啦！！
* **SublimeTmpl:**
可以快速创建代码模板
**ctrl+shift+H** HTML模板
**ctrl+shift+C** CSS模板
**ctrl+shift+J** Javascript模板
**ctrl+shift+P** php模板
*  **Colorsublime:**
更换主题的插件，含有很多主题配色方案，偶尔转换一下心情
***
