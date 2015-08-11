/*
Plugin: Immerse.js
Component: Tooltips
Description: Adds tooltips
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

(function( $, window, document, undefined ){

  var ImmerseTooltips = function() {};

  ImmerseTooltips.prototype = {

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(opts) {

      this.imm = opts.immerse;

      var section = opts.section,
          $section = $(section.element),
          that = this;

      // Get each tooltip in section
      $.each($section.find('[data-imm-tooltip]'), function(i, tooltip) {

        var $tooltip = $(tooltip),
            content = $tooltip.data('imm-tooltip'),
            content = content.charAt(0) === '#' ? $(content) : content,
            content = (content.jquery) ? $(content).html() : content;

        // Append correct tooltip content
        var $content = $('<span class="imm-tooltip">' + content + '</span>');
        $tooltip.append($content);

        $tooltip.on('mouseover', function() {
          that.position.call(that, $tooltip, $content);
        });
      });

      return this;
    },

    position: function($tooltip, $content) {

      $content.removeClass('top left right bottom');

      // TODO: Method of determining the placement of the tooltip
      var tHeight = $content.height(),
          tWidth = $content.width(),
          tXY = $tooltip[0].getBoundingClientRect(),
          p = 'top';

      // Determine vertical position
      if (tHeight >= tXY.top) { p = 'bottom'; }

      if (tWidth/2 >= tXY.left) {
        p = 'right';
      } else if (tWidth/2 >= $(window).width() - tXY.right) {
        p = 'left';
      }

      // Add position to tooltip
      $content.addClass(p);
    }

  }; // End of all plugin functions

  $.Immerse.components.tooltips = {
    init: function(opts) {
      return new ImmerseTooltips(this).init(opts);
    }
  }

})( jQuery, window , document );