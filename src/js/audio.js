// Audio Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ){

  var ImmerseAudioController = function() {};

  ImmerseAudioController.prototype = {

    // Extend global audio options
    ///////////////////////////////////////////////////////

    extendGlobalOptions: function(imm, defaults) {

      var audioSetupOpts = imm.setup.audio;

      if (audioSetupOpts !== undefined) {
        defaults['audio'] = audioSetupOpts;
      }

      return defaults;
    },

    // Initialize
    ///////////////////////////////////////////////////////

    init: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;
      this.imm._audioPlaying = [];

      var that = this;

      // Ensure mute buttons are in correct state
      this.muteBtns.init.call(this);
      // Setup audio for initial section
      this.handleChange.call(this, this, this.imm._currentSection.audio);
      // Setup audio change when a section changes
      this.imm.$elem.on('sectionChanged', function(e, d) {
        that.handleChange.call(that, that, d.current.audio);
      });
      // Handle muting when window is closed
      this.handleBlurFocus.call(this);

      return this;
    },

    handleChange: function(that, audioObj) {

      if (this.imm._muted) { return false; }

      this.imm._audioPlaying = [];

      this.start.call(this, audioObj);

      var audioToMute = this.imm._allAudio.filter(function(a) {
        return $.inArray(a, that.imm._audioPlaying) === -1;
      });

      this.mute.call(this, audioToMute);

    },

    start: function(audioObj) {

      var that = this;

      if (audioObj !== undefined) {
        // Transition new audio to play
        $.each(audioObj, function(name, o) {

          var $a = $('audio#' + name), // Get audio
              d = !isNaN(o.delay) ? o.delay : 0; // If a delay is set

          // Push to playing array
          that.imm._audioPlaying.push(name);

          // If it's not already playing, make sure volume is set at 0 before it fades in.
          if ($a[0].paused) { $a[0].volume = 0; $a[0].play(); }
          // Transition the sound
          TweenMax.to($a, o.changeDuration, { volume: o.volume, ease: Linear.easeNone, delay: d });
        });
      }

    },

    mute: function(audioToMute) {
      // Mute audio
      $.each(audioToMute, function(i, name) {
        var $a = $('audio#' + name); // Get audio
        TweenMax.to($a, 1, {
          volume: 0, ease: Linear.easeNone, onComplete: function() { $a[0].pause(); $a[0].currentTime = 0; }
  		  });

      });

    },

    muteBtns: {
      init: function() {

        var muteClass = this.imm.utils.namespacify.call(this.imm, 'mute'),
            that = this;

        // Get a handle on all mute buttons
        this.imm._$muteBtns = this.imm.$elem.find('.' + muteClass);

        // Set initial value based on state
        if (this.imm.utils.cookies.get('immAudioState') === 'muted') {
          this.muteBtns.change.call(this, 'off');
        } else {
          this.muteBtns.change.call(this, 'on');
        }

        // Watch for changes
        this.imm._$muteBtns.on('click', function() {
          that.muteBtns.click.call(that);
        });

      },

      change: function(state) {
        var mutedClass = this.imm.utils.namespacify.call(this.imm, 'muted'),
            s;

        if (state === 'off') {
          s = this.imm.setup.options.muteButton.muted;
          this.imm._$muteBtns.addClass(mutedClass).html(s);
          this.imm._muted = true;
        } else {
          s = this.imm.setup.options.muteButton.unmuted;
          this.imm._$muteBtns.removeClass(mutedClass).html(s);
          this.imm._muted = false;
        }
      },

      muteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var audioToMute = this.imm._audioPlaying;
        this.mute.call(this, audioToMute);
        this.muteBtns.change.call(this, 'off');
        this.imm.utils.cookies.set.call(this, 'immAudioState', 'muted', 3650);
      },

      unmuteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var currentAudio = this.imm._currentSection.audio;
        this.start.call(this, currentAudio);
        this.muteBtns.change.call(this, 'on');
        this.imm.utils.cookies.set.call(this, 'immAudioState', '', 3650);
      },

      click: function() {
        // If audio is muted, turn it on
        if (this.imm._muted) {
          this.muteBtns.unmuteAll.call(this);
        // Else if it's on, mute it
        } else {
          this.muteBtns.muteAll.call(this);
        }
      }
    },

    handleBlurFocus: function() {

      var that = this;

      $(window).on('blur', function() {
        var audioToMute = that.imm._audioPlaying;
        if (!that.imm._muted) { that.mute.call(that, audioToMute); }
      });

      $(window).on('focus', function() {
        var currentAudio = that.imm._currentSection.audio;
        if (!that.imm._muted) { that.start.call(that, currentAudio); }
      });
    }

  }; // End of all plugin functions

  // Functions to expose to rest of the plugin
  $.Immerse.audioController = {
    init: function(imm) {
      return new ImmerseAudioController(this).init(imm);
    },
    extendGlobalOptions: function(imm, defaults) {
      return new ImmerseAudioController(this).extendGlobalOptions(imm, defaults);
    },
    changeStatus: function(imm, status) {
      var controller = new ImmerseAudioController(this);
      if (status === 'unmute') {
        controller.muteBtns.unmuteAll.call(controller, imm);
      } else if (status === 'mute') {
        controller.muteBtns.muteAll.call(controller, imm);
      }
      return controller;
    }
  }

})( jQuery, window , document );