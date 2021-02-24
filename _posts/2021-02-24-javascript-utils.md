---
layout: post
title: Javascript里的一些常用的工具类
date: 2021-02-24 21:00:00
categories: javascript学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}

## 节流

节流函数一般用于事件上的，比如浏览器的滚动事件

```js
window.addEventListener("scroll", function(e) {
    console.log("123123");
})
```

当滚动浏览器的时候，这个回调会被执行非常多次，这就不太好了，可以通过节流来限制在一段时间内只执行一次

定义一个节流的方法

```js
function throttle(callback, wait) {
    let start = 0;
    return function (e) {
        let now = Date.now();
        if (now - start > wait) {
            callback.call(this, e);
            start = now;
        }
    }
}
```

然后改造一下滚动事件对象

```js
window.addEventListener("scroll", throttle(function(e) {
    console.log("123123");
}), 500); // 500ms才执行一次这个滚动事件
```

## 防抖

防抖的使用场景一般是在自动完成的地方，当在输入框里输入想搜索的内容时，如果不加防抖，那么每输入一个字符，就会发送一次请求获取一下要自动显示的内容，这显然是不合理的

防抖函数的原理是当触发一个事件时，它会等待一会（设定的时间）在等待的这段时间里，如果再次触发了事件，那么这个时间会重置，当在等待的时间内没有触发事件且时间也过了，才会触发事件

上面的节流函数是当事件触发时会立即执行，然后记录一个时间，下次再触发时会判断时间过没有，过了才会再次触发

```js
function debounce(callback, time) {
    let timeId = null;
    return function (e) {
        if (timeId != null) {
            clearTimeout(timeId);
        }
        timeId = setTimeout(() => {
            callback.call(this, e);
            timeId = null;
        }, time);
    }
}
```

给一个input输入框绑定上输入事件

```html
<input type="text" id="input">
<script>
    document.getElementById("input").addEventListener("keypress", debounce(function (e) {
        console.log("asdasd");
    }, 1000));
</script>
```

