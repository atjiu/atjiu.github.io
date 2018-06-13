---
layout: post
title: swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView） 
date: 2018-06-11 09:19:00
categories: swift学习笔记(纯代码)
tags: swift4 uitableview uiactivityindicatorview
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/swift-uitableview-uiactivityindicatorview.gif)




用法很简单，直接上代码

```swift
let refreshView = UIActivityIndicatorView.init(activityIndicatorStyle: .whiteLarge)

// 设置上颜色，不给颜色它不显示
refreshView.color = UIColor.gray
// 将其设置成tableview的背景view
tableView.backgroundView = refreshView
// 启动时加载
refreshView.startAnimating()

// 关闭动画
refreshView.stopAnimating()
```

tableView 默认是有分割线的，在加载之前可以把分割线去掉，当数据请求完成并处理好了，tableView.reloadData()之前再把这个分割线加上，就好看多了，具体看下面代码

```swift
tableView.separatorStyle = .none
refreshView.startAnimating()
```

```swift
self.tableView.reloadData()
self.refreshView.stopAnimating()
```
