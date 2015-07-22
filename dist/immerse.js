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

    init: function(elem, setup) {

      this.elem = elem;
      this.$elem = $(elem);
      this.setup = setup.setup;
      this.assets = this.setup.assets;
      this.sections = [];

      var that = this;

      // Init device view utilities
      this.utils.deviceView.init.call(this);

      // Load assets
      this.utils.assets.register.call(this, this);

      // Setup sections
      this.controllers.section.call(this, this);

      // Setup the scroll controller
      this.controllers.scroll.init.call(this, this);

      // Setup the navigation controller
      this.controllers.navigation.init.call(this, this);

      // Init audio
      this.controllers.audio.init.call(this, this);

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
            transition: that.setup.options.transition,
            navigation: {
              hideSection: false,
              string: $($s)[0].id
            }
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
          // Run init trigger
          $(s.element).trigger('init');
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


      },

      // Scroll Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      scroll: {

        isScrolling: false,
        canScroll: true,

        init: function(that) {
          // If element initiated on is body, set the scroll target to window
          this.scrollContainer = ($(this.elem)[0] === $('body')[0]) ? $(window) : $(this.elem);
          // Set current section
          this.controllers.scroll.currentSection = this.sections[0];
          // Ensure page always starts at the top
          this.scrollContainer.scrollTop(0);
          // Bind to mousehweel
          this.scrollContainer.bind('mousewheel wheel DOMMouseScroll', function(e) {
            that.controllers.scroll.handler.call(that, e);
          });
          // Bind to arrow keys
          $(document).keydown(function(e) {
            switch(e.which) {

              case 38: // up
                e.preventDefault();
                if (that.controllers.scroll.isScrolling !== false && that.controllers.scroll.canScroll !== true) { return false; }
                that.controllers.scroll.isScrolling = true;
                that.controllers.scroll.go.call(that, 'UP');

              break;

              case 40: // down
                e.preventDefault();
                if (that.controllers.scroll.isScrolling !== false && that.controllers.scroll.canScroll !== true) { return false; }
                that.controllers.scroll.isScrolling = true;
                that.controllers.scroll.go.call(that, 'DOWN');

              break;

              default: return; // exit this handler for other keys
            }
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

        go: function(o) {
          var ns, tr, direction,
              cs = this.controllers.scroll.currentSection,
              i = this.sections.indexOf(cs),
              $cs = $(cs.element),
              that = this;

          // If we've passed a jQuery object directly, use it as the next section
          if (o.jquery) {
            ns = $.grep(this.sections, function(s) { return o[0].id == s.element[0].id; })[0];
            // Determine direction
            direction = cs.scrollOffset > ns.scrollOffset ? 'UP' : 'DOWN';

          // Else if we've just passed the scroll direction, find the next section
          } else if (o === 'UP' || o === 'DOWN') {
            direction = o;
            ns = (direction === 'UP') ? this.sections[i-1] : this.sections[i+1];
          }

          if (direction === 'UP') {
            tr = { exiting: 'exitingUp', entering: 'enteringUp', exited: 'exitedUp', entered: 'enteredUp' }
          } else if (direction === 'DOWN') {
            tr = { exiting: 'exitingDown', entering: 'enteringDown', exited: 'exitedDown', entered: 'enteredDown' }
          }

          // If there's no new section, don't scroll!
          if (ns === undefined) {
            that.controllers.scroll.isScrolling = false;
            that.controllers.scroll.canScroll = true;
            return false;
          }

          // New section element
          var $ns = $(ns.element),
          // New section scroll offset
          t = ns.scrollOffset;

          // Set current section to exiting
          $cs.trigger(tr.exiting);
          // Set new section to entering
          $ns.trigger(tr.entering);

          this.$elem.animate({scrollTop: t}, 1000, function() {

            // Set new section to entered
            $ns.trigger(tr.entered);
            // Set current section to exited
            $cs.trigger(tr.exited);
            // We're done, so set new section as current section
            that.$elem.trigger('sectionChanged', [{
              prev: cs,
              current: ns,
            }]);
            that.controllers.scroll.currentSection = ns;

            setTimeout(function() {
              // Reset flags
              that.controllers.scroll.isScrolling = false;
              that.controllers.scroll.canScroll = true;
            }, 500);

          });
        }

      },

      // Navigation Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      navigation: {
        init: function(that) {
          // Add nav items to do
          this.controllers.navigation.addToDOM.call(this);
          // Set current
          var navItem = $('.imm-nav-list li a[data-imm-section="#' + this.controllers.scroll.currentSection.element[0].id + '"]');
          that.controllers.navigation.update.call(that, navItem);
          // On nav list click
          $('.imm-nav-list li a').on('click', function() {
            var $target = $($(this).data('imm-section'));
            that.controllers.scroll.go.call(that, $target);
            that.controllers.navigation.update.call(that, $(this));
          });
          // Handle on scroll
          this.$elem.on('sectionChanged', function(e, d) {
            var navItem = $('.imm-nav-list li a[data-imm-section="#' + d.current.element[0].id + '"]');
            that.controllers.navigation.update.call(that, navItem);
          });
        },

        addToDOM: function() {

          var nav = $('.imm-nav-list');
          if (nav.length === 0) { return false; }

          var str = '';

          $.each(this.sections, function(i, s) {
            if (s.navigation.hideSection) { return false; }
            str = str + '<li>
                          <a class="imm-nav-link" data-imm-section="#' + s.element[0].id + '">
                            <span>' + s.navigation.string + '</span>
                          </a>
                        </li>';
          });
          // Add list to any elem with .imm-nav-sections class
          nav.html(str);
        },

        update: function($e) {
          $('.imm-nav-list li a').removeClass('current');
          if ($e !== undefined) { $e.addClass('current'); }
        }
      },

      // Audio Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      audio: {

        all: [],
        playing: [],
        muted: false,

        init: function(that) {

          // Ensure mute buttons are in correct state
          this.controllers.audio.muteBtns.init.call(this);
          // Setup audio for initial section
          this.controllers.audio.handleChange.call(this, this, this.controllers.scroll.currentSection.audio);
          // Setup audio change when a section changes
          this.$elem.on('sectionChanged', function(e, d) {
            that.controllers.audio.handleChange.call(that, that, d.current.audio);
          });
          // Handle muting when window is closed
          this.controllers.audio.handleBlurFocus.call(this);
        },

        handleChange: function(that, audioObj) {

          if (this.controllers.audio.muted) { return false; }

          this.controllers.audio.playing = [];

          this.controllers.audio.start.call(this, audioObj);

          var audioToMute = this.controllers.audio.all.filter(function(a) {
            return $.inArray(a, that.controllers.audio.playing) === -1;
          });

          this.controllers.audio.mute.call(this, audioToMute);

        },

        start: function(audioObj) {

          var that = this;

          if (audioObj !== undefined) {
            // Transition new audio to play
            $.each(audioObj, function(name, o) {

              var $a = $('audio#' + name), // Get audio
                  d = !isNaN(o.delay) ? o.delay : 0; // If a delay is set

              // Push to playing array
              that.controllers.audio.playing.push(name);

              // If it's not already playing, make sure volume is set at 0 before it fades in.
              if ($a[0].paused) { $a[0].volume = 0; $a[0].play(); }
              // Transition the sound
              TweenMax.to($a, o.changeDuration, { volume: o.volume, ease: Linear.easeNone, delay: d });
            });
          }

        },

        mute: function(audioToMute) {
          // Mute audio
          $.each(audioToMute, function(i, name) {

            var $a = $('audio#' + name); // Get audio
            TweenMax.to($a, 1, {
              volume: 0, ease: Linear.easeNone, onComplete: function() { $a[0].pause(); $a[0].currentTime = 0; }
      		  });

          });

        },

        muteBtns: {
          init: function() {

            var that = this;

            // Get a handle on all mute buttons
            this.controllers.audio.$muteBtns = this.$elem.find('.imm-mute');

            // Set initial value based on state
            if (this.utils.cookies.get('immAudioState') === 'muted') {
              this.controllers.audio.muteBtns.change.call(this, 'off');
            } else {
              this.controllers.audio.muteBtns.change.call(this, 'on');
            }

            // Watch for changes
            this.controllers.audio.$muteBtns.on('click', function() {
              that.controllers.audio.muteBtns.click.call(that);
            });

          },

          change: function(state) {
            var s;
            if (state === 'off') {
              s = this.setup.options.muteButton.muted;
              this.controllers.audio.$muteBtns.addClass('imm-muted').html(s);
              this.controllers.audio.muted = true;
            } else {
              s = this.setup.options.muteButton.unmuted;
              this.controllers.audio.$muteBtns.removeClass('imm-muted').html(s);
              this.controllers.audio.muted = false;
            }
          },

          click: function() {
            // If audio is muted, turn it on
            if (this.controllers.audio.muted) {
              var currentAudio = this.controllers.scroll.currentSection.audio;
              this.controllers.audio.start.call(this, currentAudio);
              this.controllers.audio.muteBtns.change.call(this, 'on');
              this.utils.cookies.set.call(this, 'immAudioState', '', 3650);
            // Else if it's on, mute it
            } else {
              var audioToMute = this.controllers.audio.playing;
              this.controllers.audio.mute.call(this, audioToMute);
              this.controllers.audio.muteBtns.change.call(this, 'off');
              this.utils.cookies.set.call(this, 'immAudioState', 'muted', 3650);
            }
          }
        },

        handleBlurFocus: function() {

          var that = this;

          $(window).on('blur', function() {
            var audioToMute = that.controllers.audio.playing;
            if (!that.controllers.audio.muted) { that.controllers.audio.mute.call(that, audioToMute); }
          });

          $(window).on('focus', function() {
            var currentAudio = that.controllers.scroll.currentSection.audio;
            if (!that.controllers.audio.muted) { that.controllers.audio.start.call(that, currentAudio); }
          });
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
          this.windowWidth = $(window).width();
          this.windowHeight = $(window).height();
          this.utils.deviceView.set.call(this, this.windowWidth);
          this.utils.deviceView.resize.call(this, this);

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
            that.utils.deviceView.set.call(that, that.windowWidth);
            that.controllers.scroll.scrollOffset.update.call(that);
            that.controllers.scroll.stickySection.call(that);
          });
        },

        check: function(a) {

          // Prepare devices
          var mobile = $.inArray('mobile', a.devices) !== -1,
              desktop = $.inArray('desktop', a.devices) !== -1

          // If animation is for mobile but not desktop and we're not in a mobile view
          // ...or...
          // If animation is for desktop but not mobile and we're not in a desktop view
          if (mobile && !desktop && !this.isMobile || desktop && !mobile && !this.isDesktop) { return false; }
        }

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

      // Asset management
      ///////////////////////////////////////////////////////

      assets: {
        register: function(that) {

          $.each(this.assets, function(n, a) {

            // Add audio to DOM
            if (a.type === 'audio') { that.utils.assets.addToDOM.audio.call(that, n, a); }

            // some method of loading & tracking load needs to go here

          });
        },

        addToDOM: {
          audio: function(n, a) {
            var l = a.loop == true ? 'loop' : '';
            this.$elem.append('<audio id="' + n + '" class="imm-audio" src="' + a.path + '" ' + l + '></audio>');
            this.controllers.audio.all.push(n);
            return true;
          }
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
          transition: page.defaults.options.transition,
          navigation: {
            hideSection: false,
            string: section.element[0].id
          }
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
        return new Immerse(this).utils.extendSection(page, section);
      }
    },

    init: function(elem, setup) {
      new Immerse(this).init(elem, setup);
    }

  }

})( jQuery, window , document );
