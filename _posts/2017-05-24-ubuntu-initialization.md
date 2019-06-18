---
layout: post
title: ubuntu16.04安装和配置[备忘]
date: 2017-05-24 10:44:11
categories: 杂项
tags: ubuntu
author: 朋也
---

* content
{:toc}

> 本文配置基于ubuntu16.04
>
> 如果 `sudo apt update` 很慢的话，可以用国内的源，比如：[http://mirrors.aliyun.com/](http://mirrors.aliyun.com/)

备忘一下我装Ubuntu的过程，后面用到了不用搜了

## 安装系统

做镜像可以用

1. rufus (windows) 开源地址 ：[https://github.com/pbatard/rufus](https://github.com/pbatard/rufus)
2. etcher (macos) 开源地址 ：[https://github.com/resin-io/etcher](https://github.com/resin-io/etcher)

做好了，插入电脑用U盘启动即可




## 安装软件

### 配置vim

如果系统没有vim命令，首先安装一下 `sudo apt install -y vim`

安装好了，找到配置文件，添加下面几行配置

```sh
sudo vim /etc/vim/vimrc
```

```
set nu               "显示行号
set smartindent      "智能的选择对齐方式
set tabstop=2        "设置tab键为2个空格
set shiftwidth=2
set expandtab
set softtabstop=2
set mouse=a          "使用鼠标
set nocompatible     "不与vi兼容
syntax on            "语法高亮
set showmode
set showcmd
set encoding=utf-8
filetype indent on   "开启文件类型检查，并且载入与该类型对应的缩进规则。比如，如果编辑的是.py文件，Vim 就是会找 Python 的缩进规则~/.vim/indent/python.vim
set linebreak        "只有遇到指定的符号（比如空格、连词号和其他标点符号），才发生折行。也就是说，不会在单词内部折行。
set wrapmargin=2     "指定折行处与编辑窗口的右边缘之间空出的字符数。
set t_Co=256
set autoindent
set cursorline
set  ruler
set showmatch
set hlsearch
set incsearch
set ignorecase
" set spell spelllang=en_us
set wildmenu
set wildmode=longest:list,full
```

有了这些简单的配置，vim用起来会舒服很多

### JDK安装

官网下载地址：[http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

oracle官网对下载做了些限制，需要加上一些参数

使用wget下载

```sh
wget -c --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.tar.gz
```

下载好了，配置到 `~/.bashrc` 文件中即可

### NodeJS安装

官网下载地址：[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

这个直接用wget下载即可，不用带后面那些参数

下载好了，后缀是 `.xz`

解压：`xz -d node-xxx.xz`
然后继续解压：`tar xf node-xx.tar`

最后配置到 `~/.bashrc` 文件中即可

### maven安装

下载地址：[http://maven.apache.org/download.cgi](http://maven.apache.org/download.cgi)

下载解压，配置到 `~/.bashrc` 文件中即可

### 安装Golang

下载地址：[https://golang.org/dl/](https://golang.org/dl/)

下载解压，配置到 `~/.bashrc` 文件中即可，go环境变量名字是固定的，分别是 `GOPATH` `GOROOT`

### 安装MySQL

```sh
sudo apt install -y mysql-server

//启动/停止/重启
sudo service mysql start/stop/restart

//客户端
sudo apt install -y mysql-workbench
```

### 安装Redis

```sh
sudo apt install -y redis-server

//启动/停止/重启
sudo service redis start/stop/restart
```

### 安装MongoDB

参考文档：[https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/](https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/)

简单摘录

```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64,ppc64el,s390x ] http://repo.mongodb.com/apt/ubuntu xenial/mongodb-enterprise/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list
sudo apt-get update
sudo apt-get install -y mongodb-enterprise

//启动/停止/重启
sudo service mongod start/stop/restart
```

### 配置服务器免密码登录

先在本机生成密钥

```sh
ssh-keygen -t rsa
//一直回车就可以了
```

然后把生成的文件上传到服务器中

```sh
scp ~/.ssh/id_rsa.pub root@192.168.1.11:/root/.ssh/
```

然后登录服务器将上传的文件内容添加到 `/root/.ssh/authorized_keys` 文件里

```sh
cat id_rsa.pub >> authorized_keys
```

要给 `authorized_keys` 文件600的权限

```sh
chmod 600 authorized_keys
```

退出来，在本机 `～/.ssh/` 下创建文件 `config` 添加下面内容

```sh
Host server
  HostName 192.168.1.11
  User root
  IdentityFile ~/.ssh/id_rsa
```

然后就可以用 `ssh server` 直接登录到服务器上了

**注意，不能打开 id_rsa.pub文件拷贝内容然后贴到服务器里的 authorized_keys 文件里，这样它是不认的**

### 安装Android-Studio

下载地址：[https://developer.android.com/studio/index.html](https://developer.android.com/studio/index.html)

制作启动程序

```sh
cd /usr/share/applications
sudo vim android-studio.desktop

# 添加下面内容

[Desktop Entry]
Name=Android Studio
Comment=Android developer tool
Exec=/home/tomoya/soft/android-studio/bin/studio.sh
Icon=/home/tomoya/soft/android-studio/bin/studio.png
Type=Application
StartupNotify=true

# 路径要自己修改一下
```

或者用工具来做 `.desktop` 文件

```sh
sudo apt install -y alacarte
```

### 安装Jetbrains/IDEA

下载地址：[http://www.jetbrains.com/products.html](http://www.jetbrains.com/products.html)

建议使用Toolbox安装，以后更新很方便

至于激活，就自己想办法吧，如果不差钱就买正版的吧

### 安装五笔输入法

系统装上默认是fcitx输入法，所以就直接装

```sh
sudo apt-get install fcitx-table-wbpy
```

装好重启即可

-----------------------------------

2018-08-30补充

今天又装了一下ubuntu16.04，默认安装了ibus，下面说一下安装开源的五笔输入法rime

```sh
sudo apt install ibus-rime
# 安装五笔 拼音 和 笔画
sudo apt-get install librime-data-wubi librime-data-pinyin-simp librime-data-stroke-simp
# 安装完重启ibus
ibus restart
```

在设置 – 文本输入中 添加 rime 输入法

Copy 五笔拼音 至 .config

```sh
sudo cp /usr/share/rime-data/wubi_pinyin.schema.yaml ~/.config/ibus/rime
```

编辑 default.yaml 配置，注释其它的输入法，开启wubi_pinyin

```sh
vim ~/.config/ibus/rime/default.yaml

# 加入wubi_pinyin 选项（或其他）
schema_list:
   - schema: wubi_pinyin
#  - schema: luna_pinyin
#  - schema: cangjie5
#  - schema: luna_pinyin_fluency
#  - schema: luna_pinyin_simp
#  - schema: luna_pinyin_tw
```

配置方法原文：https://blog.csdn.net/comenglish/article/details/51418229

### 安装Atom

下载地址：[http://atom.io/](http://atom.io/)

下载 `.deb` 包，安装：`sudo dpkg -i xx.deb` 如果出现错误，再运行：`sudo apt install -f` 安装一下依赖即可

配置Atom

如果在其它平台有用到sync-settings备份插件信息，可以配置一下同步过来，很方便，如果没有就不用看下面的配置了

安装上插件：`sync-settings` 将 github 上申请的 `personal access token` 和 `gistid` ，然后 `ctrl+shift+p` 输入 `sync settings: backup` 回车等待即可

### 安装Git客户端

很可惜，sourcetree没有linux平台的，只能用其它的了，我选的是 gitkraken

下载地址：[https://www.gitkraken.com/](https://www.gitkraken.com/)

下载还是下载`.deb`，然后直接安装即可

### 配置shadowsocks

官网：[http://shadowsocks.org/](http://shadowsocks.org/)

下载shadowsocks-qt5，开源地址：[https://github.com/shadowsocks/shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5) 安装指南：[https://github.com/shadowsocks/shadowsocks-qt5/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97](https://github.com/shadowsocks/shadowsocks-qt5/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

配置就是填上自己的shadowsocks帐号即可

---

今天又折腾了一个新的代理工具 openvpn， 安装方法如下

```bash
sudo apt install network-manager-openvpn-gnome openvpn-systemd-resolved
```

安装完成后， 导入服务端生成好的 xxx.ovpn 文件然后填上用户名密码就可以用了， 测试它是全局代理， 就连终端里都可以用

### 安装flash-player

虽然firefox禁用了flash，但国内的网站大还都用的是flash，还是要装一下的

```sh
sudo apt-get install flashplugin-installer
```

装好了刷新一下网页就可以用了

### 安装Wechat

微信没有linux平台下的版本，所以只能用Github上大神开源的了

开源地址：[https://github.com/geeeeeeeeek/electronic-wechat](https://github.com/geeeeeeeeek/electronic-wechat)

安装对着README.md里写的装就可以了

### 安装Telegram

下载地址：[https://desktop.telegram.org/](https://desktop.telegram.org/)

### 安装Steam

```sh
sudo apt install -y steam
```

装好，登上自己的帐号即可

---

搭建饥荒服务器, 不需要玩家自己机器开启服务

找到饥荒安装目录 `E:\SteamLibrary\steamapps\common\Don't Starve Together\bin` 我这装到E盘了, 根据自己安装目录找一下

在里面创建两个bat文件, 如果是linux就创建两个.sh文件(linux我没有测试, 不确定能否可行)

启动主世界 `start_master.bat`

```bash
dontstarve_dedicated_server_nullrenderer -console -cluster Cluster_1 -shard Master
```

启动洞穴 `start_caves.bat`

```bash
dontstarve_dedicated_server_nullrenderer -console -cluster Cluster_1 -shard Caves
```

其中 `Cluster_1` 是存档名字

启动这两个bat文件, 会在用户根目录下创建一个存档 `C:\Users\h\Documents\Klei\DoNotStarveTogether`

路径中的 h 是我当前登录的用户名, 根据自己的用户名修改一下即可

然后在steam里创建一个存档, 配置好mod 启动, 存档在这个位置 `C:\Users\h\Documents\Klei\DoNotStarveTogether\366284837\Cluster_1`

上面 366284837 是你的steam帐号的id

找到 Caves 和 Master 两个文件夹里的 `modoverrides.lua` 文件, 拷贝到脚本生成的存档目录中的 Caves 和 Master 两个文件夹里, 再次启动脚本即可

PS: 可以把上面两个脚本合并成一个脚本

```bash
@echo off
start /D "E:\SteamLibrary\steamapps\common\Don't Starve Together\bin" start_master.bat
start /D "E:\SteamLibrary\steamapps\common\Don't Starve Together\bin" start_caves.bat
```

这样只启动这一个脚本就可以了

---

### 安装Minecraft

官网：[http://minecraft.net/](http://minecraft.net/)

下载linux版的就可以了，直接用`java`运行就可以了

```sh
java -jar Minecraft.jar
```

登录自己的帐号就可以游戏了

常用的Mod下载地址：**基于forge的Mod最新只支持到MC的1.12.2版本**

- [forge](http://files.minecraftforge.net/)
- [liteloader](http://www.liteloader.com/)
- [autofish(自动钓鱼机，基于liteloader)](http://www.minecraftforum.net/forums/mapping-and-modding/minecraft-mods/1289421-autofish-mod-for-minecraft-1-11-2)
- [inventory tweaks(对背包，箱子物品排序)](https://mods.curse.com/mc-mods/minecraft/223094-inventory-tweaks)
- [Ore Sniffer(矿石探测器)](https://www.planetminecraft.com/mod/1710forge-ore-sniffer---v10/)
- [Keeping Inventory(死亡不掉落)](https://minecraft.curseforge.com/projects/keeping-inventory)
- [optfine(光影)](http://www.optifine.net/home)

材质包推荐

- [Bitbetter](https://minecraft.curseforge.com/projects/bitbetterx64)
- [Soartex-Fanver/Soartex-Invictus](https://soartex.net/downloads/)

服务端搭建jar包下载地址：[https://minecraft.net/en-us/download/server](https://minecraft.net/en-us/download/server)

### 安装网易云音乐

下载地址：[http://music.163.com/#/download](http://music.163.com/#/download)
直接下载`.deb`的文件，安装即可

### 安装MPV视频播放器

开源地址：[https://github.com/mpv-player/mpv](https://github.com/mpv-player/mpv)

下载地址：[https://mpv.io/installation/](https://mpv.io/installation/)

安装方法：

```sh
sudo add-apt-repository ppa:mc3man/mpv-tests
sudo apt-get update
sudo apt-get install mpv
```

配置mpv播放器

在 `~/.config` 里创建文件夹 `mpv` 然后新建两个文件，分别是 `input.conf` `mpv.conf`

input.conf

```sh
UP add volume 5
DOWN add volume -5
CTRL+[ add audio-delay -0.100
CTRL+] add audio-delay 0.100
# 回车键
ENTER cycle fullscreen
# 小键盘的回车
KP_ENTER cycle fullscreen
```

mpv.conf

```sh
# ontop
save-position-on-quit
script-opts=osc-layout=topbar
no-osd-bar
# 不显示windows边框
no-border
# #视频硬件解码API选择（因系统环境、显卡、驱动等差异硬件解码API方式（阅读官方参考手册查询）各有不同，建议实际测试验证后再填入可用API），默认值为 no（使用软件解码），auto 为自动。
hwdec=auto
# 加载视频文件的外部字幕文件方式。（fuzzy 加载含有视频文件名的全部字幕文件）
sub-auto=fuzzy
```

安装mpv播放器的插件，我这里安装两个常用的，播放列表和播放缩略图，插件下载地址

- 播放列表：[https://github.com/mpv-player/mpv/blob/master/TOOLS/lua/autoload.lua](https://github.com/mpv-player/mpv/blob/master/TOOLS/lua/autoload.lua)
- 缩略图下载地址：[https://github.com/TheAMM/mpv_thumbnail_script](https://github.com/TheAMM/mpv_thumbnail_script)

安装方法

在`~/.config/mpv`下创建文件夹`scripts`，然后将上面三个lua脚本复制到这个文件夹里，再次启动mpv即可，这时候就可以看到打开视频的文件夹里其它视频也都加入到mpv的播放列表里了，另外鼠标放在播放进度条上也可以看到缩略图了

## 默认软件设置

打开设置 -> 详细信息 -> 默认应用程序

把上面装好的网易云音乐，mpv选上默认吧

---

虚拟机安装 ubuntu 增强工具iso挂载不上解决办法

```bash
sudo apt-get update
sudo apt-get install virtualbox-guest-additions-iso
sudo apt-get install virtualbox-guest-utils
```

**失去菜单怎么找回来**

按右边的 ctrl + c

**不能共享粘贴板?**

关闭虚拟机, 打开设置 -> 存储 -> 使用主机输入输出(I/O)缓存 勾上就可以了

**安装openssh-server让其它机器可以通过ssh连接**

```bash
sudo apt install openssh-server
```
