---
title: Axios上传进度与取消
categories:
  - 知识碎片
tags:
  - Axios
date: 2020-06-03 18:08:34
---
## 需求

需要实现一个实时展示上传文件进度百分比的展示列表，并且可以中断取消上传。

由于项目中的接口调用都是使用Axios，所以需要基于Axios去实现。

## 实现

### 上传进度

```js
let form = new FormData()
form.append('file', file)
axios.post(url, form, {
  onUploadProgress: progressEvent => {
    const complete = (progressEvent.loaded / progressEvent.total * 100 | 0) // 得到上传的进度百分比
  }
})
```

### 取消上传

```js
import { CancelToken } from 'axios'

let cancel = null
let form = new FormData()
form.append('file', file)
axios.post(url, form, {
  cancelToken: new CancelToken(c => {
    // 需要获取到这个请求的cancelToken
  	cancel = c
  }),
  onUploadProgress: progressEvent => {
    const complete = (progressEvent.loaded / progressEvent.total * 100 | 0) // 得到上传的进度百分比
  }
})

cancel() // 在需要中断请求的时候调用
```

