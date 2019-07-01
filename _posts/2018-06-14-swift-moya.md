---
layout: post
title: swift4 Moya简单使用，请求接口解析json
date: 2018-06-14 22:43:00
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

![](/assets/QQ20180614-224012.png)




## 安装

```swift
pod 'Moya'
```

## 创建TargetType

先创建一个枚举，把项目里要用到的接口方法定义一下

```swift
enum CNodeService {
    case topics(page: Int)
    case topicDetail(id: String)
}
```

对`CNodeService`进行拓展，拓展要实现`TargetType`协议

```swift
extension CNodeService: TargetType {
    var baseURL: URL {
        return URL(string: "https://cnodejs.org/api/v1")!
    }

    // 定义接口请求路径
    var path: String {
        switch self {
        case .topics:
            return "/topics"
        case .topicDetail(let id):
            return "/topic/\(id)"
        }
    }

    // 接口请求类型，如果接口有post请求，也可以用 swift case 的方式来定义
    var method: Moya.Method {
        return .get
    }

    // 接口测试数据，可以不用设置
    var sampleData: Data {
        return Data()
    }

    // 创建任务，定义请求方式，参数，参数编码方式
    var task: Task {
        switch self {
        case .topics(let page):
            return .requestParameters(parameters: ["page": page], encoding: URLEncoding.default)
        case .topicDetail(let id):
            return .requestParameters(parameters: ["id": id], encoding: URLEncoding.default)
        }
    }

    // 定义请求头，可以加上数据类型，cookie等信息
    var headers: [String : String]? {
        return ["Content-Type": "application/json"]
    }

}
```

## 在viewcontroller里调用

定义一个结构来接收返回的数据，结构必须要实现 Decodable 协议，接口里的数据不用全都定义，定义了什么字段它就解析什么字段，按需定义即可

```swift
struct TopicsModel: Decodable {

    var success: Bool
    var data: [TopicModel]

}

struct TopicModel: Decodable {
    var id: String
    var title: String
    var author_id: String
    var tab: String
    var content: String
    var last_reply_at: String
    var good: Bool
    var top: Bool
    var reply_count: Int
    var visit_count: Int
    var create_at: String
    var author: Author
}

struct Author: Decodable {
    var loginname: String
    var avatar_url: String
}
```

先在里定义一个tableView，下面直接上调用代码

```swift
let provider = MoyaProvider<CNodeService>()

func fetch() {
    provider.request(.topics(page: 1)) { (result) in
        switch result {
        case .success(let response):
        	// 解析json，TopicsModel 要实现 Decodable 协议
            let _data = try! JSONDecoder().decode(TopicsModel.self, from: response.data)
            self.topics = _data.data
            self.tableView.reloadData()
        case .failure(let error):
            print(error)
        }
    }
}
```

运行项目即可看到截图效果

## 注意

Task里定义请求方式的时候 `requestParameters` 方法有个 `encoding` 参数，这个参数我最开始给设置成 `JSONEncoding.default` 结果调用 .topic() 方法的时候死活没有响应，等待大约30s左右，有个请求超时的异常

原因是 /topics?page=1 这样的参数是需要用 `URLEncoding.default` 来编码的

如果服务端接收的参数是json参数的话，就要设置成 `JSONEncoding.default` 来编码

