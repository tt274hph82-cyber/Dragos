# GSAP, vendored

`3.15.1/` holds the minified browser builds of GSAP 3.15.1 (npm `gsap`, from github.com/greensock/GSAP @ 5e6c35f),
core plus every plugin, for offline use in HTML compositions (HyperFrames, shadow-puppet players, motionmaxxing):

    <script src="../../vendor/gsap/3.15.1/gsap.min.js"></script>
    <script src="../../vendor/gsap/3.15.1/SplitText.min.js"></script>   <!-- then gsap.registerPlugin(SplitText) -->

All plugins are free under GreenSock's Standard "no charge" license (https://gsap.com/standard-license). In a
HyperFrames project, copy the files into the project's `assets/vendor/` so the project stays self-contained.
For bundled code (React/Vite), use the npm package instead: `npm i gsap@3.15.1`.
