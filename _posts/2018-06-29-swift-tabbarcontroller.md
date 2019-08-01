---
layout: post
title: swift4 UITabBarController 简单使用
date: 2018-06-29 11:30:00
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

![](/assets/swift-tabbarcontroller.gif)




## 新建三个ViewController

HomeViewController.swift

```swift
import UIKit

class HomeViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = .blue
        self.tabBarController?.title = "主页"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```

OrderViewController.swift

```swift
import UIKit

class OrderViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = .red
        self.tabBarController?.title = "订单"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```

MyViewController.swift

```swift
import UIKit

class MyViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = .yellow
        self.tabBarController?.title = "我"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```

## 创建TabBar布局类

```swift
import UIKit

class LayoutViewController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        let homeNav = HomeViewController()
        let orderNav = OrderViewController()
        let myNav = MyViewController()

        homeNav.tabBarItem.title = "主页"
        orderNav.tabBarItem.title = "订单"
        myNav.tabBarItem.title = "我"

        homeNav.tabBarItem.image = UIImage(named: "home")
        orderNav.tabBarItem.image = UIImage(named: "order")
        myNav.tabBarItem.image = UIImage(named: "my")

        self.viewControllers = [homeNav, orderNav, myNav]

        // 文字图片颜色一块修改
        self.tabBar.tintColor = UIColor.blue
    }

    override func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        self.title = item.title
    }

}
```

## 修改AppDelegate类

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    self.window?.rootViewController = UINavigationController(rootViewController: LayoutViewController())

    return true
}
```

上面用到的图片可以在 https://material.io/tools/icons/?style=baseline 上下载
