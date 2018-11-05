---
layout: post
title: spring-security 实现用户名密码/图片验证码验证和记住我以及登录次数判断功能
date: 2018-05-21 16:40:44
categories: spring-boot学习笔记
tags: spring-security
author: 朋也
---

* content
{:toc}

> 这篇文章来介绍一下基于RBAC权限模式下的spring-security用法

- 加载权限资源(MyInvocationSecurityMetadataSourceService)
- 添加访问决策(MyAccessDecisionManager)
- 添加权限拦截器(MyFilterSecurityInterceptor)
- 加载用户权限(UserDetailService)

执行流程

1. 用户提交登录信息
2. 进入内置的拦截器 `UsernamePasswordAuthenticationFilter` 处理用户名密码正确性
3. 验证完成后去加载用户权限(UserDetailService)
4. 进入到权限拦截器(MyFilterSecurityInterceptor)
5. 在权限拦截器里去调用MyInvocationSecurityMetadataSourceService的getAttributes()方法获取对应的所有权限
6. 再调用MyAccessDecisionManager的decide方法来校验用户是否有对应的权限

**上面流程是我断点看到的顺序，如有错误，欢迎在下面评论指出**

下面给出相应的类源码，基本上都是固定写法





## 基本配置

加载权限资源(MyInvocationSecurityMetadataSourceService)
```java
@Service
public class MyInvocationSecurityMetadataSourceService implements FilterInvocationSecurityMetadataSource {

  @Autowired
  private PermissionService permissionService;

  private Map<String, Collection<ConfigAttribute>> map = null;

  private void loadResource() {
    map = new HashMap<>();
    Collection<ConfigAttribute> array;
    ConfigAttribute cfg;
    List<Permission> permissions = permissionService.findAll();
    for (Permission permission : permissions) {
      array = new ArrayList<>();
      cfg = new SecurityConfig(permission.getValue());
      array.add(cfg);
      map.put(permission.getUrl(), array);
    }
  }

  /**
   * 加载权限资源
   */
  @Override
  public Collection<ConfigAttribute> getAttributes(Object object) throws IllegalArgumentException {
    if (map == null) {
      this.loadResource();
    }
    HttpServletRequest request = ((FilterInvocation) object).getHttpRequest();
    AntPathRequestMatcher matcher;
    String resUrl;
    for (Iterator<String> iter = map.keySet().iterator(); iter.hasNext();) {
      resUrl = iter.next();
      matcher = new AntPathRequestMatcher(resUrl);
      if (matcher.matches(request)) {
        return map.get(resUrl);
      }
    }
    return null;
  }

  @Override
  public Collection<ConfigAttribute> getAllConfigAttributes() {
    return Collections.emptyList();
  }

  @Override
  public boolean supports(Class<?> clazz) {
    return true;
  }

}
```

访问决策(MyAccessDecisionManager)
```java
@Service
public class MyAccessDecisionManager implements AccessDecisionManager {

  /**
   * 判定是否拥有权限的决策方法，
   */
  @Override
  public void decide(Authentication authentication, Object object, Collection<ConfigAttribute> configAttributes)
      throws AccessDeniedException, InsufficientAuthenticationException {
    if (null == configAttributes || configAttributes.size() <= 0) {
      return;
    }
    ConfigAttribute c;
    String needRole;
    for (Iterator<ConfigAttribute> iter = configAttributes.iterator(); iter.hasNext();) {
      c = iter.next();
      needRole = c.getAttribute();
      for (GrantedAuthority ga : authentication.getAuthorities()) {
        if (needRole.trim().equals(ga.getAuthority())) {
          return;
        }
      }
    }
    throw new AccessDeniedException("no right");
  }

  @Override
  public boolean supports(ConfigAttribute attribute) {
    return true;
  }

  @Override
  public boolean supports(Class<?> clazz) {
    return true;
  }

}
```

