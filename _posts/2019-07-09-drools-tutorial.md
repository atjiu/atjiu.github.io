---
layout: post
title: Drools使用教程，读取规则文件、解析Excel决策表、通过Excel生成规则文件
date: 2019-07-09 16:05:00
categories: java学习笔记
tags: drools
author: 朋也
---

* content
{:toc}

> drools翻译过来是`流口水`，不知道jboss为啥要起这个名字
>
> 这货作用不是做校验的，它是做复杂运算的（比如保费的计算，商场活动打折等）

**注意：它不是做校验的工具（虽然它也可以做校验）**

下面来介绍一下这货的用法






## 创建项目

创建一个普通的maven项目即可，添加drools依赖

pom.xml

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>8</source>
                <target>8</target>
            </configuration>
        </plugin>
    </plugins>
</build>

<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
    </dependency>
    <dependency>
        <groupId>org.drools</groupId>
        <artifactId>drools-core</artifactId>
        <version>7.23.0.Final</version>
    </dependency>
    <dependency>
        <groupId>org.drools</groupId>
        <artifactId>drools-compiler</artifactId>
        <version>7.23.0.Final</version>
    </dependency>
    <dependency>
        <groupId>org.drools</groupId>
        <artifactId>drools-decisiontables</artifactId>
        <version>7.23.0.Final</version>
    </dependency>
    <dependency>
        <groupId>org.drools</groupId>
        <artifactId>drools-templates</artifactId>
        <version>7.23.0.Final</version>
    </dependency>
</dependencies>
```

接文原链: [https://tomoya92.github.io/2019/07/09/drools-tutorial/](https://tomoya92.github.io/2019/07/09/drools-tutorial/)

## 创建规则文件

首先创建一个实体类

Demo.java

```java
public class Demo {
    private int a;
    private int b;
    private int c;

    // 计算的和
    private int total;

    // 放错误信息的列表
    private List<String> errorMsg = new ArrayList<>();

    // getter, setter, toString
}
```

drools的文件后缀是 `drl`，在 `src/main/resources` 下创建一个文件夹 `rules` ，然后在这个文件夹里创建一个规则文件 `test-rule.drl`，内容如下

```java
package com.example.demo

import com.example.drools.Demo

rule "校验总额"
    no-loop true // 不循环执行
    salience 1 // 优先级，越大优先级越高
    when
        $demo:Demo(a + b != c)
    then
        $demo.getErrorMsg().add("a + b 与 c 不相等");
end

rule "计算总和"
    no-loop true // 不循环执行
    salience 2 // 优先级，越大优先级越高
    when
        $demo:Demo()
    then
        $demo.setTotal($demo.getA() + $demo.getB() + $demo.getC());
end

rule "按条件计算"
    no-loop true // 不循环执行
    salience 3 // 优先级，越大优先级越高
    when
        $demo:Demo(a>5,b>3) // 当a > 5 && b > 3 时才进行计算
    then
        $demo.setTotal($demo.getA() + $demo.getB() + $demo.getC());
