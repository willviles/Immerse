// Asset Controller
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

(function( $, window, document, undefined ) {

  var controller = { name: 'assetController' };

  // Set controller name
  var n = controller.name;
  // Controller constructor
  controller[n] = function() {};
  // Controller prototype
  controller[n].prototype = {

    // Register Assets
    ///////////////////////////////////////////////////////

    register: function(imm) {

      // Get a handle on the Immerse object
      this.imm = imm;

      var assetQueueLoaded = jQuery.Deferred(),
          assetQueue = [],
          assetLoadingFailed,
          assetQueueCheck = function() {
            if (assetQueue.length === 0) { assetQueueLoaded.resolve('loaded'); clearTimeout(assetLoadingFailed); }
          }
          that = this;

      $.each(this.imm._assets, function(n, a) {

        if (a.type === 'audio') { that.addToDOM.audio.call(that, n, a); }
        if (a.type === 'video') { that.addToDOM.video.call(that, n, a); }

        // If set to wait, push into queue
        if (a.wait === true) {

          if (that.imm._isTouch && (a.type === 'video' || a.type === 'audio')) { return; }
          // Catch any error in instantiating asset
          if (a.error) {
            that.imm.utils.log(that.imm, "Asset Failure: Could not preload " + a.type + " asset '" + n + "'");
            return;
          }
          assetQueue.push({name: n, asset: a});
        }

      });

      $.each(assetQueue, function(i, a) {

        var n = a.name,
            a = a.asset;

        // Check if connection is fast enough to load audio/video
        if (a.type === 'audio' || a.type === 'video') {
          if (that.imm._isTouch) { return }
          $(a.type + '#' + n)[0].addEventListener('canplaythrough', function() {
            assetQueue.splice( $.inArray(a, assetQueue), 1 );
            assetQueueCheck();
          }, false);
        }

        // Load the image asset
        if (a.type === 'image') {
          var fileTypes = ($.isArray(a.fileTypes)) ? a.fileTypes : ['jpg'],
              imagesLoadComplete = jQuery.Deferred(),
              imagesLoadCheck = function() {
                if (fileTypes.length === 0) { imagesLoadComplete.resolve('loaded'); }
              };

          $.each(fileTypes, function(i, ft) {
            var tmp = new Image();
            tmp.src = a.path + '.' + ft;
            tmp.onload = function() {
              fileTypes.splice( $.inArray(ft, fileTypes), 1 );
              imagesLoadCheck();
            };
          });

          imagesLoadComplete.done(function() {
            assetQueue.splice( $.inArray(a, assetQueue), 1 );
            assetQueueCheck();
          });
        }
      });

      // If no assets are queued, make sure function fires
      assetQueueCheck();

      // Reject after a random interval
      assetLoadingFailed = setTimeout(function() {
        assetQueueLoaded.reject('problem');
      }, 10000);


      return assetQueueLoaded.promise();
    },

    // Add Assets to DOM
    ///////////////////////////////////////////////////////

    addToDOM: {

      // Audio
      audio: function(n, a) {

        if (a.path === undefined ) {
          this.imm.utils.log(this.imm, "Asset Error: Must define a path for audio asset '" + n + "'");
          a.error = true;
          return false
        };

        var l = a.loop == true ? 'loop' : '',
            fileTypes = ($.isArray(a.fileTypes)) ? a.fileTypes : ['mp3'],
            audioClass = this.imm.utils.namespacify.call(this.imm, 'audio'),
            sourceStr = '';

        $.each(fileTypes, function(i, ft) {
          sourceStr = sourceStr + '<source src="' + a.path + '.' + ft +'" type="audio/' + ft + '">';
        });

        this.imm.$elem.append('<audio id="' + n + '" class="' + audioClass + '" ' + l + '>' + sourceStr + '</audio>');
        this.imm._allAudio.push(n);
        return true;
      },

      // Video
      video: function(n, o) {

        if (o.path === undefined ) {
          this.imm.utils.log(this.imm, "Asset Error: Must define a path for video asset '" + n + "'");
          o.error = true;
          return false
        };

        var videoDataTag = this.imm.utils.namespacify.call(this.imm, 'video'),
            $wrapper = this.imm.$elem.find('[data-' + videoDataTag + '="' + n + '"]'),
            fileTypes = ($.isArray(o.fileTypes)) ? o.fileTypes : ['mp4', 'ogv', 'webm'],
            loop = (o.loop === false) ? '' : 'loop="loop" ',
            sourceStr = '';

        $wrapper.css('background-image', 'url(' + o.path + '.jpg)');

        // If we're on a mobile device, don't append video tags
        if (this._isTouch) { return false; }

        $.each(fileTypes, function(i, ft) {
          sourceStr = sourceStr + '<source src="' + o.path + '.' + ft +'" type="video/' + ft + '">';
        });

        var $v = $('<video ' + loop + '>' + sourceStr + '</video>');

        $wrapper.append($v);
      }
    },

    // Track Loading
    ///////////////////////////////////////////////////////

    loading: function(imm) {

      this.imm = imm;
      var loadingOverlayClass = this.imm.utils.namespacify.call(this.imm, 'loading'),
          minLoadingTime = this.imm.setup.options.minLoadingTime,
          minLoadingTime = (minLoadingTime !== undefined) ? minLoadingTime : 0,
          minLoadingTime = ($.isNumeric(minLoadingTime)) ? minLoadingTime : 0,
          that = this;

      this._loadingTime = 0;

      var timeSinceInit = setInterval(function() {
        that._loadingTime++;
      }, 1);

      $.when(this.imm._assetQueue).then(
        function(s) {

          // Calculate remaining load time to meet min load time
          var remainingLoad = minLoadingTime - that._loadingTime,
              remainingLoad = (remainingLoad >= 0) ? remainingLoad : 0;

          clearInterval(timeSinceInit);

          setTimeout(function() {
            // Run init on all sections
            $.each(that.imm._sections, function(i, s) {
              $(s.element).trigger('init');
            });
            // Trigger init of whole plugin
            that.imm.$elem.trigger('immInit');
            that.imm._isInitialized = true;
            // Hide loading
            $('.' + loadingOverlayClass).hide();
          }, remainingLoad);

        },
        function(s) {
          alert('Asset loading failed');
        }
      );

    }

  // End of controller
  ///////////////////////////////////////////////////////

  };

  // Register with Immerse
  ///////////////////////////////////////////////////////

  $.Immerse[n] = {
    register: function(imm) {
      return new controller[n](this).register(imm);
    },

    loading: function(imm) {
      return new controller[n](this).loading(imm);
    }
  }

})( jQuery, window , document );