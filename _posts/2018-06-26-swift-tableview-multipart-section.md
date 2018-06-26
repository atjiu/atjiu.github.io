---
layout: post
title: swift4 UITableView 多个部分(Section)用法，实现一个通讯录
date: 2018-06-26 15:40:00
categories: swift学习笔记(纯代码)
tags: swift4 uitableview
author: 朋也
---

* content
{:toc}

直接上图

![](https://tomoya92.github.io/assets/tableview-multipart-section.gif)




直接上代码

```swift
import UIKit

class ViewController: UITableViewController {
    
    var data = [
        ("A", ["阿猫", "阿狗", "阿门", "阿前"]),
        ("B", ["背锅", "背诵", "北方", "北京", "北国", "卑鄙"]),
        ("C", ["曹操", "炒菜", "抄家", "菜子", "擦伤", "长短"]),
        ("D", ["大小", "大家", "带来", "捣蛋"]),
        ("F", ["仿佛", "仿照", "发财", "返航", "帆船"]),
        ("H", ["花泽香菜"])
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "TableViewDemo"
        self.view.backgroundColor = .white
        self.tableView.dataSource = self
        self.tableView.delegate = self
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
    }
    
    // 设置tableView有多少个部分
    override func numberOfSections(in tableView: UITableView) -> Int {
        return data.count
    }
    
    // 设置tableView每个部分的Header的高
    override func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return 30
    }
    
    // 设置tableView每个部分Header内容
    override func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let view = UIView()
        view.backgroundColor = UIColor(red:0.94, green:0.94, blue:0.94, alpha:1.0)
        let viewLabel = UILabel(frame: CGRect(x: 10, y: 0, width: UIScreen.main.bounds.size.width, height: 30))
        viewLabel.text = data[section].0
        viewLabel.textColor = UIColor(red:0.31, green:0.31, blue:0.31, alpha:1.0)
        view.addSubview(viewLabel)
        tableView.addSubview(view)
        return view
    }
    
    // 计算每个部分的数量
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data[section].1.count
    }
    
    // 将数据填充到UITableViewCell里
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        cell.textLabel?.text = data[indexPath.section].1[indexPath.row]
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
```
