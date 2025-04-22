---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 18.springsecurity整合jwt
date: 2024-08-12 15:54:08
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







整合jwt也就意味着去掉了服务端渲染的页面和不需要靠session或rememberme来记录认证的结果。

所以需要更改的地方有：

- 请求端：在header里带上jwt值
- 响应端：响应不再输出服务端渲染的页面了，而是响应json

springsecurity的`formLogin`配置里有两个`handler`

![](/assets/1745311919153.png)

可以在这两个handler上做文章，如果不配置的话，默认成功会跳转到`defaultSuccessUrl`映射的页面上，失败的话，会跳转到`failureUrl`映射的页面上，如果配置了这两个`handler`的话，就都交给代码来控制了。

成功的话，生成jwt响应给前端，失败的话，生成json响应给前端。

## 配置jwt参数

在 `application.properties` 文件里添加几个jwt的配置

```properties
# 签名密钥
site.jwtSignKey                                         = 879ca7a1-77eb-4371-a5ef-ecbff025b2c4
# 单位秒
site.jwtValiditySeconds                                 = 12000
```

创建一个 `SiteConfig` 类，对自定义的配置做一下映射

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "site")
data class SiteConfig(
    var jwtSignKey: String?,
    var jwtValiditySeconds: Long?,
)
```

## 修改authenticationFailureHandler

之前定义了一个 `authenticationFailureHandler` ，用于处理登录失败的错误信息的，修改一下

```kotlin
import com.fasterxml.jackson.databind.json.JsonMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import java.nio.charset.StandardCharsets

class MyAuthenticationFailureHandler : AuthenticationFailureHandler {

    override fun onAuthenticationFailure(request: HttpServletRequest?, response: HttpServletResponse?, exception: AuthenticationException?) {
        response?.setHeader("Content-Type", "application/json")
        response?.characterEncoding = StandardCharsets.UTF_8.name()

        response?.writer?.write(
            JsonMapper.builder().build().writeValueAsString(
                mutableMapOf<String, Any?>(
                    "code" to 401,
                    "description" to exception?.message
                )
            )
        )

        response?.writer?.flush()
    }
}
```

## 创建authenticationSuccessHandler

先在 user 表中添加一个字段 `token` 用作用户的唯一标识

```sql
alter table user add token varchar(36) not null comment '用户唯一标识';

UPDATE user SET token = '7dc60adb-a4e1-41b8-b917-ad1b4d3d5c0a' WHERE id = 1;
UPDATE user SET token = '9abf6ec7-5aff-497b-9583-bc2083ef74fa' WHERE id = 2;
```

创建一个 `MyUser` 继承 `org.springframework.security.core.userdetails.User` 用来多封闭一个token字段

```kotlin
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.User

data class MyUser(
    var name: String?,
    var pwd: String?,
    var auths: Collection<GrantedAuthority>?,
    var token: String?,
) : User(name, pwd, auths)
```

修改 `MyUserDetailsService` ，让 `loadUserByUsername()` 方法返回 `MyUser`类

```kotlin
import com.example.springsecuritydemo.service.AuthService
import com.example.springsecuritydemo.service.UserRoleService
import com.example.springsecuritydemo.service.UserService
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class MyUserDetailsService(
    private val userService: UserService,
    private val userRoleService: UserRoleService,
    private val authService: AuthService
) : UserDetailsService {

    /**
     * 实现接口，查询用户信息和权限信息。
     *
     * @param username 登录的用户名
     * @return 封装成 org.springframework.security.core.userdetails.UserDetails 对象返回
     */
    override fun loadUserByUsername(username: String?): UserDetails? {
        if (username == null) throw UsernameNotFoundException(username)

        val user = userService.getByUsername(username)
        if (user == null) throw UsernameNotFoundException(username)

        // 查询权限
        val userRoles = userRoleService.getByUserId(user.id)
        var roleIds: String = ""
        userRoles.forEach { roleIds = "${roleIds},${it.roleId}" }
        val auths = authService.getByRoleIds(roleIds.substring(1, roleIds.length))

        val authorities: MutableList<SimpleGrantedAuthority> = mutableListOf()
        if (auths!!.isNotEmpty()) {
            auths.forEach { authorities.add(SimpleGrantedAuthority(it.name)) }

            return MyUser(username, user.password, authorities, user.token)
        }
        throw UsernameNotFoundException(username)
    }
}
```

创建一个 `authenticationSuccessHandler` 用于生成登录成功后的jwt

```kotlin
import com.example.springsecuritydemo.config.SiteConfig
import com.fasterxml.jackson.databind.json.JsonMapper
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.Date

