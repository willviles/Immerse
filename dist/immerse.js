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
      this._isScrolling = false; this._canScroll = true;

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

      // Run init on all sections
      $.each(this.sections, function(i, s) {
        $(s.element).trigger('init');
      });


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
          var u = $($s).hasClass('imm-fullscreen') ? false : true;
          var s = {
            name: $($s)[0].id,
            element: $($s),
            updateNav: that.setup.options.updateNav,
            transition: that.setup.options.transition,
            hideFromNav: false,
            unbindScroll: u
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
          this._scrollUnbound = this._currentSection.unbindScroll ? true : false;
          this.controllers.scroll.initHandlers.call(this);

          // Manage binding or unbind of scroll on sectionChange
          this.$elem.on('sectionChanged', function(e, d) {
            that._scrollUnbound = d.current.unbindScroll ? true : false;
            that.controllers.scroll.initHandlers.call(that);
          });

          // Bind to touch events
          this.controllers.touch.init.call(this);

        },

        initHandlers: function() {
          this._scrollContainer.on('mousewheel wheel DOMMouseScroll', this.controllers.scroll.handler.bind(this));
          $(document).on('keydown', this.controllers.scroll.keydownHandler.bind(this));
          $(document).on('keyup', this.controllers.scroll.keyupHandler.bind(this));

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
          var t = this._currentSection.scrollOffset;
          this._scrollContainer.scrollTop(t);
        },

        browserScroll: function(status, e) {
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

          if (this._scrollUnbound) {
            // Enable browser scroll
            this.controllers.scroll.browserScroll('enable', e);
            this.controllers.scroll.detectUnboundSectionChange.call(this, e);

          } else {
            // Disable browser scroll
            this.controllers.scroll.browserScroll('disable', e);

            if (this._isScrolling === false && this._canScroll === true) {
              this._isScrolling = true;

              if (e.originalEvent.wheelDelta >= 0) {
                this.controllers.scroll.go.call(this, 'UP');
              } else {
                this.controllers.scroll.go.call(this, 'DOWN');
              }
            }
          }
        },

        detectUnboundSectionChange: function(e) {

          // If scrollTop is above current section
          if (this._scrollContainer.scrollTop() < this._currentSection.scrollOffset) {
            if (this._sectionAbove.unbindScroll) {
              // Just change section references. Otherwise, do a proper scroll.
            } else {
              e.preventDefault();
              this._scrollUnbound = false;
            }
          } else if (this._scrollContainer.scrollTop() > this._sectionBelow.scrollOffset - this._windowHeight) {
            if (this._sectionBelow.unbindScroll) {
              // Just change section references. Otherwise, do a proper scroll.
            } else {
              e.preventDefault();
              this._scrollUnbound = false;
            }
          }
        },

        keyupHandler: function(e) { this._lastKey = null; },

        keydownHandler: function(e) {
          if (!this._scrollUnbound && this._lastKey && this._lastKey.which == e.which) {
            e.preventDefault();
            return;
          }
          this._lastKey = e;
          switch(e.which) {

            case 38: // up
              if (!this._scrollUnbound) {
                e.preventDefault();
                if (this._isScrolling === false && this._canScroll === true) {
                  this._isScrolling = true;
                  this.controllers.scroll.go.call(this, 'UP');
                }
              }
            break;

            case 40: // down
              if (!this._scrollUnbound) {
                e.preventDefault();
                if (this._isScrolling === false && this._canScroll === true) {
                  this._isScrolling = true;
                  this.controllers.scroll.go.call(this, 'DOWN');
                }
              }
            break;

            default: return; // exit this handler for other keys
          }
        },

        go: function(o) {
          var ns, tr, direction,
              cs = this._currentSection,
              csIndex = this.sections.indexOf(cs),
              nsIndex,
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
            ns = (direction === 'UP') ? this.sections[csIndex-1] : this.sections[csIndex+1];
          }

          if (direction === 'UP') {
            tr = { exiting: 'exitingUp', entering: 'enteringUp', exited: 'exitedUp', entered: 'enteredUp' }
          } else if (direction === 'DOWN') {
            tr = { exiting: 'exitingDown', entering: 'enteringDown', exited: 'exitedDown', entered: 'enteredDown' }
          }

          // If there's no new section, don't scroll!
          if (ns === undefined) {
            that._isScrolling = false;
            that._canScroll = true;
            return false;
          } else {
            nsIndex = that.sections.indexOf(ns);
            that._sectionAbove = that.sections[nsIndex-1];
            that._sectionBelow = that.sections[nsIndex+1];
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
            // Set variables
            that._lastSection = cs;
            that._currentSection = ns;
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
        }

      },

      // Touch Controller

      touch: {

        init: function() {
          this.controllers.touch.recognize.call(this);
          this.controllers.touch.handler.call(this);
        },

        recognize: function() {
          var supportTouch = $.support.touch,
              scrollEvent = "touchmove scroll",
              touchStartEvent = supportTouch ? "touchstart" : "mousedown",
              touchStopEvent = supportTouch ? "touchend" : "mouseup",
              touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

          $.event.special.swipeupdown = {
            setup: function() {
              var thisObject = this;
              var $this = $(thisObject);
              $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                    event.originalEvent.touches[ 0 ] :
                    event,
                    start = {
                      time: (new Date).getTime(),
                      coords: [ data.pageX, data.pageY ],
                      origin: $(event.target)
                    },
                    stop;

                function moveHandler(event) {
                  if (!start) {
                    return;
                  }
                  var data = event.originalEvent.touches ?
                      event.originalEvent.touches[0] :
                      event;
                  stop = {
                    time: (new Date).getTime(),
                    coords: [ data.pageX, data.pageY ]
                  };

                  // prevent scrolling
                  if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                    event.preventDefault();
                  }
                }

                $this
                  .bind(touchMoveEvent, moveHandler)
                  .one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                      if (stop.time - start.time < 1000 &&
                          Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                          Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                          start.origin
                                .trigger("swipeupdown")
                                .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                      }
                    }
                    start = stop = undefined;

                  });
              });
            }
          };
          $.each({
            swipedown: "swipeupdown",
            swipeup: "swipeupdown"
          }, function(event, sourceEvent){
            $.event.special[event] = {
              setup: function(){
                $(this).bind(sourceEvent, $.noop);
              }
            };
          });
        },

        handler: function() {
          var that = this;

          $(document).on('swipedown swipeup',function(e){
            switch(e.type) {
              case 'swipedown':
                if (that._isScrolling === false && that._canScroll === true) {
                  that._isScrolling = true;
                  that.controllers.scroll.go.call(that, 'UP');
                }
              break;

              case 'swipeup':
                if (that._isScrolling === false && that._canScroll === true) {
                  that._isScrolling = true;
                  that.controllers.scroll.go.call(that, 'DOWN');
                }
              break;

              default: return;
            }

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
          var navItem = $('.imm-nav-list li a[data-imm-section="#' + this._currentSection.element[0].id + '"]');
          that.controllers.navigation.update.call(that, navItem);
          // On nav list click
          $('.imm-nav-list li a').on('click', function() {
            var $target = $($(this).data('imm-section'));
            that.controllers.scroll.go.call(that, $target);
            that.controllers.navigation.update.call(that, $(this));
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
            if (!s.hideFromNav) {
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

          click: function() {
            // If audio is muted, turn it on
            if (this._muted) {
              var currentAudio = this._currentSection.audio;
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
            that.controllers.scroll.scrollOffset.update.call(that);
            that.controllers.scroll.stickySection.call(that);
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

            // Add video to DOM
            if (a.type === 'video') { that.utils.assets.addToDOM.video.call(that, n, a); }
            // some method of loading & tracking load needs to go here

          });
        },

        addToDOM: {

          // Audio
          audio: function(n, a) {
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

            if (o.path === undefined ) { console.log("Must define a path for video '" + n + "'"); return false };

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
      },

      // Extend Section
      ///////////////////////////////////////////////////////

      extendSection: function(page, section) {

        var defaults = {
          name: section.element[0].id,
          animations: {},
          actions: {},
          attributes: {},
          updateNav: page.defaults.options.updateNav,
          transition: page.defaults.options.transition,
          hideFromNav: false,
          unbindScroll: false
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