# Thrixty
360° Photography Player

Version: 3.2 | Apr 26, 2022

ToC:
* 1.: <a href="#1-thrixty-player">Thrixty Player</a>
* 2.: <a href="#2-example">Example</a>
* 3.: <a href="#3-usage">Usage</a>
* 4.: <a href="#4-installation-tutorial">Installation Tutorial</a>
* 5.: <a href="#5-filelists">Filelists</a>
* 6.: <a href="#6-parameters">Parameters</a>
* 7.: <a href="#7-customization">Customization</a>
* 8.: <a href="#8-general-description">General Description</a>
* 9.: <a href="#9-documentation">Documentation</a>
* 10.: <a href="#10-change-log">Change Log</a>
* 11.: <a href="#11-planned-features-and-changes-unordered">Planned Features and Changes</a>
* 12.: <a href="#12-license">License</a>



### 1.) Thrixty Player
The Thrixty Player is a tool to show off your 360° Photography.<br>
It uses HTML5 CANVAS to display sequences.


### 2.) Example

As an example, we have included the ./example folder.<br>
Unzip this repository into the 'thrixty' folder of the example and start up the 'index.html'.


### 3.) Usage

__Mouse/Touch:__<br>
```txt
[Click/Tap](single) => Play/Pause
[Click/Tap](double) => Zoom on/off
[Drag/Swipe] => Stop automatic rotation and turn the object. Also works in Zoom mode. | Drag the marker or minimap in classic mode to move the expanded area.
```
__Keyboard:__<br>
(To use these, the player needs to be focused - click once inside the player.)
```txt
[Spacebar] => Play/Pause
[Arrow Left] => Step Backward
[Arrow Right] => Step Forward
[Arrow Up] => Increase Rotation Speed
[Arrow Down] => Decrease Rotation Speed
[G] => Zoom on/off
[F] => Fullscreen on/off
[ESC] => Stop Zoom, Rotation, Fullscreen all at once.
```


### 4.) Installation Tutorial

-- UNDER CONSTRUCTION --

[...]

* Install Node.js and npm.
* Open a terminal in an empty folder and enter the following commands:
```txt
npm i thrixty
cd ./node_modules/thrixty
npm run build
```
* Congratulations, you have transpiled the output file ./node_modules/thrixty/thrixty/thrixty.js. Now to run a webserver (optional; allows you to test the program):
```txt
node app.js
```
* Open "localhost:3000/index.html" in your browser and admire the view!
* Once you wish to terminate the webserver, press Ctrl + C in the terminal.

[...]

* <i>When using the 360Shots Software to generate the files, you should only copy and paste the object folder; ignore the rest of the files!</i>

[...]

* For the Player to be able to do anything, you need to include both "thrixty.js" and "thrixty.css" in the DOM.<br>
For semantics you should put it into the head-section.
* When you choose to include a "thrixty_custom.css", include it <b>after both "thrixty.js" and "thrixty.css"</b>!
* Now create a div somewhere in the body with 'class="thrixty"' as seen in the following example.
	* The HTML-attribute "thrixty-basepath" is one of the options, referencing the basepath for the Filelists.
	* The Player will be generated into each of these divs, while using the corresponding attributes as parameters.

	```html
	<!DOCTYPE html>
	<html>
		<head>
			<script type="text/javascript" src="thrixty/thrixty.js"></script>
			<link type="text/css" rel="stylesheet" href="thrixty/thrixty.css">
			<!-- uncomment the following line, when customizing the player -->
			<!--<link type="text/css" rel="stylesheet" href="/thrixty_custom.css">-->
		</head>
		<body>
			<div class="thrixty"
				thrixty-basepath="360_objects/example/"
			></div>
			<canvas id="thrixty_zoom_canvas_1" class="thrixty_zoom_canvas">
		</body>
	</html>
	```

* This tutorial neglects the possible need for absolute paths.
	* Depending on your server configuration and your path to that 'index.html' you may find relative paths to be wrong.
	* When dealing with websites you absolutely need to know about relative and absolute paths anyway. Please educate yourself, if you don't.


