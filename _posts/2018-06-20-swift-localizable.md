---
layout: post
title: swift4 开发App，适配国际化，多语言支持
date: 2018-06-20 14:37:00
categories: swift学习笔记(纯代码)
tags: swift4 localizable
author: 朋也
---

* content
{:toc}

#### 在项目里新建一个

Localizable.strings 文件

![](https://tomoya92.github.io/assets/QQ20180620-144009@2x.png)




#### 选中新建的文件，在xcode右边工具栏，点击一下 `Localize...` 按钮

![](https://tomoya92.github.io/assets/QQ20180620-144150@2x.png)

#### 选中项目，在info里添加语言

![](https://tomoya92.github.io/assets/QQ20180620-144327@2x.png)

![](https://tomoya92.github.io/assets/097848C4-8B93-4898-8323-5C68C51FF378.png)

![](https://tomoya92.github.io/assets/QQ20180620-144441@2x.png)

#### 然后会发现上面新建的 `Localizable.strings` 下面多了两个文件

#### 往两个文件里添加对应语言的变量，注意要加分号 `;`

Localizable.strings (English) 

```
topic = "Topic";
comment = "Comment";
```

Localizable.strings (Chinese (Simplified)) 

```
topic = "话题";
comment = "评论";
```

#### 在项目里取变量的值

```swift
NSLocalizedString("topic", comment: "")
NSLocalizedString("comment", comment: "")
```

#### 运行项目查看效果

![](https://tomoya92.github.io/assets/QQ20180620-145008.png)

#### 修改模拟器默认语言

- 设置 -> 通用 -> 语言与地区 -> iPhone 语言 
- Settings -> General -> Language & Region -> iPhone Language
