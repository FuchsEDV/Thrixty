# Thrixty
360° Photography Player

Version: 1.5 | 17.11.2015

ToC:
* 1.: <a href="#1-thrixty-player">Thrixty Player</a>
* 2.: <a href="#2-example">Example</a>
* 3.: <a href="#3-usage">Usage</a>
* 4.: <a href="#4-installation-tutorial">Installation Tutorial</a>
* 5.: <a href="#5-parameters">Parameters</a>
* 6.: <a href="#6-customization">Customization</a>
* 7.: <a href="#7-general-description">General Description</a>
* 8.: <a href="#8-documentation">Documentation</a>
* 9.: <a href="#9-change-log">Change Log</a>
* 10.: <a href="#10-planned-features-and-changes-unordered">Planned Features and Changes</a>
* 11.: <a href="#11-license">License</a>



### 1.) Thrixty Player
The Thrixty Player is a tool to show off your 360° Photography.<br>
It is using HTML5 CANVAS elements to display sequences.


### 2.) Example

To view an example, download [these](https://github.com/FuchsEDV/Thrixty_example) two files.<br>
Unzip them in the same folder as the corefiles.


### 3.) Usage

__Mouse/Touch:__<br>
```txt
[Click/Tap](single) => Play/Pause
[Click/Tap](double) => Zoom on/off
[Drag/Swipe] => Stop automatic rotation and turn the object. Also works in Zoom mode. | Drag the marker or minimap in classic mode to move the expanded area.
```
__Keboard:__<br>
(To use these, the Player needs to be focused - click once inside the Player.)
	```txt
	[Spacebar] => Play/Pause
	[Arrow Left] => Step Backward
	[Arrow Right] => Step Forward
	[Arrow Up] => Increase Speed
	[Arrow Down] => Decrease Speed
	[F] => Fullscreen on/off
	[ESC] => Stop Zoom, Rotation, Fullscreen all at once.
	```


### 4.) Installation Tutorial

* In this example we are using the index.html as a substitute for whatever you are using to generate the HTML.
* So go and create an "index.html" in your websites root folder.
* If you want to customize the players look, also create a "thrixty_custom.css" here.
* Create a folder "thrixty" in the root folder.
* Thrixty consists of two parts: the "core" folder and "thrixty_init.js".<br>
So extract those two into the newly created "thrixty" folder.
* Create a folder "360_objects" in the root folder of your website.<br>
This folder is where you are gonna put all your objects.
* For exampling purposes download the [Thrixty_example](https://github.com/FuchsEDV/Thrixty_example) and extract the "example" folder into the "360_objects" folder.
* __When using the 360Shots Software to generate the files, you should just copy and paste the object folder__; ignore the rest of the files.
* Your final folder structure should look like this:

	```html
	[website-mainfolder of your.domain.com]/
	|- [index.html]
	|- [thrixty_custom.css]
	|- thrixty/
	|  |- core/
	|  |- thrixty_init.js
	|- 360_objects/
	|  |- example/
	|  |  |- large/
	|  |  |  |- Filelist.txt
	|  |  |  |- [lots_of_large_images.jpg]
	|  |  |- small/
	|  |  |  |- Filelist.txt
	|  |  |  |- [lots_of_small_images.jpg]
	```

* For the Player to be able to do anything, you need to include the "thrixty_init.js" in the DOM.<br>
For semantics you should put it into the head-section.
* When you choose to include a "thrixty_custom.css", include that one RIGHT AFTER the "thrixty_init.js".
* Now create a div somewhere in the body with 'class="thrixty_player"' and give it at least the 3 options seen in the following example:

	```html
	<!DOCTYPE html>
	<head>
		<script type="text/javascript" src="http://your.domain.com/thrixty/thrixty_init.js"></script>
		<link type="text/css" rel="stylesheet" href="http://your.domain.com/thrixty_custom.css">
	</head>
	<body>
		<div class="thrixty-player" tabindex="0"
			thrixty-basepath="[web_path_to_objects_folder]/[object]/"
			thrixty-filelist-path-small="small/Filelist.txt"
			thrixty-filelist-path-large="large/Filelist.txt"
		></div>
	</body>
	```

* Typical problems at this stage:
	* thrixty_init.js not found | path incorrect; ressource not accessible
	* thrixty_custom.css not found | path incorrect; ressource not accessible
	* Filelists not found | paths incorrect; ressources not accessible
	* Images referenced in the filelists not found | path incorrect; ressource not accessible
	* __To solve those, load your browsers developer tools and look into your console and files for any files not being loaded.__
	* div:
		* not properly labeled with class="thrixty-player"
		* doesnt have all of the minimal attributes "thrixty-basepath", "thrixty-filelist-path-small" and "thrixty-filelist-path-large" correctly set
		* tabindex attribute - when using multiple players on one page - not set
		* tabindex attribute - when using multiple players on one page - using the same value multiple times

* When you are using any CMS or something similar, the same applies to the generated HTML!
* ###### Are you using Wordpress? Look at our [Wordpress Plugin](https://github.com/FuchsEDV/Thrixty_Wordpress)!


### 5.) Parameters

Here is a list of the usable params (in the form of HTML-attributes):
<table border="1" style="margin: 0 auto;">
	<tr>
		<td colspan="3" style="padding-left: 3em;">Version 1.5</td>
	</tr>
	<tr>
		<th>option</th>
		<th>Description</th>
		<th>possible values</th>
	</tr>
	<tr>
		<td class="">thrixty-basepath</td>
		<td class="" rowspan="3">These are telling the game where to find the Filelists.<br>"[http://basepath][filelist-path-small.txt]"<br>"[http://basepath][filelist-path-large.txt]"<br></td>
		<td class="">[mainpath]</td>
	</tr>
	<tr>
		<td class="">thrixty-filelist-path-small</td>
		<td class="">[subpath]</td>
	</tr>
	<tr>
		<td class="">thrixty-filelist-path-large</td>
		<td class="">[subpath]</td>
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
		<td class="">Zoomed in images showing in the <b>same</b> or an extra window. Or no zoom at all.</td>
		<td class="">
			<b>inbox</b>, outbox, none
		</td>
	</tr>
	<tr>
		<td class="">thrixty-position-indicator</td>
		<td class="">How to indicate the zoomed in position. Or dont.</td>
		<td class="">
			<b>minimap</b>, marker, none
		</td>
	</tr>
	<tr>
		<td class="">thrixty-outbox-position</td>
		<td class="">Where the zoom box should spawn.</td>
		<td class="">
			<b>right</b>, bottom, left, top
		</td>
	</tr>
	<tr>
		<td class="">thrixty-direction</td>
		<td class="">"forward" is interpreted as clockwise, when watched from above.</td>
		<td class=""><b>forward / 1</b>, backward / -1</td>
	</tr>
	<tr>
		<td class="">thrixty-seconds-per-turn</td>
		<td class="">How long every 360° turn will take.</td>
		<td class=""><b>5</b>, [integer]</td>
	</tr>
	<tr>
		<td class="">thrixty-sensitivity-x</td>
		<td class="">
			How sensitive the Player will react horizontally to touch gestures.<br>
			The finger needs to be move at least X pixel.
		</td>
		<td class=""><b>20</b>, [integer]</td>
	</tr>
	<tr>
		<td class="">thrixty-autoplay</td>
		<td class="">
			Will this player automatically play its animation upon load.<br>
			The finger needs to be move at least X pixel.
		</td>
		<td class="">
			<b>on</b>, off<br>
			<b>1</b>, 0 (alternatively)
		</td>
	</tr>
	<!--<tr>
		<td class="">
			thrixty-sensitivity-y<br>
			(<b>This option is not yet used!</b>)
		</td>
		<td class="">How sensitive the Player will react vertically to touch gestures.<br>The finger needs to be move at least Y pixel.</td>
		<td class=""><b>50</b>, [integer]</td>
	</tr>-->
</table>


### 6.) Customization

Customization of the player is quite easy, as Thrixty is optimised for doing as much as possible over HTML and CSS.<br>
Create a CSS file and include it after the initialization file.<br>
Add this to the head:
Here is an example that will make the object have a orange border and the button container to have a blue background.<br>

	```css
	.thrixty-player .canvas_container{
		border: 2px solid orange;
	}
	.thrixty-player .control_container{
		background: blue;
	}
	```


### 7.) General Description

This section explains shortly, what the javascript is doing:<br>
<br>
After including the initializing script "thrixty_init.js" in your documents head, it will wait for the whole site to finish loading.<br>
It will then start by looking for all divs with class thrixty-player ("div.thrixty-player").<br>
On each found div it will start a new player instance, allowing you to place multiple players on each site.<br>
<br>
The initializing script also creates the namespace "ThrixtyPlayer", which holds the classes, namespacewide variables and every instantiated player.<br>


### 8.) Documentation

[[Not yet done](http://www.fuchs-edv.de)]


### 9.) Change Log

* V1.5:
	* Most browser-developers are not able to follow conventions.<br>
	Thus positions and sizes are now calculated instead of declarated.
	* Allowed double-finger-zoom, when touching with <b>both fingers at the same time</b>.<br>
	This cannot be made more intuitive, as there are issues with non-conventional event uses. (look above)
	* Included information for developers into the Readme. Expecially for the namespace object "ThrixtyPlayer".
	* Moved version number into the ThrixtyPlayer Object
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
	* Introduced the new position indicator "marker" and made the "minimap" look less grabable
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


### 10.) Planned Features and Changes (unordered)
* Parameters for autoload and autoplay
* Implement Event Debouncing
* Adjust behavior when images werent found. (small instead of large, blank instead of small)
* Log export for debugging purposes.
* Preview picture (the first small image).
* Responsiveness improvements.
* Full Background Support with automatic scale detection. (Background Strategies like "always filled", "stretch", etc.)
* Settings File or similiar instead of an overload of html attributes. => Required for the more non-standardy options.


### 11.) License

```txt
Thrixty Player Copyright (C) 2015  F.Heitmann @ Fuchs EDV GmbH for 360Shots

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
