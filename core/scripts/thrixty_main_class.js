/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version 1.4
 *  @license GPLv3
 *  @module ThrixtyPlayer.MainClass
 */
;"use strict";

/**
 *  @description ThrixtyPlayer Application
 *  @name ThrixtyPlayer
 *
 *  @namespace ThrixtyPlayer The Thrixty Player is a 360 degree Product Presentation designed in HTML 5.
 */
var ThrixtyPlayer = ThrixtyPlayer || {};

(function(jQuery){
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
	ThrixtyPlayer.MainClass = function(id, selector){
		/* Player Identity */
		this.player_id = id;
		this.selector = selector;



		this.DOM_obj = {
			main_box: this.selector,
				showroom: jQuery("<div class=\"showroom\" style=\"display: none;\"></div>"),
					canvas_container: jQuery("<div class=\"canvas_container\"></div>"),
						bg_canvas: jQuery("<canvas id=\"bg_canvas\" class=\"canvas\" width=\"0\" height=\"0\"></canvas>"),
						main_canvas: jQuery("<canvas id=\"main_canvas\" class=\"canvas\" width=\"0\" height=\"0\"></canvas>"),
						minimap_canvas: jQuery("<canvas id=\"minimap_canvas\" class=\"canvas\" width=\"0\" height=\"0\" style=\"display:none;\"></canvas>"),
						marker: jQuery("<div id=\"marker\" style=\"display:none;\"></div>"),
					progress_container: jQuery("<div class=\"progress_container\" ></div>"),
						progress_bar_small: jQuery("<div class=\"progress_bar_small\" state=\"unloaded\" style=\"width: 0%;\"></div>"),
						progress_bar_large: jQuery("<div class=\"progress_bar_large\" state=\"unloaded\" style=\"width: 0%;\"></div>"),
				controls: jQuery("<div class=\"controls\" style=\"display: none;\"></div>"),
					control_container_one: jQuery("<div class=\"control_container\" ></div>"),
						prev_btn: jQuery("<button id=\"prev_btn\" class=\"ctrl_buttons\" state=\"step\" disabled ></button>"),
						play_btn: jQuery("<button id=\"play_btn\" class=\"ctrl_buttons\" state=\"play\" disabled ></button>"),
						next_btn: jQuery("<button id=\"next_btn\" class=\"ctrl_buttons\" disabled ></button>"),
						zoom_btn: jQuery("<button id=\"zoom_btn\" class=\"ctrl_buttons\" state=\"zoomin\" disabled ></button>"),
						size_btn: jQuery("<button id=\"size_btn\" class=\"ctrl_buttons\" state=\"fullpage\" disabled ></button>"),
				load_overlay: jQuery("<div id=\"load_overlay\" style=\"display: none;\"></div>"),
					load_btn: jQuery("<button id=\"load_btn\" style=\"display: none;\"></button>"),
				zoom_canvas: jQuery("<canvas id=\"zoom_canvas\" width=\"0\" height=\"0\" style=\"display: none;\"></canvas>"),
				controls_cache: jQuery("<div class=\"controls_cache\" style=\"display: none;\"></div>"),
				image_cache_small: jQuery("<div class=\"image_cache_small\" style=\"display: none;\"></div>"),
				image_cache_large: jQuery("<div class=\"image_cache_large\" style=\"display: none;\"></div>"),
		}


		/* Options */
		/* set base values */
		this.settings = {
			basepath: "", /* Standardpfad, von wo aus die Player-Dateien liegen. */
			filelist_path_small: "filelist_small.txt",
			filelist_path_large: "filelist_large.txt",
			zoom_control: "progressive",
			zoom_mode: "inbox",
			position_indicator: "minimap",
			outbox_position: "right",
			direction: 1, /* 1|-1 <=> forward|backward */
			seconds_per_turn: 5,
			sensitivity_x: 20,
			sensitivity_y: 50,
		};
		/* The settings.direction is used multiplicative! It corresponds to "Base direction", so the rest of the program can treat both base directions as "forward"! */


		this.small = {
			context: "small",
			filepath: "",
			filelist_loaded: null,
			images_count: 0,
			images_loaded: 0,
			images_errored: 0,
			images: [],
				/** "images" Prototyp:
				{
					id: 0,
					source: "www.testsource.de",
					jq_elem: jQuery("<img style=\"display: none;\" />"),
					elem_loaded: null,
					to_small: null,
					to_large: null,
				} */
			first_loaded_image_id: null,
			active_image_id: 0,
			frequency: 15,
			load_event: this.small_onload_event,
		};

		this.large = {
			context: "large",
			filepath: "",
			filelist_loaded: null,
			images_count: 0,
			images_loaded: 0,
			images_errored: 0,
			images: [],
				/** "images" Prototyp:
				{
					id: 0,
					source: "www.testsource.de",
					jq_elem: jQuery("<img style=\"display: none;\" />"),
					elem_loaded: null,
					to_small: null,
					to_large: null,
				} */
			first_loaded_image_id: null,
			active_image_id: 0,
			frequency: 15,
			load_event: this.large_onload_event,
		};


		/* State Variables */
		this.loading_state = 0; /* 0:init | 1:initialized | 2:displayable | 3:playable | 4:zoomable | 5:completed */

		/**/
		this.execute_autostart = true;
		this.is_rotating = false;
		this.is_zoomed = false;
		this.is_fullpage = false;



		/* Rotation */
		this.rotation_direction = 1; /* 1|-1 <=> forward|backward */
		/* this.rotation_direction is designed to treat this.settings.direction as always being "forward" - hence multiplicate itself with it. */
		this.interval_id = 0;




		/* Class Relations */
		this.event_handler = new ThrixtyPlayer.EventHandler(this);
		this.drawing_handler = new ThrixtyPlayer.DrawingHandler(this);





		/** setup ausführen? */


		ThrixtyPlayer.log("Player (id "+this.player_id+") initialized.", this.player_id);
	};

	/**
	 *  @description This function will do the setup tasks to build the Player inside the div.
	 */
	ThrixtyPlayer.MainClass.prototype.setup = function(){

		/* / / 1.) vom player selbst bereitzustellende daten und strukturen */

		/* considering the settings */
		this.parse_settings();
		ThrixtyPlayer.log(this.settings, this.player_id);

		/* build the player */
		this.build_html_structure();



		/* / / 2.) Informationen von externen quellen beschaffen und bereitstellen */

		/* read small filelist */
		this.read_filelist(this.small);
		if( !this.small.filelist_loaded ){
			/* FATAL ERROR */
			/*throw new Error("The Base Filelist (small) wasn't Loaded.\n"+small_fl_read, 0, 0);*/
			return false;
		}

		/* read large filelist */
		this.read_filelist(this.large);
		if( !this.large.filelist_loaded ){
			/* suppress entering zoom */
			this.settings.zoom_mode = "none";
			/*throw new Error("The Zoom Filelist (large) wasn't Loaded.\n"+large_fl_read, 0, 0);*/
		}

		/* set load events */
		this.set_load_events(this.small);
		this.set_load_events(this.large);



		/* / / 3.) informationsquellen miteinander verquicken */

		/* Set the values for the possibly different image count. */
		this.set_image_offsets();
		this.set_image_frequencies();

		/* Now set loading state (nothing is loaded yet) */
		this.update_loading_state();
	};

	/**
	 *  @description This function gets the options defined as HTML attributes.<br>To create new options, register them here.
	 */
	ThrixtyPlayer.MainClass.prototype.parse_settings = function (){
		/* loop through all attributes to get option values */
		var main_box_attributes = this.DOM_obj.main_box[0].attributes;
		var main_box_attr_count = main_box_attributes.length;
		for( var i=0; i<main_box_attr_count; i++ ){
			var attr = main_box_attributes[i];
			switch( attr.name ){
				case "thrixty-basepath":
					if( attr.value != "" ){
						this.settings.basepath = String(attr.value);
						if( this.settings.basepath.substr(-1) != "/" ){
							this.settings.basepath += "/";
						}
					}
					break;
				case "thrixty-filelist-path-small":
					if( attr.value != "" ){
						this.settings.filelist_path_small = String(attr.value);
					}
					break;
				case "thrixty-filelist-path-large":
					if( attr.value != "" ){
						this.settings.filelist_path_large = String(attr.value);
					}
					break;
				case "thrixty-zoom-control":
					if( attr.value == "classic" ){
						this.settings.zoom_control = "classic";
					} else {
						this.settings.zoom_control = "progressive";
					}
					break;
				case "thrixty-zoom-mode":
					/* proper values:  -inbox(default) -outbox -none */

					if( attr.value == "inbox" ){
						this.settings.zoom_mode = "inbox";
					} else if( attr.value == "outbox" ){
						this.settings.zoom_mode = "outbox";
					} else if( attr.value == "none" ){
						this.settings.zoom_mode = "none";
					}
					break;
				case "thrixty-position-indicator":
					/* proper values: -minimap -marker -none(|empty) */
					if( attr.value == "minimap" ){
						this.settings.position_indicator = "minimap";
					} else if( attr.value == "marker" ){
						this.settings.position_indicator = "marker";
					} else if( attr.value == "none" || attr.value == "" ){
						this.settings.position_indicator = "";
					}
					break;
				case "thrixty-outbox-position":
					/* proper value: -right -left -top -bottom */
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
				case "thrixty-direction":
					if( attr.value == "1" || attr.value == "forward" ){
						this.settings.direction = 1;
					} else if( attr.value == "-1" || attr.value == "backward" ){
						this.settings.direction = -1;
					}
					break;
				case "thrixty-seconds-per-turn":
					if( attr.value != "" ){
						this.settings.seconds_per_turn = parseInt(attr.value);
					}
					break;
				case "thrixty-sensitivity-x":
					if( attr.value != "" ){
						if( parseInt(attr.value) >= 0 ){
							this.settings.sensitivity_x = parseInt(attr.value);
						}
					}
					break;
				case "thrixty-sensitivity-y":
					if( attr.value != "" ){
						if( parseInt(attr.value) >= 0 ){
							this.settings.sensitivity_y = parseInt(attr.value);
						}
					}
					break;
				default:
					break;
			}
		}
		/* set the small and large filepaths to their settings-values */
		this.small.filepath = this.settings.filelist_path_small;
		this.large.filepath = this.settings.filelist_path_large;
	};
	/**
	 *  @description This function generates HTML-Code and keeps track of generated elements.
	 *  @return {bool} Was everything generated correctly? (atm inoperable)
	 */
	ThrixtyPlayer.MainClass.prototype.build_html_structure = function(){
		/* this is the main part of the player - image show area */
		this.DOM_obj.main_box.attr("tabindex", "0");
		this.DOM_obj.main_box.css("outline", "none");
			this.DOM_obj.main_box.append(this.DOM_obj.showroom);
				this.DOM_obj.showroom.append(this.DOM_obj.canvas_container);
					this.DOM_obj.canvas_container.append(this.DOM_obj.bg_canvas);
					this.DOM_obj.canvas_container.append(this.DOM_obj.main_canvas);
					this.DOM_obj.canvas_container.append(this.DOM_obj.minimap_canvas);
					this.DOM_obj.canvas_container.append(this.DOM_obj.marker);
				this.DOM_obj.showroom.append(this.DOM_obj.progress_container);
					this.DOM_obj.progress_container.append(this.DOM_obj.progress_bar_small);
					this.DOM_obj.progress_container.append(this.DOM_obj.progress_bar_large);

			/* these are the control buttons for the app */
			this.DOM_obj.main_box.append(this.DOM_obj.controls);
				this.DOM_obj.controls.append(this.DOM_obj.control_container_one);
					this.DOM_obj.control_container_one.append(this.DOM_obj.prev_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.play_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.next_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.zoom_btn);
					this.DOM_obj.control_container_one.append(this.DOM_obj.size_btn);
				this.DOM_obj.controls.append( jQuery("<div style=\"clear: both;\"></div>") );

			/* thi is the overlay for the load confirmation */
			this.DOM_obj.main_box.append(this.DOM_obj.load_overlay);
				this.DOM_obj.load_overlay.append(this.DOM_obj.load_btn);

			/* Zoom Box for Outbox Zoom (invisible on stadard) */
			this.DOM_obj.main_box.append(this.DOM_obj.zoom_canvas);

			/* these will store the image preloads */
			/* this.DOM_obj.main_box.append(this.DOM_obj.controls_cache); */
				/* cache control icons */
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/expand.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/pause.svg\">")       );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/plus.svg\">")        );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/vorwaertz.svg\">")   );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/expand_w.svg\">")    );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/pause_w.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/plus_w.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/vorwaertz_w.svg\">") );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/minus.svg\">")       );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/play.svg\">")        );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/shrink.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/zurueck.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/minus_w.svg\">")     );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/play_w.svg\">")      );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/shrink_w.svg\">")    );
				this.DOM_obj.controls_cache.append( jQuery("<img src=\""+ThrixtyPlayer.mainpath+"core/style/images/zurueck_w.svg\">")   );
			this.DOM_obj.main_box.append(this.DOM_obj.image_cache_small);
			this.DOM_obj.main_box.append(this.DOM_obj.image_cache_large);

		/* no errors (?) */
		return true;
	};
	/**
	 *  @description This function reads filelists in order to parse them.
	 *  @param  {object} load_obj This is the loading object, whose filelist should be read. [this.small or this.large]
	 *  @return {mixed}           Returns true on success, a String on fail.
	 */
	ThrixtyPlayer.MainClass.prototype.read_filelist = function(load_obj){
		var that = this;
		var return_value = false;

		/* get url */
		var url = this.settings.basepath + load_obj.filepath;
		ThrixtyPlayer.log("filelist path: "+url, this.player_id);
		/* execute AJAX request */
		jQuery.ajax({
			async: false, /* SYNCHRONOUS IS IMPORTANT! The gathered information is depending on each other. */
			url: url,
			type: "get",
			dataType: "text",
			error: function(jQueryXHTMLresponse, textStatus, errorThrown){
				ThrixtyPlayer.log("filelist requested at >>"+url+"<< could not be retrieved. || "+jQueryXHTMLresponse.status+": "+jQueryXHTMLresponse.statusText, that.player_id);
				load_obj.filelist_loaded = false;
			},
			success: function(data, textStatus, jQueryXHTMLresponse){
				/* parse data */
				ThrixtyPlayer.log("filelist >>"+url+"<< successfully retrieved.", that.player_id);
				load_obj.filelist_loaded = that.parse_filelist(load_obj, data);
			}
		});
	};
	/**
	 *  @description This function parses filelists in order to cache them by generating new images.
	 *  @param  {object} load_obj This is the loading object, whose filelist will get parsed.
	 *  @param  {text} filelist This is the text, that was written in the filelist.
	 *  @return {boolean}         Returns true, when parsing was successful.
	 */
	ThrixtyPlayer.MainClass.prototype.parse_filelist = function(load_obj, filelist){
		/* parse die liste aus und speichere die sources im array */
		var image_paths = filelist.replace(/[\s'"]/g,"").split(",");
		/* loop through all paths */
		var pic_count = image_paths.length;
		/*( if length <= 0 raise error )*/
		for( var i=0; i<pic_count; i++ ){
			/* create new image object */
			var new_image = {
				id: i,
				source: image_paths[i],
				jq_elem: jQuery("<img style=\"display: none;\" />"),
				elem_loaded: null,  /* null = not yet loaded, false = failed to load, true = is loaded */
				to_small: null,
				to_large: null,
			};
			/* count object */
			load_obj.images_count += 1;
			/* assign object */
			load_obj.images[i] = new_image;
		}

		/* no errors (?) */
		ThrixtyPlayer.log("The filelist was separated into "+pic_count+" individual paths.", this.player_id);
		return true;
	};
	/**
	 *  @description This function assigns load events onto the images, to let images report their loading status.
	 *  @param {object} load_obj        This is the loading object, whose images gets the events.
	 */
	ThrixtyPlayer.MainClass.prototype.set_load_events = function(load_obj){
		var len = load_obj.images.length;
		for( var i=0; i<len; i++ ){
			var current_elem = load_obj.images[i];
			current_elem.jq_elem.one("load error", [load_obj, current_elem], load_obj.load_event.bind(this) );
		}
	};
	/* ThrixtyPlayer.MainClass.prototype.set_ = function(){} */
	/**
	 *  @description This function is being called on load of the small images.
	 *  @param  {object} load_event Triggering Event.
	 */
	ThrixtyPlayer.MainClass.prototype.small_onload_event = function(load_event){
		/** This timeout will delay every load event execution by a quarter
		 *   of a second.
		 * This is neccessary, as some browsers are executing load-events before the
		 *   images are actually accessible.
		 */
		setTimeout(function(){
			/* get param values */
			var params = load_event.data;
			var load_obj = params[0];
			var current_elem = params[1];

			/* if this load was successful */
			if( load_event.type == "load" ){
				/* update object to success */
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				/* If this was the first image that was being loaded, */
				if( load_obj.first_loaded_image_id == null ){
					/* register it, */
					load_obj.first_loaded_image_id = current_elem.id;
					/* and give the dimensions to the drawing handler. */
					this.drawing_handler.set_small_image_size(current_elem.jq_elem);
					/* calc dimension ratio */
					this.drawing_handler.calculate_image_ratio();




					/** The whole purpose of the following block is to make sure,
					 *   that the starting image WILL be loaded.
					 * Some current browser on fast computer are executing
					 *   load-events too fast, even though the image itself
					 +   is not drawable yet.
					 */
					var current_count = 0;
					var start_img_draw = function(){
						if( current_count < 5 && !this.isLoaded){
							current_count += 1;

							this.resize_canvasses_to_dimensions_of(current_elem.jq_elem[0]);
							/* set drawing handlers canvas to main canvas */
							this.drawing_handler.canvas = this.DOM_obj.main_canvas;

							/* draw image to canvas */
							this.drawing_handler.draw_current_image();

							/* function calls itself after 0.5 seconds */
							setTimeout(start_img_draw, 500);
						}
					}.bind(this);
					start_img_draw();
					/* /end */
				}

			/* if this load errored */
			} else {
				/* update object to fail */
				ThrixtyPlayer.log("Image ("+current_elem.id+") at >>"+current_elem.source+"<< errored!", this.player_id);
				load_obj.images_errored += 1;
				current_elem.elem_loaded = false;
			}
			this.small_image_loaded();
		}.bind(this).bind(load_event), 250);
	};
	/**
	 *  @description This function is being called on load of the large images.
	 *  @param  {event} load_event The Event, which triggered this function.
	 */
	ThrixtyPlayer.MainClass.prototype.large_onload_event = function(load_event){
		/** This timeout will delay every load event execution by a quarter
		 *   of a second.
		 * This is done because of some browser executing the events before the
		 *   images are properly loaded.
		 */
		setTimeout(function(){
			/* get param values */
			var params = load_event.data;
			var load_obj = params[0];
			var current_elem = params[1];

			/* if this load was successful */
			if( load_event.type == "load" ){
				/* update object to success */
				load_obj.images_loaded += 1;
				current_elem.elem_loaded = true;

				/* If this was the first image that was being loaded, */
				if( load_obj.first_loaded_image_id == null ){
					/* register it, */
					load_obj.first_loaded_image_id = current_elem.id;
					/* and give the dimensions to the drawing handler. */
					this.drawing_handler.set_large_image_size(current_elem.jq_elem);
					/* calc imension ratio */
					this.drawing_handler.calculate_image_ratio();
				}

				/* When this image is current, redraw the current image. */
				/* This large image is likely to be drawn in zoom. */
				if( this.large.active_image_id == current_elem.id ){
					this.drawing_handler.draw_current_image();
				}

			/* if this load errored */
			} else {
				/* update object to fail */
				ThrixtyPlayer.log("Image ("+current_elem.id+") at >>"+current_elem.source+"<< errored!", this.player_id);
				load_obj.images_errored += 1;
				current_elem.elem_loaded = false;
			}
			this.large_image_loaded();
		}.bind(this).bind(load_event), 250);
	};
	/**
	 *  @description This function starts the loading of all images of this object into this container.<br>(used on the small images at the start)
	 *  @param  {[type]} load_obj         [description]
	 *  @param  {[type]} target_container [description]
	 *  @return {[type]}                  [description]
	 */
	ThrixtyPlayer.MainClass.prototype.load_all_images = function(load_obj, target_container){
		/* load all images by loading each one individually */
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
		/* set this element to not loaded, assign the src and append it to the image container. */
		img_obj.elem_loaded = false;
		img_obj.jq_elem.attr("src", img_obj.source);
		target_container.append(img_obj.jq_elem);
	};
	/**
	 *  @description
	 */
	ThrixtyPlayer.MainClass.prototype.small_image_loaded = function(){
		/* small images progress bar */
		var loaded_percentage = ( (this.small.images_loaded+this.small.images_errored) / this.small.images_count);
		this.refresh_progress_bar(this.DOM_obj.progress_bar_small, loaded_percentage);
		this.update_loading_state();
	};
	/**
	 *  @description
	 */
	ThrixtyPlayer.MainClass.prototype.large_image_loaded = function(){
		/* large images progress bar */
		var loaded_percentage = ( (this.large.images_loaded+this.large.images_errored) / this.large.images_count);
		this.refresh_progress_bar(this.DOM_obj.progress_bar_large, loaded_percentage);
		this.update_loading_state();
	};
	/**
	 *  @description This function updates the HTML representation of the loading progress.
	 *  @param  {jq-object} progress_bar The jQuery Object to the Progress Bar.
	 *  @param  {Integer} percentage   How much is done loading?
	 */
	ThrixtyPlayer.MainClass.prototype.refresh_progress_bar = function(progress_bar, percentage){

		/* NaN or negative   (-n...0) */
		if( isNaN(percentage) || percentage <= 0 ){
			progress_bar.attr("state", "unloaded");
			progress_bar.css("width", "0%");

		/* under 100%        (0,01...0,99) */
		} else if( percentage < 1 ){
			progress_bar.attr("state", "loading");
			progress_bar.css("width", (percentage * 100)+"%");

		/* over 100%         (1...n) */
		} else if( percentage >= 1 ){
			progress_bar.attr("state", "loaded");
			progress_bar.css("width", "100%");
		}
	};
	/**
	 *  @description This function manages the loading state of the Player.<br>Functionality is enabled and disabled automatically here.
	 */
	ThrixtyPlayer.MainClass.prototype.update_loading_state = function(){
		/* 0:init | 1:initialized | 2:displayable | 3:playable | 4:zoomable | 5:completed */

		var s_count = this.small.images_count;
		var s_load  = this.small.images_loaded + this.small.images_errored;
		var l_count = this.large.images_count;
		var l_load  = this.large.images_loaded + this.large.images_errored;
		/** console.log("s_count: "+s_count+" | s_load: "+s_load+" | l_count: "+l_count+" | l_load: "+l_load+""); */

		switch( true ){
			case s_load == 0:                                           /* 1 - initialized */
				/**
				 *  dont display anything
				 *  buttons and events disabled
				 *
				 *  (mobile)     start loading first small image
				 *  (non-mobile) start loading all small images and first large image
				 */

				if( this.loading_state !== 1 ){
					ThrixtyPlayer.log("Wechsel zu Ladestatus 1 (initialized)", this.player_id);
					this.loading_state = 1;

					this.DOM_obj.showroom.hide();
					this.DOM_obj.controls.hide();
					this.DOM_obj.size_btn.prop('disabled', true);
					this.DOM_obj.prev_btn.prop('disabled', true);
					this.DOM_obj.play_btn.prop('disabled', true);
					this.DOM_obj.next_btn.prop('disabled', true);
					this.DOM_obj.zoom_btn.prop('disabled', true);

					/* load small pictures */
					if( ThrixtyPlayer.is_mobile ){
						this.load_one_image(this.small.images[0], this.DOM_obj.image_cache_small);
						this.DOM_obj.load_overlay.show();
						this.DOM_obj.load_btn.show();
					} else {
						this.load_all_images(this.small, this.DOM_obj.image_cache_small);
					}
				}
			break;
			case s_load >= 1 && s_load < s_count:                       /* 2 - displayable */
				/**
				 *  display the first image
				 *  buttons and events disabled
				 *
				 *  (mobile)     wait for users loading permission to load all small images and the first large one
				 *  (non-mobile) wait for all small images to be loaded
				 */

				if( this.loading_state != 2){
					ThrixtyPlayer.log("Wechsel zu Ladestatus 2 (displayable)", this.player_id);
					this.loading_state = 2;

					this.DOM_obj.showroom.show();
					this.DOM_obj.controls.show();
					this.DOM_obj.size_btn.prop('disabled', true);
					this.DOM_obj.prev_btn.prop('disabled', true);
					this.DOM_obj.play_btn.prop('disabled', true);
					this.DOM_obj.next_btn.prop('disabled', true);
					this.DOM_obj.zoom_btn.prop('disabled', true);
				}
			break;
			case s_load == s_count && l_load == 0:                      /* 3 - playable */
				/**
				 *  autostart rotation (when enabled)
				 *  buttons and events enabled except zoom
				 *
				 */

				if( this.loading_state != 3 ){
					ThrixtyPlayer.log("Wechsel zu Ladestatus 3 (playable)", this.player_id);
					this.loading_state = 3;

					this.DOM_obj.showroom.show();
					this.DOM_obj.controls.show();
					this.DOM_obj.size_btn.prop('disabled', false);
					this.DOM_obj.prev_btn.prop('disabled', false);
					this.DOM_obj.play_btn.prop('disabled', false);
					this.DOM_obj.next_btn.prop('disabled', false);
					this.DOM_obj.zoom_btn.prop('disabled', true);
					if( this.execute_autostart ){
						this.all_images_loaded();
						this.execute_autostart = false;
					}

					if( this.settings.zoom_mode != "none" ){
						this.load_one_image(this.large.images[0], this.DOM_obj.image_cache_large);
					}
				}
			break;
			case s_load == s_count && l_load >= 1 && l_load < l_count:  /* 4 - zoomable */
				/**
				 *  fully interactable
				 *  (large images are automatically loaded during zoom)
				 *
				 */

				if( this.loading_state != 4 ){
					ThrixtyPlayer.log("Wechsel zu Ladestatus 4 (zoomable)", this.player_id);
					this.loading_state = 4;

					this.DOM_obj.showroom.show();
					this.DOM_obj.controls.show();
					this.DOM_obj.size_btn.prop('disabled', false);
					this.DOM_obj.prev_btn.prop('disabled', false);
					this.DOM_obj.play_btn.prop('disabled', false);
					this.DOM_obj.next_btn.prop('disabled', false);
					this.DOM_obj.zoom_btn.prop('disabled', false);
					if( this.execute_autostart ){
						this.all_images_loaded();
						this.execute_autostart = false;
					}
				}
			break;
			case s_load == s_count && l_load == l_count:                /* 5 - completed */
				/**
				 *  fully loaded
				 */

				if( this.loading_state != 5){
					ThrixtyPlayer.log("Wechsel zu Ladestatus 5 (completed)", this.player_id);
					this.loading_state = 5;

					this.DOM_obj.showroom.show();
					this.DOM_obj.controls.show();
					this.DOM_obj.size_btn.prop('disabled', false);
					this.DOM_obj.prev_btn.prop('disabled', false);
					this.DOM_obj.play_btn.prop('disabled', false);
					this.DOM_obj.next_btn.prop('disabled', false);
					this.DOM_obj.zoom_btn.prop('disabled', false);
					if( this.execute_autostart ){
						this.all_images_loaded();
						this.execute_autostart = false;
					}
				}
			break;
			default:
				/* error */
			break;
		}
	};







	/**
	 *  @description This function is called, when all base images are loaded.
	 */
	ThrixtyPlayer.MainClass.prototype.all_images_loaded = function(){
		/* start rotation for startup. */
		/* autostart / autoplay */
		ThrixtyPlayer.log("Autostart animation", this.player_id);
		// this.start_rotation();
	};





	/**
	 *  @description This function starts the rotation.
	 */
	ThrixtyPlayer.MainClass.prototype.start_rotation = function(){
		var root = this;

		var delay = 10;

		/* stop possible rotation */
		this.stop_rotation();

		/* set rotation params */
		this.is_rotating = true;
		/* set play/pause btn to play */
		this.DOM_obj.play_btn.attr('state', 'pause')

		/* define repeating function */
		if( this.rotation_direction > 0 ){ /* forward */
			var rotation_func = function(){
				root.nextImage();
			};
		} else if( this.rotation_direction < 0 ){ /* backward */
			var rotation_func = function(){
				root.previousImage();
			};
		}

		/* calculate delay */
		if( this.is_zoomed ){
			delay = 1000 / this.large.frequency;
		} else {
			delay = 1000 / this.small.frequency;
		}

		/* first call same function for no execution delay */
		rotation_func();
		/* start interval */
		this.interval_id = setInterval(rotation_func, delay);
	};
	/**
	 *  @description This function stops the rotation.
	 */
	ThrixtyPlayer.MainClass.prototype.stop_rotation = function(){
		if( this.is_rotating ){
			this.is_rotating = false;
			this.DOM_obj.play_btn.attr('state', 'play');
			/* end animation by stopping the interval */
			clearInterval(this.interval_id);
			this.interval_id = 0;
		} else {
			/* ignore */
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
		/* mache umdrehungen anhand des distance_x mit einer bestimmten übersetzung */

		/* Pixel per Degree (Application Parameter): The cursor needs to travel 2 pixel, to turn the object by 1 degree.  =>  2px/1° => 720px/360° */
		var pixel_per_degree = 2;

		if( this.is_zoomed ){
			/* Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/72img = 5°/img */
			var degree_per_image = 360/this.large.images_count;  /* 360°/n*img */
		} else {
			/* Degree per Image: How many degree the object needs to turn, to show the next image. Example:  360°/12img = 30°/img */
			var degree_per_image = 360/this.small.images_count;  /* 360°/n*img */
		}

		/* Pixel per Image: How many pixel the cursor needs to travel, to show the next image. Example:  5°/img * 2px/°  <=>  5*2px / img  <=> 10px/img */
		var pixel_per_image = pixel_per_degree * degree_per_image;


		var rest_distanz = ( distance_x % pixel_per_image );

		var anzahl_nextimages = ( distance_x - rest_distanz ) / pixel_per_image;


		/* the basic movement is backwards, so invert the value */
		anzahl_nextimages = anzahl_nextimages * -1;

		if( this.is_zoomed ){
			this.change_active_image_id(this.large, anzahl_nextimages);
			/* assign large to small */
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, anzahl_nextimages);
			/* assign small to large */
			this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
		}

		/* update View */
		this.drawing_handler.draw_current_image();

		return rest_distanz;
	};





	/**
	 *  @description This function is rendering the next Image.
	 */
	ThrixtyPlayer.MainClass.prototype.nextImage = function(){
		if( this.is_zoomed ){
			this.change_active_image_id(this.large, 1);
			/* assign small */
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, 1);
			/* assign large */
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
			/* assign small */
			this.small.active_image_id = this.large.images[this.large.active_image_id].to_small;
		} else {
			this.change_active_image_id(this.small, -1);
			/* assign large */
			this.large.active_image_id = this.small.images[this.small.active_image_id].to_large;
		}
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function changes the load_object's active_image_id by the specified amount.<br>Only values from 0 to images_count-1 gets assigned.
	 */
	ThrixtyPlayer.MainClass.prototype.change_active_image_id = function(load_obj, amount){
		/* The given amount is multiplicated with the BASE direction, so whichever base direction is used, it will still be treated as "forward". */
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
		if( this.settings.zoom_mode != "none" ){
			/* set zoom flag */
			this.is_zoomed = true;

			/* do main_class's part of start_zoom routine: */
			/* set zoom button to zoomout */
			this.DOM_obj.zoom_btn.attr('state', 'zoomout');

			/* simulate zoom start at the center of the canvas */
			var click_x = this.DOM_obj.main_canvas.offset().left + ( this.DOM_obj.main_canvas.width() / 2 );
			var click_y = this.DOM_obj.main_canvas.offset().top + ( this.DOM_obj.main_canvas.height() / 2 );
			this.drawing_handler.set_absolute_mouseposition(click_x, click_y);

			/* check for position indicator wanted (for example a minimap) */
			if( this.settings.position_indicator == "minimap" ){
				this.DOM_obj.minimap_canvas.show();
			} else if( this.settings.position_indicator == "marker" ){
				this.DOM_obj.minimap_canvas.show();
				this.DOM_obj.marker.show();
			}

			if( this.settings.zoom_mode == "outbox" ){
				/* only setup zoom outbox, when not in fullpage mode */
				if( !this.is_fullpage ){
					this.setup_outbox();
				}
			}
		}

		/* draw current picture */
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description This function switches the player back to the unzoomed state.
	 */
	ThrixtyPlayer.MainClass.prototype.stop_zoom = function(){
		/* turn off zoom */
		this.is_zoomed = false;
		this.DOM_obj.zoom_btn.attr('state', 'zoomin');

		/* hide zoombox */
		this.DOM_obj.zoom_canvas.hide();
		/* hide minimap_box */
		this.DOM_obj.minimap_canvas.hide();
		/* hide marker */
		this.DOM_obj.marker.hide();
		/* draw unzoomed picture */
		this.drawing_handler.draw_current_image();
	};
	/**
	 *  @description Toggles between zoomed and unzoomed state.
	 */
	ThrixtyPlayer.MainClass.prototype.toggle_zoom = function(){
		if( this.is_zoomed ){
			this.stop_zoom();
			/* if already rotating, refresh rotation frequency */
			if( this.is_rotating ){
				this.start_rotation();
			}
		} else {
			this.stop_rotation();
			this.start_zoom();
			/** if already rotating, refresh rotation frequency
			 *  if( this.is_rotating ){
			 * 	 this.start_rotation();
			 *  }
			 */
		}
	};
	/**
	 * @description Setups the HTML objects for displaying the zoom picture in a outer box.
	 */
	ThrixtyPlayer.MainClass.prototype.setup_outbox = function(){
		/* show zoom box at the selected position */
		this.DOM_obj.zoom_canvas.show();

		/* get main_canvas info */
		var main_canvas = this.get_main_canvas_dimensions();

		/* set zoom_canvas width */
		this.DOM_obj.zoom_canvas[0].height = main_canvas.draw_h;
		this.DOM_obj.zoom_canvas[0].width  = main_canvas.draw_w;
		this.DOM_obj.zoom_canvas.height( main_canvas.vp_h );
		this.DOM_obj.zoom_canvas.width( main_canvas.vp_w );

		/* set zoom_canvas position */
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
			/* respect the control bar... */
			this.DOM_obj.zoom_canvas.css('top', this.DOM_obj.main_box.height() );
			this.DOM_obj.zoom_canvas.css('left', 0 );
		}
	};





	/**
	 *  @description Toggles between fullpage size and normal size.
	 */
	ThrixtyPlayer.MainClass.prototype.toggle_fullpage = function(){
		if( this.is_fullpage ){
			this.quit_fullpage();
		} else {
			this.enter_fullpage();
		}
	};
	/**
	 *  @description This function adjusts the canvas to a full page size.
	 */
	ThrixtyPlayer.MainClass.prototype.enter_fullpage = function(){
		this.stop_zoom();
		// this.stop_rotation();

		/* set fullpage state */
		this.is_fullpage = true;
		this.DOM_obj.size_btn.attr('state', 'normalsize');


		/* set main_box fullscreeen-styles */
		this.DOM_obj.main_box.css('position', 'fixed');
		this.DOM_obj.main_box.css('top', '5px');
		this.DOM_obj.main_box.css('right', '5px');
		this.DOM_obj.main_box.css('bottom', '5px');
		this.DOM_obj.main_box.css('left', '5px');
		this.DOM_obj.main_box.css('background', 'white');
		this.DOM_obj.main_box.css('z-index', '9999');
		this.DOM_obj.main_box.css('max-width', 'calc(100% - 10px)');
		this.DOM_obj.main_box.css('max-height', 'calc(100% - 10px)');

		/* set showrooms height and consider the button height */
		this.DOM_obj.showroom.css('height', 'calc(100% - '+this.DOM_obj.controls.outerHeight()+'px)');

		/* set refreshing styles at start */
		this.set_fullpage_canvas_dimensions();
	};
	/**
	 *  @description This function reverts the fullpage sized canvas to a normal size.
	 */
	ThrixtyPlayer.MainClass.prototype.quit_fullpage = function(){
		this.stop_zoom();

		/* reset fullpage state */
		this.is_fullpage = false;
		this.DOM_obj.size_btn.attr('state', 'fullpage');

		/* unset main_box fullscreeen-styles */
		this.DOM_obj.main_box.css('position', '');
		this.DOM_obj.main_box.css('top', '');
		this.DOM_obj.main_box.css('right', '');
		this.DOM_obj.main_box.css('bottom', '');
		this.DOM_obj.main_box.css('left', '');
		this.DOM_obj.main_box.css('background', '');
		this.DOM_obj.main_box.css('z-index', '');
		this.DOM_obj.main_box.css('max-width', '');
		this.DOM_obj.main_box.css('max-height', '');

		/* unset showrooms height */
		this.DOM_obj.showroom.css('height', '');

		/* unset canvas_container size modification */
		this.DOM_obj.canvas_container.css('width', '');
		this.DOM_obj.canvas_container.css('height', '');
		this.DOM_obj.canvas_container.css('margin-left', '');
		this.DOM_obj.canvas_container.css('margin-right', '');
	};
	/**
	 *  @description Sets the dimensions of the canvas_container.
	 */
	ThrixtyPlayer.MainClass.prototype.set_fullpage_canvas_dimensions = function(){
		/* dont do anything, when not even in fullpage */
		if( this.is_fullpage ){

			/* gather basic information */
			var showroom_width = this.DOM_obj.showroom.width();
			var showroom_height = this.DOM_obj.showroom.height();
			if( !this.is_zoomed ){
				var image_aspect_ratio = this.drawing_handler.image_aspect_ratio.small;
			} else {
				var image_aspect_ratio = this.drawing_handler.image_aspect_ratio.large;
			}

			/* calculate dimensions */
			var current_showroom_aspect_ratio = showroom_width / showroom_height;
			if( current_showroom_aspect_ratio <= image_aspect_ratio ){ /* portrait orientation */
				var canvas_container_width  = showroom_width;
				var canvas_container_height = showroom_width/image_aspect_ratio;

				var canvas_container_x      = 0;
				var canvas_container_y      = (showroom_height-canvas_container_height)/2;

			} else { /* landscape orientation */
				var canvas_container_width  = showroom_height*image_aspect_ratio;
				var canvas_container_height = showroom_height;

				var canvas_container_x      = (showroom_width-canvas_container_width)/2;
				var canvas_container_y      = 0
			}

			/* assign canvas dimensions */
			this.DOM_obj.canvas_container.css('width', canvas_container_width+'px');
			this.DOM_obj.canvas_container.css('height', canvas_container_height+'px');

			this.DOM_obj.canvas_container.css('margin-left', canvas_container_x+'px');
			this.DOM_obj.canvas_container.css('margin-top', canvas_container_y+'px');

		}
	};
	/**
	 *  @description Sets the width and height attributes of the canvasses to the width of th specified element.
	 */
	ThrixtyPlayer.MainClass.prototype.resize_canvasses_to_dimensions_of = function(element){
		/* show and hide are being used because of REASONS! */
		/* (the reasons are - what else could it be - Internet Explorer...) */
		jQuery(element).show();

		/* background */
		this.DOM_obj.bg_canvas[0].width = element.naturalWidth;
		this.DOM_obj.bg_canvas[0].height = element.naturalHeight;

		/* main */
		this.DOM_obj.main_canvas[0].width = element.naturalWidth;
		this.DOM_obj.main_canvas[0].height = element.naturalHeight;

		/* minimap */
		this.DOM_obj.minimap_canvas[0].width = element.naturalWidth;
		this.DOM_obj.minimap_canvas[0].height = element.naturalHeight;

		/* zoom box */
		this.DOM_obj.zoom_canvas[0].width = element.naturalWidth;
		this.DOM_obj.zoom_canvas[0].height = element.naturalHeight;

		jQuery(element).hide();
	};









	/* GETTER AND SETTER */
		/**
		 *  @description This function sets image offsets.<br>
		 *    The Player is able to work with a different amount of small and large images.<br>
		 *    This function assigns image-ids to each other to be able to transition smoothly between small and large images.
	 */
	ThrixtyPlayer.MainClass.prototype.set_image_offsets = function(){
		/* get values */
		var small_images_count = this.small.images_count;
		var large_images_count = this.large.images_count;

		/* no need to set these settings, when there arent any large images */
		if( small_images_count  > 0 && large_images_count > 0 ){
			/* get proportion */
			var small_to_large = small_images_count/large_images_count;
			var large_to_small = large_images_count/small_images_count;

			/* set small image offset */
			for( var i=0; i<small_images_count; i++ ){
				this.small.images[i].to_large = Math.round(i/small_to_large);
			}

			/* set large image offset */
			for( var i=0; i<large_images_count; i++ ){
				this.large.images[i].to_small = Math.round(i/large_to_small);
			}
		}
	};





	/* translates minimap coordinates */
	ThrixtyPlayer.MainClass.prototype.minimap_to_main_coords = function(coords){
		return {
			x: ( ( coords.x - this.DOM_obj.minimap_canvas.offset().left ) / this.drawing_handler.image_size_ratio.w ) + this.DOM_obj.minimap_canvas.offset().left,
			y: ( ( coords.y - this.DOM_obj.minimap_canvas.offset().top  ) / this.drawing_handler.image_size_ratio.h ) + this.DOM_obj.minimap_canvas.offset().top,
		};
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
	 *  @description This function increases the rotation speed by 5 images per second. (max 100)
	 */
	ThrixtyPlayer.MainClass.prototype.increase_rotation_frequency = function(){
		var small_frequency = this.small.frequency;
		if( small_frequency <= 100 ){
			small_frequency += 5;
			if( small_frequency > 100 ){
				small_frequency = 100;
			}
			this.small.frequency = small_frequency;
			this.large.frequency = Math.ceil(small_frequency*(this.large.images_count/this.small.images_count));
			this.start_rotation();
		}
	}
	/**
	 *  @description This function decreases the rotation speed by 5 images per second. (min 1)
	 */
	ThrixtyPlayer.MainClass.prototype.decrease_rotation_frequency = function(){
		var small_frequency = this.small.frequency;
		if( small_frequency > 1 ){
			small_frequency -= 5;
			if( small_frequency < 1 ){
				small_frequency = 1;
			}
			this.small.frequency = small_frequency;
			this.large.frequency = Math.ceil(small_frequency*(this.large.images_count/this.small.images_count));
			this.start_rotation();
		}
	}


	/**
	 *  @description This function sets the rotation direction for the player.
	 *  @param {String} direction "default", "fw" or "bw"
	 */
	ThrixtyPlayer.MainClass.prototype.set_rotation_direction = function(direction){
		if( direction == "default" ){
			this.rotation_direction = this.settings.direction;
		} else if( direction == "fw" || direction == 1 ){
			this.rotation_direction = 1; /* current direction: forward */
		} else if( direction == "bw" || direction == -1 ){
			this.rotation_direction = -1; /* current direction: backward */
		}
	};
	/**
	 *  @description This function returns HTML-Object of the current small image.
	 *  @return {DOM} image Returns the small image which the active_image_id is pointing to.
	 */
	ThrixtyPlayer.MainClass.prototype.get_current_small_image = function(){
		/* get and return the current small image */

		var cur_image = this.small.images[this.small.active_image_id];
		if( cur_image.elem_loaded ){
			return cur_image.jq_elem[0];
		} else {
			/* There is nothing to show */
			return null;
		}
	};
	/**
	 *  @description This function returns HTML-Object of the current large image.<br>In case, that big one wasnt loaded yet, the small one is returned.
	 *  @return {DOM} image Returns the large image, which the active_image_id is pointing to.<br>If that image is not loaded, the small variant will get returned.
	 */
	ThrixtyPlayer.MainClass.prototype.get_current_large_image = function(){
		/* get images (small for fallback) */
		var base_small = this.small.images[this.small.active_image_id];
		var base_large = this.large.images[this.large.active_image_id];

		/* if the large one is already loaded, return it */
		if( base_large.elem_loaded === true ){
			return base_large.jq_elem[0];
		}

		/* request the large picture, that should have been loaded now */
		if( base_large.elem_loaded === null ){
			this.load_one_image(this.large.images[this.large.active_image_id], this.DOM_obj.image_cache_large);
		}

		/* the large one isnt yet loaded, so fall back to the small one */
		return this.get_current_small_image();
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
	/**
	 *  @description  Questions the program state for general events being allowed (excluding zoom).
	 *  @return {Boolean} Events allowed?
	 */
	ThrixtyPlayer.MainClass.prototype.are_events_enabled = function(){
		if( this.loading_state >= 3 ){
			return true;
		} else {
			return false;
		}
	};
	/**
	 *  @description  Questions the program state for zoom events being allowed.
	 *  @return {Boolean}  Zoom allowed?
	 */
	ThrixtyPlayer.MainClass.prototype.is_zoom_enabled = function(){
		if( this.loading_state >= 4 ){
			return true;
		} else {
			return false;
		}
	};
	/* /GETTER AND SETTER END */


})(jQuery_Thrixty);