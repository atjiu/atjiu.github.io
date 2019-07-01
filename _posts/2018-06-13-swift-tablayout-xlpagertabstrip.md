---
layout: post
title: swift4 给项目添加tablayout布局，XLPagerTabStrip用法
date: 2018-06-13 15:41:00
categories: swift学习笔记(纯代码)
tags: swift4
author: 朋也
---

* content
{:toc}

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

直接上图

![](/assets/swift-tablayout-xlpagertabstrip.gif)




## 安装

开源地址：[https://github.com/xmartlabs/XLPagerTabStrip](https://github.com/xmartlabs/XLPagerTabStrip)

使用 cocoapod 安装

```
pod 'XLPagerTabStrip'
```

因为项目中还用到了布局，加载网络图片，所以顺便把布局和加载图片的库也安装一下

```
pod 'SnapKit'
pod 'Kingfisher'
```

## 配置XLPagerTabStrip

引入库 `import XLPagerTabStrip`

在 `viewDidLoad` 方法里添加上默认的配置信息

**注意：一定要写在 `super.viewDidLoad()` 之前，这很重要**

```swift
self.settings.style.buttonBarItemFont = .systemFont(ofSize: 14)
self.settings.style.buttonBarItemTitleColor = UIColor(red:0.86, green:0.72, blue:0.44, alpha:1.0)
self.settings.style.buttonBarHeight = 40
self.settings.style.buttonBarBackgroundColor = UIColor.white
self.settings.style.buttonBarItemBackgroundColor = UIColor.white
self.settings.style.selectedBarHeight = 2

// 切换Tab时操作
changeCurrentIndexProgressive = { (oldCell: ButtonBarViewCell?, newCell: ButtonBarViewCell?, progressPercentage: CGFloat, changeCurrentIndex: Bool, animated: Bool) -> Void in
    guard changeCurrentIndex == true else { return }

    oldCell?.label.textColor = .black
    newCell?.label.textColor = .orange

    if animated {
        UIView.animate(withDuration: 0.1, animations: { () -> Void in
            newCell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
            oldCell?.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
        })
    }
    else {
        newCell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
        oldCell?.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
    }
}
```

上面的配置可以在开源项目的readme里找到解释，不过根据名字就能知道大概

让 `ViewController` 继承 `ButtonBarPagerTabStripViewController` 然后实现方法 `override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController]`

```swift
override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
  return [FirstViewController(), SecondViewController()]
}
```

再新建两个UIViewController就可以了，名字分别是 `FirstViewController` `SecondViewController` 然后运行即可

运行之后效果肯定不是上面图片上那样的，下面来改改效果

## 加入导航

找到 `AppDelegate` 类，在 application 方法里加上下面代码

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
  // Override point for customization after application launch.
  let rootVC = UINavigationController(rootViewController: ViewController())
  self.window?.rootViewController = rootVC
  return true
}
```

然后在 `ViewController` 里添加一个title, 给个背景色

```swift
override func viewDidLoad() {
  // settings.style.....

  super.viewDidLoad()
  self.title = "TabLayout Demo"
  self.view.backgroundColor = .white
  // 去掉 navigation 的磨砂半透明，这样tablayout不会被导航盖掉
  self.navigationController?.navigationBar.isTranslucent = false
}
```

## 源码

ViewController.swift

```swift
import UIKit
import XLPagerTabStrip

class ViewController: ButtonBarPagerTabStripViewController {

    override func viewDidLoad() {
        self.settings.style.buttonBarItemFont = .systemFont(ofSize: 14)
        self.settings.style.buttonBarItemTitleColor = UIColor(red:0.86, green:0.72, blue:0.44, alpha:1.0)
        self.settings.style.buttonBarHeight = 40
        self.settings.style.buttonBarBackgroundColor = UIColor.white
        self.settings.style.buttonBarItemBackgroundColor = UIColor.white
        self.settings.style.selectedBarHeight = 2

        changeCurrentIndexProgressive = { (oldCell: ButtonBarViewCell?, newCell: ButtonBarViewCell?, progressPercentage: CGFloat, changeCurrentIndex: Bool, animated: Bool) -> Void in
            guard changeCurrentIndex == true else { return }

            oldCell?.label.textColor = .black
            newCell?.label.textColor = .orange

            if animated {
                UIView.animate(withDuration: 0.1, animations: { () -> Void in
                    newCell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
                    oldCell?.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
                })
            }
            else {
                newCell?.transform = CGAffineTransform(scaleX: 1.0, y: 1.0)
                oldCell?.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
            }
        }

        super.viewDidLoad()
        self.title = "TabLayout Demo"
        self.view.backgroundColor = .white
        self.navigationController?.navigationBar.isTranslucent = false

    }

    override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
        return [FirstViewController(), SecondViewController()]
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```

FirstViewController.swift

```swift
import UIKit
import XLPagerTabStrip
import SnapKit

class FirstViewController: UIViewController, IndicatorInfoProvider, UITableViewDataSource, UITableViewDelegate {

    let data = ["Java", "Spring", "Swift", "MySQL", "MongoDB", "Redis"]
    var tableView: UITableView!

    override func viewDidLoad() {
        super.viewDidLoad()

        tableView = UITableView()
        self.view.addSubview(tableView)

        tableView.snp.makeConstraints { (make) in
            make.top.left.right.bottom.equalTo(0)
        }

        self.tableView.dataSource = self
        self.tableView.delegate = self
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")

    }

    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: "FirstVC")
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        cell.textLabel?.text = data[indexPath.row]
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

}
```

SecondViewController.swift

```swift
import UIKit
import XLPagerTabStrip
import SnapKit
import Kingfisher

class SecondViewController: UIViewController, IndicatorInfoProvider {

    let url = "https://www.2ddog.com/wp-content/uploads/2018/06/c68907c2431445211c2cdb28d512dd90.jpg"

    override func viewDidLoad() {
        super.viewDidLoad()

        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFill

        self.view.addSubview(imageView)

        imageView.snp.makeConstraints { (make) in
            make.left.right.top.equalTo(0)
            make.height.equalTo(200)
        }

        imageView.kf.indicatorType = .activity
        imageView.kf.setImage(with: URL(string: url))

    }

    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: "SecondVC")
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

}
```
