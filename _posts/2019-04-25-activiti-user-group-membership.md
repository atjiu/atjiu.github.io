---
layout: post
title: Activiti6.0教程(8) - 用户, 组, 用户与组关系用法
date: 2019-04-25 22:37:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

* content
{:toc}

- [Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://atjiu.github.io/2019/04/24/activiti-env/)
- [Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/)
- [Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://atjiu.github.io/2019/04/24/activiti-spring-boot/)
- [Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://atjiu.github.io/2019/04/24/activiti-query-complete-task/)
- [Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://atjiu.github.io/2019/04/24/activiti-assignee/)
- [Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://atjiu.github.io/2019/04/25/activiti-exclusive-gateway/)
- [Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://atjiu.github.io/2019/04/25/activiti-parallel-gateway/)
- [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://atjiu.github.io/2019/04/25/activiti-user-group-membership/)
- [Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://atjiu.github.io/2019/04/26/activiti-candidate-task/)

activiti 自带了一套用户, 组, 以及用户与组的关系表, 共四张表

| 表                | 描述             |
|-------------------|-----------------|
| act_id_group      | 组               |
| act_id_user       | 用户             |
| act_id_info       | 用户表的扩展     |
| act_id_membership | 用户与组的关联表 |
{: .table.table-bordered}

这四张表都归 `IdentityService` 类管






## 创建组

```java
@Autowired
private IdentityService identityService;

@Test
public void createGroup() {
  Group group = identityService.newGroup("1");
  group.setName("研发部");
  Group group1 = identityService.newGroup("2");
  group1.setName("运营部");
  Group group2 = identityService.newGroup("3");
  group2.setName("商务部");
  identityService.saveGroup(group);
  identityService.saveGroup(group1);
  identityService.saveGroup(group2);
}
```

## 创建用户

```java
@Autowired
private IdentityService identityService;

@Test
public void createUser() {
  User user = identityService.newUser("1");
  user.setFirstName("三");
  user.setLastName("张");
  user.setEmail("zhangsan@aa.com");
  User user1 = identityService.newUser("2");
  user1.setFirstName("四");
  user1.setLastName("李");
  user1.setEmail("lisi@aa.com");
  User user2 = identityService.newUser("3");
  user2.setFirstName("五");
  user2.setLastName("王");
  user2.setEmail("wangwu@aa.com");
  User user3 = identityService.newUser("4");
  user3.setFirstName("六");
  user3.setLastName("赵");
  user3.setEmail("zhaoliu@aa.com");

  identityService.saveUser(user);
  identityService.saveUser(user1);
  identityService.saveUser(user2);
  identityService.saveUser(user3);
}
```

## 创建关联

```java
@Autowired
private IdentityService identityService;

@Test
public void createUser() {
  // void createMembership(String userId, String groupId);
  // 第一个参数是userId, 第二个参数是 groupId
  identityService.createMembership("1", "1");
  identityService.createMembership("2", "1");
  identityService.createMembership("3", "2");
  identityService.createMembership("4", "3");
}
```

原链接文：[https://atjiu.github.io/2019/04/25/activiti-user-group-membership/](https://atjiu.github.io/2019/04/25/activiti-user-group-membership/)


## 删除用户/组

```java
@Test
public void deleteTest() {
  identityService.deleteUser("1");
  identityService.deleteGroup("1");
}
```

## 查询

**查询用户**

```java
@Test
public void queryUser() {
  List<User> users = identityService.createUserQuery().list();
  for (User user : users) {
    System.out.println("userName: " + user.getLastName() + user.getFirstName() + " email: " + user.getEmail());
  }
}
```

**查询组**

```java
@Test
public void queryGroup() {
  List<Group> groups = identityService.createGroupQuery().list();
  for (Group group : groups) {
    System.out.println("id: " + group.getId() + " name: " + group.getName());
  }
}
```

**关联查询**

```java
@Test
public void queryMemberShip() {
  // 查询id为1的组里关联的用户
  List<User> users = identityService.createUserQuery().memberOfGroup("1").list();
  for (User user : users) {
    System.out.println("userName: " + user.getLastName() + user.getFirstName() + " email: " + user.getEmail());
  }
  System.out.println("======================================");
  // 查询id为1的用户所在的组
  List<Group> groups = identityService.createGroupQuery().groupMember("1").list();
  for (Group group : groups) {
    System.out.println("id: " + group.getId() + " name: " + group.getName());
  }
}
```

## 总结

有了这几张表, 可以把系统中的用户信息保存进去, 在进行流程的时候可以方便的通过 `IdentityService` 类来查询使用

貌似没有更新的操作, 尝试创建一个id已经存在的用户, 然后修改内容, 再保存它报错了, 不过删除用户后, 用户跟组的关联关系也一块删除了, 这样就方便了, 不用专门去维护关联表了

---

写博客不易，转载请保留原文链接，谢谢!
