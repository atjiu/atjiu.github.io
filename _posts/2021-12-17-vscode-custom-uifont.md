---
layout: post
title: vscode 自定义UI字体
date: 2021-12-17 11:17:00
categories: 杂项
tags: vscode
author: 朋也
---

* content
{:toc}






最近又迷上了像素字体，在电脑上安装了一个`Minecraft` 和 `Zpix` 两款像素字体，Minecraft字体只有英文，Zpix作为修补显示中文

在 vscode  设置里配置好字体名后，编辑区就变成像素了

![](/assets/1639538472984.png)

但vscode的窗体ui还是默认的字体，下面来修改窗体的字体

找到vscode的安装位置，如果在安装vscode的时候没有特殊选择过目录位置，默认的位置就是 `C:\Users\[你的电脑名]\AppData\Local\Programs\Microsoft VS Code`

打开这个目录，找到 `C:\Users\[你的电脑名]\AppData\Local\Programs\Microsoft VS Code\resources\app\out\vs\workbench\workbench.desktop.main.css` 文件，打开它

![](/assets/1639538633906.png)

先格式化一下，然后搜索 `.windows` 会看到下图所示，然后在每个字体前面加上 `Minecraft,Zpix,` 就行了

![](/assets/1639538750633.png)

重启一下 vscode 整个界面就都是像素体了

![](/assets/1639538811865.png)

-------

下面是我用到的两个字体，需要的自取

- [Minecraft](/css/Minecraft.ttf)
- [Zpix](/css/Zpix.ttf)
