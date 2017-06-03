---
layout: post
title: spring-boot项目打jar包运行，加载jar包外部的页面以及静态资源文件
date: 2017-06-02 08:04:04
categories: spring-boot学习笔记
tags: spring-boot templates jar
author: 朋也
---

* content
{:toc}

之前看到过spring-boot开发的项目可以加载到放在jar包同级目录下的`application.yml`，就在想是否可以把`src/main/resources/templates`和`src/main/resources/static`这两个目录下的文件都放到jar包同级目录下呢？答案是**肯定的**

## 项目打jar包

```sh
mvn clean compile package
```

完成了，在target目录下会有对应生成的jar文件




## 修改配置文件

上面已经说了，项目的配置文件可以放到外面，所以就直接修改外面的配置文件即可

将jar包拷贝到文件夹 demo（随便命名） 下，

将项目里的`application.yml`文件，templates文件夹，static文件夹都拷贝到demo下

添加上下面配置

```yml
spring:
  resources:
    static-locations:
    - file:./static/
  freemarker:
    template-loader-path:
    - classpath:/templates/
    - file:./templates/
```

启动服务

```sh
java -jar xx.jar
```

直接浏览器访问就可以了，一切正常，修改页面，样式是不是方便的多了

## 说明（注意事项）

```yml
spring:
  freemarker:
    template-loader-path:
    - classpath:/templates/
```

这个classpath如果不配置的话，项目就加载不到打到jar包里的templates里的页面了，如果还想加载打到jar包里的页面，这个必须要配置上

好了，有兴趣的朋友可以自己试试了，本篇文章的测试代码：[https://github.com/tomoya92/pybbs](https://github.com/tomoya92/pybbs)
