/*
Plugin: Immerse.js
Component: Tooltips
Description: Adds tooltips to any element with -tooltip class
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

new Immerse().component({
  name: 'tooltips',

  // Initialize function
  initSection: function(opts) {
    this.imm = opts.immerse;
    this.tooltipClass = this.imm.utils.namespacify.call(this.imm, 'tooltip');
    this.tooltipContentClass = this.imm.utils.namespacify.call(this.imm, 'tooltip-content');

    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Get each tooltip in section
    $.each($section.find('[data-' + this.tooltipClass + ']'), function(i, tooltip) {

      var $tooltip = $(tooltip),
          content = $tooltip.data(that.tooltipClass);

      if (content.charAt(0) === '#') {
        var tooltipContentDiv = $(that.imm.utils.datatagify.call(that.imm, that.tooltipContentClass, content.replace('#', '')));
        content = tooltipContentDiv;
      }

      content = (content.jquery) ? $(content).html() : content;

      // Append correct tooltip content
      var $content = $('<span class="' + that.tooltipClass + '">' + content + '</span>');
      $tooltip.append($content);

      $tooltip.on('mouseover', function() {
        that.position.call(that, $tooltip, $content);
      });
    });

    return this;
  },

  // Position Tooltip
  position: function($tooltip, $content) {

    $content.removeClass('top left right bottom');
    var tHeight = $content.height(),
        tWidth = $content.width(),
        tXY = $tooltip[0].getBoundingClientRect(),
        p = 'top';
    if (tHeight >= tXY.top) { p = 'bottom'; }
    if (tWidth/2 >= tXY.left) {
      p = 'right';
    } else if (tWidth/2 >= $(window).width() - tXY.right) {
      p = 'left';
    }
    $content.addClass(p);
  }

});