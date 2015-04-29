# Thrixty
360° Photography Player

ToC:
* 1.: Thrixty Player
* 2.: Example
* 3.: Usage
* 4.: Installation Tutorial
* 5.: Documentation
* 6.: Change Log
* 7.: License

### 1.) Thrixty Player
The Thrixty Player is a tool to show off your 360° Photography.
It is using HTML5 canvas elements to display your sequence.

### 2.) Example
To view an example, download [these](https://github.com/FuchsEDV/Thrixty_example) two files.
Unzip them in the same folder as the corefiles.

### 3.) Usage
######Mouse/Touch:
```txt
[Click/Tap](single) => Play/Pause
[Click/Tap](double) => Zoom on/off
[Drag/Swipe] => Stop automatic rotation and turn the object. Works also in Zoom mode.
```
######Keboard:
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
* Thrixty consists of two parts, that are to be integrated into your Website: "scripts" and "style".
* Create a folder "thrixty" somewhere central in your website folder and copy those two folders in.
(We suggest the folder "[website-root]/thrixty".)
* (When you used the 360Shots Software to generate these files, you SHOULD NOT just copy and paste the whole folder for every object.
Instead, make sure, that your centrally placed "thrixty"-folder is up to date.
Then only copy the filelists and object folders, as they are the only files being needed.)
* The two files "thrixty_initialize.js" and "thrixty_styles.css" are to be included in your head section like this:

    ```html
<head>
    <script id="test" type="text/javascript" src="[path]scripts/thrixty_initialize.js"></script>
    <link type="text/css" rel="stylesheet" href="[path]style/thrixty_styles.css">
</head>
[path] should be the path, those ressource have when called from outside!
```
* The file "thrixty_initialize.js" will get its own path and start loading the class files.
* You need to make sure all files in "scripts" and "style" are accessible and none are missing.
* If you use any CMS, those files need to be hooked to the script- and style-section.
* ######Are you using Wordpress? Look at our Wordpress Plugin: [github link]

###5.) Documentation
[[Will come...](www.fuchs-edv.de)]

###6.) Change Log
* V1.1:
    * Changes in Error Handling and Reporting
* V1.0 (Release):
    * Play&Pause
    * Step forward
    * Step backward
    * Zoom
    * Fullscreen
    * Keyboard Shortcuts
    * Drag Rotation



###7.) License
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
