/*
Script Name: Immerse.js
Description: Build immersive, media driven web experiences the easy way
Version: 1.0.3
Author: Will Viles
Author URI: http://vil.es/
*/

(function( $, window, document, undefined ){

  // Plugin Constructor
  var Immerse = function() {};

  // Plugin Prototype
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

    init: function(elem) {

      this.elem = elem;
      this.$elem = $(elem);
      this._assets = this.setup.assets;
      this._sections = [];
      this._isScrolling = false;
      this._canScroll = true;
      this._allAudio = [];

      var that = this;

      // Setup the Viewport Controller
      $.Immerse.viewportController.init(this);
      // Setup the Asset Queue
      this._assetQueue = $.Immerse.assetController.register(this);
      // Setup the Scroll Controller
      $.Immerse.sectionController.init(this);
      // Setup the Scroll Controller
      $.Immerse.scrollController.init(this);
      // Setup the Navigation Controller
      $.Immerse.navigationController.init(this);
      // Setup the Audio Controller
      $.Immerse.audioController.init(this);
      // Ensure immInit is called when assets are loaded
      $.Immerse.assetController.loading(this);

      return this;
    },

    // Utilities
    ///////////////////////////////////////////////////////

    utils: {

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

      }
    },

    // API Endpoints
    ///////////////////////////////////////////////////////

    // Description: Add a section to a page
    section: function(section) {
      return $.Immerse.sectionController.add(this, section);
    },

    // Description: Get state of audio & mute/unmute programmatically
    audio: function(status) {
      if (status === undefined) {
        return this._muted ? false : true;
      } else {
        $.Immerse.audioController.changeStatus(this, status);
      }
    },

    // Description: Allow for changing section programmatically
    changeSection: function(goVar) {
      if (goVar === undefined) { return false; }
      $.Immerse.scrollController.doScroll(this, $target);
    }

  }; // End of all plugin functions


  $.Immerse = {
    setup: function(setup) {
      return new Immerse(this).setup(setup);
    },
    registerComponent: function(opts) {
     $.Immerse.componentController.add(opts);
    }
  }

})( jQuery, window , document );

// Section Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseSectionController = function() {};

  ImmerseSectionController.prototype = {

    // Add Section to Immerse
    ///////////////////////////////////////////////////////

    add: function(imm, section) {

      this.imm = imm;

      var defaults = {
        name: section.element[0].id,
        animations: {},
        actions: {},
        attributes: {},
        updateNav: this.imm.setup.options.updateNav,
        transition: this.imm.setup.options.transition,
        options: {
          hideFromNav: false,
          unbindScroll: false
        }
      }

      var section = $.extend(true, defaults, section);
      this.imm.setup.sections.push(section);
      return section;

    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var $allSectionElems = $(this.imm.setup.options.sectionSelector),
          that = this;

      $.each($allSectionElems, function(i, $s) {
        var u = $($s).hasClass('imm-fullscreen') ? false : true,
            n = that.imm.utils.stringify($($s)[0].id),
            s = {
              name: n,
              element: $($s),
              updateNav: that.imm.setup.options.updateNav,
              transition: that.imm.setup.options.transition,
              options: {
                hideFromNav: false,
                unbindScroll: u
              }
            };
        that.imm._sections.push(s);
      });

      // Setup all defined sections
      $.each(this.imm.setup.sections, function(i, s) {

        // jQuerify section
        var $s = $(s.element);

        // Replace selector created section
        // E.g If $(s.element) matches $(this.imm._sections[i].element), remove that record and replace with new one.
        $.each(that.imm._sections, function(i, _s) {
          that.imm._sections[i] = $(_s.element)[0] === $(s.element)[0] ? s : _s;
        });

        // Animations
        $.each(s.animations, function(name, animation) {
          that.register.animations.call(that, $s, name, animation);
        });
        // Actions
        $.each(s.actions, function(name, action) {
          that.register.actions.call(that, $s, name, action);
        });
        // Attributes
        $.each(s.attributes, function(name, attr) {
          that.register.attributes.call(that, $s, name, attr);
        });
        // Videos
        var sectionVideos = $s.find('[data-imm-video]');
        $.each(sectionVideos, function(i, wrapper) {
          $.Immerse.videoController.init(that.imm, s, $(wrapper));
        });
      });

      $.Immerse.scrollController.updateSectionOffsets(this.imm);

      // Order sections by vertical order
      this.imm._sections.sort(function(obj1, obj2) {
      	return obj1.scrollOffset - obj2.scrollOffset;
      });

      // Loop over all sections objects, both defined and generated
      $.each(this.imm._sections, function(n, s) {
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

      // Register Section Actions
      ///////////////////////////////////////////////////////

      actions: function(s, n, a) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this, a) === false) { return false };

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

      // Register Section Attributes
      ///////////////////////////////////////////////////////

      attributes: function(s, n, a) {

        // Proceed or kill based upon device selection
        if ($.Immerse.viewportController.isView(this.imm, a) === false) { return false };

        var value = a.value,
            d = !isNaN(a.delay) ? a.delay : 0,
            runtimeStr,
            that = this;

        // Prepare runtimes
        $.each(a.runtime, function(i, r) { runtimeStr = runtimeStr + ' ' + r; });

        s.on(runtimeStr, function() {
          setTimeout(function() {
            that.imm.$elem.trigger(n, value);
          }, d);
        });
      }

    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.sectionController = {
    init: function(imm) {
      return new ImmerseSectionController(this).init(imm);
    },

    add: function(imm, s) {
      return new ImmerseSectionController(this).add(imm, s);
    }
  }

})( jQuery, window , document );