##### When encountering a problem, check the following points in the given order:
* Read the [documentation](#9-documentation)...
* Was "thrixty.js" found and loaded?   (path incorrect?; resource not accessible?)
* Was "thrixty.css" found and loaded?  (path incorrect?; resource not accessible?)
* Was "thrixty_custom.css" found and loaded if needed?
* Was the div written properly?
	* Properly labeled with class="thrixty"?
	* Have you set the "tabindex"-attribute without using the same value multiple times?
	* Have you set the [parameters](#5-parameters) (like "thrixty-basepath", "thrixty-filelist-path-small" or "thrixty-filelist-path-large") correctly?
* Were the Filelists found and loaded? (path incorrect?; resource not accessible?)
* Were the images referenced in the filelists found and loaded? Especially the first small image is critical!


### 5.) Filelists
Filelists are text documents that are referencing to the images used for the animation.<br>
They consist of a comma-seperated list of paths.

Thrixty currently uses two Filelists - a small and a large one.<br>
They are referenced in the "thrixty-filelist-path-small" and "thrixty-filelist-path-large" settings respectively.<br>
The part of the path they both share is referenced in the basepath.

Therefore these settings:
```txt
basepath = http://www.example.com/
filelist-path-small = small/Filelist.txt
filelist-path-large = large/Filelist.txt
```
would make Thrixty look for these paths:
```txt
small:  http://www.example.com/small/Filelist.txt
large:  http://www.example.com/large/Filelist.txt
```


### 6.) Parameters

Here is a list of the usable params (in the form of HTML-attributes):
<table border="1" style="margin: 0 auto;">
	<tr>
		<td colspan="3" style="padding-left: 3em;">Version 2.3</td>
	</tr>
	<tr>
		<th>option</th>
		<th>Description</th>
		<th>possible values</th>
	</tr>
	<tr>
		<td class="">thrixty-basepath</td>
		<td class="" rowspan="3">
			These are telling the player where to find the Filelists.<br>"[http://basepath][filelist-path-small.txt]"<br>"[http://basepath][filelist-path-large.txt]"<br>
		</td>
		<td class="">
			<b>[empty]</b>, [mainpath]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-basepath</td>
		<td class="" rowspan="3">
			Location of localization (text) file. The default is "./thrixty/text.json".<br>
		</td>
		<td class="">
			<b>[empty]</b>, [mainpath]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-filelist-path-small</td>
		<td class="">
			<b>small/Filelist.txt</b>, [subpath]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-filelist-path-large</td>
		<td class="">
			<b>large/Filelist.txt</b>, [subpath]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-play-direction</td>
		<td class="">
			The direction the object is turning in automatic rotation.
		</td>
		<td class="">
			<b>normal</b>, reverse[d]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-drag-direction</td>
		<td class="">
			The direction the object is turning when dragging it.
		</td>
		<td class="">
			<b>normal</b>, reverse[d]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-autoload</td>
		<td class="">
			When autoload is on, it will automatically start loading all images, when ready.<br>
			When off, a load-button will be shown.<br>
			Will always be off on mobile devies (decided on user-agent).
		</td>
		<td class="">
			<b>on&nbsp;/&nbsp;1</b>, off&nbsp;/&nbsp;0<br>
		</td>
	</tr>
	<tr>
		<td class="">thrixty-autoplay</td>
		<td class="">
			When autoplay is on, the animation will start playing as soon as all images were loaded.<br>
			When off, nothing happens.
		</td>
		<td class="">
			<b>on&nbsp;/&nbsp;1</b>, off&nbsp;/&nbsp;0<br>
		</td>
	</tr>
	<tr>
		<td class="">thrixty-start-image-id</td>
		<td class="">
			ID of image that the animation is meant to start with.
		</td>
		<td class="">
			<b>0</b>, [integer]
		</td>
	</tr>
	<tr>
		<td class="">thrixty-cycle-duration</td>
		<td class="">Duration of each whole turn in seconds.</td>
		<td class=""><b>5</b>, [integer]</td>
	</tr>
	<tr>
		<td class="">thrixty-zoom-control</td>
		<td class="">
			How to move the zoomed image.<br>
			Automatically use the <b>mouseposition</b> or drag the cutout.
		</td>
		<td class="">
			<b>progressive</b>, classic
		</td>
	</tr>
	<tr>
		<td class="">thrixty-zoom-mode</td>
		<td class="">Zoomed in images showing in the <b>same</b> or an extra window.</td>
		<td class="">
			<b>inbox</b>, outbox, none
		</td>
	</tr>
	<tr>
		<td class="">thrixty-zoom-mode-mobile</td>
		<td class="">Zoomed in images showing in the <b>same</b> or an extra window on mobile devices.</td>
		<td class="">
			<b>inbox</b>, outbox, none
		</td>
	</tr>
	<tr>
		<td class="">thrixty-zoom-pointer</td>
		<td class="">How to point to the zoomed in position.</td>
		<td class="">
			<b>minimap</b>, marker, none
		</td>
	</tr>
	<tr>
		<td class="">thrixty-marker-mode</td>
		<td class="">How the marker size should be calculated (old version was kept for compability).</td>
		<td class="">
			<b>new</b>, old
		</td>
	</tr>
	<tr>
		<td class="">thrixty-sensitivity-x</td>
		<td class="">
			How sensitive the Player will react horizontally to touch gestures.<br>
			The finger needs to be move at least X pixel.
		</td>
		<td class=""><b>20</b>, [integer]</td>
	</tr>
</table>


### 7.) Customization

Customization of the player is quite easy, as Thrixty is optimised for doing as much as possible over HTML and CSS.<br>
The following examples are showing you some possibilities:
* Create the file "thrixty_custom.css" and include it after the initialization file, if not already done.<br>
* To give the Player a maximum height of 500 px, include the following CSS code into the file:

	```css
	div[thrixty=found]{
		max-height: 500px;
	}
	```

* To have an orange border around the object, include the following CSS code into the file:

	```css
	div[thrixty=found] #canvas_container{
		border: 2px solid orange;
	}
	```

* To have a blue background on the controls container, include the following CSS code into the file:

	```css
	div[thrixty=found] .control_container_one{
		background: blue;
	}
	```

* To hide the Zoom Button as long as it is disabled, include the following CSS code into the file:

	```css
	div[thrixty=found] #zoom_btn:disabled{
		display: none;
	}
	```


### 8.) General Description

A short explanation of what Thrixty does:
* After including and interpreting the JS, create namespace "Thrixty" and wait for the site to finish loading.
* Look for all divs with a class of "thrixty" ("div.thrixty").
* Initialize a Player instance for each div found.
	* Parse (and check) options, load the filelists
	* Parse filelists, cache images, generate HTML and display the first image while loading.
	* Set the attribute "thrixty" to "found".
	* Wait for user input.


### 9.) Documentation

[You are looking at it...](#thrixty)


### 10.) Change Log
* V3:
	* [See the separate changelog.]
* V2:
	* V2.3:
		* Fixed left and right arrows.
		* Improvements in documentation.
		* Improvements to "filelist-reversion".
			* Split up into two params "thrixty-play-direction" and "thrixty-drag-direction".
			* play-direction is the direction the object will turn during automatic turns.
			* drag-direction is the direction the object will turn when dragging the object.
	* V2.2.2:
		* Bugfix resizing
	* V2.2.1:
		* Fix of incorrect use of redraw throttle.
	* V2.2:
		* Holding next and previous button rotates the image.
			* The speed is fixed for now.
		* Tried to implement an SVG Sprite.
			* The "use"-Tag is not widely supported on mobile browsers (they are being stupid again...).
			* Therefore the code for the SVG-Icons is now saved in the Thrixty namespace (Thrixty.icons) and is being used to write the SVGs right into the HTML.
			* SVG Icons are styled by CSS.
		* Fixed logging and Safari's filelist parsing.
		* Renamed "state"-attributes on buttons to "thrixty-state".
	* V2.1:
		* Now respects max-width and max-height on the main div.
			* The main div still needs to set the style tag, so do this over CSS-Selectors!
			* Included a custom CSS example into the Readme.
		* Improvement of filelist parse.
	* V2.0.1:
		* Hotfix: Error with Whitespaces
	* V2.0.0:
		* Throttled redraw.
		* Player only reacts to mouseposition, when pointing inside.
		* Implemented a rudimentary destructor.
		* Changed the css to select player instances by custom attribute instead of by class.
		* Use large images in Fullpage Mode.
		* Cleaned up the code.
		* Adjusted behavior when images werent found. (small instead of large, blank instead of small)
		* When the sizing image (first in small filelist) couldnt be loaded, nothing will be displayed. In earlier versions the player was still showing the controls.
		* General performance improvements by adding throttle and debounce to bottleneck events.
		* Bugfix: Autoplay Off also triggered Autoload Off
		* Renamed option: position-indicator => zoom-pointer
		* Renamed option: direction => reversion
		* Class restructuring.
			* Joined MainClass, EventHandler and DrawingHandler into a single Player class.
			* Renamed Namespace from "ThrixtyPlayer" to "Thrixty".
		* Gotten rid of jQuery.
* V1:
	* V1.6.1:
		* Path-handling improved.
		* The basepath is now initially empty.<br>
		Therefore the path to the small filelist would be "[current_page/]small/Filelist.txt", when no params were set.
		* Standard values for filelist settings: "small/Filelist.txt" and "large/Filelist.txt".<br>
		These paths are the ones generated by our 360 Shots Worktable Suite.
	* V1.6:
		* New option "Autoload " can be used to restrict the player from automatically loading. Autoload is always disabled on mobile devices!
		* Animation Speed Modifier reworked. Now has a list of speeds you can switch through by pressing arrow up/down.
		* Changed effects of "direction" option. Will now simply reverse the filelist before load, instead of fuzzy logic.
		* Renamed "seconds-per-turn" to "cycle-duration".
	* V1.5.1:
		* Fullpage disabled on mobile devices - it is not working properly on those small screens (and actually unneccessary).
	* V1.5:
		* Allowed double-finger-zoom, when touching with <b>both fingers at the same time</b>.<br>
		This cannot be made more intuitive, as there are issues with non-conventional event uses. (look previous)
		* Browser-developers are not able to follow conventions or standards.<br>
		Thus positions and sizes are now calculated instead of declarated.
		* Included information for developers into the Readme. Especially for the namespace object "ThrixtyPlayer".
		* Moved version number into the ThrixtyPlayer Object.
		* Implemented a parameter for Autoplay: "thrixty-autoplay".
		* Load-Button now stays hidden, until the preview image becomes visible.
		* Improved Readme with a section on parameters.
	* V1.4:
		* Rewrote Event Handler.
		* Fixed iPad Support. (maybe other mobile browsers are still broken...)
		* Changed folder structure.
		* Saving bandwidth on mobile devices (detected by user-agent) by showing a load button instead of auto loading.
		* Changes in state management.
		* Zoom Mode can now be "none" for disabling zoom.<br>
		(Will automatically trigger, when large filelist was not found.)
		* Rebuilt Autostart.
		* Let the Player log into an object. (Spamming Console Log is annoying...)
		* Introduced a log-object in Namespace. ('console.log(ThrixtyPlayer.logs);')
		* Rebuilt the initialize functionality.
		* Path- and file-name conventions.
		* Reinforced compatibility on windows systems.
		* Enforced strict-mode.
	* V1.3.1:
		* Fixed Fullpage Mode.
	* V1.3:
		* Re-encoding of line-endings to windows format.
		* Safari drawing error resolved.
		* Rewritten DrawingHandler.
		* Full-page mostly fixed.<br>
		To fix this completely will be the first thing to do in Version 1.4.
		* Split up the param "zoom-mode" into "zoom-mode", "zoom-control" and "position-indicator".
		* Prepended semicolons.
	* V1.2:
		* Introduced the new position indicator "marker" and made the "minimap" look less grabbable
		* New options "zoom-control" and "outbox-position"
		* Splitted up the zoom options like "inbox_minimap" into seperate options
		* Changes in initialization
		* Removed Yoda-Conditions
		* Changes in Readme.md
	* V1.1:
		* Changes in Error Handling and Reporting
	* V1.0 (Release):
		* Play&amp;Pause
		* Step forward
		* Step backward
		* Zoom
		* Fullscreen
		* Keyboard Shortcuts
		* Drag Rotation


### 11.) Planned Features and Changes (unordered & some may be discarded)
* New Filelist Format (JSON-Style)
	* Settings area to avoid the overload of html attributes.
	* Support for Background Image with automatic scale detection. (Background Strategies like "always filled", "stretch", etc.)
	* Image Layers (for inside or top-down views of the same object)
* Improvements in Touch Zooming
	* Continuous zoom. (Think about a concept, to make this easily usable with touch gestures. In the end, there already is a great zoom function on most phones.)
		* Maybe a detection of resolution can be useful?
	* Fix the way, multi-fingered touch events work currently. (Should they be used anyway? Maybe just ignore any events with multiple fingers?)
* Context menu.
	* HTML5 Contextmenus are awesome!
	* User settings
		* Intented for Users to select zoom-style, design etc..
		* Is thought of to be designed like an extra window.
		* Options in select boxes(?).
	* Log Export to make it easier for users to report errors.
	* Rotation speed selection
		* Button holding rotation speed should be dependant on the current speed.
* README improvements:
	* Add detailed information about filelists and their purpose.
	* Add a concept describing picture.
		* Notation: `![alt_text](image/path.png)`
	* Add a proper example for player customization (look changes & icon replacement).
	* Proofread.
* Loading state should be visible to CSS, in case smt happens with the animation.
	* Also every load should be aborted, when some core function failed.
	* This could also be improved by implementing a replace picture, that is being showed instead of an animation, when something failed.
* When using a Shortcut, show an icon of the associated function with a fast little flash effect. (Inspiration: Youtube)
* Log amount of found images.


### 12.) License

```txt
Thrixty Player Copyright (C) 2015-2022 Fuchs EDV GmbH for 360Shots

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```