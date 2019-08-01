---
layout: post
title: GraphQL风格的接口发送GET、POST请求
date: 2019-04-06 17:34:00
categories: spring-boot学习笔记
tags: spring-boot graphql
author: 朋也
---

* content
{:toc}

> [上一篇](https://blog.yiiu.co/2019/04/03/spring-boot-graphql/) 博客最后留下了几个问题，其中有一个是graphql风格接口怎么发送post请求保存数据，这一篇来介绍一下方法

## 准备环境

graphql风格接口的搭建可以看 [上一篇](https://blog.yiiu.co/2019/04/03/spring-boot-graphql/) 博客，这里不多说

既然要保存数据，这篇博客是在上一篇博客的基础了将数据源改成了jpa从数据库里查询的了，这一块不多说






## 请求

上一篇最后测试用的是 `graphql-playground` 工具测试的，其实是不知道它背后怎么发送的请求

那么graphql风格接口使用传统的调用接口的方式，链接应该是怎么样的呢？

GET和POST都一样: `http://localhost:8080/graphql?query={bookById(id: 1) {id,name, pageCount, author{id, name}, category {id, name}}}`

就一个参数 `query` 后面的内容就是使用 `graphql-playground` 工具测试写的内容了，知道怎么写的了，其它的比如鉴权，删除都会了，下面给一个例子

## 定义Query

既然要添加post请求，肯定要在schema里定义一个query方法

```
type Query {
  bookById(id: ID): Book
  books: [Book],
  # 保存数据的接口
  bookSave(name: String, pageCount: Int, authorId: Int, categoryId: Int): Book
}
```

## 实现

在 `GraphQLProvider`类里修改方法 `buildWiring()` 内容

```java
private RuntimeWiring buildWiring() {
  return RuntimeWiring.newRuntimeWiring()
      // 指定Query对象里定义的方法如何实现
      .type(newTypeWiring("Query")
          .dataFetcher("books", graphQLDataFetchers.getBooksDataFetcher())
          .dataFetcher("bookById", graphQLDataFetchers.getBookByIdDataFetcher())
          // 定义bookSave方法的实现方式
          .dataFetcher("bookSave", graphQLDataFetchers.saveBookDataFetcher())
      )
      // 指定Book对象里定义的对象如何查询
      .type(newTypeWiring("Book")
          .dataFetcher("author", graphQLDataFetchers.getAuthorDataFetcher())
          .dataFetcher("category", graphQLDataFetchers.getCategoryDataFetcher()))
      .build();
}
```

原链文接：[https://blog.yiiu.co/2019/04/06/graphql-get-post/](https://blog.yiiu.co/2019/04/06/graphql-get-post/)

另外在类 `GraphQLDataFetchers` 中添加 `bookSave()` 方法的实现，就是将请求参数里的内容持久化到数据库

```java
public DataFetcher saveBookDataFetcher() {
  return dataFetchingEnvironment -> {
    // 这里getArgument方法返回的是一个泛型T，也就是在schema里定义方法时指定参数的类型是啥，这里就用啥类型接收，不用转换
    // 如果转换这里还会报错
    String name = dataFetchingEnvironment.getArgument("name");
    Integer pageCount = dataFetchingEnvironment.getArgument("pageCount");
    Integer authorId = dataFetchingEnvironment.getArgument("authorId");
    Integer categoryId = dataFetchingEnvironment.getArgument("categoryId");
    // 调用jpa save方法，将数据入库
    return bookService.save(name, pageCount, authorId, categoryId);
  };
}
```

## 测试

直接在postman里发送请求 `http://localhost:8080/graphql?query={bookSave(name: "Node.JS入门与精通", pageCount: 300, authorId: 2, categoryId: 2) {id,name, pageCount, author{id, name}, category {id, name}}}`

返回值

```json
{
    "data": {
        "bookSave": {
            "id": "5",
            "name": "Node.JS入门与精通",
            "pageCount": 300,
            "author": {
                "id": "2",
                "name": "李四"
            },
            "category": {
                "id": "2",
                "name": "文学"
            }
        }
    }
}
```

其实到这里应该就能看出来了，graphql风格接口里貌似没有get, post, put, delete等概念了，这样一想，又有新问题了。。

## 总结

测试中可以看到，get,post请求已经没有那么明显的区别了，那么

- 文件上传怎么办呢？
- 另外还有一点，有没有发现java bean中的属性跟定义的schema是不是很像，那么spring框架有没有对这个做复用的处理方式呢？

继续折腾中。。。

写博客不易，转载请保留原文链接，谢谢!