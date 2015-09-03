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

    add: function(imm, id, section) {

      this.imm = imm;

      section.id = id;
      section.name = (section.hasOwnProperty('name')) ? section.name : this.imm.utils.stringify(id);
      section.element = $(this.imm.utils.sectionify.call(this.imm, id));

      var unboundTag = this.imm.utils.namespacify.call(this.imm, 'unbound'),
          unboundTagExists = section.element.attr('data-' + unboundTag) === 'true' ? true : false;

      section.options = section.hasOwnProperty('options') ? section.options : {};
      section.options.unbindScroll = section.options.hasOwnProperty('unbindScroll') ?
                                     section.options.unbindScroll :
                                     unboundTagExists;

      // Get defined defaults
      var defaults = (!this.imm.setup.hasOwnProperty('sectionDefaults')) ?
                      this.extendAllDefaults.call(this) : this.imm.setup.sectionDefaults;

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
      this.imm.setup.sectionDefaults = defaults;

      return defaults;
    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var $allSectionElems = $(this.imm.utils.sectionify.call(this.imm)),
          // FIX: If no sections have been defined (all generated), ensure defaults are extended
          sectionDefaults = (!this.imm.setup.hasOwnProperty('sectionDefaults')) ? this.extendAllDefaults.call(this) : this.imm.setup.sectionDefaults,
          unboundTag = this.imm.utils.namespacify.call(this.imm, 'unbound'),
          that = this;

      // Generate all sections from DOM elements
      $.each($allSectionElems, function(i, s) {

        var $s = $(s),
            generatedSection = sectionDefaults,
            id = $s.data('imm-section'),
            n = that.imm.utils.stringify(id),
            u = $s.data(unboundTag) === true ? true : false,
            newVals = {
              element: $s,
              id: id,
              name: n,
              options: {
                unbindScroll: u
              }
            };
        generatedSection = $.extend(true, {}, generatedSection, newVals);
        that.imm._sections.push(generatedSection);
      });

      // Setup all defined sections
      $.each(this.imm.setup.sections, function(i, s) {
        // Replace generated section if section is setup specifically via js.
        $.each(that.imm._sections, function(i, _s) {
          that.imm._sections[i] = _s.id === s.id ? s : _s;
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

    addDOMElemReference: function() {

    },

    // Init section
    ///////////////////////////////////////////////////////

    initSection: function(imm, s) {
      this.imm = (this.imm === undefined) ? imm : this.imm;

      var $s = $(s.element),
          fullscreenClass = this.imm.utils.namespacify.call(this.imm, 'fullscreen'),
          that = this;

      s._register = { queue: [] };
      s._kill = {
        promise: jQuery.Deferred(),
        queue: [],
        queueCheck: function() {
          if (s._kill.queue.length === 0) { s._kill.promise.resolve('killed'); }
        }
      };

      // Register Animations
      $.each(s.animations, function(name, animation) {
        var registration = { section: s, $section: $s };
        registration.type = 'animation'; registration.name = name; registration.obj = animation;
        that.registrationHandler.call(that, registration);
      });

      // Register Actions
      $.each(s.actions, function(name, action) {
        var registration = { section: s, $section: $s };
        registration.type = 'action'; registration.name = name; registration.obj = action;
        that.registrationHandler.call(that, registration);
      });
      // Register Attributes
      $.each(s.attributes, function(name, attribute) {
        var registration = { section: s, $section: $s };
        registration.type = 'attribute'; registration.name = name; registration.obj = attribute;
        that.registrationHandler.call(that, registration);
      });

      // Need to systematically kill events, AND ONLY THEN re-initialize the new ones
      // Some sort of queue is required with a promise statement.
      $.each(s._kill.queue, function(i, registration) {
        that.kill.all.call(that, registration);
      });

      s._kill.queueCheck.call(this);

      $.when(s._kill.promise.promise()).then(
        function() {
          $.each(s._register.queue, function(i, registration) {
            that.register[registration.type].call(that, registration);
          });
          // Remove -fullscreen classes if scroll is programatically set to be unbound
          if ($.Immerse.scrollController.isScrollUnbound(that.imm, s)) {
            $s.removeClass(fullscreenClass);
          // Otherwise add it if it should be present
          } else {
            $s.addClass(fullscreenClass);
          };
        }
      );
    },

    // Registration Handler
    ///////////////////////////////////////////////////////

    registrationHandler: function(registration) {

      // If view targeted
      if ($.Immerse.viewportController.isView(this.imm, registration.obj)) {

        // If it's not active, register it.
        if (!registration.obj._active) {
          registration.section._register.queue.push(registration);

        // But if it is, don't re-register.
        } else {
          return;
        }

      // If view isn't targeted
      } else {
        // If it's active, we need to kill it.
        if (registration.obj._active) {
          registration.section._kill.queue.push(registration);

        // But if it isn't, it is of no consequence
        } else {
          return;
        }
      };

    },

    // Register

    register: {

    // Queue defined in init section

    // Register Section Animation
    ///////////////////////////////////////////////////////

      animation: function(registration) {

        var obj = registration.obj,
            that = this;

        // Get timeline settings
        obj._settings = obj.hasOwnProperty('settings') ? obj.settings : { };
        // Always ensure timeline is paused to start off with so Immerse runtime hooks can be used
        obj._settings['paused'] = true;

        // Get delay and repeats
        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.repeat = !isNaN(obj.repeat) ? obj.repeat : null;
        if (obj.repeat) { obj._settings['repeat'] = obj.repeat; }

        // Create timeline and add content
        obj._timeline = new TimelineMax(obj._settings);
        obj._timelineContent = obj.timeline(registration.$section);

        // Runtime and reset targeting defaults
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];
        obj.reset = obj.hasOwnProperty('reset') ? obj.reset : ['exitedDown', 'exitedUp'];

        // If there's a delay, add it to start of timeline
        if (obj.delay !== null) { obj._timeline.set({}, {}, "+=" + obj.delay); }
        // Add content to the timeline
        obj._timeline.add(obj._timelineContent);

        obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(obj.reset, function(i, r) { obj._resetStr = obj._resetStr + ' ' + r; });

        obj._run = function(e) {
          that.imm.utils.log(that.imm, "Running " + registration.type + " '" + registration.name + "'");
          obj._timeline.play();
        }

        obj._reset = function(e) {
          that.imm.utils.log(that.imm, "Resetting " + registration.type + " '" + registration.name + "'");
          obj._timeline.pause(0, true);
        }

        registration.$section.on(obj._runtimeStr, obj['_run']);
        registration.$section.on(obj._resetStr, obj['_reset']);

        // Set starting animation state
        var currentSection = this.imm._currentSection;

        // If we're on the section the animation is registered on, set animation progress to finished
        if (currentSection !== undefined && currentSection.id === registration.section.id) {
          obj._timeline.progress(1, false);
        } else {
          obj._timeline.pause(0, true);
        };

//         this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;

      },

      // Register Section Action
      ///////////////////////////////////////////////////////

      action: function(registration) {

        var obj = registration.obj,
            that = this;

        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];
        obj.reset = obj.hasOwnProperty('reset') ? obj.reset : ['exitedDown', 'exitedUp'];

        obj._runtimeStr = ''; obj._resetStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });
        // Prepare resets
        $.each(obj.reset, function(i, r) { obj._resetStr = obj._resetStr + ' ' + r; });

        if (obj.hasOwnProperty('fire')) {
          obj._run = function() {
            setTimeout(function() {
              that.imm.utils.log(that.imm, "Firing " + registration.type + " '" + registration.name + "'");
              obj.fire.call(registration.obj, registration.section);
            }, obj.delay);
          }
        }

        registration.$section.on(obj._runtimeStr, obj['_run']);

        if (obj.hasOwnProperty('clear')) {
          obj._reset = function() {
            that.imm.utils.log(that.imm, "Clearing " + registration.type + " '" + registration.name + "'");
            obj.clear.call(registration.obj, registration.section);
          }
          registration.$section.on(obj._resetStr, obj['_reset']);
        }

//         this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;

      },

      // Register Section Attribute
      ///////////////////////////////////////////////////////

      attribute: function(registration) {

        var obj = registration.obj,
            that = this;

        obj.delay = !isNaN(obj.delay) ? obj.delay : null;
        obj.runtime = obj.hasOwnProperty('runtime') ? obj.runtime : ['enteringDown', 'enteringUp'];
        obj.reset = obj.hasOwnProperty('reset') ? obj.reset : ['exitedDown', 'exitedUp'];

        obj._runtimeStr = '';

        // Prepare runtimes
        $.each(obj.runtime, function(i, r) { obj._runtimeStr = obj._runtimeStr + ' ' + r; });

        obj._run = function(e) {
          setTimeout(function() {
            that.imm.utils.log(that.imm, 'Updating ' + registration.type + " '" + registration.name + "' to '" + obj.value + "'");
            that.imm.$elem.trigger(registration.name, obj.value);
          }, obj.delay);
        }

        registration.$section.on(obj._runtimeStr, obj['_run']);

//         this.imm.utils.log(this.imm, "Registered " + registration.type + " '" + registration.name + "'");
        obj._active = true;
      }

    },

    // Kill
    ///////////////////////////////////////////////////////

    kill: {

      // Promise, queue, queueCheck defined in initSection

      // Kill all
      all: function(registration) {
        var obj = registration.obj;

        // Kill animation timeline
        if (registration.type === 'animation') {
          this.kill.timeline.call(this, obj._timeline);
        }

        // Kill animation & actions reset string
        if (registration.type === 'animation' || registration.type === 'action') { registration.$section.off(obj._resetStr, obj._reset); }

        // Kill animation, action and attribute runtime string
        registration.$section.off(obj._runtimeStr, obj._run);

        // Set object to not active
//         this.imm.utils.log(this.imm, "Killed " + registration.type + " '" + registration.name + "'");
        obj._active = false;

        // Remove from kill queue
        var removeFromQueue = registration.section._kill.queue.filter(function(i, queueObj) {
          return queueObj.name === registration.name && queueObj.section[0] === registration.$section[0]
        });
        registration.section._kill.queue.splice( $.inArray(removeFromQueue, registration.section._kill.queue), 1);
        registration.section._kill.queueCheck.call(this);
      },

      // Kill timeline
      timeline: function(timeline) {
        var tweens = timeline.getChildren();
        timeline.kill();
        $.each(tweens, function(i, tween) {
          if (tween.target.selector) {
            TweenMax.set(tween.target.selector, { clearProps:'all' });
          }
        });
      }
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

    add: function(imm, id, section) {
      var c = new controller[n](this);
      c.add.call(c, imm, id, section);
      return c;
    },

    reinitSections: function(imm) {
      var c = new controller[n](this);
      c.reinitSections.call(c, imm);
      return c;
    }
  }

})( jQuery, window , document );