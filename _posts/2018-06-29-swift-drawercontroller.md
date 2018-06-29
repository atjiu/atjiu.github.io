---
layout: post
title: swift4 侧滑功能（使用DrawerController实现）
date: 2018-06-29 10:47:00
categories: swift学习笔记(纯代码)
tags: swift4 drawercontroller
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/swift-drawercontroller.gif)





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
