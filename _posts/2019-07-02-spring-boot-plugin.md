---
layout: post
title: spring-boot 项目利用spring切面实现插件功能，对项目无侵入
date: 2019-07-02 16:40:00
categories: spring-boot学习笔记
tags: spring-boot
author: 朋也
---

* content
{:toc}

> 开发pybbs时，一直想加入插件功能，但没有比较好用的实现方法，突然有一天想起来spring里的切面了，这不正是写插件的好东西，然后就折腾了一下，总结一下
>
> 最可怕的是，在拿到参数和返回值之后，还可以进行修改，修改完后，再返回回去，神不知鬼不觉！！





## 创建项目

首先创建springboot项目，最简单的就行，我这就引了一个依赖

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
  </dependency>

  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
  </dependency>

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

## 配置

首先开启 `aspect` 功能

```java
@SpringBootApplication
@EnableAspectJAutoProxy
public class PluginDemoApplication {

  public static void main(String[] args) {
    SpringApplication.run(PluginDemoApplication.class, args);
  }

}
```

然后编写 `model`, `service`

User.java

```java
@Data
@ToString
public class User {

  private Integer id;
  private String username;

}
```

UserService.java

```java
@Service
@Slf4j
public class UserService {

  public User save(User user) {
    log.info("save user: " + user.toString());
    return user;
  }

  public void delete(Integer id) {
    log.info("user deleted!");
  }

}
```

## 增加切入点

创建切入点，固定写法

UserServicePointcut.java

```java
public class UserServicePointcut {

  @Pointcut("execution(public * com.example.plugindemo.service.UserService.save(..))")
  public void save() {
  }

  @Pointcut("execution(public * com.example.plugindemo.service.UserService.delete(..))")
  public void delete() {
  }

}
```

文原接链: [https://blog.yiiu.co/2019/07/02/spring-boot-plugin/](https://blog.yiiu.co/2019/07/02/spring-boot-plugin/)

## 切入

从上面提供的切入点来切入相应的服务，可以拿到 service 里方法的参数，返回值等信息，而且原service方法还不知道

切入有三种方式

- @Before    在被切入方法执行前执行
- @After     在被切入方法执行后执行
- @Around    在被切入方法执行过程中执行

我这里以一个redis的缓存来实现两个功能

- 当添加用户时，将用户缓存进redis里
- 当删除用户时，再从redis里将用户删除

UserPlugin.java

```java
@Component
@Aspect
@Slf4j
public class RedisPlugin {

  @Around("com.example.plugindemo.plugin.UserServicePointcut.save()")
  public Object save(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
    // 获取参数
    Object[] args = proceedingJoinPoint.getArgs();
    log.info(args[0].toString());
    // 修改参数内容
    ((User) args[0]).setUsername("jetty");
    // 通过 proceed 方法执行被切入方法然后再返回，如果要修改内容也可以在拿到执行完后的对象进行修改，修改完后再返回
    return proceedingJoinPoint.proceed(args);
  }

  @After("com.example.plugindemo.plugin.UserServicePointcut.save()")
  public void afterSave(JoinPoint joinPoint) {
    // 获取参数
    Object[] args = joinPoint.getArgs();
    log.info("将 user 对象缓存进 redis 里, user: {}", args[0].toString());
  }

  @Before("com.example.plugindemo.plugin.UserServicePointcut.delete()")
  public void delete(JoinPoint joinPoint) {
    // 获取参数
    Object[] args = joinPoint.getArgs();
    log.info("将 redis 里的user对象删除，根据id: {}", args[0]);
  }
}
```

## 测试

测试代码如下

PluginDemoApplicationTests.java

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@Slf4j
public class PluginDemoApplicationTests {

  @Autowired
  private UserService userService;

  @Test
  public void save() {
    User user = new User();
    user.setUsername("tomcat");
    user.setId(1);
    user = userService.save(user);
    log.info(user.toString());
  }

  @Test
  public void delete() {
    userService.delete(1);
  }

}
```

接文原链: [https://blog.yiiu.co/2019/07/02/spring-boot-plugin/](https://blog.yiiu.co/2019/07/02/spring-boot-plugin/)

上面例子中对 `save()` 方法进行了两个切入，执行日志如下

```log
2019-07-02 17:30:30.682  INFO 21254 --- [           main] c.example.plugindemo.plugin.RedisPlugin  : User(id=1, username=tomcat)
2019-07-02 17:30:30.689  INFO 21254 --- [           main] c.e.plugindemo.service.UserService       : save user: User(id=1, username=jetty)
2019-07-02 17:30:30.689  INFO 21254 --- [           main] c.example.plugindemo.plugin.RedisPlugin  : 将 user 对象缓存进 redis 里, user: User(id=1, username=jetty)
2019-07-02 17:30:30.691  INFO 21254 --- [           main] c.e.p.PluginDemoApplicationTests         : User(id=1, username=jetty)
```

在调用 `delete()` 方法后日志如下

```log
2019-07-02 17:31:10.582  INFO 21256 --- [           main] c.example.plugindemo.plugin.RedisPlugin  : 将 redis 里的user对象删除，根据id: 1
2019-07-02 17:31:10.590  INFO 21256 --- [           main] c.e.plugindemo.service.UserService       : user deleted!
```

## 加载

springboot项目打包后是个jar包，可以通过 `java -jar xx.jar` 来执行

*那有没有可能将插件分出来开发，然后打成jar包，在启动主项目时，指定一下目录就默认自动加载了呢？*

答案是有的

首先修改打包插件

pom.xml

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <layout>ZIP</layout>
  </configuration>
</plugin>
```

这样再打包的主项目通过下面脚本启动就可以加载指定目录下的插件jar包了

将插件jar包放在主项目jar包同目录下的 plugins 下，然后启动脚本里加上加载路径

```bash
`java -Dloader.path=./plugins -jar xx.jar`
```