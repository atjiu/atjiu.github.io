---
layout: post
title:  go语言解析网页利器goquery简单使用
categories: Golang学习笔记
tags: Golang goquery
author: 朋也
---

* content
{:toc}

> java里用Jsoup，nodejs里用cheerio，都可以相当方便的解析网页，在golang语言里也找到了一个网页解析的利器，相当的好用，选择器跟jQuery一样

## 安装

```bash
go get github.com/PuerkitoBio/goquery
```




## 使用

其实就是项目的`readme.md`里的demo

```go
package main

import (
  "fmt"
  "log"

  "github.com/PuerkitoBio/goquery"
)

func ExampleScrape() {
  doc, err := goquery.NewDocument("http://metalsucks.net")
  if err != nil {
    log.Fatal(err)
  }

  // Find the review items
  doc.Find(".sidebar-reviews article .content-block").Each(func(i int, s *goquery.Selection) {
    // For each item found, get the band and title
    band := s.Find("a").Text()
    title := s.Find("i").Text()
    fmt.Printf("Review %d: %s - %s\n", i, band, title)
  })
}

func main() {
  ExampleScrape()
}
```

## 乱码问题

中文网页都会有乱码问题，因为它默认是utf8编码，这时候就要用到转码器了

安装 `iconv-go`

```bash
go get github.com/djimenez/iconv-go
```

使用方法

```go
func ExampleScrape() {
  res, err := http.Get(baseUrl)
  if err != nil {
    fmt.Println(err.Error())
  } else {
    defer res.Body.Close()
    utfBody, err := iconv.NewReader(res.Body, "gb2312", "utf-8")
    if err != nil {
      fmt.Println(err.Error())
    } else {
      doc, err := goquery.NewDocumentFromReader(utfBody)
      // 下面就可以用doc去获取网页里的结构数据了
      // 比如
      doc.Find("li").Each(func(i int, s *goquery.Selection) {
        fmt.Println(i, s.Text())
      })
    }
  }
}
```

## 进阶

有些网站会设置Cookie, Referer等验证，可以在http发请求之前设置上请求的头信息

**这个不属于goquery里的东西了，想了解更多可以查看golang里的 `net/http` 包下的方法等信息**

```go
baseUrl:="http://baidu.com"
client:=&http.Client{}
req, err := http.NewRequest("GET", baseUrl, nil)
req.Header.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
req.Header.Add("Referer", baseUrl)
req.Header.Add("Cookie", "your cookie") // 也可以通过req.Cookie()的方式来设置cookie
res, err := client.Do(req)
defer res.Body.Close()
//最后直接把res传给goquery就可以来解析网页了
doc, err := goquery.NewDocumentFromResponse(res)
```

## 参考

- [https://github.com/PuerkitoBio/goquery](https://github.com/PuerkitoBio/goquery)
- [https://github.com/PuerkitoBio/goquery/issues/185](https://github.com/PuerkitoBio/goquery/issues/185)
- [https://github.com/PuerkitoBio/goquery/wiki/Tips-and-tricks#handle-non-utf8-html-pages](https://github.com/PuerkitoBio/goquery/wiki/Tips-and-tricks#handle-non-utf8-html-pages)

可以愉快的爬人家的网站了😂
