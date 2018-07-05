---
layout: post
title: swift4 UITabBarController 简单使用
date: 2018-06-29 11:30:00
categories: swift学习笔记(纯代码)
tags: swift4 tarbarcontroller
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/swift-tabbarcontroller.gif)




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
