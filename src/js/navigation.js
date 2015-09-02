// Navigation Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'navigationController' };

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
      this.navListNamespace = this.imm.utils.namespacify.call(this.imm, 'nav');
      this.navListDataTag = this.imm.utils.datatagify.call(this.imm, this.navListNamespace);
      this.navLinkClass = this.imm.utils.namespacify.call(this.imm, 'nav-link');
      this.sectionDataTag = this.imm.utils.namespacify.call(this.imm, 'to-section');
      var that = this;
      // Generate Nav list
      this.addToDOM.call(this);
      // Set current
      var navItem = $(this.navListDataTag + ' a[data-' + this.sectionDataTag + '="' + this.imm._currentSection.id + '"]');
      this.update.call(this, navItem);
      // Handle nav item click
      this.handleClick.call(this);
      // Handle on section change
      this.sectionChange.call(this);
    },

    // Handle a click on a nav item
    ///////////////////////////////////////////////////////

    handleClick: function() {
      var that = this;
      $(this.navListDataTag + ' li a', 'body').on('click', function() {
        var target = $(this).data(that.sectionDataTag);
        if (target !== that.imm._currentSection.id) {
          $.Immerse.scrollController.doScroll(that.imm, target);
        }
      });
    },

    // Handle navigation change when section changes
    ///////////////////////////////////////////////////////

    sectionChange: function() {
      var that = this;
      this.imm.$elem.on('sectionChanged', function(e, d) {
        var navItem = $(that.navListDataTag + ' a[data-' + that.sectionDataTag + '="' + d.current.id + '"]');
        that.update.call(that, navItem);
      });
    },

    // Generate nav list and add to DOM
    ///////////////////////////////////////////////////////

    addToDOM: function() {
      var nav = $(this.navListDataTag);
      if (nav.length === 0) { return false; }
      var str = '',
          that = this;

      $.each(this.imm._sections, function(i, s) {
        if (!s.options.hideFromNav) {
          str = str + '<li><a class="' + that.navLinkClass + '" data-' + that.sectionDataTag + '="' + s.id + '"><span>' + s.name + '</span></a></li>';
        }
      });

      nav.html('<ul>' + str + '</ul>');
    },

    // Update nav
    ///////////////////////////////////////////////////////

    update: function($e) {
      $(this.navListDataTag + ' li a').removeClass('current');
      if ($e.length > 0) { $e.addClass('current'); }
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