# Immerse.js [v1.0.17](https://github.com/willviles/Immerse.js/blob/master/CHANGELOG.md "Immerse.js Changelog") [![Build Status](https://api.travis-ci.org/willviles/Immerse.js.svg?branch=master)](https://travis-ci.org/willviles/Immerse.js) 
#### Build immersive, media driven web experiences - the easy way.

Immerse.js offers a javascript framework for building complex, media-driven web experiences.

Checkout the [official plugin website](http://immerse.vil.es "Immerse.js Site"), the [Learn to Surf](http://immerse.vil.es "Immerse.js Learn to Surf Example") example or the [full documentation](http://immerse.vil.es "Immerse.js Full Documentation").

## Getting Started

[Download the zip](https://github.com/willviles/Immerse.js/archive/master.zip "Immerse.js Download ZIP") or install Immerse.js via <a href="https://www.npmjs.com/package/immersejs" title="Immerse.js NPM package - immersejs" target="_blank">NPM</a>.

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
At its most basic configuration, Immerse.js will build your section based page from simple HTML markup. It will automatically handle scrolling, navigation and loading with just the following code:

```html
<body>

  <!-- Build your page structure with Immerse sections. -->
  <section data-imm-section="foo"></section>
  <section data-imm-section="bar"></section>
  
  <!-- Navigation will be injected here. -->
  <nav data-imm-nav="side"></nav>
  
  <!-- Loading overlay displays until the page's assets have fully loaded -->
  <div data-imm-loading="fade"></div>
  
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
Sections can be configured through registering one on the page variable. The following markup is the most basic configuration:

```js
page.section('foo', {

  // Name to show in navigation. If not set, will capitalize section id.
  name: 'Custom Foo Name'
  
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

Adding the wait key to any asset will add it to the asset queue for preloading. Immerse will display a loading overlay until all required assets are loaded. Images will be loaded into the browser cache and audio/video will be considered loaded when the HTML5 canplaythrough event is returned.

```js
'videoName': { type: 'video', path: 'assets/audio/gnossienne', loop: true, wait: true }, ...
```

## Video

Once a video asset is registered, it can be easily used as a video background for a page section. It's this simple:

```html

<section data-imm-section="foo">
  <!-- The imm-video element will stretch to any div positioned relatively -->
  <div data-imm-video="videoName"></div>
</section>
```

*Immerse.js will manage initialisation, pausing/playing on scroll and resizing of the HTML5 video without the need for any custom code.*


## Audio

Immerse easily enables the building of complex layered HTML5 audio soundtracks for each section of your page.

#### Default soundtrack

Add a default soundtrack by defining the audio layers in Immerse setup. The volume of each individual audio layer can be controlled, along with the length of time it takes for the track to fade out/in when the soundtrack changes.

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

Soundtracks can also be defined for each section of the page. Inside your Immerse section, just define a new soundtrack and the audio will change to your new soundtrack when the section is scrolled to.

```js
page.section('foo', {
  
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

One of Immerse's key features is offering a clean, easy to read interface for creating animations and targeting them at devices, breakpoints and runtimes. 

Multiple animations can be set on a single DOM element and each animation will be appropriately registered/removed by Immerse.js when its breakpoint declaration is met on window resize.

#### Configuring animation timelines

Below is the most verbose example of defining and executing one GSAP Timeline in Immerse:

```js
page.section('foo', {
  
  animations: {
    
    // Name the timeline
    'timelineOne': {
      
      // Define which devices to target. Defaults to both.
      devices: ['touch', 'desktop'],
      
      // Define which breakpoints to target. Defaults to all.
      breakpoints: ['mobile', 'tablet', 'mdDesktop', 'lgDesktop'],
      
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

For most animations (which run when the section is scrolled to and reset when the section is removed from view), only the timeline function need be defined. Every other value may be left to default.

For more information about using GSAP, visit <a href="http://greensock.com/gsap" title="GreenSock Animation Platform Official Website" target="_blank">the official GreenSock Animation Platform website</a>.

## Attributes

Section attributes allow for individual values to be changed on a per-section basis and trigger a listenable event when changed. The following example will demonstrate how easy it is to change navigation colour through each section of your site, with just one attribute.

#### Default attribute value

Add the default attribute value to the Immerse setup:

```js
new Immerse().setup({
  
  attributes: {
    
    // Name the attribute
    'navColor': {
      
      // Device, breakpoint and runtime targeting available in attributes too!
      devices: ['touch', 'desktop'],
      breakpoints: ['mobile', 'tablet', 'mdDesktop', 'lgDesktop'],
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
page.section('foo', {
  
  attributes: {
    'navColor': { value: 'blue' }
  }, ...
  
}); 
```

#### Listen for changes & fire custom code

When the page is scrolled to the chosen section, an event will be triggered. Listen to it and execute your desired code. For example, add a class to your navigation so its CSS styles will change to the desired color.

```js
$('body').on('navColor', function(e, value) {
  
  var $nav = $('[data-imm-nav]');
  var currentColor = $nav.data('color');
  
  $nav.removeClass(currentColor).addClass(value).data('color', value);

});
```

## Actions

Immerse also allows for any custom code to be triggered using device and runtime targeting.

```js
page.section('foo', {
  
  actions: {
    
    // Name the action
    'actionName': {
      
      // Device, breakpoint and runtime targeting available in actions too!
      devices: ['touch', 'desktop'],
      breakpoints: ['mobile', 'tablet', 'mdDesktop', 'lgDesktop'],
      runtime: ['enteringDown', 'enteringUp'],
      reset: ['exitedDown', 'exitedUp'],
      
      fire: function($section) {
        
        // Execute your custom code here.
        
      },
      
      clear: function($section) {
        
        // Code to clear action on reset.
        
      }
    }
  }, ...
  
}); 
```

## Scrolling

Immerse solves many problematic issues related to scrolling with elegant solutions.

#### Fixed scroll vs free scroll

Immerse infers which sections should be fixed height and which should be free scrolling simply by observing your HTML markup:

```html
<!-- By default, sections are fullscreen fixed scrolling sections -->
<section data-imm-section="foo"></section>

<!-- However, free scrolling sections can be defined in the markup -->
<section data-imm-section="foo" data-imm-unbound="true"></section> 
```

*Not sure what we mean by fixed vs free scroll? Check out the <a href="http://immerse.vil.es" title="Immerse.js Official Website" target="_blank">official plugin website</a> for examples.*

#### Responsive scrolling

It's possible to create responsive solutions for fixed scrolling sections by unbinding the scroll at certain breakpoints.

```js
page.section('foo', {
  
  options: {
    
    // The section will be free scrolling on mobile & tablet, but fixed scrolling for all larger screen sizes. 
    unbindScroll: ['mobile', 'tablet'], ...
    
  }, ...
  
});
```

*For more information on Immerse breakpoints, click [here](#custom-breakpoints "Immerse custom breakpoints").*

#### ScrollTo Buttons

Adding buttons which link to other Immerse page sections can be achieved through data tags:

```HTML
<!-- Pass the id of the section -->
<button data-imm-scroll-to="foo">Scroll to foo</button>

<!-- You can also add either UP or DOWN to go to the next/prev sections. Must be in caps. -->
<button data-imm-scroll-to="DOWN">Go down a section</button>
```

#### Programatically control scrolling

It's also possible to control scrolling programmatically:

```js
page.changeSection('foo');
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
page.section('foo', {
  
  components: { 
    modals: {
      'default': { ... },
      'modalName': { ... }, ...
    }, ...
  }, ...
  
});
```

#### YouTube modals

It's easy to add YouTube modals to your Immerse page. Simply paste a YouTube URL into the imm-modal-open data tag and a YouTube modal will be generated.

```HTML
<button data-imm-modal-open="https://www.youtube.com/watch?v=XXXXXXXXXXX"></button>
```

*The YouTube modal automatically includes the YouTube iFrame API and handles playing, pausing and restarting of the video on open/close of the modal and at the end of the video.*

## Further Options

*The following options are configured in Immerse setup.*

#### Scroll duration &amp; easing

Immerse.js uses the <a href="https://greensock.com/docs/#/HTML5/GSAP/Plugins/ScrollToPlugin/" title="GreenSock ScrollTo Plugin" target="_blank">GSAP ScrollTo Plugin</a> to animate between sections. Therefore, it is possible to tweak the default scroll animation using buttery smooth GreenSock easing.

```js 
// new Immerse().setup.options
scroll: {
  duration: 1,
  easing: Power4.easeOut
}, ...
```

*For more information about GSAP easing, click <a href="http://greensock.com/ease-visualizer" title="GreenSock Easing Visualizer" target="_blank">here</a>.*

#### Hash navigation
By default, Immerse uses <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#The_replaceState()_method" title="Manipulating the browser history with history.replaceState" target="_blank">history.replaceState</a> to enable hash navigation between page sections. If you don't wish to track state:

```js 
// new Immerse().setup.options
hashChange: false, ...
```

#### Custom breakpoints
Immerse uses breakpoints to allow animations, actions and attributes to be targeted at certain responsive screen sizes. To overwrite the default breakpoints, define a new breakpoints object in Immerse setup:

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

*The default breakpoints are set to match the breakpoint sizes for popular front end framework <a href="http://getbootstrap.com/css/#grid-media-queries" title="Bootstrap Grid Media Queries" target="_blank">Bootstrap</a>.*

#### Minimum loading time
Before Immerse's asset queue promise is satisfied, a loading overlay is displayed. This is particularly useful for users on slow connections, but users on fast connections, the loading overlay may only appear for a split section and be perceived as bad UI. 

Setting minLoadingTime ensures the loading overlay is displayed for at least *x* seconds before the page animates in.

```js
// new Immerse().setup.options
minLoadingTime: 1000, ...
```

#### Namespacing
Changing all classes and data tags from using 'imm-' is available:

```js
// new Immerse().setup.options
namespace: 'foo', ...
```

This will ensure, for example:

```html
<section data-foo-section="foo" class="foo-fullscreen">
  <div data-foo-video="videoName"></div>
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
Custom Immerse.js components will be available for anyone to develop in the near future once the API is locked down and documentation is up to speed! Follow <a href="https://twitter.com/willviles" title="Will Viles Twitter @willviles" target="_blank">@willviles</a> for updates.

## Future Developments
&#10004; Section hash state management.  
&#9744; Allow state tracking using history.pushState as well as history.replaceState.  
&#9744; Set of easily-attachable modal window open/close animations. Inspiration <a href="http://tympanus.net/Development/ModalWindowEffects/" title="Codrops modal window effects inspiration" target="_blank">here</a>.  
&#9744; Set of easily-attachable section transitions. Inspiration <a href="http://codyhouse.co/gem/page-scroll-effects/" title="Codyhouse page scroll effects" target="_blank">here</a>.  
&#9744; In time, the project will be moved away from a dependency on jQuery toward pure ECMAScript 6 and be restructured to follow UMD patterns. 

*Got a feature request? Tweet <a href="https://twitter.com/willviles" title="Will Viles Twitter @willviles" target="_blank">@willviles</a> or <a href="https://github.com/willviles/Immerse.js/issues/new" title="Immerse.js New Issue" target="_blank">open an issue</a>.*

## Browser Support
Immerse.js aims to support all major browsers in recent versions:  
Firefox 26+, Chrome 30+, Safari 5.1+, Opera 10+, IE 9+

## About the Author
I'm Will Viles, a digital creative from Birmingham, UK. 

With a degree in marketing and design/development skills, I specialise in developing creative, effective one page scrolling websites. I can offer help, guidance & custom site builds using Immerse.js. Feel free to get in contact.

*Check out <a href="http://vil.es" title="Will Viles - Digital Creative" target="_blank">my website</a> or contact me on <a href="https://twitter.com/willviles" title="Will Viles Twitter @willviles" target="_blank">Twitter</a>.*

## License
Immerse.js is dual licensed under the MIT license and GPL.
For more information click <a href="https://github.com/willviles/Immerse.js/blob/master/LICENSE.md" title="Immerse.js License Information" target="_blank">here</a>.