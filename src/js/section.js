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
          registration = { section: $s },
          that = this;

      // Register Animations
      $.each(s.animations, function(name, animation) {
        registration.type = 'animation'; registration.name = name; registration.obj = animation;
        that.registrationHandler.call(that, registration);
      });
      // Register Actions
      $.each(s.actions, function(name, action) {
        registration.type = 'action'; registration.name = name; registration.obj = action;
        that.registrationHandler.call(that, registration);
      });
      // Register Attributes
      $.each(s.attributes, function(name, attribute) {
        registration.type = 'attribute'; registration.name = name; registration.obj = attribute;
        that.registrationHandler.call(that, registration);
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

    registrationHandler: function(registration) {

      // If view targeted
      if ($.Immerse.viewportController.isView(this.imm, registration.obj)) {

        // If it's not active, register it.
        if (!registration.obj._active) {
          this.register[registration.type].call(this, registration);

        // But if it is, don't re-register.
        } else {
          return;
        }

      // If view isn't targeted
      } else {
        // If it's active, we need to kill it.
        if (registration.obj._active) {
          this.kill.call(this, registration);

        // But if it isn't, it is of no consequence
        } else {
          return;
        }
      };

    },

    // Register

    register: {

    // Register Section Animation
    ///////////////////////////////////////////////////////

      animation: function(registration) {

        var obj = registration.obj,
            that = this;

        obj._timeline = new TimelineMax({ paused: true });
        obj._timelineContent = obj.timeline(registration.section);
        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];

        // If there's a delay, add it to start of timeline
        if (obj.delay !== null) { obj._timeline.set({}, {}, "+=" + obj.delay); }
        // Add content to the timeline
        obj._timeline.add(obj._timelineContent);

        obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(obj.reset, function(i, r) { obj._resetStr = obj._resetStr + ' ' + r; });

        obj._run = function() {
          that.imm.utils.log(that.imm, "Running " + registration.type + " '" + registration.name + "'");
          obj._timeline.play();
        }

        obj._reset = function() {
          that.imm.utils.log(that.imm, "Resetting " + registration.type + " '" + registration.name + "'");
          obj._timeline.pause(0, true);
        }

        registration.section.on(obj._runtimeStr, obj._run);
        registration.section.on(obj._resetStr, obj._reset);

        this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;

      },

      // Register Section Action
      ///////////////////////////////////////////////////////

      action: function(registration) {

        var obj = registration.obj,
            that = this;

        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];

        obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });

        obj._run = function() {
          setTimeout(function() {
            that.imm.utils.log(that.imm, "Running " + registration.type + " '" + registration.name + "'");
            obj.action.call(that, s);
          }, obj.delay);
        }

        s.on(obj._runtimeStr, obj._run);

        if (obj.clear) {
          obj._reset = function() {
            that.imm.utils.log(that.imm, "Clearing " + registration.type + " '" + registration.name + "'");
            obj.clear.call(that, s);
          }
          registration.section.on(obj._resetStr, obj._reset);
        }

        this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;

      },

      // Register Section Attribute
      ///////////////////////////////////////////////////////

      attribute: function(registration) {

        var obj = registration.obj,
            that = this;

        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];

        obj._runtimeStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });

        obj._run = function() {
          setTimeout(function() {
            var typeString = that.imm.utils.stringify(registration.type);
            that.imm.utils.log(that.imm, typeString + " '" + registration.name + "' updated to '" + obj.value + "'");
            that.imm.$elem.trigger(registration.name, obj.value);
          }, obj.delay);
        }
        registration.section.on(obj._runtimeStr, obj._run);

        this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;
      }

    },

    // Kill object
    ///////////////////////////////////////////////////////

    kill: function(registration) {

      var obj = registration.obj;

      // Kill animation timeline
      if (registration.type === 'animation') { obj._timeline.progress(1, false).kill(); }

      // Kill animation & actions reset string
      if (registration.type === 'animation' || registration.type === 'action') { registration.section.off(obj._resetStr, obj._reset); }

      // Kill animation, action and attribute runtime string
      registration.section.off(obj._runtimeStr, obj._run);

      // Set object to not active
      this.imm.utils.log(this.imm, "Killed " + registration.type + " '" + registration.name + "'");

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