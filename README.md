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
### Default audio for all sections
### Section-based audio
### Mute button configuration
### Programatically control audio



## Animations
### Configuring animations
### Devices, breakpoints & runtime
### Resetting animations

## Attributes
### Default attributes for all sections
### Change attributes per section
### Listen for changes & fire custom code

## Actions
### Fire custom code



## Scrolling
### Unbinding
### Buttons
### Programatically

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