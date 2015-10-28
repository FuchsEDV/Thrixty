# Thrixty
360° Photography Player

Version: 1.4.1 | 28.10.2015

ToC:
* 1.: Thrixty Player
* 2.: Example
* 3.: Usage
* 4.: Installation Tutorial
* 5.: Customization
* 6.: Extra Information for Developers
* 7.: Documentation
* 8.: Change Log
* 9.: Planned Features and Changes
* 10.: License

### 1.) Thrixty Player
The Thrixty Player is a tool to show off your 360° Photography.<br>
It is using HTML5 CANVAS elements to display sequences.

### 2.) Example
To view an example, download [these](https://github.com/FuchsEDV/Thrixty_example) two files.<br>
Unzip them in the same folder as the corefiles.

### 3.) Usage

<b>Mouse/Touch:</b><br>
```txt
[Click/Tap](single) => Play/Pause
[Click/Tap](double) => Zoom on/off
[Drag/Swipe] => Stop automatic rotation and turn the object. Also works in Zoom mode. | Drag the marker or minimap in classic mode to move the expanded area.
```
<b>Keboard:</b><br>
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
* Thrixty consists of two parts: the "core" folder and "thrixty_init.js".
* Create a folder "thrixty" somewhere central in your website folder and copy those two folders in.<br>
(We suggest the folder "[website-root]/thrixty".)
* When using the 360Shots Software to generate these files, you SHOULD NOT just copy and paste the whole folder for every object.<br>
Instead, only copy the object folders and filelists, as they are the only files being needed.
* The file "thrixty_init.js" is to be included in your head section like this:

```txt
<head>
    <script id="test" type="text/javascript" src="[path]thrixty_init.js"></script>
</head>
[path] is the path through the internet to the thrixty main folder.
```

* The file "thrixty_init.js" will get its own path and start loading the class files.
* You need to make sure the "core" folder and all its files are accessible and none are missing.
* If you use any CMS, the init file needs to be hooked to the script-section.
* ######Are you using Wordpress? Look at our [Wordpress Plugin](https://github.com/FuchsEDV/Thrixty_Wordpress).

* After completing PageLoad the Player Script will now look for any div-tags with the class "thrixty-player" and will initialize itself on each found instance.
* You can customize the player by adding attributes to these intial div-tags.
* (A list of possible options and their standard values will be added.)

### 5.) Customization

Customization of the player is quite easy, as Thrixty is optimised for doing as much as possible over HTML and CSS.<br>
Create a CSS file and include it after the initialization file.<br>
```txt
<head>
    <script id="test" type="text/javascript" src="(...)thrixty_init.js"></script>
    <link type="text/css" rel="stylesheet" href="(...)custom.css">
</head>
```
Here is an example that will make the object have a orange border and the button container to have a blue background.<br>
```css
.thrixty-player .canvas_container{
    border: 2px solid orange;
}
.thrixty-player .control_container{
    background: blue;
}
```

### 6.) Extra Information for Developers
Every global property is stored in the namespace "ThrixtyPlayer" together with the classes.<br>
At initialization the namespace object is dumped into the console.<br>
(The easest way to access this is by using your browsers developer tools - for example "Firebug" for Firefox.)<br>
(If you cant find the object in the console, you can manually execute "console.log(ThrixtyPlayer);")<br>
<br>
Inspecting that object will tell you i.a.:<br>

| Property | Value |
| :--- | :--- |
| Version | ThrixtyPlayer.version |
| List of Player Instances | ThrixtyPlayer.initialized_players |
| Application Log | ThrixtyPlayer.logs.main_log |
| Specific Player Instance Log | ThrixtyPlayer.logs.player_logs |

### 7.) Documentation
[[Not yet done](http://www.fuchs-edv.de)]

### 8.) Change Log
* V1.4.1:
    * Included information for developers into the Readme. Expecially for the namespace object "ThrixtyPlayer".
    * when the number of initialized players on one page exceeds 3, autoplay is stopped
    * moved version number into the ThrixtyPlayer Object
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

### 9.) Planned Features and Changes
* Adjust behavior when images werent found. (small instead of large, blank instead of small)
* Log export for debugging purposes.
* Preview picture (the first small image).
* Responsiveness improvements.
* Full Background Support with automatic scale detection. (Background Strategies like "always filled", "stretch", etc.)
* Settings File or similiar instead of an overload of html attributes. => Required for the more non-standardy options.
* Readme: section on customization

### 10.) License
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