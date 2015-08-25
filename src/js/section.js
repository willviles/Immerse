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

        that.initSection.call(that, that.imm, s);
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

    // Init section
    ///////////////////////////////////////////////////////

    initSection: function(imm, s) {
      this.imm = (this.imm === undefined) ? imm : this.imm;

      var $s = $(s.element),
          fullscreenClass = this.imm.utils.namespacify.call(this.imm, 'fullscreen'),
          that = this;

      // Register Animations
      $.each(s.animations, function(name, animation) {
        that.registrationHandler.call(that, 'animations', $s, name, animation);
      });
      // Register Actions
      $.each(s.actions, function(name, action) {
        that.registrationHandler.call(that, 'actions', $s, name, action);
      });
      // Register Attributes
      $.each(s.attributes, function(name, attr) {
        that.registrationHandler.call(that, 'attributes', $s, name, attr);
      });
      // Remove -fullscreen classes if scroll is programatically set to be unbound
      if ($.Immerse.scrollController.isScrollUnbound(that.imm, s)) {
        $s.removeClass(fullscreenClass);
      // Otherwise add it if it should be present
      } else {
        $s.addClass(fullscreenClass);
      };
    },

    // Registration Handler
    ///////////////////////////////////////////////////////

    registrationHandler: function(type, $s, name, obj) {

      // If view targeted
      if ($.Immerse.viewportController.isView(this.imm, obj)) {

        // If it's not active, register it.
        if (!obj._active) {
          this.register[type].call(this, $s, name, obj);

        // But if it is, don't re-register.
        } else {
          return;
        }

      // If view isn't targeted
      } else {
        // If it's active, we need to kill it.
        if (obj._active) {
          this.kill.call(this, type, $s, name, obj);

        // But if it isn't, it is of no consequence
        } else {
          return;
        }
      };

    },

    // Register

    register: {

    // Register Section Animations
    ///////////////////////////////////////////////////////

      animations: function(s, n, obj) {

        var t = new TimelineMax({ paused: true }),
            c = obj.timeline(s),
            d = !isNaN(obj.delay) ? obj.delay : null,
            r = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'],
            that = this;

        // If there's a delay, add it to start of timeline
        if (d !== null) { t.set({}, {}, "+=" + d); }
        // Add content to the timeline
        t.add(c);

        obj._timeline = t; obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(r, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(obj.reset, function(i, r) { obj._resetStr = obj._resetStr + ' ' + r; });


        obj._run = function() {
          that.imm.utils.log(that.imm, "Running animation '" + n + "'");
          obj._timeline.play();
        }

        obj._reset = function() {
          that.imm.utils.log(that.imm, "Resetting animation '" + n + "'");
          obj._timeline.pause(0, true);
        }

        s.on(obj._runtimeStr, obj._run);
        s.on(obj._resetStr, obj._reset);

        this.imm.utils.log(this.imm, "Registered animation '" + n + "'");
        obj._active = true;

      },

      // Register Section Actions
      ///////////////////////////////////////////////////////

      actions: function(s, n, obj) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, obj) === false) { return false };

        var d = !isNaN(obj.delay) ? obj.delay : 0,
            r = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'],
            that = this;

        obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(r, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });

        obj._run = function() {
          setTimeout(function() {
            that.imm.utils.log(that.imm, "Running action: '" + n + "'");
            obj.action.call(that, s);
          }, d);
        }

        s.on(obj._runtimeStr, obj._run);

        if (obj.clear) {
          obj._reset = function() {
            that.imm.utils.log(that.imm, "Clearing action: '" + n + "'");
            obj.clear.call(that, s);
          }
          s.on(obj._resetStr, obj._reset);
        }

        this.imm.utils.log(this.imm, "Registered action '" + n + "'");
        obj._active = true;

      },

      // Register Section Attributes
      ///////////////////////////////////////////////////////

      attributes: function(s, n, obj) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, obj) === false) { return false };

        var d = !isNaN(obj.delay) ? obj.delay : 0,
            r = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'],
            that = this;

        obj._runtimeStr = '';

        // Prepare runtimes
        $.each(r, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });

        obj._run = function() {
          setTimeout(function() {
            that.imm.utils.log(that.imm, "Attribute '" + n + "' updated to '" + a.value + "'");
            that.imm.$elem.trigger(n, a.value);
          }, d);
        }
        s.on(obj._runtimeStr, obj._run);

        this.imm.utils.log(this.imm, "Registered attribute '" + n + "'");
        obj._active = true;
      }

    },

    // Kill object
    ///////////////////////////////////////////////////////

    kill: function(type, s, name, obj) {

      // Kill animation timeline
      if (type === 'animations') { obj._timeline.progress(1, false).kill(); }

      // Kill animation & actions reset string
      if (type === 'animations' || type === 'actions') { s.off(obj._resetStr, obj._reset); }

      // Kill animation, action and attribute runtime string
      s.off(obj._runtimeStr, obj._run);

      // Set object to not active
      this.imm.utils.log(this.imm, "Killed " + type + " '" + name + "'");
      obj._active = false;

    },

    // Reinit Sections
    ///////////////////////////////////////////////////////

    reinitSections: function(imm) {

      this.imm = (this.imm === undefined) ? imm : this.imm;

      var that = this;

      $.each(this.imm._sections, function(i, s) {
        that.initSection.call(that, that.imm, s);
      });

      // Force update section offsets
      $.Immerse.scrollController.updateSectionOffsets(this.imm);
    },

    // Extend defaults
    ///////////////////////////////////////////////////////

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
    },

    reinitSections: function(imm) {
      var c = new controller[n](this);
      c.reinitSections.call(c, imm);
      return c;
    }
  }

})( jQuery, window , document );