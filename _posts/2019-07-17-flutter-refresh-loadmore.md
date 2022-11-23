---
layout: post
title: Flutter ListView 上拉加载更多，下拉刷新功能实现
date: 2019-07-17 08:57:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

先上图

![](/assets/flutter-listview-refresh-loadmore.gif)





## 下拉刷新

跟原生开发一样，下拉刷新在flutter里提供的有组件实现 `RefreshIndicator`

> 一直不明白为啥组件中都提供下拉刷新，但就是没有上拉加载！！

**我这请求接口数据用的是 `http` 库，是个第三方的是需要安装的 [https://pub.dev/packages/http](https://pub.dev/packages/http)**

用法如下

```dart
import 'package:flutter/scheduler.dart';

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key}) : super(key: key);

  @override
  MyHomeWidget2 createState() => MyHomeWidget2();
}

class MyHomeWidget2 extends State<MyHomePage> {
  int page = 1;
  List data = new List();
  var baseUrl = "https://cnodejs.org/api/v1";
  GlobalKey<RefreshIndicatorState> _refreshIndicatorKey;

  @override
  void initState() {
    super.initState();

    _refreshIndicatorKey = new GlobalKey<RefreshIndicatorState>();
    // 进入页面立即显示刷新动画
    SchedulerBinding.instance.addPostFrameCallback((_){  _refreshIndicatorKey.currentState?.show(); } );

    this._onRefresh();
  }

  _fetchData() async {
    var response = await http.get(
        '${this.baseUrl}/topics?mdrender=false&limit=10&page=${this.page}');
    var json = await convert.jsonDecode(response.body);
    return json['data'];
  }

  Future<dynamic> _onRefresh() {
    data.clear();
    this.page = 1;
    return _fetchData().then((data) {
      setState(() => this.data.addAll(data));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator( // 在ListView外包一层 RefreshIndicator 组件
        onRefresh: _onRefresh, // 添加onRefresh方法
        child: ListView.separated(
          itemCount: this.data.length,
          itemBuilder: (context, index) {
            var _data = this.data[index];
            return ListTile(
                leading: Image.network(_data["author"]["avatar_url"]),
                title: Text(_data["title"]),
                subtitle: Text(_data["author"]["loginname"] +
                    " created at " +
                    new DateTime.now().toString()),  // 为了看每次数据变动，这里直接取当前时间
                trailing: Icon(Icons.chevron_right));
          },
          separatorBuilder: (context, index) {
            return Divider();
          },
        )
    ));
  }
}
```

链接文原: [https://atjiu.github.io/2019/07/17/flutter-refresh-loadmore/](https://atjiu.github.io/2019/07/17/flutter-refresh-loadmore/)

## 上拉加载

上拉加载原理还是一样的，给ListView加一个`ScrollController`组件，然后通过事件监听滚动条的高度来显示和隐藏加载更多的组件

先将加载更多的组件写好

```dart
Widget _loadMoreWidget() {
  return new Padding(
    padding: const EdgeInsets.all(15.0), // 外边距
    child: new Center(
      child: new CircularProgressIndicator()
    ),
  );
}
```

初始化一个 `ScrollController` 组件，将其设置给 ListView 组件的`controller`属性上

```dart
ScrollController _scrollController = new ScrollController();

child: ListView.separated(
  controller: _scrollController,
  //...
)
```

然后通过重写 `dispost()` 方法来处理加载更多组件的释放

```dart
@override
void dispose() {
  _scrollController.dispose();
  super.dispose();
}
```

最后通过数据源来控制界面渲染哪个组件，当数据源循环渲染的 `index` 跟数据源一样长时（其实少1，下标从0开始的）就渲染加载更多组件，让其显示出来，同时调用加载更多方法，获取数据，再通过state实现组件ui的更新

完整代码如下

```dart
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key}) : super(key: key);

  @override
  MyHomeWidget2 createState() => MyHomeWidget2();
}

class MyHomeWidget2 extends State<MyHomePage> {
  int page = 1;
  List data = new List();
  var baseUrl = "https://cnodejs.org/api/v1";

  GlobalKey<RefreshIndicatorState> _refreshIndicatorKey;
  ScrollController _scrollController;

  @override
  void initState() {
    super.initState();

    _scrollController = new ScrollController();
    _refreshIndicatorKey = new GlobalKey<RefreshIndicatorState>();
    // 进入页面立即显示刷新动画
    SchedulerBinding.instance.addPostFrameCallback((_){  _refreshIndicatorKey.currentState?.show(); } );

    this._onRefresh();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
        _onLoadmore();
      }
    });
  }

  _fetchData() async {
    var response = await http.get(
        '${this.baseUrl}/topics?mdrender=false&limit=10&page=${this.page}');
    var json = await convert.jsonDecode(response.body);
    return json['data'];
  }

  Future<dynamic> _onRefresh() {
    data.clear();
    this.page = 1;
    return _fetchData().then((data) {
      setState(() => this.data.addAll(data));
    });
  }

  Future<dynamic> _onLoadmore() {
    this.page++;
    return _fetchData().then((data) {
      setState((){
        this.data.addAll(data);
      });
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Widget _loadMoreWidget() {
    return new Padding(
      padding: const EdgeInsets.all(15.0),
      child: new Center(
        child: new CircularProgressIndicator()
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: ListView.separated(
          controller: _scrollController,
          itemCount: this.data.length,
          itemBuilder: (context, index) {
            if (index == data.length - 1) {
              return _loadMoreWidget();
            } else {
              var _data = this.data[index];
              return ListTile(
                  leading: Image.network(_data["author"]["avatar_url"]),
                  title: Text(_data["title"]),
                  subtitle: Text(_data["author"]["loginname"] +
                      " created at " +
                      new DateTime.now().toString()),
                  trailing: Icon(Icons.chevron_right));
            }
          },
          separatorBuilder: (context, index) {
            return Divider();
          },
        )
    ));
  }
}
```

## 参考

- [https://pub.dev/packages/http](https://pub.dev/packages/http)
- [https://www.youtube.com/watch?v=umIztKrk-AY](https://www.youtube.com/watch?v=umIztKrk-AY)
- [https://stackoverflow.com/questions/44031454/how-to-show-refreshindicator-intially-while-waiting-data-from-backend-api](https://stackoverflow.com/questions/44031454/how-to-show-refreshindicator-intially-while-waiting-data-from-backend-api)
