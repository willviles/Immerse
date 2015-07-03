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
          // Set a default for the fixedScroll value. Any section can change or disable it.
          fixedScroll: 0,
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
      this.setup = $.extend(this.defaults, this.setup);

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
      this.sections = this.setup.sections;

      var that = this;

      // Init device view utilities
      this.utilities.deviceView.init.call(this);

      // Load assets
      this.utilities.assets.register.call(this, this);

      // Setup the scrollMagic controller
      this.controllers.scrollMagic = new ScrollMagic.Controller({
        container: that.$elem.selector
      });

      // Setup the scroll controller
      this.controllers.scroll.init.call(this, elem);

      // Call new sections
      this.controllers.section.call(this, this);

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

        this.$elem.on('scroll', function() {
          var scrollPos = that.controllers.scrollMagic.scrollPos();
        });

        $.each(this.sections, function(i, s) {

          // jQuerify section
          var $s = $(s.element);
          // Register scenes
          that.utilities.scenes.register.call(that, $s);
          // Set scroll triggers
//           that.controllers.scroll.sectionTriggers.call(that, $s);

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

        canScroll: true,

        init: function(c) {

          // If element initiated on is body, set the scroll target to window
          this.scrollContainer = ($(c)[0] === $('body')[0]) ? $(window) : $(c);
          var that = this;

          // Consider how we're going to

/*
          this.scrollContainer.on('scroll touchmove mousewheel', function(e) {

            var d = that.controllers.scrollMagic.info('scrollDirection');

            console.log(d);

            console.log(that.controllers.scroll.canScroll);

            e.preventDefault(); e.stopPropagation();

            if (that.controllers.scroll.canScroll === true) {
              that.controllers.scroll.canScroll = false;
              that.controllers.scroll.go.call(that, d, c);
            }



          });
*/
        },

        go: function(d, c) {
          var t,
              that = this;

          if (d === 'REVERSE') { t = '-=500px'; } else if (d === 'FORWARD') { t = '+=500px' };

          $(c).animate({scrollTop: t}, 500, function() {
            setTimeout(function() {
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
            that.utilities.deviceView.set(that, that.windowWidth);
          });
        }
        // TODO: Add some method of sticking the resize to the top of the current section
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
          fixedScroll: page.defaults.options.fixedScroll,
          updateNav: page.defaults.options.updateNav
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
