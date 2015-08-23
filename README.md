# Immerse.js v1.0.7
#### Build immersive, media driven web experiences - the easy way.

Checkout the [official plugin website](https://immerse.vil.es "Immerse.js Site"), the [Learn to Surf](https://immerse.vil.es "Immerse.js Learn to Surf Example") example or the [full documentation](https://immerse.vil.es "Immerse.js Full Documentation").

### What does Immerse.js do?

Immerse.js offers a javascript framework for building complex, media-driven web experiences. It:
* Solves complex scrolling problems, such as managing a mix of scrollable full screen sections and unbound scrolling across all devices.
* Handles firing of GreenSock animations, custom js actions & attributes, with various runtime hooks, viewport and orientation parameters to tailor experiences across all screens.
* Enables the building of complex layered HTML5 audio soundtracks for each section of your page.
* Handles instantiation of resizable HTML5 background video - playing and pausing the video when in/out of view.
* Custom section components to manipulate content within each section of your page and remove the need for additional javascript. For example, tooltip, modal and slider support.
* Easy API to create custom section components.
* Manages asset preloading & page loading animations.
* Automatically generates & updates page section navigation.
* Manages state on a per-section basis using history.pushState.
* Provides an incredibly clean and simple interface to manage all of the above code.

## Getting Started

Install Immerse.js via NPM:

```shell
npm install immersejs
```

Include dependencies:
```html
<!-- JQuery -->
<script src="node_modules/jquery/jquery.min.js"></script>
<!-- GSAP TweenMax -->
<script src="node_modules/gsap/src/minified/TweenMax.min.js"></script>
<!-- GSAP ScrollTo Plugin -->
<script src="node_modules/gsap/src/minified/plugins/ScrollToPlugin.min.js"></script>
```

Include Immerse.js:
```html
<!-- Immerse.js -->
<script src="node_modules/immersejs/dist/js/immerse.js"></script>
<!-- Immerse.css -->
<link rel="stylesheet" type="text/css" href="node_modules/immersejs/dist/css/immerse.css">
```

## Basic Setup

#### Build HTML markup
At its most basic configuration, Immerse.js will build your section based site from simple HTML markup.

```html
<!-- Set the Immerse scroll container -->
<body class="imm-scroll-container">

  <!-- Create a flexible-height section using .imm-section. Give it an ID for Immerse to reference. -->
  <section id="foo" class="imm-section"></section>
  
  <!-- Adding the .imm-fullscreen class creates a 100 vertical height section with fixed scrolling. -->
  <section id="bar" class="imm-section imm-fullscreen"></section>
  
  <!-- Section navigation will be injected into any DOM element with .imm-nav-list attached. -->
  <ul class="imm-nav-list"></ul>
  
  <!-- Any div with the imm-loading class will be used as a loading overlay and hidden when the page's assets have fully loaded -->
  <div class="imm-loading"></div>
</body>
```

#### Setup & initialise Immerse

```js
// Get a handle on the Immerse setup object inside a variable.
var page = $.Immerse.setup(); 

// Initialize the page
page.init(); 
```

## Section configuration
Sections can be configured through registering a section on the page variable before Immerse is initialised. There are various methods through which to customise section GreenSock animations, custom js actions & attributes, various runtime hooks, viewport and orientation parameters. However, this is the most basic configuration.

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

### Defining assets

Define your assets in Immerse setup:
```js
$.Immerse.setup({
  
  assets: {
    'audioName': { type: 'audio', path: 'assets/audio/audio-name', loop: true },
    'videoName': { type: 'video', path: 'assets/video/video-name', fileTypes: ['mp4', 'ogv', 'webm'], loop: true },
    'imageName': { type: 'image', path: 'assets/image/image-name', fileTypes: ['jpg', 'png'] }
  }, ...
  
}); 
```

*Video file types default to mp4, ogv and webm. Loop defaults to true.*

### Asset preloading

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

### Default soundtrack

Add a soundtrack to every section of your page by defining the audio layers in Immerse setup. Volume of each audio layer can be controlled, along with the length of time it takes for the track to fade out/in when the soundtrack changes.

```js
$.Immerse.setup({
  
  audio: {
    'mainAudio': { volume: 1, changeDuration: 1 },
    'subtleAudio': { volume: .5, changeDuration: .5 }
  }, ...
  
}); 
```

*If no default soundtrack is defined, sections without specific audio defined will be silent.*

### Section-based soundtrack

Soundtracks can then be changed for each section of the page. Inside your Immerse section, just define a new soundtrack.

```js
page.section({
  
  audio: {
    'differentMainAudio': { volume: .8, changeDuration: 1.5 },
    'differentSubtleAudio': { volume: .3, changeDuration: .25 }
  }, ...
  
}); 
```
### Mute button configuration

Immerse automatically manages any mute buttons with the imm-mute class attached:

```html
<button class="imm-mute"></button>
```

The default content of the button is a string - 'Audio On' and 'Audio Off'. However, custom strings can be added in Immerse setup options. For example, a popular setup is using icon font Fontawesome to graphically illustrate audio state:

```js
$.Immerse.setup({
  
  options: {
    muteButton: {
      unmuted: '<i class="fa fa-volume-up"></i>',
      muted: '<i class="fa fa-volume-off"></i>',
    }, ...
  }, ...
  
}); 
```

*By default, Immerse uses cookies to set the audio to the state the user last left the page.*

### Programatically control audio

It's also possible to programmatically control audio state:

```js
page.audio(); // Get current state
page.audio('mute'); // Mutes audio
page.audio('unmute'); // Unmutes audio
```

## Animations

One of Immerse's key features is offering a clean, easy-to define, read & maintain interface for creating animations and tailoring them to devices and screens.

### Configuring animation timelines

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

### Default attribute value

Add the default attribute value to the Immerse setup:

```js
$.Immerse.setup({
  
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

### Change the attribute based upon section

In your chosen section, define the new attribute value.

```js
page.section({
  
  attributes: {
    'navColor': { value: 'blue' }
  }, ...
  
}); 
```

### Listen for changes & fire custom code

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

### Fixed scroll vs free scroll

Immerse infers which sections should be fixed height and which should be free scrolling simply by observing HTML classes:

```html
<!-- Free scrolling section -->
<section class="imm-section"></section>

<!-- Fixed scrolling section -->
<section class="imm-section imm-fullscreen"></section> 
```

### Responsive scrolling

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

### ScrollTo Buttons

Adding buttons which link to other Immerse page sections can be achieved through data tags:

```HTML
<!-- Pass either the name of the section or with a starting # -->
<button data-imm-scroll-to="linked-section">Go to linked-section</button>

<!-- You can also add either UP or DOWN to go to the next/prev sections. Must be in caps. -->
<button data-imm-scroll-to="DOWN">Go down a section</button>
```

### Programatically control scrolling

It's also possible to control scrolling programmatically:

```js
page.changeSection('linked-section');
page.changeSection('DOWN');
```

## Other
### Namespacing
### Tracking State (hasChange)
### Custom breakpoints
### Loading Animation (min time)
### Development Mode
### Vertical Align
### Custom scroll container

## Custom components
### registerComponent
### onResize

## Browser Support
Immerse.js aims to support all major browsers in recent versions:
Firefox 26+, Chrome 30+, Safari 5.1+, Opera 10+, IE 9+

## About the Author
I'm Will Viles, a digital creative from Birmingham, UK. I can offer help & custom site builds using Immerse.js. Check out [my website](https://vil.es "Will Viles - Digital Creative Portfolio") or contact me on Twitter [@willviles](https://twitter.com/willviles "Will Viles Twitter").

## License
Immerse.js is dual licensed under the MIT license and GPL.
For more information click [](https://github.com/willviles/Immerse.js/blob/master/LICENSE.md "Immerse.js license").