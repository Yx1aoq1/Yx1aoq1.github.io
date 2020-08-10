

## SQL注入

> SQL注入漏洞（SQL Injection）是Web开发中最常见的一种安全漏洞，可以用它来数据库获取敏感信息，或者利用数据库的特性执行添加用户，导出文件等一系列恶意操作，甚至有可能获取数据库乃至系统用户最高权限。

### SQL 注入原理

一个简单的管理页登录表单：

```html
<form action="/login" method="POST">
  <p>Username: <input type="text" name="username" /></p>
  <p>Password: <input type="password" name="password" /></p>
  <p><input type="submit" value="Submit" /></p>
</form>
```

后端的SQL语句可能是如下这样的：目的就是为了验证用户名和密码是否正确。

```sql
SELECT * FROM user WHERE username='${username}' AND psw='${password}'
```

如果恶意攻击者输入的用户名是`1' OR 1 = 1 --`，由于SQL语法中`--`号后的内容会被识别为注释，所以执行的语句将会变成：

```sql
SELECT * FROM user WHERE username='1' OR 1 = 1 --AND psw='123'
```

这样，无论密码输入什么，都可以正常的登录系统。

### 如何预防

* **严格限制Web应用的数据库的操作权限**，给此用户提供仅仅能够满足其工作的最低权限，从而最大限度的减少注入工具对数据库的危害。
* **后端代码检查输入的数据是否符合预期**，严格限制变量的类型，例如使用正则表达式进行一些匹配处理。
* **对进入数据库的特殊字符（`'`，`"`，`\`，`<`，`>`，`&`，`\*`，`;` 等）进行转义处理**，或编码转换。
* **所有的查询语句建议使用数据库提供的参数化查询接口**，参数化的语句使用参数而不是将用户输入变量嵌入到 SQL 语句中，即不要直接拼接 SQL 语句。例如 Node.js 中的 mysqljs 库的 `query` 方法中的 `?` 占位参数。

```js
mysql.query(`SELECT * FROM user WHERE username = ? AND psw = ?`, [username, psw])
```

* **在应用发布之前建议使用专业的 SQL 注入检测工具进行检测**，以及时修补被发现的 SQL 注入漏洞。网上有很多这方面的开源工具，例如 sqlmap、SQLninja 等。
* **避免网站打印出 SQL 错误信息**，比如类型错误、字段不匹配等，把代码里的 SQL 语句暴露出来，以防止攻击者利用这些错误信息进行 SQL 注入。
* **不要过于细化返回的错误信息**，如果目的是方便调试，就去使用后端日志，不要在接口上过多的暴露出错信息，毕竟真正的用户不关心太多的技术细节，只要话术合理就行。

## 命令行注入

> 命令行注入漏洞，指的是攻击者能够通过 HTTP 请求直接侵入主机，执行攻击者预设的 shell 命令。

### 命令行注入原理

以Nodejs为例，加入在接口中需要从github下载用户指定的repo

```js
const exec = require('mz/child_process').exec
let params = { /* 用户输入的参数 */ }

exec(`git cloen ${params.repo} /some/path`)
```

如果传入的`params.repo`是`https://github.com/xx/xx.git && rm -rf /*`而且恰好你的服务是用root权限起的，就悲剧了。

### 如何预防

- 后端对前端提交内容需要完全选择不相信，并且对其进行规则限制（比如正则表达式）。
- 在调用系统命令前对所有传入参数进行命令行参数转义过滤。
- 不要直接拼接命令语句，借助一些工具做拼接、转义预处理，例如 Node.js 的 `shell-escape` npm 包。

## DDos攻击





参考链接：

* [常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/#csrf-2)

* [前端安全系列之二：如何防止CSRF攻击？](https://juejin.im/post/5bc009996fb9a05d0a055192#heading-24)
* 