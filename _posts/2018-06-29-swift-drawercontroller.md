---
layout: post
title: swift4 侧滑功能（使用DrawerController实现）
date: 2018-06-29 10:47:00
categories: swift学习笔记(纯代码)
tags: swift4
author: 朋也
---

* content
{:toc}

- [swift4 uinavigation + uitable 整合使用创建列表视图](https://blog.yiiu.co/2018/06/08/swift-uinavigation-uitable/)
- [swift4 自定义UITableCell](https://blog.yiiu.co/2018/06/09/swfit-uitableview-uitablecell/)
- [swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView）](https://blog.yiiu.co/2018/06/11/swift-tableview-activity-indicator/)
- [swift4 给项目添加tablayout布局，XLPagerTabStrip用法](https://blog.yiiu.co/2018/06/13/swift-tablayout-xlpagertabstrip/)
- [swift4 往视图控制器里添加视图控制器（往UIViewController里添加UIViewController）](https://blog.yiiu.co/2018/06/13/swift-adduiviewcontroller-to-uiviewcontroller/)
- [swift4 Moya简单使用，请求接口解析json](https://blog.yiiu.co/2018/06/14/swift-moya/)
- [swift4 UITableView 下拉刷新上拉加载 MJRefresh 自定义用法](https://blog.yiiu.co/2018/06/20/swift-pullrefresh-loadmore/)
- [swift4 开发App，适配国际化，多语言支持](https://blog.yiiu.co/2018/06/20/swift-localizable/)
- [swift4 UITableView 多个部分(Section)用法，实现一个通讯录](https://blog.yiiu.co/2018/06/26/swift-tableview-multipart-section/)
- [swift4 扫描二维码（使用scanSwift实现）](https://blog.yiiu.co/2018/06/27/swift-scan-qrcode/)
- [swift4 侧滑功能（使用DrawerController实现）](https://blog.yiiu.co/2018/06/29/swift-drawercontroller/)
- [swift4 UITabBarController 简单使用](https://blog.yiiu.co/2018/06/29/swift-tabbarcontroller/)
- [swift4 WKWebView使用JS与Swift交互](https://blog.yiiu.co/2018/07/05/swift-webview-javascript/)
- [swift使用webview加载本地html，html里引入本地的css，js](https://blog.yiiu.co/2018/10/31/swift-webview-load-css-js/)
- [swift4 App切换主题的实现方法总结](https://blog.yiiu.co/2018/11/09/swift-theme/)

直接上图

![](/assets/swift-drawercontroller.gif)





## 安装

类库开源地址：https://github.com/sascha/DrawerController

可惜的是，它已经不维护了，很好用的一个侧滑实现

```sh
pod 'DrawerController'
```

## 新建侧滑视图

```swift
import UIKit

// 这个类就是一个 UIViewController 可以在里面写任何你想写的东西
class LeftViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "Left Menu"
        self.view.backgroundColor = .white
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}
```

## 修改 AppDelegate 类

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    let drawerController = DrawerController(centerViewController: UINavigationController(rootViewController: ViewController()), leftDrawerViewController: UINavigationController(rootViewController: LeftViewController()))

    // 侧滑打开宽度
    drawerController.maximumLeftDrawerWidth = 250
    // 打开侧滑手势
    drawerController.openDrawerGestureModeMask = .all
    // 关闭侧滑手势
    drawerController.closeDrawerGestureModeMask = .all

    self.window?.rootViewController = drawerController
    return true
}
```

## Navigation上添加按钮

icon可以在这里下载：https://material.io/tools/icons/?search=menu&icon=menu&style=baseline

修改 `ViewController`

```swift
import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "DrawerDemo"
        self.view.backgroundColor = .white

        // 给导航条添加一个按钮
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "baseline-menu-48px"), style: .plain, target: self, action: #selector(ViewController.openLeftMenu))

        self.navigationController?.navigationBar.barStyle = .default
        // menu icon默认是蓝色，下面将其改成黑色的
        self.navigationController?.navigationBar.tintColor = .black
    }

    @objc func openLeftMenu() {
        // 打开drawerController
        self.navigationController?.evo_drawerController?.toggleLeftDrawerSide(animated: true, completion: nil)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```
