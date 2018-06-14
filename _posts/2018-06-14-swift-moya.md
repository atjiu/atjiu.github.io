---
layout: post
title: swift4 Moya简单使用，请求接口解析json
date: 2018-06-14 22:43:00
categories: swift学习笔记(纯代码)
tags: swift4 Moya
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/QQ20180614-224012.png)




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

