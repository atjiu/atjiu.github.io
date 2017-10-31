---
layout: post
title: spring-boot启动项目之后操作的实现方法
date: 2017-02-20 10:44:50
categories: spring-boot学习笔记
tags: spring-boot
author: 朋也
---

* content
{:toc}

web项目在启动之后有时候还会做点其它的东西（比如，导入数据脚本），下面就说说spring-boot里怎么在程序启动后加入自己要执行的东西

新建一个类：BeforeStartup.java

```java
@Configuration
public class BeforeStartup implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private InitDB initDB;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        initDB.createUser();
    }

}
```





InitDB.java

```java
@Component
public class InitDB {

    Logger log = Logger.getLogger(MyInvocationSecurityMetadataSource.class);

    @Autowired
    private UserService userService;

    // create user
    public void createUser() {
        User user = new User();
        user.setAvatar("aaa");
        user.setBlock(false);
        user.setEmail("aaa");
        user.setInTime(new Date());
        user.setPassword("1111");
        user.setSignature("1111");
        user.setUrl("222");
        user.setUsername("bb");
        userService.save(user);
    }
}
```

**再配合一个变量记录系统是否初始化过**，如果初始化了，就不再初始化了，这样就可以做到启动系统之后再自动将默认数据插入，很是方便

相关代码参见：https://github.com/tomoya92/pybbs