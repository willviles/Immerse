// State Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'stateController' };

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

      this.baseUrl = window.location.href.split("#")[0];
      this.hash = window.location.href.split("#")[1];

      if (this.imm.setup.options.hashChange !== true) {
        this.setSection.call(this, 'first');
        return false;
      }

      this.setSection.call(this);

      var that = this;

      this.imm.$elem.on('sectionChanged', function(e, d) {
        that.hashChange.call(that, d);
      });

      return this;
    },

    // Set Section
    ///////////////////////////////////////////////////////

    setSection: function(o) {
      if (o === 'first' || !this.hash) {
        this.imm._currentSection = this.imm._sections[0];
        this.imm._sectionBelow = this.imm._sections[1];
        return;
      }

      this.imm._currentSection = this.findSection.call(this, this.hash)[0];
      this.imm._sectionBelow = this.imm._sections[this.imm._currentSection.scrollIndex + 1];
      this.imm._sectionAbove = this.imm._sections[this.imm._currentSection.scrollIndex - 1];

      var that = this;

      this.imm.$elem.on('immInit', function(e) {
        that.imm._scrollContainer.scrollTop(that.imm._currentSection.scrollOffset);
        that.imm._currentSection.element.trigger('enteringDown');
        that.imm._currentSection.element.trigger('enteredDown');
      });
    },

    // Find Section
    ///////////////////////////////////////////////////////

    findSection: function(hash) {
      return this.imm._sections.filter(function(s) {
        return s.element[0] === $('#' + hash)[0];
      });
    },

    // Hash Change
    ///////////////////////////////////////////////////////

    hashChange: function(d) {
      var hash = (d.current.scrollIndex === 0) ? this.baseUrl : '#' + d.current.element[0].id;
      history.replaceState({}, "", hash);
    }

  // End of controller
  ///////////////////////////////////////////////////////
  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    init: function(imm) {
      return new controller[n](this).init(imm);
    }
  }

})( jQuery, window , document );