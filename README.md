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

// Initialize on your container
page.init($('.imm-scroll-container')); 
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
### Defining assets
### Preloading (wait)

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

## Audio
### Default audio for all sections
### Section-based audio
### Mute button configuration
### Programatically control audio

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

## Custom components
### registerComponent
### onResize