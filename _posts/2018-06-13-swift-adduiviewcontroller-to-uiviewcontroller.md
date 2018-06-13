---
layout: post
title: swift4 往视图控制器里添加视图控制器（往UIViewController里添加UIViewController）
date: 2018-06-13 16:00:00
categories: swift学习笔记(纯代码)
tags: swift4 uiviewcontroller
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/swift-tablayout-xlpagertabstrip2.gif)




> 接着上一篇博客代码开发的，地址：[https://tomoya92.github.io/2018/06/13/swift-tablayout-xlpagertabstrip/](https://tomoya92.github.io/2018/06/13/swift-tablayout-xlpagertabstrip/)

将 `ViewController` 里的 TabLayout 相关代码抽出来

新建一个类 `TabLayoutViewController.swift`

```swift
import UIKit
import XLPagerTabStrip

class TabLayoutViewController: ButtonBarPagerTabStripViewController {

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
    }
    
    override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
        return [FirstViewController(), SecondViewController()]
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
}
```

在 `ViewController` 里添加一个 `UIImageView` 和初始化 `TabLayoutViewController`，然后将图片视图添加到ViewController的子视图里

TabLayoutViewController是一个控制器，它的添加方法有些特殊，先用 `self.addChildViewController()` 方法将控制器添加到当前控制器里，然后再用 `self.view.addSubView()` 方法把控制器的视图添加到当前控制器的子视图里，代码如下

```swift
import UIKit
import XLPagerTabStrip
import SnapKit
import Kingfisher

class ViewController: UIViewController {
    
    let url = "https://www.2ddog.com/wp-content/uploads/2018/04/cfcd208495d565ef66e7dff9f98764da.jpg"

    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "TabLayout Demo"
        self.view.backgroundColor = .white
        self.navigationController?.navigationBar.isTranslucent = false
        
        let image = UIImageView()
        image.contentMode = .scaleAspectFill
        self.view.addSubview(image)
        
        let tabLayout = TabLayoutViewController()
        //将控制器加入到当前控制器里
        self.addChildViewController(tabLayout)
        //将控制器的视图加入到当前控制器的子视图中
        self.view.addSubview(tabLayout.view)
        
        // 添加布局
        image.snp.makeConstraints { (make) in
            make.top.left.right.equalTo(0)
            make.height.equalTo(200)
        }
        
        tabLayout.view.snp.makeConstraints { (make) in
            make.top.equalTo(image.snp.bottom)
            make.left.right.bottom.equalTo(0)
        }
        
        // 加载网络图片
        image.kf.indicatorType = .activity
        image.kf.setImage(with: URL(string: url))
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```

运行起来就是上面图片中的效果了，快试试吧
