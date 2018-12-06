---
layout: post
title: spring-boot 集成 shiro 自定义密码验证 自定义freemarker标签根据权限渲染不同页面
date: 2018-12-05 19:11:00
categories: spring-boot学习笔记
tags: spring-boot shiro freemarker
author: 朋也
---

* content
{:toc}

> 项目里一直用的是 spring-security ，不得不说，spring-security 真是东西太多了，学习难度太大(可能我比较菜)，这篇博客来总结一下折腾shiro的成果，分享给大家，强烈推荐shiro，真心简单 : )

## 引入依赖

```xml
<dependency>
  <groupId>org.apache.shiro</groupId>
  <artifactId>shiro-spring</artifactId>
  <version>1.4.0</version>
</dependency>
```





## 用户，角色，权限

就是经典的RBAC权限系统，下面简单给一下实体类字段

AdminUser.java
```java
public class AdminUser implements Serializable {

  private static final long serialVersionUID = 8264158018518861440L;
  private Integer id;
  private String username;
  private String password;
  private Integer roleId;
  // getter setter...
}
```

Role.java
```java
public class Role implements Serializable {
  private static final long serialVersionUID = 7824693669858106664L;
  private Integer id;
  private String name;
  // getter setter...
}
```

Permission.java
```java
public class Permission implements Serializable {
  private static final long serialVersionUID = -2694960432845360318L;
  private Integer id;
  private String name;
  private String value;
  // 权限的父节点的id
  private Integer pid;
  // getter setter...
}
```

## 自定义Realm

这货就是查询用户的信息然后放在shiro的个人用户对象的缓存里，shiro自己有一个session的对象（不是servlet里的session）作用就是后面用户发起请求的时候拿来判断有没有权限

另一个作用是查询一下用户的信息，将用户名，密码组装成一个 `AuthenticationInfo` 用于后面密码校验的

具体代码如下

MyShiroRealm.java
```java
@Component
public class MyShiroRealm extends AuthorizingRealm {

  private Logger log = LoggerFactory.getLogger(MyShiroRealm.class);

  @Autowired
  private AdminUserService adminUserService;
  @Autowired
  private RoleService roleService;
  @Autowired
  private PermissionService permissionService;

  // 用户权限配置
  @Override
  protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
    //访问@RequirePermission注解的url时触发
    SimpleAuthorizationInfo simpleAuthorizationInfo = new SimpleAuthorizationInfo();
    AdminUser adminUser = adminUserService.selectByUsername(principals.toString());
    //获得用户的角色，及权限进行绑定
    Role role = roleService.selectById(adminUser.getRoleId());
    // 其实这里也可以不要权限那个类了，直接用角色这个类来做鉴权，
    // 不过角色包含很多的权限，已经算是大家约定的了，所以下面还是查询权限然后放在AuthorizationInfo里
    simpleAuthorizationInfo.addRole(role.getName());
    // 查询权限
    List<Permission> permissions = permissionService.selectByRoleId(adminUser.getRoleId());
    // 将权限具体值取出来组装成一个权限String的集合
    List<String> permissionValues = permissions.stream().map(Permission::getValue).collect(Collectors.toList());
    // 将权限的String集合添加进AuthorizationInfo里，后面请求鉴权有用
    simpleAuthorizationInfo.addStringPermissions(permissionValues);
    return simpleAuthorizationInfo;
  }

  // 组装用户信息
  @Override
  protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
    String username = (String) token.getPrincipal();
    log.info("用户：{} 正在登录...", username);
    AdminUser adminUser = adminUserService.selectByUsername(username);
    // 如果用户不存在，则抛出未知用户的异常
    if (adminUser == null) throw new UnknownAccountException();
    return new SimpleAuthenticationInfo(username, adminUser.getPassword(), getName());
  }

}
```

## 实现密码校验

shiro内置了几个密码校验的类，有 `Md5CredentialsMatcher` `Sha1CredentialsMatcher` , 不过从1.1版本开始，都开始使用 `HashedCredentialsMatcher` 这个类了，通过配置加密规则来校验

它们都实现了一个接口 `CredentialsMatcher` 我这里也实现这个接口，实现一个自己的密码校验

说明一下，我这里用的加密方式是Spring-Security里的 `BCryptPasswordEncoder` 作的加密，之所以用它，是因为同一个密码被这货加密后，密文都不一样，下面是具体代码

