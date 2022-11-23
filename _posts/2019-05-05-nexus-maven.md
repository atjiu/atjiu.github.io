---
layout: post
title: 记录一下折腾nexus搭建maven私服的过程
date: 2019-05-05 13:29:00
categories: 杂项
tags: maven
author: 朋也
---

* content
{:toc}

公司的maven私服当初不是我搭的, 对它又有些兴趣, 就自己折腾了一下, 没想到安装起来还挺简单的, 这篇文章介绍一下





## 下载

可以在这个地址下载对应平台的nexus包 [https://help.sonatype.com/repomanager3/download/download-archives---repository-manager-3](https://help.sonatype.com/repomanager3/download/download-archives---repository-manager-3)

下载好之后, 解压

文件夹结构长这个样

```
nexus-3.16.1-02-unix
├── nexus-3.16.1-02
└── sonatype-work
```

我这里以linux平台为例, 拷贝到linux(我这用的是ubuntu)系统上

拷贝完后, 进入到文件夹 `nexus-3.16.1-02-unix/nexus-3.16.1-02/bin` 里, 然后运行 `./nexus run` 即可启动服务

当看到下面日志则启动成功了

```
-------------------------------------------------

Started Sonatype Nexus OSS 3.16.1-02

-------------------------------------------------
```

默认端口是 8081 , 这时候就可以通过浏览器访问了, 我这里服务器ip是 192.168.1.13, 访问地址就是 http://192.168.1.13:8081

进入后, 默认的用户名密码分别是 `admin` `admin123` 可以登录进去

## 配置

登录帐号后, 可以点击设置, 就可以添加用户和配置角色以及权限了

![](/assets/QQ20190505-150447.png)

---

如果你想修改端口, 可以修改 `nexus-3.16.1-02-unix/nexus-3.16.1-02/etc/nexus-default.properties` 文件里的端口

如果你想配置https, 可以去 `nexus-3.16.1-02-unix/nexus-3.16.1-02/etc/jetty/` 下, 去修改相关的配置

## 发布

既然搭了私服了, 肯定是要发布自己项目中用到的不想发布在中心库上的jar包

先创建一个maven项目, pom.xml文件配置如下

接原链文: [https://atjiu.github.io/2019/05/05/nexus-maven/](https://atjiu.github.io/2019/05/05/nexus-maven/)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>co.yiiu</groupId>
  <artifactId>nexus-demo</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>1.8</java.version>
  </properties>

  <build>
    <plugins>
      <!-- 编译指定jdk版本号 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.8.1</version>
        <configuration>
          <source>1.8</source>
          <target>1.8</target>
          <encoding>UTF-8</encoding>
          <showWarnings>true</showWarnings>
        </configuration>
      </plugin>
      <!-- 部署插件 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-deploy-plugin</artifactId>
        <version>3.0.0-M1</version>
      </plugin>
      <!-- 部署带上源文件, 可以在引入依赖时看到源码, 以及源码上的注释信息 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-source-plugin</artifactId>
        <version>3.0.1</version>
        <configuration>
          <includePom>true</includePom>
          <excludeResources>true</excludeResources>
          <attach>true</attach>
        </configuration>
        <executions>
          <execution>
            <id>attach-sources</id>
            <goals>
              <goal>jar</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

  <!-- 配置上私服地址, 前面带上用户名密码, 目的是可以通过 mvn deploy 命令直接发布上传 -->
  <distributionManagement>
    <repository>
      <id>Nexus Repository</id>
      <url>http://test:123123@192.168.16.131:8081/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
      <id>Nexus Repository</id>
      <url>http://test:123123@192.168.16.131:8081/repository/maven-snapshots/</url>
    </snapshotRepository>
  </distributionManagement>

</project>
```

上面配置了两个地址, 一个正式, 一个快照, 发布的时候, 上传到哪个地址就看项目创建的时候指定的版本号后面是 `SNAPSHOT` 还是 `RELEASE` 了

地址怎么来的? 看下图

![](/assets/QQ20190505-151826.png)

再开发一个测试类

```java
package co.yiiu.nexusdemo;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by tomoya at 2019/5/5
 */
public class Demo implements Serializable {

  private int id;
  // 姓名
  private String name;
  // 当前时间
  private Date time;

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Date getTime() {
    return time;
  }

  public void setTime(Date time) {
    this.time = time;
  }

  @Override
  public String toString() {
    return "Demo{" + "id=" + id + ", name='" + name + '\'' + ", time=" + time + '}';
  }
}
```

原链接文: [https://atjiu.github.io/2019/05/05/nexus-maven/](https://atjiu.github.io/2019/05/05/nexus-maven/)

## 使用

另外创建一个项目, 先添加 `repositories` 信息, 指定使用自己的私服地址

```xml
<repositories>
  <repository>
    <id>nexus</id>
    <name>Nexus Repository</name>
    <url>http://192.168.1.13:8081/repository/maven-central/</url>
    <releases>
      <enabled>true</enabled>
    </releases>
    <!--snapshots默认是关闭的,需要开启-->
    <snapshots>
      <enabled>true</enabled>
    </snapshots>
  </repository>
</repositories>
```

注意这个地址一定要使用 `maven-central` 的, 因为当使用这个的地址, 用到一些中心库的jar包, nexus 会自动去中心库下载, 然后缓存到私服里, 下次再有用到这个jar包, 下载就是直接从私服里下载了, 速度会非常快

然后在 `dependencies` 里引入上面发布的jar包依赖了

```xml
<dependencies>
  <dependency>
    <groupId>co.yiiu</groupId>
    <artifactId>nexus-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
  </dependency>
</dependencies>
```

这样就可以直接在项目里使用了

```java
import co.yiiu.nexusdemo.Demo;

import java.util.Date;

/**
 * Created by tomoya at 2019/5/5
 */
public class TestDemo {

  public static void main(String[] args) {
    Demo demo = new Demo();
    demo.setId(1);
    demo.setName("hello nexus");
    demo.setTime(new Date());
    System.out.println(demo.toString());
  }
}
```

## 总结

可以看到上面启动使用的是命令启动的, 终端一关服务就停了, 可以使用 screen 命令将其放在后台运行
