---
layout: post
title: 浏览器中serviceWorker用法
date: 2019-05-27 09:34:00
categories: javascript学习笔记
tags: pwa serviceWorker
author: 朋也
---

* content
{:toc}

上一篇博客介绍了PWA的用法，最后留了个serviceWorker用法没有说，这一篇来介绍一下

先上图

![](/assets/pwa-service-worker.gif)





先说一下流程：生成公/私钥 -> 浏览器中使用公钥注册服务 -> 服务端使用私钥推送 -> 浏览器中接收推送展示

流程图网上非常多，我这就不截图展示了

## 生成密钥

我这使用nodejs语言来实现，其它语言版本也有，不过没有nodejs用起来方便

创建一个文件夹 `push-demo` 在文件夹内安装 `web-push` 包依赖，然后创建一个 `test.js` 加上下面代码，运行即可

```js
const webpush = require("web-push");

// 生成公钥私钥
const vapidKeys = webpush.generateVAPIDKeys(); // 1.生成公私钥
console.log(vapidKeys);
```

结果如下

```
{ publicKey:
   'BK_LXU7DEQ5rAfk8kCNsa-5E9ntYKUoBemBjO-ZaEjpK3PFKCzpUAfYqlk1p2wmbsNBnYSRALpyddMDhHuspPag',
  privateKey: 'bC665pacSeHbHv9iY4H0106oUTJWTTyUAsbwEnXX1Mg' }
```

## 浏览器注册服务

有了公钥，就可以在浏览器里通过代码注册服务了，代码如下，注释都写好了，看一下就明白了

```js
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const publicKey =
  "BK_LXU7DEQ5rAfk8kCNsa-5E9ntYKUoBemBjO-ZaEjpK3PFKCzpUAfYqlk1p2wmbsNBnYSRALpyddMDhHuspPag";
// 判断浏览器是否支持serviceWorker，支持的话，注册服务
if ("serviceWorker" in navigator) {
  send().catch(err => console.error(err));
}

async function send() {
  console.log("Registering service worker...");
  // 这里要注册serviceWorker，要提前写一个js，（注意路径），后面接收推送就是在这个js里通过代码实现的
  // 这个js创建好就可以了，暂时不需要写东西
  navigator.serviceWorker.register("/sw.js").then(register => {
    // 判断浏览器是否有推送服务支持
    if (window.PushManager) {
      register.pushManager.getSubscription().then(subscription => {
        // 如果用户没有订阅
        if (!subscription) {
          // 调用浏览器api，提示用户是否开启网站推送服务
          register.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlB64ToUint8Array(publicKey) // 密钥还要将其转换一下，否则会报错，转换的代码是固定的，我这里用的就是网上找的
            })
            .then(subscription => {
              // 用户同意接收网站的消息推送，则发送一个请求跟服务端创建连接
              fetch("/subscription", {
                method: "post",
                body: JSON.stringify(subscription),
                headers: {
                  "content-type": "application/json"
                }
              });
            })
            .catch(err => console.log("用户没有同意开启通知...", err));
        } else {
          fetch("/subscription", {
            method: "post",
            body: JSON.stringify(subscription),
            headers: {
              "content-type": "application/json"
            }
          });
          console.log("You have subscribed our notification");
        }
      });
    }
  });
}
```

