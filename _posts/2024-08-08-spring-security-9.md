---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 9.添加验证码
date: 2024-08-08 09:22:51
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







来给登录页添加一个验证码，并实现登录前自定义校验

## 生成验证码
使用`BufferedImage`将随机字符串画出来，然后再用`ImageIO`将图输出

```java
@GetMapping("/captcha")
fun captcha(req: HttpServletRequest, resp: HttpServletResponse) {
    // 设置响应的内容类型为图像
    resp.contentType = "image/jpeg"

    // 确保浏览器不会缓存图像
    resp.setHeader("Cache-Control", "no-cache, no-store")
    resp.setHeader("Pragma", "no-cache")

    // 创建图像缓冲区
    val width = 102
    val height = 42
    val bufferedImage = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
    val graphics = bufferedImage.graphics

    // 设置图像的背景色
    graphics.color = Color.WHITE
    graphics.fillRect(0, 0, width, height)

    // 设置图像的边框
    graphics.color = Color.GRAY
    graphics.drawRect(0, 0, width - 1, height - 1)

    // 生成随机验证码
    val captcha = generateCaptcha(4)

    // 将验证码存入SESSION，以便验证时使用
    req.session.setAttribute("captcha", captcha)

    // 将验证码绘制到图像上
    graphics.color = Color.BLACK
    graphics.font = Font("Arial", Font.BOLD, 24)
    graphics.drawString(captcha, 15, 30)

    // 释放资源
    graphics.dispose()

    // 将图像写入响应
    ImageIO.write(bufferedImage, "jpeg", resp.outputStream)
}

/**
 * 生成指定长度的数字验证码
 *
 * @param length 验证码的长度
 * @return 生成的验证码
 */
fun generateCaptcha(length: Int): String {
    val chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    val sb = StringBuilder()
    val random = Random()
    for (i in 0 until length) {
        val c = chars[random.nextInt(chars.length)]
        sb.append(c)
    }
    return sb.toString()
}
```

效果如下

![](/assets/images/1745310517314.png)

## 自定义过滤器

springsecurity底层就是一层又一层的过滤器，所以验证登录表单也是个servlet过滤器

```kotlin
package com.example.springsecuritydemo.security

import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils

@Component
class MyCheckParamsFilter : Filter {

    override fun doFilter(request: ServletRequest, response: ServletResponse, filterChain: FilterChain) {
        val request: HttpServletRequest = request as HttpServletRequest
        val response: HttpServletResponse = response as HttpServletResponse
        // 仅对登录提交做参数验证
        if (request.method.equals("post", ignoreCase = true) && request.servletPath.equals("/loginpost", ignoreCase = true)) {
            val username: String = request.getParameter("username")
            val password: String = request.getParameter("password")
            val code: String = request.getParameter("code")
            val captcha: String = request.session.getAttribute("captcha") as String

            val errorMsgs: MutableList<String> = mutableListOf()
            if (!StringUtils.hasText(username)) errorMsgs.add("用户名不能为空")
            if (!StringUtils.hasText(password)) errorMsgs.add("密码不能为空")
            if (!StringUtils.hasText(code)) errorMsgs.add("验证码不能为空")
            if (!StringUtils.hasText(captcha) || (StringUtils.hasText(code) && !code.equals(captcha, ignoreCase = true))) errorMsgs.add("验证码不正确")

            if (errorMsgs.isNotEmpty()) {
                response.contentType = "text/html;charset=UTF-8"
                request.session.setAttribute("loginpost_errors", errorMsgs)
                response.sendRedirect("/login")
                return
            } else {
                filterChain.doFilter(request, response)
            }
        } else {
            filterChain.doFilter(request, response)
        }
    }
}
```

## 配置过滤器

过滤器有了，需要将其加入到springsecurity里才能生效。

springsecurity登录时会获取表单的用户名和密码然后封装成一个`UsernamePasswordAuthenticationFilter`对象。我们要的效果是在进入springsecurity认证流程之前做一次表单校验，那么就需要将 `MyCheckParamsFilter `添加到 `UsernamePasswordAuthenticationFilter`之前

```kotlin
@Bean
open fun filterChain(http: HttpSecurity): SecurityFilterChain {
    http {
//            authorizeRequests {
//                authorize("/captcha", permitAll)
//                // 配置 /home 路径需要 ADMIN 权限
//                authorize("/home", hasAuthority("user:delete"))
//                // 配置所有请求地址都需要登录认证才能访问
//                authorize("/**", authenticated)
//            }
        authorizeHttpRequests {}
        formLogin {}
        // 添加自定义的过滤器到UsernamePasswordAuthenticationFilter之前执行
        addFilterBefore<UsernamePasswordAuthenticationFilter>(myCheckParamsFilter)
        logout {}
        csrf { disable() }
    }
    return http.build()
}
```

## 登录页面
修改一下登录页面
```html
<form th:action="@{/loginpost}" method="post">
    <fieldset>
        <legend>登录</legend>
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
<script type="text/javascript">
    //鼠标点击刷新验证码
    function updateCaptcha() {
        var captchaImg = document.querySelector("#captchaImg");
        captchaImg.setAttribute("src", "/captcha?ver=" + Date.now());
    }
</script>
```

## 测试

启动服务，打开浏览器，什么都不输入，点击登录，效果如下

![](/assets/images/1745310531770.png)

输入正确的用户名和密码但验证码输入错误，效果如下

![](/assets/images/1745310539994.png)

对`MyCheckParamsFilter`和`UsernamePasswordAuthenticationFilter`分别断点，点击登录，当表单校验失败的话，`UsernamePasswordAuthenticationFilter`里的 `attemptAuthentication`方法是不会进入的，确实被彻底阻断了

![](/assets/images/1745310549713.png)

## 总结

- 我们可以自己定义过滤器并添加到springsecurity框架的过滤器链里，用来执行更加灵活的自定义逻辑
- 在搜索资料过程中发现有直接继承`UsernamePasswordAuthenticationFilter`类并重写`attemptAuthentication`的做法，然后再将其添加到 `UsernamePasswordAuthenticationFilter`之前，这种方法会封装两遍 `UsernamePasswordAuthenticationToken` 对象，不推荐




