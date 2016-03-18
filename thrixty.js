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
			this.DOM_obj.progress_bar_small = document.createElement("div");
			this.DOM_obj.progress_bar_small.setAttribute("class", "progress_bar_small");
			this.DOM_obj.progress_bar_small.setAttribute("state", "unloaded");
			this.DOM_obj.progress_bar_small.setAttribute("style", "width: 0%;");
			this.DOM_obj.progress_bar_large = document.createElement("div");
			this.DOM_obj.progress_bar_large.setAttribute("class", "progress_bar_large");
			this.DOM_obj.progress_bar_large.setAttribute("state", "unloaded");
			this.DOM_obj.progress_bar_large.setAttribute("style", "width: 0%;");
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
	this.loading_state = 0; /* the loading state of this player instance */
	this.execute_autostart = true;
	/* zoom state */
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



Thrixty.Player.prototype.load_small_filelist = function(){
	var xhr = new XMLHttpRequest();
	xhr.open("get", this.small.filepath, true);
	xhr.onreadystatechange = function(){
		if( xhr.readyState == 4 ){
			if( xhr.status == 200 ){
				Thrixty.log("basic (small) filelist found", this.player_id);
				this.small.filelist_loaded = true;
				this.small.filelist_content = xhr.responseText;
				this.update_loading_state();
			} else {
				Thrixty.log("basic (small) filelist not found", this.player_id);
				this.small.filelist_loaded = false;
				this.update_loading_state();
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
				this.large.filelist_content = xhr.responseText;
				this.update_loading_state();
			} else {
				Thrixty.log("large filelist not found", this.player_id);
				this.large.filelist_loaded = false;
				this.update_loading_state();
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
				this.update_loading_state();
			}.bind(this, i)
		);
		new_image_object.element.addEventListener(
			"error",
			function(index){
				this.small.images_errored += 1;
				this.small.images[index].elem_loaded = false;
				this.update_loading_state();
			}.bind(this, i)
		);
		if( this.settings.autoload ){
			new_image_object.element.src = new_image_object.source;
		} else {
			if( i == 0 ){
				new_image_object.element.src = new_image_object.source;
			}
		}

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
				this.update_loading_state();
			}.bind(this, i)
		);
		new_image_object.element.addEventListener(
			"error",
			function(index, e){
				this.large.images_errored += 1;
				this.large.images[index].elem_loaded = false;
				this.update_loading_state();
			}.bind(this, i)
		);

		//if( this.settings.autoload ){
		//	if( i == 0 ){ /* only preload first large image */
		//		new_image_object.element.src = new_image_object.source;
		//	}
		//}

		// append
		this.large.images.push( new_image_object );
	}
};











Thrixty.Player.prototype.update_loading_state = function(){
	/**
	 *   STATES:
	 *   -n:  ERROR
	 *    0:  init
	 *    1:  initialized
	 *
	 *
	 *
	 *
	 *
	 **/


/* 0:initializing | 1:initialized | 2:displayable | 3:playable | 4:zoomable | 5:completed */
	switch( this.loading_state ){
		//// TODO: case: -1 etc.
		case 0: /* [initalizing] */
			if( this.small.filelist_loaded !== true || this.large.filelist_loaded === null ){
				break;
			} else {
				this.build_html_structure();
				/* load filelists */
				this.parse_small_filelist();
				this.parse_large_filelist();

				/** FALLTROUGH **/
			}
		case 1: /* [initialized] */
		case 2: /* [displayable] */
		case 3: /* [playable] */
		case 4: /* [zoomable] */
		/* !INTENDED FALLTHROUGHS! */
			/* get count informations */
			var s_count = this.small.images_count;
			var s_load  = this.small.images_loaded + this.small.images_errored;
			var l_count = this.large.images_count;
			var l_load  = this.large.images_loaded + this.large.images_errored;

			switch( true ){
				case (s_load == 0):
					// => 1 [initialized]
					console.log("=> [initialized]");
					if( this.loading_state !== 1 ){
						Thrixty.log("Wechsel zu Ladestatus 1 (initialized)", this.player_id);
						this.loading_state = 1; /* [initialized] */

						this.DOM_obj.showroom.style.display = "none";
						this.DOM_obj.controls.style.display = "none";
						this.DOM_obj.size_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.prev_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.play_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.next_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");
					}
				break;
				case (s_load >= 1 && s_load < s_count):
					// => 2 [displayable]
					console.log("=> [displayable]");
					if( this.loading_state != 2){
						Thrixty.log("Wechsel zu Ladestatus 2 (displayable)", this.player_id);
						this.loading_state = 2;

						this.DOM_obj.showroom.style.display = "";
						this.DOM_obj.controls.style.display = "";
						this.DOM_obj.size_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.prev_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.play_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.next_btn.setAttribute("disabled", "disabled");
						this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");

						if( !this.settings.autoload ){
							this.DOM_obj.load_overlay.style.display = "";
							this.DOM_obj.load_btn.style.display = "";
						}
					}
				break;
				case (s_load == s_count && l_load == 0):
					// => 3 [playable]
					console.log("=> [playable]");

					if( this.loading_state != 3 ){
						Thrixty.log("Wechsel zu Ladestatus 3 (playable)", this.player_id);
						this.loading_state = 3;

						this.DOM_obj.showroom.style.display = "";
						this.DOM_obj.controls.style.display = "";
						this.DOM_obj.size_btn.removeAttribute("disabled");
						this.DOM_obj.prev_btn.removeAttribute("disabled");
						this.DOM_obj.play_btn.removeAttribute("disabled");
						this.DOM_obj.next_btn.removeAttribute("disabled");
						if( this.settings.zoom_mode != "none" && this.large.filelist_loaded === true ){
							this.DOM_obj.zoom_btn.removeAttribute("disabled");
							// this.large.images[0].element.src = this.large.images[0].source;
						} else {
							this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");
						}

						if( this.execute_autostart ){
							// this.all_images_loaded();
							this.execute_autostart = false;
						}
					}
				break;
				case (s_load == s_count && l_load >= 1 && l_load < l_count):
					// => 4 [zoomable]
					console.log("=> [zoomable]");
				break;
				case (s_load == s_count && l_load == l_count):
					// => 5 [completed]
					console.log("=> [completed]");
				break;
				default:
					// error: smt is wrong
				break;
			}
		break;
		case 5: /* [completed] */
			//
		break;
		default:
			//
		break;
	}
};


