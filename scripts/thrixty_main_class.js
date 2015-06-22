/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.3
 *  @license GPLv3
 *  @module ThrixtyPlayer.MainClass
 */
;(function(jQuery){

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
	ThrixtyPlayer.MainClass = function(selector, playerpath){
		// Player Identity
		this.selector = selector;
		this.playerpath = playerpath;



		this.DOM_obj = {
			main_box: this.selector,
				showroom: jQuery("<div class=\"showroom\"></div>"),
					bg_canvas: jQuery("<canvas id=\"bg_canvas\" class=\"canvas\" width=\"0\" height=\"0\"></canvas>"),
					main_canvas: jQuery("<canvas id=\"main_canvas\" class=\"canvas\" width=\"0\" height=\"0\"></canvas>"),
					minimap_canvas: jQuery("<canvas id=\"minimap_canvas\" class=\"canvas\" width=\"0\" height=\"0\" style=\"display:none;\"></canvas>"),
					marker: jQuery("<div id=\"marker\" style=\"display:none;\"></div>"),
					progress_container: jQuery("<div class=\"progress_container\" ></div>"),
						progress_bar_small: jQuery("<div class=\"progress_bar_small\" state=\"unloaded\" style=\"width: 0%;\"></div>"),
						progress_bar_large: jQuery("<div class=\"progress_bar_large\" state=\"unloaded\" style=\"width: 0%;\"></div>"),
				controls: jQuery("<div class=\"controls\"></div>"),
					control_container_one: jQuery("<div class=\"control_container_center\" ></div>"),
						prev_btn: jQuery("<button id=\"prev_btn\" class=\"ctrl_buttons\" state=\"step\" disabled ></button>"),
						play_btn: jQuery("<button id=\"play_btn\" class=\"ctrl_buttons\" state=\"play\" disabled ></button>"),
						next_btn: jQuery("<button id=\"next_btn\" class=\"ctrl_buttons\" disabled ></button>"),
						zoom_btn: jQuery("<button id=\"zoom_btn\" class=\"ctrl_buttons\" state=\"zoomin\" disabled ></button>"),
						size_btn: jQuery("<button id=\"size_btn\" class=\"ctrl_buttons\" state=\"fullpage\" disabled ></button>"),
				zoom_canvas: jQuery("<canvas id=\"zoom_canvas\" width=\"0\" height=\"0\" style=\"display: none;\"></canvas>"),
				controls_cache: jQuery("<div class=\"controls_cache\" style=\"display: none;\"></div>"),
				image_cache_small: jQuery("<div class=\"image_cache_small\" style=\"display: none;\"></div>"),
				image_cache_large: jQuery("<div class=\"image_cache_large\" style=\"display: none;\"></div>"),
		}


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
			zoom_mode: "inbox",
			zoom_control: "progressive",
			outbox_position: "right",
			position_indicator: "minimap",
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
		if( small_fl_read !== true ){
			throw new Error("The Base Filelist Wasn't Loaded.\n"+small_fl_read);
			return false;
		}
		var large_fl_read = this.read_filelist(this.large);
		if( large_fl_read !== true ){
			throw new Error("The Zoom Filelist Wasn't Loaded.\n"+large_fl_read);
			return false;
		}

		// build the player
		this.build_html_structure();

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
		this.load_all_images(this.small, this.DOM_obj.image_cache_small);
		// preload first image (for sizing purposes)
		this.load_one_image(this.large.images[0], this.DOM_obj.image_cache_large);
	};

	/**
	 *  @description This function gets the options defined as HTML attributes.<br>To create new options, register them here.
	 */
	ThrixtyPlayer.MainClass.prototype.parse_settings = function (){
		// loop through all attributes to get option values
		var main_box_attributes = this.DOM_obj.main_box[0].attributes;
		var main_box_attr_count = main_box_attributes.length;
		for( var i=0; i<main_box_attr_count; i++ ){
			var attr = main_box_attributes[i];
			switch( attr.name ){
				case "thrixty-basepath":
					if( attr.value != "" ){
						this.settings.basepath = String(attr.value);
					}
					break;
				case "thrixty-direction":
					if( attr.value == "1" || attr.value == "forward" ){
						this.settings.direction = 1;
					} else if( attr.value == "-1" || attr.value == "backward" ){
						this.settings.direction = -1;
					}
					break;
				case "thrixty-filelist-path-small":
					if( attr.value != "" ){
						this.small.filepath = String(attr.value);
					}
					break;
				case "thrixty-filelist-path-large":
					if( attr.value != "" ){
						this.large.filepath = String(attr.value);
					}
					break;
				case "thrixty-seconds-per-turn":
					if( attr.value != "" ){
						this.settings.seconds_per_turn = parseInt(attr.value);
					}
					break;
				case "thrixty-sensitivity-x":
					if( attr.value != "" ){
						this.settings.sensitivity_x = parseInt(attr.value);
					}
					break;
				case "thrixty-sensitivity-y":
					if( attr.value != "" ){
						this.settings.sensitivity_y = parseInt(attr.value);
					}
					break;
				case "thrixty-zoom-mode":
					// proper values:  -inbox -outbox -none(|empty)
					if( attr.value == "inbox" ){
						this.settings.zoom_mode = "inbox";
					} else if( attr.value == "outbox" ){
						this.settings.zoom_mode = "outbox";
					// TODO; dies muss noch benutzt werden...
					} else if( attr.value == "none" || attr.value == "" ){
						this.settings.zoom_mode = "";
					}
					break;
				case "thrixty-zoom-control":
					if( attr.value == "classic" ){
						this.settings.zoom_control = "classic";
					} else {
						this.settings.zoom_control = "progressive";
					}
					break;
				case "thrixty-outbox-position":
					// proper value: -right -left -top -bottom
					if( attr.value == "right" ){
						this.settings.outbox_position = "right";
					} else if( attr.value == "left" ){
						this.settings.outbox_position = "left";
					} else if( attr.value == "top" ){
						this.settings.outbox_position = "top";
					} else if( attr.value == "bottom" ){
						this.settings.outbox_position = "bottom";
					}
					break;
				case "thrixty-position-indicator":
					// proper values: -minimap -marker -none(|empty)
					if( attr.value == "minimap" ){
						this.settings.position_indicator = "minimap";
					} else if( attr.value == "marker" ){
						this.settings.position_indicator = "marker";
					} else if( attr.value == "none" || attr.value == "" ){
						this.settings.position_indicator = "";
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
	ThrixtyPlayer.MainClass.prototype.build_html_structure = function(){
		// this is the main part of the player - image show area
		this.DOM_obj.main_box.attr("tabindex", "0");
		this.DOM_obj.main_box.css("outline", "none");
			this.DOM_obj.main_box.append(this.DOM_obj.showroom);
				this.DOM_obj.showroom.append(this.DOM_obj.bg_canvas);
				this.DOM_obj.showroom.append(this.DOM_obj.main_canvas);
				this.DOM_obj.showroom.append(this.DOM_obj.minimap_canvas);
				this.DOM_obj.showroom.append(this.DOM_obj.marker);
				this.DOM_obj.showroom.append(this.DOM_obj.progress_container);
					this.DOM_obj.progress_container.append(this.DOM_obj.progress_bar_small);
					this.DOM_obj.progress_container.append(this.DOM_obj.progress_bar_large);

			// these are the control buttons for the app
			this.DOM_obj.main_box.append(this.DOM_obj.controls);
				this.DOM_obj.controls.append(this.DOM_obj.control_container_one);
					this.DOM_obj.control_container_one.append(this.DOM_obj.prev_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.play_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.next_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.zoom_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.size_btn);
				this.DOM_obj.controls.append( jQuery("<div style=\"clear: both;\"></div>") );

			// Zoom Box for Outbox Zoom (invisible on stadard)
			this.DOM_obj.main_box.append(this.DOM_obj.zoom_canvas);

			// these will store the image preloads
			// this.DOM_obj.main_box.append(this.DOM_obj.controls_cache);
				// cache control icons
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/expand.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/pause.svg\">")       );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/plus.svg\">")        );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/vorwaertz.svg\">")   );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/expand_w.svg\">")    );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/pause_w.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/plus_w.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/vorwaertz_w.svg\">") );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/minus.svg\">")       );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/play.svg\">")        );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/shrink.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/zurueck.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/minus_w.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/play_w.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/shrink_w.svg\">")    );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+this.playerpath+"style/images/zurueck_w.svg\">")   );
			this.DOM_obj.main_box.append(this.DOM_obj.image_cache_small);
			// this.DOM_obj.main_box.append(this.DOM_obj.image_cache_large);

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
	// ThrixtyPlayer.MainClass.prototype.set_ = function(){}
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

			log(load_event.type);

			// if this load was successful
			if( load_event.type == "load" ){
				// update object to success
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				// If this was the first image that was being loaded,
				if( load_obj.first_loaded_image_id == null ){
					// register it,
					load_obj.first_loaded_image_id = current_elem.id;

							var vogl = function(){
								// TODO: Dies in eine Funktion verpacken. Diese Programmlogik gehört hier eigentlich nicht hin.
								// set main_canvas dimensions to those of the first element
								// show and hide is being used because of reasons (the reasons are - what else could it be - Internet Explorer)
								current_elem.jq_elem.show();

								// background
								this.DOM_obj.bg_canvas[0].width = current_elem.jq_elem[0].naturalWidth;
								this.DOM_obj.bg_canvas[0].height = current_elem.jq_elem[0].naturalHeight;

								// main
								this.DOM_obj.main_canvas[0].width = current_elem.jq_elem[0].naturalWidth;
								this.DOM_obj.main_canvas[0].height = current_elem.jq_elem[0].naturalHeight;
									// set drawing handlers canvas to main canvas
									this.drawing_handler.canvas = this.DOM_obj.main_canvas;

								// minimap
								this.DOM_obj.minimap_canvas[0].width = current_elem.jq_elem[0].naturalWidth;
								this.DOM_obj.minimap_canvas[0].height = current_elem.jq_elem[0].naturalHeight;

								// zoom box
								this.DOM_obj.zoom_canvas[0].width = current_elem.jq_elem[0].naturalWidth;
								this.DOM_obj.zoom_canvas[0].height = current_elem.jq_elem[0].naturalHeight;

								current_elem.jq_elem.hide();
							}.bind(this);

					// and give the dimensions to the drawing handler.
					this.drawing_handler.set_small_image_size(current_elem.jq_elem);
					// calc dimension ratio
					this.drawing_handler.calculate_image_size_ratio();

					// The whole purpose of the following block is to make sure,
					//   that the starting image WILL be loaded.
					// Some current browser on fast computer are executing
					//   load-events too fast, even though the image itself
					//   is not drawable yet.
					var current_count = 0;
					var start_img_draw = function(){
						if( current_count < 5 && !this.isLoaded){
							// console.log("ich bin durchgang "+current_count);
							current_count += 1;

							vogl();

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
			if( load_event.type == "load" ){
				// update object to success
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				// If this was the first image that was being loaded,
				if( load_obj.first_loaded_image_id == null ){
					// register it,
					load_obj.first_loaded_image_id = current_elem.id;
					// and give the dimensions to the drawing handler.
					this.drawing_handler.set_large_image_size(current_elem.jq_elem);
					// calc imension ratio
					this.drawing_handler.calculate_image_size_ratio();
				}

				// When this image is current, redraw the current image.
				// This large image is likely to be drawn in zoom.
				if( this.large.active_image_id == current_elem.id ){
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
		if( small_loaded_percentage >= 1 ){
			this.small.is_loaded = true;
		}
		this.refresh_progress(this.DOM_obj.progress_bar_small, small_loaded_percentage);

		// large images progress bar
		var large_loaded_percentage = ( (this.large.images_loaded+this.large.images_errored) / this.large.images_count);
		if( large_loaded_percentage >= 1 ){
			this.large.is_loaded = true;
		}
		this.refresh_progress(this.DOM_obj.progress_bar_large, large_loaded_percentage);
		// TODO: Diesen oberen Teil überdenken - Wofür wird (noch) ein Ladezustand benötigt?




		// TODO: diesen Kernteil hier lassen, den Rest auslagern.

		//    loaded?    | Behaviour:
		// small | large |
		//   /   |   /   | Disable all GUI elements.
		//   X   |   /   | Enable GUI.
		//   X   |   X   | ***relic***

		// Disable all GUI elements.
		if( !this.small.is_loaded && !this.large.is_loaded ){
			if( this.loading_state != "loading" ){
				this.loading_state = "loading";
				this.DOM_obj.size_btn.prop('disabled', true);
				this.DOM_obj.prev_btn.prop('disabled', true);
				this.DOM_obj.play_btn.prop('disabled', true);
				this.DOM_obj.next_btn.prop('disabled', true);
				this.DOM_obj.zoom_btn.prop('disabled', true);
			}
		}
		// Enable GUI.
		if( this.small.is_loaded && !this.large.is_loaded ){
			if( this.loading_state != "playable" ){
				this.loading_state = "playable";
				this.DOM_obj.size_btn.prop('disabled', false);
				this.DOM_obj.prev_btn.prop('disabled', false);
				this.DOM_obj.play_btn.prop('disabled', false);
				this.DOM_obj.next_btn.prop('disabled', false);
				this.DOM_obj.zoom_btn.prop('disabled', false);
				this.all_images_loaded();
			}
		}
		// ???relic???
		if( this.small.is_loaded && this.large.is_loaded ){
			if( this.loading_state != "done" ){
				this.loading_state = "done";
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
		if( isNaN(percentage) || percentage <= 0 ){
			progress_bar.attr("state", "unloaded");
			progress_bar.css("width", "0%");

		// under 100%        (0,01...0,99)
		} else if( percentage < 1 ){
			progress_bar.attr("state", "loading");
			progress_bar.css("width", (percentage * 100)+"%");

		// over 100%         (1...n)
		} else if( percentage >= 1 ){
			progress_bar.attr("state", "loaded");
			progress_bar.css("width", "100%");
		}
	};
	/**
	 *  @description This function is called, when all base images are loaded.
	 */
	ThrixtyPlayer.MainClass.prototype.all_images_loaded = function(){
		// start rotation for startup.
		// autostart / autoplay
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
		this.DOM_obj.play_btn.attr('state', 'pause')

		// define repeating function
		if( this.rotation_direction > 0 ){ // forward
			var rotation_func = function(){
				root.nextImage();
			};
		} else if( this.rotation_direction < 0 ){ // backward
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
			this.DOM_obj.play_btn.attr('state', 'play');
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
		// mache umdrehungen anhand des distance_x mit einer bestimmten übersetzung

		// Pixel per Degree (Application Parameter): The cursor needs to travel 2 pixel, to turn the object by 1 degree.  =>  2px/1° => 720px/360°
		var pixel_per_degree = 2;

		if( this.is_zoomed ){
			// Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/72img = 5°/img
			var degree_per_image = 360/this.large.images_count;//360°/n*img
		} else {
			// Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/12img = 30°/img
			var degree_per_image = 360/this.small.images_count;//360°/n*img
		}

		// Pixel per Image: How many pixel the cursor needs to travel, to show the next image. Example:  5°/img * 2px/°  <=>  5*2px / img  <=> 10px/img
		var pixel_per_image = pixel_per_degree * degree_per_image;


		var rest_distanz = ( distance_x % pixel_per_image );

		var anzahl_nextimages = ( distance_x - rest_distanz ) / pixel_per_image;


		// the basic movement is backwards, so invert the value
		anzahl_nextimages = anzahl_nextimages * -1;

		//
		if( this.is_zoomed ){
			this.change_active_image_id(this.large, anzahl_nextimages);
			// assign large to small
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, anzahl_nextimages);
			// assign small to large
			this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
		}

		// update View
		this.drawing_handler.draw_current_image();

		return rest_distanz;
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

		// log(this.settings.direction);


		// The given amount is multiplicated with the BASE direction, so whichever base direction is used, it will still be treated as "forward".
		amount = amount * this.settings.direction;

		var id = load_obj.active_image_id;
		var count = load_obj.images_count;

		id = (id + amount) % count;

		if( id < 0 ){
			id = id + count;
		}
		load_obj.active_image_id = id;
	};






	/**
	 *  @description This function switches the player over to the zoom state.
	 */
	ThrixtyPlayer.MainClass.prototype.start_zoom = function(){
		// set zoom flag
		this.is_zoomed = true;

		// do main_class's part of start_zoom routine:
			// set zoom button to zoomout
			this.DOM_obj.zoom_btn.attr('state', 'zoomout');

			// simulate zoom start at the center of the canvas
			var click_x = this.DOM_obj.main_canvas.offset().left + ( this.DOM_obj.main_canvas.width() / 2 );
			var click_y = this.DOM_obj.main_canvas.offset().top + ( this.DOM_obj.main_canvas.height() / 2 );
			this.drawing_handler.set_absolute_mouseposition(click_x, click_y);

			// check for position indicator wanted (for example a minimap)
			if( this.settings.position_indicator == "minimap" ){
				this.DOM_obj.minimap_canvas.show();
			} else if( this.settings.position_indicator == "marker" ){
				this.DOM_obj.minimap_canvas.show();
				this.DOM_obj.marker.show();
			}

			// if zoom mode is outbox and not in fullscreen mode
			if( this.settings.zoom_mode == "outbox" && !this.is_fullscreen ){
				this.setup_outbox();
			}

			// draw current picture
			this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function switches the player back to the unzoomed state.
	 */
	ThrixtyPlayer.MainClass.prototype.stop_zoom = function(){
		// turn off zoom
		this.is_zoomed = false;
		this.DOM_obj.zoom_btn.attr('state', 'zoomin');

		// hide zoombox
		this.DOM_obj.zoom_canvas.hide();
		// hide minimap_box
		this.DOM_obj.minimap_canvas.hide();
		// hide marker
		this.DOM_obj.marker.hide();
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
	 * @description blabla
	 */
	ThrixtyPlayer.MainClass.prototype.setup_outbox = function(){
		// show zoom box at the selected position
		this.DOM_obj.zoom_canvas.show();

		// get main_canvas info
		var main_canvas = this.get_main_canvas_dimensions();

		// set zoom_canvas width
		this.DOM_obj.zoom_canvas[0].height = main_canvas.draw_h;
		this.DOM_obj.zoom_canvas[0].width  = main_canvas.draw_w;
		this.DOM_obj.zoom_canvas.height( main_canvas.vp_h );
		this.DOM_obj.zoom_canvas.width( main_canvas.vp_w );

		// set zoom_canvas position
		if( this.settings.outbox_position == "right" ){
			this.DOM_obj.zoom_canvas.css('top', 0);
			this.DOM_obj.zoom_canvas.css('left', main_canvas.vp_w );
		} else if( this.settings.outbox_position == "left" ){
			this.DOM_obj.zoom_canvas.css('top', 0);
			this.DOM_obj.zoom_canvas.css('left', main_canvas.vp_w * -1 );
		} else if( this.settings.outbox_position == "top" ){
			this.DOM_obj.zoom_canvas.css('top', main_canvas.vp_h * -1);
			this.DOM_obj.zoom_canvas.css('left', 0 );
		} else if( this.settings.outbox_position == "bottom" ){
			// respect the control bar...
			this.DOM_obj.zoom_canvas.css('top', this.DOM_obj.main_box.height() );
			this.DOM_obj.zoom_canvas.css('left', 0 );
		}
	};
	/**
	 *  @description This function adjusts the canvas to a full page size.
	 */
	ThrixtyPlayer.MainClass.prototype.enter_fullpage = function(){

		this.DOM_obj.size_btn.attr('state', 'normalsize');
		this.is_fullscreen = true;

		this.stop_zoom();

		this.DOM_obj.main_box.css('position', 'fixed');
		this.DOM_obj.main_box.css('top', '5px');
		this.DOM_obj.main_box.css('right', '5px');
		this.DOM_obj.main_box.css('bottom', '5px');
		this.DOM_obj.main_box.css('left', '5px');
		this.DOM_obj.main_box.css('background', 'white');
		this.DOM_obj.main_box.css('z-index', '9999');
		this.DOM_obj.main_box.css('max-width', 'calc(100% - 10px)');
		this.DOM_obj.main_box.css('max-height', 'calc(100% - 10px)');
		this.DOM_obj.showroom.css('height', 'calc(100% - '+this.DOM_obj.controls.outerHeight()+'px)');
	};
	/**
	 *  @description This function reverts the fullpage sized canvas to a normal size.
	 */
	ThrixtyPlayer.MainClass.prototype.quit_fullpage = function(){

		this.DOM_obj.size_btn.attr('state', 'fullpage');
		this.is_fullscreen = false;

		this.stop_zoom();

		this.DOM_obj.main_box.css('position', '');
		this.DOM_obj.main_box.css('top', '');
		this.DOM_obj.main_box.css('right', '');
		this.DOM_obj.main_box.css('bottom', '');
		this.DOM_obj.main_box.css('left', '');
		this.DOM_obj.main_box.css('background', '');
		this.DOM_obj.main_box.css('z-index', '');
		this.DOM_obj.main_box.css('max-width', '');
		this.DOM_obj.main_box.css('max-height', '');
		this.DOM_obj.showroom.css('height', '');
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




	/**
	 *  @description Destroy this instance to stop the Player from playing.
	 */
	ThrixtyPlayer.MainClass.prototype.destroy_player = function(){
		this.stop_rotation();
		this.stop_zoom();
		this.quit_fullpage();
		console.log(this);
		destroy_me = this;
	};




	//// GETTER AND SETTER
		/**
		 *  @description This function sets image offsets.<br>
		 *    The Player is able to work with a different amount of small and large images.<br>
		 *    This function assigns image-ids to each other to be able to transition smoothly between small and large images.
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
		 *  @description This function sets the base frequencies of the image objects.<br>
		 *    The frequencies are different, when there are different amounts of images.
		 */
		ThrixtyPlayer.MainClass.prototype.set_image_frequencies = function(){
			this.small.frequency = Math.ceil(this.small.images_count / this.settings.seconds_per_turn);
			this.large.frequency = Math.ceil(this.large.images_count / this.settings.seconds_per_turn);
		};
		/**
		 *  @description This function sets the rotation direction for the player.
		 *  @param {String} direction "default", "fw" or "bw"
		 */
		ThrixtyPlayer.MainClass.prototype.set_rotation_direction = function(direction){
			if( direction == "default" ){
				this.rotation_direction = this.settings.direction;
			} else if( direction == "fw" || direction == 1 ){
				this.rotation_direction = 1; // current direction: forward
			} else if( direction == "bw" || direction == -1 ){
				this.rotation_direction = -1; // current direction: backward
			}
		};
		/**
		 *  @description This function returns HTML-Object of the current small image.
		 *  @return {DOM} image Returns the small image which the active_image_id is pointing to.
		 */
		ThrixtyPlayer.MainClass.prototype.get_current_small_image = function(){
			// get and return the current small image
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
			if( base_large.elem_loaded === true ){
				return base_large.jq_elem[0];
			}

			// request the large picture, that should have been loaded now
			if( base_large.elem_loaded === null ){
				this.load_one_image(this.large.images[this.large.active_image_id], this.DOM_obj.image_cache_large);
			}

			// the large one isnt yet loaded, so fall back to the small one
			return base_small.jq_elem[0];
		};
		/**
		 *  @description This function returns the dimensions of the background canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_bg_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.bg_canvas,
				ctx: this.DOM_obj.bg_canvas[0].getContext("2d"),
				x: this.DOM_obj.bg_canvas.offset().left,
				y: this.DOM_obj.bg_canvas.offset().top,
				draw_w: this.DOM_obj.bg_canvas[0].width,
				draw_h: this.DOM_obj.bg_canvas[0].height,
				vp_w: this.DOM_obj.bg_canvas.width(),
				vp_h: this.DOM_obj.bg_canvas.height(),
			}
		};
		/**
		 *  @description This function returns the dimensions of the main canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_main_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.main_canvas,
				ctx: this.DOM_obj.main_canvas[0].getContext("2d"),
				x: this.DOM_obj.main_canvas.offset().left,
				y: this.DOM_obj.main_canvas.offset().top,
				draw_w: this.DOM_obj.main_canvas[0].width,
				draw_h: this.DOM_obj.main_canvas[0].height,
				vp_w: this.DOM_obj.main_canvas.width(),
				vp_h: this.DOM_obj.main_canvas.height(),
			}
		};
		/**
		 *  @description This function returns the dimensions of the minimap canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_minimap_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.minimap_canvas,
				ctx: this.DOM_obj.minimap_canvas[0].getContext("2d"),
				x: this.DOM_obj.minimap_canvas.offset().left,
				y: this.DOM_obj.minimap_canvas.offset().top,
				draw_w: this.DOM_obj.minimap_canvas[0].width,
				draw_h: this.DOM_obj.minimap_canvas[0].height,
				vp_w: this.DOM_obj.minimap_canvas.width(),
				vp_h: this.DOM_obj.minimap_canvas.height(),
			}
		};
		/**
		 *  @description This function returns the dimensions of the outbox zoom canvas
		 *  @return {Object} Collection of offset-x, offset-y, width, height and drawing-context
		 */
		ThrixtyPlayer.MainClass.prototype.get_zoom_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.zoom_canvas,
				ctx: this.DOM_obj.zoom_canvas[0].getContext("2d"),
				x: this.DOM_obj.zoom_canvas.offset().left,
				y: this.DOM_obj.zoom_canvas.offset().top,
				draw_w: this.DOM_obj.zoom_canvas[0].width,
				draw_h: this.DOM_obj.zoom_canvas[0].height,
				vp_w: this.DOM_obj.zoom_canvas.width(),
				vp_h: this.DOM_obj.zoom_canvas.height(),
			}
		};
	// /GETTER AND SETTER END


})(jQuery_2_1_3);