---
layout: post
title: swift4 WKWebView使用JS与Swift交互
date: 2018-07-05 11:00:00
categories: swift学习笔记(纯代码)
tags: swift4 wkwebview javascript
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

## 创建wkwebview

```swift
import WebKit

lazy var webView: WKWebView = {
    let preferences = WKPreferences()
    preferences.javaScriptEnabled = true

    let configuration = WKWebViewConfiguration()
    configuration.preferences = preferences
    configuration.userContentController = WKUserContentController()
    // 给webview与swift交互起一个名字：AppModel，webview给swift发消息的时候会用到
    configuration.userContentController.add(self, name: "AppModel")

    var webView = WKWebView(frame: self.view.frame, configuration: configuration)
    // 让webview翻动有回弹效果
    webView.scrollView.bounces = true
    // 只允许webview上下滚动
    webView.scrollView.alwaysBounceVertical = true
    webView.navigationDelegate = self
    return webView
}()
```





## 创建HTML页面

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0,user-scalable=no"/>
    </head>
    <body>
        名字：<span id="name"></span>
        <br/>
        <button onclick="responseSwift()">响应Swift</button>
        <script type="text/javascript">
            function sayHello(name) {
                document.getElementById("name").innerHTML = name
                return "Swift你也好！"
            }

            function responseSwift() {
                window.webkit.messageHandlers.AppModel.postMessage("WebView点击，发送消息给Swift！")
            }
        </script>
    </body>
</html>

```

## ViewController实现两个协议

两个协议分别是：`WKNavigationDelegate` `WKScriptMessageHandler`

- `WKNavigationDelegate`：判断页面加载完成，只有在页面加载完成了，才能在swift中调webview中的js方法
- `WKScriptMessageHandler`: 在webview中给swift发消息时要用到协议中的一个方法来接收

## Swift调用WebView中的JS方法

```swift
func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    webView.evaluateJavaScript("sayHello('WebView你好！')") { (result, err) in
        print(result, err)
    }
}
```

## WebView中给Swift发消息

```swift
func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    print(message.body)
}
```

## 详细代码

```swift
import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {

    lazy var webView: WKWebView = {
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true

        let configuration = WKWebViewConfiguration()
        configuration.preferences = preferences
        configuration.userContentController = WKUserContentController()
        configuration.userContentController.add(self, name: "AppModel")

        var webView = WKWebView(frame: self.view.frame, configuration: configuration)
        webView.scrollView.bounces = true
        webView.scrollView.alwaysBounceVertical = true
        webView.navigationDelegate = self
        return webView
    }()

    let HTML = try! String(contentsOfFile: Bundle.main.path(forResource: "index", ofType: "html")!, encoding: String.Encoding.utf8)

    override func viewDidLoad() {
        self.navigationController?.navigationBar.isTranslucent = false

        super.viewDidLoad()
        title = "WebViewJS交互Demo"
        view.backgroundColor = .white
        view.addSubview(webView)

        webView.loadHTMLString(HTML, baseURL: nil)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("sayHello('WebView你好！')") { (result, err) in
            print(result, err)
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message.body)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```


