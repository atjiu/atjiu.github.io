---
layout: post
title: Flutter TabLayout 和 DrawerLayout(侧滑) 布局用法
date: 2019-07-17 14:57:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

先上图

![](/assets/flutter-tablayout.gif)





## 顶部TabBar

使用 `flutter create xxxx` 创建一个项目

打开项目文件夹，在 `lib` 目录里创建三个 `dart` 文件，内容分别如下

First.dart

```dart
import "package:flutter/material.dart";

class First extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.green,
    );
  }

}
```

Second.dart

```dart
import "package:flutter/material.dart";

class Second extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.red,
    );
  }

}
```

Third.dart

```dart
import "package:flutter/material.dart";

class Third extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.yellow,
    );
  }

}
```

文链接原: [https://tomoya92.github.io/2019/07/17/flutter-tablayout-drawerlayout/](https://tomoya92.github.io/2019/07/17/flutter-tablayout-drawerlayout/)

修改 `main.dart` 文件内容，TabLayout布局是个有状态的组件，所以创建组件时要继承 `StatefulWidget` 类

动图中的 `TabBar` 是在 `Scaffold` 中的 `appBar` 中定义的，也就是说 tabbar 是 appBar的一部分

```dart
appBar: AppBar(
  title: Text(widget.title),
  bottom: TabBar(
    controller: tabController,
    tabs: <Tab>[
      new Tab(text: "问答"),
      new Tab(text: "分享"),
      new Tab(text: "博客"),
    ],
  ),
),
```

每个 tabbar 对应的视图是在 body 里定义的，按照顺序初始化好即可

```dart
// 引入 dart 文件
import 'First.dart' as first;
import 'Second.dart' as second;
import 'Third.dart' as third;

body: TabBarView(controller: tabController, children: <Widget>[
  new first.First(),
  new second.Second(),
  new third.Third(),
]),
```

完整代码：

```dart
import 'package:flutter/material.dart';

import 'First.dart' as first;
import 'Second.dart' as second;
import 'Third.dart' as third;

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
      home: MyHomePage(title: 'TabLayout Demo'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage>
    with SingleTickerProviderStateMixin {
  TabController tabController;

  @override
  void initState() {
    super.initState();

    tabController = new TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    super.dispose();
    tabController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        bottom: TabBar(
          controller: tabController,
          tabs: <Tab>[
            new Tab(text: "问答"),
            new Tab(text: "分享"),
            new Tab(text: "博客"),
          ],
        ),
      ),
      body: TabBarView(controller: tabController, children: <Widget>[
        new first.First(),
        new second.Second(),
        new third.Third(),
      ]),
    );
  }
}
```

链接文原: [https://tomoya92.github.io/2019/07/17/flutter-tablayout-drawerlayout/](https://tomoya92.github.io/2019/07/17/flutter-tablayout-drawerlayout/)

## 底部TabBar

上面定义的是顶部的tabbar，很多app的布局都是底部有见个tabbar，其实底部的定义方法就是将 `appBar` 属性中的 `bottom` 给注释掉，然后在跟 `appBar` 同级的位置定义一个 `bottomNavigationBar` 属性，其 `child` 就是 `TabBar` 组件，tabbar的视图跟上面定义方法是一样的，代码如下

```dart
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: Text(widget.title),
//        bottom: TabBar(
//          controller: tabController,
//          tabs: <Tab>[
//            new Tab(text: "问答"),
//            new Tab(text: "分享"),
//            new Tab(text: "博客"),
//          ],
//        ),
    ),
    bottomNavigationBar: new Material(
      color: Colors.blue,
      child: TabBar(
        controller: tabController,
        indicatorColor: Colors.white,
        tabs: <Tab>[
          new Tab(text: "问答"),
          new Tab(text: "分享"),
          new Tab(text: "博客"),
        ],
      ),
    ),
    body: TabBarView(controller: tabController, children: <Widget>[
      new first.First(),
      new second.Second(),
      new third.Third(),
    ]),
  );
}
```

这样的布局长下面这个样

![](/assets/flutter-tablayout1.gif)

## 侧滑布局

侧滑也是在 `Scaffold` 类中配置的，将 `bottomNavigationBar` 去掉，添加上 `drawer` 属性，这个属性配置的就是侧滑的界面，看下下面代码就明白了

```dart
import 'package:flutter/material.dart';

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

class MyHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Flutter Demo"),
        ),
        drawer: new Drawer(
          child: new ListView(
            padding: EdgeInsets.all(0),
            children: <Widget>[
              DrawerHeader(
                  decoration: BoxDecoration(gradient: LinearGradient(colors: <Color>[Colors.deepPurple, Colors.purple])),
                  child: Text("hello drawer!", style: TextStyle(color: Colors.white, fontSize: 18.0))
              ),
              ListTile(title: Text("分享")),
              ListTile(title: Text("问答")),
              ListTile(title: Text("博客")),
              ListTile(title: Text("招聘")),
            ],
          ),
        ),
        body: Center(
          child: Text("hello flutter"),
        ));
  }
}
```

这个布局长这个样

![](/assets/flutter-drawerlayout.gif)

## 参考

- [https://www.youtube.com/watch?v=3N27mjoBK2k](https://www.youtube.com/watch?v=3N27mjoBK2k)
- [https://www.youtube.com/watch?v=jDQQM1RfjNc](https://www.youtube.com/watch?v=jDQQM1RfjNc)
