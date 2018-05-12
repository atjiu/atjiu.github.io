---
layout: post
title: react-native ListView组件点击跳转
categories: react-native学习笔记
tags: react-native ListView
date: 2017-08-02 10:09:30
author: 朋也
---

* content
{:toc}

[上一篇](https://tomoya92.github.io/2017/08/02/react-native-navigatorios-listview/) 实现了NavigatorIOS与ListView结合使用的方法

这篇文章介绍一下ListView里点击跳转到新视图的方法

先看效果

![20180802095850](https://tomoya92.github.io/assets/20180802095850.gif)





## 用法

NewsList.js

```javascript
_onPress(rowData) {
  this.props.navigator.push({
    title: rowData,
    component: CNodeJSList,
    passProps: {
      name: rowData,
    }
  })
}
```

**说明**

- 使用 `this.props.navigator.push()` 指定`component` 就可以跳转到下一个视图里了，如果想传值，可以用 `passProps` 属性，在下一个视图里使用 `this.props.name` 接收就可以了
- 对于onPress里方法的调用，如果是以`onPress={this._onPress}`调用 `_onPress`方法，页面是不跳转的，需要绑定this，写法是：`onPress={this._onPress.bind(this)}` 但这样好像没法传值，所以要传值需要这样写：`onPress={()=>{this._onPress(rowData)}}` ，这样就没问题了，页面也可以跳转成功了

## 参考

- [ListView列表点击跳转](http://bbs.reactnative.cn/topic/2964/listview%E5%88%97%E8%A1%A8%E7%82%B9%E5%87%BB%E8%B7%B3%E8%BD%AC/3)

源码：[https://github.com/tomoya92/ITNews-React-Native](https://github.com/tomoya92/ITNews-React-Native)
