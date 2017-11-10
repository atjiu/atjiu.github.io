---
title: spring-boot开发项目加载自定义的YMAL配置文件
categories: spring-boot学习笔记
tags: spring-boot YMAL properties
author: 朋也
---

* content
{:toc}

现在用的spring-boot版本是1.5.x，在1.4.x的时候我记得配置自定义的yml配置文件是用 `@ConfigurationProperties(locations={"classpath:myconfig.properties"})`的方式指定的，

现在这个注解里已经没有 `locations` 这个属性了，网上搜了一圈，说是用 `@PropertySource({"classpath:myconfig.properties"})` 注解来指定properties配置文件

因为application.properties修改application.yml是完全没有问题的，就想着把 myconfig.properties改myconfig.yml不就好了，就可以用yml格式来配置了，完美！！




事实不是这样的，注入死活不成功，最后在spring-boot的官方文档上找到了答案，详见：[https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-external-config-yaml-shortcomings](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-external-config-yaml-shortcomings)
```
YAML files can’t be loaded via the @PropertySource annotation. So in the case that you need to load values that way, you need to use a properties file.
```

原因很明示了，它不支持呀。。

然后Google了一下 `PropertySource yml` 还是找到解决办法了

在程序的任何一个位置加上下面这段代码就可以了(要能被spring初始化到的地方)

```java
@Bean
public static PropertySourcesPlaceholderConfigurer properties() {
  PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
  YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
  yaml.setResources(new ClassPathResource("data.yml"));
  configurer.setProperties(yaml.getObject());
  return configurer;
}
```

愉快的写实体类吧
