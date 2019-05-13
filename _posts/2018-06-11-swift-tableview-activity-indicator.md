---
layout: post
title: swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView）
date: 2018-06-11 09:19:00
categories: swift学习笔记(纯代码)
tags: swift4 uitableview uiactivityindicatorview
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

直接上图

![](/assets/swift-uitableview-uiactivityindicatorview.gif)




用法很简单，直接上代码

```swift
let refreshView = UIActivityIndicatorView.init(activityIndicatorStyle: .whiteLarge)

// 设置上颜色，不给颜色它不显示
refreshView.color = UIColor.gray
// 将其设置成tableview的背景view
tableView.backgroundView = refreshView
// 启动时加载
refreshView.startAnimating()

// 关闭动画
refreshView.stopAnimating()
```

tableView 默认是有分割线的，在加载之前可以把分割线去掉，当数据请求完成并处理好了，tableView.reloadData()之前再把这个分割线加上，就好看多了，具体看下面代码

```swift
tableView.separatorStyle = .none
refreshView.startAnimating()
```

```swift
self.tableView.reloadData()
self.refreshView.stopAnimating()
```
