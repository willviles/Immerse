# Immerse.js [v1.0.8](https://github.com/willviles/Immerse.js/blob/master/CHANGELOG.md "Immerse.js Changelog") [![Build Status](https://api.travis-ci.org/willviles/Immerse.js.svg?branch=master)](https://travis-ci.org/willviles/Immerse.js) 
#### Build immersive, media driven web experiences - the easy way.

Immerse.js offers a javascript framework for building complex, media-driven web experiences.

Checkout the [official plugin website](https://immerse.vil.es "Immerse.js Site"), the [Learn to Surf](https://immerse.vil.es "Immerse.js Learn to Surf Example") example or the [full documentation](https://immerse.vil.es "Immerse.js Full Documentation").

## Getting Started

[Download the zip](https://github.com/willviles/Immerse.js/archive/master.zip "Immerse.js Download ZIP") or install Immerse.js via [NPM](https://www.npmjs.com/package/immersejs "Immerse.js NPM package - immersejs"):

```shell
npm install immersejs
```

Include dependencies:
```html
<!-- JQuery -->
<script src="jquery/jquery.min.js"></script>
<!-- GSAP TweenMax -->
<script src="gsap/src/minified/TweenMax.min.js"></script>
<!-- GSAP ScrollTo Plugin -->
<script src="gsap/src/minified/plugins/ScrollToPlugin.min.js"></script>
```

Include Immerse.js:
```html
<!-- Immerse.js -->
<script src="immersejs/dist/js/immerse.js"></script>
<!-- Immerse.css -->
<link rel="stylesheet" type="text/css" href="immersejs/dist/css/immerse.css">
```

## Basic Setup

#### Build HTML markup
At its most basic configuration, Immerse.js will build your section based page from simple HTML markup, automatically handling scrolling and navigation:

```html
<body>

  <!-- Create a free scrolling section. -->
  <section id="foo" class="imm-section"></section>
  
  <!-- Create a fullpage fixed scrolling section. -->
  <section id="bar" class="imm-section imm-fullscreen"></section>
  
  <!-- Navigation will be injected here. -->
  <ul class="imm-nav"></ul>
  
  <!-- Loading overlay displays until the page's assets have fully loaded -->
  <div class="imm-loading"></div>
  
</body>
```

#### Setup & initialise Immerse

```js
// Get a handle on the Immerse setup object inside a variable.
var page = new Immerse().setup(); 

// Add section configuration
...

// Initialize the page
page.init(); 
```

## Section configuration
Sections can be configured through registering a section on the page variable. The following markup is the most basic configuration:

```js
page.section({

  // Name the section.
  name: 'Section Name',
  
  // Set the element. Must be able to take either a string, javascript or jquery selector
  element: $('#foo'),
  
});
```

## Assets
Immerse requires all media assets to be registered in the Immerse setup object, so the plugin can properly inject them into the DOM and allow easy manipulation of them through the Immerse API.

#### Defining assets

Define your assets in Immerse setup:
```js
new Immerse().setup({
  
  assets: {
    'audioName': { type: 'audio', path: 'assets/audio/audio-name', loop: true },
    'videoName': { type: 'video', path: 'assets/video/video-name', fileTypes: ['mp4', 'ogv', 'webm'], loop: true },
    'imageName': { type: 'image', path: 'assets/image/image-name', fileTypes: ['jpg', 'png'] }
  }, ...
  
}); 
```

*Video file types default to mp4, ogv and webm. Loop defaults to true.*

#### Asset preloading

Adding the wait key to any asset will add it to the preloading queue. Immerse will display a loading overlay until all required assets are loaded. Images will be loaded into the browser cache and audio/video will be considered loaded when the HTML5 canplaythrough event is returned.

```js
'videoName': { type: 'video', path: 'assets/audio/gnossienne', loop: true, wait: true }, ...
```

## Video

Once a video asset is registered, it can be easily used as a video background for a page section. It's this simple:

```html

<section id="foo" class="imm-section imm-fullscreen">
  <!-- Ensure your .imm-video element is a direct child of the section and pass your video name into the data tag -->
  <div class="imm-video" data-imm-video="videoName"></div>
</section>
```

Immerse.js will manage initialisation, pausing/playing on scroll and resizing of the HTML5 video without the need for any custom code.


## Audio

Immerse easily enables the building of complex layered HTML5 audio soundtracks for each section of your page.

#### Default soundtrack

Add a soundtrack to every section of your page by defining the audio layers in Immerse setup. Volume of each audio layer can be controlled, along with the length of time it takes for the track to fade out/in when the soundtrack changes.

```js
new Immerse().setup({
  
  audio: {
    'mainAudio': { volume: 1, changeDuration: 1 },
    'subtleAudio': { volume: .5, changeDuration: .5 }
  }, ...
  
}); 
```

*If no default soundtrack is defined, sections without specific audio defined will be silent.*

#### Section-based soundtrack

Soundtracks can then be changed for each section of the page. Inside your Immerse section, just define a new soundtrack.

```js
page.section({
  
  audio: {
    'differentMainAudio': { volume: .8, changeDuration: 1.5 },
    'differentSubtleAudio': { volume: .3, changeDuration: .25 }
  }, ...
  
}); 
```
#### Mute button configuration

Immerse automatically manages any mute buttons with the imm-mute class attached:

```html
<button class="imm-mute"></button>
```

The default content of the button is a string - 'Audio On' and 'Audio Off'. However, custom strings can be added in Immerse setup options. For example, a popular setup is using icon font Fontawesome to graphically illustrate audio state:

```js
new Immerse().setup({
  
  options: {
    muteButton: {
      unmuted: '<i class="fa fa-volume-up"></i>',
      muted: '<i class="fa fa-volume-off"></i>',
    }, ...
  }, ...
  
}); 
```

*By default, Immerse uses cookies to set the audio to the state the user last left the page.*

#### Programatically control audio

It's also possible to programmatically control audio state:

```js
page.audio(); // Get current state
page.audio('mute'); // Mutes audio
page.audio('unmute'); // Unmutes audio
```

## Animations

One of Immerse's key features is offering a clean, easy-to define, read & maintain interface for creating animations and tailoring them to devices and screens.

#### Configuring animation timelines

Below is the most verbose example of defining and executing one GSAP Timeline in Immerse:

```js
page.section({
  
  animations: {
    
    // Name the timeline
    'timelineOne': {
      
      // Define which devices to target. Defaults to both.
      devices: ['touch', 'desktop'],
      
      // Define runtime. Defaults to when the section is enteringDown & enteringUp.
      // All runtimes: ['init', 'enteringDown', 'enteringUp', 'enteredDown', 'enteredUp', 'exitingDown', 'exitingUp']
      runtime: ['enteringDown', 'enteringUp'],
      
      // Define reset runtime. Defaults to when the section has exitedDown, exitedUp.
      reset: ['exitedDown', 'exitedUp'],
      
      // Add a delay to the start of the timeline
      delay: 1,
      
      // Timeline. Add content of a GreenSock Timeline here.
      // The jQuery object of the section is available to use to specifically find section elements to animate.
      timeline: function($section) {
        return [
          TweenMax.from($section.find('.thing-to-animate'), 2, {
            opacity: 0, x: -70, delay: .5, ease: Power4.easeIn
          }),
          TweenMax.from($section.find('.another-thing-to-animate'), 2, {
            ...
          })
        ]
      }
      
    }, ...    
  },...
  
}
```

For most animations which run when the section is scrolled to, and reset when the section is removed from view, only the timeline function need be defined. The animation defaults do the rest.

For more information about using the GSAP, visit [the official GreenSock Animation Platform website](http://greensock.com/gsap "GreenSock Animation Platform Official Website").

## Attributes

Section attributes allow for individual values to be changed on a per-section basis and trigger an event when changed. The following example will demonstrate how easy it is to change navigation colour through each section of your site, with just one attribute.

#### Default attribute value

Add the default attribute value to the Immerse setup:

```js
new Immerse().setup({
  
  attributes: {
    
    // Name the attribute
    'navColor': {
      
      // Device and runtime targeting available in attributes too!
      devices: ['touch', 'desktop'],
      runtime: ['enteringDown', 'enteringUp'],
      
      // Define the default value
      value: 'white'
    }, ...
    
  },...
  
}); 
```

#### Change the attribute based upon section

In your chosen section, define the new attribute value.

```js
page.section({
  
  attributes: {
    'navColor': { value: 'blue' }
  }, ...
  
}); 
```

#### Listen for changes & fire custom code

When the page is scrolled to the chosen section, an event will be triggered. Listen to it and execute your desired code. For example, add a class to your navigation so its CSS styles will change to the desired color.

```js
$('body').on('navColor', function(e, value) {
  
  var $nav = $(nav);
  var currentColor = $nav.data('color');
  
  $nav.removeClass(currentColor).addClass(value).data('color', value);

});
```

## Actions

Immerse also allows for any custom code to be triggered using device and runtime targeting.

```js
page.section({
  
  actions: {
    
    // Name the action
    'actionName': {
      
      // Device and runtime targeting available in actions too!
      devices: ['touch', 'desktop'],
      runtime: ['enteringDown', 'enteringUp'],
      
      // Define the default value
      action: function($section) {
        
        // Execute your custom code here.
        
      }
    }
  }, ...
  
}); 
```

## Scrolling

From combining a mix of fixed height, auto scrolling sections with free scrolling sections, to adding scrollTo buttons to the page using just HTML markup, Immerse solves many issues related to scrolling with elegant solutions.

#### Fixed scroll vs free scroll

Immerse infers which sections should be fixed height and which should be free scrolling simply by observing HTML classes:

```html
<!-- Free scrolling section -->
<section class="imm-section"></section>

<!-- Fixed scrolling section -->
<section class="imm-section imm-fullscreen"></section> 
```

#### Responsive scrolling

It's possible to create responsive solutions for fixed scrolling sections by unbinding the scroll at certain breakpoints.

```js
page.section({
  
  options: {
    
    // The section will be free scrolling on mobile & tablet, but fixed scrolling for all larger screen sizes. 
    unbindScroll: ['mobile', 'tablet'], ...
    
  }, ...
  
});
```

*For more information on default breakpoints and defining your own breakpoints, [click here](#custom-breakpoints "Immerse custom breakpoints").*

#### ScrollTo Buttons

Adding buttons which link to other Immerse page sections can be achieved through data tags:

```HTML
<!-- Pass either the name of the section or with a starting # -->
<button data-imm-scroll-to="linked-section">Go to linked-section</button>

<!-- You can also add either UP or DOWN to go to the next/prev sections. Must be in caps. -->
<button data-imm-scroll-to="DOWN">Go down a section</button>
```

#### Programatically control scrolling

It's also possible to control scrolling programmatically:

```js
page.changeSection('linked-section');
page.changeSection('DOWN');
```

## Modals

Immerse offers support for modal overlays out-of-the-box.

#### Modal markup

```HTML
<section>
  
  <!-- Open modal button -->
  <button data-imm-modal-open="modal-name"></button>
  
  <!-- Modal markup -->
  <div data-imm-modal-id="modal-name">
  
    <!-- Button will fire the onConfirm function -->
    <button data-imm-modal-action="confirm">Confirm</button>
    
    <!-- Button will fire the onCancel function -->
    <button data-imm-modal-action="cancel">Cancel</button>
    
    <!-- Button will fire the onClose function -->
    <button data-imm-modal-action="close">Close</button>
    
  </div>
</section>
```

#### Modal options

All modal actions can be overridden on a per-modal basis inside a specific Immerse section:

```js
new Immerse().setup({
  
  components: {  
    modals: {
      
      // Set a default for all modals in this section
      'default': {
        onCancel: function(modal) { /* Custom function */ },
        onConfirm: function(modal) { /* Custom function */ },
        onClose: function(modal) { /* Custom function */ }
      },
      
      // Will set specific settings on modal
      'modalName': {
        onCancel: function(modal) { /* Custom function */ }), ..
      }, ...
      
    }, ...  
  }, ...
  
});
```

Or globally inside Immerse setup:

```js
page.section({
  
  components: { 
    modals: {
      'default': { ... },
      'modalName': { ... }, ...
    }, ...
  }, ...
  
});
```

#### YouTube modals

Easily add YouTube modals to your Immerse page. Simply paste a YouTube URL into the imm-modal-open data tag and a YouTube modal will be generated.

```HTML
<button data-imm-modal-open="https://www.youtube.com/watch?v=XXXXXXXXXXX"></button>
```

*The YouTube modal automatically includes the YouTube iFrame API and handles playing, pausing and restarting of the video on open/close of the modal and at the end of the video.*

## Further Options

*The following options are configured in Immerse setup.*

#### Scroll duration &amp; easing

```js 
// new Immerse().setup.options
scroll: {
  duration: 1,
  easing: Power4.easeOut
}, ...
```

*For more information about GSAP easing, click <a href="http://greensock.com/ease-visualizer" target="_blank">here</a>.*

#### Hash navigation
By default, Immerse uses [history.replaceState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#The_replaceState()_method "Manipulating the browser history with history.replaceState") to enable hash navigation between page sections. If you don't wish to track state:

```js 
// new Immerse().setup.options
hashChange: false, ...
```

#### Custom breakpoints
Immerse's has its default breakpoints set at the same widths as popular front end framework Bootstrap. To overwrite the custom breakpoints, define a new breakpoints object in Immerse setup:

```js 
// new Immerse().setup.options
breakpoints: {
  newBreakpoint: 300,
  mobile: 480,
  tablet: 768,
  mdDesktop: 992,
  lgDesktop: 1200
}, ...
```

#### Minimum loading time
Before Immerse's asset queue promise is satisfied, a loading overlay is displayed. This is particularly useful for users on slow connections, but users on fast connections, the loading overlay may only appear for a split section and be perceived as bad UI. Setting minLoadingTime ensures the loading overlay is displayed for at least *x* seconds before the page animates in.

```js
// new Immerse().setup.options
minLoadingTime: 1000, ...
```

#### Namespacing
Namespacing Immerse is not essential, but changing all classes and datatags from using 'imm-' is available:

```js
// new Immerse().setup.options
namespace: 'foo', ...
```

This will ensure, for example:

```html
<section class="foo-section foo-fullscreen">
  <div class="foo-video" data-foo-video="videoName"></div>
</section> 
```

*Warning: All styles defined by Immerse MUST be prepended with the new namespace for Immerse to function. This can be done through find and replace, however Immerse's scss files can be included before minification and the $prefix value changed in style.scss*

#### Development Mode
Development mode logs all changes to animations, attributes and actions. It also logs breakpoint changes on resize. It is turned off by default, but can be turned on using:

```js
// new Immerse().setup.options
devMode: true, ...
```

## Custom components
Custom Immerse.js components will be available for anyone to develop in the near future once the documentation is up to speed! Follow [@willviles](https://twitter.com/willviles "Will Viles Twitter") for regular updates on Immerse.

## Future Developments
&#10004; Section hash state management.  
&#10004; YouTube modal windows.  
&#9744; Vimeo modal windows.  
&#9744; Set of easily-attachable modal window open/close animations.  
&#9744; Set of easily-attachable section transitions. Inspiration [here](http://codyhouse.co/gem/page-scroll-effects/ "Codyhouse page scroll effects").  
&#9744; Option to use history.pushState as well as history.replaceState.  

*Got a feature request? Tweet it to [@willviles](https://twitter.com/willviles "Will Viles Twitter").*

## Browser Support
Immerse.js aims to support all major browsers in recent versions:  
Firefox 26+, Chrome 30+, Safari 5.1+, Opera 10+, IE 9+

## About the Author
I'm Will Viles, a digital creative from Birmingham, UK. I can offer help & custom site builds using Immerse.js. 

Check out [my website](http://vil.es "Will Viles - Digital Creative Portfolio") or contact me on Twitter [@willviles](https://twitter.com/willviles "Will Viles Twitter").

## License
Immerse.js is dual licensed under the MIT license and GPL.
For more information click [here](https://github.com/willviles/Immerse.js/blob/master/LICENSE.md "Immerse.js license").