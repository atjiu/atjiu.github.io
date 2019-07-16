---
layout: post
title: Flutter ListView 用法，图文列表的实现，加载静态数据，请求接口渲染动态数据
date: 2019-07-16 15:46:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

先上图

![](/assets/SimulatorScreenShot-iPhone7-2019-07-16at15.47.54.png)





## 静态数据

首先创建项目，不多说

图文列表在 Flutter 里有个组件专门渲染图文列表的 `ListTile` 代码如下

```dart
import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: Scaffold(
            appBar: AppBar(title: Text('Flutter Demo')), body: MyHomeWidget()));
  }
}

class MyHomeWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: <Widget>[
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题1'),
            subtitle: Text('我是副标题1'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题2'),
            subtitle: Text('我是副标题2'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题3'),
            subtitle: Text('我是副标题3'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题4'),
            subtitle: Text('我是副标题4'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题5'),
            subtitle: Text('我是副标题5'),
            trailing: Icon(Icons.chevron_right)),
      ],
    );
  }
}
```

渲染出来长下面这个样

![](/assets/flutter-listview-00.png)

可以看到它没有分割线，那怎么加上分割线呢？

## 添加分割线

使用 `ListTile.divideTiles()` 方法即可，如下

```dart
class MyHomeWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: ListTile.divideTiles(context: context, tiles: [
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题1'),
            subtitle: Text('我是副标题1'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题2'),
            subtitle: Text('我是副标题2'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题3'),
            subtitle: Text('我是副标题3'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题4'),
            subtitle: Text('我是副标题4'),
            trailing: Icon(Icons.chevron_right)),
        ListTile(
            leading: Image.network(
                "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"),
            title: Text('我是标题5'),
            subtitle: Text('我是副标题5'),
            trailing: Icon(Icons.chevron_right)),
      ]).toList(),
    );
  }
}
```

接文原链: [https://tomoya92.github.io/2019/07/16/flutter-listview/](https://tomoya92.github.io/2019/07/16/flutter-listview/)

---

另一种添加分割线的方法，使用 `ListView.separated()` 方法，用法如下

```dart
class MyHomeWidget extends StatelessWidget {
  List data = new List();
  MyHomeWidget() {
    for (var i = 0; i < 5; i++) {
      data.add({
        "title": "我是标题$i",
        "subTitle": "我是副标题$i",
        "imgUrl": "https://avatars3.githubusercontent.com/u/6915570?s=460&v=4"
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      itemCount: this.data.length,
      itemBuilder: (context, index) {
        var _data = this.data[index];
        return ListTile(
            leading: Image.network(_data["imgUrl"]),
            title: Text(_data["title"]),
            subtitle: Text(_data["subTitle"]),
            trailing: Icon(Icons.chevron_right));
      },
      separatorBuilder: (context, index) {
        return Divider();
      },
    );
  }
}
```

效果图

![](/assets/flutter-listview-01.png)

## 动态数据

上面第二种方法其实就算是一种动态数据了，不过开发app时列表中的数据一般都是通过请求接口来获取的

当涉及到请求接口，就是耗时操作，app的ui会事先渲染一个没有数据的界面，当接口请求的数据返回时，再通知 `ListView` 重新渲染，这时就要用到`**有状态**的组件`了

往上翻一下，可以看到，前面写的组件都是 **无状态** 的，也就是继承的组件都是 `StatelessWidget`

如何使用有状态的组件呢？其实使用 `flutter create xxx`初始化的项目里的那个计数器就是个有状态的组件，因为它涉及到了动态的数据了，既然默认初始化的组件就是有状态的组件，那直接拷贝过来用即可

```dart
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key}) : super(key: key);

  @override
  MyHomeWidget createState() => MyHomeWidget();
}

class MyHomeWidget extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return null;
  }
}
```

可以看到自定义的类 `MyHomePage` 继承的是 `StatefulWidget`这个类，这个类里是个抽象类，里面有个抽象方法 `createState()` 要实现，写法很固定

下面又定义了一个类通过继承 `State` 类来实现业务逻辑，当语法接口的数据返回了，再调用父类的 `setState()` 方法，将数据源更新，组件就会自动的渲染了

> 这个 `setState()` 方法，如果会用 react.js 这样的前端框架，就很容易明白了，如果不明白，就把它当成 android 里的 `listview.notifyDataSetChanged()` 方法就可以了
>
> 这篇博客重点是记录 `ListView` 的用法，网络请求就不多说了，后面再介绍

我这用的接口是 [https://cnodejs.org](https://cnodejs.org) 的接口，因为要请求接口，并要将数据转成json, 这里要引入两个依赖，具体代码如下

```dart
import 'dart:io';
import 'dart:convert';
```

```dart
class MyHomeWidget extends State<MyHomePage> {
  List data = new List();
  var baseUrl = "https://cnodejs.org/api/v1";
  MyHomeWidget() {
    HttpClient client = new HttpClient();
    client
        .getUrl(Uri.parse("${this.baseUrl}/topics?mdrender=false"))
        .then((HttpClientRequest request) {
      // Optionally set up headers...
      // Optionally write to the request object...
      // Then call close.
      return request.close();
    }).then((HttpClientResponse response) async {
      // Process the response.
      // 通过 utf8 转码，jsonDecode 将数据转成json格式
      var json = await response.transform(utf8.decoder).join();
      setState(() {
        data.addAll(jsonDecode(json)["data"]);
      });
    }).catchError((onError) {
      print(onError.toString());
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      itemCount: this.data.length,
      itemBuilder: (context, index) {
        var _data = this.data[index];
        return ListTile(
            leading: Image.network(_data["author"]["avatar_url"]),
            title: Text(_data["title"]),
            subtitle: Text(_data["author"]["loginname"] +
                " created at " +
                _data["create_at"]),
            trailing: Icon(Icons.chevron_right));
      },
      separatorBuilder: (context, index) {
        return Divider();
      },
    );
  }
}
```

## 参考

- [https://stackoverflow.com/questions/52207612/how-to-use-dividetiles-in-flutter](https://stackoverflow.com/questions/52207612/how-to-use-dividetiles-in-flutter)
- [https://cnodejs.org/api](https://cnodejs.org/api)
- [https://api.flutter.dev/flutter/dart-io/HttpClient-class.html](https://api.flutter.dev/flutter/dart-io/HttpClient-class.html)
