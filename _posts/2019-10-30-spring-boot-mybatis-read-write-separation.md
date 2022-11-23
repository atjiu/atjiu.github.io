---
layout: post
title: springboot集成mybatis配置主从复制双库实现读写分离
date: 2019-10-30 10:26:00
categories: spring-boot学习笔记
tags: java
author: 朋也
---

* content
{:toc}

一般情况下网站对数据库的读要比写多多了，所以当数据量大了的时候，使用读写分离是很有必要的

spring提供了数据源路由的类，正好拿它来实现一下






## 创建项目

简单的springboot项目，依赖有mybatis，mysql，aspect

springboot版本是 2.2.0.RELEASE

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

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
  </dependency>
</dependencies>
```

## 数据

我测试的两个库，一个主库一个从库，只有一个表，数据如下

```sql
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- 主库的数据

INSERT INTO `user` (`id`, `username`)
VALUES
	(1, 'tomoya'),
	(2, '朋也');

-- 从库的数据

INSERT INTO `user` (`id`, `username`)
VALUES
	(1, 'tomoya');

```

可以看到从库中少了一条数据，这样可以对比看读写分离的功能是否生效了

## 配置

首先就是springboot的双数据源的配置

application.yml

```yml
spring:
  datasource:
    master:
      jdbc-url: jdbc:mysql://192.168.16.87:3306/pybbs?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
      username: root
      password: 123123
      driver-class-name: com.mysql.cj.jdbc.Driver
    slave:
      jdbc-url: jdbc:mysql://192.168.16.109:3306/pybbs?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
      username: root
      password: 123123
      driver-class-name: com.mysql.cj.jdbc.Driver
```

使用java代码来创建两个数据源, 创建类 `MyDataSource.java`

文链接原: [https://atjiu.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/](https://atjiu.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/)

```java
@Configuration
public class MyDataSource {

  // 主库数据源
  @Bean
  @ConfigurationProperties("spring.datasource.master")
  public DataSource masterDataSource() {
    return DataSourceBuilder.create().build();
  }

  // 从库数据源
  @Bean
  @ConfigurationProperties("spring.datasource.slave")
  public DataSource slaveDataSource() {
    return DataSourceBuilder.create().build();
  }

  // 数据源路由
  @Bean
  public DataSource dynamicDatasource() {
    Map<Object, Object> dataSourceMap = new HashMap<>();
    dataSourceMap.put(MultipleDataSourceHelper.MASTER, masterDataSource());
    dataSourceMap.put(MultipleDataSourceHelper.SLAVE, slaveDataSource());
    DynamicDataSource dds = new DynamicDataSource();
    dds.setTargetDataSources(dataSourceMap);
    dds.setDefaultTargetDataSource(masterDataSource());
    return dds;
  }
}
```

其中数据源路由是一个自定义的类，继承了spring提供的类`AbstractRoutingDataSource`，然后实现里面的一个方法`determineCurrentLookupKey()` 即可，这个方法返回的值就是用哪个数据源

查看类`AbstractRoutingDataSource`可以看到，里面有两个变量

- private Map<Object, Object> targetDataSources;
- private Object defaultTargetDataSource;

targetDataSources是一个数据库的map集合，key是自定义的，可以随便指定，value就是配置好的数据源，如下代码

defaultTargetDataSource是默认的数据源，如果指定的key在targetDataSources里没有找到对应的value，那么就会使用这个默认的数据源，防止程序出错

```java
Map<Object, Object> dataSourceMap = new HashMap<>();
dataSourceMap.put(MultipleDataSourceHelper.MASTER, masterDataSource());
dataSourceMap.put(MultipleDataSourceHelper.SLAVE, slaveDataSource());
DynamicDataSource dds = new DynamicDataSource();
dds.setTargetDataSources(dataSourceMap);
dds.setDefaultTargetDataSource(masterDataSource());
```

既然是一个map，value是数据源，那key最好建一个类管理起来比较好

```java
public class MultipleDataSourceHelper {

  public static final String MASTER = "master";
  public static final String SLAVE = "slave";

  private static ThreadLocal<String> contextHolder = new ThreadLocal<>();

  public static void set(String db) {
    contextHolder.set(db);
  }

  public static String get() {
    return contextHolder.get();
  }

}
```

实现数据源路由

```java
public class DynamicDataSource extends AbstractRoutingDataSource {

  @Override
  protected Object determineCurrentLookupKey() {
    return MultipleDataSourceHelper.get();
  }
}
```

可以看到这里动态指定的数据源是从自定义管理key的类中取的，所以要想让CRUD的操作走主库还是从库就只需要改变`MultipleDataSourceHelper` 里的 `contextHolder` 就行了

## mybatis配置

如果是单数据源，利用spring的配置文件就可以了，也就不用单独对mybatis进行配置了，这里数据源我是自己配置的，所以还要单独配置一下mybatis，给它指定一个数据源，如下

```java
@Configuration
public class MyBatisConfig {

