/*
Plugin: Immerse.js
Component: Stacks
Description: Adds a stack of content to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'stacks',

  // Initialize function
  init: function(opts) {
    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Content which slides out the section content and reveals more content with a back button to go back to the current content.

    // Firstly need to wrap the section content in a div which can slide out

    // Secondly need to hide the stack content

    // Thirdly need some kind of animation to fire on a button press

    // Fouthly need to enable native scrolling on the section.

    // Fifthly need to fire another animation to take you back to the content

    return this;
  }

});