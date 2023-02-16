---
layout: post
title: Spring-Boot项目启动自动检测数据库是否存在，不存在自动创建数据库（不是表）
date: 2019-01-03 16:55:00
categories: spring-boot学习笔记
tags: spring-boot
author: 朋也
---

* content
{:toc}

> 写博客总结的基本上都是工作中碰到的痛点，这次解决了一直想解决的问题，就是springboot启动服务的时候，自动去创建数据库的问题
>
> 用nodejs+mongodb开发网站的时候，如果没有在mongodb里创建数据库的时候，启动项目，nodejs服务会自动创建数据库，但java程序里确不行，总是报错，特别是 spring-boot 这样的项目，启动默认自动配置 dataSource
>
> 所以在程序启动之前要先把数据库创建好，虽然借助工具可以很方便的创建数据库，但哪有自动创建爽





## 开发一个配置类

默认启动时调用初始化方法，具体代码如下

```java
@Configuration
public class DataSourceHelper {

  private Logger log = LoggerFactory.getLogger(DataSourceHelper.class);

  @Value("${datasource_driver}")
  private String driver; // com.mysql.cj.jdbc.Driver
  @Value("${datasource_url}")
  private String url; // jdbc:mysql://localhost:3306/pybbs?useSSL=false&characterEncoding=utf8
  @Value("${datasource_username}")
  private String username; // root
  @Value("${datasource_password}")
  private String password; // password

  @PostConstruct
  public void init() {
    try {
      Class.forName(driver);
      URI uri = new URI(url.replace("jdbc:", ""));
      String host = uri.getHost();
      int port = uri.getPort();
      String path = uri.getPath();
      Connection connection = DriverManager.getConnection("jdbc:mysql://" + host + ":" + port, username, password);
      Statement statement = connection.createStatement();
      statement.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + path.replace("/", "") + "` DEFAULT CHARACTER SET = `utf8` COLLATE `utf8_general_ci`;");
      statement.close();
      connection.close();
    } catch (URISyntaxException | ClassNotFoundException | SQLException e) {
      log.error(e.getMessage());
    }
  }
}
```

原理也很简单，程序启动的时候，首先让它执行这段代码，创建一个不指定数据库的连接，然后执行创建数据库的sql，最后把连接关闭即可

但是！！！如果能这么简单我就不写博客了，都知道spring-boot启动时会自动配置dataSource，它内置了一个自动配置类 `DataSourceAutoConfiguration` 这就麻烦了，这货的执行优先级还挺高，程序启动后上面我们自己创建的用于创建数据库的类还没执行，`DataSourceAutoConfiguration` 这货就开始初始化了，然后就去连接配置的数据库，结果就是报错，错误信息就是没有 xx 数据库

怎么办？往下看

## 配置自己的数据源

既然spring-boot内置的数据源启动的时候就初始化了，那我不用它了，总没事了吧，首先把这个自动初始化给去掉

```java
// 不用默认配置的数据源，自己配置
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class
})
public class PybbsApplication {

  public static void main(String[] args) {
    SpringApplication.run(PybbsApplication.class, args);
  }
}
```

这个去掉后，程序再启动就没有数据源了，这时候我们就可以自己创建自己的数据源了

既然spring-boot里内置了`HikariDataSource`数据源，这货网上说号称是性能最高的数据源，那我们就继续用它，具体代码如下

```java
@Configuration
public class DataSourceConfig {

  @Value("${datasource_driver}")
  private String driver;
  @Value("${datasource_url}")
  private String url;
  @Value("${datasource_username}")
  private String username;
  @Value("${datasource_password}")
  private String password;

  private HikariDataSource dataSource;

  public HikariDataSource instance() {
    if (dataSource != null) return dataSource;
    HikariConfig config = new HikariConfig();
    config.setDriverClassName(driver);
    config.setJdbcUrl(url);
    config.setUsername(username);
    config.setPassword(password);
    config.addDataSourceProperty("cachePrepStmts", true);
    config.addDataSourceProperty("prepStmtCacheSize", 500);
    config.addDataSourceProperty("prepStmtCacheSqlLimit", 2048);
    config.setConnectionTestQuery("SELECT 1");
    config.setAutoCommit(true);
    //池中最小空闲链接数量
    config.setMinimumIdle(10);
    //池中最大链接数量
    config.setMaximumPoolSize(50);
    dataSource = new HikariDataSource(config);
    return dataSource;
  }

  @Bean(name = "dataSource")
  @DependsOn("dataSourceHelper")
  public DataSource dataSource() {
    return instance();
  }
}
```

可以看到 `dataSource()` 方法上面加上了个注解 `@DependsOn("dataSourceHelper")` 这个注解的意思就是这个数据源要依赖于 `dataSourceHelper` 这个类初始化后才能初始化，所以这就解决了执行先后的问题了

至此完美解决了程序启动之前还要自己创建数据库的问题了

## 参考

- [在Spring项目中实现动态创建数据库](https://cgs1999.iteye.com/blog/2327637)

相关代码见：[https://github.com/atjiu/pybbs/tree/master/src/main/java/co/yiiu/pybbs/config](https://github.com/atjiu/pybbs/tree/master/src/main/java/co/yiiu/pybbs/config)