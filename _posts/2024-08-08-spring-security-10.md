---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 10.异常处理（上）
date: 2024-08-08 11:05:05
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







当验证码输入正常，但用户名或密码输入错误时，可以看到控制台里有错误信息，但页面上除了链接后面加了个 `?error`外，什么提示都没有

![](/assets/images/1745310669809.png)

这篇来处理一下springsecurity认证授权的异常

## 查源码

在`SecurityConfig.kt`里配置 `HttpSecurity` 的地方，有一个 `formLogin`的配置

![](/assets/images/1745310681690.png)

点进去可以看到 `formLogin`里面还有这么多属性

```kotlin
@SecurityMarker
class FormLoginDsl {
    var loginPage: String? = null
    var authenticationSuccessHandler: AuthenticationSuccessHandler? = null
    var authenticationFailureHandler: AuthenticationFailureHandler? = null
    var failureUrl: String? = null
    var loginProcessingUrl: String? = null
    var permitAll: Boolean? = null
    var authenticationDetailsSource: AuthenticationDetailsSource<HttpServletRequest, *>? = null
    var usernameParameter: String? = null
    var passwordParameter: String? = null

    private var defaultSuccessUrlOption: Pair<String, Boolean>? = null
```

根据属性名可知

- `authenticationSuccessHandler` 是认证成功的操作逻辑
- `authenticationFailureHandler` 是认证失败的操作逻辑

而 `AuthenticationFailureHandler`是一个接口，并有如下这些已经实现的类

![](/assets/images/1745310692977.png)

打开 `AbstractAuthenticationProcessingFilter` 可以看到springsecurity默认给的failureHandler其实是 `SimpleUrlAuthenticationFailureHandler`

![](/assets/images/1745310704185.png)

打开 `SimpleUrlAuthenticationFailureHandler`可以看到出异常的话，会跳转或重定向到一个 `defaultFailureUrl`的地址上

![](/assets/images/1745310713175.png)

往上翻，能看到这个`defaultFailureUrl`参数是通过构造方法传进来的

![](/assets/images/1745310720553.png)

而 `SimpleUrlAuthenticationFailureHandler` 的构造方法又在 `AbstractAuthenticationFilterConfigurer`里被调用并传了一个 `authenticationFailureUrl`

![](/assets/images/1745310729375.png)

`failureUrl()`在当前类里被调用，并将 `loginUrl`的值拼接上了 `?error` 传入了

![](/assets/images/1745310738432.png)

所以`SimpleUrlAuthenticationFailureHandler`里的 `defaultFailureUrl`就来自于在`SecurityConfig.kt`里配置的`loginUrl`了。
所以这里也没必要再重新在`SecurityConfig.kt`里配置一遍

![](/assets/images/1745310746395.png)

回到`SimpleUrlAuthenticationFailureHandler`里，当出现异常时，会调用一个`saveException()`方法用来处理异常信息的响应

如果是跳转，就会将异常放进 request 里返回，如果是重定向，就会放进 session里返回

![](/assets/images/1745310754569.png)

而 `SimpleUrlAuthenticationFailureHandler` 里默认的跳转方式是重定向 `private boolean forwardToDestination = false;`

所以异常信息就被放在了 session 里，键是 `WebAttributes.AUTHENTICATION_EXCEPTION` ，也就是 `SPRING_SECURITY_LAST_EXCEPTION`

![](/assets/images/1745310767607.png)

看到这就知道怎么在页面上取异常信息了

## 登录页

```html
<form th:action="@{/loginpost}" method="POST">
    <fieldset>
        <legend>登录</legend>
        <!-- 从session中获取异常信息 -->
        <p th:text="${#ctx.session.SPRING_SECURITY_LAST_EXCEPTION?.message}" style="color:red;"></p>
        <ul>
            <li th:each="msg : ${#ctx.session.loginpost_errors}" th:text="${msg}"></li>
        </ul>
        <label for="username">用户名</label><br>
        <input type="text" name="username" id="username" placeholder="用户名"> <br>
        <label for="password">密码</label><br>
        <input type="password" name="password" id="password" placeholder="密码"> <br>
        <label for="code">验证码</label><br>
        <input type="text" name="code" id="code" placeholder="验证码"> <img th:src="@{/captcha}" alt="Captcha" id="captchaImg" onclick="updateCaptcha()"><br>
        <button type="submit">登录</button>
    </fieldset>
</form>
```

看一下效果

![](/assets/images/1745310778354.png)

异常信息是英文的，springsecurity框架里给提供了国际化

![](/assets/images/1745310786145.png)

所以只需要修改一下浏览器的请求接收语言为中文就行了

![](/assets/images/1745310793772.png)

以firefox为例，设置位置在

![](/assets/images/1745310801473.png)

## 总结

- springsecurity默认提供了`SimpleUrlAuthenticationFailureHandler`的异常处理方式，我们只需稍加利用它定的规则就行了
- spring框架对国际化支持的很好，不过要浏览器进行配合

