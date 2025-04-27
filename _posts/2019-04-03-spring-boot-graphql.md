---
layout: post
title: GraphQL入门，在Spring-Boot项目中使用GraphQL风格的接口
date: 2019-04-03 14:02:00
categories: spring-boot学习笔记
tags: spring-boot graphql
author: 朋也
---

* content
{:toc}

一直对graphql挺好奇的，都说这货是前端使用`json`来查询数据，后端只要把graphql风格的接口开发好了，schema定义的没问题，后面前端想怎么改数据结构就怎么改，完全不用后端操心了，今天折腾了一下，算是入门了，分享给大家

## 几个问题

### graphql是什么框架？

它不是框架，而是一种风格，类似于 restful 风格的接口一样，所以它有各种语言版本的实现，本篇文章用的就是java语言实现的

### graphql接口的数据哪来的？

数据还是通过数据库查询的，无论你用的是hibernate还是mybatis，跟graphql都没有关系，该怎么查数据还怎么查就行

### 为什么在调用graphql接口的时候，定义的schema里有其它对象，那其它对象里数据是怎么来的？

比如Book对象里有Author对象，显示书的作者信息，那么前端在调用时定义了Book对象里也要显示Author的信息，这个数据的嵌套加载是在后端通过代码实现的

首先查询出Book对象，然后根据Book对象里的authorId再查询一次Author数据，然后封装到Book对象里，这样前端拿到的json对象里就有两个对象的数据了

说白了，数据还是要通过orm框架查询的，只是将不同数据封装到一个对象里的这步被graphql-java这个框架做了






## 创建项目

使用idea创建一个springboot项目，依赖选择一个 web 就可以了

pom.xml
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

另外引入两个graphql相关的依赖

