/*
Script Name: Immerse.js
Description: Build immersive, media driven web experiences the easy way
Version: 1.0.1
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
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    // Add a section to a page
    section: function(section) {
      return $.Immerse.sectionController.add(this, section);
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