end
```

这里我写了三个规则的demo

- 第一个是做校验的（**虽然我强烈不建议用它来做校验**）
- 第二个没有条件，计算传进来的实体类中字段的和
- 第三个是带条件判断，满足的话，计算和

## 读取规则文件测试

写一个 test 方法


```java
//加载规则文件处理逻辑
@Test
public void test() {
    // 构建KieSession, 这部分写法是固定的
    KieServices kieServices = KieServices.Factory.get();
    KieFileSystem kieFileSystem = kieServices.newKieFileSystem();
    kieFileSystem.write(ResourceFactory.newClassPathResource("rules/test-rule.drl"));
    KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem);
    kieBuilder.buildAll();
    KieModule kieModule = kieBuilder.getKieModule();
    KieSession kieSession = kieServices.newKieContainer(kieModule.getReleaseId()).newKieSession();

    // 构建实体类对象
    Demo demo = new Demo();
    demo.setA(6);
    demo.setB(4);
    demo.setC(4);

    // 将要过规则的类传进 kieSession 中
    kieSession.insert(demo);
    // 调用 fireAllRules() 方法进行规则处理，同时可以得知走了几个规则
    int count = kieSession.fireAllRules();
    System.out.println("总共触发了: " + count + " 条规则");
    System.out.println(demo);
}
```

结果

```log
总共触发了: 3 条规则
Demo{a=6, b=4, c=4, total=14, errorMsg=[a + b 与 c 不相等]}
```

## Excel定义决策表

先给一张图

![](/assets/QQ20190709-162341.png)

下面来解释一下每一行都什么意思

1. 表示规则属于哪个包下的，类似于java中的 package
2. 规则在处理逻辑时用到的类，多个的话，在后面用逗号隔开
3. 一些共用方法可以通过 Functions 来定义，跟java中的方法差不多，就是把 public 换成了 function
4. 空行，必须要有的
5. 给这个excel里的规则定义一个名字，方便别人查看
6. 从这一行开始下面就是规则的部分了，这一行相当于表头，标注了每一列都是什么意思，固定写法，其中 `CONDITION` 可以有多个
7. 这一行是初始化对象的
8. 指定条件以及输出的处理方式
9. 这一行开始就是真实的业务逻辑了，`CONDITION` 下的是条件，`ACTION` 下的是结果，我这给这一行也定成了表头并起了相应的名字，如果不想定表头的话，这一行要为空行
10. 第一列是规则名，第二列是条件，第三列是结果

## 读取Excel生成规则文件

代码如下

文原接链: [https://tomoya92.github.io/2019/07/09/drools-tutorial/](https://tomoya92.github.io/2019/07/09/drools-tutorial/)

```java
//把excel翻译成drl文件
@Test
public void test2() {
    SpreadsheetCompiler compiler = new SpreadsheetCompiler();
    // 最后一个参数是excel里 sheet 的名称
    String rules = compiler.compile(ResourceFactory.newClassPathResource("rules" + File.separator + "rule.xlsx", "UTF-8"), "Sheet1");

    try {
        BufferedWriter out = new BufferedWriter(new FileWriter("src/main/resources/rules/test-rule-excel.drl"));
        out.write(rules);
        out.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

上面excel里的规则生成的文件内容如下

```java
package com.example.demo;
//generated from Decision Table
import com.example.drools.Demo;
function int count(Demo $demo) {
    return $demo.getA() + $demo.getB() + $demo.getC();
}
// rule values at A10, header at A5
rule "条件计算1"
	when
		$demo:Demo(a>3,b>4)
	then
		$demo.setTotal(count($demo));
end

// rule values at A11, header at A5
rule "条件计算2"
	when
		$demo:Demo(c<3)
	then
		$demo.setTotal($demo.getA() + $demo.getB());
end
```

## 直接读取Excel决策表处理业务规则

上面介绍了读取excel生成rule文件，然后再通过读取规则文件来处理业务，这样比较麻烦，下面来介绍一下直接读取excel，然后处理业务逻辑

代码如下

```java
//读取excel规则处理逻辑
@Test
public void test1() {
    KieServices kieServices = KieServices.Factory.get();
    Resource dt = ResourceFactory.newClassPathResource("rules/rule.xlsx", getClass());
    KieFileSystem kieFileSystem = kieServices.newKieFileSystem().write(dt);
    KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem);
    kieBuilder.buildAll();
    KieModule kieModule = kieBuilder.getKieModule();
    KieSession kieSession = kieServices.newKieContainer(kieModule.getReleaseId()).newKieSession();

    Demo demo = new Demo();
    demo.setA(6);
    demo.setB(5);
    demo.setC(4);

    kieSession.insert(demo);
    int count = kieSession.fireAllRules();
    System.out.println("总共触发了: " + count + " 条规则");
    System.out.println(demo);
}
```

```log
总共触发了: 1 条规则
Demo{a=6, b=5, c=4, total=15, errorMsg=[]}
```

## 总结

jboss还提供了一个网站，能直接在网页上配置出来规则，更加方便了，不过对于程序员来说，写drl文件应该是首选，对于业务人员写excel应该是首选
