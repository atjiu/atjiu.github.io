---
layout: post
title: beego建站之分页
date: 2016-08-25 14:38:59
categories: Golang学习笔记
tags: Golang beego
author: 朋也
---

* content
{:toc}

[beego官网](http://beego.me)

在写到列表的时候要用到分页,就自己写了个分页的工具,结合js,还挺好用,记录一下

工具类




```go
package utils

type Page struct {
    PageNo     int
    PageSize   int
    TotalPage  int
    TotalCount int
    FirstPage  bool
    LastPage   bool
    List       interface{}
}

func PageUtil(count int, pageNo int, pageSize int, list interface{}) Page {
    tp := count / pageSize
    if count % pageSize > 0 {
        tp = count / pageSize + 1
    }
    return Page{PageNo: pageNo, PageSize: pageSize, TotalPage: tp, TotalCount: count, FirstPage: pageNo == 1, LastPage: pageNo == tp, List: list}
}
```

页面分页用的是:https://github.com/lyonlai/bootstrap-paginator

页面

```html
<script type="text/javascript" src="/static/js/bootstrap-paginator.min.js"></script>
<script type="text/javascript">
  $(function () {
    $("#tab_{{.S}}").addClass("active");
    $("#page").bootstrapPaginator({
      currentPage: '{{.Page.PageNo}}',
      totalPages: '{{.Page.TotalPage}}',
      bootstrapMajorVersion: 3,
      size: "small",
      onPageClicked: function(e,originalEvent,type,page){
        var s = {{.S}};
        if (s > 0) {
          window.location.href = "/?p=" + page + "&s={{.S}}"
        } else {
          window.location.href = "/?p=" + page
        }
      }
    });
  });
</script>
```

效果

![QQ20160825-0.png](https://oceovtl1w.qnssl.com/QQ20160825-0.png)
