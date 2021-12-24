---
layout: post
title: 使用Canvas绘制罗盘时钟
date: 2021-12-23 15:40:00
categories: javascript学习笔记
tags: canvas
author: 朋也
---

* content
{:toc}






惯例先上效果

<iframe src="http://localhost:4000/canvas-clock.html" width="850" height="850"></iframe>

## 绘制线条

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // 开始路径绘制
    ctx.beginPath();
    // 将画笔移动到原点
    ctx.moveTo(10, 10);
    // 绘制一条线
    ctx.lineTo(200,10);
    // 再绘制一条线
    ctx.lineTo(10,200);
    // 关闭路径
    ctx.closePath();
    // 绘制路径
    ctx.stroke();
</script>
```

效果：
![](/assets/1640332748546.png)

如果要绘制填充的话，可以使用fill()方法，如下：

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // 开始路径绘制
    ctx.beginPath();
    // 将画笔移动到原点
    ctx.moveTo(10, 10);
    // 绘制一条线
    ctx.lineTo(200,10);
    // 再绘制一条线
    ctx.lineTo(10,200);
    // 关闭路径
    ctx.closePath();
    // 绘制路径
    ctx.fill();
</script>
```
效果：
![](/assets/1640332805753.png)

## 绘制矩形

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.rect(10, 10, 220, 120);
    ctx.closePath();
    ctx.stroke();

</script>
```
效果：
![](/assets/1640332805753.png)

## 绘制圆形

使用 `context.arc(x,y,r,sAngle,eAngle,counterclockwise);`来绘制圆

参数分别是 圆心 x,y, 半径 r ,起始角度 sAngle, 结束角度 eAngle, 是否逆时针(默认是false)

值得注意的是，起始角度与结束角度是固定的，不管是顺时针还是逆时针，都是右0或2，下1/2，左1，上3/2

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    // 绘制一个圆点在（200，200）半径：100，从0度顺时针绘制到3/2*PI的圆弧
    ctx.arc(200, 200, 100, 0, 3/2 * Math.PI, false);
    // 如果关闭路径，绘制后就是一个封闭的图形
    // ctx.closePath();
    // 同样的，fill() 表示填充
    ctx.stroke();
</script>
```

效果：
![](/assets/1640333284705.png)

换成逆时针画

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, 3/2 * Math.PI, true);
    ctx.stroke();
</script>
```

效果：
![](/assets/1640333611929.png)

## 绘制文字

使用 `fillText(text, x, y)` 函数绘制文字

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.fillText("hello", 100, 100);

</script>
```

效果：
![](/assets/1640333773226.png)

## 对齐&样式

