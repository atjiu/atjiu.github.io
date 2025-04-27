---
layout: post
title: Golang 定时器的两种实现方式及区别
date: 2021-02-25 16:33:00
categories: golang学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

不得不说，golang的sdk做了太多的东西，定时器在golang里实现起来非常的简单

两种方式

- NewTicker()
- NewTimer()

代码如下

NewTicker() 方式

```go
func foo() {
    fmt.Println("foo() start.")
    time.Sleep(time.Second * 3)
    fmt.Println("foo() end.")
}

func TestTicker(t *testing.T) {
    ticker := time.NewTicker(time.Second * 2)
    // 清理计时器
    defer ticker.Stop()
    for {
        fmt.Println("ticker start ", time.Now().Format("15:04:05"))
        foo()
        <-ticker.C
    }
}
```

运行结果

![](/assets/images/2021-02-25-16-33-13.png)

NewTimer() 方式

```go
func foo() {
    fmt.Println("foo() start.")
    time.Sleep(time.Second * 3)
    fmt.Println("foo() end.")
}

func TestTimer(t *testing.T) {
    timer := time.NewTimer(time.Second * 2)
    // 清理计时器
    defer timer.Stop()
    for {
        fmt.Println("ticker start ", time.Now().Format("15:04:05"))
        foo()
        <-timer.C
    }
}
```

运行结果

![](/assets/images/2021-02-25-16-34-54.png)

可以看到，就执行了两次就不动了

原因：NewTicker() 启动后，会自己维护一个过期时间的通道（Channel）也就是代码里的 `<-ticker.C` 这句意思就是时间一到，ticker会通过管道发出一个信号给CPU，告诉CPU时间到了，该执行定时里的方法了，信号发出后，ticker会自动的重置定时的剩余时间，然后再进行下一轮的发送信号执行方法

但NewTimer()看源码会发现，它在sleep.go文件里定义的，也就是说NewTimer()相当于一个睡眠（延时执行）。时间一到，timer会通过管道发出一个信号告诉CPU该执行定时里的代码了，然后这个管道就销毁了，除非使用 `timer.Reset(time.Duration * 2)` 来重新激活这根管道，让它重置定时的剩余时间，到下一轮定信号发出后，还要再次重置

所以在用定时时，还是NewTicker()方便

-----

**值得一提的是，当定时任务执行时间过长且超过定时的间隔时间时，定时的间隔时间到了之后会等待定时任务执行完才会进行下一轮的定时任务**
