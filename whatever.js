/*
Script Name: Launch Animations
Description: Handles all animations on launch page
Version: 1
Author: Will Viles
Author URI: http://vil.es/
*/

(function ($, window, document, undefined) {

    // our plugin constructor
    var LaunchAnimations = function (elem, launchSections) {
      this.elem = elem;
      this.$elem = $(elem);
      this.$scrollContainer = this.$elem.find('#launch-anim-container');
      this.$sectionNav = this.$elem.find('#section-nav');
      this.$mainNav = $('#js-nav');
      this.elasticEase = Elastic.easeOut.config(1, 0.3);
    };

    // the plugin prototype
    LaunchAnimations.prototype = {

      // Initialize
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      init: function () {

        // Init Scroll Magic scrollcontainer
        this.animationController = new ScrollMagic({
          container: this.$scrollContainer
        });

        if (!Modernizr.touch) {

          // Define the page init animation sequence
          this.pageInitAnimations.call(this);

          // Init all controllers
          this.controllers.audioController.call(this);

        }

        // Setup section controller
        this.controllers.sectionController.call(this, this.sections);

        if (!Modernizr.touch) {
          this.controllers.modalController.call(this);
          this.controllers.scrollController.init.call(this);

          // Preload all videos
          this.utilities.preloadVideos.call(this);
        }

        // Add mobile support
        this.utilities.mobileSupport.call(this, this);

        return this;
      },

      // Page Init Animations
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      pageInitAnimations: function () {

        this.onInitAnimations = new TimelineMax().add([

          TweenMax.from($('#h-text-1'), 4, {
            opacity: 0,
            y: 60,
            ease: Power1.easeOut
          }),
          TweenMax.from($('#h-text-2'), 1.5, {
            opacity: 0,
            y: 20,
            delay: 2.5,
            ease: Power1.easeOut
          }),
          TweenMax.from($('#h-worked-for'), 2, {
            opacity: 0,
            y: -20,
            delay: 4,
            ease: Power2.easeOut
          }),
          TweenMax.from($('#h-logos'), 2, {
            opacity: 0,
            y: -40,
            delay: 4,
            ease: Power2.easeOut
          }),
          TweenMax.to($('.navbar-audio'), 2, {
            opacity: 1,
            ease: Power1.easeOut
          }),
          TweenMax.from($('#scroll-indicator'), .5, {
            opacity: 0,
            delay: 4
          })
        ]);

        new Swiper('#h-logos .swiper-container', {
          loop: true,
          direction: 'vertical',
          autoplay: 5000,
          autoplayDisableOnInteraction: false
        });

      },

      // Define sections
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      sections: [
        {
          id: '#s-header',
          audio: function() {
            return [{
              '#a-bg': {
                volume: 1, changeDuration: 1
              }
            }]
          }
        },
        {
          id: '#s-quote',
          customScenes: function (s) {
            s['sectionEnterScene'].setTween(
              TweenMax.from(this.$sectionNav, .2, {
                opacity: 0,
                x: 20
              })
            );
          },
          audio: function() {
            return [{
              '#a-bg': {
                volume: .75, changeDuration: 1
              }
            }]
          }
        },
        {
          id: '#s-psychology',
          logoColor: 'white',
          audio: function() {
            return [{
              '#a-bg': {
                volume: .75, changeDuration: 1
              },
              '#a-vinyl-crackle': {
                volume: .3, changeDuration: 5
              }
            }]
          },
          reveal: {
            delay: 5,
            timeline: function(s) {
              return [
                TweenMax.to(s['$section'].find('.reveal .v-text'), .5, {
                  opacity: 0, delay: -1
                }),
                TweenMax.from(s['$sectionContent'].find('h4'), 2, {
                  opacity: 0, x: -70, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.one'), 2, {
                  opacity: 0, x: -40, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.two'), 2, {
                  opacity: 0, x: -20, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.three'), 2, {
                  opacity: 0, x: -20, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.mouse-container'), 2, {
                  opacity: 0, delay: 1, ease: Power4.easeOut
                })
              ];
            }
          }
        },
        {
          id: '#s-stories',
          logoColor: 'white',
          audio: function() {
            return [{
              '#a-bg': {
                volume: .75, changeDuration: 1
              },
              '#a-city': {
                volume: .3, changeDuration: 3
              }
            }]
          },
          reveal: {
            delay: 5,
            timeline: function(s) {
              return [
                TweenMax.from(s['$section'].find('.reveal .v-text'), .5, {
                  opacity: 0, delay: .5
                }),
                TweenMax.from(s['$sectionContent'].find('h3'), 2, {
                  opacity: 0, x: -70, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('h5'), 2, {
                  opacity: 0, x: -40, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('p'), 2, {
                  opacity: 0, x: -20, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.mouse-container'), 2, {
                  opacity: 0, delay: 1, ease: Power4.easeOut
                })
              ];
            }
          },
        },
        {
          id: '#s-inhibitions',
          logoColor: 'white',
          audio: function() {
            return [{
              '#a-bg': {
                volume: .75, changeDuration: 1
              }
            }]
          },
          customScenes: function(s) {

            var swiperOptions = {
              loop: true,
              autoplay: 2500,
              autoplayDisableOnInteraction: false
            }

            var swiper1 = new Swiper('#s-inhibitions .swiper-container.one', swiperOptions),
                swiper2 = new Swiper('#s-inhibitions .swiper-container.two', swiperOptions),
                swiper3 = new Swiper('#s-inhibitions .swiper-container.three', swiperOptions);

            var timeline = new TimelineMax({paused: true});

            timeline.add([
              TweenMax.from(s['$section'].find('.person-circle'), 3, {
                scale: 0, opacity: 0, delay: 1, ease: this.elasticEase
              }),
              TweenMax.to(s['$section'].find('.person-circle'), 1, {
                css: { className: '+=animate' }, delay: 4
              }),
              TweenMax.from(s['$section'].find('#inhibitions-lead'), 1, {
                y: -10, opacity: 0, delay: .5, ease: Power2.easeOut
              }),
              TweenMax.from(s['$section'].find('.swiper-column .swiper-container'), 1, {
                y: -10, opacity: 0, delay: 1.5, ease: Power4.easeOut
              }),
              TweenMax.from(s['$section'].find('.inhibitions-after'), 1, {
                y: -10, opacity: 0, delay: 4, ease: Power4.easeOut
              }),
            ])

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });
            }


          }
        },
        {
          id: '#s-change',
          logoColor: 'white',
          audio: function() {
            return [{
              '#a-bg': {
                volume: 0, changeDuration: 2
              },
              '#a-upbeat': {
                volume: .75, changeDuration: 5
              }
            }]
          },
          reveal: {
            delay: 5,
            timeline: function(s) {

              return [
                TweenMax.from(s['$sectionContent'].find('h3'), 2, {
                  opacity: 0, x: -70, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('h5.thin-header'), 2, {
                  opacity: 0, x: -40, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('p'), 2, {
                  opacity: 0, x: -20, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('.mouse-container'), 2, {
                  opacity: 0, delay: 1, ease: Power4.easeOut
                })
              ];

            },
            timelineMobile: function(s) {
              return [
                TweenMax.from(s['$sectionContent'].find('h3'), 2, {
                  opacity: 0, x: -70, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('h5.thin-header'), 2, {
                  opacity: 0, x: -40, delay: .25, ease: this.elasticEase
                }),
                TweenMax.from(s['$sectionContent'].find('p'), 2, {
                  opacity: 0, x: -20, delay: .25, ease: this.elasticEase
                })
              ];
            }
          }
        },
        {
          id: '#s-courage',
          logoColor: 'white',
          customScenes: function(s) {

            var timeline = new TimelineMax({paused: true}),
                delay = 5;

            timeline.add([
               TweenMax.from(s['$section'].find('#sunshine'), 2.5, {
                  height: 0, opacity: 0, delay: delay - 2, ease: Expo.easeIn
                }),
                TweenMax.to(s['$section'].find('#hnd-caution'), 1, {
                  css: { className: '+=animate' }, delay: delay -2
                }),
                TweenMax.to(s['$section'].find('#hnd-anxiety'), 1, {
                  css: { className: '+=animate' }, delay: delay -2
                }),
                TweenMax.from(s['$section'].find('#caution-anxiety'), 3, {
                  y: '200%', delay: delay, ease: this.elasticEase
                }),
                TweenMax.from(s['$section'].find('#t-courage-1'), 2, {
                  opacity: 0, y: 40, delay: delay, ease: this.elasticEase
                }),
                TweenMax.from(s['$section'].find('#t-courage-2'), 2.5, {
                  opacity: 0, y: 50, delay: delay, ease: this.elasticEase
                }),
                TweenMax.from(s['$section'].find('#t-courage-3'), 2.5, {
                  opacity: 0, y: 60, delay: delay, ease: this.elasticEase
                }),
                TweenMax.from(s['$section'].find('.mouse-container'), 2, {
                  opacity: 0, delay: delay + 2, ease: Power4.easeOut
                }),
                TweenMax.to(s['$section'].find('.animation-alert'), .5, {
                  opacity: 0, y: -40, ease: Expo.easeInOut, delay: delay
                }),
                // Thunder audio out
                TweenMax.to($('#a-thunder'), 1, {
                  volume: 0, delay: 5
                })
            ])

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });
            }
          },
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .75, changeDuration: 1
              },
              '#a-thunder': {
                volume: .1, changeDuration: .5
              },
              '#a-birds': {
                volume: .1, changeDuration: .5, delay: 5
              }

            }]
          }
        },
        {
          id: '#s-programme-intro',
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .75, changeDuration: 1
              }
            }]
          },
          customScenes: function(s) {
            var timeline = new TimelineMax({paused: true});

            timeline.add([
              TweenMax.from(s['$section'].find('h3'), 2, {
                opacity: 0, x: -70, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('h5.thin-header'), 2, {
                opacity: 0, x: -40, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('p'), 2, {
                opacity: 0, x: -20, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('.picture-circle'), 2, {
                scale: 0.5, delay: 1.5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('.picture-circle'), 1, {
                opacity: 0, delay: 1.5, ease: Power2.easeOut
              }),
              TweenMax.to(s['$section'].find('.picture-circle'), 1, {
                css: { className: '+=animate' }, delay: 3.5
              }),
              TweenMax.from(s['$section'].find('.mouse-container'), 2, {
                opacity: 0, delay: 2, ease: Power4.easeOut
              })

            ])

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });
            }
          }
        },
        {
          id: '#s-programme',
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .75, changeDuration: 1
              }
            }]
          },
          customScenes: function(s) {
            new Swiper('#s-programme .swiper-container', {
              loop: true,
              direction: 'horizontal',
              pagination: '.programme-swiper-nav',
              paginationClickable: true,
              paginationBulletRender: function (index, className) {
                return '<span class="' + className + '">' + (index + 1) + '</span>';
              }
            });
          }
        },
        {
          id: '#s-profitable',
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .75, changeDuration: 1
              }
            }]
          },
          customScenes: function(s) {
            var timeline = new TimelineMax({paused: true});

            timeline.add([
              TweenMax.from(s['$section'].find('h3'), 2, {
                opacity: 0, x: -70, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('h5'), 2, {
                opacity: 0, x: -40, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('p'), 2, {
                opacity: 0, x: -20, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('.picture-circle'), 2, {
                scale: 0.5, delay: 1.5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('.picture-circle'), 1, {
                opacity: 0, delay: 1.5, ease: Power2.easeOut
              }),
              TweenMax.to(s['$section'].find('.picture-circle'), 1, {
                css: { className: '+=animate' }, delay: 3.5
              }),
              TweenMax.from(s['$section'].find('.mouse-container'), 2, {
                opacity: 0, delay: 2, ease: Power4.easeOut
              })
            ])

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });
            }
          }
        },
        {
          id: '#s-richard',
          logoColor: 'white',
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .5, changeDuration: 1
              }
            }]
          },
          customScenes: function(s) {

            var $videoCircle = s['$section'].find('.video-circle'),
                $testimonialContainer = $videoCircle.find('.richard-testimonial'),
                $testimonial = $testimonialContainer.find('.video'),
                playButton = this.$elem.find('.p-richard'),
                testimonialVideo,
                hasBeenPlayed = false,
                that = this;

            // Define Richard testimonial animation timeline
            var testimonialFadeIn = new TimelineMax({paused: true}).add([
              TweenMax.fromTo($videoCircle, 2,
                { scale: .8 },
                { scale: 1, ease: that.elasticEase }
              ),
              TweenMax.fromTo($testimonialContainer, .5,
                { opacity: 0 },
                { opacity: 1, ease: Expo.easeInOut })
            ]);

            var resetVideo = function() {
              if (hasBeenPlayed === false) { return false }

              $testimonialContainer.animate({ opacity: 0 }, 500, function() {
                if (testimonialVideo) { testimonialVideo.currentTime = 0; }
              });
              playButton.removeAttr('disabled').html('<i class="fa fa-refresh"></i><span class="add10paddingleft">Play again</span>');
              playButton.animate({opacity: 1}, 200);
            }

            playButton.on('click', function() {
              // Get video object
              testimonialVideo = $testimonial.data('vide').getVideoObject();

              if (hasBeenPlayed === false) {
                testimonialFadeIn.play();
                testimonialVideo.play();
                hasBeenPlayed = true;
                playButton.animate({opacity: 0}, 200, function() {
                  playButton.attr('disabled', 'disabled');
                });
              } else {
                $testimonialContainer.animate({ opacity: 1 }, 500, function() {
                  testimonialVideo.play();
                  playButton.animate({opacity: 0}, 200, function() {
                    playButton.attr('disabled', 'disabled');
                  });
                });
              }
              // On ended
              testimonialVideo.onended = function() {
                that.controllers.scrollController.doScroll.call(that, '+=');
                resetVideo();
              };
            });

            var timeline = new TimelineMax({paused: true}).add([
              TweenMax.from(s['$section'].find('.video-circle'), 2, {
                scale: 0.5, delay: .5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('.video-circle'), 1, {
                opacity: 0, delay: .5, ease: Power2.easeOut
              }),
              TweenMax.from(s['$section'].find('h3'), 2, {
                opacity: 0, y: -70, delay: 1.5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('h4'), 2, {
                opacity: 0, y: -40, delay: 1.5, ease: this.elasticEase
              }),
              TweenMax.from(s['$section'].find('#richard-btns'), 1, {
                opacity: 0, delay: 2.5, ease: Linear.easeNone
              })

            ]);

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
                resetVideo();
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
                resetVideo();
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });
            }

          }
        },
        {
          id: '#s-links',
          logoColor: 'white',
          addToNav: false,
          audio: function() {
            return [{
              '#a-upbeat': {
                volume: .75, changeDuration: 1
              }
            }]
          },
          customScenes: function (s) {
            var timeline = new TimelineMax({paused: true});

            for (i = 1; i <= 3; i++) {

              timeline.add([
                TweenMax.from(s['$section'].find('#link-message-' + i), 1, {
                  scale: .98, opacity: 0, y: -20, ease: Power2.easeInOut
                }),
                TweenMax.to(s['$section'].find('#link-message-' + i), 1, {
                  opacity: 0, y: 40, delay: 2.5, ease: Power2.easeInOut
                })
              ]);
            }

            timeline.add([
              TweenMax.from(s['$section'].find('#link-message-4'), .75, {
                scale: .9, opacity: 0, delay: .5, ease: Power1.easeInOut
              })
            ])

            s['sectionEnterScene'].on('enter', function() {
              timeline.play();
            });

            if (!Modernizr.touch) {
              s['sectionEnterScene'].on('leave', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('enter', function() {
                timeline.pause(0, true);
              });
              s['sectionExitedScene'].on('leave', function() {
                timeline.play();
              });


              s['sectionEnterScene'].setTween(
                TweenMax.to(this.$sectionNav, .2, {
                  opacity: 0,
                  x: 20
                })
              );
            }
          }
        }
      ],

      // Controllers
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////

      controllers: {

        // Section Controller
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////

        sectionController: function (sections) {

          var that = this;

          $.each(sections, function (i, section) {

            // Firstly, ensure we've got an index starting at 1
            i++;

            var $section = $(section['id']),
                hasVideo = $section.find('.vide').length > 0 ? true : false,
                hasSwiper = section['swiper'] !== undefined ? true : false,
                hasReveal = section['reveal'] !== undefined ? true : false,
                hasAudio = section['audio'] !== undefined ? true : false,
                hasCustomScenes = section['customScenes'] !== undefined ? true : false;

            // Swiper functions

            var swiper,
                swiperSettings = section['swiper'],
                initSwiper = function() {
                  swiper = new Swiper(section['id'] + ' .swiper-container', swiperSettings);
                  swiper.stopAutoplay();
                  setTimeout(function() {
                    swiper.startAutoplay();
                  }, 5000);
                },
                destroySwiper = function() {
                  swiper.destroy();
                  swiper = null;
                };

            // Video functions

            var $videos = $section.find('.vide'),
                initVideo = function() {
                  $.each($videos, function(i, video) {
                    var path = $(video).data('video-path'),
                        options = $(video).data('video-options');

                     $(video).vide(path, options);
                  });
                },
                resizeVideo = function() {
                  $.each($videos, function(i, video) {
                    $(video).data('vide').resize();
                  });
                },
                destroyVideo = function() {
                  $.each($videos, function(i, video) {
                    $(video).data('vide').destroy();
                  });
                };

            // Set up timeline functions

            var timeline,
                playTimeline = function() {
                  timeline.play();
                },
                resetTimeline = function() {
                  timeline.pause(0, true);
                };

            // Set up timelines

            if (hasReveal) {
              timeline = new TimelineMax({ paused: true });

              var reveal = section['reveal'];
                  revealDelay = reveal['delay'],
                  $sectionContent = $section.find('.s-content'),
                  $revealIndicator = $section.find('.animation-alert'),
                  revealContentTimeline = reveal['timeline'].call(that, {
                    $section: $section,
                    $sectionContent: $sectionContent
                  });


              // Add mobile reveal timeline
              if (!Modernizr.touch) {

                // Add reveal animations
                timeline.add([
                  TweenMax.from($section.find('.reveal'), .5, {
                    width: '100%', ease: Expo.easeInOut, delay: revealDelay
                  }),
                  TweenMax.to($revealIndicator, .5, {
                    opacity: 0, x: -50, ease: Expo.easeInOut, delay: revealDelay - .25
                  })
                ]);

              }

              timeline.add(revealContentTimeline);


            }

            // Setup audio change
            var allAudio = that.$elem.find('.page-audio audio'),
                selectedAudio = [],
                updateAudio = function() {
                  if (hasAudio) {

                    var sectionAudio = section['audio'].call(that);

                    $.each(sectionAudio[0], function(audio, options) {
                      // Push to selected audio array so it's not universally muted
                      selectedAudio.push(audio);
                      // If audio is off, kill the volume before it can manifest
                      if (!that.audioOn) { $(audio)[0].volume = 0; }
                      // Play if not playing
                      $(audio)[0].play();
                      // Add data attrs
                      $(audio).data('volume', options['volume']);
                      $(audio).data('playing', true);
                      // Set volume to change to
                      var setVolume = that.audioOn ? options['volume'] : 0,
                          setDelay = options['delay'] ? options['delay'] : 0;
                      // Change volume to whatever it should be
                      TweenMax.to($(audio), options['changeDuration'], {
                        volume: setVolume, ease: Linear.easeNone, delay: setDelay
                		  });
                    });
                  }

                  // Each audio which should not be playing
                  var $muteAudio = allAudio.not(selectedAudio.join(','));
                  $.each($muteAudio, function(i, audio) {
                    // Remove isPlaying
                    $(audio).data('playing', false);
                    TweenMax.to($(audio), 1, {
                      volume: 0, ease: Linear.easeNone, onComplete: function() {
              				  $(audio)[0].pause();
              				  $(audio)[0].currentTime = 0;
              			  }
              		  });
                  });

                };

            // Setup updating logo color
            var updateLogoColor = function() {
              if (section['logoColor'] === 'white') {
                that.$mainNav.addClass('white-logo');
              } else {
                that.$mainNav.removeClass('white-logo');
              }
            }

            // Setup updating nav
            var updateNav = function() {
              that.$sectionNav.find('li').removeClass('active');
              that.$sectionNav.find('li:nth-child(' + i + ')').addClass('active');
            }

            // Define section enter scene
            var sectionEnterScene = new ScrollScene({
              triggerElement: $section, triggerHook: 'onEnter', offset: 1
            }).addTo(that.animationController);

            // And then the exiting scene
            var sectionExitingScene = new ScrollScene({
              triggerElement: $section, offset: 1
            }).addTo(that.animationController);

            // And then the exited scene
            var sectionExitedScene = new ScrollScene({
              triggerElement: $section, triggerHook: 'onLeave', offset: $(window).height() - 1
            }).addTo(that.animationController);

            // Add custom on trigger

            // Scrolling down into section
            sectionEnterScene.on('enter', function () {

              if (!Modernizr.touch) {
                // Change nav to reflect
                updateNav();
                // Update Audio
                updateAudio();
              }
              // Change logo color
              updateLogoColor();
              // Init video
              if (hasVideo) { initVideo(); }
              // Init swiper
              if (hasSwiper) { initSwiper(); }
              // Play timeline
              if (hasReveal) { playTimeline(); }
            });

            if (!Modernizr.touch) {
              // Scrolling upwards to before section
              sectionEnterScene.on('leave', function () {
                // Pause timeline
                if (hasReveal) { resetTimeline(); }
                // Destroy video
                if (hasVideo) { destroyVideo(); }
                // Destroy swiper
                if (hasSwiper) { destroySwiper(); }
              });

              // Progress of section enter scene
              sectionEnterScene.on('progress', function () {
                if (hasVideo) { resizeVideo(); }
              });

              // Scrolling down past section
              sectionExitedScene.on('enter', function () {
                if (hasReveal) { resetTimeline(); }
                if (hasVideo) { destroyVideo(); }
                if (hasSwiper) { destroySwiper(); }
              });

              // Scrolling upwards into section
              sectionExitedScene.on('leave', function () {
                // Update Nav
                updateNav();
                // Update Audio
                updateAudio();
                // Update Logo Color
                updateLogoColor();
                // Init Video
                if (hasVideo) { initVideo(); }
                // Init Swiper
                if (hasSwiper) { initSwiper(); }
                // Play timeline
                if (hasReveal) { playTimeline(); }
              });

            }

            var customSceneSettings = {
              $section: $section,
              sectionEnterScene: sectionEnterScene,
              sectionExitingScene: sectionExitingScene,
              sectionExitedScene: sectionExitedScene
            };

            // Run custom scenes
            if (hasCustomScenes) {
              section['customScenes'].call(that, customSceneSettings);
            }

          });

          // Init scroll to top buttons
          $('.start-again').on('click', function () {
            that.onInitAnimations.pause(0, true);
            that.$scrollContainer.scrollTop(0);
            setTimeout(function () {
              that.onInitAnimations.play();
            }, 500);
          });


        },

        // Scroll Controller
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////

        scrollController: {
          timer: null,
          wHeight: $(window).height(),
          isScrolling: false,
          // Init Section Nav
          ///////////////////////////////////////////////////////
          initSectionNav: function() {
            var that = this;
            // Create nav buttons
            $.each(this.sections, function(i, section) {
              if (section.addToNav !== false) {
                that.$sectionNav.find('ul').append('<li></li>');
              }
            });
            this.$sectionNav.css({marginTop: '-' + (that.$sectionNav.height() / 2) + 'px'});
            // Init buttons
            this.$sectionNav.find('li').on('click', function () {
              var i = $(this).index(),
                sectionOffsetTop = $(that.sections[i]['id']).offset().top,
                newScrollTop = that.$scrollContainer.scrollTop() + sectionOffsetTop;

              that.$scrollContainer.scrollTop(newScrollTop);
            });
          },
          // Fire the scroll
          ///////////////////////////////////////////////////////
          doScroll: function(dir) {
            var windowHeight = $(window).height(),
                that = this;

            this.$scrollContainer.animate({
              scrollTop: dir + windowHeight + 'px'
            }, 750, 'easeInOutExpo', function () {
              setTimeout(function () {
                that.controllers.scrollController.isScrolling = false;
              }, 1250);
            });
          },
          // Handle scroll events
          ///////////////////////////////////////////////////////
          handleScroll: function(e) {
            e.preventDefault();

            if (this.controllers.scrollController.isScrolling === true) { return true }
            this.controllers.scrollController.isScrolling = true;

            if (e.originalEvent.wheelDelta >= 0) {
              this.controllers.scrollController.doScroll.call(this, '-=');
            } else {
              this.controllers.scrollController.doScroll.call(this, '+=');
            }
          },
          // Handle scroll resizing
          ///////////////////////////////////////////////////////
          scrollResizer: function() {
            var newWHeight = $(window).height();

            if (newWHeight == this.controllers.scrollController.wHeight) {
              return false
            }

            var currentScrollTop = this.$scrollContainer.scrollTop(),
                offset = this.controllers.scrollController.wHeight - newWHeight,
                multiplier = currentScrollTop / this.controllers.scrollController.wHeight;

            this.$scrollContainer.scrollTop(currentScrollTop - (offset * multiplier));

            this.controllers.scrollController.wHeight = newWHeight;
          },
          // Setup Scroll Buttons
          ///////////////////////////////////////////////////////
          scrollButtonHandler: function() {
            var $scrollButtons = this.$elem.find('[data-scroll]'),
                that = this;

            $scrollButtons.on('click', function() {
              var scrollAttr = $(this).attr('data-scroll');

              that.controllers.scrollController.isScrolling = true;

              if (scrollAttr === 'next') {
                that.controllers.scrollController.doScroll.call(that, '+=');
              } else {
                console.log('Some other scroll button action');
              }
            });
          },
          // Init all Scroll Controller functions
          ///////////////////////////////////////////////////////
          init: function() {
            var that = this;
            // Setup Section Nav
            this.controllers.scrollController.initSectionNav.call(this);
            // Bind scroll handler to mousewheel event
            this.$scrollContainer.bind('mousewheel', function(e) {
              that.controllers.scrollController.handleScroll.call(that, e);
            });
            // Handle the resize
            $(window).on('resize', function () {
              that.controllers.scrollController.scrollResizer.call(that);
            });
            this.controllers.scrollController.scrollButtonHandler.call(this);
          }
        },

        // Audio Controller
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////

        audioController: function() {
          var allAudio = this.$elem.find('.page-audio audio'),
              currentAudio,
              $muteBtns = $('.mute-btn'),
              that = this;

          var stopAudio = function() {
            $.each(allAudio, function(i, audio) {
              TweenMax.to($(audio), 1, {
                volume: 0, ease: Linear.easeNone
              })
            });
          }

          var startAudio = function() {
            var currentAudio = allAudio.filter(function() {
              return $(this).data('playing') == true
            });
            $.each(currentAudio, function(i, audio) {
          	  var volume = $(audio).data('volume');
              TweenMax.to($(audio), 1, {
                volume: volume, ease: Linear.easeNone
              })
            });
          }

          var setMuteBtns = function(status) {
            if (status === 'off') {
              $muteBtns.html('<small><i class="fa fa-volume-off"></i> <span>Audio Off</span></small>');
            } else {
              $muteBtns.html('<small><i class="fa fa-volume-up"></i> <span>Audio On</span></small>');
            }
          }

          if ($.getCookie('audioOn') === 'false') {
            setMuteBtns('off');
            this.audioOn = false;
          } else {
            setMuteBtns('on');
            this.audioOn = true;
          }

          // Init all audio
          $.each(allAudio, function(i, audio) {
            $(audio).Audiiio();
          });

          $(window).on('blur', function() {
            if (!that.audioOn) { return false; }
            stopAudio();
          });

          $(window).on('focus', function() {
            if (!that.audioOn) { return false; }
            startAudio();
          });

          // Global mute
          $muteBtns.on('click', function() {
            // If audio is on, turn it off
            if (that.audioOn) {
              setMuteBtns('off');
              $muteBtns.html('<small><i class="fa fa-volume-off"></i> <span>Audio Off</span></small>');
              stopAudio();
              $.setCookie('audioOn', 'false', 3650);
              that.audioOn = false;
            // Else if it's off, turn it on
            } else {
              setMuteBtns('on');
              startAudio();
              $.setCookie('audioOn', 'true', 3650);
              that.audioOn = true;
            }
          });

        },

        // Modal Controller
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////

        modalController: function () {

          var $modalOpenBtns = $('body').find('.open-modal'),
            $modalCloseBtns = $('body').find('.close-modal'),
            that = this;

          $modalOpenBtns.on('click', function () {
              var $this = $(this),
                modalName = $this.data('modal'),
                $modal = $('body').find('#' + modalName + '-modal');

              // If video modal, input the correct video
              if (modalName === 'video') {
                var videoId = $this.data('video-id');
                $modal.append('<div class="video-container"><iframe id="ytplayer" type="text/html" width="100%" height="100%"
                  src = "http://www.youtube.com/embed/' + videoId + '?autoplay=1"
                  frameborder = "0" / > < /div>');
                }

                $modal.fadeIn(500);

              })

            var modalClose = function (modalName) {
              var $modal = $('body').find('#' + modalName + '-modal');
              // If video modal, stop and remove the video
              if (modalName === 'video') {
                $modal.fadeOut(500, function () {
                  $modal.find('.video-container').remove();
                });
              } else {
                $modal.fadeOut(500);
              }
            }

            $modalCloseBtns.on('click', function () {
              var modalName = $(this).data('modal');
              modalClose(modalName);
            });

            $('#video-modal').on('click', function () {
              if ($(this).hasClass('modal')) {
                modalClose('video');
              }
            });
          }
        },

        // Utilities
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////

        utilities: {

          // Preload videos without playing them
          ///////////////////////////////////////////////////////

          preloadVideos: function() {

            $allVideos = this.$scrollContainer.find('.vide'),
            $.each($allVideos, function(i, video) {
              var path = $(video).data('video-path'),
                  options = $(video).data('video-options');

               $(video).vide(path, options);

               var videoObj = $(video).data('vide').getVideoObject();
               videoObj.pause();
               videoObj.currentTime = 0;
            });

          },

          // Mobile Support
          ///////////////////////////////////////////////////////

          mobileSupport: function (that) {

            if (!Modernizr.touch) {
              return false
            }

            var myScroll = new IScroll('#launch-anim-container', {
              // mouseWheel: true,
              scrollX: false,
              scrollY: true,
              scrollbars: true,
              useTransform: false,
              useTransition: false,
              probeType: 3,
              click: true
            });

            this.animationController.scrollPos(function () {
              return -myScroll.y;
            });

            myScroll.on('scroll', function (e) {
              that.animationController.update();
            });

          }
        }

      }; // End of all functions

      $.fn.LaunchAnimations = function () {
        return this.each(function () {
          new LaunchAnimations(this).init();
        });
      };

    })(jQuery, window, document);

  // Page In
  ///////////////////////////////////////////////////////

  $.extend(runScriptOnPageIn, {
    initLaunchAnimations: function(page) {
      var launchSections = $(window).launchSections;
      if (page.data('page-slug') == 'launch') {
        page.LaunchAnimations(launchSections);
      }
    }
  });