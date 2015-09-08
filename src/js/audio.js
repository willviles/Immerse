// Audio Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'audioController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

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

    // Handle Change
    ///////////////////////////////////////////////////////

    handleChange: function(that, audioObj) {

      if (this.imm._muted) { return false; }

      this.imm._audioPlaying = [];

      this.start.call(this, audioObj);

      var audioToMute = this.imm._allAudio.filter(function(a) {
        return $.inArray(a, that.imm._audioPlaying) === -1;
      });

      this.mute.call(this, audioToMute);

    },

    // Start
    ///////////////////////////////////////////////////////

    start: function(audioObj) {

      var that = this;

      if (audioObj !== undefined) {
        // Transition new audio to play
        $.each(audioObj, function(name, o) {

          var $a = $('audio#' + name), // Get audio
              d = !isNaN(o.delay) ? o.delay : 0; // If a delay is set

          if ($a.length === 0) {
            that.imm.utils.log(that.imm, "Asset Failure: Could not play audio asset '" + name + "'"); return;
          }

          // Push to playing array
          that.imm._audioPlaying.push(name);

          // If it's not already playing, make sure volume is set at 0 before it fades in.
          if ($a[0].paused) { $a[0].volume = 0; $a[0].play(); }
          // Transition the sound
          TweenMax.to($a, o.changeDuration, { volume: o.volume, ease: Linear.easeNone, delay: d });
        });
      }

    },

    // Mute
    ///////////////////////////////////////////////////////

    mute: function(audioToMute) {
      // Mute audio
      $.each(audioToMute, function(i, name) {
        var $a = $('audio#' + name); // Get audio
        TweenMax.to($a, 1, {
          volume: 0, ease: Linear.easeNone, onComplete: function() { $a[0].pause(); $a[0].currentTime = 0; }
  		  });

      });

    },

    // MuteBtns
    ///////////////////////////////////////////////////////

    muteBtns: {

      // MuteBtns Init
      ///////////////////////////////////////////////////////

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

      // MuteBtns Change
      ///////////////////////////////////////////////////////

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

      // MuteBtns MuteAll
      ///////////////////////////////////////////////////////

      muteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var audioToMute = this.imm._audioPlaying;
        this.mute.call(this, audioToMute);
        this.muteBtns.change.call(this, 'off');
        this.imm.utils.cookies.set.call(this, 'immAudioState', 'muted', 3650);
      },

      // MuteBtns UnmuteAll
      ///////////////////////////////////////////////////////

      unmuteAll: function(imm) {
        this.imm = (this.imm === undefined) ? imm : this.imm;
        var currentAudio = this.imm._currentSection.audio;
        this.start.call(this, currentAudio);
        this.muteBtns.change.call(this, 'on');
        this.imm.utils.cookies.set.call(this, 'immAudioState', '', 3650);
      },

      // MuteBtns Click
      ///////////////////////////////////////////////////////

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

    // Handle Blur Focus
    ///////////////////////////////////////////////////////

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
    },

    // Kill
    ///////////////////////////////////////////////////////

    kill: function(imm) {
      this.imm = (this.imm === undefined) ? imm : this.imm;

      var audioToMute = this.imm._audioPlaying,
          that = this;

      if (!this.imm._muted) { that.mute.call(that, audioToMute); }
    }

  // End of controller
  ///////////////////////////////////////////////////////

  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    init: function(imm) {
      return new controller[n](this).init(imm);
    },
    extendGlobalOptions: function(imm, defaults) {
      return new controller[n](this).extendGlobalOptions(imm, defaults);
    },
    changeStatus: function(imm, status) {
      var c = new controller[n](this);
      if (status === 'unmute') {
        c.muteBtns.unmuteAll.call(c, imm);
      } else if (status === 'mute') {
        c.muteBtns.muteAll.call(c, imm);
      }
      return c;
    },

    kill: function(imm) {
      var c = new controller[n](this);
      c.kill.call(c, imm);
    }
  }

})( jQuery, window , document );