原接文链: [https://tomoya92.github.io/2019/05/27/pwa-service-worker/](https://tomoya92.github.io/2019/05/27/pwa-service-worker/)

## 服务端响应

如果浏览器端用户同意了接收推送服务的功能，然后发起了一个跟服务器保持连接的请求，服务端要做相应的处理，将传过来的数据持久化，后面发送推送要用到

浏览器如果同意，然后发送一个连接的请求，传给服务端的数据长这个样

如果是Chrome浏览器，则长下面这个样

```json
{
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cZdEewi209A:APA91bGo9U4c9ycxJkeIGRlpR-sl0eKafNvtLSVJd_kW--IDe7LY-N-YCsVqC4oLBE1DEKD6JHvVMuNxFq3ANgw9orH1Eo3-JLTRodNyYYn-5Xzz0IM80cfBFuDXWby8gdVudLMb96_j",
  expirationTime: null,
  keys: {
    p256dh:
      "BGMG0WgSZueddroRLDxxwFezTTtgby1tT7mJnTv-BDynkTAo_hjroyTfuWa6zbpr6R9xkqPt-rN3mvZnIPwMwpk",
    auth: "wWYPAHPDCnAE8y6oTPWj-w"
  }
}
```

如果是firefox浏览器则长下面这个样

```json
{
  endpoint:
    "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABc57EZB3ZRqMvOUXfFkXY_CXowfxF45Kr76pyMPTeA6vCgEBWieKYC2dwoqsXRkibhavFh9xJwK1llZwnDfCzGIEiMJxFMgQcHp69meonmL1Wlu8ij_MTwlsf54Y-die8D9wIpMjkjnl9wiWVezcapOFBSRzbBA_nfwUtHpkTBG1w6iXs",
  keys: {
    auth: "4kTmhdWGaWLoZReISaXj1w",
    p256dh:
      "BKadOZ_MoS_GTdtYMhuCdWoO5S_gcerg71dD-Pk0YpHXpzyD5JKLS9FsWPhPXWgB1Ca0H74cRsUlufruMNzc5Mo"
  }
}
```

我这里是将其入库，有推送的时候，直接查询然后调用推送方法直接推送消息

```js
exports.subscription = async (ctx) => {
  // 获取user-agent用于判断浏览器
  const user_agent = ctx.headers['user-agent'];
  // 获取订阅的信息，入库时将其转成字符串保存即可
  const subscription = ctx.request.body;
  const user = ctx.session.user;

  let chrome_subscription, firefox_subscription;
  if (user_agent.indexOf('Chrome') > -1) chrome_subscription = subscription;
  if (user_agent.indexOf('Firefox') > -1) firefox_subscription = subscription;

  await user_service.update_user_subscription_by_id(
    user.id,
    JSON.stringify(chrome_subscription),
    JSON.stringify(firefox_subscription)
  );
  ctx.response.status = 201;
  ctx.body = {};
};
```

## 发送推送

众所周知，国内google的服务是请求不通的，所以我这用firefox的推送服务来演示

首先在上面注册时写的`sw.js`文件里实现接收推送消息的代码

原接文链: [https://tomoya92.github.io/2019/05/27/pwa-service-worker/](https://tomoya92.github.io/2019/05/27/pwa-service-worker/)

```js
// 接收推送消息事件
self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  let notificationData = event.data.json();

  // 弹消息框
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );

});

// 通知被点击了的事件，比如打开一个链接之类的
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click Received.");

  let notification = event.notification;
  notification.close();

  // event.waitUntil(self.clients.openWindow(notification.action));
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window"
      })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.notification.url === "/" && "focus" in client) {
            // return client.focus();
            return self.clients.openWindow(client.notification.url);
          }
        }
        if (self.clients.openWindow && notification.data.url) {
          return self.clients.openWindow(notification.data.url);
        }
      })
  );
});
```

服务端推送消息

```js
const webpush = require("web-push");

let publicKey = 'BK_LXU7DEQ5rAfk8kCNsa-5E9ntYKUoBemBjO-ZaEjpK3PFKCzpUAfYqlk1p2wmbsNBnYSRALpyddMDhHuspPag';
let privateKey = 'bC665pacSeHbHv9iY4H0106oUTJWTTyUAsbwEnXX1Mg';

webpush.setVapidDetails(
  "mailto:py2qiuse@gmail.com",
  publicKey,
  privateKey
);

const firefoxSubscription = {
  endpoint:
    'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABc61hnBVOJZIOLZgSN7x8Pom_AKoVvE4yAaCi0wnWaXv05FAVGx2tlMSPAkKCaj_DnYDzmyWRJGwofpuYuXDiDPX2RSNUmTiXfgTP55t9c82UzFdeZvvkvqr2vdD-H1QIfIGd3LJzh58Pd6SRey2su91F160ilKsz_3AOzGAEv_FloXeY',
  keys:
    {
      auth: '9-beSGAEs_f5JM4Dkit-vw',
      p256dh:
        'BEfxlwj1XLIEBWFa-Bc7TS2aMQLcJK9H0mSbl5OSkN1vFPAEJJZRfeHDpz09JDUx6QhA9YG7Wjm7d7dXq10ixQ4'
    }
};

// push的数据
const payload = {
  title: "测试推送",
  body: "推送内容，一串链接，点击打开",
  icon: "https://yiiu.co/favicon.ico",
  data: {url: "https://tomoya92.github.io/pybbs/", text: 'hello world'},
};

// 发送通知
webpush.sendNotification(firefoxSubscription, JSON.stringify(payload));
```

运行代码，firefox上就可以收到一条推送消息了

---

补充：payload的数据格式这见个是固定的，如果你想自定义一些数据，可以写在data对象里，在sw.js里点击事件里可以获取到，然后做相应的处理

sw.js里的点击通知事件回调参数里有一个 notification 对象，这个对象就是在 接收通知事件里打开通知的方法中传入的第二个参数对象，如果传的是服务端推送的消息对象，那也就是payload对象，可以直接拿data中的url通过调用 openWindow()方法打开这个链接

不得不说，还是chrome方便，可以直接对sw.js里的代码进行调试，在firefox上开发调试真心麻烦 。。。
