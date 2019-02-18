---
layout: post
title: Javascript异步执行结果获取的三种解决方案
date: 2019-02-18 17:39:00
categories: javascript学习笔记
tags: javascript promise rxjs
author: 朋也
---

* content
{:toc}

js里的异步有时候很方便，有时候却很让人恼火，下面来总结一下异步执行结果获取的方法

## 回调

这是最传统的方法了，也是最简单的，如下代码

```js
function foo(cb) {
  setTimeout(function() {
    cb(1); // 通过参数把结果返回
  }, 2000);
}

foo(function(result) { // 调用foo方法的时候，通过回调把方法返回的数据取出来
  console.log(result);
})
```






## Promise

Promise是ES6里加入的新对象，它可以把一个异步执行的方法封装成支持同步操作的方法，结合 async/await 完美，下面说一下它是怎么封装一个方法的

```js
function foo() {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve(1); // 通过 resolve 参数把成功的结果返回
      // reject('error');  // 通过 reject 参数把错误信息返回
    }, 2000);
  })
}

// 调用
foo()
  .then(result => console.log(result))
  .catch(error => console.log(error));
```

从上面例子可以看出，Promise取值使用的是 `.then()` 函数，异常处理用的是 `.catch()` 函数

## rxjs

rxjs 是一种设计思想的javascript语言的实现框架，rx原名是：ReactiveX

- 官网是 [http://reactivex.io/](http://reactivex.io/)
- 开源地址 [https://github.com/ReactiveX/rxjs](https://github.com/ReactiveX/rxjs)

rx口号是万物皆是流，跟java里万物皆对象挺像的，它的api也全都是对流进行操作，写起来还是很爽的，下面看一下rxjs怎么封装一个异步执行操作

**注意，用这货首先要安装它在自己的项目里，然后再引入依赖，如果是浏览器环境可以引入js**

```js
import { Observable } from 'rxjs';

function foo() {
  return new Observable((observe) => {
    setTimeout(function() {
      observe.next(1); // 通过 observe.next() 方法把成功的结果返回
      // observe.error('error');  // 通过 observe.error 方法把错误信息返回
    }, 2000);
  })
}

// 调用
foo()
  .subscribe(
    result => console.log(result),
    error => console.log(error)
  );
```

可以看到它跟Promise很像，就是变了几个参数名，不过它可比Promise强大多了

下面来说一下rxjs里的取消操作，没错请求还能取消，这骚操作也只有rxjs能实现了

```js
import { Observable } from 'rxjs';

function foo() {
  return new Observable((observe) => {
    setTimeout(function() {
      observe.next(1); // 通过 observe.next() 方法把成功的结果返回
      // observe.error('error');  // 通过 observe.error 方法把错误信息返回
    }, 2000);
  })
}

// 调用，方法里2s后返回数据
const o = foo().subscribe(
  result => console.log(result),
  error => console.log(error)
);

// 设置一个定时器1s后取消订阅，这样console里就不会打印出结果了，这个请求也就被取消了
setTimeout(function() {
  o.unsubscribe(); // 取消订阅
}, 1000);
```

rxjs除了取消执行外，还有一个牛逼的功能，循环执行，对一个请求可以一直接收它返回的结果，看下下面的例子就明白了

```js
import { Observable } from 'rxjs';

function foo() {
  return new Observable((observe) => {
    let count = 0;
    setInterval(function() {
      observe.next(count++); // 通过 observe.next() 方法把成功的结果返回
      // observe.error('error');  // 通过 observe.error 方法把错误信息返回
    }, 1000);
  })
}

// 调用
foo().subscribe(
  result => console.log(result),   // 这行会每隔1s打印一条数据
  error => console.log(error)
);
```

因为在 ReactiveX 里一切皆是流，所以也就有很多对流操作的api，比如 `fliter`, `map` 等，类似于java8里的 stream 的操作，下面看一下例子说明白了

```js
import { Observable } from 'rxjs';
// 对流操作要引入操作类
import { map, filter } from 'rxjs/operators';

function foo() {
  return new Observable((observe) => {
    let count = 0;
    setInterval(function() {
      observe.next(count++); // 通过 observe.next() 方法把成功的结果返回
      // observe.error('error');  // 通过 observe.error 方法把错误信息返回
    }, 1000);
  })
}

// 调用
const o = foo();
o.pipe(
  filter((value: number) => value % 2 === 0),
  map((value: number) => value *= 2)
).subscribe(data => console.log(data));
```
