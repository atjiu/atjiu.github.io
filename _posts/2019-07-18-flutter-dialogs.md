---
layout: post
title: Flutter 弹层的用法 ModalBottomSheet、Toast、ConfirmDialog、InputDialog、AlertDialog
date: 2019-07-18 09:17:00
categories: flutter学习笔记
tags: flutter
author: 朋也
---

* content
{:toc}

先上图

![](/assets/flutter-modal-buttom-sheet-toast.gif)





## 按钮

先写几个按钮，通过点击来显示一些弹层

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Flutter Demo'),
    ),
    body: Builder(
      builder: (context) => Center(
          child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          RaisedButton(
              child: Text("Show Modal Buttom Sheet"),
              onPressed: () => _onButtonPressed(context)),
          RaisedButton(
            child: const Text('Show toast'),
            onPressed: () => _showToast(context, "我是一个toast"),
          ),
          RaisedButton(
            child: const Text('Show confirm'),
            onPressed: () => _showConfirm(context, "我是一个confirm"),
          ),
          RaisedButton(
            child: const Text('Show input dialog'),
            onPressed: () => _showInputDialog(context),
          ),
        ],
      )),
    ),
  );
}
```

## ModalBottomSheet

这个功能还是很常用的，比如一些详情页面的右上角都会有三个小点，点开之后可以选择一些分享，浏览器打开，复制等功能，下面在flutter里实现一下这个功能

这种弹层在flutter里是一个方法渲染出来的 `showModalBottomSheet()` 它里面有两个参数，`context` `builder` 弹出的层长啥样，就是在 builder 里定义的，跟写组件没什么区别

```dart
void _onButtonPressed(BuildContext _context) {
  showModalBottomSheet(
      context: _context,
      builder: (__context) {
        return Container(
          color: Color(0xff737373),
          height: 185,
          child: Container(
            margin: EdgeInsets.fromLTRB(8, 0, 8, 8),
            decoration: BoxDecoration(
                color: Theme.of(__context).canvasColor,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(10),
                  topRight: const Radius.circular(10),
                  bottomLeft: const Radius.circular(10),
                  bottomRight: const Radius.circular(10),
                )),
            child: Column(
              children: <Widget>[
                ListTile(
                    leading: Icon(Icons.share),
                    title: Text("分享"),
                    onTap: () => _modalItemPressed(_context, "分享")),
                Divider(height: 0),
                ListTile(
                    leading: Icon(Icons.favorite),
                    title: Text("收藏"),
                    onTap: () => _modalItemPressed(_context, "收藏")),
                Divider(height: 0),
                ListTile(
                    leading: Icon(Icons.open_in_browser),
                    title: Text("浏览器打开"),
                    onTap: () => _modalItemPressed(_context, "浏览器打开")),
              ],
            ),
          ),
        );
      });
}

