---
layout: post
title: RestTemplate下载阿里云OSS文件403错误
date: 2022-02-24 09:55:00
categories: java学习笔记
tags: resttemplate
author: 朋也
---

* content
{:toc}





## GET请求

```java
@Test
public void test() {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity entity = new HttpEntity(headers);

    ResponseEntity<String> exchange = restTemplate.exchange("http://baidu.com/s?wd=朋也的博客", HttpMethod.GET, entity, String.class);
    System.out.println(exchange.getBody());
}
```

## POST请求

**表单方式传参**

```java
@Test
public void test() {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    Map<String, String> body = new HashMap<>();
    body.put("username", "张三");
    body.put("password", "123123");

    HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

    ResponseEntity<String> exchange = restTemplate.exchange("http://localhost:8080/login", HttpMethod.POST, entity, String.class);
    System.out.println(exchange.getBody());
}
```

**json方式传参**

```java
@Test
public void test() {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    String body = "{" +
            "\"username\": \"张三\"," +
            "\"password\": \"123123\"" +
            "}";

    HttpEntity<String> entity = new HttpEntity<>(body, headers);

    ResponseEntity<String> exchange = restTemplate.exchange("http://localhost:8080/login", HttpMethod.POST, entity, String.class);
    System.out.println(exchange.getBody());
}
```

## 下载文件

```java
@Test
public void test() {
    RestTemplate restTemplate = new RestTemplate();
    RequestCallback requestCallback = request -> {
        HttpHeaders headers = request.getHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36");
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
    };
    restTemplate.execute(URL.decode("https://i.imgur.com/ljhxsA4.png"),
            HttpMethod.GET, requestCallback, response -> {
                HttpHeaders headers = response.getHeaders();
                MediaType mediaType = headers.getContentType();
                String suffix = mediaType.getSubtype();
                Files.copy(response.getBody(), Paths.get("D:/abcd." + suffix));
                return null;
            });
}
```
