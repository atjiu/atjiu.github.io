---
layout: post
title: Golang 代理（装饰器）Decorator
date: 2021-02-24 16:27:00
categories: Golang学习笔记
tags: golang
author: 朋也
---

* content
{:toc}

Java里可以通过`注解`+`反射`的方式在目标方法神不知鬼不觉的情况下将它的参数，结果等数据进行修改，这种功能在GO里可以用装饰器来实现

所谓装饰器就是一个高阶函数，说白了就是参数是一个func，返回值也是一个func，如下

```go
func Foo(stuff Stuff) stuff Stuff {}
```

装饰器的用法如下

```go
type Decorator func(a int, b int) int

func Foo(a int, b int) int {
    fmt.Println("Foo Running...")
    return a + b
}

func MyDecorator(decorator Decorator) Decorator {
    return func(a int, b int) int {
        fmt.Println("Foo Run Before...")
        result := decorator(a, b)
        fmt.Println("Foo Run After...")
        return result
    }
}

func TestDecorator(t *testing.T) {
    result := MyDecorator(Foo) // 通过装饰器拿到被装饰（代理）的对象
    fmt.Printf("Foo Run Result: %d\n", result(1, 2)) // 通过执行装饰（代理）对象来实现对被装饰（代理）对象的"增强"
}
```

执行结果：

![](/assets/2021-02-24-16-32-05.png)
