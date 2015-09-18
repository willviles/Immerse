// Component Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  // Setup component registry
  $.Immerse.componentRegistry = {};

  var controller = { name: 'componentController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

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
            var componentDefaults = defaults.components[name],
                userSettings = componentSetupOpts[name];
            defaults.components[name] = $.extend(true, {}, componentDefaults, userSettings);
          };
        });
      }

      return defaults;
    },

    // Initialize Component on a section
    ///////////////////////////////////////////////////////

    init: function(imm, section) {

      this.imm = imm;

      var that = this;

      this.imm.$elem.on('immInit sectionChanged', function(e, d) {

        var opts;

        // Loop over each component

        $.each($.Immerse.componentRegistry, function(name, component) {

          if (e.type === 'immInit') {

            // Init component globally
            if (component.hasOwnProperty('init')) {
              component.init(that.imm);
            }

            // Init component per section
            if (component.hasOwnProperty('initSection')) {
              $.each(that.imm._sections, function(i, s) {
                opts = { immerse: imm, section: s };
                component.initSection(opts);
              });
            }

          // Fire section changed
          } else if (e.type === 'sectionChanged') {

            opts = { immerse: imm, section: d.current };
            if (component.hasOwnProperty('sectionEnter')) {
              component.sectionEnter(opts);
            }

          }
        });

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

  // End of controller
  ///////////////////////////////////////////////////////

  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    add: function(opts) {
      return new controller[n](this).add(opts);
    },
    extendDefaults: function(defaults) {
      return new controller[n](this).extendDefaults(defaults);
    },
    extendGlobalOptions: function(imm, defaults) {
      return new controller[n](this).extendGlobalOptions(imm, defaults);
    },
    init: function(imm, section) {
      return new controller[n](this).init(imm, section);
    },
    resize: function(imm) {
      return new controller[n](this).resize(imm);
    }
  }

})( jQuery, window , document );