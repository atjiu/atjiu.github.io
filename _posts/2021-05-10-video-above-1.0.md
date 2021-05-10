---
layout: post
title: HTML Video/Audio 音量提升超过1.0
date: 2021-05-10 09:32:00
categories: javascript学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}





有时候看一些网页上的视频音量调到100%，还是听着很小，尝试着用js调用video的api来调调整视频播放器的音量，发现没法超过1.0

随后在sof上找到了一篇文章，可以解决音量上限的问题，备份一下

```js
function amplifyMedia(mediaElem, multiplier) {
  var context = new (window.AudioContext || window.webkitAudioContext),
      result = {
        context: context,
        source: context.createMediaElementSource(mediaElem),
        gain: context.createGain(),
        media: mediaElem,
        amplify: function(multiplier) { result.gain.gain.value = multiplier; },
        getAmpLevel: function() { return result.gain.gain.value; }
      };
  result.source.connect(result.gain);
  result.gain.connect(context.destination);
  result.amplify(multiplier);
  return result;
}
```

调用

```js
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Test Video</title>
</head>
<body>
  <video id="myVideo" controls src="video.mp4"></video>
  <script src="createAmplifier.js"></script>
  <script type="text/JavaScript">
    // Make my video twice as loud as normal.
    createAmplifier(document.getElementById('myVideo'), 2);
  </script>
</body>
</html>
```

- 问答：https://stackoverflow.com/questions/46264417/videojs-html5-video-js-how-to-boost-volume-above-maximum
- 原文：https://cwestblog.com/2017/08/17/html5-getting-more-volume-from-the-web-audio-api/
