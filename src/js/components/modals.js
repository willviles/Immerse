/*
Plugin: Immerse.js
Component: Modals
Description: Adds a modal window to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

new Immerse().component({
  name: 'modals',

  // Initialize component
  ///////////////////////////////////////////////////////

  init: function(imm) {

    this.imm = imm;
    var that = this;

    // Ensure all elements are namespaced
    this.modalsNamespace = this.imm.utils.namespacify.call(this.imm, 'modals');
    this.$modalsContainer = '<div class="' + this.modalsNamespace + '"></div>';
    this.modalWrapper = this.imm.utils.namespacify.call(this.imm, 'modal-wrapper');
    this.modalId = this.imm.utils.namespacify.call(this.imm, 'modal-id');
    this.modalIdDataTag = this.imm.utils.datatagify.call(this.imm, this.modalId);
    this.modalOpen = this.imm.utils.namespacify.call(this.imm, 'modal-open');
    this.modalOpenDataTag = this.imm.utils.datatagify.call(this.imm, this.modalOpen);
    this.modalAnimation = this.imm.utils.namespacify.call(this.imm, 'modal-animation');
    this.modalAction = this.imm.utils.namespacify.call(this.imm, 'modal-action');
    this.modalYouTube = this.imm.utils.namespacify.call(this.imm, 'modal-youtube');
    this.modalSection = this.imm.utils.namespacify.call(this.imm, 'modal-section');
    this.opened = this.imm.utils.namespacify.call(this.imm, 'opened');

    // get all .imm-modal-close, .imm-modal-cancel, .imm-modal-confirm buttons
    this.allActions = ['close', 'cancel', 'confirm', 'wrapperClick'],
    this.allButtons = [];

    $.each(this.allActions, function(i, name) {
      var niceName = name.charAt(0).toUpperCase() + name.slice(1);
      that['modal' + niceName + 'DataTag'] = that.imm.utils.datatagify.call(that.imm, that.modalAction, name);
      that.allButtons.push(that['modal' + niceName + 'DataTag']);
    });

    this.pluginName = this.name;

    // Create modals container
    this.imm.$elem.append(this.$modalsContainer);

  },

  initSection: function(opts) {

    this.imm = opts.immerse;

    var section = opts.section,
        $section = $(section.element),
        that = this;

    // Detect & init youtube modals
    this.youtube.init.call(this, section, $section);

    // On modal open button click
    $(this.modalOpenDataTag, section.element).on('click', function(e) {

      var openModal = that.modalOpen,
          modalYouTube = that.modalYouTube,
          openStr = $(this).attr('data-' + openModal),
          niceId = $.camelCase(openStr),
          openEvent = section.components[that.pluginName][niceId]['onOpen'],
          isYoutubeURL = $(this).attr('data-' + modalYouTube);

      if (isYoutubeURL) {
        that.youtube.open.call(that, openStr);
      } else {
        that.actions.open.call(that, openStr, openEvent);

      }
    });

    // Prepare modal sections
    $.each($section.find(this.modalIdDataTag), function(i, modal) {
      that.prepare.call(that, modal, section);
    });

    // On modal button clicks
    $(this.allButtons.toString(), '.' + this.modalsNamespace).off().on('click', function(e) {
      that.handleBtnClick.call(that, e, this);
    });


    return this;
  },

  // Prepare Modal
  ///////////////////////////////////////////////////////

  prepare: function(modal, section) {

    var id = $(modal).data(this.modalId),
        niceId = $.camelCase(id),
        userSettings, extendedSettings,
        modalDefaults = section.components[this.pluginName].default;

    modalDefaults.element = $(this);

    // If no user settings defined, just add our modal defaults
    if (!section.components[this.pluginName].hasOwnProperty(niceId)) {
      section.components[this.pluginName][niceId] = modalDefaults;
    // However, if user has specified in section setup, extend settings over the defaults
    } else {
      userSettings = section.components[this.pluginName][niceId];
      extendedSettings = $.extend({}, modalDefaults, userSettings);
      section.components[this.pluginName][niceId] = extendedSettings;
    }

    // Add reference to section
    $(modal).attr('data-' + this.modalSection, $.camelCase(section.id));
    // Get reference to animation
    var animName = $(modal).attr('data-' + this.modalAnimation);
    // Move modal to wrapper
    $(modal).appendTo('.' + this.modalsNamespace);
    // Wrap section
    this.wrap.call(this, modal, id, animName);

    // Fix to add keyboard focus to modal
    $(modal).attr('tabindex', 0);
  },

  // Wrap Modal
  ///////////////////////////////////////////////////////

  wrap: function(modal, id, animName) {
    var data = 'class="' + this.modalWrapper + '"',
        data = data + ' data-' + this.modalAction + '="wrapperClick"';

    if (animName) {
      data = data + ' data-' + this.modalAnimation + '="' + animName + '"';
    }

    var $wrapper = $('<div ' + data + '></div>');
    $(modal).wrap($wrapper);
  },

  // Handle clicks
  ///////////////////////////////////////////////////////

  handleBtnClick: function(e, button) {

    // TO-DO - Get a reference to the section even though the modal has been moved out of the relevant section to its containing div

    // Action type
    var action = $(button).data(this.modalAction);

    // Ensure wrapperClick doesn't fire on modal itself
    if (action === 'wrapperClick' && e.target != button)  { return };

    var actionNiceName = action.charAt(0).toUpperCase() + action.slice(1),
        modal = (action === 'wrapperClick') ? $(button).find(this.modalIdDataTag) : $(button).closest(this.modalIdDataTag),
        id = modal.data(this.modalId),
        niceId = $.camelCase(id),
        sectionId = modal.data(this.modalSection),
        section = this.imm._sections.filter(function(s) { return s.id === sectionId; }),
        section = section[0];

    $(section.components[this.pluginName][niceId].element).trigger(action);

    var actionObj = section.components[this.pluginName][niceId]['on' + actionNiceName];

    if (actionObj === 'close') {
      this.actions.close.call(this, modal, id);
    } else if ($.isFunction(actionObj)) {
      actionObj(modal);
    }
  },

  youtube: {

    players: [],

    init: function(section, $section) {

      var that = this;

      $.each($section.find(this.modalOpenDataTag), function(i, button) {
        // Prepare button details
        var openStr = $(button).data(that.modalOpen),
            isYoutubeURL = openStr.match(that.youtube.test);

        // If it is a Youtube URL
        if (isYoutubeURL) {
          var modalYouTube = that.imm.utils.namespacify.call(that.imm, 'modal-youtube');
          $(button).attr('data-' + modalYouTube, 'true');
          that.youtube.appendModal.call(that, section, button, openStr);
        }
      });

    },

    test: '^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$',

    parseId: function(url) {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
          match = url.match(regExp);
      if (match&&match[7].length==11){ return match[7]; }
    },

    setupAPI: function() {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },

    appendModal: function(section, button, url) {
      var videoId = this.youtube.parseId(url),
          $section = $(section.element),
          that = this;

      $(button).attr('data-' + this.modalOpen, 'youtube-' + videoId);
      var youTubeModal = $('<div data-' + this.modalId + '="youtube-' + videoId + '" data-'+ this.modalYouTube +'="true"><div id="youtube-player-' + videoId + '"></div></div>')
                        .appendTo($section);

      this.youtube.setupAPI();

      window.onYouTubeIframeAPIReady = function() {
        that.youtube.players[videoId] = new YT.Player('youtube-player-' + videoId, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          events: {
            'onStateChange': videoStateChange
          }
        });
      }

      function videoStateChange(e) {
        if (e.data == 0) { that.actions.close.call(that, youTubeModal, 'youtube-' + videoId); }
      }

    },

    open: function(openStr) {
      var videoId = openStr.replace('youtube-','');
      this.youtube.players[videoId].playVideo();
      this.actions.open.call(this, openStr);
    },

    close: function(modal, id) {
      var videoId = id.replace('youtube-','');
      this.youtube.players[videoId].stopVideo().seekTo(0, true).stopVideo();
    }
  },

  // Modal actions
  ///////////////////////////////////////////////////////

  actions: {

    open: function(id, openEvent) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id));
      if ($modal.length === 0) {
        this.imm.utils.log(this.imm, "Modal Failure: No modal defined with id '" + id + "'"); return;
      }

      if (typeof openEvent === 'function') { openEvent($modal); }

      $modal.closest('.' + this.modalWrapper).addClass(this.opened);
      this.imm.$pageContainer.addClass(this.modalOpen);
      $.Immerse.scrollController.htmlScroll(this.imm, 'lock');
      $modal.focus();
    },

    close: function(modal, id) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id)),
          $wrapper = $modal.closest('.' + this.modalWrapper).removeClass(this.opened);

      this.imm.$pageContainer.removeClass(this.modalOpen);

      if ($modal.data(this.modalYouTube) == true) { this.youtube.close.call(this, modal, id); }
      $.Immerse.scrollController.htmlScroll(this.imm, 'unlock');
      this.imm._scrollContainer.focus();
      $modal.scrollTop(0);
    }

  },

  defaults: {
    'default': {
      onConfirm: 'close', onCancel: 'close', onClose: 'close', onEscape: 'close', onWrapperClick: 'close', onOpen: null
    }
  }

});