Thrixty.Player.prototype.build_html_structure = function(){
	/* this is the main part of the player - image show area */
		this.root_element.appendChild(this.DOM_obj.showroom);
			this.DOM_obj.showroom.appendChild(this.DOM_obj.canvas_container);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.bg_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.main_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.minimap_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.marker);
			this.DOM_obj.showroom.appendChild(this.DOM_obj.progress_container);
				this.DOM_obj.progress_container.appendChild(this.DOM_obj.progress_bar_small);
				this.DOM_obj.progress_container.appendChild(this.DOM_obj.progress_bar_large);

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
Thrixty.Player.prototype.all_images_loaded = function(){
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
};






/*{











	var a = document.createElement("object");
	a.setAttribute("data", this.small.filepath);
	a.setAttribute("style", "width:0;height:0;margin:0;padding:0;border:0;display:none;");
	a.addEventListener(
		"load",
		function(){
			this.small.filelist_content = a.contentDocument.body.innerText;
			this.root_element.removeChild(a);
		}.bind(this)
	)
	this.root_element.appendChild(a);





	var b = new XMLHttpRequest();
	b.onreadystatechange = function(){
		if( b.readyState == 4 && b.status == 200 ){
			this.large.filelist_content = b.responseText;
			this.parse_filelist(this.large.filelist_content);
		}
	}.bind(this);
	b.open("GET", this.large.filepath);
	b.send();


};*/










Thrixty.Player.prototype.destruct = function(){
	// TODO: destruct this instance
	delete Thrixty.players[this.player_id];
};










Thrixty.Player.get_file = function(url, callback){
	//
	var xhr = new XMLHttpRequest();
};









Thrixty.Player.prototype.setup = function(){



return null;
//
//					/* / / 3.) informationsquellen miteinander verquicken */
//
//					/* Set the values for the possibly different image count. */
//					this.set_image_offsets();
//					this.set_rotation_delay();
//
//					/* Now set loading state (nothing is loaded yet) */
//					this.update_loading_state();
};







//Thrixty.Player.prototype.read_filelist = function(load_obj){
//	var that = this;
//	var return_value = false;
//
//	/* get url */
//	var url = load_obj.filepath;
//
//	Thrixty.log("filelist path: "+url, this.player_id);
//	/* execute AJAX request */
//	jQuery.ajax({
//		async: false, /* SYNCHRONOUS IS IMPORTANT! The gathered information is depending on each other. */
//		url: url,
//		type: "get",
//		dataType: "text",
//		error: function(jQueryXHTMLresponse, textStatus, errorThrown){
//			Thrixty.log("filelist requested at >>"+url+"<< could not be retrieved. || "+jQueryXHTMLresponse.status+": "+jQueryXHTMLresponse.statusText, that.player_id);
//			load_obj.filelist_loaded = false;
//		},
//		success: function(data, textStatus, jQueryXHTMLresponse){
//			/* parse data */
//			Thrixty.log("filelist >>"+url+"<< successfully retrieved.", that.player_id);
//			load_obj.filelist_loaded = that.parse_filelist(load_obj, data);
//		}
//	});
//};
//Thrixty.Player.prototype.parse_filelista = function(load_obj, filelist){
//	/* parse die liste aus und speichere die sources im array */
//	var image_paths = filelist.replace(/[\s'"]/g,"").split(",");
//
//	/* option for reverse turned on, reverse array */
//	if( this.settings.direction != 0 ){
//		image_paths.reverse();
//	}
//
//	/* loop through all paths */
//	var pic_count = image_paths.length;
//	/*( if length <= 0 raise error )*/
//	for( var i=0; i<pic_count; i++ ){
//		/* create new image object */
//		var new_image = {
//			id: i,
//			source: image_paths[i],
//			jq_elem: jQuery("<img style=\"display: none;\" />"),
//			elem_loaded: null,  /* null = not yet loaded, false = failed to load, true = is loaded */
//			to_small: null,
//			to_large: null,
//		};
//		/* count object */
//		load_obj.images_count += 1;
//		/* assign object */
//		load_obj.images[i] = new_image;
//	}
//
//	/* no errors (?) */
//	Thrixty.log("The filelist was separated into "+pic_count+" individual paths.", this.player_id);
//	return true;
//};











/*
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
Thrixty.Player.prototype.
*/