权限拦截器(MyFilterSecurityInterceptor)
```java
@Service
public class MyFilterSecurityInterceptor extends AbstractSecurityInterceptor implements Filter {

  @Autowired
  private FilterInvocationSecurityMetadataSource securityMetadataSource;

  @Autowired
  public void setMyAccessDecisionManager(MyAccessDecisionManager myAccessDecisionManager) {
    super.setAccessDecisionManager(myAccessDecisionManager);
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    FilterInvocation fi = new FilterInvocation(request, response, chain);
    InterceptorStatusToken token = super.beforeInvocation(fi);
    try {
      fi.getChain().doFilter(fi.getRequest(), fi.getResponse());
    } finally {
      super.afterInvocation(token, null);
    }
  }

  @Override
  public Class<?> getSecureObjectClass() {
    return FilterInvocation.class;
  }

  @Override
  public SecurityMetadataSource obtainSecurityMetadataSource() {
    return this.securityMetadataSource;
  }

}
```

加载用户权限(UserDetailService)
```java
@Service
public class MyUserDetailService implements UserDetailsService {

  @Autowired
  private AdminUserService adminUserService;
  @Autowired
  private PermissionService permissionService;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    AdminUser adminUser = adminUserService.findByUsername(username);
    List<Permission> permissions = permissionService.findByAdminUserId(adminUser.getId());
    List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
    for (Permission permission : permissions) {
      GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(permission.getName());
      grantedAuthorities.add(grantedAuthority);
    }
    return new User(adminUser.getUsername(), adminUser.getPassword(), grantedAuthorities);
  }
}
```

SecurityConfig配置如下

```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Autowired
  private MyUserDetailService myUserDetailService;
  @Autowired
  private MyFilterSecurityInterceptor myFilterSecurityInterceptor;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .antMatchers("/admin/**")
        .authenticated();

    http.formLogin()
        .loginPage("/adminlogin")
        .loginProcessingUrl("/adminlogin")
        .failureUrl("/adminlogin?error")
        .defaultSuccessUrl("/admin/dashboard")
        .permitAll();

    http.logout()
        .logoutRequestMatcher(new AntPathRequestMatcher("/admin/logout"))
        .logoutSuccessUrl("/adminlogin")
        .deleteCookies("JSESSIONID", "remember-me");

    http.addFilterBefore(myFilterSecurityInterceptor, FilterSecurityInterceptor.class);

  }

  @Autowired
  public void configureGlobal(AuthenticationManagerBuilder auth) {
    auth.authenticationProvider(authenticationProvider());
  }

  @Bean
  public AuthenticationProvider authenticationProvider() {
    MyAuthenticationProvider provider = new MyAuthenticationProvider();
    provider.setPasswordEncoder(new BCryptPasswordEncoder());
    provider.setUserDetailsService(myUserDetailService);
    return provider;
  }
}
```

## 添加验证码校验

校验验证码通过实现 `GenericFilterBean` 过滤器来处理，原码如下

```java
@Component
public class MyGenericFilterBean extends GenericFilterBean {

  private String defaultFilterProcessUrl = "/adminlogin";

  @Autowired
  private SiteConfig siteConfig;
  @Autowired
  private AdminUserService adminUserService;

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest request = (HttpServletRequest) req;
    HttpServletResponse response = (HttpServletResponse) res;
    // 判断是post请求，并且请求地址是 /adminlogin
    if ("POST".equalsIgnoreCase(request.getMethod()) && defaultFilterProcessUrl.equals(request.getServletPath())) {
      // 验证码验证
      String requestCaptcha = request.getParameter("code");
      String genCaptcha = (String) request.getSession().getAttribute("index_code");
      if (StringUtils.isEmpty(requestCaptcha))
        throw new AuthenticationServiceException("验证码不能为空!");
      if (!genCaptcha.toLowerCase().equals(requestCaptcha.toLowerCase())) {
        throw new AuthenticationServiceException("验证码错误!");
      }

      // 判断登陆次数及上限时间
      String username = obtainUsername(request);
      AdminUser adminUser = adminUserService.findByUsername(username);
      if (adminUser == null) {
        throw new AuthenticationServiceException("用户名或密码错误!");
      } else {
        if (adminUser.getAttempts() >= siteConfig.getAttempts()) {
          Calendar dateOne = Calendar.getInstance(), dateTwo = Calendar.getInstance();
          dateOne.setTime(new Date());
          dateTwo.setTime(adminUser.getAttemptsTime());
          long timeOne = dateOne.getTimeInMillis();
          long timeTwo = dateTwo.getTimeInMillis();
          long minute = (timeOne - timeTwo) / (1000 * 60);// 转化minute
          if (minute < siteConfig.getAttemptsWaitTime()) {
            throw new AuthenticationServiceException(
                "密码错误超过" + siteConfig.getAttempts() + "次，账号已被锁定" + siteConfig.getAttemptsWaitTime() + "分钟");
          } else {
            adminUser.setAttempts(0);
          }
        }
      }
    }
    chain.doFilter(request, response);
  }
}
```

