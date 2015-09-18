/*
Plugin: Immerse.js
Component: ScrollTo
Description: Easily enables sections to be scrolled to from buttons containing the -scroll-to class
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

new Immerse().component({
  name: 'scroll-to',

  // Initialize function
  init: function(imm) {
    this.imm = imm;
    this.scrollToNamespace = this.imm.utils.namespacify.call(this.imm, 'scroll-to');
    this.scrollToDataTag = this.imm.utils.datatagify.call(this.imm, this.scrollToNamespace);

    // On any click of a scroll-to button

    $(this.scrollToDataTag).on('click', function(e) {
      var $button = $(this),
          target = $button.data(that.scrollToNamespace);

      if (typeof target === 'string') { $.Immerse.scrollController.doScroll(that.imm, target); }
    });

    return this;
  }

});