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
        this.imm._scrollContainer.off('mousewheel wheel DOMMouseScroll')
                                  .on('mousewheel wheel DOMMouseScroll', this.handlers.scroll.detect.bind(this));
      },

      keys: function() {
        $(document).off('keydown keyup');
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
          if (!this.imm._canScroll) { return false; }
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
      if (this.imm._isScrolling === false && this.imm._canScroll === true && this.imm._htmlScrollLocked !== true) {
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
          // Just do scroll
          a.justDoScroll = true;

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

        // If we've passed a direct trigger, just do the scroll and don't worry about bound status
        if (opts.justDoScroll === true) {
          this.go.animate.call(this, opts);
          return;
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

      if (this.imm._sectionAbove === undefined) {
        var isAbove = false;
      } else {
        var isAbove = this.imm._isTouch ?
                      this.imm._scrollContainer.scrollTop() < this.imm._currentSection.scrollOffset :
                      this.imm._scrollContainer.scrollTop() <= this.imm._currentSection.scrollOffset;
      }

      // If next section is not also unbound, ensure it scrolls to new section from a window height away
      if (this.imm._sectionBelow === undefined) {
        var belowVal = false, isBelow = false;
      // If next section is not also unbound, ensure it scrolls to new section from a window height away
      } else {
        var belowVal = this.imm._sectionBelow.options.unbindScroll === false ?
                       this.imm._sectionBelow.scrollOffset - this.imm._windowHeight :
                       this.imm._sectionBelow.scrollOffset,
            isBelow = this.imm._isTouch ?
                      this.imm._scrollContainer.scrollTop() > belowVal :
                      this.imm._scrollContainer.scrollTop() >= belowVal;
      }



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
    },

    htmlScroll: function(imm, status) {
      this.imm = (this.imm === undefined) ? imm : this.imm;

      if (status === 'lock') {
        $('html').css('overflow', 'hidden');
        this.imm._htmlScrollLocked = true;
      } else {
        $('html').css('overflow', 'scroll');
        this.imm._htmlScrollLocked = false;
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
    },
    htmlScroll: function(imm, status) {
      return new ImmerseScrollController(this).htmlScroll(imm, status);
    }
  }

})( jQuery, window , document );