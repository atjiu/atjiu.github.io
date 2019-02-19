---
layout: post
title: Angular7创建项目、组件、服务以及服务、路由的使用和父子组件间传值总结
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
{: .table.table-bordered }

使用命令创建组件有个好处就是cli会自动把这个组件引入到 `src/app/app.module.ts` 文件里，这样直接在其它文件里使用 `src/app/user/user.component.ts`里定义的`selector`,一般这个名字都是 `app-xxx` 后面xxx就是这个模块的名字，比如这里的user模块，就是 `app-user`

## 生命周期

angular的生命周期有很多，看下下图

![](https://angular.io/generated/images/guide/lifecycle-hooks/peek-a-boo.png)

这里只介绍二个

| 方法            | 说明                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| ngOnInit        | 组件加载时初始化变量或者网络请求时代码写在这里面                                             |
| ngAfterViewInit | 如果想对页面进行dom操作，最好在这个方法里操作，这个方法是在页面dom元素都加载完成后才调用的 |
{: .table.table-bordered }

## 创建服务

命令 `ng g service user/user` 执行完后，cli会自动创建两个文件在 `src/app/user` 文件夹里

如果想把服务也都放在一个文件夹里管理，可以在命令上加上一个服务的文件夹名字，如 `ng g service services/user`

| 服务文件名           | 说明                                                       |
| -------------------- | ---------------------------------------------------------- |
| user.service.ts      | 组件提供服务的主文件                                       |
| user.service.spec.ts | 组件提供服务文件的测试文件，写对服务测试的代码都放在这里面 |
{: .table.table-bordered }

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

  foo() {
    return new Observable((observe) => {
      let count = 0;
      setInterval(() => {
        observe.next(count++);
      }, 1000);
    })
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

## 父子组件传值

先说父给子传值

这里再创建一个组件 header 然后在user组件模板里引入

```bash
ng g component header
```

在 `user.component.html` 文件里加上header组件

```js
<app-header></app-header>
<p>
  user works!
</p>
```

既然是user中引入了header组件，那么这就相当于user是父组件，header是子组件

首先在user组件里定义一个变量，用于传递给子组件，我这里取名为 `pageTitle`

user.component.ts

```js
private pageTitle: string = "用户页面PageTitle"
```

另外在将这个变量绑定到子组件上，打开`user.component.html`页面，在引入header标签上绑定上这个变量

```html
<app-header [pageTitle]="pageTitle"></app-header>
<p>
  user works!
</p>
```

最后在子组件(header)里使用 `Input` 装饰品来接收就可以了代码如下

```js
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // 使用Input装饰器来接收父组件传过来的值，可以初始化也可以不初始化
  @Input() private pageTitle: string;

  constructor() { }

  ngOnInit() {
  }

}
```

这时候别忘了最后一步，要将pageTitle这个变量放在header组件里显示出来，要不然页面上没有效果的

header.component.html

```html
<p>{{pageTitle}}</p>
```

------

子组件给父组件传值

子给父传值要用到 `Output` `EventEmitter` 具体写法如下

首先在header组件里定义一个输出对象，EventEmitter有泛型，我这传个字符串，就用string，你要是传对象也可以写成对象名，然后再通过这个EventEmitter对象调用emit()方法将数据写出

```js
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() private pageTitle: string;
  // 初始化一个输出对象
  @Output() private outputValue: EventEmitter<string> = new EventEmitter();
  constructor() { }

  ngOnInit() {
    // 通过触发事件的方式装数据写出
    this.outputValue.emit('header传给user的值');
  }

}

```

然后就是在父组件里定义事件来监听数据的传输了，在`user`模板页面上的`app-header`标签上注册一个事件，`$event`是事件对象，这里传的有数据，所以这里要用到这个事件对象来接收数据，**注意这个事件名(outputValue)要跟header组件里声明的输出对象一致，至于后面outputValueReceive这个方法名就无所谓了**

```html
<app-header [pageTitle]="pageTitle" (outputValue)="outputValueReceive($event)"></app-header>
<p>
  user works!
</p>
```

最后在`user.component.ts`里定义这个方法接收即可

```js
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  private pageTitle: string = "用户页面Title"

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.foo()
      .subscribe(data => console.log(data));
  }

  // 接收子组件传回来的数据
  outputValueReceive(data) {
    console.log(data); // header传给user的值
  }

}
```

## ViewChild用法

这货也可以处理父子组件传值，不过它要更强大些，因为它可以直接拿到子组件的实例对象，这样就可以直接获取子组件里被public修饰的变量和方法了，具体用法如下

先在header组件里定义一个变量，然后在user组件里通过ViewChild拿到header组件的实例，用来获取这个变量的值

```js
public pageSubTitle: string = "我是header组件的副标题"
```

header里就定义这一个变量就好了，下面处理user组件，首先是user组件的模板页面，给引入的`app-header`标签加上一个名字 `#header` ，类似html/css里的id

user.component.html

```html
<app-header
  #header
  [pageTitle]="pageTitle"
  (outputValue)="outputValueReceive($event)"></app-header>
<p>
  user works!
</p>
```

然后在`user.component.ts`里通过ViewChild拿到header标签的实例，最后就可以用这个实例操作子组件里的变量和方法了（要是被public修饰的）

```js
import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  private pageTitle: string = "用户页面Title"

  // 通过ViewChild注入header标签对象，
  // 有了header标签对象，就可以在父组件里获取到header里public修饰的变量和方法了
  @ViewChild("header") private header: any;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.foo()
      .subscribe(data => console.log(data));
    // 直接通过header标签对象获取header组件里的pageSubTitle变量
    console.log(this.header.pageSubTitle);
  }

  outputValueReceive(data) {
    console.log(data)
  }

}
```

## 路由

最后来说一下路由用法，在创建项目的时候就提到了，有选择项目是否要带上路由，选是就默认加上路由了

带路由的项目初始化好之后，`src/app` 下会多一个 `app-routing.module.ts` 文件，它里面就是配置路由的文件了，另外在`app.component.html`文件里多了一行标签`<router-outlet></router-outlet>`，这里放的就是路由指向组件的模板文件内容

这里再创建一个组件`topic` `ng g component topic`

然后配置路由

app-routing.module.ts

```js
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// 引入组件
import { UserComponent } from './user/user.component';
import { TopicComponent } from './topic/topic.component';

// 配置路由
const routes: Routes = [{
  path: 'topic',
  component: TopicComponent
}, {
  path: 'user',
  component: UserComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**注意，配置路由中 path 的值开头不能用 / 否则会报错**

-----

路由参数获取

路由上参数有两种，一种是queryParams, 一种是路径参数

先说一下queryParams参数，样子就长这个样 `/topic/detail?id=123` `?` 后面的部分就是 queryParams 参数了

我这里再创建一个 `topicDetail` 组件，然后配置在路由中

app-routing.module.ts

```js
// 引入组件
import { UserComponent } from './user/user.component';
import { TopicComponent } from './topic/topic.component';
import { TopicDetailComponent } from './topic-detail/topic-detail.component';

// 配置路由
const routes: Routes = [{
  path: 'topic',
  component: TopicComponent
}, {
  path: 'user',
  component: UserComponent
}, {
  path: 'topic/detail',
  component: TopicDetailComponent
}];
```

在topic组件里写个超链接，格式如下

```html
<p>
  topic works!
</p>
<a [routerLink]="[ '/topic/detail' ]" [queryParams]="{id: 123, xxx: 'abc'}">话题标题，id:123</a>
```

然后在 `topic-detail.component.ts` 文件里注入一个路由对象，就可以通过路由对象来取值了

```js
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.scss']
})
export class TopicDetailComponent implements OnInit {

