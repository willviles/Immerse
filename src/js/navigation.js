// Navigation Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseNavigationController = function() {};

  ImmerseNavigationController.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {
      this.imm = imm;

      var that = this;

      // Add nav items to do
      this.addToDOM.call(this);
      // Set current
      var navItem = $('.imm-nav-list li a[data-imm-section="#' + this.imm._currentSection.element[0].id + '"]');
      this.update.call(that, navItem);
      // On nav list click
      $('.imm-nav-list li a', 'body').on('click', function() {
        var $target = $($(this).data('imm-section'));
        $.Immerse.scrollController.doScroll(that.imm, $target);
      });
      // Handle on section change
      this.imm.$elem.on('sectionChanged', function(e, d) {
        var navItem = $('.imm-nav-list li a[data-imm-section="#' + d.current.element[0].id + '"]');
        that.update.call(that, navItem);
      });
    },

    addToDOM: function() {
      var nav = $('.imm-nav-list');
      if (nav.length === 0) { return false; }

      var str = '';
      $.each(this.imm._sections, function(i, s) {
        if (!s.options.hideFromNav) {
          str = str + '<li><a class="imm-nav-link" data-imm-section="#' + s.element[0].id + '"><span>' + s.name + '</span></a></li>';
        }
      });
      // Add list to any elem with .imm-nav-sections class
      nav.html(str);
    },

    update: function($e) {
      $('.imm-nav-list li a').removeClass('current');
      if ($e.length > 0) { $e.addClass('current'); }
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.navigationController = {
    init: function(imm) {
      return new ImmerseNavigationController(this).init(imm);
    }
  }

})( jQuery, window , document );