原链文接：[https://atjiu.github.io/2019/04/03/spring-boot-graphql/](https://atjiu.github.io/2019/04/03/spring-boot-graphql/)

```xml
<dependency>
  <groupId>com.graphql-java</groupId>
  <artifactId>graphql-java</artifactId>
  <version>11.0</version>
</dependency>
<dependency>
  <groupId>com.graphql-java</groupId>
  <artifactId>graphql-java-spring-boot-starter-webmvc</artifactId>
  <version>1.0</version>
</dependency>
```

最后再依赖一个guava，这个工具可以很方便的创建集合

```xml
<dependency>
  <groupId>com.google.guava</groupId>
  <artifactId>guava</artifactId>
  <version>27.0-jre</version>
</dependency>
```

## 定义schema

在项目的 resources 目录下创建文件 `schema.graphqls`，然后写上下面配置

```
# 定义查询方法
type Query {
  bookById(id: ID): Book
}

# 定义Book对象的结构
type Book {
  id: ID
  name: String
  pageCount: Int
  author: Author
  category: Category
}

# 定义Category对象的结构
type Category {
  id: ID
  name: String
}

# 定义Author对象的结构
type Author {
  id: ID
  firstName: String
  lastName: String
}
```

Book里有Author对象和Category两个关联对象

链原文接：[https://atjiu.github.io/2019/04/03/spring-boot-graphql/](https://atjiu.github.io/2019/04/03/spring-boot-graphql/)

## 初始化schema

创建类 `GraphQLProvider.java`

```java
@Component
public class GraphQLProvider {

  private GraphQL graphQL;
  @Autowired
  GraphQLDataFetchers graphQLDataFetchers;

  @Bean
  public GraphQL graphQL() {
    return graphQL;
  }

  @PostConstruct
  public void init() throws IOException {
    URL url = Resources.getResource("schema.graphqls");
    String sdl = Resources.toString(url, Charsets.UTF_8);
    // 构建schema
    GraphQLSchema graphQLSchema = buildSchema(sdl);
    this.graphQL = GraphQL.newGraphQL(graphQLSchema).build();
  }

  // 构建schema
  private GraphQLSchema buildSchema(String sdl) {
  }
}
```

在构建schema之间，先把数据获取方法都写好，到时候一块组装就可以了

## 数据查询

创建 `GraphQLDataFetchers.java`

```java
@Component
public class GraphQLDataFetchers {

  // 初始化一些数据，这些数据可以从数据库里查询出来
  // 创建books集合
  private static List<Map<String, String>> books = Arrays.asList(
      ImmutableMap.of("id", "book-1",
          "name", "Harry Potter and the Philosopher's Stone",
          "pageCount", "223",
          "authorId", "author-1",
          "categoryId", "category-2"),
      ImmutableMap.of("id", "book-2",
          "name", "Moby Dick",
          "pageCount", "635",
          "authorId", "author-2",
          "categoryId", "category-1"),
      ImmutableMap.of("id", "book-3",
          "name", "Interview with the vampire",
          "pageCount", "371",
          "authorId", "author-3")
  );

  // 创建authors集合
  private static List<Map<String, String>> authors = Arrays.asList(
      ImmutableMap.of("id", "author-1",
          "firstName", "Joanne",
          "lastName", "Rowling"),
      ImmutableMap.of("id", "author-2",
          "firstName", "Herman",
          "lastName", "Melville"),
      ImmutableMap.of("id", "author-3",
          "firstName", "Anne",
          "lastName", "Rice")
  );

  // 创建categories集合
  private static List<Map<String, String>> categories = Arrays.asList(
      ImmutableMap.of("id", "category-1",
          "name", "Programmer"),
      ImmutableMap.of("id", "category-2",
          "name", "Science"),
      ImmutableMap.of("id", "category-3",
          "name", "History")
      );

  // 根据bookId获取book对象数据
  public DataFetcher getBookByIdDataFetcher() {
    return dataFetchingEnvironment -> {
      String bookId = dataFetchingEnvironment.getArgument("id");
      return books
          .stream()
          .filter(book -> book.get("id").equals(bookId))
          .findFirst()
          .orElse(null);
    };
  }

  // 从book对象里拿到authorId，然后再获取Author对象数据
  public DataFetcher getAuthorDataFetcher() {
    return dataFetchingEnvironment -> {
      Map<String, String> book = dataFetchingEnvironment.getSource();
      String authorId = book.get("authorId");
      return authors
          .stream()
          .filter(author -> author.get("id").equals(authorId))
          .findFirst()
          .orElse(null);
    };
  }

  // 从book对象里拿到categoryId，然后再获取Category对象数据
  public DataFetcher getCategoryDataFetcher() {
    return dataFetchingEnvironment -> {
      Map<String, String> book = dataFetchingEnvironment.getSource();
      String categoryId = book.get("categoryId");
      return categories
          .stream()
          .filter(category -> category.get("id").equals(categoryId))
          .findFirst()
          .orElse(null);
    };
  }
}
```

## 构建schema

原链文接：[https://atjiu.github.io/2019/04/03/spring-boot-graphql/](https://atjiu.github.io/2019/04/03/spring-boot-graphql/)

上面初始化了schema，这一步来构建schema，通过在 `schema.graphqls` 里定义的 `Query` 里的方法来构建，代码如下

GraphQLProvider
```java
// 通过从配置文件里加载的schema来构建GraphQLSchema
private GraphQLSchema buildSchema(String sdl) {
  TypeDefinitionRegistry typeRegistry = new SchemaParser().parse(sdl);
  RuntimeWiring runtimeWiring = buildWiring();
  SchemaGenerator schemaGenerator = new SchemaGenerator();
  return schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);
}

private RuntimeWiring buildWiring() {
  return RuntimeWiring.newRuntimeWiring()
      // 指定Query对象里定义的方法如何实现
      .type(newTypeWiring("Query")
          .dataFetcher("bookById", graphQLDataFetchers.getBookByIdDataFetcher()))
      // 指定Book对象里定义的对象如何查询
      .type(newTypeWiring("Book")
          .dataFetcher("author", graphQLDataFetchers.getAuthorDataFetcher())
          .dataFetcher("category", graphQLDataFetchers.getCategoryDataFetcher()))
      .build();
}
```

## 测试

推荐安装一个工具 `graphql-playground` 开源地址：[https://github.com/prisma/graphql-playground](https://github.com/prisma/graphql-playground), 安装好后，打开，输入地址：[http://localhost:8080](http://localhost:8080)，就可以进行测试了

![](/assets/images/QQ20190403-152357.png)

## 参考

- [https://www.graphql-java.com/documentation/v12/getting-started/](https://www.graphql-java.com/documentation/v12/getting-started/)

## 总结

这只是一篇graphql的入门文章，现在还有几个疑问：

- 这货怎么发送post请求（提交数据）？
- 鉴权怎么实现呢？比如验证用户是否登录？
- 删除数据，分页等都怎么实现呢？

继续折腾~

写博客不易，转载请保留原文链接，谢谢!