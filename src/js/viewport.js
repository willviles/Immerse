// Viewport Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseViewportController = function() {};

  ImmerseViewportController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      this.set.call(this, this.imm._windowWidth);
      this.resize.call(this, this);

      return this;
    },

    set: function(width) {
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent),
          isMobileWidth = width <= 480;

      if (isMobile || isMobileWidth) {
        this.imm._device = 'mobile';
        this.imm._isMobile = true;
        this.imm._isDesktop = false;
      } else {
        this.imm._device = 'desktop';
        this.imm._isMobile = false;
        this.imm._isDesktop = true;
      }
    },

    resize: function(that) {

      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      $(window).on('resize', function() {
        that.set.call(that, that.imm._windowWidth);
        $.Immerse.scrollController.updateSectionOffsets(that.imm);
        $.Immerse.scrollController.stickSection(that.imm);
        // Resize background videos
        if (!that.imm._isMobile && $.Immerse.componentRegistry.videos !== undefined) {
          $.Immerse.componentRegistry.videos.resizeAll(that.imm);
        }
      });
    },

    isView: function(imm, a) {

      this.imm = imm;
      // Prepare devices
      var mobile = $.inArray('mobile', a.devices) !== -1,
          desktop = $.inArray('desktop', a.devices) !== -1

      // If animation is for mobile but not desktop and we're not in a mobile view
      // ...or...
      // If animation is for desktop but not mobile and we're not in a desktop view
      if (mobile && !desktop && !this.imm._isMobile || desktop && !mobile && !this.imm._isDesktop) { return false; }
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.viewportController = {
    init: function(imm) {
      return new ImmerseViewportController(this).init(imm);
    },
    isView: function(imm, a) {
      return new ImmerseViewportController(this).isView(imm, a);
    }
  }

})( jQuery, window , document );