---
layout: post
title: 在textarea里输入:弹出emoji并选择上屏
tags: textarea at.js emoji
categories: javascript学习笔记
author: 朋也
---

* content
{:toc}

> 用github的issues回复的时候，可以直接输入:就会自动弹出emoji，可以选择并上屏，非常的方便，网上找了一下，大都是用图片实现的，这不是我想要的，本来emoji就是一个字符，而且各个平台都支持，那为啥不直接输入emoji呢？不用图片替换可以吗？然后折腾了一下，实现了！！

先上图看看效果

![emoji.gif](https://tomoya92.github.io/assets/emoji.gif)




## 引入依赖

这个功能用的是[at.js](https://github.com/ichord/At.js)实现的, at.js又依赖[Caret.js](https://github.com/ichord/Caret.js), 所以两个js都要引入

另外还有at.js的css文件也要引入

下面我用的是bootcdn的链接，你可以用自己的链接

```html
<link href="//cdn.bootcss.com/at.js/1.5.3/css/jquery.atwho.min.css" rel="stylesheet">
<script src="//cdn.bootcss.com/Caret.js/0.3.1/jquery.caret.min.js"></script>
<script src="//cdn.bootcss.com/at.js/1.5.3/js/jquery.atwho.min.js"></script>
```

## 初始化

就是按照github/wiki上的demo改的，直接拷贝就可以用了

```js
var contentE = $("#content");

contentE.atwho({
  at: ":",
  data: [
    {'name': 'Grinning Face', 'emoji': '😀'},
    {'name': 'Grinning Face With Smiling Eyes', 'emoji': '😁'},
    {'name': 'Face With Tears of Joy', 'emoji': '😂'},
    {'name': 'Rolling on the Floor Laughing', 'emoji': '🤣'},
    {'name': 'Smiling Face With Open Mouth', 'emoji': '😃'},
    {'name': 'Smiling Face With Open Mouth & Smiling Eyes', 'emoji': '😄'},
    {'name': 'Smiling Face With Open Mouth & Cold Sweat', 'emoji': '😅'},
    {'name': 'Winking Face', 'emoji': '😉'},
    {'name': 'Smiling Face With Smiling Eyes', 'emoji': '😊'},
    {'name': 'Face Savouring Delicious Food', 'emoji': '😋'},
    {'name': 'Smiling Face With Sunglasses', 'emoji': '😎'},
    {'name': 'Smiling Face With Heart-Eyes', 'emoji': '😍'},
    {'name': 'Face Blowing a Kiss', 'emoji': '😘'},
    {'name': 'Kissing Face', 'emoji': '😗'},
    {'name': 'Kissing Face With Smiling Eyes', 'emoji': '😙'},
    {'name': 'Kissing Face With Closed Eyes', 'emoji': '😚'},
    {'name': 'Smiling Face', 'emoji': '☺️'},
    {'name': 'Slightly Smiling Face', 'emoji': '🙂'},
    {'name': 'Hugging Face', 'emoji': '🤗'},
    {'name': 'Thinking Face', 'emoji': '🤔'},
    {'name': 'Neutral Face', 'emoji': '😐'},
    {'name': 'Expressionless Face', 'emoji': '😑'},
    {'name': 'Face Without Mouth', 'emoji': '😶'},
    {'name': 'Face With Rolling Eyes', 'emoji': '🙄'},
    {'name': 'Smirking Face', 'emoji': '😏'},
    {'name': 'Persevering Face', 'emoji': '😣'},
    {'name': 'Disappointed but Relieved Face', 'emoji': '😥'},
    {'name': 'Face With Open Mouth', 'emoji': '😮'},
    {'name': 'Zipper-Mouth Face', 'emoji': '🤐'},
    {'name': 'Hushed Face', 'emoji': '😯'},
    {'name': 'Sleepy Face', 'emoji': '😪'},
    {'name': 'Tired Face', 'emoji': '😫'},
    {'name': 'Sleeping Face', 'emoji': '😴'},
    {'name': 'Relieved Face', 'emoji': '😌'},
  ],
  displayTpl: function (data) {
    return '<li>' + data.emoji + ' ' + data.name + "</li>";
  },
  insertTpl: function (data) {
    return data.emoji;
  }
});
```

本文相关代码来自pybbs

## 相关链接

- [At.js](https://github.com/ichord/At.js)
- [Caret.js](https://github.com/ichord/Caret.js)
- [pybbs](https://github.com/tomoya92/pybbs)
