# Immerse
#### Build immersive, media driven web experiences - the easy way.

[http://immerse.vil.es](https://immerse.vil.es "Immerse.js Site")

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

## Build HTML markup

At its most basic configuration, Immerse.js will build your section based site from simple HTML markup.

```html
<!-- Set the Immerse scroll container -->
<body class="imm-scroll-container">
  <!-- Create a section using .imm-section. Adding the .imm-fullscreen class creates a 100 vertical height section with fixed scrolling. -->
  <section id="first-section" class="imm-section imm-fullscreen"></section>
  <!-- Not adding the .imm-fullscreen class creates a flexible height, unbound scroll section. -->
  <section id="second-section" class="imm-section"></section>
</body>
```