```java
public class MyCredentialsMatcher implements CredentialsMatcher {

  @Override
  public boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info) {
    // 大坑！！！！！！！！！！！！！！！！！！！
    // 明明token跟info两个对象的里的Credentials类型都是Object，断点看到的类型都是 char[]
    // 但是！！！！！ token里转成String要先强转成 char[]
    // 而info里取Credentials就可以直接使用 String.valueOf() 转成String
    // 醉了。。
    String rawPassword = String.valueOf((char[]) token.getCredentials());
    String encodedPassword = String.valueOf(info.getCredentials());
    return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
  }
}
```

## 配置shiro

因为项目是spring-boot开发的，shiro就用java代码配置，不用xml配置, 具体配置如下

```java
@Configuration
public class ShiroConfig {

  private Logger log = LoggerFactory.getLogger(ShiroConfig.class);

  @Autowired
  private MyShiroRealm myShiroRealm;

  @Bean
  public ShiroFilterFactoryBean shiroFilter(SecurityManager securityManager) {
    log.info("开始配置shiroFilter...");
    ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
    shiroFilterFactoryBean.setSecurityManager(securityManager);
    //拦截器.
    Map<String,String> map = new HashMap<>();
    // 配置不会被拦截的链接 顺序判断  相关静态资源
    map.put("/static/**", "anon");

    //配置退出 过滤器,其中的具体的退出代码Shiro已经替我们实现了
    map.put("/admin/logout", "logout");

    //<!-- 过滤链定义，从上向下顺序执行，一般将/**放在最为下边 -->:这是一个坑呢，一不小心代码就不好使了;

    //<!-- authc:所有url都必须认证通过才可以访问; anon:所有url都都可以匿名访问-->
    map.put("/admin/**", "authc");
    // 如果不设置默认会自动寻找Web工程根目录下的"/login.jsp"页面
    shiroFilterFactoryBean.setLoginUrl("/adminlogin");
    // 登录成功后要跳转的链接
    shiroFilterFactoryBean.setSuccessUrl("/admin/index");

    //未授权界面;
    shiroFilterFactoryBean.setUnauthorizedUrl("/error");
    shiroFilterFactoryBean.setFilterChainDefinitionMap(map);
    return shiroFilterFactoryBean;
  }

  // 配置加密方式
  // 配置了一下，这货就是验证不过，，改成手动验证算了，以后换加密方式也方便
  @Bean
  public MyCredentialsMatcher myCredentialsMatcher() {
    return new MyCredentialsMatcher();
  }

  // 安全管理器配置
  @Bean
  public SecurityManager securityManager() {
    DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
    myShiroRealm.setCredentialsMatcher(myCredentialsMatcher());
    securityManager.setRealm(myShiroRealm);
    return securityManager;
  }
}
```

## 登录

都配置好了，就可以发起登录请求做测试了，一个简单的表单即可，写在Controller里就行

```java
@PostMapping("/adminlogin")
public String adminLogin(String username, String password,
                          @RequestParam(defaultValue = "0") Boolean rememberMe,
                          RedirectAttributes redirectAttributes) {
  try {
    // 添加用户认证信息
    Subject subject = SecurityUtils.getSubject();
    if (!subject.isAuthenticated()) {
      UsernamePasswordToken token = new UsernamePasswordToken(username, password, rememberMe);
      //进行验证，这里可以捕获异常，然后返回对应信息
      subject.login(token);
    }
  } catch (AuthenticationException e) {
    // e.printStackTrace();
    log.error(e.getMessage());
    redirectAttributes.addFlashAttribute("error", "用户名或密码错误");
    redirectAttributes.addFlashAttribute("username", username);
    return redirect("/adminlogin");
  }
  return redirect("/admin/index");
}
```

从上面代码可以看出，记住我功能也直接都实现好了，只需要在组装 `UsernamePasswordToken` 的时候，将记住我字段传进去就可以了，值是 true, false, 如果是true，登录成功后，shiro会在本地写一个cookie

调用 `subject.login(token);` 方法后，它会去鉴权，期间会产生各种各样的异常，有以下几种，可以通过捕捉不同的异常然后提示页面不同的错误信息，相当的方便呀，有木有

- AccountException 帐户异常
- ConcurrentAccessException 这个好像是并发异常
- CredentialsException 密码校验异常
- DisabledAccountException 帐户被禁异常
- ExcessiveAttemptsException 尝试登录次数过多异常
- ExpiredCredentialsException 认证信息过期异常
- IncorrectCredentialsException 密码不正确异常
- LockedAccountException 帐户被锁定异常
- UnknownAccountException 未知帐户异常
- UnsupportedTokenException login(AuthenticationToken) 这个方法只能接收 `AuthenticationToken` 类的对象，如果传的是其它的类，就抛这个异常

