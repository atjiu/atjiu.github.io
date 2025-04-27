---
layout: post
title: Java利用反射比对两个对象中字段值的变动
date: 2024-08-22 14:39:55
categories: 杂项
tags: java 反射 reflection
author: 朋也
---

* content
  {:toc}

> 有时候会碰到这种业务：记录一下每次更新都有哪些字段有变动，下面就来利用java的反射实现一个比对值变动的工具类

先看效果

![](/assets/images/1745312650358.png)

## 创建注解

创建两个注解，一个用来标记哪个类是要被可比对的，一个是对类中字段进行注释的

```java
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ValidateClass {

    String value() default "";
}
```

```java
import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ValidateField {

    String value();
}
```

## 创建比对对象

创建一个User类，添加上注解

```java
import java.io.Serializable;

@ValidateClass
public class User implements Serializable {

    private static final long serialVersionUID = 6799831582558508772L;

    @ValidateField("姓名")
    private String name;
    @ValidateField("年龄")
    private int age;
    @ValidateField("地址")
    private String address;
    @ValidateField("性别")
    private String gender;

    public User(String name, int age, String address, String gender) {
        this.name = name;
        this.age = age;
        this.address = address;
        this.gender = gender;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
```

## 实现比对逻辑

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class ValidateObject {

    private static Logger log = LoggerFactory.getLogger(ValidateObject.class);

    public static List<String> validateObject(Object source, Object target) {
        Class<?> sourceClass = source.getClass();
        Class<?> targetClass = target.getClass();
        if (!sourceClass.isAnnotationPresent(ValidateClass.class)
                || !targetClass.isAnnotationPresent(ValidateClass.class)) {
            log.error("源类或目标类上没有ValidateClass注解!!");
            return null;
        }
        if (!sourceClass.equals(targetClass)) {
            log.error("源类与目标类不是同一个类的实例!!");
            return null;
        }
        List<String> errMsgs = new ArrayList<>();
        Field[] fields = sourceClass.getDeclaredFields();
        for (Field field : fields) {
            if (field.isAnnotationPresent(ValidateField.class)) {
                ValidateField validateField = field.getAnnotation(ValidateField.class);
                String fieldName = validateField.value();

                field.setAccessible(true);
                try {
                    Object sourceValue = field.get(source);
                    Object targetValue = field.get(target);
                    if (sourceValue == null && targetValue == null) {

                    } else if (sourceValue != null && targetValue == null) {
                        errMsgs.add("[" + fieldName + "]的值从 (" + sourceValue + ") 变成了 (null) ");
                    } else if (sourceValue == null) {
                        errMsgs.add("[" + fieldName + "]的值从 (null) 变成了 (" + targetValue + ") ");
                    } else if (!sourceValue.equals(targetValue)) {
                        errMsgs.add("[" + fieldName + "]的值从 (" + sourceValue + ") 变成了 (" + targetValue + ") ");
                    }
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }
            }
        }

        return errMsgs;
    }
}
```

## 测试

```java
import java.util.List;

public class TestValidate {

    public static void main(String[] args) {
        User user1 = new User("张三", 12, "北京市朝阳区", "男");
        User user2 = new User("李四", 22, "北京市朝阳区", "女");

        List<String> errMsgs = ValidateObject.validateObject(user1, user2);
        errMsgs.forEach(System.out::println);
    }
}
```

执行输出：

```log
[姓名]的值由 (张三) 变成了 (李四)
[年龄]的值由 (12) 变成了 (22)
[性别]的值由 (男) 变成了 (女)
```




