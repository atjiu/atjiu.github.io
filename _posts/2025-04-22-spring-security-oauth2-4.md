---
layout: post
title: 【springsecurity oauth2授权中心】jwt令牌更换成自省令牌 OpaqueToken P4
date: 2025-04-22 14:12:51
categories: springsecurity-oauth2授权中心
tags: spring-security oauth2
author: 朋也
---

* content
{:toc}







## 前言

前面实现了授权中心授权，客户端拿到access_token后就能请求资源服务器接口

权限的校验都是在资源服务器上进行的，授权服务器颁发的access_token有限期是2小时，也就是说在2小时之内，不管授权服务器那边用户的权限如何变更都不会影响到资源服务器上的资源请求。

这篇来解决这个问题，让客户端对资源服务器的每次请求都要去问问授权服务器access_token是否还有效，有效的话资源服务器才能通过

## 授权服务器

在 application.yml 里的 grant-types 后面添加一个 client_credentials

```yml
# 之前
oauth2:
  client:
    #...
    grant-types: authorization_code,refresh_token

# 修改后
oauth2:
  client:
    #...
    grant-types: authorization_code,refresh_token,client_credentials
```

配置类 AuthorizationServerConfig 里将 OAuth2TokenCustomizer 由 JwtEncodingContext 改成 OAuth2TokenClaimsContext
```java
//之前
    //    @Bean
//    public OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer() {
//        return context -> {
//            if (context.getTokenType().getValue().equals("access_token")) {
//                Collection<? extends GrantedAuthority> authorities = context.getPrincipal().getAuthorities();
//                List<String> authorityNames = authorities.stream()
//                        .map(GrantedAuthority::getAuthority)
//                        .collect(Collectors.toList());
//                context.getClaims().claim("authorities", authorityNames);
//            }
//        };
//    }

//修改后
@Bean
public OAuth2TokenCustomizer<OAuth2TokenClaimsContext> tokenCustomizer() {
    return context -> {
        if (context.getTokenType().getValue().equals("access_token")) {
            // 从用户详情中提取权限
            Collection<? extends GrantedAuthority> authorities =
                    context.getPrincipal().getAuthorities();

            // 将权限列表放入令牌声明
            context.getClaims().claim(
                    "authorities",
                    authorities.stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList())
            );
        }
    };
}
```

## 资源服务器

添加一个依赖

```xml
<dependency>
    <groupId>com.nimbusds</groupId>
    <artifactId>oauth2-oidc-sdk</artifactId>
    <version>11.23.1</version>
    <scope>runtime</scope>
</dependency>
```

创建一个自省令牌解析器 CustomAuthoritiesOpaqueTokenIntrospector

```java
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CustomAuthoritiesOpaqueTokenIntrospector implements OpaqueTokenIntrospector {

    private final OpaqueTokenIntrospector delegate;

    public CustomAuthoritiesOpaqueTokenIntrospector(OpaqueTokenIntrospector delegate) {
        this.delegate = delegate;
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        OAuth2AuthenticatedPrincipal principal = this.delegate.introspect(token);

        Map<String, Object> claims = principal.getAttributes();
        List<String> authorities = (List<String>) claims.get("authorities");

        if (authorities == null) throw new SecurityException("没有权限");
        Collection<GrantedAuthority> grantedAuthorities = authorities.stream()
                .map(auth -> new SimpleGrantedAuthority(auth)) // 直接使用权限名，不加 SCOPE_ 前缀
                .collect(Collectors.toList());

        return new DefaultOAuth2AuthenticatedPrincipal(claims, grantedAuthorities);
    }
}
```

修改 ResourceServerConfig 配置类

```java
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                                // 注释掉jwt
//                        .jwt(jwt -> jwt
//                                .jwkSetUri("http://localhost:9000/oauth2/jwks")
//                                .jwtAuthenticationConverter(jwtAuthenticationConverter()) // 使用自定义转换器
//                        )
                                // 添加上 opaque
                                .opaqueToken(opaque -> opaque
//                                        .introspectionUri("http://localhost:9000/oauth2/introspect")
//                                        .introspectionClientCredentials("client", "secret")
                                                .introspector(customOpaqueTokenIntrospector())
                                )
                );
        return http.build();
    }
    // jwt权限转换器，这里用不到了注释掉
//    @Bean
//    public JwtAuthenticationConverter jwtAuthenticationConverter() {
//        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
//        grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities"); // 指定JWT中权限字段名
//        grantedAuthoritiesConverter.setAuthorityPrefix(""); // 去掉默认的"SCOPE_"前缀
//
//        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
//        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
//        return jwtAuthenticationConverter;
//    }
```

配置授权服务器的请求 `/oauth2/introspect` 是内置的，不要修改

```java
@Bean
public OpaqueTokenIntrospector customOpaqueTokenIntrospector() {
    // 1. 创建默认的 Introspector（连接授权服务器）
    OpaqueTokenIntrospector delegate = new NimbusOpaqueTokenIntrospector(
            "http://localhost:9000/oauth2/introspect",
            "client", // client_id
            "secret"  // client_secret 与授权服务器保持一致
    );

    // 2. 包装成自定义实现
    return new CustomAuthoritiesOpaqueTokenIntrospector(delegate);
}
```

## 测试

拿code换access_token的流程跟前面是一样的，下面用access_token请求一下资源服务器的接口看看

/api/hello 接口因为有权限请求成功

![](/assets/images/1745313156578.png)

请求 /api/hello 接口时，资源服务器日志

![](/assets/images/1745313164580.png)

授权服务器日志

![](/assets/images/1745313171550.png)

## 总结

- jwt方式简单直接，对授权服务器压力比较小，一次授权能用很长时间，期间授权服务器处于闲置状态。适合内部系统且用户权限不经常变动的系统
- 自省令牌稍微麻烦点，对授权服务器压力大，每次请求都需要授权服务器校验，适合用户权限经常变动的系统。


