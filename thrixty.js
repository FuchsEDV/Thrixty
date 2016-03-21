;"use strict";
/***** Thrixty Namespace *****/
	/* start script by checking for already existing Thrixty namespace */
	if( typeof(Thrixty) !== "undefined" ){
		/* do nothing and break script */
		throw new Error("The Thrixty Namespace is already set. Aborting execution.");
	}
	/* now set a new Thrixty Namespace */
	var Thrixty = {};
	Thrixty.version = "2.0.0";

	/***** namespace properties *****/
	Thrixty.players = [];
	Thrixty.mainpath = "";
	Thrixty.logs = {
		main_log: [],
		player_logs: {
			/**/
		},
	};
	Thrixty.icons_cache = [];
	Thrixty.is_mobile = (function(){
		var mobile_user_agents = {
			Android: !!navigator.userAgent.match(/Android/i),
			BlackBerry: !!navigator.userAgent.match(/BlackBerry/i),
			iOS: !!navigator.userAgent.match(/iPhone|iPad|iPod/i),
			iPad: !!navigator.userAgent.match(/iPad/i),
			Opera: !!navigator.userAgent.match(/Opera Mini/i),
			Windows: !!navigator.userAgent.match(/IEMobile/i)
		};
		return ( mobile_user_agents.Android || mobile_user_agents.BlackBerry || mobile_user_agents.iOS || mobile_user_agents.Opera || mobile_user_agents.Windows );
	})();

	/***** namespace methods *****/
	Thrixty.cache_control_icons = function(){
		/** TODO: rework this part to one liners **/
		Thrixty.icons_cache.expand = document.createElement("img");
		Thrixty.icons_cache.expand.src = Thrixty.mainpath+"core/style/images/expand.svg";
		Thrixty.icons_cache.expand_w = document.createElement("img");
		Thrixty.icons_cache.expand_w.src = Thrixty.mainpath+"core/style/images/expand_w.svg";
		Thrixty.icons_cache.load = document.createElement("img");
		Thrixty.icons_cache.load.src = Thrixty.mainpath+"core/style/images/load.svg";
		Thrixty.icons_cache.load_w = document.createElement("img");
		Thrixty.icons_cache.load_w.src = Thrixty.mainpath+"core/style/images/load_w.svg";
		Thrixty.icons_cache.minus = document.createElement("img");
		Thrixty.icons_cache.minus.src = Thrixty.mainpath+"core/style/images/minus.svg";
		Thrixty.icons_cache.minus_w = document.createElement("img");
		Thrixty.icons_cache.minus_w.src = Thrixty.mainpath+"core/style/images/minus_w.svg";
		Thrixty.icons_cache.pause = document.createElement("img");
		Thrixty.icons_cache.pause.src = Thrixty.mainpath+"core/style/images/pause.svg";
		Thrixty.icons_cache.pause_w = document.createElement("img");
		Thrixty.icons_cache.pause_w.src = Thrixty.mainpath+"core/style/images/pause_w.svg";
		Thrixty.icons_cache.play = document.createElement("img");
		Thrixty.icons_cache.play.src = Thrixty.mainpath+"core/style/images/play.svg";
		Thrixty.icons_cache.play_w = document.createElement("img");
		Thrixty.icons_cache.play_w.src = Thrixty.mainpath+"core/style/images/play_w.svg";
		Thrixty.icons_cache.plus = document.createElement("img");
		Thrixty.icons_cache.plus.src = Thrixty.mainpath+"core/style/images/plus.svg";
		Thrixty.icons_cache.plus_w = document.createElement("img");
		Thrixty.icons_cache.plus_w.src = Thrixty.mainpath+"core/style/images/plus_w.svg";
		Thrixty.icons_cache.shrink = document.createElement("img");
		Thrixty.icons_cache.shrink.src = Thrixty.mainpath+"core/style/images/shrink.svg";
		Thrixty.icons_cache.shrink_w = document.createElement("img");
		Thrixty.icons_cache.shrink_w.src = Thrixty.mainpath+"core/style/images/shrink_w.svg";
		Thrixty.icons_cache.vorwaerts = document.createElement("img");
		Thrixty.icons_cache.vorwaerts.src = Thrixty.mainpath+"core/style/images/vorwaerts.svg";
		Thrixty.icons_cache.vorwaerts_w = document.createElement("img");
		Thrixty.icons_cache.vorwaerts_w.src = Thrixty.mainpath+"core/style/images/vorwaerts_w.svg";
		Thrixty.icons_cache.zurueck = document.createElement("img");
		Thrixty.icons_cache.zurueck.src = Thrixty.mainpath+"core/style/images/zurueck.svg";
		Thrixty.icons_cache.zurueck_w = document.createElement("img");
		Thrixty.icons_cache.zurueck_w.src = Thrixty.mainpath+"core/style/images/zurueck_w.svg";
	};
	Thrixty.log = function(msg, id){
		if( typeof(id) != "number" ){
			/* main log */
			this.logs.main_log.push(msg);

		} else {
			/* player log */
			if( typeof(this.logs.player_logs[id]) == "undefined" ){
				this.logs.player_logs[id] = [msg];
			} else {
				this.logs.player_logs[id].push(msg);
			}
		};
	};
	Thrixty.export_logs = function(){
		return JSON.stringify(this.logs);
	};
	Thrixty.debounce = function(callback, wait, immediate){
		immediate = immediate || false;
		var context = null;
		var args = null;
		var timeout_id = null;
		var exec_callback = function(){
			timeout_id = null;
			if( !immediate ){
				callback.apply(context, args);
			}
		};
		return function(){
			context = this;
			args = arguments;
			if( immediate && !timeout_id ){
				callback.apply(context, args);
			}
			clearTimeout(timeout_id);
			timeout_id = setTimeout(
				exec_callback,
				wait
			);
		};
	};
	Thrixty.throttle = function(callback, wait){
		var context = null;
		var args = null;
		var last_call_at = 0;
		var current_call_at = 0;
		return function(){
			context = this;
			args = arguments;
			current_call_at = Date.now();
			if( current_call_at > (last_call_at + wait) ){
				callback.apply(context, args);
				last_call_at = current_call_at;
			}
		}
	};
	Thrixty.insertAfter = function (newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	};
	Thrixty.init = function(){
		Thrixty.log("initializing Thrixty");
		// init players
		var player_candidates = document.querySelectorAll("div.thrixty");
		if( player_candidates.length > 0){
			this.cache_control_icons();
		}
		var i = 0;
		for( i; i<player_candidates.length; i++ ){
			var cur_candidate = player_candidates[i];
			setTimeout(function(){
				/* create new instance */
				var new_player = new Thrixty.Player(this.players.length, cur_candidate);
				/* memorize instance */
				this.players.push( new_player  );
			}.bind(this), 10);
		}
	};
	(function(){ /* IEFE for evading variable pollution */
		/* fill mainpath property */
		/* TODO: instead of treating this file to be the last one loaded at runtime, actually search for it. */
		var scripts = document.getElementsByTagName('script');
		var last_inserted_file = scripts[scripts.length - 1];
		var parts = last_inserted_file.src.split("/");
		parts.pop(); /* remove "[filename].[ext]" */
		Thrixty.mainpath = parts.join("/")+"/";
		Thrixty.log("Script Mainpath |"+Thrixty.mainpath+"|");

		/* TODO: rework this (maybe?) */
		window.addEventListener( "load", Thrixty.init.bind(Thrixty) );
	})();
/***** /Thrixty Namespace *****/







