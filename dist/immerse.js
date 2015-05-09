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
        assets: {},
        options: {
          // Set a default for the fixedScroll value. Any section can change or disable it.
          fixedScroll: 0,
          // Set a default for the updateNav value. Any section can change it.
          updateNav: true
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

    init: function(options) {

      console.log(options);

      return this;
    },

    extendSection: function(page, section) {

      var defaults = {
        animations: {},
        actions: {},
        customAttributes: {},
        fixedScroll: page.defaults.options.fixedScroll,
        updateNav: page.defaults.options.updateNav
      }

      var section = $.extend(true, defaults, section);

      page.setup.sections.push(section);

      return section;
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

      section: function() {


      },

      // Scroll Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      scroll: {

      },

      // Audio Controller
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      audio: function() {

      }
    },

    setDeviceView: function() {
      // If is modernizr.touch or window width is smaller than bootstrap sm breakpoint
      //// MOBILE
      // Else
      //// DESKTOP
    },

    resizing: function() {
      // Set device view
      // Ensure resize always sticks to top of current section
    }

  }; // End of all plugin functions



  $.ImmerseSetup = function(setup) {

  };

  $.Immerse = {

    setup: function(setup) {
      return new Immerse(this).setup(setup);
    },

    section: {
      extend: function(page, section) {
        return new Immerse(this).extendSection(page, section);
      }
    },

    init: function() {
      return this.each(function(options) {
        new Immerse(this).init(options);
      });
    }

  }

})( jQuery, window , document );
