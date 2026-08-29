# Performance notes

Profiling at 1410×749 exposed two main costs: the full-screen water shader and eager asset loading. The test VM uses Chromium's software WebGL renderer, so its absolute frame rate is not representative of a machine with a GPU; relative measurements are still useful.

## Changes

- Removed the render-loop busy wait. The game now caps simulation/rendering at about 60 Hz by skipping early animation frames instead of blocking the browser thread.
- Disabled WebGL antialiasing. The game uses pixel art and nearest-neighbor texture scaling, so multisample antialiasing adds work without useful output.
- Reduced the water shader from six texture reads per pixel to five, replaced repeated vector averaging and `pow` work with scalar operations, and retained the animated noise, highlights, refraction, and underwater blend.
- Disabled the per-sprite color filters while their blend alpha is zero. They turn back on during the underwater transition.
- Stopped allocating a temporary `Vec2` for the water offset every frame.
- Lazy-loaded large island and underwater-hole textures when their sprites enter the camera. The initial scene no longer fetches distant world art.
- Loaded the optional Twitch embed asynchronously and removed its iframe and worker while gameplay is active. Opening the menu creates it again.
- Re-encoded eagerly loaded audio from WAV/320 kbps MP3 to Ogg Vorbis. The active audio payload fell from 14.9 MiB to 3.0 MiB.

## Measurements

On the software WebGL test setup:

- In-game frame rate: about 6.5 FPS before, 9.1 FPS after.
- Initial asset body size observed by the browser after a cold profile: about 3.3 MB after optimization.
- Distant lazy-loaded art and compressed audio remove about 42 MiB of initial requests. Lazy loading also avoids roughly 396 MiB of decoded RGBA image data until those locations are visited.

## Remaining opportunity

The world uses several 3000–5000 px textures. Splitting these into camera-sized tiles would lower peak GPU texture size and allow old tiles to be released. That is a larger content-pipeline change and should be measured on target mobile devices before implementation.
