---
layout: post
title: Sharding-Sphere-JDBC水平分表，分库例子
date: 2020-06-03 15:45:00
categories: sharding-sphere学习笔记
tags: sharding-sphere
author: 朋也
---

* content
{:toc}

目的：根据用户id奇偶判断存入哪张user表？根据user.age判断存入哪个库中




## 水平分表

- 创建springboot项目
- 引入依赖

链文接原: [https://tomoya92.github.io/2020/06/03/sharding-sphere-horizontal-split](https://tomoya92.github.io/2020/06/03/sharding-sphere-horizontal-split/)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
        <exclusions>
            <exclusion>
                <groupId>org.junit.vintage</groupId>
                <artifactId>junit-vintage-engine</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.3.2</version>
    </dependency>
    <!--https://mvnrepository.com/artifact/org.apache.shardingsphere/sharding-jdbc-spring-boot-starter-->
    <dependency>
        <groupId>org.apache.shardingsphere</groupId>
        <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
        <version>4.1.0</version>
    </dependency>

</dependencies>
```

- 添加配置文件

```prop
# 指定数据源名，如果有两个，用逗号隔开 如：ds0,ds1，相应的下面也要配置上ds1的连接地址
spring.shardingsphere.datasource.names=ds0
# 配置数据源
spring.shardingsphere.datasource.ds0.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.ds0.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds0.jdbc-url=jdbc:mysql://localhost:3306/test?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds0.username=root
spring.shardingsphere.datasource.ds0.password=123123
# 指定表名规则
spring.shardingsphere.sharding.tables.user.actual-data-nodes=ds0.user_$->{0..1}
spring.shardingsphere.sharding.tables.user.table-strategy.inline.sharding-column=id
spring.shardingsphere.sharding.tables.user.table-strategy.inline.algorithm-expression=user_$->{id % 2}
# 指定user表主键名以及主键生成策略SNOWFLAKE(雪花算法)
spring.shardingsphere.sharding.tables.user.key-generator.column=id
spring.shardingsphere.sharding.tables.user.key-generator.type=SNOWFLAKE
# 打印sql
spring.shardingsphere.props.sql.show=true
```

- 创建表， user_0,user_1 表结构一样

```sql
CREATE TABLE `user_0` (
  `id` bigint(20) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

- 配置mybatisplus

链文接原: [https://tomoya92.github.io/2020/06/03/sharding-sphere-horizontal-split](https://tomoya92.github.io/2020/06/03/sharding-sphere-horizontal-split/)

```java
import lombok.Data;

import java.io.Serializable;

@Data
public class User implements Serializable {

    private Long id;
    private String username;
    private int age;
}
```

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.shardingspheredemo.entity.User;

public interface UserMapper extends BaseMapper<User> {
}
```

```java
@SpringBootApplication
@MapperScan("com.example.shardingspheredemo.mapper")
public class ShardingSphereDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShardingSphereDemoApplication.class, args);
    }

}
```

- 测试方法

```java
@SpringBootTest
class ShardingSphereDemoApplicationTests {

    @Autowired
    private UserMapper userMapper;

    Random random = new Random();

    @Test
    void addUser() {
        for (int i = 0; i < 10; i++) {
            User user = new User();
            user.setUsername("user_" + i);
            user.setAge(random.nextInt(100));
            userMapper.insert(user);
        }
    }

    @Test
    void listUser() {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.lambda().gt(User::getAge, 20).orderByAsc(User::getUsername);
        System.out.println(userMapper.selectList(wrapper));
    }

}
```

----

## 水平分库

分库配置，两个库分别是：test, test1，每个库中都有user_0,user_1两张表，结构都一样

配置文件

```prop
# 指定数据源名，如果有两个，用逗号隔开 如：ds0,ds1，相应的下面也要配置上ds1的连接地址
spring.shardingsphere.datasource.names=ds0,ds1
# 配置数据源
spring.shardingsphere.datasource.ds0.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.ds0.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds0.jdbc-url=jdbc:mysql://localhost:3306/test?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds0.username=root
spring.shardingsphere.datasource.ds0.password=123123
# ds1
spring.shardingsphere.datasource.ds1.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.ds1.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds1.jdbc-url=jdbc:mysql://localhost:3306/test1?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds1.username=root
spring.shardingsphere.datasource.ds1.password=123123
# 指定表名规则
spring.shardingsphere.sharding.tables.user.actual-data-nodes=ds$->{0..1}.user_$->{0..1}
spring.shardingsphere.sharding.tables.user.table-strategy.inline.sharding-column=id
spring.shardingsphere.sharding.tables.user.table-strategy.inline.algorithm-expression=user_$->{id % 2}
# 指定user表主键名以及主键生成策略SNOWFLAKE(雪花算法)
spring.shardingsphere.sharding.tables.user.key-generator.column=id
spring.shardingsphere.sharding.tables.user.key-generator.type=SNOWFLAKE
# 指定分库条件字段为age
spring.shardingsphere.sharding.default-database-strategy.inline.sharding-column=age
spring.shardingsphere.sharding.default-database-strategy.inline.algorithm-expression=ds$->{age>20?0:1}
# 打印sql
spring.shardingsphere.props.sql.show=true
```

我这里定的策略是，根据age判断，age>20的数据存到ds0里，其它数据存到ds1里，在数据入user表的时候，再根据id判断，偶数的进user_0表，奇数的进user_1表，测试方法跟上面一样

