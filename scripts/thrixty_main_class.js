/* thrixty_main_class.js */
/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version 1.0
 *  @license GPLv3
 *  @module ThrixtyPlayer.MainClass
 */

(function(jQuery){

	/**
	 *  @description ThrixtyPlayer Application
	 *  @name ThrixtyPlayer
	 *
	 *  @namespace ThrixtyPlayer The Thrixty Player is a 360 degree Product Presentation designed in HTML 5.
	 */
	ThrixtyPlayer = ThrixtyPlayer || {};



	/**
	 *  @description MainClass of the Thrixty Player<br>This class manages the creation of the HTML-Code and keeps track of changes in state.
	 *  @name ThrixtyPlayer.MainClass
	 *
	 *  @namespace ThrixtyPlayer.MainClass
	 *  @class
	 *  @param {jQuery} selector On what div element to use the Player.
	 *
	 *  @property {object} main_box jQuery Object of DOM-Element, which will include this Player.
	 *  @property {object} event_handler Class Instance of Event Handler.
	 *  @property {object} drawing_handler Class Instance of Drawing Handler.
	*/
	ThrixtyPlayer.MainClass = function(selector){
		// Player Identity
		this.main_box = selector;

		// Class Relations
		this.event_handler = null;
		this.drawing_handler = null;



		// Options
		// set base values
		this.settings = {
			basepath: "", // Standardpfad, von wo aus die Player-Dateien liegen.
			direction: 1, // 1|-1 <=> forward|backward
			seconds_per_turn: 5,
			sensitivity_x: 20,
			sensitivity_y: 50,
			zoom_mode: "inbox_minimap",
		};
		// The settings.direction is used multiplicative! It corresponds to "Base direction", so the rest of the program can treat both base directions as "forward"!


		this.small = {
			context: "small",
			filepath: "filelist_small.txt",
			images_count: 0,
			images_loaded: 0,
			images_errored: 0,
			is_loaded: false,
			first_loaded_image_id: null,
			active_image_id: 0,
			frequency: 15,
			images: {}, // "images" Prototyp:
						// {
						// 	id: 0,
						// 	source: "www.testsource.de",
						// 	jq_elem: jQuery("<img style=\"display: none;\" />"),
						// 	elem_loaded: null,
						// 	to_large: null,
						// }
			load_event: this.small_onload_event,
		};
		this.large = {
			context: "large",
			filepath: "filelist_large.txt",
			images_count: 0,
			images_loaded: 0,
			images_errored: 0,
			is_loaded: false,
			first_loaded_image_id: null,
			active_image_id: 0,
			frequency: 15,
			images: {}, // "images" Prototyp:
						// {
						// 	id: 0,
						// 	source: "www.testsource.de",
						// 	jq_elem: jQuery("<img style=\"display: none;\" />"),
						// 	elem_loaded: null,
						// 	to_large: null,
						// }
			load_event: this.large_onload_event,
		};






		// State Variables
		this.loading_state = "none"; // none|loading|playable|zoomable
		this.is_rotating = false;
		this.is_zoomed = false;
		this.is_fullscreen = false;



		// Canvas Events
		this.last_x = 0;
		this.turned_x = 0;



		// Rotation
		this.rotation_direction = 1; // 1|-1 <=> forward|backward
		// this.rotation_direction is designed to treat this.settings.direction as always being "forward" - hence multiplicate itself with it.
		this.interval_id = 0;
	};

	/**
	 *  @description This function will do the setup tasks to build the Player inside the div.
	 */
	ThrixtyPlayer.MainClass.prototype.setup = function(){
		// considering the settings
		this.parse_settings();

		// read filelists
		var small_fl_read = this.read_filelist(this.small);
		if( true !== small_fl_read ){
			throw new Error("The Base Filelist Wasn't Loaded.\n"+small_fl_read);
			return false;
		}
		var large_fl_read = this.read_filelist(this.large);
		if( true !== large_fl_read ){
			throw new Error("The Zoom Filelist Wasn't Loaded.\n"+large_fl_read);
			return false;
		}

		// build the player
		this.generate_html_structure();

		// new EventHandler for this Player
		this.event_handler = new ThrixtyPlayer.EventHandler(this);

		// new DrawingHandler for this Player
		this.drawing_handler = new ThrixtyPlayer.DrawingHandler(this);


		// Set the values for the possibly different image count.
		this.set_image_offsets();
		this.set_image_frequencies();

		// set load events
		this.set_load_events(this.small);
		this.set_load_events(this.large);


		// load small pictures
		this.load_all_images(this.small, this.image_cache_small);
		// preload first image (for sizing purposes)
		this.load_one_image(this.large.images[0], this.image_cache_large);
	};

	/**
	 *  @description This function gets the options defined as HTML attributes.<br>To create new options, register them here.
	 */
	ThrixtyPlayer.MainClass.prototype.parse_settings = function (){
		// loop through all attributes to get option values
		var main_box_attributes = this.main_box[0].attributes;
		var main_box_attr_count = main_box_attributes.length;
		for( var i=0; i<main_box_attr_count; i++ ){
			var attr = main_box_attributes[i];
			switch( attr.name ){
				case "thrixty-basepath":
					if( "" != attr.value ){
						this.settings.basepath = String(attr.value);
					}
					break;
				case "thrixty-direction":
					if( "1" == attr.value || "forward" == attr.value ){
						this.settings.direction = 1;
					} else if( "-1" == attr.value || "backward" == attr.value ){
						this.settings.direction = -1;
					}
					break;
				case "thrixty-filelist-path-small":
					if( "" != attr.value ){
						this.small.filepath = String(attr.value);
					}
					break;
				case "thrixty-filelist-path-large":
					if( "" != attr.value ){
						this.large.filepath = String(attr.value);
					}
					break;
				case "thrixty-seconds-per-turn":
					if( "" != attr.value ){
						this.settings.seconds_per_turn = parseInt(attr.value);
					}
					break;
				case "thrixty-sensitivity-x":
					if( "" != attr.value ){
						this.settings.sensitivity_x = parseInt(attr.value);
					}
					break;
				case "thrixty-sensitivity-y":
					if( "" != attr.value ){
						this.settings.sensitivity_y = parseInt(attr.value);
					}
					break;
				case "thrixty-zoom-mode":
					if( "" != attr.value ){
						this.settings.zoom_mode = String(attr.value);
					}
					break;
				default:
					break;
			}
		}
	};
	/**
	 *  @description This function generates HTML-Code and keeps track of generated elements.
	 *  @return {bool} Was everything generated correctly? (atm inoperable)
	 */
	ThrixtyPlayer.MainClass.prototype.generate_html_structure = function(){
		// this is the main part of the player - image show area
		this.main_box.attr("tabindex", "0");
		this.main_box.css("outline", "none");
			this.pictures = jQuery("<div class=\"pictures\"></div>");
			this.main_box.append(this.pictures);
				this.main_canvas = jQuery("<canvas id=\"main_canvas\" width=\"0\" height=\"0\">Your Browser does not support HTML5!</canvas>");
				this.pictures.append(this.main_canvas);
				this.progress_container = jQuery("<div class=\"progress_container\" ></div>");
				this.pictures.append(this.progress_container);
					this.progress_bar_small = jQuery("<div class=\"progress_bar_small\" state=\"unloaded\" style=\"width: 0%;\"></div>");
					this.progress_container.append(this.progress_bar_small);
					this.progress_bar_large = jQuery("<div class=\"progress_bar_large\" state=\"unloaded\" style=\"width: 0%;\"></div>");
					this.progress_container.append(this.progress_bar_large);
				this.zoom_box = jQuery("<canvas id=\"zoombox_canvas\" width=\"0\" height=\"0\" style=\"display: none;\"></canvas>");
				this.pictures.append(this.zoom_box);

			// these are the control buttons for the app
			this.controls = jQuery("<div class=\"controls\"></div>");
			this.main_box.append(this.controls);
				this.control_container_one = jQuery("<div class=\"control_container_center\" ></div>");
				this.controls.append(this.control_container_one);
					this.prev_btn = jQuery("<button id=\"prev_btn\" class=\"ctrl_buttons\" state=\"step\" disabled ></button>");
					this.control_container_one.append(this.prev_btn);
					this.play_btn = jQuery("<button id=\"play_btn\" class=\"ctrl_buttons\" state=\"play\" disabled ></button>");
					this.control_container_one.append(this.play_btn);
					this.next_btn = jQuery("<button id=\"next_btn\" class=\"ctrl_buttons\" disabled ></button>");
					this.control_container_one.append(this.next_btn);
					this.zoom_btn = jQuery("<button id=\"zoom_btn\" class=\"ctrl_buttons\" state=\"zoomin\" disabled ></button>");
					this.control_container_one.append(this.zoom_btn);
					this.size_btn = jQuery("<button id=\"size_btn\" class=\"ctrl_buttons\" state=\"fullpage\" disabled ></button>");
					this.control_container_one.append(this.size_btn);
				this.controls.append( jQuery("<div style=\"clear: both;\"></div>") );

			// these will store the image preloads
			this.image_cache_small = jQuery("<div class=\"image_cache_small\" style=\"display: none;\"></div>");
			this.main_box.append(this.image_cache_small);
			this.image_cache_large = jQuery("<div class=\"image_cache_large\" style=\"display: none;\"></div>");
			this.main_box.append(this.image_cache_large);

		// no errors (?)
		return true;
	};
	/**
	 *  @description This function reads filelists in order to parse them.
	 *  @param  {object} load_obj This is the loading object, whose filelist should be read. [this.small or this.large]
	 *  @return {mixed}           Returns true on success, a String on fail.
	 */
	ThrixtyPlayer.MainClass.prototype.read_filelist = function(load_obj){
		var root = this;

		var return_value = false;

		// get url
		var url = this.settings.basepath + load_obj.filepath;
		log(url);
		// execute AJAX request
		jQuery.ajax({
			async: false, // SYNCHRONOUS IS IMPORTANT! The gathered information is depending on each other.
			url: url,
			type: "get",
			dataType: "text",
			error: function(jQueryXHTMLresponse, textStatus, errorThrown){
				return_value = jQueryXHTMLresponse.status+": "+jQueryXHTMLresponse.statusText;
			},
			success: function(data, textStatus, jQueryXHTMLresponse){
				// parse data
				return_value = root.parse_filelist(load_obj, data);
			}
		});
		return return_value;
	};
	/**
	 *  @description This function parses filelists in order to cache them by generating new images.
	 *  @param  {object} load_obj This is the loading object, whose filelist will get parsed.
	 *  @param  {text} filelist This is the text, that was written in the filelist.
	 *  @return {boolean}         Returns true, when parsing was successful.
	 */
	ThrixtyPlayer.MainClass.prototype.parse_filelist = function(load_obj, filelist){
		// parse die liste aus und speichere die sources im array
		var image_paths = filelist.replace(/['"]/g,"").split(",");
		// loop through all paths
		var pic_count = image_paths.length;
		for( var i=0; i<pic_count; i++ ){
			// create new image object
			var new_image = {
				id: i,
				source: image_paths[i],
				jq_elem: jQuery("<img style=\"display: none;\" />"),
				elem_loaded: null,
				to_large: null,
			};
			// count object
			load_obj.images_count += 1;
			// assign object
			load_obj.images[i] = new_image;
		}

		// no errors (?)
		return true;
	};
	/**
	 *  @description This function assigns load events onto the images, to let images report their loading status.
	 *  @param {object} load_obj        This is the loading object, whose images gets the events.
	 */
	ThrixtyPlayer.MainClass.prototype.set_load_events = function(load_obj){
		var keys = Object.keys(load_obj.images);
		var len = keys.length;
		for( var i=0; i<len; i++ ){
			var current_elem = load_obj.images[i];
			current_elem.jq_elem.one("load error", [load_obj, current_elem], load_obj.load_event.bind(this) );
		}
	};
	/**
	 *  @description This function is being called on load of the small images.
	 *  @param  {object} load_event The Event, which triggered this function.
	 */
	ThrixtyPlayer.MainClass.prototype.small_onload_event = function(load_event){
		// This timeout will delay every load event execution by a quarter
		//   of a second.
		// This is done because of some browser executing the events before the
		//   images are properly loaded.
		setTimeout(function(){
			// get param values
			var params = load_event.data;
			var load_obj = params[0];
			var current_elem = params[1];

			// if this load was successful
			if( "load" == load_event.type ){
				// update object to success
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				// If this was the first image that was being loaded,
				if( null == load_obj.first_loaded_image_id ){
					// register it,
					load_obj.first_loaded_image_id = current_elem.id;

								// TODO: Dies in eine Funktion verpacken. Diese Programmlogik gehört hier eigentlich nicht hin.
								// set main_canvas dimensions to those of the first element
								// show and hide is being used because of reasons (the reasons are - what else could it be - Internet Explorer)
								current_elem.jq_elem.show();
								this.main_canvas[0].width = current_elem.jq_elem[0].naturalWidth;
								this.main_canvas[0].height = current_elem.jq_elem[0].naturalHeight;
								this.zoom_box[0].width = current_elem.jq_elem[0].naturalWidth;
								this.zoom_box[0].height = current_elem.jq_elem[0].naturalHeight;
								current_elem.jq_elem.hide();
								this.drawing_handler.canvas = this.main_canvas;

					// and give the dimensions to the drawing handler.
					this.drawing_handler.set_small_dimensions(current_elem.jq_elem);

					// The whole purpose of the following block is to make sure,
					//   that the starting image WILL be loaded.
					// Some current browser on fast computer are executing
					//   load-events too fast, even though the image itself
					//   is not drawable yet.
					var current_count = 0;
					var start_img_draw = function(){
						if( 5 > current_count && !this.isLoaded){
							// console.log("ich bin durchgang "+current_count);
							current_count += 1;

							// draw image to canvas
							this.drawing_handler.draw_current_image();

							// function calls itself after 0.5 seconds
							setTimeout(start_img_draw, 500);
						}
					}.bind(this);
					start_img_draw();
					// /end
				}

			// if this load errored
			} else {
				// update object to fail
				load_obj.images_errored += 1;
				current_elem.elem_loaded = false;
			}
			this.update_loading_state();
		}.bind(this).bind(load_event), 250);
	};
	/**
	 *  @description This function is being called on load of the large images.
	 *  @param  {event} load_event The Event, which triggered this function.
	 */
	ThrixtyPlayer.MainClass.prototype.large_onload_event = function(load_event){
		// This timeout will delay every load event execution by a quarter
		//   of a second.
		// This is done because of some browser executing the events before the
		//   images are properly loaded.
		setTimeout(function(){
			// get param values
			var params = load_event.data;
			var load_obj = params[0];
			var current_elem = params[1];

			// if this load was successful
			if( "load" == load_event.type ){
				// update object to success
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				// If this was the first image that was being loaded,
				if( null == load_obj.first_loaded_image_id ){
					// register it,
					load_obj.first_loaded_image_id = current_elem.id;
					// and give the dimensions to the drawing handler.
					this.drawing_handler.set_large_dimensions(current_elem.jq_elem);
				}

				// When this image is current, redraw the current image.
				// This large image is likely to be drawn in zoom.
				if( current_elem.id == this.large.active_image_id ){
					this.drawing_handler.draw_current_image();
				}

			// if this load errored
			} else {
				// update object to fail
				load_obj.images_errored += 1;
				current_elem.elem_loaded = false;
			}
			this.update_loading_state();
		}.bind(this).bind(load_event), 250);
	};



	/**
	 *  @description This function starts the loading of all images of this object into this container.<br>(used on the small images at the start)
	 *  @param  {[type]} load_obj         [description]
	 *  @param  {[type]} target_container [description]
	 *  @return {[type]}                  [description]
	 */
	ThrixtyPlayer.MainClass.prototype.load_all_images = function(load_obj, target_container){
		// load all images by loading each one individually
		var keys = Object.keys(load_obj.images);
		var len = keys.length;
		for( var i=0; i<len; i++ ){
			var current_elem = load_obj.images[i];
			this.load_one_image(current_elem, target_container);
		}
	};
	/**
	 *  @description This function starts the loading of this image into this container.<br>(used on the large images when being loaded one after the other)
	 */
	ThrixtyPlayer.MainClass.prototype.load_one_image = function(img_obj, target_container){
		// set this element to not loaded, assign the src and append it to the image container.
		img_obj.elem_loaded = false;
		img_obj.jq_elem.attr("src", img_obj.source);
		target_container.append(img_obj.jq_elem);
	};
	/**
	 *  @description This function manages the loading state of the Player.<br>Functionality is enabled and disabled automatically here.
	 */
	ThrixtyPlayer.MainClass.prototype.update_loading_state = function(){
		// small images progress bar
		var small_loaded_percentage = ( (this.small.images_loaded+this.small.images_errored) / this.small.images_count);
		if( 1 <= small_loaded_percentage ){
			this.small.is_loaded = true;
		}
		this.refresh_progress(this.progress_bar_small, small_loaded_percentage);

		// large images progress bar
		var large_loaded_percentage = ( (this.large.images_loaded+this.large.images_errored) / this.large.images_count);
		if( 1 <= large_loaded_percentage ){
			this.large.is_loaded = true;
		}
		this.refresh_progress(this.progress_bar_large, large_loaded_percentage);
		// TODO: Diesen oberen Teil überdenken - Wofür wird (noch) ein Ladezustand benötigt?




		// TODO: diesen Kernteil hier lassen, den Rest auslagern.

		//    loaded?    | Behaviour:
		// small | large |
		//   /   |   /   | Disable all GUI elements.
		//   X   |   /   | Enable GUI.
		//   X   |   X   | ***relic***

		// Disable all GUI elements.
		if( !this.small.is_loaded && !this.large.is_loaded ){
			if( "loading" != this.loading_state ){
				this.size_btn.prop('disabled', true);
				this.prev_btn.prop('disabled', true);
				this.play_btn.prop('disabled', true);
				this.next_btn.prop('disabled', true);
				this.zoom_btn.prop('disabled', true);
				this.loading_state = "loading";
				log("zustandswechsel zu: loading");
			}
		}
		// Enable GUI.
		if( this.small.is_loaded && !this.large.is_loaded ){
			if( "playable" != this.loading_state ){
				this.size_btn.prop('disabled', false);
				this.prev_btn.prop('disabled', false);
				this.play_btn.prop('disabled', false);
				this.next_btn.prop('disabled', false);
				this.zoom_btn.prop('disabled', false);
				this.loading_state = "playable";
				log("zustandswechsel zu: playable");
				this.all_images_loaded();
			}
		}
		// ???relic???
		if( this.small.is_loaded && this.large.is_loaded ){
			if( "done" != this.loading_state ){
				this.loading_state = "done";
				log("zustandswechsel zu: done");
			}
		}
	};
	/**
	 *  @description This function updates the HTML representation of the loading progress.
	 *  @param  {jq-object} progress_bar The jQuery Object to the Progress Bar.
	 *  @param  {Integer} percentage   How much is done loading?
	 */
	ThrixtyPlayer.MainClass.prototype.refresh_progress = function(progress_bar, percentage){

		// NaN or negative   (-n...0)
		if( isNaN(percentage) || 0 >= percentage ){
			progress_bar.attr("state", "unloaded");
			progress_bar.css("width", "0%");

		// under 100%        (0,01...0,99)
		} else if( 1 > percentage ){
			progress_bar.attr("state", "loading");
			progress_bar.css("width", (percentage * 100)+"%");

		// over 100%         (1...n)
		} else if( 1 <= percentage ){
			progress_bar.attr("state", "loaded");
			progress_bar.css("width", "100%");
		}
	};
	/**
	 *  @description This function is called, when all base images are loaded.
	 */
	ThrixtyPlayer.MainClass.prototype.all_images_loaded = function(){
		// start rotation for startup.
		this.start_rotation();
	};





	/**
	 *  @description This function starts the rotation.
	 */
	ThrixtyPlayer.MainClass.prototype.start_rotation = function(){
		var root = this;

		var delay = 10;

		// stop possible rotation
		this.stop_rotation();

		// set rotation params
		this.is_rotating = true;
		// set play/pause btn to play
		this.play_btn.attr('state', 'pause')

		// define repeating function
		if( 0 < this.rotation_direction ){ // forward
			var rotation_func = function(){
				root.nextImage();
			};
		} else if( 0 > this.rotation_direction ){ // backward
			var rotation_func = function(){
				root.previousImage();
			};
		}

		// calculate delay
		if( this.is_zoomed ){
			delay = 1000 / this.large.frequency;
		} else {
			delay = 1000 / this.small.frequency;
		}

		// first call same function for no execution delay
		rotation_func();
		// start interval
		this.interval_id = setInterval(rotation_func, delay);
	};
	/**
	 *  @description This function stops the rotation.
	 */
	ThrixtyPlayer.MainClass.prototype.stop_rotation = function(){
		if( this.is_rotating ){
			this.is_rotating = false;
			this.play_btn.attr('state', 'play');
			// end animation by stopping the interval
			clearInterval(this.interval_id);
			this.interval_id = 0;
		} else {
			// ignore
		}
	};
	/**
	 *  @description Toggle between start and stop rotation.
	 */
	ThrixtyPlayer.MainClass.prototype.toggle_rotation = function(){
		if( this.is_rotating ){
			this.stop_rotation();
		} else {
			this.start_rotation();
		}
	};





	/**
	 *  @description This function rotates the object until the given distance is travelled.
	 *  @param  {Integer} distance_x The distance in x dimension, how far the mouse travelled from its starting position.
	 */
	ThrixtyPlayer.MainClass.prototype.distance_rotation = function(distance_x){
		// The given distance in x dimension tells, how much the mouse travelled away from the starting point of this click cycle.
		// It DOES NOT tell how much distance was travelled since the last incantation of this function!





		// keep track of done turns.
		var current_turns = this.turned_x;

		// Pixel per Degree (Application Parameter): The cursor needs to travel 2 pixel, to turn the object by 1 degree.  =>  2px/1°
		var pixel_per_degree = 2;


				if( this.is_zoomed ){
					// Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/72img = 5°/img
					var degree_per_image = 360/this.large.images_count;//360°/n*img
				} else {
					// Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/72img = 5°/img
					var degree_per_image = 360/this.small.images_count;//360°/n*img
				}


		// Pixel per Image: How many pixel the cursor needs to travel, to show the next image. Example:  5°/img * 2px/°  <=>  5*2px / img  <=> 10px/img
		var pixel_per_image = pixel_per_degree * degree_per_image;

		// wanted_turns is the amount of steps to make.
		// f(x) = x / a;
		// The offset "+ a/2" is for defining the starting click position as being the middle, so from that position one need to travel 5 px to left or right to switch to the next image.
		// f(x) =  ( x + a/2 ) / a;
		//     <=> ( x/a + 0.5 );
		var wanted_turns = Math.floor( distance_x/pixel_per_image + 0.5);

		// reassign value ASAP to "release" it for the next event
		this.turned_x = wanted_turns;

		// When swiping to the right, the number of turns_to_do is a positive number.
		//   Though, a swipe to the right means "turn backwards"!
		//   Hence the calculated turns_to_do are to be inverted:
		// (wanted_turns - current_turns)*-1  ===  current_turns - wanted_turns  [!!!]
		var turns_to_do = current_turns - wanted_turns;


				if( this.is_zoomed ){
					this.change_active_image_id(this.large, turns_to_do);
					// assign large to small
					this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
				} else {
					this.change_active_image_id(this.small, turns_to_do);
					// assign small to large
					this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
				}


		// update View
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function is rendering the next Image.
	 */
	ThrixtyPlayer.MainClass.prototype.nextImage = function(){
		if( this.is_zoomed ){
			this.change_active_image_id(this.large, 1);
			// assign small
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, 1);
			// assign large
			this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
		}
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function is rendering the previous Image.
	 */
	ThrixtyPlayer.MainClass.prototype.previousImage = function(){
		if( this.is_zoomed ){
			this.change_active_image_id(this.large, -1);
			// assign small
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, -1);
			// assign large
			this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
		}
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function changes the load_object's active_image_id by the specified amount.<br>Only values from 0 to images_count-1 gets assigned.
	 */
	ThrixtyPlayer.MainClass.prototype.change_active_image_id = function(load_obj, amount){

		// The given amount is multiplicated with the BASE direction, so whichever base direction is used, it will still be treated as "forward".
		amount = amount * this.settings.direction;

		var id = load_obj.active_image_id;
		var count = load_obj.images_count;

		id = (id + amount) % count;

		if( 0 > id ){
			id = id + count;
		}
		load_obj.active_image_id = id;
	};






	/**
	 *  @description This function switches the player over to the zoom state.
	 */
	ThrixtyPlayer.MainClass.prototype.start_zoom = function(){
		this.is_zoomed = true;
		this.zoom_btn.attr('state', 'zoomout');
		var zoom_mode = this.settings.zoom_mode;
		// versuch, outbox probleme zu fixen...

		// simulate zoom start at the center of the canvas
		var click_x = this.main_canvas.offset().left + ( this.main_canvas.width() / 2 );
		var click_y = this.main_canvas.offset().top + ( this.main_canvas.height() / 2 );
		this.drawing_handler.set_mouseposition(click_x, click_y);
		this.drawing_handler.draw_current_image();


		switch( zoom_mode ){
			case "outbox_top":
				if( !this.is_fullscreen ){
					// make the box visible on top
					this.set_outbox_top();
					break;
				} // else: Fallthrough to Default
			case "outbox_right":
				if( !this.is_fullscreen ){
					// make the box visible on the right
					this.set_outbox_right();
					break;
				} // else: Fallthrough to Default
			case "outbox_bottom":
				if( !this.is_fullscreen ){
					// make the box visible on the bottom
					this.set_outbox_bottom();
					break;
				} // else: Fallthrough to Default
			case "outbox_left":
				if( !this.is_fullscreen ){
					// make the box visible on the left
					this.set_outbox_left();
					break;
				} // else: Fallthrough to Default
			default:
				// make the box invisible
				this.zoom_box.hide();
				break;
		}
	};
	/**
	 *  @description This function switches the player back to the unzoomed state.
	 */
	ThrixtyPlayer.MainClass.prototype.stop_zoom = function(){
		// turn off zoom
		this.is_zoomed = false;
		this.zoom_btn.attr('state', 'zoomin');

		// hide zoombox
		this.zoom_box.hide();
		// draw unzoomed picture
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description Toggles between zoomed and unzoomed state.
	 */
	ThrixtyPlayer.MainClass.prototype.toggle_zoom = function(){
		if( this.is_zoomed ){
			this.stop_zoom();
			// if already rotating, refresh rotation frequency
			if( this.is_rotating ){
				this.start_rotation();
			}
		} else {
			this.stop_rotation();
			this.start_zoom();
			// // if already rotating, refresh rotation frequency
			// if( this.is_rotating ){
			// 	this.start_rotation();
			// }
		}
	};
	/**
	 *  @description This function is adjusting offset values for DrawingHandler.<br>It is being called by those functions that are making it possible to move the zoomed cutout.
	 */
	ThrixtyPlayer.MainClass.prototype.move_zoom = function(current_x, current_y){
		this.drawing_handler.set_mouseposition(current_x, current_y);
		this.drawing_handler.draw_current_image();
	};





	/**
	 *  @description This function displays the zoomed box at the top of the canvas.
	 */
	ThrixtyPlayer.MainClass.prototype.set_outbox_top = function(){
		this.zoom_box.show();
		var main_canvas = this.get_main_canvas_dimensions();

		// set outbox canvas koordinates
		this.zoom_box.css('top', main_canvas.h * -1);
		this.zoom_box.css('left', 0 );
		this.zoom_box.height( main_canvas.h );
		this.zoom_box.width( main_canvas.w );
	};
	/**
	 *  @description This function displays the zoomed box at the right of the canvas.
	 */
	ThrixtyPlayer.MainClass.prototype.set_outbox_right = function(){
		this.zoom_box.show();
		var main_canvas = this.get_main_canvas_dimensions();

		// set outbox canvas koordinates
		this.zoom_box.css('top', 0);
		this.zoom_box.css('left', main_canvas.w );
		this.zoom_box.height( main_canvas.h );
		this.zoom_box.width( main_canvas.w );
	};
	/**
	 *  @description This function displays the zoomed box at the bottom of the canvas.
	 */
	ThrixtyPlayer.MainClass.prototype.set_outbox_bottom = function(){
		this.zoom_box.show();
		var main_canvas = this.get_main_canvas_dimensions();

		// set outbox canvas koordinates
		this.zoom_box.css('top', main_canvas.h );
		this.zoom_box.css('left', 0 );
		this.zoom_box.height( main_canvas.h );
		this.zoom_box.width( main_canvas.w );
	};
	/**
	 *  @description This function displays the zoomed box at the left of the canvas.
	 */
	ThrixtyPlayer.MainClass.prototype.set_outbox_left = function(){
		this.zoom_box.show();
		var main_canvas = this.get_main_canvas_dimensions();

		// set outbox canvas koordinates
		this.zoom_box.css('top', 0);
		this.zoom_box.css('left', main_canvas.w * -1 );
		this.zoom_box.height( main_canvas.h );
		this.zoom_box.width( main_canvas.w );
	};





	/**
	 *  @description This function adjusts the canvas to a full page size.
	 */
	ThrixtyPlayer.MainClass.prototype.enter_fullpage = function(){

		this.size_btn.attr('state', 'normalsize');
		this.is_fullscreen = true;

		this.stop_zoom();

		this.main_box.css('position', 'fixed');
		this.main_box.css('top', '5px');
		this.main_box.css('right', '5px');
		this.main_box.css('bottom', '5px');
		this.main_box.css('left', '5px');
		this.main_box.css('background', 'white');
		this.main_box.css('z-index', '9999');
		this.pictures.css('height', 'calc(100% - '+this.controls.outerHeight()+'px)');
	};
	/**
	 *  @description This function reverts the fullpage sized canvas to a normal size.
	 */
	ThrixtyPlayer.MainClass.prototype.quit_fullpage = function(){

		this.size_btn.attr('state', 'fullpage');
		this.is_fullscreen = false;

		this.stop_zoom();

		this.main_box.css('position', '');
		this.main_box.css('top', '');
		this.main_box.css('right', '');
		this.main_box.css('bottom', '');
		this.main_box.css('left', '');
		this.main_box.css('background', '');
		this.main_box.css('z-index', '');
		this.pictures.css('height', '');
	};
	/**
	 *  @description Toggles between fullpage size and normal size.
	 */
	ThrixtyPlayer.MainClass.prototype.toggle_fullscreen = function(){
		if( this.is_fullscreen ){
			this.quit_fullpage();
		} else {
			this.enter_fullpage();
		}
	};





	//// GETTER AND SETTER
		/**
		 *  @description This function sets the image offsets to their values.<br>It is telling the Player how to transition between small and large images.
		 */
		ThrixtyPlayer.MainClass.prototype.set_image_offsets = function(){
			// get values
			var small_images_count = this.small.images_count;
			var large_images_count = this.large.images_count;

			// get proportion
			var small_to_large = small_images_count/large_images_count;
			var large_to_small = large_images_count/small_images_count;

			// set small image offset
			for( var i=0; i<small_images_count; i++ ){
				this.small.images[i].to_large = Math.round(i/small_to_large);
			}

			// set large image offset
			for( var i=0; i<large_images_count; i++ ){
				this.large.images[i].to_small = Math.round(i/large_to_small);
			}
		};
		/**
		 *  @description This function sets the base frequencies of the image objects.<br>The frequencies are different, when there are different amounts of images.
		 */
		ThrixtyPlayer.MainClass.prototype.set_image_frequencies = function(){
			// frequency
			this.small.frequency = Math.ceil(this.small.images_count / this.settings.seconds_per_turn);
			this.large.frequency = Math.ceil(this.large.images_count / this.settings.seconds_per_turn);
		};
		/**
		 *  @description This function sets the rotation direction for the player.
		 *  @param {String} direction "default", "fw" or "bw"
		 */
		ThrixtyPlayer.MainClass.prototype.set_rotation_direction = function(direction){
			if( "default" == direction ){
				this.rotation_direction = this.settings.direction;
			} else if( "fw" == direction || 1 == direction ){
				this.rotation_direction = 1; // current direction: forward
			} else if( "bw" == direction || -1 == direction ){
				this.rotation_direction = -1; // current direction: backward
			}
		};
		/**
		 *  @description This function returns HTML-Object of the current small image.
		 *  @return {DOM} image Returns the small image which the active_image_id is pointing to.
		 */
		ThrixtyPlayer.MainClass.prototype.get_current_small_image = function(){
			// get and return the small image
			return this.small.images[this.small.active_image_id].jq_elem[0];
		};
		/**
		 *  @description This function returns HTML-Object of the current large image.<br>In case, that big one wasnt loaded yet, the small one is returned.
		 *  @return {DOM} image Returns the large image, which the active_image_id is pointing to.<br>If that image is not loaded, the small variant will get returned.
		 */
		ThrixtyPlayer.MainClass.prototype.get_current_large_image = function(){
			// get images (small for fallback)
			var base_small = this.small.images[this.small.active_image_id];
			var base_large = this.large.images[this.large.active_image_id];

			// if the large one is already loaded, return it
			if( true === base_large.elem_loaded ){
				return base_large.jq_elem[0];
			}

			// request the large picture, that should have been loaded now
			if( null === base_large.elem_loaded ){
				this.load_one_image(this.large.images[this.large.active_image_id], this.image_cache_large);
			}

			// the large one isnt yet loaded, so fall back to the small one
			return base_small.jq_elem[0];
		};
		/**
		 *  @description This function returns the dimensions of the main canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_main_canvas_dimensions = function(){
			return {
				x: this.main_canvas.offset().left,
				y: this.main_canvas.offset().top,
				w: this.main_canvas.width(),
				h: this.main_canvas.height(),
				context: this.main_canvas[0].getContext("2d"),
			}
		};
		/**
		 *  @description This function returns the dimensions of the outbox zoom canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_zoom_canvas_dimensions = function(){
			return {
				x: this.zoom_box.offset().left,
				y: this.zoom_box.offset().top,
				w: this.zoom_box.width(),
				h: this.zoom_box.height(),
				context: this.zoom_box[0].getContext("2d"),
			}
		};
	// /GETTER AND SETTER END


})(jQuery_2_1_3);
/* /thrixty_main_class.js */