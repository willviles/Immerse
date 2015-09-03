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
      var that = this;

      this.baseUrl = window.location.href.split("#")[0];
      this.hash = window.location.href.split("#")[1];

      // If no hash in URL, set section to first and do not proceed
      if (this.imm.setup.options.hashChange !== true) {
        this.setSection.call(this, 'first');
        return false;
      }

      // Hash defined
      if (this.hash) {

        var hashMatch = this.findSection.call(this, this.hash),
            hashesMatched = hashMatch.length;

         // If matches section
        if (hashesMatched > 0) {

          // If one section, go to it
          if (hashesMatched === 1) {
            this.setSection.call(this);

          // If multiple sections, alert developer
          } else {
            this.imm.utils.log(this.imm, "State Error: More than one section referenced as '" + this.hash + "'");
          }

        // If it doesn't match
        } else {

          // Set to first section and log lack of match
          this.setSection.call(this, 'first');
          history.replaceState({}, "", this.baseUrl);
          this.imm.utils.log(this.imm, "State Error: No section referenced as '" + this.hash + "'");
        }

      // No hash defined
      } else {
        this.setSection.call(this, 'first');

      }

      // Set up hash handling on section change
      this.imm.$elem.on('sectionChanged', function(e, d) {
        that.hashChange.call(that, d);
      });

      return this;
    },


    // Set Section
    ///////////////////////////////////////////////////////

    setSection: function(o) {
      var that = this;

      if (o === 'first') {
        this.imm._currentSection = this.imm._sections[0];
        this.imm._sectionBelow = this.imm._sections[1];
      } else {
        this.imm._currentSection = this.findSection.call(this, this.hash)[0];
        this.imm._sectionBelow = this.imm._sections[this.imm._currentSection.scrollIndex + 1];
        this.imm._sectionAbove = this.imm._sections[this.imm._currentSection.scrollIndex - 1];
      }

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
        return s.id === hash;
      });
    },

    // Hash Change
    ///////////////////////////////////////////////////////

    hashChange: function(d) {
      var hash = (d.current.scrollIndex === 0) ? this.baseUrl : '#' + d.current.id;
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