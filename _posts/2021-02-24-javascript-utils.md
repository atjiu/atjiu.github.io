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

## 拷贝（深，浅）

- 浅拷贝：只能复制一层属性，对象里的数组或者函数拷贝之后用的还是引用，当修改新对象或者旧对象里数组或者对象的值是，两个都会变
- 深拷贝：完全复制一个新对象出来

浅拷贝

```js
let obj = { a: 1, b: 2, c: [1, 2, 3] };
// 浅拷贝
let obj1 = Object.assign({}, obj);
console.log(obj1);
console.log(obj === obj1);
obj1.c[1] = 'a';
console.log(obj, obj1);
```

执行结果如下

![](/assets/images/2021-02-25-09-52-56.png)

深拷贝

```js
function deepClone(obj) {
    if (typeof obj === 'object' && obj !== null) {
        let isArray = Array.isArray(obj);
        const newObj = isArray ? [] : {};
        if (isArray) {
            obj.forEach((item, index) => {
                newObj[index] = deepClone(obj[index]);
            });
        } else {
            Object.keys(obj).forEach(item => {
                newObj[item] = deepClone(obj[item]);
            });
        }
        return newObj;
    } else {
        return obj;
    }
}

let obj = { a: 1, b: 2, c: [1, 2, 3] };
// 浅拷贝
// let obj1 = Object.assign({}, obj);
// 深拷贝
let obj1 = deepClone(obj);

console.log(obj1);
console.log(obj === obj1);
obj1.c[1] = 'a';
console.log(obj, obj1);
```

运行结果如下

![](/assets/images/2021-02-25-10-06-44.png)

上面方法有个问题，当对象里有循环引用时，它就傻了，一个劲的循环直到内存溢出，比如

```js
let obj = { a: 1, b: 2, c: [1, 2, 3], d: { x: 1, y: 2 } };
// 添加循环引用
obj.d.z = obj.c;
obj.c[3] = obj.d;
// 浅拷贝
// let obj1 = Object.assign({}, obj);
// 深拷贝
let obj1 = deepClone(obj);

console.log(obj1);
console.log(obj === obj1);
obj1.c[1] = 'a';
console.log(obj, obj1);
```

用浅拷贝是没有问题的，但深拷贝就报错了

![](/assets/images/2021-02-25-10-11-44.png)

解决办法是在 deepClone() 方法里加一个缓存，用于存放一下递归到引用类型的属性，这样在下一次递归到这个引用的时候，直接取就是了，而不是重新创建一个

```js
function deepClone(obj, map = new Map()) {
    if (typeof obj === 'object' && obj !== null) {
        // 先从map里获取一下，有就直接返回map中已经存在的值
        let cache = map.get(obj);
        if (cache) return cache;
        let isArray = Array.isArray(obj);
        const newObj = isArray ? [] : {};
        // 上面判断没有的会走到这，就把当前的值存在map里
        map.set(obj, true);
        if (isArray) {
            obj.forEach((item, index) => {
                newObj[index] = deepClone(obj[index], map);
            });
        } else {
            Object.keys(obj).forEach(item => {
                newObj[item] = deepClone(obj[item], map);
            });
        }
        return newObj;
    } else {
        return obj;
    }
}
```

关于深拷贝还有一种很傻瓜的方法，方法是使用JSON对象的 parse() 和 stringify() 两个方法，先将原对象转成字符串，然后再将字符串转成对象，这样出来的新对象就是一个深拷贝的对象了，且这种方法同样能解决循环引用的拷贝

但是当对象中有 function 时，就不灵了，所以只限于对数组或者对象的拷贝

```js
let obj = { a: 1, b: 2, c: [1, 2, 3], d: { x: 1, y: 2 } };
let obj1 = JSON.parse(JSON.stringify(obj));
// // 添加循环引用
obj.d.z = obj.c;
obj.c[3] = obj.d;

console.log(obj1);
console.log(obj === obj1);
obj1.c[1] = 'a';
console.log(obj, obj1);
```

![](/assets/images/2021-02-25-10-21-18.png)

## 事件

js里通过 addEventListener(type, listener [, options]) 方法给元素添加事件时，有三个参数

- type 事件类型
- listener 监听方法
- options 又有几个参数
  - once 当为true时，事件被触发一次后，自动销毁
  - capture 当为true时，就只会触发捕获事件，为false时则为冒泡事件
  - passive MDN上解释说是被动模式，当为true时，事件不会调用 e.preventDefault() 方法，我没试出来有啥用

js里事件的执行顺序为 捕获事件1 -> 捕获事件2 -> 冒泡事件2 -> 冒泡事件1 就是先一层一层的往里触发（捕获过程），然后再从最里层往外一层一层的触发（冒泡过程）

比如下图中，外面的大圆是 parent-box , 里面的小圆是 child-box

![](/assets/images/2021-02-25-11-00-23.png)

代码：

```html
<style type="text/css">
    #parent-box {
        width: 300px;
        height: 300px;
        background-color: darkcyan;
        margin: 0 auto;
        border-radius: 150px;
    }

    #child-box {
        position: relative;
        left: 50px;
        top: 50px;
        width: 200px;
        height: 200px;
        background-color: aquamarine;
        vertical-align: middle;
        border-radius: 100px;
    }
</style>
<div id="parent-box">
    <div id="child-box"></div>
</div>
```

当分别给它们添加上事件后

```js
document.getElementById("parent-box").addEventListener("click", function (e) {
    console.log("parent-box clicked! 捕获事件");
}, true);

document.getElementById("child-box").addEventListener("click", function (e) {
    console.log("child-box clicked! 捕获事件");
}, true);

document.getElementById("parent-box").addEventListener("click", function (e) {
    console.log("parent-box clicked! 冒泡事件");
});

document.getElementById("child-box").addEventListener("click", function (e) {
    console.log("child-box clicked! 冒泡事件");
});
```

点击大圆执行结果如下

![](/assets/images/2021-02-25-11-08-45.png)

点击小圆执行结果如下

![](/assets/images/2021-02-25-11-01-39.png)

> 注：当addEventListener() 方法的第三个参数不传时，默认为冒泡事件
>
> 当只传一个参数时，不管传啥，true, false, 1, 2, undefined, null... 统统都是捕获事件
>
> 如果想传多个参数时，可以这样写：注：当addEventListener("click", function(){}, {capture: true, once: ture, passive: true});

## 事件委托

后端程序员写js的时候，基本上都碰到过这种问题：页面上有些输入框是通过点击某个按钮添加到页面上的，然后在js里定义的给这种元素添加事件的事件方法就不生效了。

这种情况可以用事件委托的方式来解决，原理是通过对父元素添加事件来管理子元素的事件

封装方法如下：

```js
/**
 * el:       父元素选择器
 * type:     事件类型
 * cb:       事件回调
 * targetEl: 子元素选择器
 */
function addEventDelegate(el, type, cb, targetEl) {
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }
    if (!targetEl) {// 如果被代理的事件元素没传，则给父级绑上相应的事件
        el.addEventListener(type, cb);
    } else {
        el.addEventListener(type, function (e) {
            const target = e.target;
            if (target.matches(targetEl)) {
                cb.call(target, e);
            }
        });
    }
}
```

用法：

```html
<div id="parent-box">
    <p class="item">java</p>
    <p class="item">javascript</p>
    <p>nodejs</p>
</div>
<script type="text/javascript">
    addEventDelegate("#parent-box", "click", function (e) {
        console.log(this.innerHTML);
    }, ".item");
</script>
```

当点击有 class="item" 类样式的元素时，会在控制台里打印出元素的内容
