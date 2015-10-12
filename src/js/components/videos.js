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
  initSection: function(opts) {
    this.imm = opts.immerse;
    this.videoNamespace = this.imm.utils.namespacify.call(this.imm, 'video');

    var section = opts.section,
        $section = $(section.element),
        that = this;

    var sectionVideos = $section.find('[data-' + this.videoNamespace + ']');
    $.each(sectionVideos, function(i, wrapper) {

      var videoName = $(wrapper).data(that.videoNamespace);

      if (that.imm.setup.hasOwnProperty('assets')) {
        if (!that.imm.setup.assets.hasOwnProperty(videoName)) {
          that.imm.utils.log(that.imm, "Asset Failure: Could not initialize video asset '" + videoName + "'"); return;
        }
      } else {
        that.imm.utils.log(that.imm, "Asset Failure: Could not initialize video asset '" + videoName + "'"); return;
      }

      // If asset matches, initialize the video
      that.handler.call(that, opts.immerse, section, wrapper);
    });

    return this;
  },

  // Initialize
  ///////////////////////////////////////////////////////
  handler: function(imm, s, wrapper) {

    // Get a handle on the Immerse object
    this.imm = imm;

    var $wrapper = $(wrapper),
        $video = $wrapper.find('video'),
        $s = $(s.element),
        that = this;

    if (this.imm._isTouch) { $video.hide(); return false; }

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
    $.each(imm.$page.find('[data-' + this.videoDataTag + ']'), function(i, wrapper) {
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