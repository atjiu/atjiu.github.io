$(function () {
  var markdownToc = $("#markdown-toc");
  var markdownTocHtml = '';
  var relatedPostsHtml = '';
  var relatedPosts = $("#related_posts");
  if(markdownToc) {
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
    postRight.affix({
      offset: {
        top: 60,
        bottom: function () {
          return (this.bottom = $('footer').outerHeight(true))
        }
      }
    });
    postRight.on('affix.bs.affix', function () {
      postRight.css({
        'top': '20px',
        width: postRightWidth
      });
    });
    postRight.on('affix-top.bs.affix', function () {
      postRight.removeAttr('top');
      postRight.removeAttr('width');
    });
  }
});