/*
Script Name: Immerse.js
Description: Build immersive, media driven web experiences the easy way
Version: 1.0.1
Author: Will Viles
Author URI: http://vil.es/
*/

(function( $, window, document, undefined ){

  // our plugin constructor
  var Immerse = function() {};

  // the plugin prototype
  Immerse.prototype = {

    // Setup
    ///////////////////////////////////////////////////////

    setup: function(setup) {

      this.defaults = {
        preload: {},
        options: {
          // Set a default for the section selector
          sectionSelector: '.imm-section',
          // Transition
          defaultTransition: {
            type: 'scroll', duration: 250
          },
          // Set breakpoints
          breakpoints: {
            mobile: 480,
            tablet: 768,
            mdDesktop: 992,
            lgDesktop: 1200
          },
          muteButton: {
            unmuted: 'Audio On',
            muted: 'Audio Off',
          }
        },
        sections: []
      };

      this.setup = $.extend(true, this.defaults, setup);

      return this;
    },

    // Initialize
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    init: function(elem) {

      this.elem = elem;
      this.$elem = $(elem);
      this._assets = this.setup.assets;
      this._sections = [];
      this._isScrolling = false;
      this._canScroll = true;
      this._allAudio = [];

      var that = this;

      // Init device view utilities
      this.utils.deviceView.init.call(this);

      // Setup the Asset Queue
      this._assetQueue = $.Immerse.assetController.register(this);

      // Setup the Scroll Controller
      this.controllers.section.call(this, this);

      // Setup the Scroll Controller
      $.Immerse.scrollController.init(this);

      // Setup the Navigation Controller
      $.Immerse.navigationController.init(this);

      // Setup the Audio Controller
      $.Immerse.audioController.init(this);

      // Ensure init is called when assets are loaded
      $.Immerse.assetController.loading(this);

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
          var u = $($s).hasClass('imm-fullscreen') ? false : true,
              n = that.utils.stringify($($s)[0].id),
              s = {
                name: n,
                element: $($s),
                updateNav: that.setup.options.updateNav,
                transition: that.setup.options.transition,
                options: {
                  hideFromNav: false,
                  unbindScroll: u
                }
              };
          that._sections.push(s);
        });

        // Setup all defined sections
        $.each(this.setup.sections, function(i, s) {

          // jQuerify section
          var $s = $(s.element);

          // Replace selector created section
          // E.g If $(s.element) matches $(this._sections[i].element), remove that record and replace with new one.
          $.each(that._sections, function(i, _s) {
            that._sections[i] = $(_s.element)[0] === $(s.element)[0] ? s : _s;
          });

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
          // Videos
          var sectionVideos = $s.find('[data-imm-video]');
          $.each(sectionVideos, function(i, wrapper) {
            $.Immerse.videoController.init(that, s, $(wrapper));
          });
          // Tooltips
          var tooltips = $s.find('[data-imm-tooltip]');
          $.each(tooltips, function(i, tooltip) {
            that.components.tooltips.init.call(that, $(tooltip));
          });
        });

        $.Immerse.scrollController.updateSectionOffsets(this);

        // Order sections by vertical order
        this._sections.sort(function(obj1, obj2) {
        	return obj1.scrollOffset - obj2.scrollOffset;
        });
      },

      // Animation Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      animation: function(s, n, a) {

        // Proceed or kill based upon device selection
        if (this.utils.deviceView.check.call(this, a) === false) { return false };

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

      // Action Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      action: function(s, n, a) {

        // Proceed or kill based upon device selection
        if (this.utils.deviceView.check.call(this, a) === false) { return false };

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

      // Attribute Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      attribute: function(s, n, a) {

        // Proceed or kill based upon device selection
        if (this.utils.deviceView.check.call(this, a) === false) { return false };

        var value = a.value,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.$elem.trigger(n, value);
          }, d);
        });


      }

    },

    // Components
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    components: {

      // Sliders
      ///////////////////////////////////////////////////////
      sliders: {
        // Choose whether to build own slider or use iDangerous swiper.
      },

      // Modals
      ///////////////////////////////////////////////////////
      modals: {
        // Content which is displayed over the top of the current screen.
      },

      // Modals
      ///////////////////////////////////////////////////////
      stacks: {
        // Content which slides out the section content and reveals more content with a back button to go back to the current content.

        // Firstly need to wrap the section content in a div which can slide out

        // Secondly need to hide the stack content

        // Thirdly need some kind of animation to fire on a button press

        // Fouthly need to enable native scrolling on the section.

        // Fifthly need to fire another animation to take you back to the content
      },

      // Tooltips
      ///////////////////////////////////////////////////////
      tooltips: {
        init: function($t) {
          var c = $t.data('imm-tooltip'),
              c = c.charAt(0) === '#' ? $(c) : c,
              c = (c.jquery) ? $(c).html() : c,
              that = this;

          // Append correct tooltip content
          $tContent = $('<span class="imm-tooltip">' + c + '</span>');
          $t.append($tContent);

          $t.on('mouseover', function() {
            that.components.tooltips.position.call(that, $t, $tContent);
          });
        },

        position: function($t, $tContent) {

          $tContent.removeClass('top left right bottom');

          // TODO: Method of determining the placement of the tooltip
          var tHeight = $tContent.height(),
              tWidth = $tContent.width(),
              tXY = $t[0].getBoundingClientRect(),
              p = 'top';

          // Determine vertical position
          if (tHeight >= tXY.top) { p = 'bottom'; }

          if (tWidth/2 >= tXY.left) {
            p = 'right';
          } else if (tWidth/2 >= $(window).width() - tXY.right) {
            p = 'left';
          }

          // Add position to tooltip
          $tContent.addClass(p);
        }
      }

    },

    // Utilities
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    utils: {

      // Device View functions
      ///////////////////////////////////////////////////////

      deviceView: {
        init: function() {
          this._windowWidth = $(window).width();
          this._windowHeight = $(window).height();
          this.utils.deviceView.set.call(this, this._windowWidth);
          this.utils.deviceView.resize.call(this, this);

        },

        set: function(width) {
          var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent),
              isMobileWidth = width <= 480;

          if (isMobile || isMobileWidth) {
            this._device = 'mobile';
            this._isMobile = true;
            this._isDesktop = false;
          } else {
            this._device = 'desktop';
            this._isMobile = false;
            this._isDesktop = true;
          }
        },

        resize: function(that) {

          this._windowWidth = $(window).width();
          this._windowHeight = $(window).height();
          $(window).on('resize', function() {
            that.utils.deviceView.set.call(that, that._windowWidth);
            $.Immerse.scrollController.updateSectionOffsets(that);
            $.Immerse.scrollController.stickSection(that);
            // Resize background videos
            if (!that._isMobile) {
              $.Immerse.videoController.resizeAll(that);
            }
          });
        },

        check: function(a) {

          // Prepare devices
          var mobile = $.inArray('mobile', a.devices) !== -1,
              desktop = $.inArray('desktop', a.devices) !== -1

          // If animation is for mobile but not desktop and we're not in a mobile view
          // ...or...
          // If animation is for desktop but not mobile and we're not in a desktop view
          if (mobile && !desktop && !this._isMobile || desktop && !mobile && !this._isDesktop) { return false; }
        }

      },

      stringify: function(str) {
        return str.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
      },

      cookies: {
        set: function(name, value, expiresInSeconds) {
          var r = new Date;
          r.setTime(r.getTime() + expiresInSeconds * 24 * 60 * 60 * 1e3);
          var i = "expires=" + r.toGMTString();
          document.cookie = name + "=" + value + "; " + i

        },

        get: function(e) {
          var t = e + "=",
              n = document.cookie.split(";");
          for (var r = 0; r < n.length; r++) {
              var i = n[r];
              while (i.charAt(0) == " ") i = i.substring(1);
              if (i.indexOf(t) != -1) return i.substring(t.length, i.length)
          }
          return ""
        },

        delete: function(e) {
          this.utils.cookies.set.call(this, e, '', -1);
        }

      },

      // Extend Section
      ///////////////////////////////////////////////////////

      extendSection: function(section) {

        var defaults = {
          name: section.element[0].id,
          animations: {},
          actions: {},
          attributes: {},
          updateNav: this.setup.options.updateNav,
          transition: this.setup.options.transition,
          options: {
            hideFromNav: false,
            unbindScroll: false
          }
        }

        var section = $.extend(true, defaults, section);
        this.setup.sections.push(section);
        return section;
      }
    },

    // API Endpoints
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    // Add a section to a page
    section: function(section) {
      return this.utils.extendSection.call(this, section);
    },

    // Expose audio endpoint to get state of audio & mute/unmute programmatically
    audio: function(status) {
      if (status === undefined) {
        return this._muted ? false : true;
      } else {
        $.Immerse.audioController.changeStatus(this, status);
      }
    },

    // Expose changeSection endpoint to allow for changing section programmatically
    changeSection: function(goVar) {
      if (goVar === undefined) { return false; }
      $.Immerse.scrollController.doScroll(this, $target);
    }

  }; // End of all plugin functions


  $.Immerse = {
    setup: function(setup) {
      return new Immerse(this).setup(setup);
    }
  }

})( jQuery, window , document );