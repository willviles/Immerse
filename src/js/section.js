// Section Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'sectionController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

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
      var defaults = (this.sectionDefaultsExtended !== true) ? this.extendAllDefaults.call(this) : this.sectionDefaults;

      // Extend upon defaults with section options
      section = $.extend(true, {}, defaults, section);

      // Push section to Immerse setup sections object
      this.imm.setup.sections.push(section);

      return section;

    },

    // Extend Defaults
    ///////////////////////////////////////////////////////

    extendAllDefaults: function() {
      var defaults = this.sectionDefaults;
      // Extend component defaults
      defaults = $.Immerse.componentController.extendDefaults(defaults);
      // Extend global component options
      defaults = $.Immerse.componentController.extendGlobalOptions(this.imm, defaults);
      // Extend global audio options
      defaults = $.Immerse.audioController.extendGlobalOptions(this.imm, defaults);
      // Extend global attribute options
      defaults = this.extendDefaults.attributes.call(this, defaults);

      // Reassign defaults with component defaults/global options included
      this.sectionDefaults = defaults;

      this.sectionDefaultsExtended = true;

      return defaults;
    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var sectionSelector = this.imm.utils.namespacify.call(this.imm, 'section'),
          $allSectionElems = $('.' + sectionSelector),
          // FIX: If no sections have been defined (all generated), ensure defaults are extended
          sectionDefaults = (this.sectionDefaultsExtended !== true) ? this.extendAllDefaults.call(this) : this.sectionDefaults,
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
        // Remove -fullscreen classes if scroll is programatically set to be unbound
        if ($.Immerse.scrollController.isScrollUnbound(that.imm, s) && $s.hasClass(fullscreenClass)) {
          $s.removeClass(fullscreenClass);
        };
      });

      // Update section offsets
      $.Immerse.scrollController.updateSectionOffsets(this.imm);

      // Order sections by vertical section offset
      this.imm._sections.sort(function(obj1, obj2) {
      	return obj1.scrollOffset - obj2.scrollOffset;
      });

      // Add index to and initiate all components on all sections
      $.each(this.imm._sections, function(i, s) {
        s.scrollIndex = i;
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
            r = a.hasOwnProperty('runtime') ? a.runtime : ['enteringDown', 'enteringUp'],
            runtimeStr, resetStr,
            that = this;

        // If there's a delay, add it to start of timeline
        if (d !== null) { t.set({}, {}, "+=" + d); }
        // Add content to the timeline
        t.add(c);

        // Prepare runtimes
        $.each(r, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(a.reset, function(i, r) { resetStr = resetStr + ' ' + r; });

        s.on(runtimeStr, function() {
          that.imm.utils.log(that.imm, "Running animation '" + n + "'");
          t.play();
        });

        s.on(resetStr, function() {
          that.imm.utils.log(that.imm, "Resetting animation '" + n + "'");
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
            r = a.hasOwnProperty('runtime') ? a.runtime : ['enteringDown', 'enteringUp'],
            that = this;

        // Prepare runtimes
        $.each(r, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.imm.utils.log(that.imm, "Running action: '" + n + "'");
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
            r = a.hasOwnProperty('runtime') ? a.runtime : ['enteringDown', 'enteringUp'],
            that = this;

        // Prepare runtimes
        $.each(r, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.imm.utils.log(that.imm, "Attribute '" + n + "' updated to '" + value + "'");
            that.imm.$elem.trigger(n, value);
          }, d);
        });
      }

    },

    extendDefaults: {
      attributes: function(defaults) {
        var attributeSetupOpts = this.imm.setup.attributes;

        if (attributeSetupOpts === undefined) { return defaults; }

        defaults['attributes'] = attributeSetupOpts;

        return defaults;
      }
    }

  // End of controller
  ///////////////////////////////////////////////////////
  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    init: function(imm) {
      var c = new controller[n](this);
      c.init.call(c, imm);
      return c;
    },

    add: function(imm, section) {
      var c = new controller[n](this);
      c.add.call(c, imm, section);
      return c;
    }
  }

})( jQuery, window , document );