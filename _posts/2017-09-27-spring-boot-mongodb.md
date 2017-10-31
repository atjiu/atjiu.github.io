---
layout: post
title: spring-boot项目里的MongoDB的用法
categories: spring-boot学习笔记
tags: spring-boot mongodb
author: 朋也
---

* content
{:toc}

> 前言：MySQL数据库很好用，但数据量到了千万以上了，想增加字段是非常痛苦的，这个在MongoDB里就不存在，字段想怎么加就怎么加，所以也就有了想在spring-boot里用MongoDB的想法了，Github上spring-projects里有关于使用MongoDB的demo，后面会给出链接





## 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

//还有一个依赖，官方demo里加的有，这个应该是启动的时候帮你下载mongodb数据库的，反正我是没有成功下载下来过，一直timeout，如果系统上装的有mongodb了，就不用要这个依赖了
<dependency>
  <groupId>de.flapdoodle.embed</groupId>
  <artifactId>de.flapdoodle.embed.mongo</artifactId>
</dependency>
```

## 配置

实体类只用加一个@Id就可以了

```java
import org.springframework.data.annotation.Id;

public class User {

  @Id
  private String id;
  private String username;

	// getter, setter
}
```

数据库配置

```yml
spring:
  freemarker:
    template-loader-path:
    - file:./templates
  data:
    mongodb:
      database: dbname #一般只用配置这一个就可以了，如果数据库有密码，还要配置下面几个配置
      host: 
      password:
      uri:
```

Repository要继承的是MongoRepository，跟踪代码可以发现MongoRepository继承的就是PagingAndSortingRepository，所以分页之类的一些简单的方法也是可以直接拿来用的，非常方便

```java
public interface UserRepository extends MongoRepository<User, String> {
  User findByUsername(String username);
}
```

spring-data怎么用，这里就怎么用

## 关联

MongoDB在spring-boot里没法做关联，所以用MySQL做关联的 @ManyToOne 这些注解也就不能用了

经我测试，如果在Blog实体类里引入User对象，在保存Blog的时候，User对象也会保存在Blog里，如下所示

```json
{ 
  "_id" : ObjectId("59cb127b23d8213c8dfdcad9"), 
  "_class" : "com.example.module.blog.model.Blog", 
  "title" : "hello world", 
  "content" : "hello world", 
  "inTime" : ISODate("2017-09-27T02:52:43.713+0000"), 
  "user" : {
    "_id" : ObjectId("59cb0fec23d8213930c6795a"), 
    "username" : "tomoya", 
    "inTime" : ISODate("2017-09-27T02:41:48.402+0000")
  }
}
```

如果修改User的username，只会修改user表里的username，blog表里的user对象里的username是不会变的，所以这里建议关联只给一个id，在查询的时候用id去查user，再封装到一块比较好

## 参考

- [https://github.com/spring-projects/spring-boot/tree/master/spring-boot-samples/spring-boot-sample-data-mongodb](https://github.com/spring-projects/spring-boot/tree/master/spring-boot-samples/spring-boot-sample-data-mongodb)

