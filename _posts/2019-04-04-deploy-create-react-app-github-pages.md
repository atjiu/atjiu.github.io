---
layout: post
title: create-react-app创建的项目部署在github pages上的方法，顺便绑定个人域名，增加https支持
date: 2019-04-04 10:00:00
categories: 杂项
tags: github-pages
author: 朋也
---

* content
{:toc}

去年把自己折腾的一些项目整理了一下，然后用react开发了一个页面展示，一直都是打包好后，用nginx部署在自己的小水管服务器上的，今天弄了一下github pages, 还真让我折腾成功了，目前访问上没有变化，只是服务器从我个人服务器转到了github pages服务，折腾过程分享给大家






## 开发项目

yiiu.co 我用的是 `create-react-app` 脚手架开发的，很简单的一个页面，只做了展示就一个首页

## 打包

开发好之后使用 `yarn build` 打包，这样在项目根目录下会有一个 `build` 文件夹

我之间的做法就是把这个文件夹拷贝到个人服务器上，然后通过nginx映射这个文件夹，当成静态资源访问来部署的服务

## 在github上创建项目

项目名一定要以个人github用户名或者组织名为前缀，以 `.github.io` 结尾

比如我这个项目是放在 `yiiu-co` 组织里的，所以这个项目名就是 `yiiu-co.github.io` 这是固定的

然后将开发好的项目push到github上

原链文接：[https://blog.yiiu.co/2019/04/04/deploy-create-react-app-github-pages/](https://blog.yiiu.co/2019/04/04/deploy-create-react-app-github-pages/)

## 安装deploy到github pages的依赖

```bash
npm i --save-dev gh-pages
```

在项目`package.json`文件里的 `scripts` 对象里添加上

```json
"script": {
  "build": "react-scripts build",
  "deploy": "gh-pages -b master -d build"
}
```

deploy命令里执行的 `-b` 表示发布到哪个分支下，`-d` 表示将哪个文件夹内容发布到指定的分支下

到这一步，先不要动其它的东西了，把代码提交了

## 在github上创建一个分支

为啥要做这一步，因为github pages有个提示 `User pages must be built from the master branch.`

所以master就只能作为存放build文件夹下文件的内容了，但项目的源码放哪呢？这就需要创建分支了，通过分支来维护，我这创建的分支是 `dev`

创建好 `dev` 分支之后，回到项目里，更新项目，切换到 `dev` 分支，然后在项目里的`public` 文件夹里添加上几个文件

- CNAME  这个是填写绑定个人域名的内容，如果你不绑定个人域名的话，就不需要这个了
- .gitignore  这个是去掉一些不需要提交的内容
- README.md  这个是对项目的描述内容，如果你不想加也无所谓

然后再打包一次 `yarn build`

## 部署

在打包好之后，运行 `yarn deploy` 来发布，注意这一步会直接覆盖掉`master`分支里的所有内容，发布成功后，`master` 分支里的内容就是项目打包之后`build`文件夹里的内容

这也就是上一步为啥要在 `dev` 分支下的`public`文件夹下创建CNAME文件的原因了，因为每次`yarn build`都会把`public`文件夹下的所有文件复制到`build`文件夹下，这样就不用手动添加了

链原文接：[https://blog.yiiu.co/2019/04/04/deploy-create-react-app-github-pages/](https://blog.yiiu.co/2019/04/04/deploy-create-react-app-github-pages/)

## 开启github pages

进入github项目页面，找到 `Settings` 选项，往下翻，找到 `Github Pages` 位置，这时你就可以看到github将你网站发布的地址了，直接访问即可，比如我这个项目在没有绑定域名的情况下的访问地址就是 https://yiiu-co.github.io ，访问没有问题就可以绑定个人域名了

## 绑定域名

首先在 `dev` 分支里，找到上面添加的 `CNAME` 文件，在里面添加上你的个人域名，我这绑定的域名是 `yiiu.co` 所以内容就写上 `yiiu.co` 即可

提交代码

然后还是在Github项目页面找到 `Settings`，在`Github Pages`位置里的 `Custom domain` 填上个人域名，不用带`http://`

## 域名解析

到你购买域名的服务商那去，设置域名的A记录解析，将域名的A记录解析到以下见个ip

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

解析成功后，可以通过命令 `dig +noall +answer yiiu.co` 来查看域名解析状态，当然这里的域名要换成你的域名

## 开启https

如果上面操作都没有问题了，就可以去开启https了

还是在Github项目页面找到 `Settings`，在`Github Pages`位置，将 `Enforce HTTPS `前的 `checkbox` 勾上，剩下的就是等待了

## 总结

经过上面折腾的这些之后，这个项目再有更新，在开发好之后，运行两次命令

```bash
yarn build
yarn deploy
```

就可以自动打包发布到github pages上，代码也有地方放的了，还不需要自己提供服务器，感谢Github的强大

## 参考

- [https://medium.com/the-andela-way/how-to-deploy-your-react-application-to-github-pages-in-less-than-5-minutes-8c5f665a2d2a](https://medium.com/the-andela-way/how-to-deploy-your-react-application-to-github-pages-in-less-than-5-minutes-8c5f665a2d2a)
- [https://help.github.com/en/articles/using-a-custom-domain-with-github-pages](https://help.github.com/en/articles/using-a-custom-domain-with-github-pages)

写博客不易，转载请保留原文链接，谢谢!