// Scroll Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseScrollController = function() {};

  ImmerseScrollController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      var that = this;

      // Get a handle on the Immerse object
      this.imm = imm;

      // If element initiated on is body, set the scroll target to window
      this.imm._scrollContainer = ($(this.imm.elem)[0] === $('body')[0]) ? $(window) : $(this.imm.elem);
      // Set current section
      this.imm._currentSection = this.imm._sections[0];
      this.imm._sectionBelow = this.imm._sections[1];
      // Ensure page always starts at the top
      this.imm._scrollContainer.scrollTop(0);
      // Get bound/unbound status of first section
      this.imm._scrollUnbound = this.imm._currentSection.options.unbindScroll ? true : false;
      // Manage binding or unbind of scroll on sectionChange
      this.imm.$elem.on('immInit sectionChanged', function(e, d) {
        if (e.type === 'sectionChanged') {
          that.imm._scrollUnbound = d.current.options.unbindScroll ? true : false;
        }
        $.each(that.events, function(n, f) { f.call(that); });
      });

      return this;
    },

    events: {
      scroll: function() {
        this.imm._scrollContainer.on('mousewheel wheel DOMMouseScroll', this.handlers.scroll.detect.bind(this));
      },

      keys: function() {
        $(document).on('keydown', this.handlers.keys.down.bind(this));
        $(document).on('keyup', this.handlers.keys.up.bind(this));
      },

      touch: function() {
        if (this.imm._isDesktop) { return false; }

        $(document).off('touchstart touchmove touchend');

        if (this.imm._scrollUnbound) {
          $(document).on('touchmove', this.unbound.bind(this));
        } else {
          $(document).on('touchstart', this.handlers.touch.start.bind(this));
        }

        $(document)
          .off('swipedown swipeup')
          .on('swipedown swipeup', this.handlers.touch.detect.bind(this));
      }

    },

    handlers: {

      // Scroll Handler
      scroll: {

        detect: function(e) {
          if (this.imm._scrollUnbound) {
            // Enable browser scroll
            this.handlers.scroll.toggle('enable', e);
            this.unbound.call(this, e);

          } else {
            // Disable browser scroll
            this.handlers.scroll.toggle('disable', e);
            // Fire animation to next section
            if (e.originalEvent.wheelDelta >= 0) {
              this.ifCanThenGo.call(this, this.imm, 'UP');
            } else {
              this.ifCanThenGo.call(this, this.imm, 'DOWN');
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
          if (!this.imm._scrollUnbound && this.imm._lastKey && this.imm._lastKey.which == e.which) {
            e.preventDefault();
            return;
          }
          this.imm._lastKey = e;

          switch(e.which) {

            case 38: // up
              if (this.imm._scrollUnbound) {
                this.unbound.call(this, e);
              } else {
                e.preventDefault();
                this.ifCanThenGo.call(this, this.imm, 'UP');
              }
            break;

            case 40: // down
              if (this.imm._scrollUnbound) {
                this.unbound.call(this, e);
              } else {
                e.preventDefault();
                this.ifCanThenGo.call(this, this.imm, 'DOWN');
              }
            break;

            default: return; // exit this handler for other keys
          }
        },

        up: function(e) {
          this.imm._lastKey = null;
        }

      },

      // Scroll Touch Handler
      touch: {

        start: function(e) {
          var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
          this.imm._touchStartData = {
            time: (new Date).getTime(),
            coords: [ data.pageX, data.pageY ]
          };

          $(document)
            .on('touchmove', this.handlers.touch.move.bind(this))
            .one('touchend', this.handlers.touch.end.bind(this));
        },

        move: function(e) {
          if (!this.imm._touchStartData) { return; }
          var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
          this.imm._touchStopData = {
            time: (new Date).getTime(),
            coords: [ data.pageX, data.pageY ]
          };

          // prevent scrolling
          if (Math.abs(this.imm._touchStartData.coords[1] - this.imm._touchStopData.coords[1]) > 10) {
            e.preventDefault();
          }
        },

        end: function(e) {
          $(document).off('touchmove', this.handlers.touch.move);
          if (this.imm._touchStartData && this.imm._touchStopData) {
            if (this.imm._touchStopData.time - this.imm._touchStartData.time < 1000 &&
                Math.abs(this.imm._touchStartData.coords[1] - this.imm._touchStopData.coords[1]) > 30 &&
                Math.abs(this.imm._touchStartData.coords[0] - this.imm._touchStopData.coords[0]) < 75) {
                  var direction = this.imm._touchStartData.coords[1] > this.imm._touchStopData.coords[1] ? 'swipeup' : 'swipedown';
                  $(document).trigger(direction);
            }
          }
          this.imm._touchStartData = this.imm._touchStopData = undefined;
        },

        detect: function(e) {
          if (this.imm._scrollUnbound) { return false; }
          switch(e.type) {
            case 'swipedown':
              this.ifCanThenGo.call(this, this.imm, 'UP');
            break;

            case 'swipeup':
              this.ifCanThenGo.call(this, this.imm, 'DOWN');
            break;

            default: return;
          }
        }
      }
    },

    ifCanThenGo: function(imm, goVar) {
      this.imm = (this.imm === undefined) ? imm : this.imm;
      if (this.imm._isScrolling === false && this.imm._canScroll === true) {
        this.imm._isScrolling = true;
        this.go.fire.call(this, goVar);

      }
    },

    // Fire scrollChange
    go: {

      prepare: function(o) {
        var a = { currentSection: this.imm._currentSection },
          that = this;

        a.$currentSection = $(a.currentSection.element);
        a.currentSectionIndex = this.imm._sections.indexOf(a.currentSection);

        // If we've passed a jQuery object directly, use it as the next section
        if (o.jquery) {
          a.nextSection = $.grep(this.imm._sections, function(s) { return o[0].id == s.element[0].id; })[0];
          // Determine direction
          a.direction = a.currentSection.scrollOffset > a.nextSection.scrollOffset ? 'UP' : 'DOWN';

        // Else if we've just passed the scroll direction, find the next section
        } else if (o === 'UP' || o === 'DOWN') {
          a.direction = o;
          a.nextSection = (a.direction === 'UP') ? this.imm._sections[a.currentSectionIndex-1] : this.imm._sections[a.currentSectionIndex+1];
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
        a.nextSectionIndex = this.imm._sections.indexOf(a.nextSection);
        this.imm._sectionAbove = this.imm._sections[a.nextSectionIndex-1];
        this.imm._sectionBelow = this.imm._sections[a.nextSectionIndex+1];

        return a;
      },

      fire: function(o) {

        var opts = this.go.prepare.call(this, o);

        if (opts === false) {
          this.imm._isScrolling = false;
          this.imm._canScroll = true;
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
            this.go.change.call(this, opts);
          } else {
            if (opts.direction === 'UP') {
              this.go.change.call(this, opts);
            } else if (opts.direction === 'DOWN') {
              this.go.animate.call(this, opts);
            }
          }
        } else {
          this.go.animate.call(this, opts);
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

        this.imm.$elem.animate({scrollTop: dist}, 1000, function() {
          // Set new section to entered
          opts.$nextSection.trigger(opts.triggers.entered);
          // Set current section to exited
          opts.$currentSection.trigger(opts.triggers.exited);
          // Set variables
          that.imm._lastSection = opts.currentSection;
          that.imm._currentSection = opts.nextSection;
          // We're done, so set new section as current section
          that.imm.$elem.trigger('sectionChanged', [{
            last: that.imm._lastSection,
            current: that.imm._currentSection,
            below: that.imm._sectionBelow,
            above: that.imm._sectionAbove
          }]);

          setTimeout(function() {
            // Reset flags
            that.imm._isScrolling = false;
            that.imm._canScroll = true;
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
        this.imm._lastSection = opts.currentSection;
        this.imm._currentSection = opts.nextSection;
        // We're done, so set new section as current section
        this.imm.$elem.trigger('sectionChanged', [{
          last: that.imm._lastSection,
          current: that.imm._currentSection,
          below: that.imm._sectionBelow,
          above: that.imm._sectionAbove
        }]);

        this.imm._isScrolling = false;
        this.imm._canScroll = true;
      }
    },

    unbound: function(e) {

      var isAbove = this.imm._scrollContainer.scrollTop() <= this.imm._currentSection.scrollOffset,
          // If next section is not also unbound, ensure it scrolls to new section from a window height away
          belowVal = this.imm._sectionBelow.options.unbindScroll === false ?
                     this.imm._sectionBelow.scrollOffset - this.imm._windowHeight :
                     this.imm._sectionBelow.scrollOffset,
          isBelow = this.imm._scrollContainer.scrollTop() >= belowVal;

      // If scrollTop is above current section
      if (isAbove) {
        // If it's a scroll event and we're not scrolling upwards (i.e, we're just at the top of the section)
        if (this.utils.isScrollEvent(e) && e.originalEvent.wheelDelta < 0) { return; };
        // If it's a keydown event and we're not pressing upwards
        if (this.utils.isKeydownEvent(e) && e.which !== 38) { return; }
        // If above section is also unbound
        if (this.imm._sectionAbove.options.unbindScroll) {
          // Just change section references.
          this.ifCanThenGo.call(this, this.imm, 'UP');
        // If above section is not unbound, do a scroll
        } else {
          e.preventDefault();
          this.imm._scrollUnbound = false;
          this.ifCanThenGo.call(this, this.imm, 'UP');
        }

      // If scrollTop is above current section

      } else if (isBelow) {

        // If it's a scroll event and we're not scrolling download (i.e, we're just at the bottom end of the section)
        if (this.utils.isScrollEvent(e) && e.originalEvent.wheelDelta >= 0) { return; };
        // If it's a keydown event and we're not pressing upwards
        if (this.utils.isKeydownEvent(e) && e.which !== 40) { return; }

        // If below section is also unbound
        if (this.imm._sectionBelow.options.unbindScroll) {
          // Just change section references.
          this.ifCanThenGo.call(this, this.imm, 'DOWN');
        // If below section is not unbound, do a scroll
        } else {
          e.preventDefault();
          this.imm._scrollUnbound = false;
          this.ifCanThenGo.call(this, this.imm, 'DOWN');
        }
      }
    },

    sectionOffset: {
      set: function(s) {
        s.scrollOffset = $(s.element).offset().top;
      },

      update: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var that = this;
        $.each(this.imm._sections, function(i, s) {
          that.sectionOffset.set.call(that, s);
        });

      }
    },

    stick: function(imm) {
      this.imm = (this.imm === undefined) ? imm : this.imm;
      if (!this.imm._scrollUnbound) {
        var t = this.imm._currentSection.scrollOffset;
        this.imm._scrollContainer.scrollTop(t);
      }
    },

    utils: {
      isScrollEvent: function(e) {
        return e.type === 'wheel' || e.type === 'DOMMouseScroll' || e.type === 'mousewheel';
      },

      isKeydownEvent: function(e) {
        return e.type === 'keydown';
      }
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.scrollController = {
    init: function(imm) {
      return new ImmerseScrollController(this).init(imm);
    },
    doScroll: function(imm, goVar) {
      var controller = new ImmerseScrollController(this);
      controller.ifCanThenGo.call(controller, imm, goVar);
      return controller;
    },
    updateSectionOffsets: function(imm) {
      var controller = new ImmerseScrollController(this);
      controller.sectionOffset.update.call(controller, imm);
      return controller;
    },
    stickSection: function(imm) {
      var controller = new ImmerseScrollController(this);
      controller.stick.call(controller, imm);
      return controller;
    }
  }

})( jQuery, window , document );

// Video Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseVideoController = function() {};

  ImmerseVideoController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm, s, $wrapper) {

      // Get a handle on the Immerse object
      this.imm = imm;

      if (this.imm._isMobile) { return false; }

      var $video = $wrapper.find('video'),
          $s = $(s.element),
          that = this;

      // On entering scene & resize the video
      $s.on('init enteringDown enteringUp', function(e) {

        if (e.type === 'init' && s.element !== that.imm._currentSection.element) { return; };

        $video
          .css({visibility: 'hidden'})
          .one('canplaythrough', function() {
            that.resize.call(that, $wrapper, $video);
          })
          .one('playing', function() {
            $video.css('visibility', 'visible');
            $wrapper.css('background-image', 'none');
          });

        if ($video[0].paused) {
          $video[0].play();
          // Just ensure it's the right size once and for all
          that.resize.call(that, $wrapper, $video);
        }

      });

      $s.on('exitedDown exitedUp', function() {
        if (!$video[0].paused) {
          $video[0].pause();
          $video[0].currentTime = 0;
        }

      });


      return this;
    },

    resizeAll: function(imm) {
      this.imm = (this.imm === undefined) ? imm : this.imm;
      var that = this;

      $.each(this.imm.$elem.find('[data-imm-video]'), function(i, wrapper) {
        var $wrapper = $(wrapper),
            $video = $wrapper.find('video');
        that.resize.call(that, $wrapper, $video);
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

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.videoController = {
    init: function(imm, s, $wrapper) {
      return new ImmerseVideoController(this).init(imm, s, $wrapper);
    },
    resizeAll: function(imm) {
      return new ImmerseVideoController(this).resizeAll(imm);
    }
  }

})( jQuery, window , document );

// Audio Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseAudioController = function() {};

  ImmerseAudioController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;
      this.imm._audioPlaying = [];

      var that = this;

      // Ensure mute buttons are in correct state
      this.muteBtns.init.call(this);
      // Setup audio for initial section
      this.handleChange.call(this, this, this.imm._currentSection.audio);
      // Setup audio change when a section changes
      this.imm.$elem.on('sectionChanged', function(e, d) {
        that.handleChange.call(that, that, d.current.audio);
      });
      // Handle muting when window is closed
      this.handleBlurFocus.call(this);

      return this;
    },

    handleChange: function(that, audioObj) {

      if (this.imm._muted) { return false; }

      this.imm._audioPlaying = [];

      this.start.call(this, audioObj);

      var audioToMute = this.imm._allAudio.filter(function(a) {
        return $.inArray(a, that.imm._audioPlaying) === -1;
      });

      this.mute.call(this, audioToMute);

    },

    start: function(audioObj) {

      var that = this;

      if (audioObj !== undefined) {
        // Transition new audio to play
        $.each(audioObj, function(name, o) {

          var $a = $('audio#' + name), // Get audio
              d = !isNaN(o.delay) ? o.delay : 0; // If a delay is set

          // Push to playing array
          that.imm._audioPlaying.push(name);

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
        this.imm._$muteBtns = this.imm.$elem.find('.imm-mute');

        // Set initial value based on state
        if (this.imm.utils.cookies.get('immAudioState') === 'muted') {
          this.muteBtns.change.call(this, 'off');
        } else {
          this.muteBtns.change.call(this, 'on');
        }

        // Watch for changes
        this.imm._$muteBtns.on('click', function() {
          that.muteBtns.click.call(that);
        });

      },

      change: function(state) {
        var s;
        if (state === 'off') {
          s = this.imm.setup.options.muteButton.muted;
          this.imm._$muteBtns.addClass('imm-muted').html(s);
          this.imm._muted = true;
        } else {
          s = this.imm.setup.options.muteButton.unmuted;
          this.imm._$muteBtns.removeClass('imm-muted').html(s);
          this.imm._muted = false;
        }
      },

      muteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var audioToMute = this.imm._audioPlaying;
        this.mute.call(this, audioToMute);
        this.muteBtns.change.call(this, 'off');
        this.imm.utils.cookies.set.call(this, 'immAudioState', 'muted', 3650);
      },

      unmuteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var currentAudio = this.imm._currentSection.audio;
        this.start.call(this, currentAudio);
        this.muteBtns.change.call(this, 'on');
        this.imm.utils.cookies.set.call(this, 'immAudioState', '', 3650);
      },

      click: function() {
        // If audio is muted, turn it on
        if (this.imm._muted) {
          this.muteBtns.unmuteAll.call(this);
        // Else if it's on, mute it
        } else {
          this.muteBtns.muteAll.call(this);
        }
      }
    },

    handleBlurFocus: function() {

      var that = this;

      $(window).on('blur', function() {
        var audioToMute = that.imm._audioPlaying;
        if (!that.imm._muted) { that.mute.call(that, audioToMute); }
      });

      $(window).on('focus', function() {
        var currentAudio = that.imm._currentSection.audio;
        if (!that.imm._muted) { that.start.call(that, currentAudio); }
      });
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.audioController = {
    init: function(imm) {
      return new ImmerseAudioController(this).init(imm);
    },
    changeStatus: function(imm, status) {
      var controller = new ImmerseAudioController(this);
      if (status === 'unmute') {
        controller.muteBtns.unmuteAll.call(controller, imm);
      } else if (status === 'mute') {
        controller.muteBtns.muteAll.call(controller, imm);
      }
      return controller;
    }
  }

})( jQuery, window , document );

// Navigation Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseNavigationController = function() {};

  ImmerseNavigationController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {
      this.imm = imm;

      var that = this;

      // Add nav items to do
      this.addToDOM.call(this);
      // Set current
      var navItem = $('.imm-nav-list li a[data-imm-section="#' + this.imm._currentSection.element[0].id + '"]');
      this.update.call(that, navItem);
      // On nav list click
      $('.imm-nav-list li a', 'body').on('click', function() {
        var $target = $($(this).data('imm-section'));
        $.Immerse.scrollController.doScroll(that.imm, $target);
      });
      // Handle on section change
      this.imm.$elem.on('sectionChanged', function(e, d) {
        var navItem = $('.imm-nav-list li a[data-imm-section="#' + d.current.element[0].id + '"]');
        that.update.call(that, navItem);
      });
    },

    addToDOM: function() {
      var nav = $('.imm-nav-list');
      if (nav.length === 0) { return false; }

      var str = '';
      $.each(this.imm._sections, function(i, s) {
        if (!s.options.hideFromNav) {
          str = str + '<li><a class="imm-nav-link" data-imm-section="#' + s.element[0].id + '"><span>' + s.name + '</span></a></li>';
        }
      });
      // Add list to any elem with .imm-nav-sections class
      nav.html(str);
    },

    update: function($e) {
      $('.imm-nav-list li a').removeClass('current');
      if ($e.length > 0) { $e.addClass('current'); }
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.navigationController = {
    init: function(imm) {
      return new ImmerseNavigationController(this).init(imm);
    }
  }

})( jQuery, window , document );

// Asset Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseAssetController = function() {};

  ImmerseAssetController.prototype = {

    // Register Assets
    ///////////////////////////////////////////////////////

    register: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var assetQueueLoaded = jQuery.Deferred(),
          assetQueue = [],
          assetLoadingFailed,
          assetQueueCheck = function() {
            if (assetQueue.length === 0) { assetQueueLoaded.resolve('loaded'); clearTimeout(assetLoadingFailed); }
          }
          that = this;

      $.each(this.imm._assets, function(n, a) {

        if (a.type === 'audio') { that.addToDOM.audio.call(that, n, a); }
        if (a.type === 'video') { that.addToDOM.video.call(that, n, a); }

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

    // Add Assets to DOM
    ///////////////////////////////////////////////////////

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

        this.imm.$elem.append('<audio id="' + n + '" class="imm-audio" ' + l + '>' + sourceStr + '</audio>');
        this.imm._allAudio.push(n);
        return true;
      },

      // Video
      video: function(n, o) {

        if (o.path === undefined ) { console.log("Asset Error: Must define a path for video asset '" + n + "'"); o.error = true; return false };

        var $wrapper = this.imm.$elem.find('[data-imm-video="' + n + '"]'),
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
    },

    // Track Loading
    ///////////////////////////////////////////////////////

    loading: function(imm) {

      this.imm = imm;

      $.when(this.imm._assetQueue).then(
        function(s) {
          // Run init on all sections
          $.each(that.imm._sections, function(i, s) {
            $(s.element).trigger('init');
          });

          that.imm.$elem.trigger('immInit');

          // Hide loading
          // TODO: Allow for custom loading animation sequences. Consider how to introduce a percentage bar
          $('.imm-loading').hide();

        },
        function(s) {
          alert('Asset loading failed');
        }
      );

    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.assetController = {
    register: function(imm) {
      return new ImmerseAssetController(this).register(imm);
    },

    loading: function(imm) {
      return new ImmerseAssetController(this).loading(imm);
    }
  }

})( jQuery, window , document );

// Viewport Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseViewportController = function() {};

  ImmerseViewportController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      this.set.call(this, this.imm._windowWidth);
      this.resize.call(this, this);

      return this;
    },

    set: function(width) {
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent),
          isMobileWidth = width <= 480;

      if (isMobile || isMobileWidth) {
        this.imm._device = 'mobile';
        this.imm._isMobile = true;
        this.imm._isDesktop = false;
      } else {
        this.imm._device = 'desktop';
        this.imm._isMobile = false;
        this.imm._isDesktop = true;
      }
    },

    resize: function(that) {

      this.imm._windowWidth = $(window).width();
      this.imm._windowHeight = $(window).height();
      $(window).on('resize', function() {
        that.set.call(that, that.imm._windowWidth);
        $.Immerse.scrollController.updateSectionOffsets(that.imm);
        $.Immerse.scrollController.stickSection(that.imm);
        // Resize background videos
        if (!that.imm._isMobile) {
          $.Immerse.videoController.resizeAll(that.imm);
        }
      });
    },

    isView: function(imm, a) {

      this.imm = imm;
      // Prepare devices
      var mobile = $.inArray('mobile', a.devices) !== -1,
          desktop = $.inArray('desktop', a.devices) !== -1

      // If animation is for mobile but not desktop and we're not in a mobile view
      // ...or...
      // If animation is for desktop but not mobile and we're not in a desktop view
      if (mobile && !desktop && !this.imm._isMobile || desktop && !mobile && !this.imm._isDesktop) { return false; }
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.viewportController = {
    init: function(imm) {
      return new ImmerseViewportController(this).init(imm);
    },
    isView: function(imm, a) {
      return new ImmerseViewportController(this).isView(imm, a);
    }
  }

})( jQuery, window , document );

