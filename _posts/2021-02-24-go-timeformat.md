---
layout: post
title: Golang time 日期（时间）格式化
date: 2021-02-24 17:39:00
categories: Golang学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

go里格式化时间比较奇葩，没有java里的 `YYYY-MM-dd HH:mm:ss`，看 `time.Format()` 源码会发现

![](/assets/2021-02-24-17-41-48.png)

它格式化时间是按照一个时间来的，这个时间是 `Mon Jan 2 15:04:05 -0700 MST 2006` 听说这个时间是go第一次发布的时间

然后将一个日期格式化成字符串就成了下面这种

```go
time.Now().Format("2006-01-02") 输出的格式就是 2021-02-24 (我测试时间就是2021-02-24)
```

原文链接: [https://tomoya92.github.io/2021/02/24/go-timeformat/](https://tomoya92.github.io/2021/02/24/go-timeformat/)

下面整理了一些日期相关的工具类

```go
// 将time格式化成字符串
func TestTimeToString(t *testing.T) {
    now := time.Now()
    fmt.Printf("YYYY-MM-dd %s\n", now.Format("2006-01-02"))
    fmt.Printf("YYYY-MM-dd HH:mm:ss %s\n", now.Format("2006-01-02 15:04:05"))
}

// 将字符串转成time
func TestStringToTime(t *testing.T) {
    str := "2021-01-03 15:23:11"
    // 设置时区
    loc, _ := time.LoadLocation("Asia/Shanghai")
    d, _ := time.ParseInLocation("2006-01-02 15:04:05", str, loc)
    fmt.Printf("time: %v\n", d)
}

// 获取几天前或者几天后
func TestGetDateBefore(t *testing.T) {
    now := time.Now()
    day := 3                          // 获取3天前
    before := now.AddDate(0, 0, -day) // 如果是3天后，则将 - 去掉
    fmt.Printf("time: %v\n", before)
}

// 获取几分钟前或者几分钟后，同样的可以获取几秒前后，几毫秒前后 修改 time.Minute 为 time.Second 或者 time.Hour time.Millisecond 等
func TestGetTimeBefore(t *testing.T) {
    now := time.Now()
    var m time.Duration = -3 // 获取3分钟前
    before := now.Add(time.Minute * m)
    fmt.Printf("time: %v\n", before)
}
```
