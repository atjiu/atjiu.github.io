---
layout: post
title: swift使用webview加载本地html，html里引入本地的css，js
date: 2018-10-31 10:27:00
categories: swift学习笔记(纯代码)
tags: swift webview
author: 朋也
---

[swift4 uinavigation + uitable 整合使用创建列表视图](https://tomoya92.github.io/2018/06/08/swift-uinavigation-uitable/)
[swift4 自定义UITableCell](https://tomoya92.github.io/2018/06/09/swfit-uitableview-uitablecell/)
[swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView）](https://tomoya92.github.io/2018/06/11/swift-tableview-activity-indicator/)
[swift4 给项目添加tablayout布局，XLPagerTabStrip用法](https://tomoya92.github.io/2018/06/13/swift-tablayout-xlpagertabstrip/)
[swift4 往视图控制器里添加视图控制器（往UIViewController里添加UIViewController）](https://tomoya92.github.io/2018/06/13/swift-adduiviewcontroller-to-uiviewcontroller/)
[swift4 Moya简单使用，请求接口解析json](https://tomoya92.github.io/2018/06/14/swift-moya/)
[swift4 UITableView 下拉刷新上拉加载 MJRefresh 自定义用法](https://tomoya92.github.io/2018/06/20/swift-pullrefresh-loadmore/)
[swift4 开发App，适配国际化，多语言支持](https://tomoya92.github.io/2018/06/20/swift-localizable/)
[swift4 UITableView 多个部分(Section)用法，实现一个通讯录](https://tomoya92.github.io/2018/06/26/swift-tableview-multipart-section/)
[swift4 扫描二维码（使用scanSwift实现）](https://tomoya92.github.io/2018/06/27/swift-scan-qrcode/)
[swift4 侧滑功能（使用DrawerController实现）](https://tomoya92.github.io/2018/06/29/swift-drawercontroller/)
[swift4 UITabBarController 简单使用](https://tomoya92.github.io/2018/06/29/swift-tabbarcontroller/)
[swift4 WKWebView使用JS与Swift交互](https://tomoya92.github.io/2018/07/05/swift-webview-javascript/)
[swift使用webview加载本地html，html里引入本地的css，js](https://tomoya92.github.io/2018/10/31/swift-webview-load-css-js/)
[swift4 App切换主题的实现方法总结](https://tomoya92.github.io/2018/11/09/swift-theme/)

* content
{:toc}

首先把静态页面写好，建议不要在xcode里写，着实难用，可以用sublime/vscode之类的编辑器来写html，css，js，写好之后，打开xcode，把静态页面文件夹直接拖动到项目里，弹出窗口上选择 `create group`，如下图

![](/assets/QQ20181031-103006@2x.png)





我这的目录结构是这样的

![](/assets/QQ20181031103239@2x.png)

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