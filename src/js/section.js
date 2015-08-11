// Section Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseSectionController = function() {};

  ImmerseSectionController.prototype = {

    // Add Section to Immerse
    ///////////////////////////////////////////////////////

    add: function(imm, section) {

      this.imm = imm;

      var defaults = {
        name: section.element[0].id,
        animations: {},
        actions: {},
        attributes: {},
        updateNav: this.imm.setup.options.updateNav,
        transition: this.imm.setup.options.transition,
        options: {
          hideFromNav: false,
          unbindScroll: false
        }
      }

      var section = $.extend(true, defaults, section);
      this.imm.setup.sections.push(section);
      return section;

    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var $allSectionElems = $(this.imm.setup.options.sectionSelector),
          that = this;

      $.each($allSectionElems, function(i, $s) {
        var u = $($s).hasClass('imm-fullscreen') ? false : true,
            n = that.imm.utils.stringify($($s)[0].id),
            s = {
              name: n,
              element: $($s),
              updateNav: that.imm.setup.options.updateNav,
              transition: that.imm.setup.options.transition,
              options: {
                hideFromNav: false,
                unbindScroll: u
              }
            };
        that.imm._sections.push(s);
      });

      // Setup all defined sections
      $.each(this.imm.setup.sections, function(i, s) {

        // jQuerify section
        var $s = $(s.element);

        // Replace selector created section
        // E.g If $(s.element) matches $(this.imm._sections[i].element), remove that record and replace with new one.
        $.each(that.imm._sections, function(i, _s) {
          that.imm._sections[i] = $(_s.element)[0] === $(s.element)[0] ? s : _s;
        });

        // Animations
        $.each(s.animations, function(name, animation) {
          that.register.animations.call(that, $s, name, animation);
        });
        // Actions
        $.each(s.actions, function(name, action) {
          that.register.actions.call(that, $s, name, action);
        });
        // Attributes
        $.each(s.attributes, function(name, attr) {
          that.register.attributes.call(that, $s, name, attr);
        });
        // Videos
        var sectionVideos = $s.find('[data-imm-video]');
        $.each(sectionVideos, function(i, wrapper) {
          $.Immerse.videoController.init(that.imm, s, $(wrapper));
        });
      });

      $.Immerse.scrollController.updateSectionOffsets(this.imm);

      // Order sections by vertical order
      this.imm._sections.sort(function(obj1, obj2) {
      	return obj1.scrollOffset - obj2.scrollOffset;
      });

      // Loop over all sections objects, both defined and generated
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
        if ($.Immerse.viewportController.isView(this, a) === false) { return false };

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

    add: function(imm, s) {
      return new ImmerseSectionController(this).add(imm, s);
    }
  }

})( jQuery, window , document );