上面这么多异常，shiro在处理登录的逻辑时，会自动的发出一些异常，当然你也可以手动去处理登录流程，然后根据不同的问题抛出不同的异常，手动处理的地方就在自己写的 `MyShiroRealm` 里的 `doGetAuthenticationInfo()` 方法里，我在上面代码里只处理了一个帐户不存在时抛出了一个 `UnknownAccountException` 的异常，其实还可以加更多其它的异常，这个要看个人系统的需求来定了

到这里已经可以正常的实现登录了，下面来说一些其它相关的功能的实现

## 自定freemarker标签

开发项目肯定要用到页面模板，我这里用的是 freemarker ，一个用户登录后，页面可能要根据用户的不同权限渲染不同的菜单，github上有个开源的库，也是可以用的，不过我觉得那个太麻烦了，就自己实现了一个，几行代码就能搞定

ShiroTag.java
```java
@Component
public class ShiroTag {

  // 判断当前用户是否已经登录认证过
  public boolean isAuthenticated(){
    return SecurityUtils.getSubject().isAuthenticated();
  }

  // 获取当前用户的用户名
  public String getPrincipal() {
    return (String) SecurityUtils.getSubject().getPrincipal();
  }

  // 判断用户是否有 xx 角色
  public boolean hasRole(String name) {
    return SecurityUtils.getSubject().hasRole(name);
  }

  // 判断用户是否有 xx 权限
  public boolean hasPermission(String name) {
    return !StringUtils.isEmpty(name) && SecurityUtils.getSubject().isPermitted(name);
  }
}
```

将这个类注册到freemarker的全局变量里

FreemarkerConfig.java
```java
@Configuration
public class FreemarkerConfig {

  private Logger log = LoggerFactory.getLogger(FreeMarkerConfig.class);

  @Autowired
  private freemarker.template.Configuration configuration;
  @Autowired
  private ShiroTag shiroTag;

  @PostConstruct
  public void setSharedVariable() throws TemplateModelException {
    //注入全局配置到freemarker
    log.info("开始配置freemarker全局变量...");
    // shiro鉴权
    configuration.setSharedVariable("sec", shiroTag);
    log.info("freemarker自定义标签配置完成!");
  }

}
```

有了这些配置后，就可以在页面里使用了，具体用法如下

```html
<#if sec.hasPermission("topic:list")>
  <li <#if page_tab=='topic'>class="active"</#if>>
    <a href="/admin/topic/list">
      <i class="fa fa-list"></i>
      <span>话题列表</span>
    </a>
  </li>
</#if>
```

加上这个后，在渲染页面的时候，就会根据当前用户是否有查看话题列表的权限，然后来渲染这个菜单

## 注解权限

有了上面freemarker标签判断是否有权限来渲染页面，这样做只能防君子，不能防小人，如果一个人知道后台的某个访问链接，但这个链接它是没有权限访问的，那他只要手动输入这个链接就还是可以访问的，所以这里还要在Controller层加一套防御，具体配置如下

在`ShiroConfig`里加上两个Bean

```java
//加入注解的使用，不加入这个注解不生效
@Bean
public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(DefaultWebSecurityManager securityManager) {
  AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
  authorizationAttributeSourceAdvisor.setSecurityManager(securityManager);
  return authorizationAttributeSourceAdvisor;
}

@Bean
@ConditionalOnMissingBean
public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
  DefaultAdvisorAutoProxyCreator defaultAAP = new DefaultAdvisorAutoProxyCreator();
  defaultAAP.setProxyTargetClass(true);
  return defaultAAP;
}
```

有了这两个Bean就可以用shiro的注解鉴权了，用法如下 `@RequiresPermissions("topic:list")`

```java
@Controller
@RequestMapping("/admin/topic")
public class TopicAdminController extends BaseAdminController {

  @RequiresPermissions("topic:list")
  @GetMapping("/list")
  public String list() {
    // TODO
    return "admin/topic/list";
  }
}
```

shiro除了 `@RequiresPermissions` 注解外，还有其它几个鉴权的注解

- @RequiresPermissions
- @RequiresRoles
- @RequiresUser
- @RequiresGuest
- @RequiresAuthentication

一般 `@RequiresPermissions` 就够用了

## 总结

spring-boot 集成 shiro 到这就结束了，是不是网上能找到的教程里最全的！相比 spring-security 要简单太多了，强烈推荐

希望这篇博客能帮到正在折腾 shiro 的你