  @Autowired
  private DataSource dynamicDatasource;

  @Bean
  public SqlSessionFactory sqlSessionFactory() throws Exception {
    SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
    // 给mybatis指定上面配置好的动态数据源
    sqlSessionFactoryBean.setDataSource(dynamicDatasource);
    // 自己配置mybatis的话，这个必须要指定mapper位置，在application.yml里配置的不会生效了
    sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*Mapper.xml"));
    return sqlSessionFactoryBean.getObject();
  }
}
```

如果用application.yml配置的话，只需要在 Mapper 上加一个注解即可 `@Mapper` 但自己配置的mybatis就要扫包了，在启动类上添加注解 `@MapperScan("com.example.multipledatasource.mapper")`

有了这个注解，Mapper上的 `@Mapper` 就不用要了

## 实体类，mapper

这里我用的实体类mapper跟上一篇博客是一样的，下面再贴一下吧

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

接文链原: [https://atjiu.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/](https://atjiu.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/)

UserMapper.java

```java
//@Mapper
public interface UserMapper {

  // 注解方式查询
  @Select("select * from user;")
  List<User> selectAll();

  // xml方式查询
  List<User> selectAllWithXml();

}
```

UserMapper.xml

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

## 测试

```java
@SpringBootTest
public class MultipleDatasourceApplicationTests {

  @Autowired
  private UserMapper userMapper;

  @Test
  void contextLoads() {
    // 指定使用主库
    MultipleDataSourceHelper.set(MultipleDataSourceHelper.MASTER);
    List<User> users = userMapper.selectAll();
    for (User user : users) {
      System.out.println(user.toString());
    }

    System.out.println("=========================");

    // 指定使用从库
    MultipleDataSourceHelper.set(MultipleDataSourceHelper.SLAVE);
    List<User> users1 = userMapper.selectAllWithXml();
    for (User user : users1) {
      System.out.println(user.toString());
    }
  }

}
```

结果

```log
2019-10-30 10:47:07.438  INFO 26478 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2019-10-30 10:47:07.644  INFO 26478 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
User{id=1, username='tomoya'}
User{id=2, username='朋也'}
=========================
2019-10-30 10:47:07.691  INFO 26478 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Starting...
2019-10-30 10:47:07.738  INFO 26478 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Start completed.
User{id=1, username='tomoya'}
```

## 注解实现

这样手动设置比较麻烦，可以自定义一个注解，在读的方法的上通过注解指定从库查询，在写的方法上使用注解指定写入主库

spring两大思想中的aop可以实现这个功能，首先创建一个切入点类

```java
public class DSPointcut {

  @Pointcut("execution(public * com.example.multipledatasource.mapper.*.*(..))")
  public void selectorDSPointcut() {
  }
}
```

有了切入点了，还少了注解，下面自定义一个注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DSSelector {

  String value();

}
```

在UserMapper.java类里的两个方法上加上相应的注解

```java
//@Mapper
public interface UserMapper {

  // 注解方式查询
  @Select("select * from user;")
  @DSSelector(MultipleDataSourceHelper.MASTER) // 指定从主库查询
  List<User> selectAll();

  // xml方式查询
  @DSSelector(MultipleDataSourceHelper.SLAVE) // 指定从从库查询
  List<User> selectAllWithXml();

}
```

我这写的是两个查询方法，当然也可以是插入，更新，删除，只需要一个注解指定一下就行了

有了注解，有了切入点了，下面就是切入mapper方法执行前去获取这个方法上的注解信息了，然后再去设置MultipleDataSourceHelper，这样就可以实现自动了，代码如下

```java
@Component
@Aspect
public class DSSelectorImpl {

  @Before("com.example.multipledatasource.aspect.DSPointcut.selectorDSPointcut()")
  public void changeDS(JoinPoint joinPoint) {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    Method method = signature.getMethod();
    DSSelector selector = method.getAnnotation(DSSelector.class);
    if (selector == null) return;
    MultipleDataSourceHelper.set(selector.value());
  }
}
```

## 再测试

```java
@SpringBootTest
@EnableAspectJAutoProxy
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

日志

```log
2019-10-30 10:56:11.895  INFO 26991 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2019-10-30 10:56:12.120  INFO 26991 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
User{id=1, username='tomoya'}
User{id=2, username='朋也'}
=========================
2019-10-30 10:56:12.167  INFO 26991 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Starting...
2019-10-30 10:56:12.211  INFO 26991 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Start completed.
User{id=1, username='tomoya'}
```

跟手动指定的结果是一样的
