---
layout: post
title: Elasticsearch6.5.3 rest-client 用法封装
date: 2018-12-21 09:15:00
categories: Elasticsearch学习笔记
tags: spring-boot elasticsearch
author: 朋也
---

* content
{:toc}

> pybbs5.0 框架用的还是spring-boot，但依赖的服务我都尽量的都分开了，比如发邮件，redis缓存等，这一篇来总结一下es的rest-client简单用法
>
> 下面内容全部来自官方文档总结，地址：[https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-getting-started-maven.html](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-getting-started-maven.html)

## 引入依赖

```xml
<dependency>
  <groupId>org.elasticsearch</groupId>
  <artifactId>elasticsearch</artifactId>
  <version>6.5.3</version>
</dependency>
<!-- 高级api里有对文档，索引等的操作api，所以这里引入的是高级的api -->
<dependency>
  <groupId>org.elasticsearch.client</groupId>
  <artifactId>elasticsearch-rest-high-level-client</artifactId>
  <version>6.5.3</version>
</dependency>
```





## 连接ES服务

ES暴露给java的socket端口是9300，不过我这用的是 rest-client 的api，所以自然用的就是http协议的 9200端口了

```java
RestHighLevelClient client = new RestHighLevelClient(
        RestClient.builder(
            new HttpHost("localhost", 9200, "http")));
```

## 创建索引

有了连接，首先要创建索引了，创建索引有两种方式的，一种是不带映射(mapping)的，一种是自定义映射的，下面代码展示

不带映射，让es自动识别字段的类型，并创建相应的映射
```java
@Test
public void createIndex() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  CreateIndexRequest request = new CreateIndexRequest("pybbs");
  request.settings(Settings.builder()
      .put("index.number_of_shards", 1)
      .put("index.number_of_shards", 5));

  CreateIndexResponse response = client.indices().create(request, RequestOptions.DEFAULT);

  log.info(response.toString());
  System.out.println(response.isAcknowledged()); // 索引已经存在，则报错
}
```

