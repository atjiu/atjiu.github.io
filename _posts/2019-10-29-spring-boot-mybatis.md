---
layout: post
title: springboot项目集成mybatis
date: 2019-10-29 14:52:00
categories: spring-boot学习笔记
tags: java
author: 朋也
---

* content
{:toc}

之间写过一篇 [最全的Spring-Boot集成Mybatis-Plus教程](https://atjiu.github.io/2019/04/15/spring-boot-mybatis-plus-tutorial/)

突然发现不会配置单纯的mybatis了，稍微折腾了一下






## 创建项目

创建springboot项目，只选择mybatis和mysql两个依赖

pom.xml

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
  </dependency>
  <dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.1</version>
  </dependency>

  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

## 数据库配置

数据源配置

```yml
spring:
  datasource:
    url: jdbc:mysql://192.168.16.87:3306/pybbs?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: 123123
```

表结构及数据

```sql
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

表数据

```sql
INSERT INTO `user` (`id`, `username`)
VALUES
	(1, 'tomoya'),
	(2, '朋也');
```

## 实体类mapper

User.java

```java
public class User {

  private Integer id;
  private String username;

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @Override
  public String toString() {
    return "User{" +
        "id=" + id +
        ", username='" + username + '\'' +
        '}';
  }
}
```

文链接原: [https://atjiu.github.io/2019/10/29/spring-boot-mybatis/](https://atjiu.github.io/2019/10/29/spring-boot-mybatis/)

UserMapper.java

```java
@Mapper
public interface UserMapper {

  // 注解方式查询
  @Select("select * from user;")
  List<User> selectAll();

  // 注解带参数方式 通过 ${} 接收参数
  @Delete("delete from user where username = '${username}'")
  void deleteByUsername(@Param("username") String username);

  // 使用 #{} 接收参数，如果是单一的参数可以不用加 @Param 注解，如果是对象或者多个参数，就需要加上 @Param 注解
  @Select("select * from user where id = #{user.id}")
  void selectById(@Param("user") User user);
  @Select("select * from user where id = #{user.id} and username = #{username}")
  void selectByIdAndUsername(@Param("id") Integer id, @Param("username") String username);

  // xml方式查询
  List<User> selectAllWithXml();

}
```

> **如果使用 ${} 接收字符串参数，还需要在外面加上引号 '${xxx}' 如果是 #{} 接收字符串参数则可以不用加引号**

UserMapper.xml **注意：这个xml文件我放在了 src/resources/mapper/UserMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.multipledatasource.mapper.UserMapper">
  <resultMap id="baseResultMap" type="com.example.multipledatasource.model.User">
    <result column="id" property="id"/>
    <result column="username" property="username"/>
  </resultMap>

  <select id="selectAllWithXml" resultMap="baseResultMap">
    select *
    from user;
  </select>
</mapper>
```

最后配置启动时扫描 *Mapper.xml 文件

application.yml

```xml
mybatis:
  mapper-locations: classpath:mapper/*Mapper.xml
```

## 测试

```java
@SpringBootTest
public class MultipleDatasourceApplicationTests {

  @Autowired
  private UserMapper userMapper;

  @Test
  void contextLoads() {
    List<User> users = userMapper.selectAll();
    for (User user : users) {
      System.out.println(user.toString());
    }

    System.out.println("=========================");

    List<User> users1 = userMapper.selectAllWithXml();
    for (User user : users1) {
      System.out.println(user.toString());
    }
  }

}
```

运行结果

```log
User{id=1, username='tomoya'}
User{id=2, username='朋也'}
=========================
User{id=1, username='tomoya'}
User{id=2, username='朋也'}
```
