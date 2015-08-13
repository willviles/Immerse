/*
Plugin: Immerse.js
Component: Videos
Description: Adds video backgrounds to any element with .imm-tooltip class
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'videos',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    var sectionVideos = $section.find('[data-imm-video]');
    $.each(sectionVideos, function(i, wrapper) {
      that.handler.call(that, opts.immerse, section, $(wrapper));
    });

    return this;
  },

  // Initialize
  ///////////////////////////////////////////////////////
  handler: function(imm, s, $wrapper) {

    // Get a handle on the Immerse object
    this.imm = imm;

    if (this.imm._isMobile) { return false; }

    var $video = $wrapper.find('video'),
        $s = $(s.element),
        that = this;

    // On entering scene & resize the video
    $s.on('init enteringDown enteringUp', function(e) {

      if (e.type === 'init' && s.element !== that.imm._currentSection.element) { return; };

      $video
        .css({visibility: 'hidden'})
        .one('canplaythrough', function() {
          that.resize.call(that, $wrapper, $video);
        })
        .one('playing', function() {
          $video.css('visibility', 'visible');
          $wrapper.css('background-image', 'none');
        });

      if ($video[0].paused) {
        $video[0].play();
        // Just ensure it's the right size once and for all
        that.resize.call(that, $wrapper, $video);
      }

    });

    $s.on('exitedDown exitedUp', function() {
      if (!$video[0].paused) {
        $video[0].pause();
        $video[0].currentTime = 0;
      }

    });


    return this;
  },

  resizeAll: function(imm) {
    this.imm = (this.imm === undefined) ? imm : this.imm;
    var that = this;

    $.each(this.imm.$elem.find('[data-imm-video]'), function(i, wrapper) {
      var $wrapper = $(wrapper),
          $video = $wrapper.find('video');
      that.resize.call(that, $wrapper, $video);
    });

  },

  resize: function(wrapper, video) {

    // Get video elem
    var $wrapper = $(wrapper),
        $video = $(video),
        videoHeight = $video[0].videoHeight, // Get native video height
        videoWidth = $video[0].videoWidth, // Get native video width
        wrapperHeight = $wrapper.height(), // Wrapper height
        wrapperWidth = $wrapper.width(); // Wrapper width

    if (wrapperWidth / videoWidth > wrapperHeight / videoHeight) {
      $video.css({ width: wrapperWidth + 2, height: 'auto'});
    } else {
      $video.css({ width: 'auto', height: wrapperHeight + 2 });
    }

  },

  defaults: {
    value: true
  }
});