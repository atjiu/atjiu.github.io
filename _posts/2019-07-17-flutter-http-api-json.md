---
layout: post
title: Flutter 使用第三方http库请求接口并将返回的json转成实体类（bean）
date: 2019-07-17 16:46:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

> 这篇博客的接口来自 `https://cnodejs.org/api`

安装第三方http库 [https://pub.dev/packages/http](https://pub.dev/packages/http)

打开项目中的 `pubspec.yaml` 文件，在 `dependencies` 下添加http的依赖

```yaml
dependencies:
  http: ^0.12.0+2
```

然后运行 `flutter pub get` 安装到本地





## 请求接口

`http` 库用法比dart中自带的 `httpClient` 要好用的多

```dart
fetchData() async {
  // 请求接口
  var response = await http.get("https://cnodejs.org/api/v1/topics");
  // 将接口返回数据转成json
  var json = await jsonDecode(response.body);
  // 更新state，通知ui更新
  setState(() {
    this.data = json['data'];
  });
}
```

渲染页面时取值方法, 直接使用 `[]` 来获取json内的属性值

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
      appBar: AppBar(title: Text("Flutter Demo")),
      body: new ListView.separated(
          itemCount: data.length,
          itemBuilder: (context, index) {
            return ListTile(
              leading: CircleAvatar(backgroundImage: NetworkImage(data[index]['author']['avatar_url'])),
              title: Text(data[index]['title'])
            );
          },
          separatorBuilder: (context, index) {
            return Divider(
              height: 0,
            );
          }));
}
```

可以看到取值还是根据json对象里的属性值名字来的，这要是服务端的json中属性变了，那app中用到的地方就全都要改一下，但如果能在app中封装成实体类，这样的话，如果有修改就只需要修改bean就够了，要方便的多，而且取值的时候也可以通过 `.` 来自动提示

## json转bean

json的结构长这个样

```json
{
  "success":true,
  "data":[
    {
      "id":"5cbfd9aca86ae80ce64b3175",
      "author_id":"4f447c2f0a8abae26e01b27d",
      "tab":"share",
      "content":"这是帖子内容",
      "title":"Node 12 值得关注的新特性",
      "last_reply_at":"2019-07-12T04:34:56.342Z",
      "good":false,
      "top":true,
      "reply_count":53,
      "visit_count":61610,
      "create_at":"2019-04-24T03:36:12.582Z",
      "author":{
        "loginname":"atian25",
        "avatar_url":"https://avatars2.githubusercontent.com/u/227713?v=4&s=120"
      }
    },
    {
      "id":"5bd4772a14e994202cd5bdb7",
      "author_id":"504c28a2e2b845157708cb61",
      "tab":"share",
      "content":"帖子内容",
      "title":"服务器迁移至 aws 日本机房",
      "last_reply_at":"2019-07-12T02:24:33.508Z",
      "good":false,
      "top":true,
      "reply_count":200,
      "visit_count":80201,
      "create_at":"2018-10-27T14:33:14.694Z",
      "author":{
        "loginname":"alsotang",
        "avatar_url":"https://avatars1.githubusercontent.com/u/1147375?v=4&s=120"
      }
    }
  ]
}
```

官网给出了处理json的方法，其实就是自己定义一个类，然后写一个 `fromJson()` 方法，最后从json中一个字段一个字段的赋值给实体类，如下代码

```dart
class User {
  final String name;
  final String email;

  User(this.name, this.email);

  User.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        email = json['email'];

  Map<String, dynamic> toJson() =>
    {
      'name': name,
      'email': email,
    };
}
```

链接文原: [https://tomoya92.github.io/2019/07/17/flutter-http-api-json/](https://tomoya92.github.io/2019/07/17/flutter-http-api-json/)

好在ide有插件，vscode，android studio都有相应的插件，我这用的是 android studio 的插件生成的，插件名是 `FlutterJsonBeanFactory`

如果你想将一段json转成bean，先将json复制一下，然后新建文件，选择 `dart bean class file from JSON` 如下图

![](/assets/QQ20190717-170304@2x.png)

然后将json贴进去，填好 `Class Name` 然后将最下面的 `RefreshBeanFactory` 勾掉，点击`Make`即可生成结构对应的实体类文件了

我这把实体类名字改了一下，现在长下面这个样

```dart
class Result {
  List<Topic> data;
  bool success;

  Result({this.data, this.success});

  Result.fromJson(Map<String, dynamic> json) {
    if (json['data'] != null) {
      data = new List<Topic>();
      (json['data'] as List).forEach((v) {
        data.add(new Topic.fromJson(v));
      });
    }
    success = json['success'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.data != null) {
      data['data'] = this.data.map((v) => v.toJson()).toList();
    }
    data['success'] = this.success;
    return data;
  }
}

class Topic {
  String lastReplyAt;
  int visitCount;
  String tab;
  bool top;
  Author author;
  String id;
  String authorId;
  String title;
  int replyCount;
  String createAt;
  bool good;
  String content;

  Topic(
      {this.lastReplyAt,
      this.visitCount,
      this.tab,
      this.top,
      this.author,
      this.id,
      this.authorId,
      this.title,
      this.replyCount,
      this.createAt,
      this.good,
      this.content});

  Topic.fromJson(Map<String, dynamic> json) {
    lastReplyAt = json['last_reply_at'];
    visitCount = json['visit_count'];
    tab = json['tab'];
    top = json['top'];
    author =
        json['author'] != null ? new Author.fromJson(json['author']) : null;
    id = json['id'];
    authorId = json['author_id'];
    title = json['title'];
    replyCount = json['reply_count'];
    createAt = json['create_at'];
    good = json['good'];
    content = json['content'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['last_reply_at'] = this.lastReplyAt;
    data['visit_count'] = this.visitCount;
    data['tab'] = this.tab;
    data['top'] = this.top;
    if (this.author != null) {
      data['author'] = this.author.toJson();
    }
    data['id'] = this.id;
    data['author_id'] = this.authorId;
    data['title'] = this.title;
    data['reply_count'] = this.replyCount;
    data['create_at'] = this.createAt;
    data['good'] = this.good;
    data['content'] = this.content;
    return data;
  }
}

class Author {
  String avatarUrl;
  String loginname;

  Author({this.avatarUrl, this.loginname});

  Author.fromJson(Map<String, dynamic> json) {
    avatarUrl = json['avatar_url'];
    loginname = json['loginname'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['avatar_url'] = this.avatarUrl;
    data['loginname'] = this.loginname;
    return data;
  }
}
```

有了这个，就可以直接在渲染ui取值的时候通过 `.` 提示了，于是代码也就变成了这样

```dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'Result.dart' as result;

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.purple,
      ),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => MyHomePageState();
}

class MyHomePageState extends State<MyHomePage> {
  List<result.Topic> data = new List();

  @override
  void initState() {
    super.initState();

    fetchData();
  }

  fetchData() async {
    var response = await http.get("https://cnodejs.org/api/v1/topics");
    var json = await jsonDecode(response.body);

    setState(() {
      this.data = result.Result.fromJson(json).data;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text("Flutter Demo")),
        body: new ListView.separated(
            itemCount: data.length,
            itemBuilder: (context, index) {
              return ListTile(
                leading: CircleAvatar(backgroundImage: NetworkImage(data[index].author.avatarUrl)),
                title: Text(data[index].title)
              );
            },
            separatorBuilder: (context, index) {
              return Divider(
                height: 0,
              );
            }));
  }
}
```

## 参考

- [https://flutter.dev/docs/development/data-and-backend/json](https://flutter.dev/docs/development/data-and-backend/json)
