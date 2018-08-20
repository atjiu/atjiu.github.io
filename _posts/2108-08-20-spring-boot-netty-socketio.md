---
layout: post
title: 在spring-boot项目里集成netty-socketio实现服务器给页面推送消息通知
date: 2018-08-20 16:09:00
categories: spring-boot学习笔记
tags: spring-boot netty-socketio socket websocket
author: 朋也
---

* content
{:toc}

## 引入依赖

新建一个spring-boot项目，不多说，可以用IDEA或者在 `start.spring.io` 上创建 spring-boot 项目

netty-socketio 可以去github上找最新的版本 [https://github.com/mrniko/netty-socketio](https://github.com/mrniko/netty-socketio)

```xml
<dependency>
  <groupId>com.corundumstudio.socketio</groupId>
  <artifactId>netty-socketio</artifactId>
  <version>1.7.7</version>
</dependency>
```





## 配置Socket

```java
@org.springframework.context.annotation.Configuration
public class SocketConfig {

  @Bean
  public SocketIOServer socketIOServer() {
    Configuration config = new Configuration();
    config.setHostname(siteConfig.getSocket().getHostname());
    config.setPort(siteConfig.getSocket().getPort());

    // 协议升级超时时间（毫秒），默认10000。HTTP握手升级为ws协议超时时间
    config.setUpgradeTimeout(10000);

    // Ping消息间隔（毫秒），默认25000。客户端向服务器发送一条心跳消息间隔
    config.setPingInterval(25000);

    // Ping消息超时时间（毫秒），默认60000，这个时间间隔内没有接收到心跳消息就会发送超时事件
    config.setPingTimeout(60000);

    // 握手协议参数使用JWT的Token认证方案
//    config.setAuthorizationListener(data -> {
      // 可以使用如下代码获取用户密码信息
//      String token = data.getSingleUrlParam("token");
//      return true;
//    });

    return new SocketIOServer(config);
  }

  @Bean
  public SpringAnnotationScanner springAnnotationScanner(SocketIOServer socketServer) {
    return new SpringAnnotationScanner(socketServer);
  }
}
```

## 创建启动服务类

```java
@Component
@Order(1)
public class SocketServerRunner implements CommandLineRunner {

  @Autowired
  private SocketIOServer server;

  @Override
  public void run(String... args) {
    server.start();
  }
}
```

这个服务有点问题，每次重启spring-boot项目的时候，这个服务不能及时关闭，关闭spring-boot项目的web服务后，等个几秒再启动即可，如果立即启动会报socket 端口被占用的异常

## 创建事件handler

```java
@Component
public class SocketEventHandler {

  private Map<String, Object> socketMap = new HashMap<>();
  private Logger logger = LoggerFactory.getLogger(SocketEventHandler.class);

  @Autowired
  private SocketIOServer server;

  @OnConnect
  public void onConnect(SocketIOClient client) {
    String username = client.getHandshakeData().getSingleUrlParam("username");
    logger.info("用户{}上线了, sessionId: {}", username, client.getSessionId().toString());
    socketMap.put(username, client);
    // notification count
    long count = 10; // 这一步可以通过调用service来查数据库拿到真实数据

    Map<String, Object> map = new HashMap<>();
    map.put("count", count);
    client.sendEvent("notification", map);
  }

  @OnDisconnect
  public void onDisConnect(SocketIOClient client) {
    String[] username = new String[1];
    socketMap.forEach((key, value) -> {
      if (value == client) username[0] = key;
    });
    logger.info("用户{}离开了", username[0]);
    socketMap.remove(username[0]);
  }

  // 自定义一个notification事件，也可以自定义其它任何名字的事件
  @OnEvent("notification")
  public void notification(SocketIOClient client, AckRequest ackRequest, Message message) {
    String topicUserName = (String) message.getPayload().get("topicUserName");
    String username = (String) message.getPayload().get("username");
    String title = (String) message.getPayload().get("title");
    String titleId = (String) message.getPayload().get("id");
    String msg = "用户: %s 评论了你的话题: <a href='/topic/%s'>%s</a>";

    // notification count
    long count = 10;

    Map<String, Object> map = new HashMap<>();
    map.put("count", count);
    map.put("message", String.format(msg, username, titleId, title));
    if(socketMap.get(topicUserName) != null) ((SocketIOClient)socketMap.get(topicUserName)).sendEvent("notification", map);
  }

}
```

## 页面逻辑

```js
<script src="/static/js/socket.io.js"></script>  <!--我这把js放在本地了，可以去 https://www.bootcdn.cn/socket.io/ 下载-->
<script>
  var socket = io.connect('http://localhost:9092/?username=tomoya');
  // socket.on('connect', function () {});
  // socket.on('disconnect', function () {});
  socket.on('notification', function (data) {
    if (data.message) alert(data.message);
    if (data.count > 0) {
      $("#n_count").text(data.count);
    }
  });
</script>
```

## 参考

源码地址 [pybbs](https://github.com/tomoya92/pybbs)

- [https://github.com/yidao620c/SpringBootBucket/tree/master/springboot-socketio](https://github.com/yidao620c/SpringBootBucket/tree/master/springboot-socketio)
