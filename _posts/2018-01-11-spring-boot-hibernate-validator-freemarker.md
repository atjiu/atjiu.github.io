---
layout: post
title: spring-boot里增加表单验证hibernate-validator并在freemarker模板里显示错误信息
categories: spring-boot学习笔记
tags: spring-boot hibernate-validator freemarker
author: 朋也
---

* content
{:toc}

## 创建项目

使用IDEA创建一个spring-boot项目，依赖选上 web, validation, freemarker 即可

先看看效果

![](https://tomoya92.github.io/assets/hibernate-validator.gif)




## 创建实体类

创建并加上注解，代码如下

```java
public class Person implements Serializable {

  @NotNull
  @Length(min = 3, max = 10) // username长度在3-10之间
  private String username;

  @NotNull
  @Min(18) // 年龄最小要18岁
  private Integer age;

  @NotNull
  // 使用正则来验证字段，message: 设置验证失败的信息
  @Pattern(regexp = "[\\w-\\.]+@([\\w-]+\\.)+[a-z]{2,3}", message = "邮箱格式不正确")
  private String email;

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

}
```

## 配置controller

代码：

```java
@Controller
public class WebController extends WebMvcConfigurerAdapter {

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    //添加一个路由并设置页面名字
    registry.addViewController("/results").setViewName("results");
  }

  @GetMapping("/")
  public String showForm(Person person) {
    return "form";
  }

  @PostMapping("/")
  public String checkPersonInfo(@Valid Person person, BindingResult bindingResult, RedirectAttributes redirectAttributes) {

    // 使用BindingResult来验证表单数据的正确性
    if (bindingResult.hasErrors()) {
      // 将提交的表单内容原封不动的返回到页面再展示出来
      redirectAttributes.addFlashAttribute("person", person);
      return "form";
    }

    return "redirect:/results";
  }
}
```

**注：不要忘了`@Valid`注解**

## 表单页面

表单页面里用到了spring标签来取验证失败的数据，在spring-boot里想用spring标签可以将 spring.ftl 文件在放在 `resources` 里面，然后在 `application.yml` 里添加上如下配置即可

`spring.ftl`文件路径: `org.springframework.web.servlet.view.freemarker.spring.ftl` 

```yml
spring:
  freemarker:
    settings:
      auto_import: /spring.ftl as spring
```

表单页面代码

```html
<form action="/" method="post">
  <div class="form-group">
    <label for="username">username</label>
    <@spring.bind "person.username"/>
    <input type="text" id="username" name="username" value="${person.username!}" class="form-control"
            placeholder="username"/>
    <span class="text-danger"><@spring.showErrors ""/></span>
  </div>
  <div class="form-group">
    <label for="age">age</label>
    <@spring.bind "person.age"/>
    <input type="number" id="age" name="age" value="${person.age!}" class="form-control" placeholder="age"/>
    <span class="text-danger"><@spring.showErrors ""/></span>
  </div>
  <div class="form-group">
    <label for="email">email</label>
    <@spring.bind "person.email"/>
    <input type="text" id="email" name="email" value="${person.email!}" class="form-control"
            placeholder="email"/>
    <span class="text-danger"><@spring.showErrors ""/></span>
  </div>
  <input type="submit" value="submit" class="btn btn-sm btn-primary"/>
</form>
```

**注：一定要先使用 `<@spring.bind "person.username"/>` 将字段绑定好，下面再使用 `<@spring.showErrors ""/>` 来取出来错误信息**

## 参考

- [https://spring.io/guides/gs/validating-form-input/](https://spring.io/guides/gs/validating-form-input/)
