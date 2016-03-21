;"use strict";




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
/** TODO: rework this part to one liners **/
Thrixty.icons_cache = {};
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
(function(){
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









/* CLASS CONSTRUCTOR */
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
					jq_elem: jQuery("<img style=\"display: none;\" />"),
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
					jq_elem: jQuery("<img style=\"display: none;\" />"),
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




/***** LOADING METHODS *****/
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
/***** /LOADING METHODS *****/




/***** ROTATION METHODS *****/
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




/***** /ROTATION METHODS *****/

/***** IMAGE STEERING METHODS *****/
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
	Thrixty.Player.prototype.draw_current_image = function(){
		// TOCOME: actually draw this
	};
	Thrixty.Player.prototype.draw_next_image = function(){
		this.change_active_image_id(1);
		this.draw_current_image();
	};
	Thrixty.Player.prototype.draw_previous_image = function(){
		this.change_active_image_id(-1);
		this.draw_current_image();
	};
/***** /IMAGE STEERING METHODS *****/
/***** DRAWING METHODS *****/



/***** /DRAWING METHODS *****/


/****** ZOOM METHODS *****/
	Thrixty.Player.prototype.start_zoom = function(){
		if( this.settings.zoom_mode != "none" ){
			/* set zoom flag */
			this.is_zoomed = true;

			/* do main_class's part of start_zoom routine: */
			/* set zoom button to zoomout */
			this.DOM_obj.zoom_btn.setAttribute('state', 'zoomout');

			/* simulate zoom start at the center of the canvas */
			var click_x = this.DOM_obj.main_canvas.offset().left + ( this.DOM_obj.main_canvas.width() / 2 );
			var click_y = this.DOM_obj.main_canvas.offset().top + ( this.DOM_obj.main_canvas.height() / 2 );
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
	/**
	 *  @description This function switches the player back to the unzoomed state.
	 */
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
	/**
	 *  @description Toggles between zoomed and unzoomed state.
	 */
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


/****** /ZOOM METHODS *****/





// Thrixty.Player.prototype.










Thrixty.Player.prototype.destruct = function(){
	// TODO: destruct this instance
	delete Thrixty.players[this.player_id];
};











/*

Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
*/