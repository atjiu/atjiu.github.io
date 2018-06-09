---
layout: post
title: swift4 自定义UITableCell 
date: 2018-06-09 10:27:00
categories: swift学习笔记(纯代码)
tags: swift4 uitableview uitablecell
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/swift-tablecell.png)




## 新建MenuCell

创建一个类 `MenuCell` 继承 `UITableViewCell` 添加两个要实现的方法

```swift
override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
  super.init(style: style, reuseIdentifier: reuseIdentifier)
}

required init?(coder aDecoder: NSCoder) {
  super.init(coder: aDecoder)
}
```

## 初始化组件

把tableCell里要显示的组件都初始化好，我这里就只有两个组件

```swift
class MenuCell: UITableViewCell {
  var icon = UIImageView()
  var title = UILabel()
  
  lazy var box = UIView()
  
  override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
    super.init(style: style, reuseIdentifier: reuseIdentifier)
    
    box.addSubview(icon)
    box.addSubview(title)
    
    self.addSubview(box)
  }
}
```

组件加进去了，接下来就是布局了，Github上有个star数很高的布局库，用pod安装就可以用了，地址：[https://github.com/SnapKit/SnapKit](https://github.com/SnapKit/SnapKit)

## 布局

用法还是比较简单的，看文档就能明白大概用法了，下面是我的布局

```swift
override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
  super.init(style: style, reuseIdentifier: reuseIdentifier)
  
  box.addSubview(icon)
  box.addSubview(title)
  
  self.addSubview(box)
  
  icon.snp.makeConstraints { (make) in
    // 设置icon组件距离box组件左，上各10个距离单位（不太清楚是不是像素），偏移12个距离单位
    make.left.top.equalTo(10).offset(12)
    // 设置icon的宽高各20个单位
    make.width.height.equalTo(20)
  }
  
  title.snp.makeConstraints { (make) in
    // 设置title组件位置从icon组件的右边开始算起，再偏移10个单位
    make.left.equalTo(self.icon.snp.right).offset(10)
    // 设置title距离上面高度跟icon一样
    make.top.equalTo(self.icon)
  }
}
```

## 给TableCell附值

在 `MenuCell` 里新建一个方法，可以把在 TableView里创建好的数据传过来并给icon，title，附上值

```swift
func setValueForCell(menu: MenuModel) {
  title.text = menu.title
  icon = ImageUtil.loadImageFromUrl(imageView: icon, url: menu.url)
}
```

方法里的 `ImageUtil` 是我封装的一个静态方法，用于显示网络图片的

```swift
class ImageUtil {
  
  class func loadImageFromUrl(imageView: UIImageView, url: String) -> UIImageView {
    //定义URL对象
    let url = URL(string: url)
    //从网络获取数据流
    let data = try! Data(contentsOf: url!)
    //通过数据流初始化图片
    let newImage = UIImage(data: data)
    imageView.image = newImage
    return imageView
  }
}
```

方法里的 `MenuModel` 是我定义的一个菜单的结构体

```swift
struct MenuModel {
  var title: String
  var url: String
}
```

## 处理TableView渲染方法

先在在tableView里注册自己定义的 TableCell 

```swift
override func viewDidLoad() {

  // ...

  //注册cell的Identifier，用于渲染cell
  self.tableView.register(MenuCell.self, forCellReuseIdentifier: "cellID")
  
}
```

修改渲染方法

```swift
//渲染cell
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
  let cell = tableView.dequeueReusableCell(withIdentifier: "cellID") as! MenuCell
  cell.setValueForCell(menu: data[indexPath.row])
  return cell
}
```

这样就好了，直接运行看效果吧

**还是带上图片了app才好看**
