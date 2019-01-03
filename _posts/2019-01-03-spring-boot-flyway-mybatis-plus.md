---
layout: post
title: Spring-Boot项目集成Flyway和MybatisPlus执行先后问题解决办法
date: 2019-01-03 17:14:00
categories: spring-boot学习笔记
tags: spring-boot flyway mybatis-plus
author: 朋也
---

* content
{:toc}

> 使用mybatis-plus很爽，但没法自动创建数据库和表结构或者一些初始化数据，所以我在自己项目里加上了flyway(数据库迁移工具)，还有一个类似的工具，liquibase,只不过后者用的是xml配置的，flyway直接执行的是sql，相比之下我更喜欢flyway
>
> 但集成flyway跟mybatis-plus却出现了问题，执行先后的问题，下面具体说明

## 引入依赖

不用指定版本号，springboot已经内置了

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
```





## flyway的配置

前言：如果程序里在启动的过程中不使用mybatis-plus去操作数据库，那就直接配置即可，默认flyway就是提前执行的

```yml
spring:
  flyway:
    locations: ["classpath:db/migration"]
    baseline-on-migrate: true
```

flyway的sql文件格式网上很多介绍，这里不多说，在 `src/main/resources/`下创建文件夹 `db` 然后在 `db` 下再创建文件夹 `migration` ，最后将sql文件放在 `migration` 里就可以了

启动项目，可以看到数据库里会多一个表 `flyway_schema_history` 这就算成功了

**但是！！！** 我在程序里把大部分配置都放到数据库里了，也就是说程序启动有些配置要先去查数据库，拿到数据后，再继续配置相关的服务，比如 `shiro` `redis` 等初始化工作，这时候就出问题了，flyway还没有执行，数据库里还没有数据，就开始配置其它的一些服务了，到数据库里查不到数据，配置自然就报错了

## 创建Flyway配置类

一样的，不用springboot内置的flyway配置类了，自己创建一个，就可以指定它在哪个阶段执行了

flyway的配置类非常简单，代码如下

```java
@Configuration
public class FlywayConfig {

  @Autowired
  private DataSource dataSource;

  @PostConstruct
  public void migrate() {
    Flyway flyway = Flyway.configure()
        .dataSource(dataSource)
        .locations("db/migration")
        .baselineOnMigrate(true)
        .load();
    flyway.migrate();
  }

}
```

有了这个，还要把springboot默认的flyway初始化类给去掉 ，配置如下

```java
// 不用默认配置的Flyway，自己配置
@SpringBootApplication(exclude = {
    FlywayAutoConfiguration.class
})
public class PybbsApplication {

  public static void main(String[] args) {
    SpringApplication.run(PybbsApplication.class, args);
  }
}

```

另外其它一些初始化服务的类，比如 `shiroConfig` 的配置类，就可以放在 `mybatisPlusConfig` 后再执行，而 `mybatisPlusConfig` 可以指定在 `flywayConfig` 初始化后再初始化，具体配置如下

MyBatisPlusConfig
```java
@Configuration
@MapperScan("co.yiiu.pybbs.mapper")
public class MybatisPlusConfig {

  @Bean("mybatisSqlSession")
  @DependsOn("flywayConfig") // 这里指定依赖于 flywayConfig 类
  public SqlSessionFactory sqlSessionFactory(@Qualifier("dataSource") DataSource dataSource) throws Exception {
    MybatisSqlSessionFactoryBean sqlSessionFactory = new MybatisSqlSessionFactoryBean();
    MybatisConfiguration configuration = new MybatisConfiguration();
    configuration.setDefaultScriptingLanguage(MybatisXMLLanguageDriver.class);
    configuration.setJdbcTypeForNull(JdbcType.NULL);
    //*注册Map 下划线转驼峰*
    configuration.setObjectWrapperFactory(new MybatisMapWrapperFactory());

    // 添加数据源，官方文档里没有下面这一行，启动一直报错，脑瓜疼。。。
    sqlSessionFactory.setDataSource(dataSource);

    sqlSessionFactory.setConfiguration(configuration);

    // 添加分页插件，这里有个坑
    // 在没有配置Map 下划线转驼峰这个配置之前，配置了上面注释掉的分页插件配置，结果配置了这个之后，分页就失效了
    // 找了一圈，无解，只好自己尝试解决，这个配置里就用了两个类，MybatisSqlSessionFactoryBean，MybatisConfiguration
    // 先看一下分页插件是实现的哪个接口，没错就是这货 Interceptor
    // 逐个去上面两个配置类里找，还真在MybatisSqlSessionFactoryBean类里找到了，有个plugins的字段，类型正是 Interceptor
    // 然后尝试把分页插件设置进去，启动项目，问题解决
    // 官方文档太简陋，坑新手呀！！！！！！
    PaginationInterceptor paginationInterceptor = new PaginationInterceptor();
    sqlSessionFactory.setPlugins(new Interceptor[]{paginationInterceptor});

    return sqlSessionFactory.getObject();
  }
}
```

ShiroConfig
```java
@Configuration
public class ShiroConfig {
  // ... 其它一些配置 ...

  // 配置记住我功能
  @Bean
  @DependsOn("mybatisPlusConfig") // 这个方法要用mybatisPlus查数据库拿数据，就在这个方法上配置上依赖于 mybatisPlusConfig 类
  public SimpleCookie rememberMeCookie() {
    //这个参数是cookie的名称，对应前端的checkbox的name = rememberMe
    SimpleCookie simpleCookie = new SimpleCookie("rememberMe");
    // 记住我cookie生效时间 单位秒
    int adminRememberMeMaxAge = Integer.parseInt(systemConfigService.selectAllConfig().get("admin_remember_me_max_age").toString());
    simpleCookie.setMaxAge(adminRememberMeMaxAge * 24 * 60 * 60);
    return simpleCookie;
  }

  @Bean
  @DependsOn("mybatisPlusConfig") // 这个方法要用mybatisPlus查数据库拿数据，就在这个方法上配置上依赖于 mybatisPlusConfig 类
  public CookieRememberMeManager rememberMeManager() {
    //System.out.println("ShiroConfiguration.rememberMeManager()");
    CookieRememberMeManager cookieRememberMeManager = new CookieRememberMeManager();
    cookieRememberMeManager.setCookie(rememberMeCookie());
    //rememberMe cookie加密的密钥 建议每个项目都不一样 默认AES算法 密钥长度(128 256 512 位)
    cookieRememberMeManager.setCipherKey(Base64.encode("pybbs is the best!".getBytes()));
    return cookieRememberMeManager;
  }
}
```

从上面代码可以看出，哪个 `bean` 有依赖于其它配置类，就在哪个 `bean` 上配置上 `@DependsOn()` 即可，完全自己掌控，爽歪歪

## 参考

- [https://github.com/baomidou/mybatis-plus/issues/459](https://github.com/baomidou/mybatis-plus/issues/459)

相关代码见：[https://github.com/tomoya92/pybbs/tree/master/src/main/java/co/yiiu/pybbs/config](https://github.com/tomoya92/pybbs/tree/master/src/main/java/co/yiiu/pybbs/config)