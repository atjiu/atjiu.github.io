---
layout: post
title: swift4 扫描二维码（使用scanSwift实现）
date: 2018-06-27 09:41:00
categories: swift学习笔记(纯代码)
tags: swift4 scan qrcode
author: 朋也
---

* content
{:toc}

直接上图

<video src="https://tomoya92.github.io/assets/ScreenRecording_06-27-2018 09-54-06.mp4" controls="controls" autoplay="autoplay" width="375"></video>





## 安装

仓库地址：https://github.com/MxABC/swiftScan

按照readme里的说明用pod安装没法用，不知道啥原因，所以只能手动安装了，把项目里的Source源码拷贝到自己新建的项目里即可

## 开发主界面

主界面就一个按钮，点击来调用扫码界面的

```swift
var button = UIButton(type: UIButtonType.roundedRect)
var resultLabel = UILabel()

override func viewDidLoad() {
    super.viewDidLoad()
    self.title = "ScanQrCodeDemo"
    self.view.backgroundColor = .white
    
    self.button.setTitle("Scan QR Code", for: .normal)
    self.button.setTitleColor(.black, for: .normal)
    self.button.layer.borderColor = UIColor.lightGray.cgColor
    self.button.layer.borderWidth = 1
    self.button.layer.cornerRadius = 5
    self.button.layer.masksToBounds = true
    self.button.contentEdgeInsets = UIEdgeInsets(top: 5, left: 10, bottom: 5, right: 10)
    
    // 给按钮添加点击事件
    self.button.addTarget(self, action: #selector(ViewController.click), for: UIControlEvents.touchUpInside)
    
    self.view.addSubview(self.button)
    self.view.addSubview(self.resultLabel)
    
    // 添加依赖
    self.button.snp.makeConstraints { (make) in
        make.centerX.equalToSuperview()
        make.centerY.equalToSuperview()
    }
    
    self.resultLabel.snp.makeConstraints { (make) in
        make.centerX.equalToSuperview()
        make.top.equalTo(self.button.snp.bottom).offset(20)
    }
}
```

## 实现事件

```swift
@objc func click() {
    LBXPermissions.authorizeCameraWith { [weak self] (granted) in
        if granted {
            self?.scanQrCode()
        } else {
            LBXPermissions.jumpToSystemPrivacySetting()
        }
    }
}
```

`scanQrCode` 方法

```swift
func scanQrCode() {
    //设置扫码区域参数
    var style = LBXScanViewStyle()
    style.centerUpOffset = 60;
    style.xScanRetangleOffset = 30;
    if UIScreen.main.bounds.size.height <= 480 {
        //3.5inch 显示的扫码缩小
        style.centerUpOffset = 40;
        style.xScanRetangleOffset = 20;
    }
    style.color_NotRecoginitonArea = UIColor(red: 0.4, green: 0.4, blue: 0.4, alpha: 0.4)
    style.photoframeAngleStyle = LBXScanViewPhotoframeAngleStyle.Inner;
    style.photoframeLineW = 2.0;
    style.photoframeAngleW = 16;
    style.photoframeAngleH = 16;
    style.isNeedShowRetangle = false;
    style.anmiationStyle = LBXScanViewAnimationStyle.NetGrid;
    style.animationImage = UIImage(named: "qrcode_scan_full_net")
    let vc = LBXScanViewController();
    vc.scanStyle = style
    vc.scanResultDelegate = self
    self.navigationController?.pushViewController(vc, animated: true)
}
```

上面的 `qrcode_scan_full_net` 是一个图片，下载地址：https://github.com/MxABC/swiftScan/blob/master/swiftScan/CodeScan.bundle/qrcode_scan_full_net.png

## 拿到扫描结果

`ViewController` 要实现一个协议 `LBXScanViewControllerDelegate` 然后实现它的一个方法

```swift
func scanFinished(scanResult: LBXScanResult, error: String?) {
    self.resultLabel.text = "扫描结果：" + scanResult.strScanned!
}
```
