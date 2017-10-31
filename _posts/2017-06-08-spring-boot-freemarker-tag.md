---
layout: post
title: spring-boot里使用freemarker自定义标签
categories: spring-boot学习笔记
tags: spring-boot freemarker tag
author: 朋也
---

* content
{:toc}

spring-boot开发网站使用freemarker里的自定义标签方法

## 创建类实现 TemplateDirectiveModel 类

```java
@Component
public class UserTopicDirective implements TemplateDirectiveModel {

  @Autowired
  private UserService userService;
  @Autowired
  private TopicService topicService;

  @Override
  public void execute(Environment environment, Map map, TemplateModel[] templateModels,
                      TemplateDirectiveBody templateDirectiveBody) throws TemplateException, IOException {
    Page<Topic> page = new PageImpl<>(new ArrayList<>());
    if (map.containsKey("username") && map.get("username") != null) {
      String username = map.get("username").toString();
      if (map.containsKey("p")) {
        int p = map.get("p") == null ? 1 : Integer.parseInt(map.get("p").toString());
        int limit = Integer.parseInt(map.get("limit").toString());
        User currentUser = userService.findByUsername(username);
        if (currentUser != null) {
          page = topicService.findByUser(p, limit, currentUser);
        }
      }
    }
    DefaultObjectWrapperBuilder builder = new DefaultObjectWrapperBuilder(Configuration.VERSION_2_3_25);
    environment.setVariable("page", builder.build().wrap(page));
    templateDirectiveBody.render(environment.getOut());
  }
}
```




## 创建配置类

```java
@Component
public class FreemarkerConfig {

  @Autowired
  private Configuration configuration;
  @Autowired
  private UserTopicDirective userTopicDirective;

  @PostConstruct
  public void setSharedVariable() throws TemplateModelException {
    configuration.setSharedVariable("user_topics_tag", userTopicDirective);
  }

}
```

## 用法

跟自定义macro用法一样，直接使用`<@xx></@xx>`来使用即可，值就直接在 user_topics_tag 标签里传就可以了

```html
<@user_topics_tag username='tomoya' p=1 limit=10>
  <#list page.getContent() as topic>
    <p>${topic.title!}</p>
  </#list>
</@user_topics_tag>
```

## 扩展

FreemarkerConfig类不止可以加入自定义的标签，还可以加入系统自定义的变量等，下面举例说明

spring-boot里的配置文件

```yml
# application.yml
site:
  baseUrl: http://localhost:8080/
```

对应的类是 `SiteConfig.java` 要取里面的值，使用方法如下

```java
@Autowired
private SiteConfig siteConfig;

//...
siteConfig.getBaseUrl();

```

如果把siteConfig加入到freemarker的configuration里就可以直接在freemarker页面上使用变量了

```java
@PostConstruct
public void setSharedVariable() throws TemplateModelException {
  configuration.setSharedVariable("site", siteConfig);
  configuration.setSharedVariable("user_topics_tag", userTopicDirective);
}
```

页面里就可以这样来取值

```html
<a href="${site.bashUrl}">首页</a>
```

是不是很方便

## 参考

本文代码来自：[https://github.com/tomoya92/pybbs](https://github.com/tomoya92/pybbs)
