---
layout: post
title: Angular7创建项目、组件、服务以及服务的使用
date: 2019-02-18 17:27:00
categories: Angular学习笔记
tags: Angular
author: 朋也
---

* content
{:toc}

> 三大前端项目就剩angular没学了，在网上找了几个教程，这里总结一下，方便以后用到时查阅

## 创建项目

首先安装cli工具

```bash
npm install -g @angular/cli
```

创建一个空项目, 有两处要选择的，一个是路由，我这里是要路由的，还有一个开发css的语言，我这里选择scss，就不截图了，选完后会自动通过yarn安装依赖，稍等一会就好了

```bash
ng new pybbs-front-angular
```





创建好了，运行 `npm run start` 或者 `ng serve` 启动服务，然后就可以在浏览器里打开 `http://localhost:4200/` 地址查看启动后的首页了

## 创建组件

命令 `ng g component user` 执行完后，会在 `src/app` 目录下生成一个user的文件夹，里面有四个文件

如果想把组件都放在一个文件夹里管理，也可以在创建的时候加上一个文件夹名字，比如把所有的组件都放在 `components` 文件夹里，命令就是这样的 `ng g component components/user`

| 页面名                 | 说明           |
| ---------------------- | -------------- |
| user.component.html    | 组件模板文件   |
| user.component.scss    | 组件的样式文件 |
| user.component.spec.ts | 组件测试文件   |
| user.component.ts      | 组件文件       |

使用命令创建组件有个好处就是cli会自动把这个组件引入到 `src/app/app.module.ts` 文件里，这样直接在其它文件里使用 `src/app/user/user.component.ts`里定义的`selector`,一般这个名字都是 `app-xxx` 后面xxx就是这个模块的名字，比如这里的user模块，就是 `app-user`

## 生命周期

angular的生命周期有很多，看下下图

![](https://angular.io/generated/images/guide/lifecycle-hooks/peek-a-boo.png)

这里只介绍二个

| 方法            | 说明                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| ngOnInit        | 组件加载时初始化变量或者网络请求时代码写在这里面                                             |
| ngAfterViewInit | 如果想对页面进行dom操作，最好在这个方法里操作，这个方法是在页面dom元素都加载完成后才调用的 |

## 创建服务

命令 `ng g service user` 执行完后，cli会自动创建两个文件在 `src/app/user` 文件夹里

如果想把服务也都放在一个文件夹里管理，可以在命令上加上一个服务的文件夹名字，如 `ng g service services/user`

| 服务文件名           | 说明                                                       |
| -------------------- | ---------------------------------------------------------- |
| user.service.ts      | 组件提供服务的主文件                                       |
| user.service.spec.ts | 组件提供服务文件的测试文件，写对服务测试的代码都放在这里面 |

服务创建好了之后，没有创建组件那么方便了，还需要自己配置一下，打开 `src/app/app.component.ts` 文件

在文件内引入，然后将服务注入到 providers 里

```js
import { UserService } from './user/user.service';

@NgModule({
  providers: [
    UserService
  ]
})
```

首先添加一个服务 user.service.ts

```js
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  constructor(private http: HttpClient) { }

  fetchGithubApi() {
    return new Observable((observe) => {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      this.http.get('https://api.github.com', httpOptions)
        .subscribe((data: any) => {
          observe.next(data.detail);
          // 如果有错误，通过 error() 方法将错误返回
          // observe.error(data.description);
        });
    });
  }
}
```

打开 `user.component.ts` 文件，使用这个服务里定义的方法，代码如下

引入服务文件，然后初始化，这里初始化有两种方式，一种 `private userService: UserService = new UserService()`，另一种是通过构造方法注入

```js
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.fetchGithubApi()
      .subscribe(data => console.log(data), error => console.log(error));
  }

}
```


**说明：上面例子中请求接口用的是 angular 内置好的 rxjs 模块，你也可以换成流行的 axios 或者其它的框架**