  // 通过构造方法注入路由对象
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // 路由对象被封装成rxjs对象了，所以要使用subscribe来取值
    this.activatedRoute.queryParams
      .subscribe(data => console.log(data)); // {id: "123", xxx: "abc"}
  }

}
```

-----

还有一种方式是路径参数 比如 `/topic/123` 这个 `123` 就是话题的id，只是通过路径来展示了

先把路由配置改一下，不能用上面那个配置方式了

app-routing.module.ts

```js
// 引入组件
import { UserComponent } from './user/user.component';
import { TopicComponent } from './topic/topic.component';
import { TopicDetailComponent } from './topic-detail/topic-detail.component';

// 配置路由
const routes: Routes = [{
  path: 'topic',
  component: TopicComponent
}, {
  path: 'user',
  component: UserComponent
}, {
  path: 'topic/:id',
  component: TopicDetailComponent
}];
```

在topic组件里写个超链接，格式如下

```html
<p>
  topic works!
</p>
<!-- <a [routerLink]="[ '/topic/detail' ]" [queryParams]="{id: 123, xxx: 'abc'}">话题标题，id:123</a> -->
<a [routerLink]="[ '/topic/', 123 ]">话题标题，id:123</a>
```

然后在 `topic-detail.component.ts` 文件里注入一个路由对象，就可以通过路由对象来取值了

```js
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.scss']
})
export class TopicDetailComponent implements OnInit {

  // 通过构造方法注入路由对象
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // 路由对象被封装成rxjs对象了，所以要使用subscribe来取值
    // this.activatedRoute.queryParams
    //   .subscribe(data => console.log(data)); // {id: "123", xxx: "abc"}
    this.activatedRoute.params
      .subscribe(data => console.log(data)); // {id: "123"}
  }

}
```

对比两种参数方式可以发现，路由配置方法变了，链接写法变了，获取参数对象也变了

## 总结

这篇博客有点长，本来想做一个专辑的，后来想想分开写的话，第一篇都会很少，看的肯定不过瘾，干脆就放一篇博客里算了

基本上把这些弄明白了，也就可以用angular开发前端项目了，中途再碰到问题网上搜一下也能很快解决了，这篇博客只是个入门级教程总结，也为也方便我对自学的东西的备份

希望能帮到正在折腾的你 : )