自定义映射的索引 , 下面自定映射的field名的意思，移步我另一篇博客 [https://blog.yiiu.co/2018/08/24/elasticsearch/](https://blog.yiiu.co/2018/08/24/elasticsearch/) 里面有详细的解释

```java
@Test
public void createIndexWithMapping() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  CreateIndexRequest request = new CreateIndexRequest("pybbs");
  request.settings(Settings.builder()
      .put("index.number_of_shards", 1)
      .put("index.number_of_shards", 5));

  XContentBuilder mappingBuilder = JsonXContent.contentBuilder()
      .startObject()
        .startObject("properties")
          .startObject("title")
            .field("type", "text")
            .field("analyzer", "ik_max_word")
            .field("index", "true")
          .endObject()
          .startObject("content")
            .field("type", "text")
            .field("analyzer", "ik_max_word") // ik_max_word 这个分词器是ik的，可以去github上搜索安装es的ik分词器插件
            .field("index", "true")
          .endObject()
        .endObject()
      .endObject();
  request.mapping("topic", mappingBuilder);

  CreateIndexResponse response = client.indices().create(request, RequestOptions.DEFAULT);

  log.info(response.toString());
  System.out.println(response.isAcknowledged());
}
```

## 验证映射存在

项目有时候会重启，不能每次重启都创建一次映射，这就需要用到判断映射是否存在了，存在就不创建了，不存在再创建，这样就不会报错了，具体代码如下

```java
@Test
public void existIndex() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  GetIndexRequest request = new GetIndexRequest();
  request.indices("pybbs");
  request.local(false);
  request.humanReadable(true);

  boolean exists = client.indices().exists(request, RequestOptions.DEFAULT);

  log.info("result: {}", exists);
}
```

## 删除映射

映射创建错了，要删除咋办，看下面

```java
@Test
public void deleteIndex() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  DeleteIndexRequest request = new DeleteIndexRequest("pybbs");
  request.indicesOptions(IndicesOptions.LENIENT_EXPAND_OPEN);

  AcknowledgedResponse response = client.indices().delete(request, RequestOptions.DEFAULT);

  log.info("result: {}", response.isAcknowledged());
}
```

## 创建/更新文档

有了映射，就可以创建文档了，下面先来创建一个简单的文档

```java
@Test
public void createDocument() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  Map<String, Object> map = new HashMap<>();
  map.put("title", "上海自来水来自海上");

  IndexRequest request = new IndexRequest("pybbs", "topic", "1"); // 这里最后一个参数是es里储存的id，如果不填，es会自动生成一个，个人建议跟自己的数据库表里id保持一致，后面更新删除都会很方便
  request.source(map);
  IndexResponse response = client.index(request, RequestOptions.DEFAULT);
  // not exist: result: code: 201, status: CREATED
  // exist: result: code: 200, status: OK
  log.info("result: code: {}, status: {}", response.status().getStatus(), response.status().name());
}
```

如果创建文档自己指定id了，而且这个id已经在es里存在了，那么es会将这个id的数据执行更新操作，就是相当于更新数据了

不过更新文档也有自己的api，如下

```java
@Test
public void updateDocument() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  UpdateRequest request = new UpdateRequest("pybbs", "topic", "1");
  Map<String, Object> map = new HashMap<>();
  map.put("title", "title 22");
  request.doc(map);

  UpdateResponse response = client.update(request, RequestOptions.DEFAULT);
  // exist: result: code: 200, status: OK
  // not exist: ERROR
  log.info("result: code: {}, status: {}", response.status().getStatus(), response.status().name());
}
```

从返回值看，更新的文档如果不存在的话，会报错，这样看来，还不如全都用创建文档的api了，如果文档不存在，它就直接创建了，不会报错

## 批量创建文档

一个一个的创建文档有些不爽，数据量大的时候，特别费时间，有没有批量的操作呢？有！

```java
@Test
public void bulkDocument() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  BulkRequest requests = new BulkRequest();

  Map<String, Object> map1 = new HashMap<>();
  map1.put("title", "我是中国人");
  IndexRequest request1 = new IndexRequest("pybbs", "topic", "1");
  request1.source(map1);
  requests.add(request1);

  Map<String, Object> map2 = new HashMap<>();
  map2.put("title", "武汉市长江大桥欢迎您");
  IndexRequest request2 = new IndexRequest("pybbs", "topic", "2");
  request2.source(map2);
  requests.add(request2);

  Map<String, Object> map3 = new HashMap<>();
  map3.put("title", "上海自来水来自海上");
  IndexRequest request3 = new IndexRequest("pybbs", "topic", "3");
  request3.source(map3);
  requests.add(request3);

  BulkResponse responses = client.bulk(requests, RequestOptions.DEFAULT);
  // not exist: result: code: 200, status: OK
  // exist: result: code: 200, status: OK
  log.info("result: code: {}, status: {}", responses.status().getStatus(), responses.status().name());
}
```

批量操作也跟创建文档一样，存在就更新，不存在就创建，不会报错

## 删除文档

上面说到的，最好自己指定id，不要让es自动生成id，这里就派上用场了

```java
@Test
public void deleteDocument() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  for (int i = 1; i <= 10; i++) {
    DeleteRequest request = new DeleteRequest("pybbs", "topic", String.valueOf(i));

    DeleteResponse response = client.delete(request, RequestOptions.DEFAULT);
    // exist: result: code: 200, status: OK
    // not exist: result: code: 404, status: NOT_FOUND
    log.info("result: code: {}, status: {}", response.status().getStatus(), response.status().name());
  }
}
```

## 查询文档

前面做了那么多，就为了这一步，我上面给es安装了ik插件，所以这里对中文分词做个测试

先说明一下，查询的api有很多个 `matchQuery()` `termQuery()` `fuzzyQuery()` 等等，都啥意思，参见上面我另一篇博客的链接

```java
@Test
public void searchDocument() throws IOException {
  RestHighLevelClient client = new RestHighLevelClient(
      RestClient.builder(
          new HttpHost("localhost", 9200, "http")));

  SearchRequest request = new SearchRequest("pybbs");
  SearchSourceBuilder builder = new SearchSourceBuilder();
  builder.query(QueryBuilders.matchQuery("title", "江大桥来自中国从武汉到上海喝中国人的自来水"));
  // builder.from(0).size(2); // 分页
  request.source(builder);

  SearchResponse response = client.search(request, RequestOptions.DEFAULT);
  log.info(response.toString(), response.getTotalShards());
  for (SearchHit documentFields : response.getHits()) {
    log.info("result: {}, code: {}, status: {}", documentFields.toString(), response.status().getStatus(), response.status().name());
  }
}
```

执行输出结果

```log
09:42:47.766 YIIU [main] INFO  co.yiiu.pybbs.PybbsApplicationTests - {"took":4,"timed_out":false,"_shards":{"total":5,"successful":5,"skipped":0,"failed":0},"hits":{"total":3,"max_score":2.6610591,"hits":[{"_index":"pybbs","_type":"topic","_id":"3","_score":2.6610591,"_source":{"title":"上海自来水来自海上"}},{"_index":"pybbs","_type":"topic","_id":"2","_score":1.4384104,"_source":{"title":"武汉市长江大桥欢迎您"}},{"_index":"pybbs","_type":"topic","_id":"1","_score":1.4384104,"_source":{"title":"我是中国人"}}]}}
09:42:47.773 YIIU [main] INFO  co.yiiu.pybbs.PybbsApplicationTests - result: {
  "_index" : "pybbs",
  "_type" : "topic",
  "_id" : "3",
  "_score" : 2.6610591,
  "_source" : {
    "title" : "上海自来水来自海上"
  }
}, code: 200, status: OK
09:42:47.773 YIIU [main] INFO  co.yiiu.pybbs.PybbsApplicationTests - result: {
  "_index" : "pybbs",
  "_type" : "topic",
  "_id" : "2",
  "_score" : 1.4384104,
  "_source" : {
    "title" : "武汉市长江大桥欢迎您"
  }
}, code: 200, status: OK
09:42:47.773 YIIU [main] INFO  co.yiiu.pybbs.PybbsApplicationTests - result: {
  "_index" : "pybbs",
  "_type" : "topic",
  "_id" : "1",
  "_score" : 1.4384104,
  "_source" : {
    "title" : "我是中国人"
  }
}, code: 200, status: OK
```

## 结语

spring-boot不是都内置好了吗？只需要引个依赖，加几个注解就可以用了呀，为啥要自己费劲封装一遍呢？

目的就是为了跟spring-boot解耦，如果使用spring-boot内置的，引入依赖就要在 `application.yml` 里配置es服务的连接地址，但网站有时候不想开启es怎么办？每次启动就相当的麻烦了，所以分开操作才是王道

内置了确实对新手友好了，入门门坎低了，但相应的也带来了臃肿的体积，适当的折腾可以让程序更灵活，何乐而不为呢！

希望本篇博客能帮到正在折腾的你，**转载的请务必注明来源**，谢谢！！
