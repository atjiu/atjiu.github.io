$(function() {
  setTimeout(() => {
    var next_tip = localStorage.getItem('next_tip');
    var adsbygoogle = $('.adsbygoogle').html();
    var adblock = false;
    if (adsbygoogle === undefined || adsbygoogle === '') {
      if (!next_tip) {
        adblock = true;
      } else if (next_tip && new Date().getTime() > next_tip) {
        adblock = true;
      }
    }
    if (adblock) {
      $('.tip-alert').show(700, 'swing');
    }

    $('.tip-alert button').click(function() {
      var newTime = 7 * 24 * 60 * 60 * 1000;
      var now = new Date().getTime();
      localStorage.setItem('next_tip', now + newTime);
    });

    var markdownToc = $('#markdown-toc');
    var markdownTocHtml = '';
    if (markdownToc.text().length > 0) {
      markdownToc.hide();
      markdownTocHtml = markdownToc.html();
    }
    $('.toc').html(
      '<ul class="table-of-content">' + markdownTocHtml + '<li><a href="#comments">添加评论</a></li>' + '</ul>'
    );

    // var postRight = $('.post-right');
    // if (postRight.length > 0) {
    //   var postRightWidth = postRight.css('width');
    //   postRight.css({
    //     position: 'fixed',
    //     width: postRightWidth
    //   });
    //   var windowHeight = $(window).height();
    //   var postRightHeight = postRight.height();
    //   var offsetTop = postRight.offset().top;
    //   // var toTopHeight = adblock ? 40 + 54 : 40;
    //   if (postRightHeight > windowHeight) {
    //     postRight.find('.panel-default').css({
    //       height: parseInt(windowHeight) - 40 + 'px'
    //     });
    //     // postRight.find('.panel-body').css({
    //     //   overflow: 'hidden',
    //     //   height: parseInt(windowHeight) - 82 + 'px'
    //     // });
    //     postRight.find('.table-of-content').css({
    //       overflow: 'auto',
    //       height: parseInt(windowHeight) - 86 + 'px'
    //     });
    //   }
    //   var offsetTopHeight = adblock ? 72 + 54 : 72;
    //   if (offsetTop > offsetTopHeight) {
    //     postRight.css({
    //       top: '20px'
    //     });
    //   }
    // }
    // back to top
    var backToTop = $('.back-to-top');
    $(window).scroll(function() {
      var scrollTop = $(this).scrollTop();
      // var flog = adblock ? scrollTop >= 104 : scrollTop >= 50;
      // if (flog) {
      //   postRight.css({
      //     position: 'fixed',
      //     top: '20px'
      //   });
      // } else {
      //   postRight.css({
      //     position: 'fixed',
      //     top: adblock ? 124 - scrollTop + 'px' : 70 - scrollTop + 'px'
      //   });
      // }
      if (scrollTop > 200) {
        backToTop.addClass('back-to-top-show');
      } else {
        backToTop.removeClass('back-to-top-show');
      }
    });
    backToTop.click(function() {
      $('html,body').animate({ scrollTop: 0 }, 700);
    });
  }, 1000);
});
