/*
Plugin: Immerse.js
Component: Modals
Description: Adds a modal window to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'modals',
  hasSectionObject: true,

  // Initialize component
  ///////////////////////////////////////////////////////

  init: function(opts) {

    this.imm = opts.immerse;
    this.modalWrapper = this.imm.utils.namespacify.call(this.imm, 'modal-wrapper');
    this.modalId = this.imm.utils.namespacify.call(this.imm, 'modal-id');
    this.modalIdDataTag = this.imm.utils.datatagify.call(this.imm, this.modalId);
    this.modalOpen = this.imm.utils.namespacify.call(this.imm, 'modal-open');
    this.modalOpenDataTag = this.imm.utils.datatagify.call(this.imm, this.modalOpen);
    this.modalAction = this.imm.utils.namespacify.call(this.imm, 'modal-action');
    this.pluginName = this.name;

    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Prepare modal sections
    $.each($section.find(this.modalIdDataTag), function(i, modal) {
      that.prepare.call(that, modal, section);
    });

    // Open buttons
    $section.find(this.modalOpenDataTag).on('click', function(i, modalBtn) {
      var modalId = $(this).data(that.modalOpen);
      that.actions.open.call(that, modalId);
    });

    // get all .imm-modal-close, .imm-modal-cancel, .imm-modal-confirm buttons
    var allActions = ['close', 'cancel', 'confirm', 'wrapperClick'],
        allButtons = [];

    $.each(allActions, function(i, name) {
      var niceName = name.charAt(0).toUpperCase() + name.slice(1);
      that['modal' + niceName + 'DataTag'] = that.imm.utils.datatagify.call(that.imm, that.modalAction, name);
      allButtons.push(that['modal' + niceName + 'DataTag']);
    });

    // On modal button clicks
    $section.find(allButtons.toString()).on('click', function(e) {
      that.handleBtnClick.call(that, e, $(this), section);
    });

    return this;
  },

  // Prepare Modal
  ///////////////////////////////////////////////////////

  prepare: function(modal, section) {

    var id = $(modal).data(this.modalId),
        niceId = $.camelCase(id),
        userSettings, extendedSettings,
        modalDefaults = {
          element: $(this),
          onConfirm: 'close', onCancel: 'close', onClose: 'close', onEscape: 'close', onWrapperClick: 'close'
        };

    // If no user settings defined, just add our modal defaults
    if (!section.components[this.pluginName].hasOwnProperty(niceId)) {
      section.components[this.pluginName][niceId] = modalDefaults;
    // However, if user has specified in section setup, extend settings over the defaults
    } else {
      userSettings = section.components[this.pluginName][niceId];
      extendedSettings = $.extend({}, modalDefaults, userSettings);
      section.components[this.pluginName][niceId] = extendedSettings;
    }
    // Wrap section
    this.wrap.call(this, modal, id);

    // Fix to add keyboard focus to modal
    $(modal).attr('tabindex', 0);
  },

  // Wrap Modal
  ///////////////////////////////////////////////////////

  wrap: function(modal, id) {
    $wrapper = $('<div class="' + this.modalWrapper + '" data-' + this.modalAction + '="wrapperClick"></div>');
    $(modal).wrap($wrapper);
  },

  // Handle clicks
  ///////////////////////////////////////////////////////

  handleBtnClick: function(e, button, section) {
    // Action type
    var action = $(button).data(this.modalAction);

    // Ensure wrapperClick doesn't fire on modal itself
    if (e.target != this && action === 'wrapperClick')  { return };

    var actionNiceName = action.charAt(0).toUpperCase() + action.slice(1),
        modal = (action === 'wrapperClick') ? $(button).find(this.modalIdDataTag) : $(button).closest(this.modalIdDataTag),
        id = modal.data(this.modalId),
        niceId = $.camelCase(id);

    $(section.components.modals[niceId].element).trigger(action);

    var actionObj = section.components[this.pluginName][niceId]['on' + actionNiceName];

    if (actionObj === 'close') {
      this.actions.close.call(this, modal, id);
    } else if ($.isFunction(actionObj)) {
      actionObj(modal);
    }
  },

  // Modal actions
  ///////////////////////////////////////////////////////

  actions: {

    open: function(id) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id));
      $modal.closest('.' + this.modalWrapper).addClass('opened');
      $.Immerse.scrollController.htmlScroll(this.imm, 'lock');
      $modal.focus();
    },

    close: function(modal, id) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id)),
          $wrapper = $modal.closest('.' + this.modalWrapper).removeClass('opened');
      $.Immerse.scrollController.htmlScroll(this.imm, 'unlock');
      this.imm._scrollContainer.focus();
      $modal.scrollTop(0);
    }

  }

});