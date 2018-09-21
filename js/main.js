$(function () {
  var markdownToc = $("#markdown-toc");
  var markdownTocHtml = '';
  var relatedPostsHtml = '';
  var relatedPosts = $("#related-posts");
  if(markdownToc.text().length > 0) {
    markdownToc.hide();
    markdownTocHtml = markdownToc.html();
  }
  if(relatedPosts.find('ul>li').length > 0) {
    relatedPosts.css({
      'border-top': '1px solid #eee',
      'margin-top': '20px'
    });
    relatedPosts.find('h3').text('相似文章');
    relatedPosts.find('ul').addClass('table-of-content');
    relatedPostsHtml = '<li><a href="#related-posts">' + relatedPosts.find('h3').text() + '</a></li>';
  }
  $(".toc").html('<ul class="table-of-content">' +
    markdownTocHtml +
    relatedPostsHtml +
    '<li><a href="#comments">添加评论</a></li>' +
    '</ul>'
  );

  var postRight = $(".post-right");
  if(postRight.length > 0) {
    var postRightWidth = postRight.css('width');
    postRight.css({
      'position': 'fixed',
      'width': postRightWidth
    })
    var windowHeight = $(window).height();
    var postRightHeight = postRight.height();
    var offsetTop = postRight.offset().top;
    if(postRightHeight + 40 > windowHeight) {
      postRight.find('.panel-default').css({
        'height': parseInt(windowHeight - 40) + 'px',
      });
      postRight.find('.panel-body').css({
        'overflow': 'auto',
        'height': parseInt(windowHeight - 40 - 42) + 'px',
      })
    }
    if (offsetTop > 72) {
      postRight.css({
        'top': '20px'
      })
    }
  }
  // back to top
  var backToTop = $(".back-to-top");
  $(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    if (scrollTop >= 50) {
      postRight.css({
        'position': 'fixed',
        'top': '20px'
      })
    } else {
      postRight.css({
        'position': 'fixed',
        'top': (70 - scrollTop) + 'px'
      })
    }
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