---
layout: post
title: spring-boot-starter 开发
date: 2021-03-08 17:25:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}

目录结构

![](/assets/2021-03-08-17-27-34.png)

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>ai.puying.boot</groupId>
    <artifactId>puying-sms-spring-boot-starter</artifactId>
    <packaging>jar</packaging>
    <version>1.0</version>

    <properties>
        <spring-boot-version>2.2.2.RELEASE</spring-boot-version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <version>${spring-boot-version}</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
            <version>${spring-boot-version}</version>
            <scope>compile</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure-processor</artifactId>
            <version>${spring-boot-version}</version>
            <scope>compile</scope>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>com.aliyun</groupId>
            <artifactId>aliyun-java-sdk-dysmsapi</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.aliyun</groupId>
            <artifactId>aliyun-java-sdk-core</artifactId>
            <version>3.3.1</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.12</version>
            <scope>compile</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                    <showWarnings>true</showWarnings>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.12</version>
                        </path>
                        <path>
                            <groupId>org.springframework.boot</groupId>
                            <artifactId>spring-boot-configuration-processor</artifactId>
                            <version>${spring-boot-version}</version>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>1.3.1.Final</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

创建配置类，接收一些配置的参数

```java
package ai.puying.starter.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "puying.sms")
public class SmsProperties {

    private String key;
    private String secret;
    private String signName;
    private String templateCode;
    private String templateParam;

}
```

定义服务类

接口

```java
package ai.puying.starter.service;

public interface SmsSender {

    boolean send(String phone, String outId);

}
```

实现类

```java
package ai.puying.starter.service;

import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.IAcsClient;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsRequest;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsResponse;
import com.aliyuncs.http.MethodType;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;

public class SmsService implements SmsSender {

    private String key;
    private String secret;
    private String signName;
    private String templateCode;
    private String templateParam;

    public SmsService(String key, String secret, String signName, String templateCode, String templateParam) {
        this.key = key;
        this.secret = secret;
        this.signName = signName;
        this.templateCode = templateCode;
        this.templateParam = templateParam;
    }

    public boolean send(String phoneNumbers, String outId) {
        //设置超时时间-可自行调整
        System.setProperty("sun.net.client.defaultConnectTimeout", "10000");
        System.setProperty("sun.net.client.defaultReadTimeout", "10000");
        //初始化ascClient需要的几个参数
        final String product = "Dysmsapi";//短信API产品名称（短信产品名固定，无需修改）
        final String domain = "dysmsapi.aliyuncs.com";//短信API产品域名（接口地址固定，无需修改）
        //初始化ascClient,暂时不支持多region（请勿修改）
        IClientProfile profile = DefaultProfile.getProfile("cn-hangzhou", this.key, this.secret);
        try {
            DefaultProfile.addEndpoint("cn-hangzhou", "cn-hangzhou", product, domain);
            IAcsClient acsClient = new DefaultAcsClient(profile);
            //组装请求对象
            SendSmsRequest request = new SendSmsRequest();
            //使用post提交
            request.setMethod(MethodType.POST);
            //必填:待发送手机号。支持以逗号分隔的形式进行批量调用，批量上限为1000个手机号码,批量调用相对于单条调用及时性稍有延迟,验证码类型的短信推荐使用单条调用的方式；发送国际/港澳台消息时，接收号码格式为国际区号+号码，如“85200000000”
            request.setPhoneNumbers(phoneNumbers);
            //必填:短信签名-可在短信控制台中找到
            request.setSignName(this.signName);
            //必填:短信模板-可在短信控制台中找到，发送国际/港澳台消息时，请使用国际/港澳台短信模版
            request.setTemplateCode(this.templateCode);
            //可选:模板中的变量替换JSON串,如模板内容为"亲爱的${name},您的验证码为${code}"时,此处的值为
            //友情提示:如果JSON中需要带换行符,请参照标准的JSON协议对换行符的要求,比如短信内容中包含\r\n的情况在JSON中需要表示成\\r\\n,否则会导致JSON在服务端解析失败
            request.setTemplateParam(this.templateParam);
            //可选-上行短信扩展码(扩展码字段控制在7位或以下，无特殊需求用户请忽略此字段)
            //request.setSmsUpExtendCode("90997");
            //可选:outId为提供给业务方扩展字段,最终在短信回执消息中将此值带回给调用者
            request.setOutId(outId);
            //请求失败这里会抛ClientException异常

            SendSmsResponse sendSmsResponse = acsClient.getAcsResponse(request);
            //请求成功
            return sendSmsResponse.getCode() != null && sendSmsResponse.getCode().equals("OK");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

开发自动配置类

```java
package ai.puying.starter.config;

import ai.puying.starter.service.SmsSender;
import ai.puying.starter.service.SmsService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SmsProperties.class)
public class SmsAutoConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "sms", name = {"key", "secret"})
    public SmsSender smsSender(SmsProperties smsProperties) {
        return new SmsService(smsProperties.getKey(), smsProperties.getSecret(),
                smsProperties.getSignName(), smsProperties.getTemplateCode(), smsProperties.getTemplateParam());
    }
}
```

最后声明自动配置类是哪个，用于告诉spring-boot，当启动是自动加载配置

在src/main/resources下创建一个META-INF文件夹，然后再创建一个spring.factories文件，写上下面内容

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
ai.puying.starter.config.SmsAutoConfiguration
```

如果声明启动时监听，可以使用ApplicationListener，下面是dubbo中的配置

```properties
org.springframework.context.ApplicationListener=\
com.alibaba.boot.dubbo.context.event.OverrideDubboConfigApplicationListener,\
com.alibaba.boot.dubbo.context.event.WelcomeLogoApplicationListener,\
com.alibaba.boot.dubbo.context.event.AwaitingNonWebApplicationListener
```

打包时要把idea一个配置打开，是为了生成 spring-configuration-metadata.json 文件的，这样在使用这个starter的项目中写配置文件时就有提示了，如下图

![](/assets/2021-03-08-17-30-07.png)
