// Viewport Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'viewportController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      this.imm.setup.options.breakpoints = this.prepareBreakpoints.call(this);
      this.detectDevice.call(this);
      this.set.call(this, this.imm._windowWidth);
      $(window).on('resize', this.resize.bind(this));

      return this;
    },

    // Prepare breakpoints
    ///////////////////////////////////////////////////////

    prepareBreakpoints: function() {
      var breakpoints = this.imm.setup.options.breakpoints,
          breakpointArray = [];

      // Prepare breakpoints for sorting
      $.each(breakpoints, function(name, width) {
        var niceName = name.charAt(0).toUpperCase() + name.slice(1),
            obj = {name: name, niceName: niceName, width: width};
        breakpointArray.push(obj);
      });

      // Reassign ordered array to breakpoints variable
      return breakpointArray.sort(function(a, b) { return a.width - b.width });

    },

    // Detect Device
    ///////////////////////////////////////////////////////

    detectDevice: function() {

      if ('ontouchstart' in window || 'onmsgesturechange' in window) {
        this.imm._device = 'touch'; this.imm._isTouch = true; this.imm._isDesktop = false;
      } else {
        this.imm._device = 'desktop'; this.imm._isTouch = false; this.imm._isDesktop = true;
      }

    },

    // Set
    ///////////////////////////////////////////////////////

    set: function(width) {

      // Detect breakpoints & devices
      var breakpoints = this.imm.setup.options.breakpoints,
          currentBreakpoint = this.imm._breakpoint,
          prevBreak = 0,
          that = this;

      // Set largest as default. It'll be overwritten if we're in the correct viewport.
      var newBreakpoint = breakpoints[breakpoints.length-1]['name'];

      $.each(breakpoints, function(i, obj) {
        // Set all direct flags to false
        that.imm['_is' + obj.niceName] = false;
        if (width > prevBreak && width <= obj.width) {
          // Update breakpoint flags
          newBreakpoint = obj.name;
          that.imm['_is' + obj.niceName] = true;
        }
        prevBreak = obj.width;
      });

      // If we've got a newBreakpoint detected, do something about it!
      if (currentBreakpoint !== newBreakpoint) {
        this.imm._breakpoint = newBreakpoint;
        if (currentBreakpoint) {
          $.Immerse.sectionController.reinitSections(this.imm);
          this.imm.utils.log(this.imm, "Screen resized to '" + newBreakpoint + "'");
        }
      }
    },

    // Resize
    ///////////////////////////////////////////////////////

    resize: function() {
      // Set new width and height
      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      // Set viewport
      this.set.call(this, this.imm._windowWidth);
      // Update section offsets
      $.Immerse.scrollController.updateSectionOffsets(this.imm);
      // Stick current section to position
      $.Immerse.scrollController.stickSection(this.imm);
      // Call onResize function of each component
      $.Immerse.componentController.resize(this.imm);
    },

    // IsView
    ///////////////////////////////////////////////////////

    isView: function(imm, a) {

      this.imm = imm;

      // If not defined, run on all devices and/or breakpoints
      if (a.devices === undefined) { a.devices = ['touch', 'desktop']; }
      if (a.breakpoints === undefined) {
        var allBreakpoints = [];
        $.each(this.imm.setup.options.breakpoints, function(i, obj) { allBreakpoints.push(obj.name); })
        a.breakpoints = allBreakpoints;
      }

      // If currentDevice isn't defined in devices array, return false.
      if ($.inArray(this.imm._device, a.devices) === -1) { return false; }
      // ...We're now on the right device!
      // If currentbreakpoint isn't defined in breakpoints array, return false.
      if ($.inArray(this.imm._breakpoint, a.breakpoints) === -1) { return false; }

      return true;
    },

    // Kill
    ///////////////////////////////////////////////////////

    kill: function() {
      $(window).off('resize', this.resize);
    }

  // End of controller
  ///////////////////////////////////////////////////////

  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    init: function(imm) {
      return new controller[n](this).init(imm);
    },
    isView: function(imm, a) {
      return new controller[n](this).isView(imm, a);
    },
    kill: function() {
      var c = new controller[n](this);
      c.kill.call(this);
    }
  }

})( jQuery, window , document );