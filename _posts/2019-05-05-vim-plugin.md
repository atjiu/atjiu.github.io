---
layout: post
title: vim中插件推荐, 不定期更新(发现好用的插件就更新)
date: 2019-05-05 11:29:00
categories: 杂项
tags: vim
author: 朋也
---

* content
{:toc}

上一篇介绍了vim的常用快捷键的配置, 插件安装没有说, 这一篇来推荐一些插件以及常规用法





首先安装 [vim-plug](https://github.com/junegunn/vim-plug) 

在终端里贴上下面命令, 回车就会自动安装了

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

如果是windows的话, 则在powershell里贴上下面命令然后回车

```bash
md ~\vimfiles\autoload
$uri = 'https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'
(New-Object Net.WebClient).DownloadFile(
  $uri,
  $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath(
    "~\vimfiles\autoload\plug.vim"
  )
)
```

原链接文：[https://tomoya92.github.io/2019/05/05/vim-plugin/](https://tomoya92.github.io/2019/05/05/vim-plugin/)

上面这两条命令都是readme里的, 请以github上的readme为主, **注意这只是安装了插件管理器, 还不是插件**

---

**基础配置**

上一篇也提到了, 可以到github上找一个vimrc, 拷贝下来, 贴到自己用户根目录下的 `.vimrc` 文件里, 我找到的是这个 https://github.com/amix/vimrc/blob/master/vimrcs/basic.vim  你也可以选择其它的, 这个配置不带行号显示, 以及鼠标支持

加上下面配置就支持了

```
set nu       "显示行号
set mouse=a  "鼠标支持
```

---

**推荐插件**

首先肯定是 [nerd tree](https://vimawesome.com/plugin/nerdtree-red) 了, 这个插件装上之后可以像ide一样, 多一个sidebar, 大致就长这个样

![](/assets/QQ20190505-134426@2x.png)

安装插件方法

在网站 [vimawesome](https://vimawesome.com/)上搜索到nerd tree插件后, 点击进入, 页面上就有安装方法, 下面大致说一下

找到当前用户根目录下的 `~/.vimrc` 文件, 打开, 贴上下面代码

```
call plug#begin('~/.vim/plugged')

    Plug 'scrooloose/nerdtree'

call plug#end()
```

保存后, 在vim命令模式下运行 `:PlugInstall` 命令, 就会自动安装了

卸载插件方法

将 `.vimrc` 里要卸载的插件删除掉, 然后重新加载一下 `.vimrc` 文件, 再次运行 `:PlugClean` 会有个提示, 是否删除所有的插件(其实是删除的那些插件, 没有删除的插件它是不会删除的) 直接输入y回车即可

安装好之后, nerd tree插件不会自动启动, 还要在 `.vimrc` 里加一行代码 `autocmd vimenter * NERDTree`, 再次启动vim, 就可以看到上图样子的界面了

装是装上了, 但怎么用呢? 

nerd tree 只需要记住一个命令就可以了, 光标在左边窗口中, 命令模式下按 m 即可调出菜单, 长下图这个样

![](/assets/QQ20190505-135111@2x.png) 

然后就可以通过选择左边的 a,b,c,d,e...来进行相应的操作了

原链接文：[https://tomoya92.github.io/2019/05/05/vim-plugin/](https://tomoya92.github.io/2019/05/05/vim-plugin/)

---

插件基本上就是这样安装的, 下面介绍几个其它的插件

**Markdown插件**

[Markdown Syntax](https://vimawesome.com/plugin/markdown-syntax) 安装好之后, 打开markdown文档, 会发现文档很多部分都折叠了, 在`.vimrc`里加上下面这句话, 就可以解决

```
let vim_markdown_folding_disabled = 1
```

这个插件还可以格式化markdown文档中的table, 不过它依赖另一个插件 [tabular](https://vimawesome.com/plugin/tabular)

将这个插件安装好之后, 打开一篇带有table的markdown文档, 然后在命令模式下输入 `:TableFormat` 回车即可

---

**主题插件**

[vim-colorschemes](https://vimawesome.com/plugin/vim-colorschemes-sweeter-than-fiction)

这个插件将好之后, 在`.vimrc` 里加上下面这行代码就可以换主题了 

```
colorscheme molokai
```

它总共就两个主题, 这个比较遗憾, 还有一个是默认的 `wombat` 我觉得还是 `molokai` 好看

--- 

本来还想介绍一个自动完成的插件, 我在折腾的时候出了点问题, 后面再更新吧!
