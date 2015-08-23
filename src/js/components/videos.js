/*
Plugin: Immerse.js
Component: Videos
Description: Adds video backgrounds to any element with -video class and data tag
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

new Immerse().component({
  name: 'videos',

  // Initialize function
  init: function(opts) {
    this.imm = opts.immerse;
    this.videoDataTag = this.imm.utils.namespacify.call(this.imm, 'video');

    var section = opts.section,
        $section = $(section.element),
        that = this;

    var sectionVideos = $section.find('[data-' + this.videoDataTag + ']');
    $.each(sectionVideos, function(i, wrapper) {
      that.handler.call(that, opts.immerse, section, wrapper);
    });

    return this;
  },

  // Initialize
  ///////////////////////////////////////////////////////
  handler: function(imm, s, wrapper) {

    // Get a handle on the Immerse object
    this.imm = imm;

    if (this.imm._isTouch) { return false; }

    var $wrapper = $(wrapper),
        $video = $wrapper.find('video'),
        $s = $(s.element),
        that = this;

    // On entering scene & resize the video
    $s.on('init enteringDown enteringUp', function(e) {

      if (e.type === 'init' && s.element !== that.imm._currentSection.element) { return; };

      $video
        .css({visibility: 'hidden'})
        .one('canplaythrough', function() {
          that.doResize(wrapper);
        })
        .one('playing', function() {
          $video.css('visibility', 'visible');
          $wrapper.css('background-image', 'none');
        });

      if ($video[0].paused) {
        $video[0].play();
        // Just ensure it's the right size once and for all
        that.doResize(wrapper);
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

  onResize: function(imm) {
    var that = this;
    $.each(imm.$elem.find('[data-' + this.videoDataTag + ']'), function(i, wrapper) {
      that.doResize(wrapper);
    });

  },

  doResize: function(wrapper) {
    // Get video elem
    var $wrapper = $(wrapper),
        $video = $wrapper.find('video'),
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