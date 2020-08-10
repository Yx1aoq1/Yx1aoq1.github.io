---
title: 【Web安全】XSS
categories:
  - Web基础
tags:
  - XSS
date: 2020-08-10 16:59:56
---
## XSS

> XSS（Cross Site Script），跨站脚本攻击，因为缩写和 CSS 重叠，所以只能叫 XSS。
>
> XSS 的原理是恶意攻击者往 Web 页面里插入恶意可执行网页脚本代码，当用户浏览该页之时，嵌入其中的脚本代码会被执行，从而可以达到攻击者盗取用户信息或其他侵犯用户安全隐私的目的。

XSS 的攻击方式千变万化，但还是可以大致细分为以下几种：

### 非持久型 XSS

非持久型 XSS 漏洞，也叫反射型 XSS 漏洞，一般是通过给别人发送带有恶意脚本代码参数的 URL ，当 URL 地址被打开时，特有的恶意代码参数被 HTML 解析、执行。

**▼例子**

例如你的Web页面中包含以下代码：

```html
Select your language:
<select>
  <srcipt>
  	document.write(''
    	+ '<option value=1>'
    	+ location.href.substring(location.href.indexOf('default=') + 8)
    	+ '</option>'
    )
    document.write('<option value=2>English</option>')
  </srcipt>
</select>
```

而攻击者就可以使用`http://xx.com/xx?default=<script>alert(document.cookie)</script>`注入可执行的脚本代码。

**▼特点**

* 即时性，不经过服务器存储，直接通过 HTTP 的 GET 和 POST 请求完成一次攻击，拿到用户隐私数据。
* 攻击者需要诱骗点击
* 反馈率低，所以较难发现和响应修复
* 盗取用户敏感保密信息

**▼如何防御**

* Web 页面渲染的所有内容或者渲染的数据都必须来自于服务端
* 尽量不要从 URL，`document.referrer`、`document.forms`等这种 DOM API 中获取数据直接渲染
* 尽量不要使用 `eval`等可执行字符串的方法
* 如果做不到以上几点，也必须对涉及 DOM 渲染方法传入的字符串参数进行**escape转义**
* 前端渲染的时候对任何的字段都要进行**escape转义**

**▼escape转义方法**

```js
function escapeHTML(s) {
  return new Option(s).innerHTML
}

escapeHTML(`<script>alert('xss')</script>`) // &lt;script&gt;alert('xss')&lt;/script&gt
```

### 持久型 XSS

持久型 XSS 漏洞，也被称为存储型 XSS 漏洞，一般存在于 Form 表单提交等交互功能，如发帖留言，提交文本信息等，黑客利用的 XSS 漏洞，将内容经正常功能提交进入数据库持久保存，当前端页面获得后端从数据库中读出的注入代码时，恰好将其渲染执行。

主要注入页面方式和非持久型 XSS 漏洞类似，只不过持久型的不是来源于 URL，`refferer`，`forms` 等，而是来源于后端从数据库中读出来的数据。持久型 XSS 攻击不需要诱骗点击，黑客只需要在提交表单的地方完成注入即可，但是这种 XSS 攻击的成本相对还是很高。攻击成功需要同时满足以下几个条件：

* POST 请求提交表单后端没有做转义直接入库
* 后端从数据库中取出数据没做转义直接输出给前端
* 前端拿到后端数据没做转义直接渲染成 DOM

**▼特点**

* 持久性，植入在数据库中
* 危害面广，甚至可以让用户机器变成 DDoS 攻击的肉鸡
* 盗取用户敏感私密信息

**▼如何防御**

* 前后端都要对数据做好转义处理

### 基于字符集的 XSS

其实现在很多的浏览器以及各种开源的库都专门针对了 XSS 进行转义处理，尽量默认抵御绝大多数 XSS 攻击，但是还是有很多方式可以绕过转义规则，让人防不胜防。比如**「基于字符集的 XSS 攻击」**就是绕过这些转义处理的一种攻击方式。有些 Web 页面字符集不固定，用户输入非期望字符集的字符，有时会绕过转义过滤规则。

以基于 utf-7 的 XSS 为例：

utf-7 是可以将所有的 unicode 通过 7bit 来表示的一种字符集 （但现在已经从 Unicode 规格中移除）。
这个字符集为了通过 7bit 来表示所有的文字，除去数字和一部分的符号，其它的部分将都以 base64 编码为基础的方式呈现。

```html
<script>alert("xss")</script>
可以被解释为：
+ADw-script+AD4-alert(+ACI-xss+ACI-)+ADw-/script+AD4-
```

可以形成**「基于字符集的 XSS 攻击」**的原因是由于浏览器在 meta 没有指定 charset 的时候有自动识别编码的机制，所以这类攻击通常就是发生在没有指定或者没来得及指定 meta 标签的 charset 的情况下。

**▼如何防御**

* 指定`<meta charset="utf-8">`
* XML 中不仅要指定字符集为 utf-8，而且标签要闭合

### 未经验证的跳转 XSS

有一些场景是后端需要对一个传进来的待跳转的 URL 参数进行一个 302 跳转，可能其中会带有一些用户的敏感（cookie）信息。如果服务器端做302 跳转，跳转的地址来自用户的输入，攻击者可以输入一个恶意的跳转地址来执行脚本。

**▼如何防御**

* 对待跳转的 URL 参数做白名单或者某种规则过滤
* 后端注意对敏感信息的保护, 比如 cookie 使用来源验证



参考链接：

* [常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/#csrf-2)