SecurityConfig配置添加一个filter

```java
@Autowired
private MyGenericFilterBean myGenericFilterBean;

@Override
protected void configure(HttpSecurity http) throws Exception {
  // ...
  http.addFilterBefore(myGenericFilterBean, UsernamePasswordAuthenticationFilter.class);
  // ...
}
```

## 登录成功记住我

先开发一个实体类记录rememberMeToken

```java
@Entity
@Table
public class RememberMeToken implements Serializable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int id;
  private String username;
  private String series;
  private String tokenValue;
  private Date date;
  // getter , setter
}
```

添加对应的repository

```java
public interface RememberMeTokenRepository extends JpaRepository<RememberMeToken, Integer> {
  RememberMeToken getBySeries(String series);

  void deleteByUsername(String username);

  List<RememberMeToken> getAllByUsernameOrderByDate(String username);
}
```

添加对应的service

```java
@Service
@Transactional
public class PersistentTokenService implements PersistentTokenRepository {

  @Autowired
  private RememberMeTokenRepository rememberMeTokenRepository;
  @Autowired
  private SiteConfig siteConfig;

  @Override
  public void createNewToken(PersistentRememberMeToken token) {

    List<RememberMeToken> tokens = rememberMeTokenRepository.getAllByUsernameOrderByDate(token.getUsername());

    if (tokens != null && tokens.size() >= siteConfig.getLoginPoints()) {
      int end = tokens.size() - siteConfig.getLoginPoints() + 1;
      for (int i = 0; i < end; i++) {
        rememberMeTokenRepository.delete(tokens.get(i));
      }
    }

    RememberMeToken rememberMeToken = new RememberMeToken();
    BeanUtils.copyProperties(token, rememberMeToken);
    rememberMeTokenRepository.save(rememberMeToken);
  }

  @Override
  public void updateToken(String series, String tokenValue, Date lastUsed) {
    RememberMeToken rememberMeToken = rememberMeTokenRepository.getBySeries(series);
    if (rememberMeToken != null) {
      rememberMeToken.setTokenValue(tokenValue);
      rememberMeToken.setDate(lastUsed);
    }
  }

  @Override
  public PersistentRememberMeToken getTokenForSeries(String seriesId) {
    RememberMeToken rememberMeToken = rememberMeTokenRepository.getBySeries(seriesId);
    if (rememberMeToken != null) {
      return new PersistentRememberMeToken(rememberMeToken.getUsername(),
          rememberMeToken.getSeries(), rememberMeToken.getTokenValue(), rememberMeToken.getDate());
    }
    return null;
  }

  @Override
  public void removeUserTokens(String username) {
    rememberMeTokenRepository.deleteByUsername(username);
  }
}
```

在 SecurityConfig 里配置一个记住我的服务Bean

```java
@Autowired
private PersistentTokenService persistentTokenService;

@Override
protected void configure(HttpSecurity http) throws Exception {
  // ...
  http.authorizeRequests().and().rememberMe().rememberMeServices(persistentTokenBasedRememberMeServices());
  // ...
}

@Bean
public PersistentTokenBasedRememberMeServices persistentTokenBasedRememberMeServices() {
  PersistentTokenBasedRememberMeServices services = new PersistentTokenBasedRememberMeServices("remember-me"
      , myUserDetailService, persistentTokenService);
  services.setAlwaysRemember(true);
  return services;
}
```

至此，标题中列出的功能都实现了，具体代码见项目：[https://github.com/tomoya92/spring-boot-security-demo](https://github.com/tomoya92/spring-boot-security-demo)

## 参考

- [https://blog.csdn.net/xiejx618/article/details/42609497](https://blog.csdn.net/xiejx618/article/details/42609497)
