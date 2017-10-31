---
layout: post
title: js模板 underscore 简单使用教程
date: 2017-02-15 10:54:20
categories: 模板
tags: javascript underscore template
author: 朋也
---

* content
{:toc}

## 获取

- 打开 [bootcdn](//bootcdn.cn) 搜索 underscore 
- [github地址](https://github.com/jashkenas/underscore)

## 使用

**创建模板**

```html
<!DOCTYPE html>
<html>
<head>
  <title>demo</title>
</head>
<body>
  <div id="box"></div>
  <script type="text/template" id="tpl">
    hello, <%=name%>
  </script>
  <script src="//cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
  <script src="//cdn.bootcss.com/underscore.js/1.8.3/underscore-min.js"></script>
  <script type="text/javascript">
    var name = 'world';
    var render = _.template($("#tpl").html());
    $("#box").html(render({name: name}));
  </script>
</body>
</html>
```




```
result: 

hello, world
```

**遍历列表**

```html
<!DOCTYPE html>
<html>
<head>
  <title>demo</title>
</head>
<body>
  <div id="box"></div>
  <script type="text/template" id="tpl">
    <ul>
      <% _.each(list, function(v, i) { %>
        <li><%=i%>. <%=v.name%></li>
      <% }) %>
    </ul>
  </script>
  <script src="//cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
  <script src="//cdn.bootcss.com/underscore.js/1.8.3/underscore-min.js"></script>
  <script type="text/javascript">
    var names = [{
      name: 'tom',
      age: 21
    }, {
      name: 'jerry',
      age: 20
    }, {
      name: 'amy',
      age: 23
    }, {
      name: 'john',
      age: 15
    }]
    var render = _.template($("#tpl").html());
    $("#box").html(render({list: names}));
  </script>
</body>
</html>
```

```
result:

0. tom
1. jerry
2. amy
3. john
```
**if判断**

```html
<!DOCTYPE html>
<html>
<head>
  <title>demo</title>
</head>
<body>
  <div id="box"></div>
  <script type="text/template" id="tpl">
    <ul>
      <% _.each(list, function(v, i) { %>
        <% if(i % 2 == 0) { %>
          <li><%=i%>. <%=v.name%></li>
        <% } %>
      <% }) %>
    </ul>
  </script>
  <script src="//cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
  <script src="//cdn.bootcss.com/underscore.js/1.8.3/underscore-min.js"></script>
  <script type="text/javascript">
    var names = [{
      name: 'tom',
      age: 21
    }, {
      name: 'jerry',
      age: 20
    }, {
      name: 'amy',
      age: 23
    }, {
      name: 'john',
      age: 15
    }]
    var render = _.template($("#tpl").html());
    $("#box").html(render({list: names}));
  </script>
</body>
</html>
```

```
result: 

0. tom
2. amy
```

## 参考

[http://underscorejs.org/](http://underscorejs.org/)
