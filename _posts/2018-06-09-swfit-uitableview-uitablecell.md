---
layout: post
title: swift4 自定义UITableCell
date: 2018-06-09 10:27:00
categories: swift学习笔记(纯代码)
tags: swift4 uitableview uitablecell
author: 朋也
---

[swift4 uinavigation + uitable 整合使用创建列表视图](https://tomoya92.github.io/2018/06/08/swift-uinavigation-uitable/)
[swift4 自定义UITableCell](https://tomoya92.github.io/2018/06/09/swfit-uitableview-uitablecell/)
[swift4 在tableView渲染之前加上加载动画（菊花，UIActivityIndicatorView）](https://tomoya92.github.io/2018/06/11/swift-tableview-activity-indicator/)
[swift4 给项目添加tablayout布局，XLPagerTabStrip用法](https://tomoya92.github.io/2018/06/13/swift-tablayout-xlpagertabstrip/)
[swift4 往视图控制器里添加视图控制器（往UIViewController里添加UIViewController）](https://tomoya92.github.io/2018/06/13/swift-adduiviewcontroller-to-uiviewcontroller/)
[swift4 Moya简单使用，请求接口解析json](https://tomoya92.github.io/2018/06/14/swift-moya/)
[swift4 UITableView 下拉刷新上拉加载 MJRefresh 自定义用法](https://tomoya92.github.io/2018/06/20/swift-pullrefresh-loadmore/)
[swift4 开发App，适配国际化，多语言支持](https://tomoya92.github.io/2018/06/20/swift-localizable/)
[swift4 UITableView 多个部分(Section)用法，实现一个通讯录](https://tomoya92.github.io/2018/06/26/swift-tableview-multipart-section/)
[swift4 扫描二维码（使用scanSwift实现）](https://tomoya92.github.io/2018/06/27/swift-scan-qrcode/)
[swift4 侧滑功能（使用DrawerController实现）](https://tomoya92.github.io/2018/06/29/swift-drawercontroller/)
[swift4 UITabBarController 简单使用](https://tomoya92.github.io/2018/06/29/swift-tabbarcontroller/)
[swift4 WKWebView使用JS与Swift交互](https://tomoya92.github.io/2018/07/05/swift-webview-javascript/)
[swift使用webview加载本地html，html里引入本地的css，js](https://tomoya92.github.io/2018/10/31/swift-webview-load-css-js/)
[swift4 App切换主题的实现方法总结](https://tomoya92.github.io/2018/11/09/swift-theme/)

* content
{:toc}

直接上图

![](/assets/swift-tablecell.png)




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

> 上面自定义的加载网络图片的方法会有很长的延迟，当点击Cell进入下一面的时候，网络加载会花大量时间，这样会导致页面出现白屏，解决办法有两个，一个是把加载图片的地方改成异步加载，一个是引用第三方的图片加载库

将网络消耗的代码放在异步线程里方法

```swift
func setValueForCell(menu: MenuModel) {
  title.text = menu.title
  DispatchQueue.global().async {
    self.icon = ImageUtil.loadImageFromUrl(imageView: self.icon, url: menu.url)
  }
  //icon = ImageUtil.loadImageFromUrl(imageView: icon, url: menu.url)
}
```

这样程序就不会卡了，运行会看到图片最开始是没有的，然后慢慢的加载出来，但这样xcode会报一个错 `UIImageView.image must be used from main thread only` 网上查了一下，这是把ui操作放在异步里执行的问题，如果一个异步操作耗时很长，那么程序就会进入假死状态，系统就会弹出 就用无响应 这样的提示，所以这种是不推荐的

另一种是引入第三方类库 [https://github.com/onevcat/Kingfisher](https://github.com/onevcat/Kingfisher)

用法也很简单

```swift
import Kingfisher

let url = URL(string: menu.icon)
//设置加载菊花
self.icon.kf.indicatorType = .activity
self.icon.kf.setImage(with: url)
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
