// Component Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  $.Immerse.componentRegistry = {};

  var ImmerseComponentController = function() {};

  ImmerseComponentController.prototype = {

    // Add component to global registry
    ///////////////////////////////////////////////////////

    add: function(opts) {
      var name = opts.name,
          that = this;

      $.Immerse.componentRegistry[name] = opts;

      return this;
    },

    // Extend component defaults into Immerse section defaults
    ///////////////////////////////////////////////////////

    extendDefaults: function(defaults) {
      $.each($.Immerse.componentRegistry, function(name, component) {
        if (component.hasOwnProperty('hasSectionObject') && component.hasSectionObject === true) {
          defaults.components[name] = {};
        }

        if (component.hasOwnProperty('defaults')) {
          defaults.components[name] = component.defaults;
        };
      });

      return defaults;
    },

    // Extend global component options
    ///////////////////////////////////////////////////////

    extendGlobalOptions: function(imm, defaults) {

      var componentSetupOpts = imm.setup.components;

      if (componentSetupOpts !== undefined) {
        $.each($.Immerse.componentRegistry, function(name, component) {
          if (componentSetupOpts.hasOwnProperty(name)) {
            defaults.components[name] = componentSetupOpts[name];
          };
        });
      }

      return defaults;
    },

    // Initialize Component on a section
    ///////////////////////////////////////////////////////

    init: function(imm, section) {
      $.each($.Immerse.componentRegistry, function(name, component) {
        var opts = { immerse: imm.imm, section: section };
        component.init(opts);
      });
    },

    // Call onResize function of any component
    ///////////////////////////////////////////////////////

    resize: function(imm) {
      if (imm._isTouch) { return false; }
      $.each($.Immerse.componentRegistry, function(name, component) {
        if (component.hasOwnProperty('onResize')) {
          component.onResize(imm);
        }
      });
    },

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.componentController = {
    add: function(opts) {
      return new ImmerseComponentController(this).add(opts);
    },
    extendDefaults: function(defaults) {
      return new ImmerseComponentController(this).extendDefaults(defaults);
    },
    extendGlobalOptions: function(imm, defaults) {
      return new ImmerseComponentController(this).extendGlobalOptions(imm, defaults);
    },
    init: function(imm, section) {
      return new ImmerseComponentController(this).init(imm, section);
    },
    resize: function(imm) {
      return new ImmerseComponentController(this).resize(imm);
    }
  }

})( jQuery, window , document );