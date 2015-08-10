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
      this.assets = this.setup.assets;
      this.sections = [];
      this._isScrolling = false;
      this._canScroll = true;

      var that = this;

      // Init device view utilities
      this.utils.deviceView.init.call(this);

      var assets = this.controllers.assets.register.call(this, this);

      // Setup sections
      this.controllers.section.call(this, this);

      // Setup the scroll controller
      this.controllers.scroll.init.call(this, this);

      // Setup the navigation controller
      this.controllers.navigation.init.call(this, this);

      // Init audio
      this.controllers.audio.init.call(this, this);

      // Ensure init is called when assets are loaded
      $.when(assets).then(
        function(s) {
          // Run init on all sections
          $.each(that.sections, function(i, s) {
            $(s.element).trigger('init');
          });

          that.$elem.trigger('immInit');

          // Hide loading
          // TODO: Allow for custom loading animation sequences. Consider how to introduce a percentage bar
          $('.imm-loading').hide();

        },
        function(s) {
          alert('Asset loading failed');
        }
      );

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
          // Videos
          var sectionVideos = $s.find('[data-imm-video]');
          $.each(sectionVideos, function(i, videoWrapper) {
            that.controllers.video.init.call(that, s, $(videoWrapper));
          });
          // Tooltips
          var tooltips = $s.find('[data-imm-tooltip]');
          $.each(tooltips, function(i, tooltip) {
            that.components.tooltips.init.call(that, $(tooltip));
          });
        });

        $.each(this.sections, function(i, s) {
          // Set scroll triggers on all sections
          that.controllers.scroll.offset.set.call(that, s);
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

        init: function(that) {
          // If element initiated on is body, set the scroll target to window
          this._scrollContainer = ($(this.elem)[0] === $('body')[0]) ? $(window) : $(this.elem);
          // Set current section
          this._currentSection = this.sections[0];
          this._sectionBelow = this.sections[1];
          // Ensure page always starts at the top
          this._scrollContainer.scrollTop(0);
          // Get bound/unbound status of first section
          this._scrollUnbound = this._currentSection.options.unbindScroll ? true : false;
          // Manage binding or unbind of scroll on sectionChange
          this.$elem.on('immInit sectionChanged', function(e, d) {
            if (e.type === 'sectionChanged') {
              that._scrollUnbound = d.current.options.unbindScroll ? true : false;
            }
            $.each(that.controllers.scroll.events, function(n, f) { f.call(that); });
          });
        },

        events: {
          scroll: function() {
            this._scrollContainer.on('mousewheel wheel DOMMouseScroll', this.controllers.scroll.handlers.scroll.detect.bind(this));
          },

          keys: function() {
            $(document).on('keydown', this.controllers.scroll.handlers.keys.down.bind(this));
            $(document).on('keyup', this.controllers.scroll.handlers.keys.up.bind(this));
          },

          touch: function() {
            if (this._isDesktop) { return false; }

            $(document).off('touchstart touchmove touchend');

            if (this._scrollUnbound) {
              $(document).on('touchmove', this.controllers.scroll.unbound.bind(this));
            } else {
              $(document).on('touchstart', this.controllers.scroll.handlers.touch.start.bind(this));
            }

            $(document)
              .off('swipedown swipeup')
              .on('swipedown swipeup', this.controllers.scroll.handlers.touch.detect.bind(this));
          }

        },

        handlers: {

          // Scroll Handler
          scroll: {

            detect: function(e) {
              if (this._scrollUnbound) {
                // Enable browser scroll
                this.controllers.scroll.handlers.scroll.toggle('enable', e);
                this.controllers.scroll.unbound.call(this, e);

              } else {
                // Disable browser scroll
                this.controllers.scroll.handlers.scroll.toggle('disable', e);
                // Fire animation to next section
                if (e.originalEvent.wheelDelta >= 0) {
                  this.controllers.scroll.ifCanThenGo.call(this, 'UP');
                } else {
                  this.controllers.scroll.ifCanThenGo.call(this, 'DOWN');
                }
              }
            },

            toggle: function(status, e) {
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
            }

          },

          // Scroll Keys Handler
          keys: {
            down: function(e) {
              if (!this._scrollUnbound && this._lastKey && this._lastKey.which == e.which) {
                e.preventDefault();
                return;
              }
              this._lastKey = e;

              switch(e.which) {

                case 38: // up
                  if (this._scrollUnbound) {
                    this.controllers.scroll.unbound.call(this, e);
                  } else {
                    e.preventDefault();
                    this.controllers.scroll.ifCanThenGo.call(this, 'UP');
                  }
                break;

                case 40: // down
                  if (this._scrollUnbound) {
                    this.controllers.scroll.unbound.call(this, e);
                  } else {
                    e.preventDefault();
                    this.controllers.scroll.ifCanThenGo.call(this, 'DOWN');
                  }
                break;

                default: return; // exit this handler for other keys
              }
            },

            up: function(e) {
              this._lastKey = null;
            }

          },

          // Scroll Touch Handler
          touch: {

            start: function(e) {
              var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
              this._touchStartData = {
                time: (new Date).getTime(),
                coords: [ data.pageX, data.pageY ]
              };

              $(document)
                .on('touchmove', this.controllers.scroll.handlers.touch.move.bind(this))
                .one('touchend', this.controllers.scroll.handlers.touch.end.bind(this));
            },

            move: function(e) {
              if (!this._touchStartData) { return; }
              var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
              this._touchStopData = {
                time: (new Date).getTime(),
                coords: [ data.pageX, data.pageY ]
              };

              // prevent scrolling
              if (Math.abs(this._touchStartData.coords[1] - this._touchStopData.coords[1]) > 10) {
                e.preventDefault();
              }
            },

            end: function(e) {
              $(document).off('touchmove', this.controllers.scroll.handlers.touch.move);
              if (this._touchStartData && this._touchStopData) {
                if (this._touchStopData.time - this._touchStartData.time < 1000 &&
                    Math.abs(this._touchStartData.coords[1] - this._touchStopData.coords[1]) > 30 &&
                    Math.abs(this._touchStartData.coords[0] - this._touchStopData.coords[0]) < 75) {
                      var direction = this._touchStartData.coords[1] > this._touchStopData.coords[1] ? 'swipeup' : 'swipedown';
                      $(document).trigger(direction);
                }
              }
              this._touchStartData = this._touchStopData = undefined;
            },

            detect: function(e) {
              if (this._scrollUnbound) { return false; }
              switch(e.type) {
                case 'swipedown':
                  this.controllers.scroll.ifCanThenGo.call(this, 'UP');
                break;

                case 'swipeup':
                  this.controllers.scroll.ifCanThenGo.call(this, 'DOWN');
                break;

                default: return;
              }
            }
          }
        },

        ifCanThenGo: function(goVar) {
          if (this._isScrolling === false && this._canScroll === true) {
            this._isScrolling = true;
            this.controllers.scroll.go.fire.call(this, goVar);
          }
        },

        // Fire scrollChange
        go: {

          prepare: function(o) {
            var a = { currentSection: this._currentSection },
              that = this;

            a.$currentSection = $(a.currentSection.element);
            a.currentSectionIndex = this.sections.indexOf(a.currentSection);

            // If we've passed a jQuery object directly, use it as the next section
            if (o.jquery) {
              a.nextSection = $.grep(this.sections, function(s) { return o[0].id == s.element[0].id; })[0];
              // Determine direction
              a.direction = a.currentSection.scrollOffset > a.nextSection.scrollOffset ? 'UP' : 'DOWN';

            // Else if we've just passed the scroll direction, find the next section
            } else if (o === 'UP' || o === 'DOWN') {
              a.direction = o;
              a.nextSection = (a.direction === 'UP') ? this.sections[a.currentSectionIndex-1] : this.sections[a.currentSectionIndex+1];
            }

            // Setup direction triggers
            if (a.direction === 'UP') {
              a.triggers = { exiting: 'exitingUp', entering: 'enteringUp', exited: 'exitedUp', entered: 'enteredUp' }
            } else if (a.direction === 'DOWN') {
              a.triggers = { exiting: 'exitingDown', entering: 'enteringDown', exited: 'exitedDown', entered: 'enteredDown' }
            }

            // If there's no new section, don't scroll!
            if (a.nextSection === undefined) { return false; }

            a.$nextSection = $(a.nextSection.element);
            a.nextSectionIndex = this.sections.indexOf(a.nextSection);
            this._sectionAbove = this.sections[a.nextSectionIndex-1];
            this._sectionBelow = this.sections[a.nextSectionIndex+1];

            return a;
          },

          fire: function(o) {

            var opts = this.controllers.scroll.go.prepare.call(this, o);

            if (opts === false) {
              this._isScrolling = false;
              this._canScroll = true;
              return false;
            }

            // SCROLL LOGIC:
            // Just change section if...
            // 1) currentSection is unbound && nextSection is unbound
            // 2) currentSection is bound, nextSection is unbound && direction is up
            // Animate change if..
            // 1) nextSection is bound
            // 2) currentSection is bound, nextSection is unbound && direction is down
            if (opts.nextSection.options.unbindScroll) {
              if (opts.currentSection.options.unbindScroll) {
                this.controllers.scroll.go.change.call(this, opts);
              } else {
                if (opts.direction === 'UP') {
                  this.controllers.scroll.go.change.call(this, opts);
                } else if (opts.direction === 'DOWN') {
                  this.controllers.scroll.go.animate.call(this, opts);
                }
              }
            } else {
              this.controllers.scroll.go.animate.call(this, opts);
            }
          },

          animate: function(opts) {
            // New section scroll offset
            var dist = opts.nextSection.scrollOffset,
                that = this;

            // Set current section to exiting
            opts.$currentSection.trigger(opts.triggers.exiting);
            // Set new section to entering
            opts.$nextSection.trigger(opts.triggers.entering);

            this.$elem.animate({scrollTop: dist}, 1000, function() {
              // Set new section to entered
              opts.$nextSection.trigger(opts.triggers.entered);
              // Set current section to exited
              opts.$currentSection.trigger(opts.triggers.exited);
              // Set variables
              that._lastSection = opts.currentSection;
              that._currentSection = opts.nextSection;
              // We're done, so set new section as current section
              that.$elem.trigger('sectionChanged', [{
                last: that._lastSection,
                current: that._currentSection,
                below: that._sectionBelow,
                above: that._sectionAbove
              }]);

              setTimeout(function() {
                // Reset flags
                that._isScrolling = false;
                that._canScroll = true;
              }, 500);

            });
          },

          change: function(opts) {

            var that = this;

            // Set current section to exiting
            opts.$currentSection.trigger(opts.triggers.exiting);
            // Set new section to entering and entered
            opts.$nextSection.trigger(opts.triggers.entering);
            opts.$nextSection.trigger(opts.triggers.entered);

            // 1) Setup listeners to check whether opts.$currentSection has been exited (scrolled fully out of view).
            // 2) When they have, cancel the listeners.

            // Set variables
            this._lastSection = opts.currentSection;
            this._currentSection = opts.nextSection;
            // We're done, so set new section as current section
            this.$elem.trigger('sectionChanged', [{
              last: that._lastSection,
              current: that._currentSection,
              below: that._sectionBelow,
              above: that._sectionAbove
            }]);

            this._isScrolling = false;
            this._canScroll = true;
          }
        },

        unbound: function(e) {

          var isAbove = this._scrollContainer.scrollTop() <= this._currentSection.scrollOffset,
              // If next section is not also unbound, ensure it scrolls to new section from a window height away
              belowVal = this._sectionBelow.options.unbindScroll === false ?
                         this._sectionBelow.scrollOffset - this._windowHeight :
                         this._sectionBelow.scrollOffset,
              isBelow = this._scrollContainer.scrollTop() >= belowVal;

          // If scrollTop is above current section
          if (isAbove) {
            // If it's a scroll event and we're not scrolling upwards (i.e, we're just at the top of the section)
            if (this.utils.isScrollEvent(e) && e.originalEvent.wheelDelta < 0) { return; };
            // If it's a keydown event and we're not pressing upwards
            if (this.utils.isKeydownEvent(e) && e.which !== 38) { return; }
            // If above section is also unbound
            if (this._sectionAbove.options.unbindScroll) {
              // Just change section references.
              this.controllers.scroll.ifCanThenGo.call(this, 'UP');
            // If above section is not unbound, do a scroll
            } else {
              e.preventDefault();
              this._scrollUnbound = false;
              this.controllers.scroll.ifCanThenGo.call(this, 'UP');
            }

          // If scrollTop is above current section

          } else if (isBelow) {

            // If it's a scroll event and we're not scrolling download (i.e, we're just at the bottom end of the section)
            if (this.utils.isScrollEvent(e) && e.originalEvent.wheelDelta >= 0) { return; };
            // If it's a keydown event and we're not pressing upwards
            if (this.utils.isKeydownEvent(e) && e.which !== 40) { return; }

            // If below section is also unbound
            if (this._sectionBelow.options.unbindScroll) {
              // Just change section references.
              this.controllers.scroll.ifCanThenGo.call(this, 'DOWN');
            // If below section is not unbound, do a scroll
            } else {
              e.preventDefault();
              this._scrollUnbound = false;
              this.controllers.scroll.ifCanThenGo.call(this, 'DOWN');
            }
          }
        },

        offset: {
          set: function(s) {
            s.scrollOffset = $(s.element).offset().top;
          },

          update: function() {
            // Update on resize handler
            var that = this;
            $.each(this.sections, function(i, s) {
              that.controllers.scroll.offset.set.call(that, s);
            });

          }
        },

        stick: function() {
          if (!this._scrollUnbound) {
            var t = this._currentSection.scrollOffset;
            this._scrollContainer.scrollTop(t);
          }
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
          var navItem = $('.imm-nav-list li a[data-imm-section="#' + this._currentSection.element[0].id + '"]');
          that.controllers.navigation.update.call(that, navItem);
          // On nav list click
          $('.imm-nav-list li a').on('click', function() {
            var $target = $($(this).data('imm-section'));
            that.controllers.scroll.ifCanThenGo.call(that, $target);
          });
          // Handle on section change
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
            if (!s.options.hideFromNav) {
              str = str + '<li>
                            <a class="imm-nav-link" data-imm-section="#' + s.element[0].id + '">
                              <span>' + s.name + '</span>
                            </a>
                          </li>';
            }
          });
          // Add list to any elem with .imm-nav-sections class
          nav.html(str);
        },

        update: function($e) {
          $('.imm-nav-list li a').removeClass('current');
          if ($e.length > 0) { $e.addClass('current'); }
        }
      },

      // Audio Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      audio: {

        all: [],
        playing: [],

        init: function(that) {

          // Ensure mute buttons are in correct state
          this.controllers.audio.muteBtns.init.call(this);
          // Setup audio for initial section
          this.controllers.audio.handleChange.call(this, this, this._currentSection.audio);
          // Setup audio change when a section changes
          this.$elem.on('sectionChanged', function(e, d) {
            that.controllers.audio.handleChange.call(that, that, d.current.audio);
          });
          // Handle muting when window is closed
          this.controllers.audio.handleBlurFocus.call(this);
        },

        handleChange: function(that, audioObj) {

          if (this._muted) { return false; }

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
              this._muted = true;
            } else {
              s = this.setup.options.muteButton.unmuted;
              this.controllers.audio.$muteBtns.removeClass('imm-muted').html(s);
              this._muted = false;
            }
          },

          muteAll: function() {
            var audioToMute = this.controllers.audio.playing;
            this.controllers.audio.mute.call(this, audioToMute);
            this.controllers.audio.muteBtns.change.call(this, 'off');
            this.utils.cookies.set.call(this, 'immAudioState', 'muted', 3650);
          },

          unmuteAll: function() {
            var currentAudio = this._currentSection.audio;
            this.controllers.audio.start.call(this, currentAudio);
            this.controllers.audio.muteBtns.change.call(this, 'on');
            this.utils.cookies.set.call(this, 'immAudioState', '', 3650);
          },

          click: function() {
            // If audio is muted, turn it on
            if (this._muted) {
              this.controllers.audio.muteBtns.unmuteAll.call(this);
            // Else if it's on, mute it
            } else {
              this.controllers.audio.muteBtns.muteAll.call(this);
            }
          }
        },

        handleBlurFocus: function() {

          var that = this;

          $(window).on('blur', function() {
            var audioToMute = that.controllers.audio.playing;
            if (!that._muted) { that.controllers.audio.mute.call(that, audioToMute); }
          });

          $(window).on('focus', function() {
            var currentAudio = that._currentSection.audio;
            if (!that._muted) { that.controllers.audio.start.call(that, currentAudio); }
          });
        }

      },

      video: {

        init: function(s, $wrapper) {

          // If it's mobile, don't play background videos
          if (this._isMobile) { return false; }

          var $video = $wrapper.find('video'),
              $s = $(s.element),
              that = this;

          // On entering scene & resize the video
          $s.on('init enteringDown enteringUp', function(e) {

            if (e.type === 'init' && s.element !== that._currentSection.element) { return; };

            $video
              .css({visibility: 'hidden'})
              .one('canplaythrough', function() {
                that.controllers.video.resize.call(that, $wrapper, $video);
              })
              .one('playing', function() {
                $video.css('visibility', 'visible');
                $wrapper.css('background-image', 'none');
              });

            if ($video[0].paused) {
              $video[0].play();
              // Just ensure it's the right size once and for all
              that.controllers.video.resize.call(that, $wrapper, $video);
            }

          });

          $s.on('exitedDown exitedUp', function() {
            if (!$video[0].paused) {
              $video[0].pause();
              $video[0].currentTime = 0;
            }

          });

        },

        resizeAll: function() {

          var that = this;

          $.each(this.$elem.find('[data-imm-video]'), function(i, wrapper) {
            var $wrapper = $(wrapper),
                $video = $wrapper.find('video');
            that.controllers.video.resize.call(that, $wrapper, $video);
          });

        },

        resize: function(wrapper, video) {

          // Get video elem
          var $wrapper = $(wrapper),
              $video = $(video),
              videoHeight = $video[0].videoHeight, // Get native video height
              videoWidth = $video[0].videoWidth, // Get native video width
              wrapperHeight = $wrapper.height(), // Wrapper height
              wrapperWidth = $wrapper.width(); // Wrapper width

          if (wrapperWidth / videoWidth > wrapperHeight / videoHeight) {
            $video.css({ width: wrapperWidth + 2, height: 'auto'});
          } else {
            $video.css({ width: 'auto', height: wrapperHeight + 2 });
          }

        }

      },

      // Asset Controller
      ///////////////////////////////////////////////////////

      assets: {
        register: function(that) {

          var assetQueueLoaded = jQuery.Deferred(),
              assetQueue = [],
              assetLoadingFailed,
              assetQueueCheck = function() {
                if (assetQueue.length === 0) { assetQueueLoaded.resolve('loaded'); clearTimeout(assetLoadingFailed); }
              };

          $.each(this.assets, function(n, a) {

            // Add audio to DOM
            if (a.type === 'audio') { that.controllers.assets.addToDOM.audio.call(that, n, a); }

            // Add video to DOM
            if (a.type === 'video') { that.controllers.assets.addToDOM.video.call(that, n, a); }

            // If set to wait, push into queue
            if (a.wait === true) {
              // Catch any error in instantiating asset
              if (a.error) { console.log("Asset Failure: Could not preload " + a.type + " asset '" + n + "'"); return; }
              assetQueue.push({name: n, asset: a});
            }

          });

          $.each(assetQueue, function(i, a) {

            var n = a.name,
                a = a.asset;

            // Check if connection is fast enough to load audio/video
            if (a.type === 'audio' || a.type === 'video') {
              $(a.type + '#' + n)[0].addEventListener('canplaythrough', function() {
                assetQueue.splice( $.inArray(a, assetQueue), 1 );
                assetQueueCheck();
              }, false);
            }

            // Load the image asset
            if (a.type === 'image') {
              var fileTypes = ($.isArray(a.fileTypes)) ? a.fileTypes : ['jpg'],
                  imagesLoadComplete = jQuery.Deferred(),
                  imagesLoadCheck = function() {
                    if (fileTypes.length === 0) { imagesLoadComplete.resolve('loaded'); }
                  };

              $.each(fileTypes, function(i, ft) {
                var tmp = new Image();
                tmp.src = a.path + '.' + ft;
                tmp.onload = function() {
                  fileTypes.splice( $.inArray(ft, fileTypes), 1 );
                  imagesLoadCheck();
                };
              });

              imagesLoadComplete.done(function() {
                assetQueue.splice( $.inArray(a, assetQueue), 1 );
                assetQueueCheck();
              });
            }
          });

          // If no assets are queued, make sure function fires
          assetQueueCheck();

          // Reject after a random interval
          assetLoadingFailed = setTimeout(function() {
            assetQueueLoaded.reject('problem');
          }, 10000);

          return assetQueueLoaded.promise();

        },

        addToDOM: {

          // Audio
          audio: function(n, a) {

            if (a.path === undefined ) { console.log("Asset Error: Must define a path for audio asset '" + n + "'"); a.error = true; return false };

            var l = a.loop == true ? 'loop' : '',
                fileTypes = ($.isArray(a.fileTypes)) ? a.fileTypes : ['mp3'],
                sourceStr = '';

            $.each(fileTypes, function(i, ft) {
              sourceStr = sourceStr + '<source src="' + a.path + '.' + ft +'" type="audio/' + ft + '">';
            });

            this.$elem.append('<audio id="' + n + '" class="imm-audio" ' + l + '>' + sourceStr + '</audio>');
            this.controllers.audio.all.push(n);
            return true;
          },

          // Video
          video: function(n, o) {

            if (o.path === undefined ) { console.log("Asset Error: Must define a path for video asset '" + n + "'"); o.error = true; return false };

            var $wrapper = this.$elem.find('[data-imm-video="' + n + '"]'),
                fileTypes = ($.isArray(o.fileTypes)) ? o.fileTypes : ['mp4', 'ogv', 'webm'],
                loop = (o.loop === false) ? '' : 'loop="loop" ',
                sourceStr = '';

            $wrapper.css('background-image', 'url(' + o.path + '.jpg)');

            // If we're on a mobile device, don't append video tags
            if (this._isMobile) { return false; }

            $.each(fileTypes, function(i, ft) {
              sourceStr = sourceStr + '<source src="' + o.path + '.' + ft +'" type="video/' + ft + '">';
            });

            var $v = $('<video ' + loop + '>' + sourceStr + '</video>');

            $wrapper.append($v);
          }
        }
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
            that.controllers.scroll.offset.update.call(that);
            that.controllers.scroll.stick.call(that);
            // Resize background videos
            if (!that._isMobile) { that.controllers.video.resizeAll.call(that); }
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

      isScrollEvent: function(e) {
        return e.type === 'wheel' || e.type === 'DOMMouseScroll' || e.type === 'mousewheel';
      },

      isKeydownEvent: function(e) {
        return e.type === 'keydown';
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
      if (status === 'unmute') {
        this.controllers.audio.muteBtns.unmuteAll.call(this);
      } else if (status === 'mute') {
        this.controllers.audio.muteBtns.muteAll.call(this);
      } else if (status === undefined) {
        return this._muted ? false : true;
      }

    },

    // Expose changeSection endpoint to allow for changing section programmatically
    changeSection: function(goVar) {
      if (goVar === undefined) { return false; }
      this.controllers.scroll.ifCanThenGo.call(this, goVar);
    }

  }; // End of all plugin functions


  $.Immerse = {
    setup: function(setup) {
      return new Immerse(this).setup(setup);
    }
  }

})( jQuery, window , document );