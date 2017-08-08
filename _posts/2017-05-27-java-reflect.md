---
layout: post
title: Java中利用反射查找使用指定注解的类
date: 2017-05-27 10:23:29
categories: Java学习笔记
tags: java reflect annotation
author: 朋也
---

* content
{:toc}

> 想自己写个跟spring里的注解一样的注解来用，然后希望能找到使用了自己写了注解的类，下面来介绍一下实现方法
>
> 声明，下面代码是没看过spring源码写的，基本上都是网上找的博客，整理的

## 定义注解

Controller.java

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Controller {

}
```




RequestMapping.java

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequestMapping {

  String value();

}
```

## 使用注解

```java
@Controller
public class IndexController {

  @RequestMapping("/")
  public void index() {
    System.out.println("index method")
  }

  @RequestMapping("/about")
  public void about(String args) {
    System.out.println("about method")
  }

}
```

## 扫描包下所有类

下面这段代码摘自网络博客上的

```java
/**
 * 从包package中获取所有的Class
 *
 * @param packageName
 * @return
 */
public static List<Class<?>> getClasses(String packageName) {

  // 第一个class类的集合
  List<Class<?>> classes = new ArrayList<Class<?>>();
  // 是否循环迭代
  boolean recursive = true;
  // 获取包的名字 并进行替换
  String packageDirName = packageName.replace('.', '/');
  // 定义一个枚举的集合 并进行循环来处理这个目录下的things
  Enumeration<URL> dirs;
  try {
    dirs = Thread.currentThread().getContextClassLoader().getResources(packageDirName);
    // 循环迭代下去
    while (dirs.hasMoreElements()) {
      // 获取下一个元素
      URL url = dirs.nextElement();
      // 得到协议的名称
      String protocol = url.getProtocol();
      // 如果是以文件的形式保存在服务器上
      if ("file".equals(protocol)) {
        // 获取包的物理路径
        String filePath = URLDecoder.decode(url.getFile(), "UTF-8");
        // 以文件的方式扫描整个包下的文件 并添加到集合中
        findAndAddClassesInPackageByFile(packageName, filePath, recursive, classes);
      } else if ("jar".equals(protocol)) {
        // 如果是jar包文件
        // 定义一个JarFile
        JarFile jar;
        try {
          // 获取jar
          jar = ((JarURLConnection) url.openConnection()).getJarFile();
          // 从此jar包 得到一个枚举类
          Enumeration<JarEntry> entries = jar.entries();
          // 同样的进行循环迭代
          while (entries.hasMoreElements()) {
            // 获取jar里的一个实体 可以是目录 和一些jar包里的其他文件 如META-INF等文件
            JarEntry entry = entries.nextElement();
            String name = entry.getName();
            // 如果是以/开头的
            if (name.charAt(0) == '/') {
              // 获取后面的字符串
              name = name.substring(1);
            }
            // 如果前半部分和定义的包名相同
            if (name.startsWith(packageDirName)) {
              int idx = name.lastIndexOf('/');
              // 如果以"/"结尾 是一个包
              if (idx != -1) {
                // 获取包名 把"/"替换成"."
                packageName = name.substring(0, idx).replace('/', '.');
              }
              // 如果可以迭代下去 并且是一个包
              if ((idx != -1) || recursive) {
                // 如果是一个.class文件 而且不是目录
                if (name.endsWith(".class") && !entry.isDirectory()) {
                  // 去掉后面的".class" 获取真正的类名
                  String className = name.substring(packageName.length() + 1, name.length() - 6);
                  try {
                    // 添加到classes
                    classes.add(Class.forName(packageName + '.' + className));
                  } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                  }
                }
              }
            }
          }
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
  } catch (IOException e) {
    e.printStackTrace();
  }

  return classes;
}
```

传入一个包名，就会自动扫描下面所有的类

## 找出用了注解的类

```java
//找也用了Controller注解的类
private List<Class<?>> controllers;

public List<Class<?>> getControllers() {
  if (controllers == null) {
    controllers = new ArrayList<>();
    List<Class<?>> clsList = getAllClass();
    if (clsList != null && clsList.size() > 0) {
      for (Class<?> cls : clsList) {
        if (cls.getAnnotation(Controller.class) != null) {
          Map<Class<?>, Object> map = new HashMap<>();
          controllers.add(cls);
        }
      }
    }
  }
  return controllers;
}
```

查找使用RequestMapping注解的方法，并查出注入的参数

```java

for (Class<?> cls : getControllers()) {
  Method[] methods = cls.getMethods();
  for (Method method : methods) {
    RequestMapping annotation = method.getAnnotation(RequestMapping.class);
    if (annotation != null) {
      String value = annotation.value();//找到RequestMapping的注入value值
      if (value.equals("/about")) {//判断是不是/about，是的话，就调用about(args)方法
        method.invoke(cls.newInstance(), "args"); //第二个参数是方法里的参数
      }
    }
  }
}
```

这样一来，java项目里用纯servlet写的项目 ，就可以做自己的注解映射路由了，方便极了
