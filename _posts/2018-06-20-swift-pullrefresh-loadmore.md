---
layout: post
title: swift4 UITableView 下拉刷新上拉加载 MJRefresh 自定义用法
date: 2018-06-20 11:09:00
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

![](/assets/swift-refresh-loadmore.gif)

> 自定义部分代码来自项目 [https://github.com/Finb/V2ex-Swift](https://github.com/Finb/V2ex-Swift) 感谢 @Finb 大大开源的这么好的swift项目




## 安装 MJRefresh

```sh
pod 'MJRefresh'

pod install
```

## 使用内置的Header Footer

Demo代码来自 https://github.com/Lafree317/Swift-MJrefresh/blob/master/README.md

```swift
class ViewController: UIViewController,UITableViewDelegate,UITableViewDataSource {

    var tableView: UITableView!
    // 顶部刷新
    let header = MJRefreshNormalHeader()
    // 底部刷新
    let footer = MJRefreshAutoNormalFooter()

    var index = 0
    var data = [Int]()

    override func viewDidLoad() {
        super.viewDidLoad()

        tableView = UITableView(frame: self.view.frame)
        self.view.addSubView(tableView)

        // 下拉刷新
        header.setRefreshingTarget(self, refreshingAction: #selector(ViewController.headerRefresh))
        // 现在的版本要用mj_header
        self.tableview.mj_header = header

        // 上拉刷新
        footer.setRefreshingTarget(self, refreshingAction: #selector(ViewController.footerRefresh))
        self.tableview.mj_footer = footer

        self.tableView.mj_header.beginRefreshing()

    }

    @objc func headerRefresh() {
        self.data.removeAll()
        index = 0
        self.tableView.mj_footer.resetNoMoreData()
        for _ in 0..<20 {
            data.append(Int(arc4random()))
        }
        Thread.sleep(forTimeInterval: 1)
        self.tableView.reloadData()
        self.tableView.mj_header.endRefreshing()
    }

    @objc func footerRefresh() {
        for _ in 0..<10 {
            data.append(Int(arc4random()))
        }
        Thread.sleep(forTimeInterval: 1)
        self.tableView.reloadData()
        self.tableView.mj_footer.endRefreshing()
        index = index + 1
        if index > 2 {
            self.tableView.mj_footer.endRefreshingWithNoMoreData()
        }
    }

    // 行数
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count;
    }

    // cell
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "a")
        cell.textLabel!.text = String(data[indexPath.row])
        return cell
    }

    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 150;
    }
}
```

## 自定义使用

定义 RefreshView ，先下载一个小icon 下载地址 https://material.io/tools/icons/?search=arrow&icon=arrow_downward&style=baseline 将图片放入 Assets.xcassets

```swift
import UIKit
import MJRefresh

class RefreshView: MJRefreshHeader {

    // 转圈的菊花
    var loadingView: UIActivityIndicatorView?
    // 下拉的icon
    var arrowImage: UIImageView?

    // 处理不同刷新状态下的组件状态
    override var state: MJRefreshState {
        didSet {
            switch state {
            case .idle:
                self.loadingView?.isHidden = true
                self.arrowImage?.isHidden = false
                self.loadingView?.stopAnimating()
            case .pulling:
                self.loadingView?.isHidden = false
                self.arrowImage?.isHidden = true
                self.loadingView?.startAnimating()
            case .refreshing:
                self.loadingView?.isHidden = false
                self.arrowImage?.isHidden = true
                self.loadingView?.startAnimating()
            default:
                print("")
            }
        }
    }

    // 初始化组件
    override func prepare() {
        super.prepare()
        self.mj_h = 50

        self.loadingView = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        self.arrowImage = UIImageView(image: UIImage(named: "ic_arrow_downward"))
        self.addSubview(loadingView!)
        self.addSubview(arrowImage!)

    }

    // 组件定位
    override func placeSubviews() {
        super.placeSubviews()
        self.loadingView?.center = CGPoint(x: self.mj_w / 2, y: self.mj_h / 2)
        self.arrowImage?.frame = CGRect(x: 0, y: 0, width: 24, height: 24)
        self.arrowImage?.center = self.loadingView!.center
    }

}
```

LoadMoreView

```swift
import UIKit
import MJRefresh

class LoadMoreView: MJRefreshAutoFooter {

    var loadingView: UIActivityIndicatorView?
    var stateLabel: UILabel?

    override var state: MJRefreshState {
        didSet {
            switch state {
            case .idle:
                self.stateLabel?.text = nil
                self.loadingView?.isHidden = true
                self.loadingView?.stopAnimating()
            case .refreshing:
                self.stateLabel?.text = nil
                self.loadingView?.isHidden = false
                self.loadingView?.startAnimating()
            case .noMoreData:
                self.stateLabel?.text = "没有更多数据了"
                self.loadingView?.isHidden = true
                self.loadingView?.stopAnimating()
            default: break
            }
        }
    }

    override func prepare() {
        super.prepare()
        self.mj_h = 50

        self.loadingView = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        self.stateLabel = UILabel(frame: CGRect(x: 0, y: 0, width: 300, height: 40))
        self.stateLabel?.textAlignment = .center
        self.stateLabel?.font = UIFont.systemFont(ofSize: 12)

        self.addSubview(loadingView!)
        self.addSubview(stateLabel!)

    }

    override func placeSubviews() {
        super.placeSubviews()
        self.loadingView?.center = CGPoint(x: self.mj_w / 2, y: self.mj_h / 2)
        self.stateLabel?.center = CGPoint(x: self.mj_w / 2, y: self.mj_h / 2)
    }

}
```

## 使用自定义刷新组件

```swift
import UIKit
import MJRefresh

class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    var tableView: UITableView!

    var index = 0
    var data = [Int]()

    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "RefreshLoadDemo"
        self.view.backgroundColor = .white

        tableView = UITableView(frame: self.view.frame)
        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        self.view.addSubview(tableView)
        self.tableView.mj_header = RefreshView(refreshingBlock: {
            [weak self] () -> Void in
            self?.headerRefresh()
        })
        self.tableView.mj_footer = LoadMoreView(refreshingBlock: {
            [weak self] () -> Void in
            self?.footerRefresh()
        })

        // 默认刷新一下数据
        self.tableView.mj_header.beginRefreshing()
    }

    @objc func headerRefresh() {
        self.data.removeAll()
        index = 0
        self.tableView.mj_footer.resetNoMoreData()
        for _ in 0..<20 {
            data.append(Int(arc4random()))
        }
        Thread.sleep(forTimeInterval: 1)
        self.tableView.reloadData()
        self.tableView.mj_header.endRefreshing()
    }

    @objc func footerRefresh() {
        for _ in 0..<10 {
            data.append(Int(arc4random()))
        }
        Thread.sleep(forTimeInterval: 1)
        self.tableView.reloadData()
        self.tableView.mj_footer.endRefreshing()
        index = index + 1
        if index > 2 {
            self.tableView.mj_footer.endRefreshingWithNoMoreData()
        }
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        cell.textLabel?.text = String(data[indexPath.row])
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```
