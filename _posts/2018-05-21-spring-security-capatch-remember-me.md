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

## 自定用户名密码验证

不用spring-security自带的，自己实现一个provider，只做用户名密码校验，代码如下

```java
public class MyAuthenticationProvider extends DaoAuthenticationProvider {

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) authentication;
    String username = token.getName();
    UserDetails userDetails = this.getUserDetailsService().loadUserByUsername(username);
    // 验证密码是否正确
    if (!new BCryptPasswordEncoder().matches((CharSequence) token.getCredentials(), userDetails.getPassword())) {
      throw new AuthenticationServiceException("用户名或密码错误");
    }
    return new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return UsernamePasswordAuthenticationToken.class.equals(authentication);
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
  @Autowired
  private MyCustomAuthenticationFilter myCustomAuthenticationFilter;

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
实现UserDetailService接口，封装一个UserDetails对象，包含用户名密码，以及用户的权限

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

## 添加验证码校验

校验验证码通过实现 `UsernamePasswordAuthenticationFilter` 过滤器来处理，原码如下

```java
@Component
public class MyCustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

  @Autowired
  private SiteConfig siteConfig;
  @Autowired
  private AdminUserService adminUserService;

  @PostConstruct
  public void init() {
    SavedRequestAwareAuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
    successHandler.setDefaultTargetUrl("/admin/dashboard");

    setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher("/adminlogin", "POST"));
    setAuthenticationSuccessHandler(successHandler);
    setAuthenticationFailureHandler(new SimpleUrlAuthenticationFailureHandler("/adminlogin?error"));
  }

  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
    // 只接受POST方式传递的数据
    if (!"POST".equals(request.getMethod()))
      throw new AuthenticationServiceException("不支持非POST方式的请求!");
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
    return super.attemptAuthentication(request, response);
  }

  @Override
  @Autowired
  public void setAuthenticationManager(AuthenticationManager authenticationManager) {
    super.setAuthenticationManager(authenticationManager);
  }
}
```

SecurityConfig配置添加一个filter

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  // ...
  http.addFilterBefore(myCustomAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
  // ...
}
```

这里把验证码校验跟登录次数处理放在一个Filter里处理了，也可以分开，多加一个类来实现 `UsernamePasswordAuthenticationFilter` 即可

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
@Bean
public PersistentTokenBasedRememberMeServices persistentTokenBasedRememberMeServices() {
  PersistentTokenBasedRememberMeServices services = new PersistentTokenBasedRememberMeServices("remember-me"
      , myUserDetailService, persistentTokenService);
  services.setAlwaysRemember(true);
  return services;
}
```

在校验验证码的过滤器中添加上记住我功能的服务

```java
@Autowired
private PersistentTokenBasedRememberMeServices persistentTokenBasedRememberMeServices;

@PostConstruct
public void init() {
  // ...
  setRememberMeServices(persistentTokenBasedRememberMeServices);
}
```

至此，标题中列出的功能都实现了，具体代码见项目：[https://github.com/tomoya92/spring-boot-security-demo](https://github.com/tomoya92/spring-boot-security-demo)

## 参考

- [https://blog.csdn.net/xiejx618/article/details/42609497](https://blog.csdn.net/xiejx618/article/details/42609497)
