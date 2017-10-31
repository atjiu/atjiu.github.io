---
layout: post
title: spring-boot集成spring-security的oauth2实现github登录网站
categories: spring-boot学习笔记
tags: spring-boot spring-security oauth2
author: 朋也
---

* content
{:toc}

> spring-security 里自带了oauth2，正好YIIU里也用到了spring-security做权限部分，那为何不直接集成上第三方登录呢？
>
> 然后我开始了折腾
> 
> 注意：本篇只折腾了spring-security oauth2的客户端部分，spring-security还可以搭建标准的oauth2服务端




## 引入依赖

```xml
<dependency>
  <groupId>org.springframework.security.oauth</groupId>
  <artifactId>spring-security-oauth2</artifactId>
</dependency>
```

## 添加配置

```yml
security:
  oauth2:
    client:
      client-id:
      client-secret:
      accessTokenUri: https://github.com/login/oauth/access_token
      userAuthorizationUri: https://github.com/login/oauth/authorize
      clientAuthenticationScheme: form
      registered-redirect-uri: ${site.baseUrl}/github_login
      use-current-uri: false
    resource:
      userInfoUri: https://api.github.com/user
    sso:
      login-path: /github_login
```

在启动类上加上注解 `@EnableOAuth2Sso` 一个注解搞定一切

注意：

- github上的申请应用，这里不多说，要注意的是github上要填的回调地址是跟上面配置的 `registered-redirect-uri` 一样的
- 加上 `@EnableOAuth2Sso` 注解后，原来系统里配置的 `/login` 就默认成了oauth2登录的路由了，这里通过配置 `security.oauth2.sso.login-path` 更改了

## 保存登录用户

注解 `@EnableOAuth2Sso` 登录成功了，会把用户信息写入到内存，还是跟session生命周期一样的，session没了，它就没了，
所以既然登录成功了，就要保存到数据库里，而且也可以跟本地用户做关联，登录成功了，直接读取用户的权限信息

保存用户登录信息，只要实现一个接口就可以了，在oauth2授权成功了，它会回调这个接口的，上代码

这个类放哪都可以，只要能被spring管理就行

```java
@Bean
public PrincipalExtractor principalExtractor() {
  return map -> {
    String login = map.get("login").toString();//github的登录名
    GithubUser githubUser = githubUserService.findByLogin(login);
    User user;
    if (githubUser == null) {
      githubUser = new GithubUser();
      githubUser = githubUserService.convert(map, githubUser);
      //创建一个本地用户
      user = userService.findByUsername(login);
      if (user == null) {
        user = new User();
        user.setUsername(login);
      } else {
        user.setUsername(login + "_" + githubUser.getGithubId());
      }
      user.setEmail(githubUser.getEmail());
      user.setBio(githubUser.getBio());
      user.setUrl(githubUser.getHtml_url());
      user.setPassword(new BCryptPasswordEncoder().encode(StrUtil.randomString(16)));
      user.setInTime(new Date());
      user.setBlock(false);
      user.setToken(UUID.randomUUID().toString());
      user.setAvatar(githubUser.getAvatar_url());
      user.setAttempts(0);
      user.setScore(2000);// first register score 2000
      user.setSpaceSize(siteConfig.getUserUploadSpaceSize());
      user.setGithubUser(githubUser);

      // set user's role
      Role role = roleService.findById(3); // normal user
      Set roles = new HashSet();
      roles.add(role);
      user.setRoles(roles);
      userService.save(user);
    } else {
      githubUser = githubUserService.convert(map, githubUser);
      user = githubUser.getUser();
      githubUserService.save(githubUser);
    }
    //加载用户的权限信息
    return yiiuUserDetailService.loadUserByUsername(user.getUsername());
  };
}
```

上面 `yiiuUserDetailService.loadUserByUsername(user.getUsername())` 这段代码见下面，就是spring-security的加载用户权限代码

```java
@Service
public class YiiuUserDetailService implements UserDetailsService {

  private Logger log = Logger.getLogger(YiiuUserDetailService.class);

  @Autowired
  private UserService userService;
  @Autowired
  private PermissionService permissionService;

  public UserDetails loadUserByUsername(String username) {
    User user = userService.findByUsername(username);
    if (user != null) {
      List<Permission> permissions = permissionService.findByAdminUserId(user.getId());
      List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
      for (Permission permission : permissions) {
        GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(permission.getName());
        grantedAuthorities.add(grantedAuthority);
      }
      return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
          true, true, true, !user.isBlock(), grantedAuthorities);
    } else {
      log.info("用户" + username + " 不存在");
      throw new UsernameNotFoundException("用户名或密码不正确");
    }
  }

}
```

## 参考

- 授权方面搜索了: stackoverflow, github, 简书, csdn...
- 保存用户信息：[http://mmkay.pl/2017/03/19/spring-boot-saving-oauth2-login-data-in-db-using-principalextractor/](http://mmkay.pl/2017/03/19/spring-boot-saving-oauth2-login-data-in-db-using-principalextractor/)

代码详见：[https://github.com/yiiu-co/yiiu](https://github.com/yiiu-co/yiiu)