@Component
class MyAuthenticationSuccessHandler(private val siteConfig: SiteConfig) : AuthenticationSuccessHandler {

    override fun onAuthenticationSuccess(request: HttpServletRequest?, response: HttpServletResponse?, authentication: Authentication?) {
        response?.setHeader("Content-Type", "application/json")
        response?.characterEncoding = StandardCharsets.UTF_8.name()

        val myUser = SecurityContextHolder.getContext().authentication.principal as MyUser

        val payload = mutableMapOf<String, Any?>(
            "username" to myUser.username,
            "token" to myUser.token
        )

        val token = Jwts.builder()
            // 自定义的负载信息
            .claims(payload)
            // 过期日期
            .expiration(Date.from(LocalDateTime.now().plusMinutes(siteConfig.jwtValiditySeconds!!).atZone(ZoneId.systemDefault()).toInstant()))
            // 签发时间
            .issuedAt(Date())
            // 签名
            .signWith(Keys.hmacShaKeyFor(siteConfig.jwtSignKey?.toByteArray()), Jwts.SIG.HS256)
            .compact()

        val data = mutableMapOf<String, Any>(
            "code" to 200,
            "detail" to token
        )

        response?.writer?.write(JsonMapper.builder().build().writeValueAsString(data))
        response?.writer?.flush()
    }
}
```

## 登录测试一下

![](/assets/1745311935115.png)

将响应的jwt值解密看看

![](/assets/1745311943112.png)

可以看到username, token值都在jwt里，这样就可以通过解密前端放在header里的jwt拿到token，再去查询用户和对应的权限就能进行后续的鉴权了

## 请求带Authorization

下面来处理一下请求头里带 `Authorization` 属性，达到鉴权的目的

前面加验证码的时候，新增了一个过滤器，放在 `UsernamePasswordAuthenticationFilter` 前执行，优先验证表单信息，处理header中的Authorization字段就可以放在这个Filter里

流程为：

1. 判断请求地址是不是 /loginpost 是的话，执行登录认证的逻辑
2. 不是的话，就获取header中的 Authorization ，并解析出来token
3. 拿token去查用户和权限
4. 用户权限都获取到的话，封装一个`UsernamePasswordAuthenticationToken`
5. 最后将 `UsernamePasswordAuthenticationToken` 赋值给SecurityContextHolder的context属性即可

```kotlin
import com.example.springsecuritydemo.config.SiteConfig
import com.example.springsecuritydemo.service.AuthService
import com.example.springsecuritydemo.service.UserRoleService
import com.example.springsecuritydemo.service.UserService
import com.fasterxml.jackson.databind.json.JsonMapper
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.context.SecurityContextImpl
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import java.nio.charset.StandardCharsets

