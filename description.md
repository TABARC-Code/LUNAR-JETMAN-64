# Project Description

## The short version

Lunar Jetman 64 is a single-file browser game inspired by the 1983 ZX Spectrum title. It's a side-scrolling shooter on a procedurally generated moon: you play a jetpack soldier with a rover, defending a base from waves of flying raiders.

It's an early prototype, and the interesting question for anyone picking it up is how much of the original's design it keeps. The answer is very little. The costume is there; the structure underneath is mine, and a simpler one. The README says so in plain terms, and this document explains how it ended up that way.

## The problem

Two constraints drove nearly everything.

First, the people most likely to try this are people who want to play something, not set something up. If getting it running needs a terminal, a package manager, or a web server, a large share of them will give up before the title screen. The target was: download, unzip, double-click.

Second, the original's art and structure belong to somebody else. I wanted the feel of a jetpack, a moon and a rover without shipping a single asset that came from the original, and without pretending a hand-drawn approximation is the real thing.

## The approach

One HTML file, no build step, no dependencies, no asset files. All graphics are drawn with canvas calls in code, and all sound is synthesised with Web Audio oscillators. Opening `index.html` from the file system is the entire deployment story.

The game logic runs as a fixed-step simulation, 60 ticks a second, with rendering decoupled from it. Everything else is conventional: a handful of global arrays of plain objects, axis-aligned box collisions, and a small state machine.

## Architecture

The script is a flat list of sections, each introduced by a comment banner:

- **Terrain.** A `Uint16Array` holds one surface height per world column, 8,000 columns wide. It's generated from layered sine waves plus 14 randomly placed craters, with two stretches flattened afterwards: the start area and the base site.
- **Entities.** Jetman, the rover and the base are single objects. Enemies, bullets, enemy bullets, bombs and particles live in arrays and are filtered in place as they die.
- **State machine.** Five states: title, playing, paused, dead (the short pause between losing a life and respawning), and gameover. Only `playing` and `dead` advance the world.
- **Camera.** A horizontal offset that eases towards the player. World coordinates are what the game logic uses; screen position is world position minus the offset.
- **Enemy behaviour.** Three movement patterns picked at random per enemy: approach and drift, a sine swoop, and a figure-of-eight orbit. Bombers steer for the base instead of the player. Fighters and motherships aim shots at Jetman. Motherships also launch scouts, capped by a total enemy count.
- **Rendering.** Back to front: sky and stars, terrain, base, particles, bullets, rover, Jetman, enemies, then the HUD and a faint scanline overlay.
- **Audio.** Short one-shot oscillators. Nothing is loaded, nothing is cached, and the audio context is created lazily on the first key press, since browsers won't allow it earlier.

## Control flow

Each animation frame, `loop` adds the elapsed time to an accumulator, runs `tick()` once per 16.7 ms of accumulated time, and then calls `render()` once. A tick updates input-driven movement, enemies, bullets, bombs, particles, the camera and the wave logic, in that order.

The accumulator is clamped to 100 ms and to five ticks per frame, so a tab that was in the background doesn't come back and fast-forward the game. The cost is that below roughly 12 frames a second the game slows down instead of keeping pace.

Waves are driven by a timer and a count of enemies that are queued but haven't spawned yet. Enemies in a wave are released on staggered `setTimeout` calls, so the logic that decides a wave is cleared has to know about the ones still waiting. A generation counter discards the pending spawns if the game restarts.

## Design decisions

**One file.** I rejected a bundler, a framework and an engine. Any of them would give a tidier codebase, and any of them would end the double-click install. The price is a long file with everything global and a lot of numbers scattered through it.

**Fixed timestep.** The first cut ran physics once per animation frame, which would have made the game about 2.4 times too fast on a 144Hz display. I considered scaling every movement by elapsed time. I chose a fixed step because every constant in the code is already expressed per tick, and a fixed step needs no changes to them. A headless check now confirms the tick count stays at about 600 per 10 seconds at both 60Hz and 144Hz.

**Everything drawn in code.** No images means no file-loading problems when the page is opened straight from disk, and nothing borrowed from the original. The cost is that the sprites are blocky approximations, and changing one means editing drawing code.

**Terrain as a one-dimensional height array.** Simple and fast to collide against. It rules out overhangs, caves and destructible ground, and I don't expect to need them.

**Random terrain on every load.** It gives variety for free. It also means there's no fixed level to tune, and nothing is reproducible, because there's no seed.

**No Ctrl as a fire key.** Fire and jetpack together is Ctrl and W, which closes the browser tab. Z and X replaced it.

**A rover faster than walking.** The first version had it slower than Jetman on foot, which made it pointless as transport. It now moves at 4.8 against Jetman's 3.2 pixels per tick. The numbers are still guesses.

**Base defence in place of the original's mission.** This was a scope choice, not an interpretation of the original. Defending a base gave me a loop I could get running quickly, and the original's structure (timed bomb runs, carrying bombs on the rover, bridging craters) is more work than I'd done by that point. Nothing about it claims the original played this way.

## Trust and boundaries

Everything stays inside the browser. Keyboard input goes in; canvas pixels and audio come out. The code makes no network requests, doesn't touch cookies or storage, and loads no external scripts, fonts or images, which I confirmed by searching the file for each.

The launcher scripts (`play.bat`, `play.command`, `play.sh`) are the only things that run outside the browser sandbox. Each only asks the operating system to open `index.html` in the default browser.

## Current state

Checked by running the game logic headless with fake input: starting, pausing and resuming, boarding, driving and leaving the rover, shooting an enemy for points, the base ending the game, restarting, the tick rate at two refresh rates, and zero runtime errors during the run. The checks live in `tests/smoke.js`.

Written but only read, never observed: all rendering and every sprite, audio output, the launcher scripts on Windows and macOS, and the on-screen markers.

Unknown: behaviour in any real browser, performance on low-end hardware, and whether the game is any fun for more than a few minutes. Balance values are guesses.

Planned and not started: the original's objective, covered under future direction.

## Limitations and awkward bits

Scouts do nothing. They don't shoot, nothing happens if you touch them, and they exist mostly as cheap targets and as the thing motherships spawn. That's a gap, not a decision I'd defend.

The figure-of-eight movement pattern writes the enemy's position directly each tick, which bypasses its velocity entirely, so it behaves unlike the other two. It works. It's also exactly where I'd expect the next strange bug to turn up.

The base's damage cracks are redrawn at random every frame, so they probably flicker. When the base is destroyed, the explosion particles stop updating at the moment the game-over state begins, so they hang frozen on screen. Both are cosmetic, and I haven't looked at either on a real display.

Every tunable number is inlined or sits in a constant block at the top. There's no config file and no difficulty setting.

A destroyed rover is gone for the rest of the game, and the base never repairs. Together with harmless scouts, the difficulty curve is lopsided.

## Future direction

Planned, in rough order of how much it would change the game:

- Bring in the original's actual objective: alien bases, bombs carried on the rover, craters needing bridges, refuelling from the rover. That is a rework of the core loop, not an addition to it.
- Give scouts a purpose, and give the base and rover a way to recover.
- Persist a high score. It would be the first code in the project to touch browser storage, and the README's security statement would need updating with it.
- Gamepad and touch input.
- If the file becomes unmanageable, split it into modules. That would break the double-click install unless the result is bundled back into a single file, so it needs deciding deliberately rather than drifting into.
