---
layout: post
title: 使用jekyll搭建个人博客，托管在github pages上
categories: 杂项
tags: jekyll blog github
author: 朋也
---

* content
{:toc}

## 安装

```sh
// 通用安装
// 依赖ruby，所有要先装上ruby
sudo gem install jekyll bundle

// ubuntu上安装
sudo apt install jekyll
```




## 常用命令

```sh
// 启动一个服务，会自动更新改动的，在书写博客的时候开着相当方便
jekyll serve

// 构建静态页面，会生成 _site 文件夹
jekyll build
```

## 目录介绍

| 名称      | 说明               | 用法                                                                                   |
|-----------|--------------------|----------------------------------------------------------------------------------------|
| _layouts  | 布局文件           | 比如博客详情页面，在md文件头部要加上的 layout: post 就是用的 `_layouts/post.html` 页面 |
| _posts    | 博客原文件目录     | 格式为 markdown 后缀的博客原文件所在目录                                               |
| _includes | 在页面里引入的页面 | 可以直接使用 include 引用                                                              |
{: .table.table-bordered }

## 配置文件

jekyll 默认启动加载 `_config.yml` 文件，在页面里获取配置在 `_config.yml` 里的值用的是 `site.xxx`

比如，在 `_config.yml` 文件里加入一个变量 `github_username:  tomoya92` 那么在页面上就可以用 `{{site.github_username}}` 来获取它的值

`permalink: /:year/:month/:day/:title/` 表示访问博客的路径地址格式，比如 `_posts/2017-06-03-hello.md` 构建后的访问地址就是 `/2017/06/03/hello/` 如果定成 `permalink: /:title/` 那么访问地址就是 `/hello/` 这里就有个问题，万一两个文件名字是一样的，就是前面的日期不同，那就会出现访问路径一样的现象，会不会报错，我没试过，不过如果带上日期，这样的概率就小多了，还是建议带上，这样在搜索引擎抓到页面后，路径上也有个时间，对需要的人也是一种帮助

博客的相关变量取值

| 变量           | 说明                                   |
|----------------|----------------------------------------|
| `post.title`   | 博客title                              |
| `post.content` | 博客内容，已经将markdown转成html的内容 |
| `post.url`     | 博客地址，就是访问详情的地址           |
{: .table.table-bordered }

## 博客简介

可以在 `_config.yml` 里配置一个 `excerpt_separator: "\n\n\n\n"` 这里配置了四个换行，也可以换成其它的分割符号，然后在博客原文件里要分割的位置加上四个换行，就可以在列表里看到分割部分的内容了，这样如果一篇博客比较长的话，可以在博客前面写上简介，分割一下，看起来好看的多

## 列表分页

在 `_config.yml` 里配置上

```yml
gems: [jekyll-paginate]
paginate: 6
```

`paginate` 是每页要显示的条数

这样在页面里遍历就可以用 `paginator.posts` 来获取分页列表，如下

![](https://tomoya92.github.io/assets/QQ图片20170603152948.png)

|变量                           | 说明|
|-------------------------------|-----------------|
|`paginator.previous_page`      | 是否有前一页|
|`paginator.next_page`          | 是否有上一页|
|`paginator.page`               | 当前页|
|`paginator.total_pages`        | 总页数|
|`paginator.previous_page_path` | 前一页的路径地址|
|`paginator.next_page_path`     | 后一页的路径地址|
{: .table.table-bordered }

分页地址是 `/page + num` 比如 `/page1` 表示第一页 `/page4` 表示第4页，所以最后一页就是 `/page{{ paginator.total_pages }}`

## 模板语法

只介绍两种 `if` `for`

if用法

![](https://tomoya92.github.io/assets/QQ截图20170603153032.png)

for用法

![](https://tomoya92.github.io/assets/QQ图片20170603152948.png)

另外 for 里还可以设置偏移量，类似分页功能

![](https://tomoya92.github.io/assets/QQ截图20170603153010.png)

## Github Pages托管

将开发好的代码都push到github上就可以了，怎么push，可以百度一下，也可以fork本博客来改

## 注意事项

博客的文件名必须要写成 `YEAR-MONTH-DAY-TITLE.md` 就是 `年-月-日-名称.md` 如果不是这个，它不能解析

## 参考

本博客就是基于jekyll写的，所有上面提到的，在这个博客里都可以找到

- [jekyll官网](http://jekyllrb.com/)
- [How to use Liquid Syntax in Jekyll?](https://blog.webjeda.com/jekyll-liquid/)
