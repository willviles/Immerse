(function( $, window, document, undefined ){

  // our plugin constructor
  var Immerse = function() {};

  // the plugin prototype
  Immerse.prototype = {

    // Setup
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    setup: function(setup) {

      this.setup = setup;

      this.defaults = {
        preload: {},
        options: {
          // Set a default for the section selector
          sectionSelector: '.imm-section',
          // Transition
          transition: 'default',
          // Set a default for the updateNav value. Any section can change it.
          updateNav: true,
          // Set breakpoints
          breakpoints: {
            mobile: 480,
            tablet: 768,
            mdDesktop: 992,
            lgDesktop: 1200
          }
        },
        sections: []
      };
      this.setup = $.extend(this.setup, this.defaults);

      return this;
    },

    // Initialize
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    init: function(elem, setup) {

      this.elem = elem;
      this.$elem = $(elem);
      this.setup = setup.setup;
      this.assets = this.setup.assets;
      this.sections = [];

      var that = this;

      // Init device view utilities
      this.utilities.deviceView.init.call(this);

      // Load assets
      this.utilities.assets.register.call(this, this);

      // Setup the scrollMagic controller
      this.controllers.scrollMagic = new ScrollMagic.Controller({
        container: that.$elem.selector
      });

      // Setup sections
      this.controllers.section.call(this, this);

      // Setup the scroll controller
      this.controllers.scroll.init.call(this, elem);

      return this;
    },

    // Controllers
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    controllers: {

      // Section Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      section: function(that) {

        // Add all sections by selector

        var $allSectionElems = $(this.setup.options.sectionSelector);

        $.each($allSectionElems, function(i, $s) {
          var s = {
            element: $($s),
            updateNav: that.setup.options.updateNav,
            transition: that.setup.options.transition
          };
          that.sections.push(s);
        });

        // Setup all defined sections
        $.each(this.setup.sections, function(i, s) {

          // jQuerify section
          var $s = $(s.element);

          // Replace selector created section
          // E.g If $(s.element) matches $(this.sections[i].element), remove that record and replace with new one.
          $.each(that.sections, function(i, _s) {
            that.sections[i] = $(_s.element)[0] === $(s.element)[0] ? s : _s;
          });

          // Register scenes
          that.utilities.scenes.register.call(that, $s);

          // Animations
          $.each(s.animations, function(name, animation) {
            that.controllers.animation.call(that, $s, name, animation);
          });
          // Actions
          $.each(s.actions, function(name, action) {
            that.controllers.action.call(that, $s, name, action);
          });
          // Attributes
          $.each(s.attributes, function(name, attr) {
            that.controllers.attribute.call(that, $s, name, attr);
          });

        });

        $.each(this.sections, function(i, s) {
          // Set scroll triggers on all sections
          that.controllers.scroll.scrollOffset.set.call(that, s);
        });

        // Order sections by vertical order
        this.sections.sort(function(obj1, obj2) {
        	return obj1.scrollOffset - obj2.scrollOffset;
        });

      },

      // Animation Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      animation: function(s, n, a) {

        var t = new TimelineLite({ paused: true }),
            c = function() {
              return a.timeline(s);
            },
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

        // Prepare devices
        var mobile = $.inArray('mobile', a.devices) !== -1,
            desktop = $.inArray('desktop', a.devices) !== -1;

        // If animation is for mobile but not desktop and we're not in a mobile view
        // ...or...
        // If animation is for desktop but not mobile and we're not in a desktop view
        if (mobile && !desktop && !that.isMobile || desktop && !mobile && !that.isDesktop) { return false; }

        s.on(runtimeStr, function() {
          console.log('Running ' + n);
          t.play();
        });

        s.on(resetStr, function() {
          console.log('Resetting ' + n);
          t.pause(0, true);
        });

      },

      // Scroll Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      action: function(s, n, a) {

        var action = a.action,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        // Prepare devices
        var mobile = $.inArray('mobile', a.devices) !== -1,
            desktop = $.inArray('desktop', a.devices) !== -1;

        // If animation is for mobile but not desktop and we're not in a mobile view
        // ...or...
        // If animation is for desktop but not mobile and we're not in a desktop view
        if (mobile && !desktop && !that.isMobile || desktop && !mobile && !that.isDesktop) { return false; }

        s.on(runtimeStr, function() {
          setTimeout(function() {
            action.call(that, s);
          }, d);
        });

      },

      // Attribute Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      attribute: function(s, n, a) {

        var value = a.value,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        // Prepare devices
        var mobile = $.inArray('mobile', a.devices) !== -1,
            desktop = $.inArray('desktop', a.devices) !== -1;

        // If animation is for mobile but not desktop and we're not in a mobile view
        // ...or...
        // If animation is for desktop but not mobile and we're not in a desktop view
        if (mobile && !desktop && !that.isMobile || desktop && !mobile && !that.isDesktop) { return false; }

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.$elem.trigger(n, value);
          }, d);
        });


      },

      // Scroll Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      scroll: {

        isScrolling: false,
        canScroll: true,

        init: function(c) {

          // If element initiated on is body, set the scroll target to window
          this.scrollContainer = ($(c)[0] === $('body')[0]) ? $(window) : $(c);
          var that = this;

          // Set current section
          this.controllers.scroll.currentSection = this.sections[0];

          this.scrollContainer.scrollTop(0);

          // Bind to mousehweel
          this.scrollContainer.bind('mousewheel wheel DOMMouseScroll', function(e) {
            that.controllers.scroll.handler.call(that, e);
          });

        },

        scrollOffset: {

          set: function(s) {
            s.scrollOffset = $(s.element).offset().top;
          },

          update: function() {

            // Update on resize handler
            var that = this;
            $.each(this.sections, function(i, s) {
              that.controllers.scroll.scrollOffset.set.call(that, s);
            });

          }
        },

        stickySection: function() {
          var t = this.controllers.scroll.currentSection.scrollOffset;
          this.scrollContainer.scrollTop(t);
        },

        status: function(status, e) {
          function preventDefaultScroll(e) {
            e = e || window.event;
            if (e.preventDefault) { e.preventDefault(); }
            e.returnValue = false;
          }

          if (status === 'enable') {

            if (window.removeEventListener) {
              window.removeEventListener('DOMMouseScroll', preventDefaultScroll, false);
            }
            window.onmousewheel = document.onmousewheel = null;
            window.onwheel = null;
            window.ontouchmove = null;

          } else if (status === 'disable') {

            if (window.addEventListener) {
              window.addEventListener('DOMMouseScroll', preventDefaultScroll, false);
            }
            window.onwheel = preventDefaultScroll; // modern standard
            window.onmousewheel = document.onmousewheel = preventDefaultScroll; // older browsers, IE
            window.ontouchmove  = preventDefaultScroll; // mobile

          }
        },

        handler: function(e) {
          this.controllers.scroll.status('disable', e);

          if (this.controllers.scroll.isScrolling === false && this.controllers.scroll.canScroll === true) {
            this.controllers.scroll.isScrolling = true;

            if (e.originalEvent.wheelDelta >= 0) {
              this.controllers.scroll.go.call(this, 'UP');
            } else {
              this.controllers.scroll.go.call(this, 'DOWN');
            }
          }
        },

        go: function(d) {
          var t, ns,
              i = this.sections.indexOf(this.controllers.scroll.currentSection);
              that = this;

          if (d === 'UP') {
            ns = this.sections[i-1];
          } else if (d === 'DOWN') {
            ns = this.sections[i+1];
          }

          if (ns === undefined) {
            that.controllers.scroll.isScrolling = false;
            that.controllers.scroll.canScroll = true;
            return false;
          }

          t = ns.scrollOffset;

          this.$elem.animate({scrollTop: t}, 500, function() {
            setTimeout(function() {
              that.controllers.scroll.currentSection = ns;
              that.controllers.scroll.isScrolling = false;
              that.controllers.scroll.canScroll = true;
            }, 1000);

          });
        }

      },

      // Audio Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      audio: function() {

      },

      // Navigation Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      navigation: function() {

      }
    },

    // Utilities
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    utilities: {

      // Device View functions
      ///////////////////////////////////////////////////////

      deviceView: {
        init: function() {
          this.windowWidth = $(window).width();
          this.windowHeight = $(window).height();
          this.utilities.deviceView.set.call(this, this.windowWidth);
          this.utilities.deviceView.resize.call(this, this);

        },

        set: function(width) {
          var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent),
              isMobileWidth = width <= 480;

          if (isMobile || isMobileWidth) {
            this.device = 'mobile';
            this.isMobile = true;
            this.isDesktop = false;
          } else {
            this.device = 'desktop';
            this.isMobile = false;
            this.isDesktop = true;
          }
        },

        resize: function(that) {

          this.windowWidth = $(window).width();
          this.windowHeight = $(window).height();
          $(window).on('resize', function() {
            that.utilities.deviceView.set.call(that, that.windowWidth);
            that.controllers.scroll.scrollOffset.update.call(that);
            that.controllers.scroll.stickySection.call(that);
          });
        }

      },

      // Asset management
      ///////////////////////////////////////////////////////

      assets: {
        register: function(that) {

          $.each(this.assets, function(n, a) {

            // Add audio to DOM
            if (a.type === 'audio') { that.utilities.assets.addToDOM.audio.call(that, n, a); }

            // some method of loading & tracking load needs to go here

          });
        },

        addToDOM: {
          audio: function(n, a) {
            var l = a.loop == true ? 'loop' : '';
            this.$elem.append('<audio id="' + n + '" src="' + a.path + '" ' + l + '></audio>');
            return true;
          }
        }
      },

      // Setup section scenes
      ///////////////////////////////////////////////////////

      scenes: {
        add: function(options) {
          return new ScrollMagic.Scene(options).addTo(this.controllers.scrollMagic);
        },

        register: function(s) {

          var that = this,
            sheight = s.outerHeight(),
            sc1 = that.utilities.scenes.add.call(that, { triggerElement: s.selector, offset: 1 }),
            sc2 = that.utilities.scenes.add.call(that, { triggerElement: s.selector, offset: sheight + 1 }),
            sc3 = that.utilities.scenes.add.call(that, { triggerElement: s.selector, offset: (sheight * 2) + 1 });

            sc1.on('enter', function() { /* console.log(s.selector + ' entering down'); */ s.trigger('enteringDown'); }); // Entering down
            sc2.on('enter', function() { /* console.log(s.selector + ' exiting down'); */ s.trigger('exitingDown'); }); // Exiting down
            sc3.on('enter', function() { /* console.log(s.selector + ' exited down'); */ s.trigger('exitedDown'); }); // Exited down

            sc3.on('leave', function() { /* console.log(s.selector + ' entering up'); */ s.trigger('enteringUp'); }); // Entering up
            sc2.on('leave', function() { /* console.log(s.selector + ' exiting up'); */ s.trigger('exitingUp'); }); // Exiting up
            sc1.on('leave', function() { /* console.log(s.selector + ' exited up'); */ s.trigger('exitedUp'); }); // Exited up
        }
      },

      // Extend Section
      ///////////////////////////////////////////////////////

      extendSection: function(page, section) {

        var defaults = {
          animations: {},
          actions: {},
          attributes: {},
          updateNav: page.defaults.options.updateNav,
          transition: page.defaults.options.transition
        }

        var section = $.extend(true, defaults, section);
        page.setup.sections.push(section);
        return section;
      }
    }

  }; // End of all plugin functions


  $.Immerse = {
    page: {
      setup: function(setup) {
        return new Immerse(this).setup(setup);
      }
    },

    section: {
      setup: function(page, section) {
        return new Immerse(this).utilities.extendSection(page, section);
      }
    },

    init: function(elem, setup) {
      new Immerse(this).init(elem, setup);
    }

  }

})( jQuery, window , document );
