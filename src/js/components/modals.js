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
    this.opening = this.imm.utils.namespacify.call(this.imm, 'opening');
    this.opened = this.imm.utils.namespacify.call(this.imm, 'opened');
    this.closing = this.imm.utils.namespacify.call(this.imm, 'closing');
    this.closed = this.imm.utils.namespacify.call(this.imm, 'closed');

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
          isYoutubeURL = $(this).attr('data-' + modalYouTube);

      if (isYoutubeURL) {
        that.youtube.open.call(that, openStr);
      } else {
        that.actions.open.call(that, openStr, section);

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
        sectionSettings = section.components[this.pluginName],
        modalDefaults = sectionSettings.default;

    modalDefaults.element = $(this);

    // If no user settings defined, just add our modal defaults
    if (!sectionSettings.hasOwnProperty(niceId)) {
      sectionSettings[niceId] = modalDefaults;
    // However, if user has specified in section setup, extend settings over the defaults
    } else {
      userSettings = sectionSettings[niceId];
      extendedSettings = $.extend({}, modalDefaults, userSettings);
      sectionSettings[niceId] = extendedSettings;
    }

    // If close animation defined but no other default closing animations defined, use the close animation
    if (sectionSettings[niceId]['animations'].hasOwnProperty('close')) {
      var closeAnim = sectionSettings[niceId]['animations']['close'];
      $.each(this.allActions, function(i, name) {
        if (sectionSettings[niceId]['animations'].hasOwnProperty(name)) { return; }
        sectionSettings[niceId]['animations'][name] = closeAnim;
      });
    }

    // Add reference to section
    $(modal).attr('data-' + this.modalSection, $.camelCase(section.id));

    // Move modal to wrapper
    $(modal).appendTo('.' + this.modalsNamespace);

    // Wrap section
    this.wrap.call(this, modal, id);

    // Fix to add keyboard focus to modal
    $(modal).attr('tabindex', 0);
  },

  // Wrap Modal
  ///////////////////////////////////////////////////////

  wrap: function(modal, id) {
    var data = 'class="' + this.modalWrapper + '"',
        data = data + ' data-' + this.modalAction + '="wrapperClick"';

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
        section = section[0],
        modalSettings = section.components[this.pluginName][niceId];

    $(modalSettings.element).trigger(action);

    var actionsObj = modalSettings.actions,
        animName = modalSettings.animations[action];

    if (actionsObj.hasOwnProperty(action)
        && $.isFunction(actionsObj[action])) {

      actionsObj[action](modal);

    } else {
      this.actions.close.call(this, modal, id, animName);
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

    open: function(id, section) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id)),
          that = this;

      if ($modal.length === 0) {
        this.imm.utils.log(this.imm, "Modal Failure: No modal defined with id '" + id + "'"); return;
      }

      var $modalWrapper = $modal.closest('.' + this.modalWrapper),
          niceId = $.camelCase(id),
          modalSettings = section.components[this.pluginName][niceId],
          openEvent = modalSettings.actions.open,
          hasOpenAnimation = modalSettings.animations.hasOwnProperty('open'),
          openAnimation = hasOpenAnimation ? ' ' + modalSettings.animations.open : '';

      if (typeof openEvent === 'function') { openEvent($modal); }

      $.Immerse.scrollController.htmlScroll(this.imm, 'lock');

      // Animation
      $modalWrapper.addClass(this.opening + openAnimation);

      if (hasOpenAnimation) {
        $modal
          .off(this.imm.utils.cssAnimationEvents)
          .one(this.imm.utils.cssAnimationEvents, function(e) {
            $modalWrapper.removeClass(that.opening + openAnimation);
            $modalWrapper.addClass(that.opened);
            $modal.focus();
          });

      } else {
        $modalWrapper.removeClass(that.opening + openAnimation);
        $modalWrapper.addClass(that.opened);
        $modal.focus();
      }

    },

    close: function(modal, id, animName) {
      var $modal = $(this.imm.utils.datatagify.call(this.imm, this.modalId, id)),
          $modalWrapper = $modal.closest('.' + this.modalWrapper),
          hasCloseAnimation = typeof animName === 'string',
          closeAnimation = hasCloseAnimation ? ' ' + animName : '',
          that = this;

      // Animation
      $modalWrapper.removeClass(this.open).addClass(this.closing + closeAnimation);

      if (hasCloseAnimation) {
        $modal
          .off(this.imm.utils.cssAnimationEvents)
          .one(this.imm.utils.cssAnimationEvents, function(e) {
            $modalWrapper.removeClass(that.opened + ' ' + that.closing + closeAnimation);
            $modal.focus();
            if ($modal.data(that.modalYouTube) == true) { that.youtube.close.call(that, modal, id); }
            $.Immerse.scrollController.htmlScroll(that.imm, 'unlock');
            that.imm._scrollContainer.focus();
            $modal.scrollTop(0);
          });

      } else {
        $modalWrapper.removeClass(that.closing + closeAnimation);
        $modal.focus();
        $.Immerse.scrollController.htmlScroll(that.imm, 'unlock');
        that.imm._scrollContainer.focus();
        $modal.scrollTop(0);
      }

//       this.imm.$pageContainer.removeClass(this.modalOpen);

    }

  },

  // Set the defaults for the plugin

  defaults: {
    'default': {
      animations: {},
      actions: {}
    }
  }

});