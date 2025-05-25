# showcqt-element
A [showcqt](https://github.com/mfcc64/showcqt-js) audio visualization as an HTML custom element.

## Projects using showcqt-element
- [Youtube Musical Spectrum](https://github.com/mfcc64/youtube-musical-spectrum) - a browser extension that uses showcqt-element.

## Usage
- NPM
```
npm i showcqt-element
```
```js
import {ShowCQTElement} from "showcqt-element";

// import AutoResumeAudioContext
import {AutoResumeAudioContext} from "showcqt-element";
```
- CDN
```js
// import a specific version
import {ShowCQTElement} from "https://cdn.jsdelivr.net/npm/showcqt-element@2.2.0/showcqt-element.mjs";

// import a specific major version
import {ShowCQTElement} from "https://cdn.jsdelivr.net/npm/showcqt-element@2/showcqt-element.mjs";

// also on unpkg
import {ShowCQTElement} from "https://unpkg.com/showcqt-element@2/showcqt-element.mjs";
```
- A simple example:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>ShowCQTElement</title>
        <script type="module" src="https://cdn.jsdelivr.net/npm/showcqt-element@2/showcqt-element.mjs"></script>
        <script type="module">
            document.getElementById("audio-input").onchange = function() {
                const player = document.getElementById("audio-player");
                const old = player.src;
                player.src = URL.createObjectURL(this.files[0]);
                URL.revokeObjectURL(old);
            };
        </script>
    </head>
    <body>
        <p><input id="audio-input" type="file" accept="audio/*,video/*"/><br/>
        <audio id="audio-player" controls=""></audio></p>
        <showcqt-element id="showcqt" data-inputs="#audio-player"></showcqt-element>
    </body>
</html>
```
- Constructor
```js
// use document.createElement
const showcqt = document.createElement("showcqt-element");

// use constructor
const showcqt = new ShowCQTElement();

// global_audio_context
ShowCQTElement.global_audio_context = new AutoResumeAudioContext();
// now showcqt will use global_audio_context instead of internal audio_context
const showcqt = new ShowCQTElement();

// use audio_context from constructor, it will override global_audio_context
// AutoResumeAudioContext accepts parameters of AudioContext constructor
const showcqt = new ShowCQTElement(new AutoResumeAudioContext({sampleRate: 48000}));
```
- We can set style:
```css
showcqt-element {
    position: fixed;
    left: 0; bottom: 0;
    width: 100%; height: 50%;
}
```
- Options:
```html
<!-- data-inputs: a query selector to select elements used as inputs, it can be omitted if you wants manual inputs,
     it is evaluated at declaration time, so when media elements are dynamically added, you need to refresh the attribute
     example: select all audio and video elements -->
<showcqt-element data-inputs="audio, video"></showcqt-elements>

<!-- data-axis: use custom axis image, recommended size is 1920x32 -->
<showcqt-element data-axis="my-axis.png"></showcqt-element>

<!-- data-waterfall: height of waterfall in percent, default: 33, minimum: 0, maximum: 100
     example: visualization without waterfall -->
<showcqt-element data-waterfall="0"></showcqt-element>

<!-- data-brightness: default: 17, minimum: 1, maximum: 100
     example: make it brighter than the default -->
<showcqt-element data-brightness="30"></showcqt-element>

<!-- data-bar: height of audio visualization bar, default: 17, minimum: 1, maximum: 100
     example: make it lower -->
<showcqt-element data-bar="3"></showcqt-element>

<!-- data-bass: bass region attenuation, default: -30, minimum: -50, maximum: 0
     example: do not attenuate bass region -->
<showcqt-element data-bass="0"></showcqt-element>

<!-- data-interval (integer): reduce fps, default:1, minimum: 1, maximum: 4
     example: play at 20fps on monitor with 60fps -->
<showcqt-element data-interval="3"></showcqt-element>

<!-- data-speed (integer): number of waterfall line shift per frame, default: 2, minimum: 1, maximum: 12
     example: faster speed -->
<showcqt-element data-speed="4"></showcqt-element>

<!-- data-opacity: opacity of audio visualization bar, default: opaque, available: transparent
     example: make it transparent -->
<showcqt-element data-opacity="transparent"></showcqt-element>

<!-- data-scale-x: canvas horizontal scale in percents, default: 100, minimum: 30, maximum: 100
     example: half scale, reducing CPU usage but make canvas blurry -->
<showcqt-element data-scale-x="50"></showcqt-element>

<!-- data-scale-y: canvas vertical scale in percents, also affecting waterfall speed,
     lower data-scale-y makes faster waterfall speed, default: 100, minimum: 30, maximum: 100
     example: same speed as data-speed="2" but with lower CPU usage and lower image quality -->
<showcqt-element data-scale-y="50" data-speed="1"></showcqt-element>
```
- Manual audio inputs
```html
<!-- do not set data-inputs -->
<audio id="audio-player" controls=""></audio>
<showcqt-element id="showcqt"></showcqt-element>
```
```js
const audio = document.getElementById("audio-player");
const showcqt = document.getElementById("showcqt");
// audio_context is an instance of AudioContext
const audio_src = showcqt.audio_context.createMediaElementSource(audio);
// audio_input is an instance of AudioNode
audio_src.connect(showcqt.audio_input);
audio_src.connect(showcqt.audio_context.destination);
```
- Callbacks
```js
// render_callback is called every requestAnimationFrame() / interval, regardless of actual render
showcqt.render_callback = function() {
    // example: refresh the input elements, rewrite data-inputs attribute using dataset API
    this.dataset.inputs = "audio, video";
};

// actual_render_callback is called when there is an actual render
// when called, it will be called 'data-speed' times, the first one corresponds to bargraph rendering
// actual render is skipped when:
//  - display is none (hidden visibility does not count)
//  - silence is detected
//  - render is paused
showcqt.actual_render_callback = function(color_buf) {
    // modify color buffer, see "https://github.com/mfcc64/showcqt-js#readme"
    for (let m = 0; m < color_buf.length; m += 4) {
        // do something
    }
};

// post_render_callback is called after after buffer copied to canvas
// either because of actual render or canvas clearing
showcqt.post_render_callback = function({canvas, canvas_ctx, bar_h, axis_h, sono_h}) {
    console.log(canvas.height == bar_h + axis_h + sono_h); // should be true
};

// send_buffer is called when there are samples from audio graph
// by default, send_buffer is equal to write_buffer
showcqt.send_buffer == showcqt.write_buffer; // true

showcqt.send_buffer = function(data) {
    // modify buffer
    // data[0]: left channel, data[1]: right channel
    for (let x = 0; x < data[0].length; x++) {
        data[0][x] += 0.1 * Math.random() - 0.05;
        data[1][x] += 0.1 * Math.random() - 0.05;
    }
    this.write_buffer(data);
};

```
- Render controls and others
```js
showcqt.render_pause();
showcqt.render_play();
showcqt.render_is_paused;
// clear canvas
showcqt.render_clear();
// get the array of input elements from data-inputs attribute
showcqt.input_elements;
```