void _modalItemPressed(BuildContext _context, String title) {
  Navigator.pop(_context);
  _showToast(_context, "你点击了：" + title);
}
```

再结合点击按钮事件，就可以实现动图中的效果了

## Toast

在Material标准中，Toast的实现就是 Snack Bar

它需要上面文 `context`, 所以要从上游传过来

> 注意，显示toast的这个上下文应该是父组件的 context, 当使用有状态的组件时，父类中也有一个 context, 不要用这个 context, 最好是从当前页面的父组件里传过来
>
> 这个地方我碰到了坑，就是因为乱用 context, 因为当页面点击按钮显示 Modal Bottom Sheet 的组件时，这个组件也有一个 builder 方法，这方法中也有一个 context, 当点击其中一项后，这个弹层就隐藏掉了，这时候如果用这个组件的context，程序就会报错，所以这个地方一定要注意

```dart
void _showToast(BuildContext _context, String text) {
  final scaffold = Scaffold.of(_context);
  scaffold.showSnackBar(
    SnackBar(
      content: Text(text),
      action: SnackBarAction(
          label: 'UNDO', onPressed: scaffold.hideCurrentSnackBar),
    ),
  );
}
```

链接文原: [https://tomoya92.github.io/2019/07/18/flutter-dialogs/](https://tomoya92.github.io/2019/07/18/flutter-dialogs/)

## Confirm Dialog

```dart
void _showConfirm(BuildContext _context, String text) {
  showDialog<void>(
    context: _context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('信息'),
        content: Text(text),
        actions: <Widget>[
          FlatButton(
            child: const Text('取消'),
            onPressed: () {
              Navigator.of(context).pop();
              _showToast(_context, "你点了取消");
            },
          ),
          FlatButton(
            child: const Text('确定'),
            onPressed: () {
              Navigator.of(context).pop();
              _showToast(_context, "你点了确定");
            },
          ),
        ],
      );
    },
  );
}
```

## Input Dialog

有了确认对话框，肯定少不了可以输入信息的对话框

```dart
void _showInputDialog(BuildContext _context) {
  String _name = "";
  showDialog<String>(
    context: _context,
    barrierDismissible: false,
    // dialog is dismissible with a tap on the barrier
    builder: (BuildContext __context) {
      return AlertDialog(
        title: Text('输入姓名'),
        content: new Row(
          children: <Widget>[
            new Expanded(
                child: new TextField(
              autofocus: true,
              decoration:
                  new InputDecoration(labelText: '姓名', hintText: '输入姓名'),
              onChanged: (value) { // 当input里值有变动的时候，就会触发这个方法
                _name = value;
              },
            ))
          ],
        ),
        actions: <Widget>[
          FlatButton(
            child: Text('取消'),
            onPressed: () {
              Navigator.of(context).pop();
              _showToast(_context, "你什么都没有写~");
            },
          ),
          FlatButton(
            child: Text('确定'),
            onPressed: () {
              if (_name == "") {
                _showToast(_context, "写点什么！");
              } else {
                Navigator.of(context).pop();
                _showToast(_context, "你输入的姓名为：$_name");
              }
            },
          ),
        ],
      );
    },
  );
}
```

## 完整代码

接链文原: [https://tomoya92.github.io/2019/07/18/flutter-dialogs/](https://tomoya92.github.io/2019/07/18/flutter-dialogs/)

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(primarySwatch: Colors.purple),
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => Home();
}

class Home extends State<HomePage> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Demo'),
      ),
      body: Builder(
        builder: (context) => Center(
            child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            RaisedButton(
                child: Text("Show Modal Buttom Sheet"),
                onPressed: () => _onButtonPressed(context)),
            RaisedButton(
              child: const Text('Show toast'),
              onPressed: () => _showToast(context, "我是一个toast"),
            ),
            RaisedButton(
              child: const Text('Show confirm'),
              onPressed: () => _showConfirm(context, "我是一个confirm"),
            ),
            RaisedButton(
              child: const Text('Show input dialog'),
              onPressed: () => _showInputDialog(context),
            ),
          ],
        )),
      ),
    );
  }

  void _onButtonPressed(BuildContext _context) {
    showModalBottomSheet(
        context: _context,
        builder: (__context) {
          return Container(
            color: Color(0xff737373),
            height: 185,
            child: Container(
              margin: EdgeInsets.fromLTRB(8, 0, 8, 8),
              decoration: BoxDecoration(
                  color: Theme.of(__context).canvasColor,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(10),
                    topRight: const Radius.circular(10),
                    bottomLeft: const Radius.circular(10),
                    bottomRight: const Radius.circular(10),
                  )),
              child: Column(
                children: <Widget>[
                  ListTile(
                      leading: Icon(Icons.share),
                      title: Text("分享"),
                      onTap: () => _modalItemPressed(_context, "分享")),
                  Divider(height: 0),
                  ListTile(
                      leading: Icon(Icons.favorite),
                      title: Text("收藏"),
                      onTap: () => _modalItemPressed(_context, "收藏")),
                  Divider(height: 0),
                  ListTile(
                      leading: Icon(Icons.open_in_browser),
                      title: Text("浏览器打开"),
                      onTap: () => _modalItemPressed(_context, "浏览器打开")),
                ],
              ),
            ),
          );
        });
  }

  void _modalItemPressed(BuildContext _context, String title) {
    Navigator.pop(_context);
    _showToast(_context, "你点击了：" + title);
  }

  void _showToast(BuildContext _context, String text) {
    final scaffold = Scaffold.of(_context);
    scaffold.showSnackBar(
      SnackBar(
        content: Text(text),
        action: SnackBarAction(
            label: 'UNDO', onPressed: scaffold.hideCurrentSnackBar),
      ),
    );
  }

  void _showConfirm(BuildContext _context, String text) {
    showDialog<void>(
      context: _context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('信息'),
          content: Text(text),
          actions: <Widget>[
            FlatButton(
              child: const Text('取消'),
              onPressed: () {
                Navigator.of(context).pop();
                _showToast(_context, "你点了取消");
              },
            ),
            FlatButton(
              child: const Text('确定'),
              onPressed: () {
                Navigator.of(context).pop();
                _showToast(_context, "你点了确定");
              },
            ),
          ],
        );
      },
    );
  }

  void _showInputDialog(BuildContext _context) {
    String _name = "";
    showDialog<String>(
      context: _context,
      barrierDismissible: false,
      // dialog is dismissible with a tap on the barrier
      builder: (BuildContext __context) {
        return AlertDialog(
          title: Text('输入姓名'),
          content: new Row(
            children: <Widget>[
              new Expanded(
                  child: new TextField(
                autofocus: true,
                decoration:
                    new InputDecoration(labelText: '姓名', hintText: '输入姓名'),
                onChanged: (value) {
                  _name = value;
                },
              ))
            ],
          ),
          actions: <Widget>[
            FlatButton(
              child: Text('取消'),
              onPressed: () {
                Navigator.of(context).pop();
                _showToast(_context, "你什么都没有写~");
              },
            ),
            FlatButton(
              child: Text('确定'),
              onPressed: () {
                if (_name == "") {
                  _showToast(_context, "写点什么！");
                } else {
                  Navigator.of(context).pop();
                  _showToast(_context, "你输入的姓名为：$_name");
                }
              },
            ),
          ],
        );
      },
    );
  }
}
```

## 参考

- [https://www.youtube.com/watch?v=_y40_iamKAc](https://www.youtube.com/watch?v=_y40_iamKAc)
- [https://stackoverflow.com/questions/45948168/how-to-create-toast-in-flutter](https://stackoverflow.com/questions/45948168/how-to-create-toast-in-flutter)
- [https://androidkt.com/flutter-alertdialog-example/](https://androidkt.com/flutter-alertdialog-example/)
