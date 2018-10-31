---
layout: post
title: swift使用webview加载本地html，html里引入本地的css，js
date: 2018-10-31 10:27:00
categories: swift学习笔记(纯代码)
tags: swift webview
author: 朋也
---

* content
{:toc}

首先把静态页面写好，建议不要在xcode里写，着实难用，可以用sublime/vscode之类的编辑器来写html，css，js，写好之后，打开xcode，把静态页面文件夹直接拖动到项目里，弹出窗口上选择 `create group`，如下图

![](https://tomoya92.github.io/assets/QQ20181031-103006@2x.png)





我这的目录结构是这样的

![](https://tomoya92.github.io/assets/QQ20181031103239@2x.png)

html引入css，js写法如下
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0,user-scalable=no" />
  <link rel="stylesheet" href="app.css">
  <script src="underscore.min.js"></script>
</head>

<body>
</body>
```

下面是swift里通过代码加载html

```swift
// 将页面内容转成string
let TOPICDETAILHTML = try! String(contentsOfFile: Bundle.main.path(forResource: "topic_detail", ofType: "html")!, encoding: String.Encoding.utf8)

// 通过webview加载
webView.loadHTMLString(TOPICDETAILHTML, baseURL: Bundle.main.resourceURL)
```

然后运行项目，页面就加载进来了，然后就可以通过swift与webview之间交互来开发了，详见博客 [https://tomoya92.github.io/2018/07/05/swift-webview-javascript/](https://tomoya92.github.io/2018/07/05/swift-webview-javascript/)