// Component Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  $.Immerse.componentRegistry = {};

  var ImmerseComponentController = function() {};

  ImmerseComponentController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    add: function(opts) {
      var name = opts.name,
          that = this;

      $.Immerse.componentRegistry[name] = opts;

      return this;
    },

    init: function(imm, section) {
      $.each($.Immerse.componentRegistry, function(n, obj) {
        var opts = { immerse: imm, section: section }
        obj.init(opts);
      });
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.componentController = {
    add: function(opts) {
      return new ImmerseComponentController(this).add(opts);
    },
    init: function(imm, section) {
      return new ImmerseComponentController(this).init(imm, section);
    }
  }

})( jQuery, window , document );

/*
Plugin: Immerse.js
Component: Modals
Description: Adds a modal window to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'modals',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Content which is displayed over the top of the current screen.

    return this;
  }

});

/*
Plugin: Immerse.js
Component: Sliders
Description: Adds a slider to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'sliders',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Choose whether to build own slider or use iDangerous swiper.

    return this;
  }

});

/*
Plugin: Immerse.js
Component: Stacks
Description: Adds a stack of content to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'stacks',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Content which slides out the section content and reveals more content with a back button to go back to the current content.

    // Firstly need to wrap the section content in a div which can slide out

    // Secondly need to hide the stack content

    // Thirdly need some kind of animation to fire on a button press

    // Fouthly need to enable native scrolling on the section.

    // Fifthly need to fire another animation to take you back to the content

    return this;
  }

});

/*
Plugin: Immerse.js
Component: Tooltips
Description: Adds tooltips to any element with .imm-tooltip class
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'tooltips',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Get each tooltip in section
    $.each($section.find('[data-imm-tooltip]'), function(i, tooltip) {

      var $tooltip = $(tooltip),
          content = $tooltip.data('imm-tooltip'),
          content = content.charAt(0) === '#' ? $(content) : content,
          content = (content.jquery) ? $(content).html() : content;

      // Append correct tooltip content
      var $content = $('<span class="imm-tooltip">' + content + '</span>');
      $tooltip.append($content);

      $tooltip.on('mouseover', function() {
        that.position.call(that, $tooltip, $content);
      });
    });

    return this;
  },

  // Position Tooltip
  position: function($tooltip, $content) {

    $content.removeClass('top left right bottom');
    var tHeight = $content.height(),
        tWidth = $content.width(),
        tXY = $tooltip[0].getBoundingClientRect(),
        p = 'top';
    if (tHeight >= tXY.top) { p = 'bottom'; }
    if (tWidth/2 >= tXY.left) {
      p = 'right';
    } else if (tWidth/2 >= $(window).width() - tXY.right) {
      p = 'left';
    }
    $content.addClass(p);
  }

});
//# sourceMappingURL=immerse.js.map