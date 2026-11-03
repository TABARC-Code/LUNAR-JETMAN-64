# Lunar Jetman 64

An early, unfinished tribute to *Lunar Jetman*, the 1983 ZX Spectrum game from Ultimate Play the Game. It runs in a web browser, it's a single HTML file, and there's nothing to install. You fly a jetpack around a moon, shoot things, climb into a rover, and try to stop alien raiders flattening your base.

Read the next two sections before you get attached. This is an idea I wanted to see moving, and most of it is still scaffolding.

## Status

Early prototype. You can play from the title screen to game over. It isn't balanced, it hasn't been played for long, and it hasn't been tried in a real browser on every platform.

What works, in the sense that I've read the code and a scripted test drives it: walking, the jetpack and its fuel, shooting, boarding and driving the rover, four enemy types, bombs, base damage, three lives, scoring, pause, restart, and the sound effects.

What's partial: balance (every number is a guess), enemy behaviour (three flight patterns and nothing clever), and the rover (it drives and shoots, and that's the full list).

What isn't here: most of what makes the original the original. Next section.

## How far this is from the original

I checked the original's design against [the Wikipedia entry](https://en.wikipedia.org/wiki/Lunar_Jetman) rather than trusting my memory of it. As described there, you hunt down alien bases and bomb them within a time limit, using bombs carried on the back of the rover. The rover also supplies bridging kits for crossing craters and refuels your jetpack, and Jetman is invulnerable while he's inside it.

None of that is in this version. What's here is a base-defence loop of my own: your base sits in the middle of a moon 8,000 pixels wide, waves of raiders arrive, bombers go for the base, and you lose when the base reaches zero or you run out of lives. Same costume, different game.

Two other honest notes. The sprites are my own drawings, built from scratch in code, in the spirit of Jetman, the rover and the raiders rather than copies of the originals. And the four enemy types (scout, bomber, fighter, mothership) are my invention, not the original's alien line-up.

The "64" in the name is a nod to a chunkier, modernised look. It isn't a technical claim. This is a browser game, not a 64-bit executable, and it runs wherever your browser does.

## What you need

A computer with a keyboard, and a current desktop browser. Chrome, Edge, Firefox and Safari should all cope, since the game only uses the canvas and Web Audio, but I haven't tried any of them yet. There's no touch or gamepad support, so phones and tablets are out.

You don't need an internet connection once you've downloaded it. The code makes no network requests (I searched for them).

## Idiot's guide

This assumes you've never done any of it before. If you have, skip to step three.

**Step one: get the files.** On this page, click the green **Code** button, then **Download ZIP**. A file with a name like `lunar-jetman-64-main.zip` will land in your Downloads folder. The exact name depends on the repository and branch.

**Step two: unzip it.** This matters, so don't skip it. Play from the unzipped folder, not from inside the zip file.

- Windows: right-click the zip file, choose **Extract All**, then click **Extract**.
- Mac: double-click the zip file.
- Linux: right-click the zip file and choose **Extract Here**. The wording varies by file manager.

**Step three: open the game.** Open the new folder. Inside you'll find a file called `index.html`. Double-click it and it should open in your browser.

If it opens in a text editor, or you see a wall of code, right-click the file, choose **Open with**, and pick a browser. On Windows, you might not see the `.html` ending at all, because Windows hides file extensions by default. The file with a browser icon, or the type "HTML Document", is the right one.

There are also three little launcher files, if you'd rather: `play.bat` for Windows, `play.command` for Mac, `play.sh` for Linux. Each one just opens `index.html` for you. I haven't run them on real Windows or Mac machines. Mac in particular may refuse `play.command` because it came from the internet, and if anything odd happens, go back to double-clicking `index.html`, which is the route I'd trust.

**Step four: start.** Click once anywhere on the game page so the browser knows you're talking to it, then press **Space**.

### What success looks like

A black starry screen. A green **LUNAR JETMAN** title with a small **64** beside it, a tiny Jetman bobbing about above it, and a flashing line that says **PRESS SPACE OR ENTER TO LAUNCH**.

Press Space and you're standing on grey moon ground, with a brown rover just to your right. Across the top you'll see your lives, your score, the sector number, a fuel bar and a base bar. Enemies start arriving from the edges of the screen within a couple of seconds.

### Your first minute

Hold **Space** to fly, steer with the **arrow keys**, and tap **Z** to shoot. When you're standing next to the rover, press **E** to climb in. Press **E** again to get out.

## Controls

| Action | Keys |
|---|---|
| Move left and right | Left and right arrows, or A and D |
| Jetpack | Space, W, or up arrow (hold it) |
| Fire | Z or X |
| Board or leave the rover | E or Enter (stand next to it, on the ground) |
| Pause and resume | P |
| Start from the title screen | Space or Enter |
| Restart after game over | R or Enter |

