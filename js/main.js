$(function () {
  var markdownToc = $("#markdown-toc");
  var markdownTocHtml = '';
  var relatedPostsHtml = '';
  var relatedPosts = $("#related_posts");
  if(markdownToc.text().length > 0) {
    markdownToc.hide();
    markdownTocHtml = markdownToc.html();
  }
  if(relatedPosts.text().length > 0) {
    relatedPostsHtml = '<li><a href="#related_posts">' + relatedPosts.text() + '</a></li>';
  }
  $(".toc").html('<ul class="table-of-content">' +
    markdownTocHtml +
    relatedPostsHtml +
    '<li><a href="#comments">添加评论</a></li>' +
    '</ul>'
  );

  $(".post img").click(function () {
    var src = $(this).attr("src");
    $("#bigImage").attr("src", src);
    $("#toggleBigImageBtn").click();
  });

  var postRight = $(".post-right");
  if(postRight) {
    var postRightWidth = postRight.css('width');
    postRight.css({
      'position': 'fixed',
      'width': postRightWidth
    })
    var windowHeight = $(window).height();
    var postRightHeight = postRight.height();
    if(postRightHeight + 70 > windowHeight) {
      postRight.find('.panel-well').css({
        'height': parseInt(windowHeight - 100) + 'px',
      });
      postRight.find('.panel-body').css({
        'overflow': 'auto',
        'height': parseInt(windowHeight - 100 - 42) + 'px',
      })
    }
  }
  // back to top
  var backToTop = $(".back-to-top");
  $(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    if(scrollTop > 200) {
      backToTop.addClass("back-to-top-show");
    } else {
      backToTop.removeClass("back-to-top-show");
    }
  })
  backToTop.click(function () {
    $("html,body").animate({scrollTop: 0}, 500);
  })
});