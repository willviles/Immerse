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
        var opts = { immerse: imm, section: section };
        obj.init(opts);
      });
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.componentController = {
    add: function(opts) {
      return new ImmerseComponentController(this).add(opts);
    },
    defaults: function(imm, section) {
      return new ImmerseComponentController(this).defaults(imm, section);
    },
    init: function(imm, section) {
      return new ImmerseComponentController(this).init(imm, section);
    }
  }

})( jQuery, window , document );