Fire follows whichever way you're facing. I dropped Ctrl as a fire key because Ctrl+W closes a browser tab, and fire plus jetpack is exactly the combination you'd press.

## How it plays

You start about 3,500 pixels to the left of your base. That's roughly 18 seconds on foot and 12 in the rover. When the base or the rover is off screen, a marker such as `< BASE` or `ROVER >` shows which way to go.

The jetpack holds about three seconds of continuous thrust. It refills while you're standing on the ground, in a bit under five seconds from empty.

Each sector sends 3 plus twice the sector number of raiders, and the next wave starts a few seconds after you clear the last. Points are multiplied by the sector number.

| Enemy | Hit points | Points | What it does | Shows up |
|---|---|---|---|---|
| Scout | 1 | 100 | Drifts about. Doesn't shoot, and touching it does nothing, so it's decorative | Sector 1 |
| Bomber | 2 | 200 | Heads for the base and drops bombs once it's within about 220 pixels | Sector 1 |
| Fighter | 3 | 350 | Fires aimed shots at you | Sector 2 |
| Mothership | 12 | 1,200 | Fires a three-shot spread, and launches a scout roughly every five seconds | Sector 4 |

Bombs that land on the base cost it one hit point and cost you 30 points. The base has 10 and never repairs itself.

On foot, a single enemy shot or a nearby bomb kills Jetman. You have three lives, and you're invulnerable for about three seconds after respawning. Inside the rover, each shot does two of the rover's six hit points, so three hits wreck it and cost you a life. There's no replacement rover for the rest of that game.

## Configuration

There isn't any, which is the only kind of configuration I trust. If you want to tinker, the main numbers (`GRAVITY`, `JET_THRUST`, `WALK_SPD`, `ROVER_SPD`, `BSPD`, `WORLD_W`) sit near the top of the script in `index.html`. Open it in a text editor and change them. Reload the page to see the result.

## Security

It's one self-contained file. I searched it for network requests, cookies, local storage, external scripts, fonts and images, and found none. It doesn't read or write your files, and it runs inside your browser's normal sandbox like any other web page.

The launcher scripts are the only bits that live outside the browser, and each is a few lines that open `index.html`. Read them before you run them. That's good advice about anything you download.

## Troubleshooting

**Keys do nothing.**
The game listens for keys on the page, so the page needs focus. Click on it once, then try again.

**There's no sound.**
Browsers won't play audio until you've interacted with the page. Pressing Space on the title screen should start it. If it still doesn't, check the browser tab isn't muted. The sounds are generated in the browser, so there are no audio files to go missing.

**The file opens as text, or in the wrong program.**
Right-click `index.html`, choose **Open with**, and pick a browser. On Windows, check the file hasn't ended up called `index.html.txt`, which happens if it was renamed with extensions hidden.

**The game runs slowly.**
The game updates a fixed 60 times a second and catches up if your display is slower than that. Below roughly 12 frames a second it gives up and runs in slow motion. Close other tabs and try again.

## Known limitations

- It's a different game from the original, as covered above.
- Scouts are harmless. I'd call that a gap rather than a design.
- The base never repairs, and a destroyed rover never comes back.
- The moon is generated randomly on every page load, so there's no fixed level and nothing to learn by heart.
- Nothing is saved. No high scores, no settings.
- Keyboard only.
- Balance is guesswork. Nobody has played this for long.
- The checks so far have been scripted, and I haven't looked at it in every browser. Expect some visual oddities I haven't spotted yet.
- It's one file of roughly 1,300 lines with everything global. Fine for now, awkward later.

## Development notes

Everything lives in `index.html`: the script is at the bottom, and every sprite is drawn in code rather than loaded from image files, which is why there's no `assets` folder. The game logic updates at a fixed 60 times a second regardless of your monitor's refresh rate.

There's an optional headless test in `tests/smoke.js`. It needs Node.js, runs the game with a fake canvas and fake key presses, and checks that starting, pausing, driving the rover, shooting, game over and restarting behave. I've run it on Node 22 and expect it to work on anything recent. It tells you nothing about how the game looks.

```
node tests/smoke.js
```

## Roadmap

Planned, and none of it built:

- The original's objective: bases to bomb, bombs carried on the rover, craters to bridge, jetpack refuelling from the rover.
- Something for scouts to do.
- Base repair, and a way to get a rover back.
- A saved high score, which would be the first thing here to touch browser storage.
- Gamepad and touch controls.

## Licence and credits

Code is released under the MIT licence. See the `LICENSE` file.

*Lunar Jetman* and Jetman belong to their rights holders. This is an unofficial fan project with no connection to them. It contains nothing taken from the original, and the code and drawings are new. The original game was developed and published by Ultimate Play the Game and designed by Tim and Chris Stamper, per the Wikipedia entry linked above.

Author: TABARC-Code.

Sources: [Lunar Jetman, Wikipedia](https://en.wikipedia.org/wiki/Lunar_Jetman)
