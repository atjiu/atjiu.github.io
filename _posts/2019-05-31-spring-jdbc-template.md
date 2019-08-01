---
layout: post
title: 总结一下spring中的JdbcTemplate的CRUD用法
date: 2019-05-31 18:03:00
categories: spring-boot学习笔记
tags: spring-boot
author: 朋也
---

* content
{:toc}

jpa做的项目，当条件查询多起来，还不固定的时候，查询方法就不好写了，又不好改成mybatis，那么JdbcTemplate将是个不错的选择





表结构

```sql
CREATE TABLE `book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
```

对应的实体类

```java
public class Book implements Serializable {

    private Integer id;
    private String name;
    private String category;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}
```

我这环境是spring-boot项目，依赖如下

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
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

文原接链: [https://blog.yiiu.co/2019/05/31/spring-jdbc-template/](https://blog.yiiu.co/2019/05/31/spring-jdbc-template/)

CRUD 用法

```java

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class JdbctemplateDemoApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 保存数据
    @Test
    public void save() {
        String sql = "insert into book (name, category) values (?, ?)";
        int update = jdbcTemplate.update(sql, "Spring", "java");
        System.out.println(update);
    }

    // 批量保存数据
    @Test
    public void batchSave() {
        String sql = "insert into book (name, category) values (?, ?)";
        List<Object[]> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Object[] objects = new Object[2];
            objects[0] = "Spring" + i;
            objects[1] = "java";
            list.add(objects);
        }
        int[] update = jdbcTemplate.batchUpdate(sql, list);
        for (int i = 0; i < update.length; i++) {
            System.out.println(update[i]);
        }
    }

    // 根据条件更新
    @Test
    public void update() {
        String sql = "update book set category = ? where name = ?";
        int update = jdbcTemplate.update(sql, "Java", "Spring");
        System.out.println(update);
    }

    // 批量更新
    @Test
    public void batchUpdate() {
        String sql = "update book set category = ? where name = ?";
        List<Object[]> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Object[] objects = new Object[2];
            objects[0] = "Java";
            objects[1] = "Spring" + i;
            list.add(objects);
        }
        int[] update = jdbcTemplate.batchUpdate(sql, list);
        for (int i = 0; i < update.length; i++) {
            System.out.println(update[i]);
        }
    }

    // 根据id查询book对象
    @Test
    public void queryForObject() {
        String sql = "select * from book where id = ?";
        Book book = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Book.class), 1);
        System.out.println(book);
    }

    // 查询数量
    @Test
    public void queryForInt() {
        String sql = "select count(1) from book";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        System.out.println(count);
    }

    // 查询返回列表（定义好的bean）
    // 如果不指定new BeanPropertyRowMapper<>(Book.class)则返回List<Map<String, Object>>格式的数据
    @Test
    public void queryForList() {
        String sql = "select * from book where category = ?";
        // queryForList() 方法没法返回自定义的bean列表，不过用这个query方法可以
        List<Book> books = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Book.class), "Java");
        System.out.println(books);
    }

    // 根据id删除
    @Test
    public void delete() {
        String sql = "delete from book where id = ?";
        int update = jdbcTemplate.update(sql, 1);
        System.out.println(update);
    }

    // 批量删除
    @Test
    public void batchDelete() {
        String sql = "delete from book where id = ?";
        List<Object[]> list = new ArrayList<>();
        for (int i = 2; i < 7; i++) {
            Object[] objects = new Object[1];
            objects[0] = i;
            list.add(objects);
        }
        int[] update = jdbcTemplate.batchUpdate(sql, list);
        for (int i = 0; i < update.length; i++) {
            System.out.println(update[i]);
        }
    }

}
```