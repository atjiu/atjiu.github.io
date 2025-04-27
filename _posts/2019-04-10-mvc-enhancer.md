---
layout: post
title: 使用undertow封装一个自动转发请求到不同controller的mvc框架（增强版，用到了扫包，反射等）
date: 2019-04-10 09:08:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
  {:toc}

[上一篇](https://atjiu.github.io/2019/04/09/mvc-by-dynamic-proxy-and-undertow/)博客介绍了使用java动态代理来根据请求的url路径动态的转发到不同的controller来执行不同的逻辑的方法

这一篇来介绍使用java反射的方式实现方法

先看下效果图

![](/assets/images/mvc-enhancer.gif)

## 思路

说一下我折腾的思路

1. 创建注解
2. 使用注解修饰类比如被Controller注解修饰的类就是控制器，被GetMapping注解修饰的方法就是路由
3. 启动项目的时候来扫描指定包下的所有类
4. 从扫描到的类中找到指定注解的类
5. 在找到被Controller修饰的类后，通过反射找到类中被GetMapping修饰的方法，获取GetMapping的value，然后把这个关系保存到Map里
6. 在undertow里通过获取请求的path，然后到上一步Map中找对应的类与方法
7. 通过方法的 invoke() 方法执行
8. 方法执行完后，返回一个模板的路径
9. 在执行完后，拿到返回路径，传到视图解析里生成html页面
10. 最后通过undertow的response返回给浏览器

## 依赖

先上本篇博客用到的依赖

```xml
<properties>
  <undertow.version>2.0.20.Final</undertow.version>
</properties>

<dependencies>

  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.25</version>
  </dependency>

  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.25</version>
  </dependency>

  <dependency>
    <groupId>io.undertow</groupId>
    <artifactId>undertow-core</artifactId>
    <version>${undertow.version}</version>
  </dependency>
  <dependency>
    <groupId>io.undertow</groupId>
    <artifactId>undertow-servlet</artifactId>
    <version>${undertow.version}</version>
  </dependency>

  <dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.28</version>
  </dependency>

</dependencies>
```

原链接文：[https://atjiu.github.io/2019/04/10/mvc-enhancer/](https://atjiu.github.io/2019/04/10/mvc-enhancer/)

## 创建注解

我这里创建了两个注解，`@Controller` `@GetMapping()` 分别对应着spring里的这两个注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface Controller {}
```

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface Controller {

  String value() default "";

}
```

## 开发Controller

```java
@Controller
public class HelloController {

  @GetMapping("/")
  public String index(HttpServerExchange exchange, Map<String, Object> model) {
    // 获取参数
    Map<String, Deque<String>> queryParameters = exchange.getQueryParameters();
    String name = queryParameters.get("name").getFirst();
    // 将参数放进传进来的Map对象里，这个对象还会传给视图解析类参与视图的渲染
    model.put("name", name);
    // 视图的模板文件名
    return "index";
  }

  @GetMapping("/about")
  public String about(HttpServerExchange exchange, Map<String, Object> model) {
    return "about";
  }
}
```

```java
@Controller
public class UserController {

  @GetMapping("/user/list")
  public String list(HttpServerExchange exchange, Map<String, Object> model) {
    List<String> users = Arrays.asList("tomcat", "jetty", "undertow");
    model.put("users", users);
    return "user_list";
  }

}
```

## 扫描包

扫描包这个类不是我写的，在csdn上找的，原文地址已在代码里标注了

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;

/**
 * This scanner is used to find out all classes in a package.
 * Created by whf on 15-2-26.
 *
 * 源码来自：https://blog.csdn.net/neosmith/article/details/43955963
 */
public class ClasspathPackageScanner {
  private Logger logger = LoggerFactory.getLogger(ClasspathPackageScanner.class);

  private String basePackage;
  private ClassLoader cl;

  /**
   * Construct an instance and specify the base package it should scan.
   *
   * @param basePackage The base package to scan.
   */
  public ClasspathPackageScanner(String basePackage) {
    this.basePackage = basePackage;
    this.cl = getClass().getClassLoader();

  }

  /**
   * Construct an instance with base package and class loader.
   *
   * @param basePackage The base package to scan.
   * @param cl          Use this class load to locate the package.
   */
  public ClasspathPackageScanner(String basePackage, ClassLoader cl) {
    this.basePackage = basePackage;
    this.cl = cl;
  }

  /**
   * Get all fully qualified names located in the specified package
   * and its sub-package.
   *
   * @return A list of fully qualified names.
   * @throws IOException
   */
  public List<String> getFullyQualifiedClassNameList() throws IOException {
    logger.info("开始扫描包{}下的所有类", basePackage);

    return doScan(basePackage, new ArrayList<>());
  }

  /**
   * Actually perform the scanning procedure.
   *
   * @param basePackage
   * @param nameList    A list to contain the result.
   * @return A list of fully qualified names.
   * @throws IOException
   */
  private List<String> doScan(String basePackage, List<String> nameList) throws IOException {
    // replace dots with splashes
    String splashPath = StringUtil.dotToSplash(basePackage);

    // get file path
    URL url = cl.getResource(splashPath);
    String filePath = StringUtil.getRootPath(url);

    // Get classes in that package.
    // If the web server unzips the jar file, then the classes will exist in the form of
    // normal file in the directory.
    // If the web server does not unzip the jar file, then classes will exist in jar file.
    List<String> names = null; // contains the name of the class file. e.g., Apple.class will be stored as "Apple"
    if (isJarFile(filePath)) {
      // jar file
      if (logger.isDebugEnabled()) {
        logger.debug("{} 是一个JAR包", filePath);
      }

      names = readFromJarFile(filePath, splashPath);
    } else {
      // directory
      if (logger.isDebugEnabled()) {
        logger.debug("{} 是一个目录", filePath);
      }

      names = readFromDirectory(filePath);
    }

    for (String name : names) {
      if (isClassFile(name)) {
        //nameList.add(basePackage + "." + StringUtil.trimExtension(name));
        nameList.add(toFullyQualifiedName(name, basePackage));
      } else {
        // this is a directory
        // check this directory for more classes
        // do recursive invocation
        doScan(basePackage + "." + name, nameList);
      }
    }

    if (logger.isDebugEnabled()) {
      for (String n : nameList) {
        logger.debug("找到{}", n);
      }
    }

    return nameList;
  }

  /**
   * Convert short class name to fully qualified name.
   * e.g., String -> java.lang.String
   */
  private String toFullyQualifiedName(String shortName, String basePackage) {
    StringBuilder sb = new StringBuilder(basePackage);
    sb.append('.');
    sb.append(StringUtil.trimExtension(shortName));

    return sb.toString();
  }

  private List<String> readFromJarFile(String jarPath, String splashedPackageName) throws IOException {
    if (logger.isDebugEnabled()) {
      logger.debug("从JAR包中读取类: {}", jarPath);
    }

    JarInputStream jarIn = new JarInputStream(new FileInputStream(jarPath));
    JarEntry entry = jarIn.getNextJarEntry();

    List<String> nameList = new ArrayList<>();
    while (null != entry) {
      String name = entry.getName();
      if (name.startsWith(splashedPackageName) && isClassFile(name)) {
        nameList.add(name);
      }

      entry = jarIn.getNextJarEntry();
    }

    return nameList;
  }

  private List<String> readFromDirectory(String path) {
    File file = new File(path);
    String[] names = file.list();

    if (null == names) {
      return null;
    }

    return Arrays.asList(names);
  }

  private boolean isClassFile(String name) {
    return name.endsWith(".class");
  }

  private boolean isJarFile(String name) {
    return name.endsWith(".jar");
  }

  // 获取指定注解修饰的类
  public List<String> getClassNameListByAnnotation(List<String> classNames, Class clazz) throws ClassNotFoundException {
    List<String> annotaionClassNames = new ArrayList<>();
    for (String className : classNames) {
      Class<?> aClass = Class.forName(className);
      Annotation declaredAnnotation = aClass.getDeclaredAnnotation(clazz);
      if (declaredAnnotation != null) annotaionClassNames.add(className);
    }
    return annotaionClassNames;
  }

  /**
   * For test purpose.
   */
  public static void main(String[] args) throws Exception {
    ClasspathPackageScanner scan = new ClasspathPackageScanner("co.yiiu");
    List<String> classNameList = scan.getFullyQualifiedClassNameList();
    System.out.println(classNameList.toString());
  }

}
```

文原链接：[https://atjiu.github.io/2019/04/10/mvc-enhancer/](https://atjiu.github.io/2019/04/10/mvc-enhancer/)

这个类中还用到了一个工具类，代码如下

```java
import java.net.URL;

/**
 * 源码来自：https://blog.csdn.net/neosmith/article/details/43955963
 */
public class StringUtil {
  private StringUtil() {

  }

  /**
   * "file:/home/whf/cn/fh" -> "/home/whf/cn/fh"
   * "jar:file:/home/whf/foo.jar!cn/fh" -> "/home/whf/foo.jar"
   */
  public static String getRootPath(URL url) {
    String fileUrl = url.getFile();
    int pos = fileUrl.indexOf('!');

    if (-1 == pos) {
      return fileUrl;
    }

    return fileUrl.substring(5, pos);
  }

  /**
   * "cn.fh.lightning" -> "cn/fh/lightning"
   *
   * @param name
   * @return
   */
  public static String dotToSplash(String name) {
    return name.replaceAll("\\.", "/");
  }

  /**
   * "Apple.class" -> "Apple"
   */
  public static String trimExtension(String name) {
    int pos = name.indexOf('.');
    if (-1 != pos) {
      return name.substring(0, pos);
    }

    return name;
  }

  /**
   * /application/home -> /home
   *
   * @param uri
   * @return
   */
  public static String trimURI(String uri) {
    String trimmed = uri.substring(1);
    int splashIndex = trimmed.indexOf('/');

    return trimmed.substring(splashIndex);
  }
}
```

## 找被注解修饰的类

有了扫描包的类了，在启动时直接把项目下的所有类都扫描出来，然后在扫描出来的类中找到被注解修饰的类

找类上注解方法和找方法上注解的方法是一样的，代码如下

其实仔细看看，像不像手写jdbc连接的代码。。。

```java
Class<?> aClass = Class.forName("co.yiiu.xxx");
List<Stirng> annotationClassNames = aClass.getDeclaredAnnotation(Controller.class);
```

下面来找到被GetMapping注解修饰的方法以及配置的value地址，然后封装到Map里

```java
private Map<String, Map<String, Object>> methodMap = new HashMap<>();
public void init() throws IOException, ClassNotFoundException, IllegalAccessException, InstantiationException {
  // scan controller
  ClasspathPackageScanner scan = new ClasspathPackageScanner("co.yiiu");
  List<String> classNameList = scan.getFullyQualifiedClassNameList();
  List<String> controllerAnnotationClassNames = scan.getClassNameListByAnnotation(classNameList, Controller.class);
  // 获取GetMapping注解修饰的方法
  for (String controllerAnnotationClassName : controllerAnnotationClassNames) {
    Class<?> aClass = Class.forName(controllerAnnotationClassName);
    Method[] methods = aClass.getMethods();
    for (Method method : methods) {
      GetMapping declaredAnnotationMethod = method.getDeclaredAnnotation(GetMapping.class);
      if (declaredAnnotationMethod != null) {
        // 拿到 @GetMapping("url") 注解里配置的url这个值
        String url = declaredAnnotationMethod.value();
        Map<String, Object> map = new HashMap<>();
        map.put("method", method); // 对应着 index() ...
        map.put("clazz", aClass.newInstance()); // 对应着 IndexController ...
        map.put("params", method.getParameters()); // 对应着 index() 的方法参数 ...

        methodMap.put(url, map);
      }
    }
  }
}
```

## 创建视图解析器

我这里用的是freemarker模板作为视图，因为它配置起来相当的简单，基本上就没有配置

唯一的配置就是指定一下模板的加载路径，配置了这一个东东就可以用了，至于缓存以及其它的一些Settings，可以自行配置

```java
Configuration configuration = new Configuration(Configuration.VERSION_2_3_28);
// 我把模板放在 resources/templates 里了，所以这里配置了 templates
FileTemplateLoader templateLoader = new FileTemplateLoader(new File(ViewResolve.class.getClassLoader().getResource("templates").getPath()));
configuration.setTemplateLoader(templateLoader);
```

完整代码如下

```java
import freemarker.cache.FileTemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import io.undertow.server.HttpServerExchange;

import java.io.*;
import java.util.Map;

/**
 * Created by tomoya at 2019/4/9
 */
public class ViewResolve {

  private static final Configuration configuration = new Configuration(Configuration.VERSION_2_3_28);

  static {
    try {
      FileTemplateLoader templateLoader = new FileTemplateLoader(new File(ViewResolve.class.getClassLoader().getResource("templates").getPath()));
      configuration.setTemplateLoader(templateLoader);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  // 渲染模板，因为要输出给浏览器，所以这里要用到response
  // undertow里的response我到现在也不知道怎么获取。。
  // 不过它封装了一个 exchange.getResponseSender().send() 方法
  // 但freemarker处理模板的时候，要传一个Writer流，这怎么办呢？
  // 本来是从 exchange 里拿的，因为它有一个方法 exchange.getOutputStream(), 这样我就可以封装成 OutputStreamWriter writer = new OutputStreamWriter(exchange.getOutputStream()); 了
  // 但是这样的话，在启动undertow的时候，它会报错，报错内容：java.lang.IllegalStateException: UT000035: Cannot get stream as startBlocking has not been invoked 意思是还没有调用 startBlocking() 方法就想用流，不给用。。。
  // 网上找各种解决方案，少的可怜，最后只能看java源码中的Writer接口的实现类，看哪个能用
  // 结果还真被我找到了，有个 StringWriter ，果断拿来尝试，结果成功了，可喜可贺可喜可贺
  public void render(HttpServerExchange exchange, String templatePath, Map<String, Object> model) {
    try {
      Template template = configuration.getTemplate(templatePath + ".ftl");
      StringWriter sw = new StringWriter();
      template.process(model, sw);
      exchange.getResponseSender().send(sw.toString());
    } catch (IOException | TemplateException e) {
      e.printStackTrace();
    }
  }
}
```

链文原接：[https://atjiu.github.io/2019/04/10/mvc-enhancer/](https://atjiu.github.io/2019/04/10/mvc-enhancer/)

## 转发请求地址

到这一步，基本上就算完成了，只需要在undertow接收到请求后，将获取到的地址跟扫描包时整理的Map里地址和方法对应起来执行一下就可以了

原理就是`java.lang.reflect.Method`类里的`invoke()`方法，直接看代码吧

```java
Undertow server = Undertow.builder()
  .addHttpListener(8080, "localhost")
  .setHandler(exchange -> {
    // 获取请求路径
    String path = exchange.getRequestPath();
    // 从封装好的路径与类，方法信息的Map里通过请求的path来获取定义好的路由方法
    Map<String, Object> value = methodMap.get(path);
    if (value != null) {
      // 声明一个Map，用于存放controller里执行完要传给模板的内容，类似于springmvc里的ModelAndView对象
      Map<String, Object> model = new HashMap<>();
      try {
        // 获取方法所属的类
        Object clazz = value.get("clazz");
        // 执行方法，第一个参数是这个方法的类实例，后面是可变参数，想传多少传多少，但要跟controller里方法的参数个数，类型一致
        Object returnValue = ((Method) value.get("method")).invoke(clazz, exchange, model);
        // 判断返回值是string，如果是string，则表示它为模板文件名，这样处理目的是为了支持返回json
        if (returnValue instanceof String) {
          // 渲染模板视图，响应给浏览器
          viewResolve.render(exchange, (String) returnValue, model);
        }
      } catch (IllegalAccessException | InvocationTargetException e) {
        e.printStackTrace();
      }
    } else {
      // 这里是地址没有找到则响应404
      exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
      exchange.getResponseHeaders().put(Headers.STATUS, 404);
      exchange.getResponseSender().send("404");
    }
  }).build();
server.start();
```

## 总结

好处

- 基本上不用去手动配置路由转发到哪个controller执行了
- 把执行方法抽出来，后面可以方便添加一些拦截器之类的逻辑
- 视图模板渲染抽出来后，可以更灵活的接入其它的视图模板
- 注解扫描方式有了解决方案后，可以根据自己需要定义不同的注解，在项目启动时扫描出来归纳好，方便后面程序内使用

不爽的地方

- controller里的参数现在只能定义成固定的几个，没法像springmvc里那样，使用request就注入request, 使用其它东西就注入其它的，如果没有的话，就为null，我尝试过定义一个数组，根据方法参数的类型来添加不同的对象进去，但如果为null了，就会报错，而且顺序出是个问题，这点不够灵活
- 请求地址通配符还没有想好怎么配置，怎么才能做到像springmvc里那样 `/user/{id}/add` 风格的地址呢？

如果你有思路，请务必告诉我，万分感谢！！

写博客不易，转载请保留原文链接，谢谢!