/***** Class Player *****/
	Thrixty.Player = function(id, root_el){
		this.player_id = id;
		this.root_element = root_el;


		/** Options **/
			/* base values */
			this.settings = {
				basepath: "", /* => relative to current url */
				filelist_path_small: "small/Filelist.txt", /* => subfolder 'small', then look for Filelist.txt */
				filelist_path_large: "large/Filelist.txt", /* => subfolder 'large', then look for Filelist.txt */
				zoom_control: "progressive",
				zoom_mode: "inbox",
				position_indicator: "minimap",
				outbox_position: "right",
				direction: 0, /* 0|1 <=> forward|backward */
				cycle_duration: 5,
				sensitivity_x: 20,
				sensitivity_y: 50,
				autoplay: -1,
				autoload: !Thrixty.is_mobile, /* false when mobile, true when not */
			};
		/** /Options **/
		/** Images **/
			this.small = {
				filepath: "",
				filelist_content: "",
				filelist_loaded: null,
				images_count: 0,
				images_loaded: 0,
				images_errored: 0,
				images: [],
					/** "images" Prototyp:
					{
						id: 0,
						source: "www.testsource.de",
						element: jQuery("<img style=\"display: none;\" />"),
						elem_loaded: null,
						to_small: null,
						to_large: null,
					} */
				/**/
				context: "small",
				image_width: 0,
				image_height: 0,
				image_ratio: 0,
				active_image_id: 0,
			};
			this.large = {
				filepath: "",
				filelist_content: "",
				filelist_loaded: null,
				images_count: 0,
				images_loaded: 0,
				images_errored: 0,
				images: [],
					/** "images" Prototyp:
					{
						id: 0,
						source: "www.testsource.de",
						element: jQuery("<img style=\"display: none;\" />"),
						elem_loaded: null,
						to_small: null,
						to_large: null,
					} */
				/**/
				context: "large",
				image_width: 0,
				image_height: 0,
				image_ratio: 0,
				active_image_id: 0,
			};
		/** /Images **/












		/** HTML objects **/
		/* TODO: rework this part to one liners */
		this.DOM_obj = {};
		this.DOM_obj.showroom = document.createElement("div");
		this.DOM_obj.showroom.setAttribute("class", "showroom");
			this.DOM_obj.canvas_container = document.createElement("div");
			this.DOM_obj.canvas_container.setAttribute("class", "canvas_container");
				this.DOM_obj.bg_canvas = document.createElement("canvas");
				this.DOM_obj.bg_canvas.setAttribute("id", "bg_canvas");
				this.DOM_obj.bg_canvas.setAttribute("class", "canvas");
				this.DOM_obj.bg_canvas.setAttribute("width", "0");
				this.DOM_obj.bg_canvas.setAttribute("height", "0");
				this.DOM_obj.main_canvas = document.createElement("canvas");
				this.DOM_obj.main_canvas.setAttribute("id", "main_canvas");
				this.DOM_obj.main_canvas.setAttribute("class", "canvas");
				this.DOM_obj.main_canvas.setAttribute("width", "0");
				this.DOM_obj.main_canvas.setAttribute("height", "0");
				this.DOM_obj.minimap_canvas = document.createElement("canvas");
				this.DOM_obj.minimap_canvas.setAttribute("id", "minimap_canvas");
				this.DOM_obj.minimap_canvas.setAttribute("class", "canvas");
				this.DOM_obj.minimap_canvas.setAttribute("width", "0");
				this.DOM_obj.minimap_canvas.setAttribute("height", "0");
				this.DOM_obj.minimap_canvas.setAttribute("style", "display: none;");
				this.DOM_obj.marker = document.createElement("div");
				this.DOM_obj.marker.setAttribute("id", "marker");
				this.DOM_obj.marker.setAttribute("style", "display: none;");
			this.DOM_obj.progress_container = document.createElement("div");
			this.DOM_obj.progress_container.setAttribute("id", "progress_container");
				this.DOM_obj.progress_bar = document.createElement("div");
				this.DOM_obj.progress_bar.setAttribute("class", "progress_bar");
				this.DOM_obj.progress_bar.setAttribute("state", "unloaded");
				this.DOM_obj.progress_bar.setAttribute("style", "width: 0%;");
		this.DOM_obj.controls = document.createElement("div");
		this.DOM_obj.controls.setAttribute("class", "controls");
		this.DOM_obj.controls.setAttribute("style", "display: none;");
			this.DOM_obj.control_container_one = document.createElement("div");
			this.DOM_obj.control_container_one.setAttribute("class", "control_container_one");
			this.DOM_obj.prev_btn = document.createElement("button");
			this.DOM_obj.prev_btn.setAttribute("id", "prev_btn");
			this.DOM_obj.prev_btn.setAttribute("class", "ctrl_buttons");
			this.DOM_obj.prev_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.play_btn = document.createElement("button");
			this.DOM_obj.play_btn.setAttribute("id", "play_btn");
			this.DOM_obj.play_btn.setAttribute("class", "ctrl_buttons");
			this.DOM_obj.play_btn.setAttribute("state", "pause");
			this.DOM_obj.play_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.next_btn = document.createElement("button");
			this.DOM_obj.next_btn.setAttribute("id", "next_btn");
			this.DOM_obj.next_btn.setAttribute("class", "ctrl_buttons");
			this.DOM_obj.next_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.zoom_btn = document.createElement("button");
			this.DOM_obj.zoom_btn.setAttribute("id", "zoom_btn");
			this.DOM_obj.zoom_btn.setAttribute("class", "ctrl_buttons");
			this.DOM_obj.zoom_btn.setAttribute("state", "zoomed_out");
			this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.size_btn = document.createElement("button");
			this.DOM_obj.size_btn.setAttribute("id", "size_btn");
			this.DOM_obj.size_btn.setAttribute("class", "ctrl_buttons");
			this.DOM_obj.size_btn.setAttribute("state", "normalsize");
			this.DOM_obj.size_btn.setAttribute("disabled", "disabled");
		this.DOM_obj.load_overlay = document.createElement("div");
		this.DOM_obj.load_overlay.setAttribute("id", "load_overlay");
		this.DOM_obj.load_overlay.setAttribute("style", "display: none;");
			this.DOM_obj.load_btn = document.createElement("button");
			this.DOM_obj.load_btn.setAttribute("id", "load_btn");
			this.DOM_obj.load_btn.setAttribute("style", "display: none;");
		this.DOM_obj.zoom_canvas = document.createElement("canvas");
		this.DOM_obj.zoom_canvas.setAttribute("id", "zoom_canvas");
		this.DOM_obj.zoom_canvas.setAttribute("width", "0");
		this.DOM_obj.zoom_canvas.setAttribute("height", "0");
		this.DOM_obj.zoom_canvas.setAttribute("style", "display: none;");











		/*** State Variables ***/
		/* loading state */
		this.loading_state = 0; /* 0:init | 1:initialized | 2:displayable | 3:playable | 4:zoomable | 5:completed */
		this.execute_autostart = true;
		/* zoom state */
		this.can_zoom = false;
		this.is_zoomed = false;
		this.is_fullpage = false;
		/* rotation state */
		this.is_rotating = false;
		this.rotation_id = 0;
		this.rotation_count = -1;
		this.rotation_delay = 100;
		this.rotation_speed_modifiers = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.4, 2, 2.5, 3.2, 4];
		this.rotation_speed_selected = 5;






		/*** drawing properties ***/
			/* current mouseposition to calculate drawing positions from - fed from EventHandler */
			this.absolute_mouse = {
				x: 0,
				y: 0,
			};

			/* current mouseposition relative to the main_canvas's upper-left-hand-corner */
			this.relative_mouse = {
				x: 0,
				y: 0,
			};

			/**
			 * unused so far
			 * this.bg_canvas = {
			 * 	self: null,
			 * 	ctx: null,
			 * 	x: 0,
			 * 	y: 0,
			 * 	draw_w: 0,
			 * 	draw_h: 0,
			 * 	vp_w: 0,
			 * 	vp_h: 0,
			 * };
			 */

			/*  */
			this.main_canvas = {
				self: null,
				ctx: null,
				x: 0,
				y: 0,
				draw_w: 0,
				draw_h: 0,
				vp_w: 0,
				vp_h: 0,
			};

			/*  */
			this.minimap_canvas = {
				self: null,
				ctx: null,
				x: 0,
				y: 0,
				draw_w: 0,
				draw_h: 0,
				vp_w: 0,
				vp_h: 0,
			};

			this.marker = null;

			/*  */
			this.zoom_canvas = {
				self: null,
				ctx: null,
				x: 0,
				y: 0,
				draw_w: 0,
				draw_h: 0,
				vp_w: 0,
				vp_h: 0,
			};
		/*** /drawing properties ***/








		/** log creation **/
		Thrixty.log("Player (id "+this.player_id+") initialized.");



		/*** PARSE SETTINGS ***/
			/* loop through all attributes to get option values */
			var main_box_attributes = this.root_element.attributes;
			var main_box_attr_count = main_box_attributes.length;
			for( var i=0; i<main_box_attr_count; i++ ){
				var attr = main_box_attributes[i];
				attr_name = attr.name.trim();
				attr_value = attr.value.trim();
				switch( attr_name ){
					case "thrixty-basepath":
						if( attr_value != "" ){
							this.settings.basepath = attr_value;
						}
						break;
					case "thrixty-filelist-path-small":
						if( attr_value != "" ){
							this.settings.filelist_path_small = attr_value;
						}
						break;
					case "thrixty-filelist-path-large":
						if( attr_value != "" ){
							this.settings.filelist_path_large = attr_value;
						}
						break;
					case "thrixty-zoom-control":
						/* proper values:  -progressive(default) -classic */
						switch( attr_value ){
							case "progressive":
							case "classic":
								this.settings.zoom_control = attr_value;
								break;
						}
						break;
					case "thrixty-zoom-mode":
						/* proper values:  -inbox(default) -outbox -none */
						switch( attr_value ){
							case "inbox":
							case "outbox":
							case "none":
								this.settings.zoom_mode = attr_value;
								break;
						}
						break;
					case "thrixty-position-indicator":
						/* proper values: -minimap(default) -marker -none[|empty] */
						switch( attr_value ){
							case "minimap":
							case "marker":
								this.settings.position_indicator = attr_value;
								break;
							case "none":
							case "":
								this.settings.position_indicator = "";
								break;
						}
						break;
					case "thrixty-outbox-position":
						/* proper values: -right(default) -left -top -bottom */
						switch( attr_value ){
							case "right":
							case "left":
							case "top":
							case "bottom":
								this.settings.outbox_position = attr_value;
								break;
						}
						break;
					case "thrixty-direction":
						/* proper values: -forward[|0](default) -backward[|1] */
						switch( attr_value ){
							case "0":
							case "forward":
								this.settings.direction = 0;
								break;
							case "1":
							case "backward":
								this.settings.direction = 1;
								break;
						}
						break;
					case "thrixty-cycle-duration":
						/* proper values: -5(default) -[number > 0] */
						if( attr_value != "" ){
							attr_value = parseInt(attr_value);
							if( attr_value > 0 ){
								this.settings.cycle_duration = attr_value;
							}
						}
						break;
					case "thrixty-sensitivity-x":
						/* proper values: -20(default) -[number >= 0] */
						if( attr_value != "" ){
							attr_value = parseInt(attr_value);
							if( attr_value >= 0 ){
								this.settings.sensitivity_x = attr_value;
							}
						}
						break;
					case "thrixty-sensitivity-y":
						/* proper values: -50(default) -[number >= 0] */
						if( attr_value != "" ){
							attr_value = parseInt(attr_value);
							if( attr_value >= 0 ){
								this.settings.sensitivity_y = attr_value;
							}
						}
						break;
					case "thrixty-autoplay":
						/* proper values: -on[|-1](default) -off[|0] -[number > 0] */
						switch( attr_value ){
							case "on":
							case "-1":
								this.settings.autoplay = -1;
								break;
							case "off":
							case "0":
								this.settings.autoplay = 0;
								break;
							default:
								attr_value = parseInt(attr_value);
								if( attr_value > 0 ){
									this.settings.autoplay = attr_value;
								}
								break;
						}
						break;
					case "thrixty-autoload":
						/* proper values: -on(default) -off(enforced on mobile) */
						if( Thrixty.is_mobile ){
							this.settings.autoload = false;
						} else {
							switch( attr_value ){
								case "on":
									this.settings.autoload = true;
									break;
								case "off":
									this.settings.autoload = false;
									break;
							}
						}
						break;
					default:
						/* ignore all other attributes */
						break;
				}
			}

			/* set the small and large filepaths to their settings-values */
			var small_url = this.settings.basepath;
			var large_url = this.settings.basepath;

			if( small_url != "" ){
				small_url += small_url.charAt(small_url.length-1) === "/" ? "" : "/";
			}
			if( large_url != "" ){
				large_url += large_url.charAt(large_url.length-1) === "/" ? "" : "/";
			}
				small_url += this.settings.filelist_path_small;
				large_url += this.settings.filelist_path_large;

			this.small.filepath = small_url;
			this.large.filepath = large_url;
		/*** /PARSE SETTINGS ***/
		/*** CHECK SETTINGS ***/
			/* check settings for mandatories etc. */
			/** ( TODO ) **/
		/*** /CHECK SETTINGS ***/

		/*** LOAD FILELISTS ***/
			this.load_small_filelist();
			this.load_large_filelist();
		/*** /LOAD FILELISTS ***/
	};


	Thrixty.Player.prototype.check_loading_state = function(){
		if( this.loading_state == 0 ){
			if( this.small.filelist_loaded !== null && this.large.filelist_loaded !== null ){
				// continue, as both filelists were loaded

				if( this.small.filelist_loaded === true ){
					// only do stuff, when small filelist was loaded
					this.loading_state = 1;
					Thrixty.log("Wechsel zu Ladestatus 1 (initialized)", this.player_id);

					// parse small and parse large, when available
					this.parse_small_filelist();
					if( this.large.filelist_loaded === true ){
						this.parse_large_filelist();
					}

					// now build html structure
					this.build_html_structure();

					// next preload images
					if( this.settings.autoload ){
						this.load_small_images();
					} else {
						this.load_first_small_image();
					}
				} else {
					/* error when trying to change to 1 */
					this.loading_state = -1;
					Thrixty.log("ERROR: -1 (initialized error)", this.player_id);
				}
			}
			return null;
		}
		if( this.loading_state == 1 ){
			// update progress bar
			this.refresh_progress_bar();
			// is first iamge loaded?
			if( this.small.images[0].elem_loaded ){
				this.loading_state = 2;
				Thrixty.log("Wechsel zu Ladestatus 2 (displayable)", this.player_id);
				// draw first small image on canvas
				this.draw_current_image();
				// show_player
				this.DOM_obj.showroom.style.display = "";
				this.DOM_obj.controls.style.display = "";
			}
		}
		if( this.loading_state == 2 ){
			// update progress bar
			this.refresh_progress_bar();

			if( (this.small.images_loaded + this.small.images_errored) == this.small.images_count ){
				this.loading_state = 3;
				Thrixty.log("Wechsel zu Ladestatus 3 (playable)", this.player_id);
				// enable_controls(); || => if large was parsed, also enable zoom button
				this.DOM_obj.size_btn.removeAttribute("disabled");
				this.DOM_obj.prev_btn.removeAttribute("disabled");
				this.DOM_obj.play_btn.removeAttribute("disabled");
				this.DOM_obj.next_btn.removeAttribute("disabled");
				if( this.settings.zoom_mode != "none" && this.large.filelist_loaded === true ){
					this.can_zoom = true;
					this.DOM_obj.zoom_btn.removeAttribute("disabled");
				}
				/* finally, assign the events to the HTML objects */
				this.assign_events();
			}
		}
		if( this.loading_state == 3 ){
			/* all images loaded */
			/* autostart / autoplay */
			if( this.settings.autoplay < 0 ){
				this.start_rotation();
				Thrixty.log("Autoplay infinite.", this.player_id);
			} else if( this.settings.autoplay == 0 ){
				Thrixty.log("No Autoplay.", this.player_id);
			} else {
				this.start_rotation(this.settings.autoplay*this.small.images_count);
				Thrixty.log("Autoplay "+this.settings.autoplay+" turn(s).", this.player_id);
			}
		}
	};




	/**** LOADING METHODS ****/
		Thrixty.Player.prototype.load_small_filelist = function(){
			var xhr = new XMLHttpRequest();
			xhr.open("get", this.small.filepath, true);
			xhr.onreadystatechange = function(){
				if( xhr.readyState == 4 ){
					if( xhr.status == 200 ){
						Thrixty.log("basic (small) filelist found", this.player_id);
						this.small.filelist_loaded = true;
						this.small.filelist_content = xhr.responseText;
						this.check_loading_state();
					} else {
						Thrixty.log("basic (small) filelist not found", this.player_id);
						this.small.filelist_loaded = false;
						this.check_loading_state();
					}
				}
			}.bind(this);
			xhr.send(null);
		};
		Thrixty.Player.prototype.load_large_filelist = function(){
			var xhr = new XMLHttpRequest();
			xhr.open("get", this.large.filepath, true);
			xhr.onreadystatechange = function(){
				if( xhr.readyState == 4 ){
					if( xhr.status == 200 ){
						Thrixty.log("large filelist found", this.player_id);
						this.large.filelist_loaded = true;
						if( this.settings.zoom_mode !== "none" ){
							this.can_zoom = true;
							this.parse_large_filelist();
						} else {
							this.can_zoom = false;
						}
						this.large.filelist_content = xhr.responseText;
						this.check_loading_state();
					} else {
						Thrixty.log("large filelist not found", this.player_id);
						this.large.filelist_loaded = false;
						this.can_zoom = false;
						this.check_loading_state();
					}
				}
			}.bind(this);
			xhr.send(null);
		};
		Thrixty.Player.prototype.parse_small_filelist = function(){
			/* clear images array */
			this.small.images = [];
			/* kill whitespace, ['] and ["] and convert to array on each [,] */
			var image_paths = this.small.filelist_content.replace(/[\s'"]/g,"").split(",");
			/* option for reverse turned on, reverse array */
			/* (results in playing the animation reversely) */
			if( this.settings.direction != 0 ){
				image_paths.reverse();
			}
			/* loop through all paths */
			var pic_count = image_paths.length;
			this.small.images_count = pic_count;

			for( var i=0; i<pic_count; i++ ){
				var new_image_object = {};
				new_image_object.id = i;
				new_image_object.source = image_paths[i];
				new_image_object.elem_loaded = null;  /* null = not yet loaded, false = failed to load, true = is loaded */
				new_image_object.to_small = null;
				new_image_object.to_large = null;
				new_image_object.element = document.createElement("img");
				new_image_object.element.addEventListener(
					"load",
					function(index){
						this.small.images_loaded += 1;
						this.small.images[index].elem_loaded = true;
						this.check_loading_state();
					}.bind(this, i)
				);
				new_image_object.element.addEventListener(
					"error",
					function(index){
						this.small.images_errored += 1;
						this.small.images[index].elem_loaded = false;
						this.check_loading_state();
					}.bind(this, i)
				);

				// append
				this.small.images.push( new_image_object );
			}
		};
		Thrixty.Player.prototype.parse_large_filelist = function(){
			/* clear images array */
			this.large.images = [];
			/* kill whitespace, ['] and ["] and convert to array on each [,] */
			var image_paths = this.large.filelist_content.replace(/[\s'"]/g,"").split(",");
			/* option for reverse turned on, reverse array */
			/* (results in playing the animation reversely) */
			if( this.settings.direction != 0 ){
				image_paths.reverse();
			}
			/* loop through all paths */
			var pic_count = image_paths.length;
			this.large.images_count = pic_count;

			for( var i=0; i<pic_count; i++ ){
				var new_image_object = {};
				new_image_object.id = i;
				new_image_object.source = image_paths[i];
				new_image_object.elem_loaded = null;  /* null = not yet loaded, false = failed to load, true = is loaded */
				new_image_object.to_small = null;
				new_image_object.to_large = null;
				new_image_object.element = document.createElement("img");
				new_image_object.element.addEventListener(
					"load",
					function(index, e){
						this.large.images_loaded += 1;
						this.large.images[index].elem_loaded = true;
					}.bind(this, i)
				);
				new_image_object.element.addEventListener(
					"error",
					function(index, e){
						this.large.images_errored += 1;
						this.large.images[index].elem_loaded = false;
					}.bind(this, i)
				);

				// append
				this.large.images.push( new_image_object );
			}
		};
		Thrixty.Player.prototype.load_first_small_image = function(){
			this.small.images[0].element.src = this.small.images[0].source;
		};
		Thrixty.Player.prototype.load_small_images = function(){
			var i = 0;
			var count = this.small.images_count;
			for( i; i<count; i++ ){
				this.small.images[i].element.src = this.small.images[i].source;
			}
		};
		Thrixty.Player.prototype.load_first_large_image = function(){
			this.large.images[0].element.src = this.large.images[0].source;
		};
		Thrixty.Player.prototype.load_large_images = function(){
			var i = 0;
			var count = this.large.images_count;
			for( i; i<count; i++ ){
				this.large.images[i].element.src = this.large.images[i].source;
			}
		};
		Thrixty.Player.prototype.build_html_structure = function(){
			/* hide player */
			this.DOM_obj.showroom.style.display = "none";
				this.DOM_obj.zoom_canvas.style.display = "none";
				this.DOM_obj.minimap_canvas.style.display = "none";
				this.DOM_obj.marker.style.display = "none";
			this.DOM_obj.controls.style.display = "none";
			/* disable buttons */
			this.DOM_obj.size_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.prev_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.play_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.next_btn.setAttribute("disabled", "disabled");
			this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");

			/* this is the main part of the player - image show area */
				this.root_element.appendChild(this.DOM_obj.showroom);
					this.DOM_obj.showroom.appendChild(this.DOM_obj.canvas_container);
						this.DOM_obj.canvas_container.appendChild(this.DOM_obj.bg_canvas);
						this.DOM_obj.canvas_container.appendChild(this.DOM_obj.main_canvas);
						this.DOM_obj.canvas_container.appendChild(this.DOM_obj.minimap_canvas);
						this.DOM_obj.canvas_container.appendChild(this.DOM_obj.marker);
					this.DOM_obj.showroom.appendChild(this.DOM_obj.progress_container);
						this.DOM_obj.progress_container.appendChild(this.DOM_obj.progress_bar);

				/* these are the control buttons for the app */
				this.root_element.appendChild(this.DOM_obj.controls);
					this.DOM_obj.controls.appendChild(this.DOM_obj.control_container_one);
						this.DOM_obj.control_container_one.appendChild(this.DOM_obj.prev_btn);
						this.DOM_obj.control_container_one.appendChild(this.DOM_obj.play_btn);
						this.DOM_obj.control_container_one.appendChild(this.DOM_obj.next_btn);
						this.DOM_obj.control_container_one.appendChild(this.DOM_obj.zoom_btn);
						if( !Thrixty.is_mobile ){
							this.DOM_obj.control_container_one.appendChild(this.DOM_obj.size_btn);
						}

				/* thi is the overlay for the load confirmation */
				this.root_element.appendChild(this.DOM_obj.load_overlay);
					this.DOM_obj.load_overlay.appendChild(this.DOM_obj.load_btn);

				/* Zoom Box for Outbox Zoom (invisible on stadard) */
				this.root_element.appendChild(this.DOM_obj.zoom_canvas);

			/* no errors (?) */
			return true;
		};
		Thrixty.Player.prototype.refresh_progress_bar = function(){
			var progress_bar = this.DOM_obj.progress_bar;
			var percentage = ( (this.small.images_loaded+this.small.images_errored) / this.small.images_count);

			/* NaN or negative   (-n...0) */
			if( isNaN(percentage) || percentage <= 0 ){
				progress_bar.setAttribute("state", "unloaded");
				progress_bar.style.width = "0%";

			/* under 100%        (0,01...0,99) */
			} else if( percentage < 1 ){
				progress_bar.setAttribute("state", "loading");
				progress_bar.style.width = (percentage * 100)+"%";

			/* over 100%         (1...n) */
			} else if( percentage >= 1 ){
				progress_bar.setAttribute("state", "loaded");
				progress_bar.style.width = "100%";
			}
		};
	/**** /LOADING METHODS ****/



	/**** HTML + EVENTS METHODS ****/
		Thrixty.Player.prototype.assign_events = function(){
			// TODO: put this into the constructor (???)
				/* for object turn */
				this.object_turn = {
					prepared: false,
					start_x: null,
					start_y: null,
					last_x: null,
					last_y: null,
				};
				/* for click events */
				this.is_click = false;



			/* This is important, as no keydown events will be fired on unfocused elements. */
			this.root_element.addEventListener("mousedown", function(){
				this.focus();
			});
			this.root_element.addEventListener("touchstart", function(){
				this.focus();
			});
			/* Keypresses: */
			this.root_element.addEventListener("keydown", this.keypresses.bind(this));

			/* Buttons */
				this.DOM_obj.prev_btn.addEventListener("click", this.prev_button_event_click.bind(this));
				this.DOM_obj.play_btn.addEventListener("click", this.play_button_event_click.bind(this));
				this.DOM_obj.next_btn.addEventListener("click", this.next_button_event_click.bind(this));
				this.DOM_obj.zoom_btn.addEventListener("click", this.zoom_button_event_click.bind(this));
				this.DOM_obj.size_btn.addEventListener("click", this.size_button_event_click.bind(this));
			/* /Buttons */
			this.DOM_obj.main_canvas.addEventListener("dblclick", this.main_canvas_dblclick.bind(this));
			/* Loading Manager */
				this.DOM_obj.load_overlay.addEventListener("click", this.load_button_event_click.bind(this));
				this.DOM_obj.load_btn.addEventListener("click", this.load_button_event_click.bind(this));
			/* /Loading Manager */
			/* Mouse Interaction */
				/* mousedown */
				document.addEventListener("mousedown", this.document_mousedown.bind(this));
				this.DOM_obj.main_canvas.addEventListener("mousedown", this.main_canvas_mousedown.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("mousedown", this.minimap_canvas_mousedown.bind(this));
				this.DOM_obj.marker.addEventListener("mousedown", this.marker_mousedown.bind(this));
				/* mousemove */
				document.addEventListener("mousemove", this.document_mousemove.bind(this));
				this.DOM_obj.main_canvas.addEventListener("mousemove", this.main_canvas_mousemove.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("mousemove", this.minimap_canvas_mousemove.bind(this));
				this.DOM_obj.marker.addEventListener("mousemove", this.marker_mousemove.bind(this));
				/* mouseup */
				document.addEventListener("mouseup", this.document_mouseup.bind(this));
				this.DOM_obj.main_canvas.addEventListener("mouseup", this.main_canvas_mouseup.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("mouseup", this.minimap_canvas_mouseup.bind(this));
				this.DOM_obj.marker.addEventListener("mouseup", this.marker_mouseup.bind(this));
			/* /Mouse Interaction */
			/* Touch Interaction */
				/* touchstart */
				document.addEventListener("touchstart", this.document_touchstart.bind(this));
				this.DOM_obj.main_canvas.addEventListener("touchstart", this.main_canvas_touchstart.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("touchstart", this.minimap_canvas_touchstart.bind(this));
				this.DOM_obj.marker.addEventListener("touchstart", this.marker_touchstart.bind(this));
				/* touchmove */
				document.addEventListener("touchmove", this.document_touchmove.bind(this));
				this.DOM_obj.main_canvas.addEventListener("touchmove", this.main_canvas_touchmove.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("touchmove", this.minimap_canvas_touchmove.bind(this));
				this.DOM_obj.marker.addEventListener("touchmove", this.marker_touchmove.bind(this));
				/* touchend */
				document.addEventListener("touchend", this.document_touchend.bind(this));
				this.DOM_obj.main_canvas.addEventListener("touchend", this.main_canvas_touchend.bind(this));
				this.DOM_obj.minimap_canvas.addEventListener("touchend", this.minimap_canvas_touchend.bind(this));
				this.DOM_obj.marker.addEventListener("touchend", this.marker_touchend.bind(this));
			/* /Touch Interaction */
			/* Window Resize: */
				window.addEventListener("resize", this.resize_window_event.bind(this));
			/* Scrolling: */
				this.root_element.addEventListener("wheel", this.scroll_event.bind(this));
		};
		Thrixty.Player.prototype.keypresses = function(e){
			if( e.altKey || e.ctrlKey || e.metaKey ){
				/* do nothing, when these keys are pressed */
				return true;
			}
			/* get pressed key and check which one was pressed */
			var keycode = e.keyCode || e.which;
			switch( keycode ){
				case 32:  /* SPACEBAR */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* correlate to click on play/pause button */
						this.play_button_event_click();
					}
					break;
				case 37:  /* LEFT ARROW */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* correlate to click on left button */
						this.prev_button_event_click();
					}
					break;
				case 39:  /* RIGHT ARROW */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* correlate to click on right button */
						this.next_button_event_click();
					}
					break;
				case 38:  /* UP ARROW */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* doesnt have a correlating button */
								// TOCOME: this.increase_rotation_speed();
					}
					break;
				case 40:  /* DOWN ARROW */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* doesnt have a correlating button */
									// TOCOME: this.decrease_rotation_speed();
					}
					break;
				case 27:  /* ESCAPE */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* doesnt have a correlating button */
						this.stop_rotation();
								// TOCOME: this.stop_zoom();
								// TOCOME: this.quit_fullpage();
					}
					break;
				case 70:  /* F */
					if( this.loading_state >= 3 ){
						e.preventDefault();
						/* correlate to click on fullpage button */
						this.size_button_event_click();
					}
					break;
				case 33:  /* PAGEUP */
				case 34:  /* PAGEDOWN */
				case 35:  /* END */
				case 36:  /* HOME */
					/* prevent scrolling, when in fullpage mode */
					if( this.is_fullpage ){
						e.preventDefault();
					}
					break;
			}
		};
		/*** Buttons ***/
			Thrixty.Player.prototype.load_button_event_click = function(e){
				this.DOM_obj.load_overlay.style.display = "none";
				this.DOM_obj.load_btn.style.display = "none";
				this.load_small_images();
			};
			Thrixty.Player.prototype.prev_button_event_click = function(e){
				if( this.loading_state >= 3 ){
					this.stop_rotation();
					this.draw_previous_image();
				}
			};
			Thrixty.Player.prototype.play_button_event_click = function(e){
				if( this.loading_state >= 3 ){
					this.toggle_rotation();
				}
			};
			Thrixty.Player.prototype.next_button_event_click = function(e){
				if( this.loading_state >= 3 ){
					this.stop_rotation();
					this.draw_next_image();
				}
			};
			Thrixty.Player.prototype.zoom_button_event_click = function(e){
				if( this.loading_state >= 3 ){
							// TOCOME: this.toggle_zoom();
				}
			};
			Thrixty.Player.prototype.size_button_event_click = function(e){
				if( this.loading_state >= 3 ){
							// TOCOME: this.toggle_fullpage();
				}
			};
			Thrixty.Player.prototype.main_canvas_dblclick = function(e){
				if( this.loading_state >= 3 ){
					e.preventDefault();
							// TOCOME: this.toggle_zoom();
				}
			};
		/*** /Buttons ***/
		/*** Interaction ***/
			/** mousedown **/
				Thrixty.Player.prototype.document_mousedown = function(e){/**/};
				Thrixty.Player.prototype.main_canvas_mousedown = function(e){
					/* A1 | user wants to turn the object */
					if( this.settings.zoom_control == "progressive" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_object_turn(e.pageX, e.pageY);
							e.preventDefault();
						}
					}
					/* B1 | user wants to turn the object */
					if( this.settings.zoom_control == "classic" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_object_turn(e.pageX, e.pageY);
							e.preventDefault();
						}
					}
					this.is_click = true;
				};
				Thrixty.Player.prototype.minimap_canvas_mousedown = function(e){
					/* A1 | user wants to turn the object */
					if( this.settings.zoom_control == "progressive" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_object_turn(e.pageX, e.pageY);
							e.preventDefault();
						}
					}
					/* B2 | user wants to move the section | minimap variation */
					if( this.settings.zoom_control == "classic" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_section_move("minimap");
							this.execute_section_move(e.pageX, e.pageY); /* instantly snap to target position */
							e.preventDefault();
						}
					}
				};
				Thrixty.Player.prototype.marker_mousedown = function(e){
					/* A1 | user wants to turn the object */
					if( this.settings.zoom_control == "progressive" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_object_turn(e.pageX, e.pageY);
							e.preventDefault();
						}
					}
					/* B2 | user wants to move the section */
					if( this.settings.zoom_control == "classic" ){
						/* left click only */
						if( e.which == 1 ){
							this.prepare_section_move("marker");
							this.execute_section_move(e.pageX, e.pageY); /* instantly snap to target position */
							e.preventDefault();
						}
					}
				};
			/** /mousedown **/
			/** mousemove **/
				Thrixty.Player.prototype.document_mousemove = function(e){
					/* A1 | user turns the object */
					/* B1 | user turns the object */
					if( this.object_turn.prepared ){
						this.execute_object_turn(e.pageX, e.pageY);
						e.preventDefault();
					}
					/* A2 | user moves section */
					if( this.is_zoomed && this.settings.zoom_control == "progressive" ){
						this.execute_section_move(e.pageX, e.pageY);
						e.preventDefault();
					}
					/* B2 | user moves section */
					if( this.section_move.prepared ){
						this.execute_section_move(e.pageX, e.pageY);
						e.preventDefault();
					}
				};
				Thrixty.Player.prototype.main_canvas_mousemove = function(e){/**/};
				Thrixty.Player.prototype.minimap_canvas_mousemove = function(e){/**/};
				Thrixty.Player.prototype.marker_mousemove = function(e){/**/};
			/** /mousemove **/
			/** mouseup **/
				Thrixty.Player.prototype.document_mouseup = function(e){
					/* A1 | user stops turning the object */
					/* B1 | user stops turning the object */
					if( this.object_turn.prepared ){
						this.execute_object_turn(e.pageX, e.pageY); /* do a final object turn */
						this.stop_object_turn();
						e.preventDefault();
					}
					/* if this is still a click, toggle object rotation */
					if( this.is_click ){
						this.toggle_rotation();
						this.is_click = false;
						e.preventDefault();
					}
					/* B2 | user stops moving section */
					if( this.section_move.prepared ){
						this.execute_section_move(e.pageX, e.pageY); /* do a final section move */
						this.stop_section_move();
						e.preventDefault();
					}
				};
				Thrixty.Player.prototype.main_canvas_mouseup = function(e){/**/};
				Thrixty.Player.prototype.minimap_canvas_mouseup = function(e){/**/};
				Thrixty.Player.prototype.marker_mouseup = function(e){/**/};
			/** /mouseup **/
			/** touchstart **/
				Thrixty.Player.prototype.document_touchstart = function(e){/**/};
				Thrixty.Player.prototype.main_canvas_touchstart = function(e){
					if( e.originalEvent.touches.length == 1 ){
						/* C1 | user wants to turn the object */
						this.prepare_object_turn(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);
						/* register this as starting a click */
						this.is_click = true;
						e.preventDefault();
					}
				};
				Thrixty.Player.prototype.minimap_canvas_touchstart = function(e){
					if( e.originalEvent.touches.length == 1 ){
						// objektausschnitt verschieben
						/* C2 | user wants to move the section */
						if( this.is_zoomed ){
							this.prepare_section_move("minimap");
							this.execute_section_move(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY); /* instantly snap to target position */
							e.preventDefault();
						}
					}
				};
				Thrixty.Player.prototype.marker_touchstart = function(e){
					if( e.originalEvent.touches.length == 1 ){
						// objektausschnitt verschieben
						/* C2 | user wants to move the section */
						if( this.is_zoomed ){
							this.prepare_section_move("marker");
							this.execute_section_move(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY); /* instantly snap to target position */
							e.preventDefault();
						}
					}
				};
			/** /touchstart **/
			/** touchmove **/
				Thrixty.Player.prototype.document_touchmove = function(e){
					if( e.originalEvent.touches.length == 1 ){
						/* stop scrolling in fullpage mode */
						if( this.is_fullpage ){
							e.preventDefault();
						}
						/* C1 | user turns the object */
						if( this.object_turn.prepared ){
							this.execute_object_turn(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);
							e.preventDefault();
						}
						/* C2 | user moves the section */
						if( this.section_move.prepared ){
							this.execute_section_move(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);
							e.preventDefault();
						}
					}
				};
				Thrixty.Player.prototype.main_canvas_touchmove = function(e){/**/};
				Thrixty.Player.prototype.minimap_canvas_touchmove = function(e){/**/};
				Thrixty.Player.prototype.marker_touchmove = function(e){/**/};
			/** /touchmove **/
			/** touchend **/
				Thrixty.Player.prototype.document_touchend = function(e){
					/* C1 | user stops turning the object */
					if( this.object_turn.prepared ){
						// this.execute_object_turn(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY); /* do a final object turn */
						this.stop_object_turn();
						e.preventDefault();
					}
					/* C2 | user stops moving section */
					if( this.section_move.prepared ){
						// this.execute_section_move(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY); /* do a final section move */
						this.stop_section_move();
						e.preventDefault();
					}
					/* if this is still a click, toggle object rotation */
					if( this.is_click ){
						this.toggle_rotation();
						this.is_click = false;
					}
				};
				Thrixty.Player.prototype.main_canvas_touchend = function(e){/**/};
				Thrixty.Player.prototype.minimap_canvas_touchend = function(e){/**/};
				Thrixty.Player.prototype.marker_touchend = function(e){/**/};
			/** /touchend **/
			/** object turn **/
				Thrixty.Player.prototype.prepare_object_turn = function(x, y){
					if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
						/* prepare turn by memorizing important information */
						this.object_turn.prepared = true;
						this.object_turn.start_x = x;
						/* this.object_turn.start_y = y; *//* unused */
						this.object_turn.last_x = x;
						/* this.object_turn.last_y = y; */ /* unused */
					}
				};
				Thrixty.Player.prototype.execute_object_turn = function(x, y){
					if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
						/* distance travelled since last object turn call */
						var distance_x = x - this.object_turn.last_x;

						/* following 2 lines unused */
						/* phytagoras: d = sqrt( x^2 + y^2 ) */
						/* var distance = Math.pow( Math.pow( x - this.object_turn.start_x, 2) + Math.pow( y - this.object_turn.start_y, 2), 1/2 ); */

						if( Math.abs( x - this.object_turn.start_x) >= this.settings.sensitivity_x ){
							this.is_click = false;
							this.stop_rotation();
						}
						/* memorize x and subtract the left-over pixels */
						this.object_turn.last_x = x - this.distance_rotation(distance_x);
					}
				};
				Thrixty.Player.prototype.stop_object_turn = function(){
					/* forget the event data */
					this.object_turn.prepared = false;
					this.object_turn.last_x = null;
					/* this.object_turn.last_y = null; *//* unused */
				};
			/** /object turn **/
			/** section move **/
				Thrixty.Player.prototype.section_move = {
					prepared: false, /* prepared flag */
					minimap: false,  /* triggered-by-click-on-minimap flag */
				};
				Thrixty.Player.prototype.prepare_section_move = function(mode){
					if( typeof(mode) != "undefined" ){
						/* flag prepared */
						this.section_move.prepared = true;
						if( mode === "minimap" ){
							/* flag as minimap */
							this.section_move.minimap = true;
						}
					}
				};
				Thrixty.Player.prototype.execute_section_move = function(x, y){
					if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
						var coords = {x: x, y: y};

						/* if mode is minimap, convert minimap to main coordinates */
						if( this.section_move.minimap ){
							coords = this.minimap_to_main_coords(coords);
						}

						/* update mouseposition and redraw image */
								// TOCOME: this.set_absolute_mouseposition( coords.x, coords.y );
								// TOCOME: this.draw_current_image();
					}
				};
				Thrixty.Player.prototype.stop_section_move = function(){
					/* unflag prepared and unset mode*/
					this.section_move.prepared = false;
					this.section_move.minimap = false;
				};
			/** /section move **/
			/** window resize **/
				Thrixty.Player.prototype.resize_window_event = function(e){
					if( this.is_fullpage ){
						this.set_fullpage_dimensions();
					} else {
						this.set_normal_dimensions();
					}
				};
			/** /window resize **/
			/** scrolling **/
				Thrixty.Player.prototype.scroll_event = function(e){
					/* prevent the User from scrolling the content while in fullpage */
					if( this.is_fullpage ){
						e.preventDefault();
					}
				};
			/** /scrolling **/
		/*** /Interaction ***/
	/**** /HTML + EVENTS METHODS ****/


	/**** ROTATION METHODS ****/
		Thrixty.Player.prototype.rotation = function(){
			if( this.is_rotating ){
				if( this.rotation_count < 0 ){
					this.draw_next_image();
				} else if( this.rotation_count > 0 ){
					this.draw_next_image();
					this.rotation_count -= 1;
					if( this.rotation_count == 0 ){
						this.stop_rotation();
					}
				} else { /* == 0 */
					this.stop_rotation();
				}
			}
		};
		Thrixty.Player.prototype.start_rotation = function(times){
			if( !this.is_rotating ){
				if( typeof(times) === "undefined" ){
					this.rotation_count = -1;
				} else {
					this.rotation_count = times;
				}
				if( this.rotation_count != 0 ){
					/* animation is playing */
					this.is_rotating = true;
					this.DOM_obj.play_btn.setAttribute('state', 'play');
					/**/
					this.rotation();
					this.rotation_id = setInterval(this.rotation.bind(this), this.rotation_delay);
				}
			}
		};
		Thrixty.Player.prototype.stop_rotation = function(){
			if( this.is_rotating ){
				/**/
				clearInterval(this.rotation_id);
				this.rotation_id = 0;
				/* animation is paused */
				this.is_rotating = false;
				this.DOM_obj.play_btn.setAttribute('state', 'pause');
			}
		};
		Thrixty.Player.prototype.toggle_rotation = function(){
			if( this.is_rotating ){
				this.stop_rotation();
			} else {
				this.start_rotation();
			}
		};
		Thrixty.Player.prototype.distance_rotation = function(distance_x){
			/* mache umdrehungen anhand des distance_x mit einer bestimmten übersetzung */
			/* TODO: diese berechnung kann performanter gestaltet werden, indem die
			 *   zwischenergebnisse ausgelagert werden, anstatt sie immer wieder neu zu berechnen.
			 **/

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


			this.change_active_image_id(anzahl_nextimages);

			/* update View */
			this.draw_current_image();

			return rest_distanz;
		};
	/**** /ROTATION METHODS ****/

	/**** IMAGE STEERING METHODS ****/
		Thrixty.Player.prototype.change_active_image_id = function(amount){
			var id = 0;
			var count = 0;
			if( this.is_zoomed ){
				id = this.large.active_image_id;
				count = this.large.images_count;
			} else {
				id = this.small.active_image_id;
				count = this.small.images_count;
			}
			/* calc position */
			id = (id + amount) % count;
			if( id < 0 ){
				id = id + count;
			}
			/* asign position */
			if( this.is_zoomed ){
				this.small.active_image_id = this.large.images[id].to_small;
				this.large.active_image_id = id;
			} else {
				this.small.active_image_id = id;
				this.large.active_image_id = this.small.images[id].to_large;
			}
		};
		Thrixty.Player.prototype.draw_next_image = function(){
			this.change_active_image_id(1);
			this.draw_current_image();
		};
		Thrixty.Player.prototype.draw_previous_image = function(){
			this.change_active_image_id(-1);
			this.draw_current_image();
		};
	/**** /IMAGE STEERING METHODS ****/


	/**** DRAWING METHODS ****/
		Thrixty.Player.prototype.set_absolute_mouseposition = function(X, Y){
			this.absolute_mouse.x = X;
			this.absolute_mouse.y = Y;
		};
		Thrixty.Player.prototype.calculate_relative_mouse_position = function(){
			/* calculate relative mouse position */
			var cursor_x = (this.absolute_mouse.x - this.main_canvas.x);
			var cursor_y = (this.absolute_mouse.y - this.main_canvas.y);

			/* Borders - min and max values - reset, when overstepped */
			if( cursor_x < 0 ){
				cursor_x = 0;
			}
			if( cursor_x > this.main_canvas.vp_w ){
				cursor_x = this.main_canvas.vp_w;
			}
			if( cursor_y < 0 ){
				cursor_y = 0;
			}
			if( cursor_y > this.main_canvas.vp_h ){
				cursor_y = this.main_canvas.vp_h;
			}
			/* assign calculated values */
			this.relative_mouse.x = cursor_x;
			this.relative_mouse.y = cursor_y;
		};
		Thrixty.Player.prototype.get_zoom_offsets = function(){
			var position_percentage_x = ( this.relative_mouse.x / this.main_canvas.vp_w );
			var position_percentage_y = ( this.relative_mouse.y / this.main_canvas.vp_h );
			return {
				x: position_percentage_x * ( this.large.image_width - this.small.image_width ),
				y: position_percentage_y * ( this.large.image_height - this.small.image_height ),
			}
		};
		Thrixty.Player.prototype.draw_current_image = function(){
			if( !this.is_zoomed ){
				this.unzoomed();
			} else {
				if( this.settings.zoom_mode == "inbox" ){
					this.inbox_zoom();
				} else if( this.settings.zoom_mode == "outbox" ){
					if( !this.is_fullpage ){
						this.outbox_zoom();
					} else {
						this.inbox_zoom();
					}
				}
				if( this.settings.position_indicator == "minimap" ){
					this.draw_minimap();
				} else if( this.settings.position_indicator == "marker" ){
					this.set_marker_position();
				}
			}
		};
		Thrixty.Player.prototype.unzoomed = function(){
			/* Task: Draw the unzoomed image on the canvas */

			/* refresh main_canvas information (in case smt changed in viewport size) */
			this.main_canvas = this.get_main_canvas_dimensions();

			/* get current small image */
			var small_image = this.get_current_small_image();

			/* clear */
			// this.main_canvas.width = this.main_canvas.width;
			// this.main_canvas.height = this.main_canvas.height;
			this.main_canvas.ctx.clearRect(
				0,
				0,
				this.main_canvas.draw_w,
				this.main_canvas.draw_h
			);

			/* draw current small image */
			if( !!small_image ){
				this.main_canvas.ctx.drawImage(
					small_image,
					0,
					0
				);
			}
		};
		Thrixty.Player.prototype.inbox_zoom = function(){
			/* Task: Draw the enlarged image on the canvas */

			/* refresh main_canvas information (in case smt changed in viewport size) */
			this.main_canvas = this.get_main_canvas_dimensions();

			/* refresh class-variable relative_mouse */
			this.calculate_relative_mouse_position();

			/* get current offsets */
			var offsets = this.get_zoom_offsets();

			/* get current image */
			var large_image = this.get_current_large_image();

			/* clear canvas */
			this.main_canvas.ctx.clearRect(
				0,
				0,
				this.main_canvas.draw_w,
				this.main_canvas.draw_h
			);

			/* draw current image */
			if( !!large_image ){
				this.main_canvas.ctx.drawImage(
					large_image,
					0,
					0,
					large_image.naturalWidth, /* this needs to be calculated by the picture, as this varies from small to large */
					large_image.naturalHeight, /* this needs to be calculated by the picture, as this varies from small to large */
					-offsets.x,
					-offsets.y,
					this.large.image_width,
					this.large.image_height
				);
			}
		};
		Thrixty.Player.prototype.outbox_zoom = function(){
			/* Task: draw the elarged image on the zoom_canvas and the small image on the main_canvas */

			/* refresh main_canvas and zoom_canvas information (in case smt changed in viewport size) */
			this.main_canvas = this.get_main_canvas_dimensions();
			this.zoom_canvas = this.get_zoom_canvas_dimensions();

			/* refresh class-variable relative_mouse */
			this.calculate_relative_mouse_position();

			/* get current offsets */
			var offsets = this.get_zoom_offsets();

			/* get current image */
			var small_image = this.get_current_small_image();
			var large_image = this.get_current_large_image();



			/* clear main_canvas and zoom_canvas */
			this.main_canvas.ctx.clearRect(
				0,
				0,
				this.main_canvas.draw_w,
				this.main_canvas.draw_h
			);
			this.zoom_canvas.ctx.clearRect(
				0,
				0,
				this.zoom_canvas.draw_w,
				this.zoom_canvas.draw_h
			);

			/* draw small_image on main_canvas */
			if( !!small_image ){
				this.main_canvas.ctx.drawImage(
					small_image,
					0,
					0
				);
			}

			/* draw large_image on zoom_canvas */
			if( !!large_image ){
				this.zoom_canvas.ctx.drawImage(
					large_image,
					0,
					0,
					large_image.naturalWidth,
					large_image.naturalHeight,
					-offsets.x,
					-offsets.y,
					this.large.image_width,
					this.large.image_height
				);
			}
		};
		Thrixty.Player.prototype.draw_minimap = function(){
			/* Task: Draw the minimap on the minimap_canvas */

			/* width and height are already set globally in the HTML as inline-CSS. */

			/* refresh minimap_canvas information (in case smt changed in viewport size) */
			this.minimap_canvas = this.get_minimap_canvas_dimensions();

			/* get image */
			var small_image = this.get_current_small_image();

			/* calculate cutout dimensions */
			cutout_w = this.minimap_canvas.draw_w * (this.small.image_width / this.large.image_width);
			cutout_h = this.minimap_canvas.draw_h * (this.small.image_height / this.large.image_height);
			cutout_x = ( this.relative_mouse.x / this.main_canvas.vp_w ) * ( this.minimap_canvas.draw_w - cutout_w );
			cutout_y = ( this.relative_mouse.y / this.main_canvas.vp_h ) * ( this.minimap_canvas.draw_h - cutout_h );



			/* first clear canvas */
			this.minimap_canvas.ctx.clearRect(
				0,
				0,
				this.minimap_canvas.draw_w,
				this.minimap_canvas.draw_h
			);

			/* secondly draw image */
			if( !!small_image ){
				this.minimap_canvas.ctx.drawImage(
					small_image,
					0,
					0
				);
			}

			/* thirdly draw cutout */
			this.minimap_canvas.ctx.globalAlpha = 0.5;
				this.minimap_canvas.ctx.fillStyle = "black";
				this.minimap_canvas.ctx.beginPath();
					/* draw mask (rectangle clockwise) */
						this.minimap_canvas.ctx.moveTo(0, 0);
						this.minimap_canvas.ctx.lineTo(this.small.image_width, 0);
						this.minimap_canvas.ctx.lineTo(this.small.image_width, this.small.image_height);
						this.minimap_canvas.ctx.lineTo(0, this.small.image_height);
						this.minimap_canvas.ctx.lineTo(0, 0);
					/* "undraw" cutout (rectangle counterclockwise) */
						this.minimap_canvas.ctx.moveTo(cutout_x+0, cutout_y+0);
						this.minimap_canvas.ctx.lineTo(cutout_x+0, cutout_y+cutout_h);
						this.minimap_canvas.ctx.lineTo(cutout_x+cutout_w, cutout_y+cutout_h);
						this.minimap_canvas.ctx.lineTo(cutout_x+cutout_w, cutout_y+0);
						this.minimap_canvas.ctx.lineTo(cutout_x+0, cutout_y+0);
				this.minimap_canvas.ctx.closePath();
				this.minimap_canvas.ctx.fill();
			this.minimap_canvas.ctx.globalAlpha = 1;
		};
	/**** /DRAWING METHODS ****/


	/**** ZOOM METHODS ****/
		Thrixty.Player.prototype.start_zoom = function(){
			if( this.settings.zoom_mode != "none" ){
				/* set zoom flag */
				this.is_zoomed = true;

				/* do main_class's part of start_zoom routine: */
				/* set zoom button to zoomout */
				this.DOM_obj.zoom_btn.setAttribute('state', 'zoomout');

				/* simulate zoom start at the center of the canvas */
				var click_x = this.DOM_obj.main_canvas.getBoundingClientRect().left + document.body.scrollLeft + ( this.DOM_obj.main_canvas.offsetWidth / 2 );
				var click_y = this.DOM_obj.main_canvas.getBoundingClientRect().top + document.body.scrollTop + ( this.DOM_obj.main_canvas.offsetHeight / 2 );
							// TOCOME: this.set_absolute_mouseposition(click_x, click_y);

				/* check for position indicator wanted (for example a minimap) */
				if( this.settings.position_indicator == "minimap" ){
					this.DOM_obj.minimap_canvas.css("width", (this.small.image_width*100 / this.large.image_width)+"%");
					this.DOM_obj.minimap_canvas.css("height", (this.small.image_height*100 / this.large.image_height)+"%");
					this.DOM_obj.minimap_canvas.style.display = "";
				} else if( this.settings.position_indicator == "marker" ){
					this.DOM_obj.marker.style.display = "";
				}

				if( this.settings.zoom_mode == "outbox" ){
					/* only setup zoom outbox, when not in fullpage mode */
					if( !this.is_fullpage ){
								// TOCOME: this.setup_outbox();
					}
				}
			}
			this.draw_current_image();
		};
		Thrixty.Player.prototype.stop_zoom = function(){
			/* turn off zoom */
			this.is_zoomed = false;
			this.DOM_obj.zoom_btn.setAttribute('state', 'zoomin');
			/* hide zoombox */
			this.DOM_obj.zoom_canvas.style.display = "none";
			/* hide minimap_box */
			this.DOM_obj.minimap_canvas.style.display = "none";
			/* hide marker */
			this.DOM_obj.marker.style.display = "none";
			/* TODO: clear the variables set by drawing handler by [this.set_marker_position();] over [draw_current_image()] */
			/*       maybe implement resets for all canvasses? */
			/* draw unzoomed picture */
			this.draw_current_image();
		};
		Thrixty.Player.prototype.toggle_zoom = function(){
			if( !this.is_zoomed ){
				/* var was_rotating = this.is_rotating; */
				this.stop_rotation();
				this.start_zoom();
				/* if already rotating, refresh rotation frequency */
				/*if( was rotating ){
					this.start_rotation();
				}*/

			} else {
				this.stop_zoom();
				/* if already rotating, refresh rotation frequency */
				if( this.is_rotating ){
					this.start_rotation();
				}
			}
			/* refresh rotation delay */
						// TOCOME: this.set_rotation_delay();
		};
		Thrixty.Player.prototype.set_marker_position = function(){
			/* Dimensionate and position the marker correctly over the canvas */

			var W = this.DOM_obj.canvas_container.offsetWidth * this.small.image_width/this.large.image_width;
			var H = this.DOM_obj.canvas_container.offsetHeight * this.small.image_width/this.large.image_width;
			// this.drawing_handler.relative_mouse.x/y  will likely change
			var X = ( this.drawing_handler.relative_mouse.x / this.DOM_obj.canvas_container.offsetWidth ) * ( this.DOM_obj.canvas_container.offsetWidth - W );
			var Y = ( this.drawing_handler.relative_mouse.y / this.DOM_obj.canvas_container.offsetHeight ) * ( this.DOM_obj.canvas_container.offsetHeight - H );


			this.DOM_obj.marker.css("width",  W+"px");
			this.DOM_obj.marker.css("height", H+"px");
			this.DOM_obj.marker.css("left",   X+"px");
			this.DOM_obj.marker.css("top",    Y+"px");
		};
		Thrixty.Player.prototype.setup_outbox = function(){
			/* show zoom box at the selected position */
			this.DOM_obj.zoom_canvas.show();

			/* get main_canvas info */
			var main_canvas = this.get_main_canvas_dimensions();

			/* set zoom_canvas width */
			this.DOM_obj.zoom_canvas.height = main_canvas.draw_h;
			this.DOM_obj.zoom_canvas.width  = main_canvas.draw_w;
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
				this.DOM_obj.zoom_canvas.css('top', this.root_element.offsetHeight );
				this.DOM_obj.zoom_canvas.css('left', 0 );
			}
		};
	/**** /ZOOM METHODS ****/


	/**** FULLPAGE METHODS ****/
		Thrixty.Player.prototype.enter_fullpage = function(){
			this.stop_zoom();

			/* set fullpage state */
			this.is_fullpage = true;
			this.DOM_obj.size_btn.setAttribtue('state', 'normalsize');

			/* set root_element fullpage-styles */
			this.root_element.style.position = "fixed";
			this.root_element.style.left = "0";
			this.root_element.style.top = "0";
			this.root_element.style.width = "100%";
			this.root_element.style.height = "100%";
			this.root_element.style.border = "5px solid gray";
			this.root_element.style.background = "white";
			this.root_element.style.zIndex = "9999";


			/* set refreshing styles at start */
			this.set_fullpage_dimensions();
		};
		Thrixty.Player.prototype.quit_fullpage = function(){
			this.stop_zoom();

			/* reset fullpage state */
			this.is_fullpage = false;
			this.DOM_obj.size_btn.setAttribute('state', 'fullpage');

			/* unset root_element fullscreeen-styles */
			this.root_element.style.position = "";
			this.root_element.style.top = "";
			this.root_element.style.left = "";
			this.root_element.style.width = "";
			this.root_element.style.height = "";
			this.root_element.style.border = "";
			this.root_element.style.background = "";
			this.root_element.style.zIndex = "";


			/* unset canvas_container size modification */
			this.set_normal_dimensions();
		};
		Thrixty.Player.prototype.toggle_fullpage = function(){
			if( this.is_fullpage ){
				this.quit_fullpage();
			} else {
				this.enter_fullpage();
			}
		};
		Thrixty.Player.prototype.set_normal_dimensions = function(){
			/* set showrooms dimensions */

			var showroom_width = this.root_element.offsetWidth;
			var showroom_height = showroom_width / this.small.image_ratio;

			this.DOM_obj.showroom.css('width', showroom_width+'px');
			this.DOM_obj.showroom.css('height', showroom_height+'px');


			/* set canvas_container dimensions */

			var canvas_container_width = showroom_width;
			var canvas_container_height = showroom_height;
			var canvas_container_x = 0;
			var canvas_container_y = 0;


			this.DOM_obj.canvas_container.css('width', canvas_container_width+'px');
			this.DOM_obj.canvas_container.css('height', canvas_container_height+'px');
			this.DOM_obj.canvas_container.css('margin-left', canvas_container_x+'px');
			this.DOM_obj.canvas_container.css('margin-top', canvas_container_y+'px');
		};
		Thrixty.Player.prototype.set_fullpage_dimensions = function(){
			/* dont do anything, when not even in fullpage */
			if( this.is_fullpage ){

				/* set showrooms dimensions and consider the button height */
				var showroom_width = this.root_element.offsetWidth;
				var showroom_height = this.root_element.offsetHeight-50;

				this.DOM_obj.showroom.css('width', showroom_width+'px');
				this.DOM_obj.showroom.css('height', showroom_height+'px');



				/* gather basic information */
				if( !this.is_zoomed ){
					var image_aspect_ratio = this.small.image_ratio;
				} else {
					var image_aspect_ratio = this.large.image_ratio;
				}

				/* showroom aspect ratio for orientation */
				var showroom_aspect_ratio = showroom_width / showroom_height;

				/* portrait orientation [] */
				if( showroom_aspect_ratio <= image_aspect_ratio ){
					var canvas_container_width  = showroom_width;
					var canvas_container_height = showroom_width/image_aspect_ratio;

					var canvas_container_x      = 0;
					var canvas_container_y      = (showroom_height-canvas_container_height)/2;

				/* landscape orientation [___] */
				} else {
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
	/**** /FULLPAGE METHODS ****/



	/**** GETTER & SETTER ****/

		Thrixty.Player.prototype.set_image_offsets = function(){
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
		Thrixty.Player.prototype.set_rotation_delay = function(){
			var images_count = 0;
			if( !this.is_zoomed ){
				images_count = this.small.images_count;
			} else {
				images_count = this.large.images_count;
			}
			this.rotation_delay = Math.ceil( ( (1000 / images_count) * this.settings.cycle_duration ) / this.rotation_speed_modifiers[this.rotation_speed_selected] );
			/* restart rotation? */
			if( this.is_rotating ){
				this.stop_rotation();
				this.start_rotation();
			}
		};
		Thrixty.Player.prototype.increase_rotation_speed = function(){
			var sp_sel = this.rotation_speed_selected;
			sp_sel += 1;
			/* upper limit */
			if( sp_sel > this.rotation_speed_modifiers.length-1 ){
				sp_sel = this.rotation_speed_modifiers.length-1;
			}
			this.rotation_speed_selected = sp_sel;
			this.set_rotation_delay();
		};
		Thrixty.Player.prototype.decrease_rotation_speed = function(){
			var sp_sel = this.rotation_speed_selected;
			sp_sel -= 1;
			/* lower limit */
			if( sp_sel < 0 ){
				sp_sel = 0;
			}
			this.rotation_speed_selected = sp_sel;
			this.set_rotation_delay();
		};
		Thrixty.Player.prototype.minimap_to_main_coords = function(coords){
			// TODO: generalize size ratio
			var size_ratio_w = this.small.image_width / this.large.image_width;
			var size_ratio_h = this.small.image_height / this.large.image_height;
			// TODO: this fails in chrome, because they screwed up a part of the jquery function

			return {
				x: ( ( coords.x - this.root_element.getBoundingClientRect().left - document.body.scrollLeft ) / size_ratio_w ) + this.root_element.getBoundingClientRect().left + document.body.scrollLeft,
				y: ( ( coords.y - this.root_element.getBoundingClientRect().top - document.body.scrollTop ) / size_ratio_h ) + this.root_element.getBoundingClientRect().top + document.body.scrollTop,
			};
		};
		Thrixty.Player.prototype.get_current_small_image = function(){
			/* get and return the current small image */

			var cur_image = this.small.images[this.small.active_image_id];
			if( cur_image.elem_loaded ){
				return cur_image.element;
			} else {
				/* There is nothing to show */
				return null;
			}
		};
		Thrixty.Player.prototype.get_current_large_image = function(){
			/* get images (small for fallback) */
			var base_small = this.small.images[this.small.active_image_id];
			var base_large = this.large.images[this.large.active_image_id];

			/* if the large one is already loaded, return it */
			if( base_large.elem_loaded === true ){
				return base_large.element;
			}

			/* request the large picture, that should have been loaded now */
			if( base_large.elem_loaded === null ){
				this.load_one_image(this.large.images[this.large.active_image_id], this.DOM_obj.image_cache_large);
			}

			/* the large one isnt yet loaded, so fall back to the small one */
			return this.get_current_small_image();
		};
		Thrixty.Player.prototype.get_bg_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.bg_canvas,
				ctx: this.DOM_obj.bg_canvas.getContext("2d"),
				x: this.DOM_obj.bg_canvas.getBoundingClientRect().left + document.body.scrollLeft,
				y: this.DOM_obj.bg_canvas.getBoundingClientRect().top + document.body.scrollTop,
				draw_w: this.DOM_obj.bg_canvas.width,
				draw_h: this.DOM_obj.bg_canvas.height,
				vp_w: this.DOM_obj.bg_canvas.offsetWidth,
				vp_h: this.DOM_obj.bg_canvas.offsetHeight,
			}
		};
		Thrixty.Player.prototype.get_main_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.main_canvas,
				ctx: this.DOM_obj.main_canvas.getContext("2d"),
				x: this.DOM_obj.main_canvas.getBoundingClientRect().left + document.body.scrollLeft,
				y: this.DOM_obj.main_canvas.getBoundingClientRect().top + document.body.scrollTop,
				draw_w: this.DOM_obj.main_canvas.width,
				draw_h: this.DOM_obj.main_canvas.height,
				vp_w: this.DOM_obj.main_canvas.offsetWidth,
				vp_h: this.DOM_obj.main_canvas.offsetHeight,
			}
		};
		Thrixty.Player.prototype.get_minimap_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.minimap_canvas,
				ctx: this.DOM_obj.minimap_canvas.getContext("2d"),
				x: this.DOM_obj.minimap_canvas.getBoundingClientRect().left + document.body.scrollLeft,
				y: this.DOM_obj.minimap_canvas.getBoundingClientRect().top + document.body.scrollTop,
				draw_w: this.DOM_obj.minimap_canvas.width,
				draw_h: this.DOM_obj.minimap_canvas.height,
				vp_w: this.DOM_obj.minimap_canvas.offsetWidth,
				vp_h: this.DOM_obj.minimap_canvas.offsetHeight,
			}
		};
		Thrixty.Player.prototype.get_zoom_canvas_dimensions = function(){
			return {
				self: this.DOM_obj.zoom_canvas,
				ctx: this.DOM_obj.zoom_canvas.getContext("2d"),
				x: this.DOM_obj.zoom_canvas.getBoundingClientRect().left + document.body.scrollLeft,
				y: this.DOM_obj.zoom_canvas.getBoundingClientRect().top + document.body.scrollTop,
				draw_w: this.DOM_obj.zoom_canvas.width,
				draw_h: this.DOM_obj.zoom_canvas.height,
				vp_w: this.DOM_obj.zoom_canvas.offsetWidth,
				vp_h: this.DOM_obj.zoom_canvas.offsetHeight,
			}
		};
		Thrixty.Player.prototype.are_events_enabled = function(){
			if( this.loading_state >= 3 ){
				return true;
			} else {
				return false;
			}
		};

	/**** /GETTER & SETTER ****/








	Thrixty.Player.prototype.destruct = function(){
		// TODO: destruct this instance
		delete Thrixty.players[this.player_id];
	};
/***** /Class Player *****/





































/*

Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
*/