---
layout: post
title: swift4 开发App，适配国际化，多语言支持
date: 2018-06-20 14:37:00
categories: swift学习笔记(纯代码)
tags: swift4 localizable
author: 朋也
---

- [swift4 uinavigation + uitable 整合使用创建列表视图](https://tomoya92.github.io/2018/06/08/swift-uinavigation-uitable/)
- [swift4 自定义UITableCell](https://tomoya92.github.io/2018/06/09/swfit-uitableview-uitablecell/)
- [swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView）](https://tomoya92.github.io/2018/06/11/swift-tableview-activity-indicator/)
- [swift4 给项目添加tablayout布局，XLPagerTabStrip用法](https://tomoya92.github.io/2018/06/13/swift-tablayout-xlpagertabstrip/)
- [swift4 往视图控制器里添加视图控制器（往UIViewController里添加UIViewController）](https://tomoya92.github.io/2018/06/13/swift-adduiviewcontroller-to-uiviewcontroller/)
- [swift4 Moya简单使用，请求接口解析json](https://tomoya92.github.io/2018/06/14/swift-moya/)
- [swift4 UITableView 下拉刷新上拉加载 MJRefresh 自定义用法](https://tomoya92.github.io/2018/06/20/swift-pullrefresh-loadmore/)
- [swift4 开发App，适配国际化，多语言支持](https://tomoya92.github.io/2018/06/20/swift-localizable/)
- [swift4 UITableView 多个部分(Section)用法，实现一个通讯录](https://tomoya92.github.io/2018/06/26/swift-tableview-multipart-section/)
- [swift4 扫描二维码（使用scanSwift实现）](https://tomoya92.github.io/2018/06/27/swift-scan-qrcode/)
- [swift4 侧滑功能（使用DrawerController实现）](https://tomoya92.github.io/2018/06/29/swift-drawercontroller/)
- [swift4 UITabBarController 简单使用](https://tomoya92.github.io/2018/06/29/swift-tabbarcontroller/)
- [swift4 WKWebView使用JS与Swift交互](https://tomoya92.github.io/2018/07/05/swift-webview-javascript/)
- [swift使用webview加载本地html，html里引入本地的css，js](https://tomoya92.github.io/2018/10/31/swift-webview-load-css-js/)
- [swift4 App切换主题的实现方法总结](https://tomoya92.github.io/2018/11/09/swift-theme/)

* content
{:toc}

#### 在项目里新建一个

Localizable.strings 文件

![](/assets/QQ20180620-144009@2x.png)




#### 选中新建的文件，在xcode右边工具栏，点击一下 `Localize...` 按钮

![](/assets/QQ20180620-144150@2x.png)

#### 选中项目，在info里添加语言

![](/assets/QQ20180620-144327@2x.png)

![](/assets/097848C4-8B93-4898-8323-5C68C51FF378.png)

![](/assets/QQ20180620-144441@2x.png)

#### 然后会发现上面新建的 `Localizable.strings` 下面多了两个文件

#### 往两个文件里添加对应语言的变量，注意要加分号 `;`

Localizable.strings (English)

```
topic = "Topic";
comment = "Comment";
```

Localizable.strings (Chinese (Simplified))

```
topic = "话题";
comment = "评论";
```

#### 在项目里取变量的值

```swift
NSLocalizedString("topic", comment: "")
NSLocalizedString("comment", comment: "")
```

#### 运行项目查看效果

![](/assets/QQ20180620-145008.png)

#### 修改模拟器默认语言

- 设置 -> 通用 -> 语言与地区 -> iPhone 语言
- Settings -> General -> Language & Region -> iPhone Language
