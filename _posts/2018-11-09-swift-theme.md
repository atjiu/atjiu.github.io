---
layout: post
title: swift4 App切换主题的实现方法总结
date: 2018-11-09 10:10:00
categories: swift学习笔记(纯代码)
tags: swift4 theme
author: 朋也
---

* content
{:toc}

> 声明：本篇博客的代码来自 @Finb 开发的 [V2ex-Swift](https://github.com/Finb/V2ex-Swift) 里的 V2exColor.swift，感谢大大开源这么好用的app

先上图

![](https://tomoya92.github.io/assets/swift-theme.gif)





## 依赖

本DEMO依赖

- UIColor_Hex_Swift 将16进制的颜色转成swift认识的颜色，可以增加代码可读性
- KVOController 对app里键值监听的一个库
- SnapKit 代码设置布局的工具

使用 `pod install` 安装好

项目里用到的小logo，可以去 [https://material.io/tools/icons/?style=baseline](https://material.io/tools/icons/?style=baseline) 搜索下载

## 基本代码

ViewTableViewCell.swift

```swift
import UIKit
import SnapKit

class ViewTableViewCell: UITableViewCell {

    var titleLabel: UILabel = {
        var label = UILabel()
        label.font = UIFont.systemFont(ofSize: 16)
        return label
    }()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)

        let bgView = UIView()
        self.selectedBackgroundView = bgView

        self.addSubview(titleLabel)

        self.titleLabel.snp.makeConstraints { (make) in
            make.centerY.equalTo(self.contentView)
            make.left.equalTo(20)
        }
    }

    func bind(_ title : String) {
        self.titleLabel.text = title
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

}
```

ViewController.swift
```swift
import UIKit
import SnapKit

class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    let menuButton = UIButton()
    let tableView = UITableView()
    let data = ["Swift", "SnapKit", "UIColor_Hex_Swift", "KVOController"]

    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "Demo";

        menuButton.contentMode = .center
        menuButton.setImage(UIImage(named: "baseline_brightness_2_black_24pt"), for: UIControl.State.normal)
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: menuButton)
        menuButton.addTarget(self, action: #selector(ViewController.changeMode), for: .touchUpInside)

        self.view.addSubview(self.tableView)
        self.tableView.register(ViewTableViewCell.self, forCellReuseIdentifier: "cell")
        self.tableView.dataSource = self
        self.tableView.delegate = self

        self.tableView.snp.makeConstraints { (make) in
            make.edges.equalTo(0)
        }
    }

    @objc func changeMode() {
        // TODO
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath) as! ViewTableViewCell
        cell.bind(data[indexPath.row])

        return cell
    }

}
```

对 `AppDelegate.swift` 的启动方法进行修改，加上 `UINavigationController`

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.

    self.window?.rootViewController = UINavigationController(rootViewController: ViewController())

    return true
}
```

这样一个简单的列表App就做好了

下面加上主题颜色

## 主题类

@Finb 大大将主题封装成了一个类，直接拷贝就可以用的，下面是源码，关于最下面设置KVO的代码，我也看不懂，直接用就好 : )

```swift
import UIKit
import KVOController
import UIColor_Hex_Swift

//使用协议 方便以后切换颜色配置文件、或者做主题配色之类乱七八糟产品经理最爱的功能

protocol AppColorProtocol{
    var backgroundColor: UIColor {get}
    var cellSelectionColor: UIColor {get}
    var menuButtonColor: UIColor {get}
    var titleTextColor: UIColor {get}
}

class DefaultColor: NSObject,AppColorProtocol {
    static let sharedInstance = DefaultColor()
    fileprivate override init(){
        super.init()
    }

    var backgroundColor : UIColor{
        get{
            return UIColor.white
        }
    }
    var cellSelectionColor: UIColor {
        get {
            return UIColor("#f0f0f0")
        }
    }
    var menuButtonColor : UIColor{
        get{
            return UIColor.black
        }
    }
    var titleTextColor : UIColor{
        get{
            return UIColor.black
        }
    }
}


/// Dark Colors
class DarkColor: NSObject,AppColorProtocol {
    static let sharedInstance = DarkColor()
    fileprivate override init(){
        super.init()
    }
    var backgroundColor : UIColor{
        get{
            return UIColor.black
        }
    }
    var cellSelectionColor: UIColor {
        get {
            return UIColor("#222")
        }
    }
    var menuButtonColor : UIColor{
        get{
            return UIColor.white
        }
    }
    var titleTextColor : UIColor{
        get{
            return UIColor.white
        }
    }
}


class AppColor :NSObject  {
    fileprivate static let STYLE_KEY = "styleKey"

    static let AppColorStyleDefault = "Default"
    static let AppColorStyleDark = "Dark"

    fileprivate static var _colors:AppColorProtocol?
    static var colors: AppColorProtocol {
        get{
            if let c = AppColor._colors {
                return c
            }
            else{
                if AppColor.sharedInstance.style == AppColor.AppColorStyleDefault{
                    return DefaultColor.sharedInstance
                }
                else{
                    return DarkColor.sharedInstance
                }
            }
        }
        set{
            AppColor._colors = newValue
        }
    }

    @objc dynamic var style:String
    static let sharedInstance = AppColor()
    fileprivate override init(){
        if let style = UserDefaults.standard.string(forKey: AppColor.STYLE_KEY) {
            self.style = style
        }
        else{
            self.style = AppColor.AppColorStyleDefault
        }
        super.init()
    }
    func setStyleAndSave(_ style:String){
        if self.style == style {
            return
        }

        if style == AppColor.AppColorStyleDefault {
            AppColor.colors = DefaultColor.sharedInstance
        }
        else{
            AppColor.colors = DarkColor.sharedInstance
        }

        self.style = style
        UserDefaults.standard.setValue(style, forKey: AppColor.STYLE_KEY)
    }
}

//MARK: - 主题更改时，自动执行
extension NSObject {
    fileprivate struct AssociatedKeys {
        static var themeChanged = "themeChanged"
    }

    /// 当前主题更改时、第一次设置时 自动调用的闭包
    public typealias ThemeChangedClosure = @convention(block) (_ style:String) -> Void

    /// 自动调用的闭包
    /// 设置时，会设置一个KVO监听，当V2Style.style更改时、第一次赋值时 会自动调用这个闭包
    var themeChangedHandler:ThemeChangedClosure? {
        get {
            let closureObject: AnyObject? = objc_getAssociatedObject(self, &AssociatedKeys.themeChanged) as AnyObject?
            guard closureObject != nil else{
                return nil
            }
            let closure = unsafeBitCast(closureObject, to: ThemeChangedClosure.self)
            return closure
        }
        set{
            guard let value = newValue else{
                return
            }
            let dealObject: AnyObject = unsafeBitCast(value, to: AnyObject.self)
            objc_setAssociatedObject(self, &AssociatedKeys.themeChanged,dealObject,objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            //设置KVO监听
            self.kvoController.observe(AppColor.sharedInstance, keyPath: "style", options: [.initial,.new] , block: {[weak self] (nav, color, change) -> Void in
                self?.themeChangedHandler?(AppColor.sharedInstance.style)
                }
            )
        }
    }
}
```

## 项目内使用

使用很简单，在需要更新主题的时候改变组件颜色的地方，实现 `AppColor` 里的闭包函数 `themeChangedHandler` 就可以了

在 `ViewController.swift` 里的 `viewDidLoad()` 方法里加上这个闭包的实现

```swift
override func viewDidLoad() {
    // ...

    self.themeChangedHandler = {[weak self] (style) -> Void in
        self?.view.backgroundColor = AppColor.colors.backgroundColor
        self?.tableView.backgroundColor = AppColor.colors.backgroundColor
        self?.menuButton.tintColor = AppColor.colors.menuButtonColor
        if AppColor.sharedInstance.style == AppColor.AppColorStyleDefault {
            self?.navigationController?.navigationBar.barStyle = .default
        } else {
            self?.navigationController?.navigationBar.barStyle = .black
        }
    }
}
```

实现一下点击小图标的事件

```swift
@objc func changeMode() {
    if AppColor.sharedInstance.style == AppColor.AppColorStyleDefault {
        AppColor.sharedInstance.setStyleAndSave(AppColor.AppColorStyleDark)
    } else {
        AppColor.sharedInstance.setStyleAndSave(AppColor.AppColorStyleDefault)
    }
}
```

再次运行项目，点点看看，背景，navigationBar都已经可以换色了，但 TableViewCell 还不行，那就在 `ViewTableViewCell.swift` 里也加上主题更新的闭包实现

```swift
override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
    // ...

    self.themeChangedHandler = {[weak self] (style) -> Void in
        self?.titleLabel.textColor = AppColor.colors.titleTextColor
        self?.backgroundColor = AppColor.colors.backgroundColor
        bgView.backgroundColor = AppColor.colors.cellSelectionColor
    }
}
```

再运行就没问题了

## 其它

我在开发 [CNodeJS-Swift](https://github.com/tomoya92/CNodeJS-Swift) 项目的时候用到了 [XLPagerTabStrip](https://github.com/xmartlabs/XLPagerTabStrip) ，这货的颜色设置都是写在 `super.viewDidLoad()` 方法上面才能生效，这导致了我在更新主题的时候执行闭包函数没效果

解决方法：直接把源码下载下来，在程序里改的 :joy

另外，给大家再推荐一个主题更新的开源库，小项目还是比较好用的 [NightNight](https://github.com/Draveness/NightNight)
