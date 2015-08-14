// Section Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseSectionController = function() {};

  ImmerseSectionController.prototype = {

    // Default section settings
    ///////////////////////////////////////////////////////

    sectionDefaults: {
      animations: {},
      actions: {},
      attributes: {},
      components: {},
      options: {
        hideFromNav: false,
        unbindScroll: false
      }
    },

    // Add Section to Immerse
    ///////////////////////////////////////////////////////

    add: function(imm, section) {

      this.imm = imm;

      // Get defined defaults
      var defaults = this.sectionDefaults;

      // Extend component defaults
      defaults = $.Immerse.componentController.extendDefaults(defaults);
      // Extend global component options
      defaults = $.Immerse.componentController.extendGlobalOptions(this.imm, defaults);
      // Extend global audio options
      defaults = $.Immerse.audioController.extendGlobalOptions(this.imm, defaults);

      // Reassign defaults with component defaults/global options included
      this.sectionDefaults = defaults;

      // Extend upon defaults with section options
      section = $.extend({}, defaults, section);

      // Push section to Immerse setup sections object
      this.imm.setup.sections.push(section);

      return section;

    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var sectionSelector = this.imm.utils.namespacify.call(this.imm, 'section'),
          $allSectionElems = $('.' + sectionSelector),
          sectionDefaults = this.sectionDefaults,
          fullscreenClass = this.imm.utils.namespacify.call(this.imm, 'fullscreen'),
          that = this;

      // Generate all sections from DOM elements
      $.each($allSectionElems, function(i, $s) {
        var generatedSection = sectionDefaults,
            n = that.imm.utils.stringify($($s)[0].id),
            u = $($s).hasClass(fullscreenClass) ? false : true,
            newVals = {
              element: $($s),
              name: n,
              options: {
                unbindScroll: u
              }
            };
        generatedSection = $.extend({}, generatedSection, newVals);
        that.imm._sections.push(generatedSection);
      });

      // Setup all defined sections
      $.each(this.imm.setup.sections, function(i, s) {

        var $s = $(s.element);

        // Replace generated section if manually setup.
        // E.g If $(s.element) matches $(this.imm._sections[i].element), remove that record and replace with new one.
        $.each(that.imm._sections, function(i, _s) {
          that.imm._sections[i] = $(_s.element)[0] === $(s.element)[0] ? s : _s;
        });

        // Register Animations
        $.each(s.animations, function(name, animation) {
          that.register.animations.call(that, $s, name, animation);
        });
        // Register Actions
        $.each(s.actions, function(name, action) {
          that.register.actions.call(that, $s, name, action);
        });
        // Register Attributes
        $.each(s.attributes, function(name, attr) {
          that.register.attributes.call(that, $s, name, attr);
        });
      });

      // Update section offsets
      $.Immerse.scrollController.updateSectionOffsets(this.imm);

      // Order sections by vertical section offset
      this.imm._sections.sort(function(obj1, obj2) {
      	return obj1.scrollOffset - obj2.scrollOffset;
      });

      // Initiate all components on all sections
      $.each(this.imm._sections, function(n, s) {
        $.Immerse.componentController.init(that, s);
      });

      return this;
    },

    // Register

    register: {

    // Register Section Animations
    ///////////////////////////////////////////////////////

      animations: function(s, n, a) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, a) === false) { return false };

        var t = new TimelineMax({ paused: true }),
            c = a.timeline(s),
            d = !isNaN(a.delay) ? a.delay : null,
            runtimeStr, resetStr,
            that = this;

        // If there's a delay, add it to start of timeline
        if (d !== null) { t.set({}, {}, "+=" + d); }
        // Add content to the timeline
        t.add(c);

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(a.reset, function(i, r) { resetStr = resetStr + ' ' + r; });

        s.on(runtimeStr, function() {
          console.log('Running ' + n);
          t.play();
        });

        s.on(resetStr, function() {
          console.log('Resetting ' + n);
          t.pause(0, true);
        });

      },

      // Register Section Actions
      ///////////////////////////////////////////////////////

      actions: function(s, n, a) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, a) === false) { return false };

        var action = a.action,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            action.call(that, s);
          }, d);
        });

      },

      // Register Section Attributes
      ///////////////////////////////////////////////////////

      attributes: function(s, n, a) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, a) === false) { return false };

        var value = a.value,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.imm.$elem.trigger(n, value);
          }, d);
        });
      }

    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.sectionController = {
    init: function(imm) {
      return new ImmerseSectionController(this).init(imm);
    },

    add: function(imm, section) {
      return new ImmerseSectionController(this).add(imm, section);
    }
  }

})( jQuery, window , document );