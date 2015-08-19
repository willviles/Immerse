// Focus Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'focusController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {
      this.imm = imm;
      this.imm.$elem.on('sectionChanged', function(e, d) {
        if (document.activeElement !== $('body')[0]) {
          $(document.activeElement).blur();
        }
      });
      return this;
    },

    // Tab Press
    ///////////////////////////////////////////////////////

    tabPress: function(imm, e) {

      // Get a handle on the Immerse object
      this.imm = imm;

      // Find form
      var $form = $(this.imm._currentSection.element).find('form');
      if ($form.length === 0) { e.preventDefault(); return; }

      // Find inputs inside form
      var $inputs = $('input, textarea, button, select', $form);
      if ($inputs.length === 0) { e.preventDefault(); return; }

      var firstInput = $inputs[0],
          lastInput = $inputs[$inputs.length - 1];

      // If body is the active element, go for first input
      if (document.activeElement === $('body')[0]) {
        e.preventDefault();
        $(firstInput).focus();
      }

      // Manage input handling
      $inputs.off('keydown').on('keydown', function(e) {
        var isButton = $(this).is('button'),
            isSelect = $(this).is('select'),
            isElementInNeedOfBlocking = isButton || isSelect;

        // Give the last input a keydown function to return it to document
        if ($(this)[0] === $(lastInput)[0] && e.which === 9) {
          e.preventDefault();
          $(this).blur();
          return;
        }

        // If element isn't in need of blocking, just let things happen
        if (!isElementInNeedOfBlocking) { return; }

        // If element is in need of blocking and scroll is unbound, block the key!
        if (e.which === 38 || e.which === 40) {
          e.preventDefault();
          return;
        }
      });

      return this;
    }

  // End of controller
  ///////////////////////////////////////////////////////
  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    init: function(imm) {
      return new controller[n](this).init(imm);
    },
    tabPress: function(imm, e) {
      return new controller[n](this).tabPress(imm, e);
    }
  }

})( jQuery, window , document );