@Component
class MyCheckParamsFilter(
    private val siteConfig: SiteConfig,
    private val userService: UserService,
    private val userRoleService: UserRoleService,
    private val authService: AuthService,
) : Filter {

    private val log = LoggerFactory.getLogger(MyCheckParamsFilter::class.java)

    override fun doFilter(request: ServletRequest, response: ServletResponse, filterChain: FilterChain) {
        val request: HttpServletRequest = request as HttpServletRequest
        val response: HttpServletResponse = response as HttpServletResponse
        // 仅对登录提交做参数验证
        if (request.method.equals("post", ignoreCase = true) && request.servletPath.equals("/loginpost", ignoreCase = true)) {
            val username: String = request.getParameter("username")
            val password: String = request.getParameter("password")
            val code: String = request.getParameter("code")
            val captcha: Any? = request.session.getAttribute("captcha")

            val errorMsgs: MutableList<String> = mutableListOf()
            if (!StringUtils.hasText(username)) errorMsgs.add("用户名不能为空")
            if (!StringUtils.hasText(password)) errorMsgs.add("密码不能为空")
            if (!StringUtils.hasText(code)) errorMsgs.add("验证码不能为空")
            if (captcha == null || (StringUtils.hasText(code) && !code.equals(captcha as String, ignoreCase = true))) errorMsgs.add("验证码不正确")

            if (errorMsgs.isNotEmpty()) {
                response.setHeader("Content-Type", "application/json")
                response.characterEncoding = StandardCharsets.UTF_8.name()

                response.writer.write(
                    JsonMapper.builder().build().writeValueAsString(
                        mutableMapOf<String, Any>(
                            "code" to 201,
                            "detail" to errorMsgs
                        )
                    )
                )
                return
            } else {
                filterChain.doFilter(request, response)
            }
        } else {
            // 从header里获取 Authorization 的值
            var authorization = request.getHeader("authorization")
            if (authorization != null && authorization.startsWith("Bearer ")) {
                var jwt = authorization.substringAfter("Bearer ")
                // 解密
                var claims: Jws<Claims>? = null
                try {
                    claims = Jwts.parser()
                        .verifyWith(Keys.hmacShaKeyFor(siteConfig.jwtSignKey?.toByteArray()))
                        .build()
                        .parseSignedClaims(jwt)
                } catch (e: Exception) {
                    log.error("解密jwt失败，错误信息：{}", e.message)
                }
                if (claims != null) {
                    val username = claims.payload["username"] as String
                    val user = userService.getByUsername(username)
                    if (user != null) {

                        // 查询权限
                        val userRoles = userRoleService.getByUserId(user.id)
                        var roleIds: String = ""
                        userRoles.forEach { roleIds = "${roleIds},${it.roleId}" }
                        val auths = authService.getByRoleIds(roleIds.substring(1, roleIds.length))

                        val authorities: MutableList<SimpleGrantedAuthority> = mutableListOf()
                        if (auths!!.isNotEmpty()) {
                            auths.forEach { authorities.add(SimpleGrantedAuthority(it.name)) }

                            // 封装UsernamePasswordAuthenticationToken
                            val usernamePasswordAuthenticationToken = UsernamePasswordAuthenticationToken(username, user.password, authorities)
                            // 将 封装UsernamePasswordAuthenticationToken 写入 SecurityContextHolder 里
                            SecurityContextHolder.setContext(SecurityContextImpl(usernamePasswordAuthenticationToken))
                        }
                    }
                }
            }
            filterChain.doFilter(request, response)
        }
    }
}
```

## 修改Controller

controller不再渲染页面了，全换成输出json

```kotlin
@PreAuthorize("hasAuthority('index')")
@GetMapping("/")
@ResponseBody
fun index(): Any? {
    return mutableMapOf<String, Any?>(
        "code" to 200,
        "detail" to "Index Page",
    )
}

@PreAuthorize("hasAuthority('user:list')")
@GetMapping("/user/list")
@ResponseBody
fun home(): Any? {
    return mutableMapOf<String, Any?>(
        "code" to 200,
        "detail" to "User Page",
    )
}
```

## 修改accessDeniedHandler

还有一个地方也要修改，当前用户没有权限时，之前我们定义了一个handler，使用response输出了一个html页面，现在也要改成输出json

```kotlin
import com.fasterxml.jackson.databind.json.JsonMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import java.nio.charset.StandardCharsets

class MyAccessDeniedHandler : AccessDeniedHandler {
    override fun handle(request: HttpServletRequest?, response: HttpServletResponse?, accessDeniedException: AccessDeniedException?) {
        response?.setHeader("Content-Type", "application/json")
        response?.characterEncoding = StandardCharsets.UTF_8.name()
        response?.writer?.write(
            JsonMapper.builder().build().writeValueAsString(
                mutableMapOf<String, Any?>(
                    "code" to 403,
                    "description" to accessDeniedException?.message
                )
            )
        )
        response?.writer?.flush()
    }
}
```

## 测试鉴权

postman在Authorization那项，选择 `Bearer Token` 然后将登录返回的 jwt 设置进去，前面不需要手动拼 `bearer ` 的

![](/assets/1745311958681.png)

![](/assets/1745311963585.png)

前面用的`zhangsan`登录的，是有首页的权限的，所以返回的值是正常的

![](/assets/1745311971130.png)

访问 `/user/list`

![](/assets/1745311979904.png)

## 总结

- 在每次请求都会去查一遍数据库，这块代码可以做个缓存优化一下