canvas绘制时，可以像css那样设置对齐方式和线条颜色大小等

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(10,10);
    ctx.lineTo(10, 200);
    ctx.lineTo(200, 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(220, 220, 50, 0, Math.PI*2);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "green";
    ctx.font = "20px Arial";
    ctx.textBaseline = 'middle'; // 垂直方向
    ctx.textAlign = 'center'; // 水平方向
    ctx.fillText("Hello World", 330, 330);

</script>
```

## 位移

canvas绘制原点是左上角(0,0)，可以通过 `translate(x,y)` 将原点移动到指定位置

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // 将原点移动到画布中心
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.beginPath();
    // 此时起始点就是画布中心了
    ctx.rect(0, 0, 150, 100);
    ctx.closePath();
    ctx.stroke();

</script>
```

效果：
![](/assets/1640336806536.png)

## 缩放

使用 `scale(x,y)` 函数缩放

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.scale(0.5, 0.5);
    ctx.beginPath();
    ctx.rect(0, 0, 200, 200);
    ctx.closePath();
    ctx.stroke();

</script>
```

效果
![](/assets/1640337360361.png)

画布是400x400的，代码画的是一个200x200大小的矩形，但在画之前先将画布缩小了一半，所以绘制的矩形也变成了100x100的了

## 旋转

旋转画布的方法是使用 `rotate(deg)` 函数

旋转是参数是弧度，所以需要将角度转换成弧度，转换方法是 `deg * Math.PI / 180`

比如要旋转10度，那么可以使用 `rotate(10 * Math.PI / 180)`

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.rect(100, 100, 200, 200);
    ctx.closePath();
    ctx.stroke();

    ctx.rotate(10 * Math.PI / 180);
    ctx.beginPath();
    ctx.rect(100, 100, 200, 200);
    ctx.closePath();
    ctx.stroke();

</script>
```

效果：
![](/assets/1640337798925.png)

## 保存画布状态与恢复

上面列举的位移，缩放，旋转都是对画布进行操作，直接会对后面再绘制的图形有影响

比如平移完后绘制完，还要再平移回初始的状态，这样才不会对后面绘制有影响，旋转，缩放也是一样，这样操作就会很麻烦

可以在使用位移，缩放，旋转这些操作之前，先保存一下画布的状态，绘制完后，再恢复到保存的状态，就不会对后面的绘制有影响了

```html
<canvas width="400" height="400" id="canvas" style="border:1px solid #333;"></canvas>
<script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.save();
    ctx.strokeStyle="blue";
    ctx.translate(200, 200);
    ctx.rotate(10 * Math.PI / 180);
    ctx.beginPath();
    ctx.rect(-100, -100, 200, 200);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(100, 100, 200, 200);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
</script>
```

效果：
![](/assets/1640338703836.png)

## 罗盘钟

有了上面这些知识就可以写出来罗盘钟了，完整代码如下

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body, html {height: 100%;}
    </style>
</head>

<body>

    <canvas id="clock" width="800" height="800"></canvas>

    <script>
        (function () {
            var canvas = document.getElementById('clock');
            var ctx = canvas.getContext('2d');
            var cwidth = canvas.width,cheight = canvas.height;

            var init = false;
            var seconds = ["零秒", "一秒", "二秒", "三秒", "四秒", "五秒", "六秒", "七秒", "八秒", "九秒", "十秒", "十一秒", "十二秒", "十三秒", "十四秒", "十五秒", "十六秒", "十七秒", "十八秒", "十九秒", "二十秒", "二十一秒", "二十二秒", "二十三秒", "二十四秒", "二十五秒", "二十六秒", "二十七秒", "二十八秒", "二十九秒", "三十秒", "三十一秒", "三十二秒", "三十三秒", "三十四秒", "三十五秒", "三十六秒", "三十七秒", "三十八秒", "三十九秒", "四十秒", "四十一秒", "四十二秒", "四十三秒", "四十四秒", "四十五秒", "四十六秒", "四十七秒", "四十八秒", "四十九秒", "五十秒", "五十一秒", "五十二秒", "五十三秒", "五十四秒", "五十五秒", "五十六秒", "五十七秒", "五十八秒", "五十九秒"];
            var minutes = ["零分", "一分", "二分", "三分", "四分", "五分", "六分", "七分", "八分", "九分", "十分", "十一分", "十二分", "十三分", "十四分", "十五分", "十六分", "十七分", "十八分", "十九分", "二十分", "二十一分", "二十二分", "二十三分", "二十四分", "二十五分", "二十六分", "二十七分", "二十八分", "二十九分", "三十分", "三十一分", "三十二分", "三十三分", "三十四分", "三十五分", "三十六分", "三十七分", "三十八分", "三十九分", "四十分", "四十一分", "四十二分", "四十三分", "四十四分", "四十五分", "四十六分", "四十七分", "四十八分", "四十九分", "五十分", "五十一分", "五十二分", "五十三分", "五十四分", "五十五分", "五十六分", "五十七分", "五十八分", "五十九分"];
            let hours = ["十二时", "一时", "二时", "三时", "四时", "五时", "六时", "七时", "八时", "九时", "十时", "十一时"]
            let apm = ["上午", "下午"];
            let weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            let days = ["一号", "二号", "三号", "四号", "五号", "六号", "七号", "八号", "九号", "十号", "十一号", "十二号", "十三号", "十四号", "十五号", "十六号", "十七号", "十八号", "十九号", "二十号", "二十一号", "二十二号", "二十三号", "二十四号", "二十五号", "二十六号", "二十七号", "二十八号", "二十九号", "三十号", "三十一号"];
            let months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

            var secondoffset = 0, minuteoffset = 0, houroffset = 0, apoffset = 0, weekoffset = 0, dayoffset = 0, monthoffset = 0;
            var lastSecond = 0, lastMinute = 0, lastHour = 0, lastAp = 0, lastWeek = 0, lastDay = 0, lastMonth = 0;
            var lastUpdateTime = 0, fps = 0, lastfps = 0, lastFpsTime = 0;

            function getTime() {
                var now = new Date();
                var second = now.getSeconds();
                var minute = now.getMinutes();
                var hour = now.getHours();
                var ap = hour >= 12 ? 1 : 0;
                var week = now.getDay();
                var day = now.getDate();
                var month = now.getMonth();
                var year = now.getFullYear() + "年";
                hour = hour >= 12 ? hour - 12 : hour;
                return {
                    second: second,
                    minute: minute,
                    hour: hour,
                    ap: ap,
                    week: week,
                    day: day - 1,
                    month: month,
                    year: year
                }
            }

            function drawSecond(offset) {
                var radius = 350;
                var deg = 360 / seconds.length;
                var index = 0;
                for (var i = 0; i < seconds.length; i++) {
                    index = lastSecond + i;
                    if (index >= seconds.length) {
                        index -= seconds.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(seconds[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawMinute(offset) {
                var radius = 300;
                var deg = 360 / minutes.length;
                var index = 0;
                for (var i = 0; i < minutes.length; i++) {
                    index = lastMinute + i;
                    if (index >= minutes.length) {
                        index -= minutes.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(minutes[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawHour(offset) {
                var radius = 260;
                var deg = 360 / hours.length;
                var index = 0;
                for (var i = 0; i < hours.length; i++) {
                    index = lastHour + i;
                    if (index >= hours.length) {
                        index -= hours.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(hours[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawAp(offset) {
                var radius = 220;
                var deg = 360 / apm.length;
                var index = 0;
                for (var i = 0; i < apm.length; i++) {
                    index = lastAp + i;
                    if (index >= apm.length) {
                        index -= apm.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(apm[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawWeek(offset) {
                var radius = 180;
                var deg = 360 / weeks.length;
                var index = 0;
                for (var i = 0; i < weeks.length; i++) {
                    index = lastWeek + i;
                    if (index >= weeks.length) {
                        index -= weeks.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(weeks[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawDay(offset) {
                var radius = 130;
                var deg = 360 / days.length;
                var index = 0;
                for (var i = 0; i < days.length; i++) {
                    index = lastDay + i;
                    if (index >= days.length) {
                        index -= days.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(days[index], 0, 0);
                    ctx.restore();
                }
            }
            function drawMonth(offset) {
                var radius = 80;
                var deg = 360 / months.length;
                var index = 0;
                for (var i = 0; i < months.length; i++) {
                    index = lastMonth + i;
                    if (index >= months.length) {
                        index -= months.length;
                    }
                    ctx.save();
                    var x = Math.cos((deg * i + offset) * Math.PI / 180) * radius + cwidth/2;
                    var y = Math.sin((deg * i + offset) * Math.PI / 180) * radius + cheight/2;
                    ctx.translate(x, y)
                    ctx.rotate((deg * i + offset) * Math.PI / 180);
                    ctx.fillText(months[index], 0, 0);
                    ctx.restore();
                }
            }

            function drawTime() {
                var data = getTime();
                var hour = data.hour;
                var minute = data.minute;
                var second = data.second;
                var time = (hour > 9 ? hour : "0" + hour) + ":" + (minute > 9 ? minute : "0" + minute) + ":" + (second > 9 ? second : "0" + second);
                ctx.fillText(time, 20, 20);
            }

            function drawYear() {
                var data = getTime();
                var year = data.year;
                ctx.fillText(year, cwidth/2, cheight/2);
            }

            function drawFps() {
                fps = calcFps();
                if (lastFpsTime >= 30) {
                    lastfps = fps;
                    lastFpsTime = 0;
                }
                ctx.fillText("FPS: " + lastfps, cwidth-30, 20);
            }

            function drawLine() {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#bbb";
                ctx.beginPath();
                ctx.moveTo(30, cheight/2);
                ctx.lineTo(cwidth-30, cheight/2);
                ctx.closePath();
                ctx.stroke();

                ctx.lineWidth = 1;
                ctx.strokeStyle = "#bbb";
                ctx.beginPath();
                ctx.moveTo(cwidth/2, 30);
                ctx.lineTo(cwidth/2, cheight-30);
                ctx.closePath();
                ctx.stroke();
            }

            function render(secondoffset, minuteoffset, houroffset, apoffset, weekoffset, dayoffset, monthoffset) {
                ctx.clearRect(0, 0, cwidth, cheight);
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                drawLine();
                drawTime();
                drawYear();
                drawSecond(secondoffset);
                drawMinute(minuteoffset);
                drawHour(houroffset);
                drawAp(apoffset);
                drawWeek(weekoffset);
                drawDay(dayoffset);
                drawMonth(monthoffset);

                drawFps();
            }

            function calcFps() {
                let now = Date.now();
                let fps = (1000/(now - lastUpdateTime)).toFixed();
                lastUpdateTime = now;
                return fps;
            }

            function update() {
                lastFpsTime++;

                var data = getTime();
                var currentSecond = data.second;
                var currentMinute = data.minute;
                var currentHour = data.hour;
                var currentAp = data.ap;
                var currentWeek = data.week;
                var currentDay = data.day;
                var currentMonth = data.month;
                var currentYear = data.year;

                if (currentSecond != lastSecond) {
                    secondoffset -= 360 / seconds.length / 60 * 2;
                    if (secondoffset < -360 / seconds.length) {
                        lastSecond = currentSecond;
                        secondoffset = 0;
                    }
                }
                if (currentMinute != lastMinute) {
                    minuteoffset -= 360 / minutes.length / 60 * 2;
                    if (minuteoffset < -360 / minutes.length) {
                        lastMinute = currentMinute;
                        minuteoffset = 0;
                    }
                }
                if (currentHour != lastHour) {
                    houroffset -= 360 / hours.length / 60 * 2;
                    if (houroffset < -360 / hours.length) {
                        lastHour = currentHour;
                        houroffset = 0;
                    }
                }
                if (currentAp != lastAp) {
                    apoffset -= 360 / apm.length / 60 * 2;
                    if (apoffset < -360 / apm.length) {
                        lastAp = currentAp;
                        apoffset = 0;
                    }
                }
                if (currentWeek != lastWeek) {
                    weekoffset -= 360 / weeks.length / 60 * 2;
                    if (weekoffset < -360 / weeks.length) {
                        lastWeek = currentWeek;
                        weekoffset = 0;
                    }
                }
                if (currentDay != lastDay) {
                    dayoffset -= 360 / days.length / 60 * 2;
                    if (dayoffset < -360 / days.length) {
                        lastDay = currentDay;
                        dayoffset = 0;
                    }
                }
                if (currentMonth != lastMonth) {
                    monthoffset -= 360 / months.length / 60 * 2;
                    if (monthoffset < -360 / months.length) {
                        lastMonth = currentMonth;
                        monthoffset = 0;
                    }
                }
                render(secondoffset, minuteoffset, houroffset, apoffset, weekoffset, dayoffset, monthoffset);

                requestAnimationFrame(update);
            }

            window.requestAnimationFrame = window.requestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function (callback) {
                    setTimeout(callback, 1000 / 60);
                };

            update();
        })();
    </script>
</body>

</html>
```




























