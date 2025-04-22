---
layout: post
title: 【springsecurity oauth2授权中心】将硬编码的参数提出来放到 application.yml 里 P3
date: 2025-04-22 11:36:43
categories: springsecurity-oauth2授权中心
tags: spring-security oauth2
author: 朋也
---

* content
{:toc}







## 在application.yml里添加配置

application.yml
```yml
oauth2:
  client:
    id: client
    secret: secret
    authentication-method: client_secret_basic
    grant-types: authorization_code,refresh_token
    redirect-uris:
      - http://localhost:8081/login/oauth2/code/client
      - http://localhost:8081/login/oauth2/code/client2
    scopes: openid,user
    require-authorization-consent: true

  token:
    access-token-format: self_contained
    access-token-time-to-live: 2h

  server:
    issuer-uri: http://localhost:9000
```

## 创建对应的配置类

如果用lombok没问题的话，可以选择lombok，我用lombok的@Data注解去自动生成getter, setter，idea里没有报错信息，但启动服务时报错，然后我就都给换成自己的写的getter,setter。
```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "oauth2")
public class OAuth2Properties {
    private Client client;
    private Token token;
    private Server server;

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Token getToken() {
        return token;
    }

    public void setToken(Token token) {
        this.token = token;
    }

    public Server getServer() {
        return server;
    }

    public void setServer(Server server) {
        this.server = server;
    }
}

class Client {
    private String id;
    private String secret;
    private String authenticationMethod;
    private List<String> grantTypes;
    private List<String> redirectUris;
    private List<String> scopes;
    private boolean requireAuthorizationConsent;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getAuthenticationMethod() {
        return authenticationMethod;
    }

    public void setAuthenticationMethod(String authenticationMethod) {
        this.authenticationMethod = authenticationMethod;
    }

    public List<String> getGrantTypes() {
        return grantTypes;
    }

    public void setGrantTypes(List<String> grantTypes) {
        this.grantTypes = grantTypes;
    }

    public List<String> getRedirectUris() {
        return redirectUris;
    }

    public void setRedirectUris(List<String> redirectUris) {
        this.redirectUris = redirectUris;
    }

    public List<String> getScopes() {
        return scopes;
    }

    public void setScopes(List<String> scopes) {
        this.scopes = scopes;
    }

    public boolean isRequireAuthorizationConsent() {
        return requireAuthorizationConsent;
    }

    public void setRequireAuthorizationConsent(boolean requireAuthorizationConsent) {
        this.requireAuthorizationConsent = requireAuthorizationConsent;
    }
}

class Token {
    private String accessTokenFormat;
    private Duration accessTokenTimeToLive;

    public String getAccessTokenFormat() {
        return accessTokenFormat;
    }

    public void setAccessTokenFormat(String accessTokenFormat) {
        this.accessTokenFormat = accessTokenFormat;
    }

    public Duration getAccessTokenTimeToLive() {
        return accessTokenTimeToLive;
    }

    public void setAccessTokenTimeToLive(Duration accessTokenTimeToLive) {
        this.accessTokenTimeToLive = accessTokenTimeToLive;
    }
}

class Server {
    private String issuerUri;

    public String getIssuerUri() {
        return issuerUri;
    }

    public void setIssuerUri(String issuerUri) {
        this.issuerUri = issuerUri;
    }
}
```

## 替换AuthorizationServerConfig类里硬编码的参数

注入配置类
```java
private final OAuth2Properties oAuth2Properties;
publicAuthorizationServerConfig(OAuth2Properties oAuth2Properties) {
    this.oAuth2Properties = oAuth2Properties;
}
```

替换参数

```java
@Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient.Builder clientBuilder = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId(oAuth2Properties.getClient().getId())
                .clientSecret(oAuth2Properties.getClient().getSecret())
                .clientAuthenticationMethod(new ClientAuthenticationMethod(oAuth2Properties.getClient().getAuthenticationMethod()))
                .authorizationGrantTypes(grantTypes -> oAuth2Properties.getClient().getGrantTypes().forEach(gt -> grantTypes.add(new AuthorizationGrantType(gt))))
//                .redirectUri("http://localhost:8081/login/oauth2/code/client")
                .scope(OidcScopes.OPENID)
                .scopes(scopes -> scopes.addAll(oAuth2Properties.getClient().getScopes()))
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(oAuth2Properties.getClient().isRequireAuthorizationConsent()).build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
                        .accessTokenTimeToLive(oAuth2Properties.getToken().getAccessTokenTimeToLive())
                        .build());

        // 添加所有配置的重定向URI
        oAuth2Properties.getClient().getRedirectUris().forEach(clientBuilder::redirectUri);

        return new InMemoryRegisteredClientRepository(clientBuilder.build());
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(oAuth2Properties.getServer().getIssuerUri())
                .build();
    }
```

## 多redirect_uri处理

一个授权中心，多个应用服务器的情况下，所有应用服务器都会来请求这一个授权中心进行授权拿权限，但每个应用服务器都有自己的域名，这就会产生多种redirect_uri的问题

上面配置文件里和代码中已经处理好了，具体改动如下

```yml
oauth2:
  client:
    redirect-uris:
      - http://localhost:8081/login/oauth2/code/client
      - http://localhost:8081/login/oauth2/code/client2
```

```java
@Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient.Builder clientBuilder = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId(oAuth2Properties.getClient().getId())
                .clientSecret(oAuth2Properties.getClient().getSecret())
				// ...
				;

        // 添加所有配置的重定向URI
oAuth2Properties.getClient().getRedirectUris().forEach(clientBuilder::redirectUri);

        return new InMemoryRegisteredClientRepository(clientBuilder.build());
    }
```

## 测试

配置了两个回调地址，就可以使用如下两个链接来进行测试，结果都能正常拿到code

- http://localhost:9000/oauth2/authorize?response_type=code&client_id=client&redirect_uri=http://localhost:8081/login/oauth2/code/client&scope=user
- http://localhost:9000/oauth2/authorize?response_type=code&client_id=client&redirect_uri=http://localhost:8081/login/oauth2/code/client2&scope=user

