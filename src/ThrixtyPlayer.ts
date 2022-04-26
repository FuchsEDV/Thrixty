"use strict";

import { createClassifier } from "typescript";
import { Thrixty } from "./Thrixty";
import { ThrixtySettings, ThrixtyDOMObject, ThrixtyImageInfo, ThrixtyImage, Coords } from "./ThrixtyInterfaces";

export class ThrixtyPlayer {
    player_id: number;
    root_element: HTMLElement;

    settings: ThrixtySettings;
    
    events_assigned: boolean;
    can_zoom: boolean | null;
    canvas_size: number | null;
    is_zoomed: boolean;
    is_fullpage: boolean;

    is_rotating: boolean;
	rotation_id: NodeJS.Timer | number;
	rotation_count: number;
	rotation_delay: number;
	rotation_speed_modifiers: number[];
	rotation_speed_selected: number;

    DOM_obj: ThrixtyDOMObject;

    small: ThrixtyImageInfo;
    large: ThrixtyImageInfo;

    object_turn: { prepared: boolean, start_x: number | null, start_y: number | null, last_x: number | null, last_y: number | null };
    is_click: boolean;
    prev_btn_event_vars: { iv_id: number };

    relative_mouse: { x: number, y: number };
    section_move: { prepared: boolean, minimap: boolean };

    pixel_per_degree: number;

    constructor(root_elem: HTMLElement) {
        Thrixty.players.push(this);

        this.player_id = Thrixty.players.indexOf(this);
        this.root_element = root_elem;

        // tabindex needed for being focusable (actual id is not important)
        if(!this.root_element.getAttribute("tabindex")) {
            this.root_element.setAttribute("tabindex", String(this.player_id));
        }
        this.root_element.setAttribute("thrixty", "found");

        // Options
        this.settings = {
            basepath: "", // relative to current URL
            localization_path: "./thrixty/text.json",
            filelist_path_small: "small/Filelist.txt",
            filelist_path_large: "large/Filelist.txt",
            reversed_play_direction: false, // false|true <=> left|right
            reversed_drag_direction: false,
            autoplay: -1,
            autoload: !Thrixty.is_mobile,
            start_image_id: 0,
            cycle_duration: 5,
            zoom_control: "progressive",
            zoom_mode: "outbox",
            zoom_mode_mobile: "inbox",
            zoom_pointer: "marker",
            marker_mode: "new",
            sensitivity_x: 20,
            sensitivity_y: 50,
        };

        // State variables
        this.events_assigned = false;
        // -- zoom state --
        this.can_zoom = null;
        this.canvas_size = null; // 0: small, 1: large, null: N/A
        this.is_zoomed = false;
        this.is_fullpage = false;
        // -- rotation state --
        this.is_rotating = false;
		this.rotation_id = 0;
		this.rotation_count = -1;
		this.rotation_delay = 100;
		this.rotation_speed_modifiers = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.4, 2, 2.5, 3.2, 4];
		this.rotation_speed_selected = 5;

        // HTML objects
        this.DOM_obj = {
            showroom: Thrixty.create_element("<div id='showroom_" + (this.player_id + 1) + "' class='thrixty_showroom'></div>"),
                canvas_container: Thrixty.create_element("<div id='canvas_container_" + (this.player_id + 1) + "' class='thrixty_canvas_container'></div>"),
                    bg_canvas: Thrixty.create_element("<canvas id='bg_canvas_" + (this.player_id + 1) + "' class='canvas thrixty_bg_canvas' width='0' height='0'></canvas>") as HTMLCanvasElement,
                    main_canvas: Thrixty.create_element("<canvas id='main_canvas_" + (this.player_id + 1) + "' class='canvas thrixty_main_canvas' width='0' height='0'></canvas>") as HTMLCanvasElement,
                    minimap_canvas: Thrixty.create_element("<canvas id='minimap_canvas_" + (this.player_id + 1) + "' class='canvas thrixty_minimap_canvas' width='0' height='0'></canvas>") as HTMLCanvasElement,
                    marker: Thrixty.create_element("<div id='marker_" + (this.player_id + 1) + "' class='thrixty_marker'></div>"),
                progress_container: Thrixty.create_element("<div id='progress_container_" + (this.player_id + 1) + "' class='thrixty_progress_container'></div>"),
                    small_progress_bar: Thrixty.create_element("<div id='small_progress_bar_" + (this.player_id + 1) + "' class='thrixty_small_progress_bar' thrixty-state='unloaded'></div>"),
            controls: Thrixty.create_element("<div class='thrixty_controls'></div>"),
                control_container_one: Thrixty.create_element("<div class='thrixty_control_container_one'></div>"),
                prev_btn: Thrixty.create_element("<button id='prev_btn_" + (this.player_id + 1) + "' class='ctrl_buttons thrixty_prev_btn'></button>"),
                    prev_icon: Thrixty.create_element("<svg id='prev_icon_" + (this.player_id + 1) + "' class='icons thrixty_prev_icon' viewBox='0 0 100 100'>"+Thrixty.icons["prev_icon"]+"</svg>"),
                play_btn: Thrixty.create_element("<button id='play_btn_" + (this.player_id + 1) + "' class='ctrl_buttons thrixty_play_btn' thrixty-state='pause'></button>"),
                    play_icon: Thrixty.create_element("<svg id='play_icon_" + (this.player_id + 1) + "' class='icons thrixty_play_icon' viewBox='0 0 100 100'>"+Thrixty.icons["play_icon"]+"</svg>"),
                    pause_icon: Thrixty.create_element("<svg id='pause_icon_" + (this.player_id + 1) + "' class='icons thrixty_pause_icon' viewBox='0 0 100 100'>"+Thrixty.icons["pause_icon"]+"</svg>"),
                next_btn: Thrixty.create_element("<button id='next_btn_" + (this.player_id + 1) + "' class='ctrl_buttons thrixty_next_btn'></button>"),
                    next_icon: Thrixty.create_element("<svg id='next_icon_" + (this.player_id + 1) + "' class='icons thrixty_next_icon' viewBox='0 0 100 100'>"+Thrixty.icons["next_icon"]+"</svg>"),
                zoom_btn: Thrixty.create_element("<button id='zoom_btn_" + (this.player_id + 1) + "' class='ctrl_buttons thrixty_zoom_btn' thrixty-state='zoomed_out'></button>"),
                    zoom_in_icon: Thrixty.create_element("<svg id='zoom_in_icon_" + (this.player_id + 1) + "' class='icons thrixty_zoom_in_icon' viewBox='0 0 100 100'>"+Thrixty.icons["zoom_in_icon"]+"</svg>"),
                    zoom_out_icon: Thrixty.create_element("<svg id='zoom_out_icon_" + (this.player_id + 1) + "' class='icons thrixty_zoom_out_icon' viewBox='0 0 100 100'>"+Thrixty.icons["zoom_out_icon"]+"</svg>"),
                size_btn: Thrixty.create_element("<button id='size_btn_" + (this.player_id + 1) + "' class='ctrl_buttons thrixty_size_btn' thrixty-state='normalsized'></button>"),
                    fullsize_icon: Thrixty.create_element("<svg id='fullsize_icon_" + (this.player_id + 1) + "' class='icons thrixty_fullsize_icon' viewBox='0 0 100 100'>"+Thrixty.icons["fullsize_icon"]+"</svg>"),
                    normalsize_icon: Thrixty.create_element("<svg id='normalsize_icon_" + (this.player_id + 1) + "' class='icons thrixty_normalsize_icon' viewBox='0 0 100 100'>"+Thrixty.icons["normalsize_icon"]+"</svg>"),
                close_btn: Thrixty.create_element("<button id='close_btn_" + (this.player_id + 1) + "' class='thrixty_close_btn'></button>"),
                    close_icon: Thrixty.create_element("<span class='thrixty_close_icon'>\u00d7</span>"),
                rotation_speed_gauge: Thrixty.create_element("<input type='range' id='rotation_speed_gauge_" + (this.player_id + 1) + "' class='thrixty_rotation_speed_gauge' min='0' max='10' value='5'>"),
            load_overlay: Thrixty.create_element("<div id='load_overlay_" + (this.player_id + 1) + "' class='thrixty_load_overlay'></div>"),
                load_btn: Thrixty.create_element("<button id='load_btn_" + (this.player_id + 1) + "' class='thrixty_load_btn'></button>"),
                    load_icon: Thrixty.create_element("<svg id='load_icon_" + (this.player_id + 1) + "' class='icons thrixty_load_icon' viewBox='0 0 100 100'>"+Thrixty.icons["load_icon"]+"</svg>"),
            zoom_advisory: Thrixty.create_element("<div id='zoom_advisory_" + (this.player_id + 1) + "' class='thrixty_zoom_advisory'></div>"),
            zoom_canvas: document.getElementById("thrixty_zoom_canvas_" + (this.player_id + 1)) as HTMLCanvasElement,
        };
        if (!this.DOM_obj.zoom_canvas) {
            throw Error("No zoom canvas found for player id " + this.player_id);
        }
        this.DOM_obj.zoom_canvas.setAttribute("thrixty", "found");

        // Images
        this.small = {
            filepath: "",
            filelist_content: "",
            filelist_loaded: null,
            images_count: 0,
            images_loaded: 0,
            images_errored: 0,
            images: [],
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
            context: "large",
            image_width: 0,
            image_height: 0,
            image_ratio: 0,
            active_image_id: 0,
        };

        // HTML object event vars
        this.object_turn = {
            prepared: false,
            start_x: null,
            start_y: null,
            last_x: null,
            last_y: null,
        };
        this.is_click = false;
        this.prev_btn_event_vars = {
            iv_id: 0,
        };

        // Drawing properties
        // -- Mouse position relative to the main canvas' upper-left-hand corner
        this.relative_mouse = {
            x: 0,
            y: 0,
        };

        this.section_move = {
            prepared: false, /* prepared flag */
            minimap: false,  /* triggered-by-click-on-minimap flag */
        };

        this.pixel_per_degree = 2;

        // Method throttling
        this.draw_current_image = Thrixty.throttle(this.draw_current_image, 40);

        Thrixty.log("Player (id == " + +this.player_id + ") initializing.", this.player_id);

        this.#init_a();
    }

    // INITIALIZATION PART A
    #init_a(): void {
        this.#parse_settings();
        this.#check_settings();
        this.#setup_localization();
        this.#load_small_filelist();
        if (this.can_zoom !== false) {
            this.#load_large_filelist();
        }
    }

    #setup_localization(): void {
        fetch(this.settings.localization_path, {
            method: "get"
        }).then(response => {
            response.json().then(data => {
                // Zoom advisory
                for (let lang in data.thrixty_zoom_advisory) {
                    if(document.documentElement.lang === lang) {
                        this.DOM_obj.zoom_advisory.innerHTML = "<p>" + data.thrixty_zoom_advisory[lang] + "</p>";
                        return;
                    }
                }
                this.DOM_obj.zoom_advisory.innerHTML = "No text for language " + document.documentElement.lang;

                // (other elements, if added)
            });
        }).catch(function(err) {
            throw Error("Error fetching text.json");
        });
    }

    #parse_settings(): void {
        let main_box_attributes: NamedNodeMap = this.root_element.attributes;
        for(let attr of main_box_attributes) {
            let attr_value: string = attr.value.trim();
            switch(attr.name) {
                case "thrixty-basepath":
                    // TODO: check for valid URL
                    if (attr_value != "") {
                        this.settings.basepath = attr_value;
                    }
                    break;
                case "thrixty-localization-path":
                    if (attr_value != "") {
                        this.settings.localization_path = attr_value;
                    }
                    break;
                case "thrixty-filelist-path-small":
                    // TODO: check for valid URL
                    if (attr_value != "") {
                        this.settings.filelist_path_small = attr_value;
                    }
                case "thrixty-filelist-path-large":
                    // TODO: check for valid URL
                    if (attr_value != "") {
                        this.settings.filelist_path_large = attr_value;
                    }
                case "thrixty-play-direction":
                    switch(attr_value) {
                        case "normal":
                            this.settings.reversed_play_direction = false;
							break;
                        case "reverse":
                        case "reversed":
                            this.settings.reversed_play_direction = true;
                            break;
                    }
                    break;
                case "thrixty-drag-direction":
                    switch(attr_value) {
                        case "normal":
                            this.settings.reversed_drag_direction = false;
                            break;
                        case "reverse":
                        case "reversed":
                            this.settings.reversed_drag_direction = true;
                            break;
                    }
                    break;
                case "thrixty-autoload":
                    if (Thrixty.is_mobile) {
                        this.settings.autoload = false;
                    } else {
                        switch(attr_value) {
                            case "on":
                                this.settings.autoload = true;
                                break;
                            case "off":
                                this.settings.autoload = false;
                                break;
                        }
                    }
                    break;
                case "thrixty-autoplay":
                    switch(attr_value) {
                        case "on":
                        case "-1":
                            this.settings.autoplay = -1;
                            break;
                        case "off":
                        case "0":
                            this.settings.autoplay = 0;
                            break;
                        default:
                            let attr_value_int: number = parseInt(attr_value);
                            if (attr_value_int > 0) {
                                this.settings.autoplay = attr_value_int;
                            }
                            break;
                    }
                    break;
                case "thrixty-start-image-id":
                    let attr_value_int: number = parseInt(attr_value);
                    if (attr_value_int >= 0) {
                        this.settings.start_image_id = attr_value_int;
                    }
                    break;
                case "thrixty-cycle-duration":
                    if (attr_value != "") {
                        let attr_value_int: number = parseInt(attr_value);
                        if (attr_value_int > 0) {
                            this.settings.cycle_duration = attr_value_int;
                        }
                    }
                    break;
                case "thrixty-zoom-control":
                    switch (attr_value) {
                        case "progressive":
                        case "classic":
                            this.settings.zoom_control = attr_value;
                            break;
                    }
                    break;
                case "thrixty-zoom-mode":
                    switch (attr_value) {
                        case "inbox":
                        case "outbox":
                        case "none":
                            this.settings.zoom_mode = attr_value;
                            break;
                    }
                    break;
                case "thrixty-zoom-mode-mobile":
                    switch (attr_value) {
                        case "inbox":
                        case "outbox":
                        case "none":
                            this.settings.zoom_mode_mobile = attr_value;
                            break;
                    }
                    break;
                case "thrixty-zoom-pointer":
                    switch (attr_value) {
                        case "minimap":
                        case "marker":
                            this.settings.zoom_pointer = attr_value;
                            break;
                        case "none":
                        case "":
                            this.settings.zoom_pointer = "";
                            break;
                    }
                    break;
                case "thrixty-marker-mode":
                    switch (attr_value) {
                        case "new":
                        case "old":
                            this.settings.marker_mode = attr_value;
                            break;
                    }
                    break;
                case "thrixty-sensitivity-x":
                    if (attr_value != "") {
                        let attr_value_int: number = parseInt(attr_value);
                        if (attr_value_int >= 0) {
                            this.settings.sensitivity_x = attr_value_int;
                        }
                    }
                    break;
                case "thrixty-sensitivity-y":
                    if (attr_value != "") {
                        let attr_value_int: number = parseInt(attr_value);
                        if (attr_value_int >= 0) {
                            this.settings.sensitivity_y = attr_value_int;
                        }
                     }
                    break;
                default:
                    break;
            }

            let small_url: string = this.settings.basepath;
            let large_url: string = this.settings.basepath;
            if (small_url != "") {
                small_url += small_url.charAt(small_url.length - 1) === "/" ? "" : "/";
            }
            if (large_url != "") {
                large_url += large_url.charAt(large_url.length - 1) === "/" ? "" : "/";
            }
            small_url += this.settings.filelist_path_small;
            large_url += this.settings.filelist_path_large;

            this.small.filepath = small_url;
            this.large.filepath = large_url;
        }
    }

    #check_settings(): void {
        // TODO: actually check settings for mandatories etc.
        if (this.settings.zoom_mode == "none" && !Thrixty.is_mobile || this.settings.zoom_mode_mobile == "none" && Thrixty.is_mobile) {
            this.can_zoom = false;
        }
    }

    #load_small_filelist(): void {
       let player = this;
       let xhr = new XMLHttpRequest();
       xhr.open("get", this.small.filepath, true);
       xhr.onreadystatechange = function() {
           if (this.readyState == 4) {
               if (this.status == 200) {
                   Thrixty.log("basic (small) filelist found", player.player_id);
                   player.small.filelist_loaded = true;
                   player.small.filelist_content = xhr.responseText;
               } else {
                   Thrixty.log("basic (small) filelist not found", player.player_id);
                   player.small.filelist_loaded = false;
               }
               player.#check_init_b();
           }
       }
       xhr.send(null);
    }

    #load_large_filelist(): void {
        let player = this;
        let xhr = new XMLHttpRequest();
        xhr.open("get", this.large.filepath, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    Thrixty.log("large filelist found", player.player_id);
                    player.large.filelist_loaded = true;
                    player.large.filelist_content = xhr.responseText;
                    player.can_zoom = true; // large exclusive
                } else {
                    Thrixty.log("large filelist not found", player.player_id);
                    player.large.filelist_loaded = false;
                    player.can_zoom = false; // large exclusive
                }
                player.#check_init_b();
            }
        }
        xhr.send(null);
    }
    
    #check_init_b(): void {
        // TODO: error, if no large filelist given?
        if (this.small.filelist_loaded !== null && this.large.filelist_loaded !== null) {
            this.#init_b();
        }
    }
    // /INITIALIZATION PART A

    // INITIALIZATION PART B
    #init_b(): void {
        this.#parse_small_filelist();
        if (this.can_zoom) {
            this.#parse_large_filelist();
        }
        this.#build_html_structure();
        this.#set_image_offsets();
        this.#set_rotation_delay();
        this.#stop_zoom();
        if (this.settings.autoload) {
            this.#load_all_small_images();
            if (this.settings.marker_mode == "new") {
                this.#load_all_large_images();
            }
        } else {
            this.#load_small_image(0);
        }
        if (this.can_zoom) {
            this.#load_large_image(0);
        }
    }

    #parse_small_filelist(): void {
        this.small.images = [];
        let image_paths: string[] = this.#parse_filelist_content(this.small.filelist_content);
        let pic_count: number = image_paths.length;
        this.small.images_count = pic_count;
        for (let i = 0; i < pic_count; i++) {
            let new_image: ThrixtyImage = {
                id: i,
				source: image_paths[i],
				elem_loaded: null,  // null = not yet loaded, false = failed to load, true = is loaded
				to_small: null,
				to_large: null,
				element: document.createElement("img"),
            }
            new_image.element.addEventListener("load", this.#init_small_all.bind(this, i));
            new_image.element.addEventListener("error", this.#init_small_all.bind(this, i));
            this.small.images.push(new_image);
        }
    }

    #parse_large_filelist(): void {
        this.large.images = [];
        let image_paths: string[] = this.#parse_filelist_content(this.large.filelist_content);
        let pic_count: number = image_paths.length;
        this.large.images_count = pic_count;
        for (let i = 0; i < pic_count; i++) {
            let new_image: ThrixtyImage = {
                id: i,
				source: image_paths[i],
				elem_loaded: null,  // null = not yet loaded, false = failed to load, true = is loaded
				to_small: null,
				to_large: null,
				element: document.createElement("img"),
            }
            new_image.element.addEventListener("load", this.#init_large_all.bind(this, i));
            new_image.element.addEventListener("error", this.#init_large_all.bind(this, i));
            this.large.images.push(new_image);
        }
    }

    #build_html_structure(): void {
        // pre-hide player
        this.root_element.style.display = "none";
		this.DOM_obj.minimap_canvas.style.display = "none";
		this.DOM_obj.marker.style.display = "none";
        this.DOM_obj.close_btn.style.display = "none";

        // pre-disable buttons
        this.DOM_obj.size_btn.setAttribute("disabled", "disabled");
		this.DOM_obj.prev_btn.setAttribute("disabled", "disabled");
		this.DOM_obj.play_btn.setAttribute("disabled", "disabled");
		this.DOM_obj.next_btn.setAttribute("disabled", "disabled");
		this.DOM_obj.zoom_btn.setAttribute("disabled", "disabled");

        this.root_element.appendChild(this.DOM_obj.showroom);
			this.DOM_obj.showroom.appendChild(this.DOM_obj.canvas_container);
            this.DOM_obj.showroom.appendChild(this.DOM_obj.close_btn);
            this.DOM_obj.close_btn.appendChild(this.DOM_obj.close_icon);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.bg_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.main_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.minimap_canvas);
				this.DOM_obj.canvas_container.appendChild(this.DOM_obj.marker);
			this.DOM_obj.showroom.appendChild(this.DOM_obj.progress_container);
				this.DOM_obj.progress_container.appendChild(this.DOM_obj.small_progress_bar);
        this.root_element.appendChild(this.DOM_obj.controls);
			this.DOM_obj.controls.appendChild(this.DOM_obj.control_container_one);
				this.DOM_obj.control_container_one.appendChild(this.DOM_obj.prev_btn);
					this.DOM_obj.prev_btn.appendChild(this.DOM_obj.prev_icon);
                this.DOM_obj.control_container_one.appendChild(this.DOM_obj.play_btn);
					this.DOM_obj.play_btn.appendChild(this.DOM_obj.play_icon);
					this.DOM_obj.play_btn.appendChild(this.DOM_obj.pause_icon);
				this.DOM_obj.control_container_one.appendChild(this.DOM_obj.next_btn);
					this.DOM_obj.next_btn.appendChild(this.DOM_obj.next_icon);
				this.DOM_obj.control_container_one.appendChild(this.DOM_obj.zoom_btn);
					this.DOM_obj.zoom_btn.appendChild(this.DOM_obj.zoom_in_icon);
					this.DOM_obj.zoom_btn.appendChild(this.DOM_obj.zoom_out_icon);
				this.DOM_obj.control_container_one.appendChild(this.DOM_obj.size_btn);
					this.DOM_obj.size_btn.appendChild(this.DOM_obj.fullsize_icon);
					this.DOM_obj.size_btn.appendChild(this.DOM_obj.normalsize_icon);
                this.DOM_obj.control_container_one.appendChild(this.DOM_obj.rotation_speed_gauge);
				if (!this.settings.autoload) {
					this.root_element.appendChild(this.DOM_obj.load_overlay);
						this.DOM_obj.load_overlay.appendChild(this.DOM_obj.load_btn);
						    this.DOM_obj.load_btn.appendChild(this.DOM_obj.load_icon);
                }
        this.root_element.appendChild(this.DOM_obj.zoom_advisory);
        if (Thrixty.is_mobile) {
            this.DOM_obj.size_btn.style.display = "none";
        }

        this.DOM_obj.zoom_btn.style.display = "none";

        this.#assign_events();
    }

    #load_small_image(index: number): void {
        let src: string = this.small.images[index].source;
        this.small.images[index].element.src = src;
    }

    #load_all_small_images(): void {
        let count: number = this.small.images_count;
        for (let i = 0; i < count; i++) {
            this.#load_small_image(i);
        }
    }

    #load_large_image(index: number): void {
        let src: string = this.large.images[index].source;
        this.large.images[index].element.src = src;
    }

    #load_all_large_images(): void {
        let count: number = this.large.images_count;
        for (let i = 0; i < count; i++) {
            this.#load_large_image(i);
        }
    }

    #parse_filelist_content(text: string): string[] {
        let ret_arr: string[] = [];
        // kill ' and " (they are interfering with path handling) and split on , 
        ret_arr = text.replace(/['"\s]/g, "").split(",");
        if (this.settings.reversed_drag_direction) {
            ret_arr.reverse();
        }
        // TODO: parse check here?
        return ret_arr;
    }
    // /INITIALIZATION PART B

    // INITIALIZATION PART SMALL
    #init_small_first(index: number, e: Event): void {
        if (e.type === "load") {
            this.#set_small_dimensions(index);
            this.#set_canvas_dimensions_to_size(0);

            this.root_element.style.display = "";
            this.#refresh_player_sizings();
            
            this.draw_current_image();
        } else {
            // TODO: critical error handling!
            Thrixty.log("SMALL SIZING IMAGE WAS NOT FOUND", this.player_id);
        }
    }

    #init_small_each(index: number, e: Event): void {
        if (e.type === "load") {
            this.small.images_loaded++;
            this.small.images[index].elem_loaded = true;
            Thrixty.log("small image " + index + " loaded (" + this.small.images[index].element.src + ")", this.player_id);
        } else if (e.type === "error") {
            this.small.images_errored++;
            this.small.images[index].elem_loaded = false;
            Thrixty.log("small image " + index + " errored (" + this.small.images[index].element.src + ")", this.player_id);
        }
        this.#refresh_small_progress_bar();
    }

    #init_small_all(index: number, e: Event): void {
        if (this.small.images[index].elem_loaded !== null) {
            return;
        }

        // *start* loading from a different image if start_image_id is set
        this.#change_active_image_id(this.settings.start_image_id);

        this.#init_small_each(index, e);
        if (index == 0) {
            this.#init_small_first(index, e);
        }

        if (this.small.images_loaded + this.small.images_errored !== this.small.images_count) {
            return;
        }

        this.DOM_obj.prev_btn.removeAttribute("disabled");
		this.DOM_obj.play_btn.removeAttribute("disabled");
		this.DOM_obj.next_btn.removeAttribute("disabled");
		this.DOM_obj.zoom_btn.removeAttribute("disabled");
		this.DOM_obj.size_btn.removeAttribute("disabled");

        // *end* loading on a different image if start_image_id is set
        this.#change_active_image_id(this.settings.start_image_id);

        if (this.settings.autoplay < 0) {
            this.#start_rotation();
            Thrixty.log("Autoplay infinite.", this.player_id);
        } else if (this.settings.autoplay == 0) {
            Thrixty.log("No autoplay.", this.player_id);
        } else {
            this.#start_rotation(this.settings.autoplay * this.small.images_count);
            Thrixty.log("Autoplay " + this.settings.autoplay + " turn(s).", this.player_id);
        }

    }

    #set_small_dimensions(index: number): void {
        let img: HTMLImageElement = this.small.images[index].element;
        this.root_element.appendChild(img);
        img.style.display = "block";
        let w: number = img.naturalWidth;
        let h: number = img.naturalHeight;
        let ar: number = w / h;
        this.small.image_width = w;
        this.small.image_height = h;
        this.small.image_ratio = ar;
        img.style.display = "";
        this.root_element.removeChild(img);
        Thrixty.log("Small dimensions set to " + w + " x " + h, this.player_id);
    }

    #refresh_small_progress_bar(): void {
        let progress_bar = this.DOM_obj.small_progress_bar;
        let percentage: number = (this.small.images_loaded + this.small.images_errored) / this.small.images_count;

        if (isNaN(percentage) || percentage <= 0) {
            progress_bar.setAttribute("thrixty-state", "unloaded");
            progress_bar.style.width = "0%";
        } else if (percentage < 1) {
            progress_bar.setAttribute("thrixty-state", "loading");
            progress_bar.style.width = percentage * 100 + "%";
        } else {
            progress_bar.setAttribute("thrixty-state", "loaded");
            progress_bar.style.width = "100%";
        }
    }
    // /INITIALIZATION PART SMALL

    // INITIALIZATION PART LARGE
    #init_large_first(index: number, e: Event): void {
        if (e.type == "load") {
            this.#set_large_dimensions(0);
        } else {
            // TODO: critical error handling!
            Thrixty.log("LARGE IMAGE WAS NOT FOUND", this.player_id);
        }
    }

    #init_large_each(index: number, e: Event): void {
        if (e.type == "load") {
            this.large.images_loaded++;
            this.large.images[index].elem_loaded = true;
            Thrixty.log("large image " + index + " loaded (" + this.large.images[index].element.src + ")", this.player_id);

            if ((this.is_zoomed || this.is_fullpage) && this.large.active_image_id == index) {
                this.draw_current_image();
            }
        } else if (e.type == "error") {
            this.large.images_errored++;
            this.large.images[index].elem_loaded = false;
            Thrixty.log("large image " + index + " errored (" + this.large.images[index].element.src + ")", this.player_id);
        }
        // TODO: update large progress bar
    }

    #init_large_all(index: number, e: Event): void {
        if (this.large.images[index].elem_loaded !== null) {
            return;
        }
        this.#init_large_each(index, e);
        if (index == 0) {
            this.#init_large_first(index, e);
        }
    }

    #set_large_dimensions(index: number): void {
        let img: HTMLImageElement = this.large.images[index].element;
        this.root_element.appendChild(img);
        img.style.display = "block";
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        let ar = w / h;
        this.large.image_width = w;
        this.large.image_height = h;
        this.large.image_ratio = ar;
        img.style.display = "";
        this.root_element.removeChild(img);
        Thrixty.log("Large dimensions set to " + w + " x " + h, this.player_id);
    }
    // /INITIALIZATION PART LARGE

    // EVENTS
    #assign_events(): void {
        if (this.events_assigned) return;
       
        // This is important, as no keydown events will be fired on unfocused elements.
        this.root_element.addEventListener("mousedown", function() {
            this.focus();
        });
        this.root_element.addEventListener("touchstart", function() {
            this.focus();
        });

        this.root_element.addEventListener("keydown", this.#keypresses.bind(this));

        // Buttons
        Thrixty.add_mouse_hold_event(this.DOM_obj.prev_btn, this.#prev_button_event_mousehold.bind(this), 100);
        Thrixty.add_touch_hold_event(this.DOM_obj.prev_btn, this.#prev_button_event_mousehold.bind(this), 100);
        this.DOM_obj.play_btn.addEventListener("mousedown", this.#play_button_event_mousedown.bind(this));
        Thrixty.add_touch_click_event(this.DOM_obj.play_btn, this.#play_button_event_mousedown.bind(this));
        Thrixty.add_mouse_hold_event(this.DOM_obj.next_btn, this.#next_button_event_mousehold.bind(this), 100);
        Thrixty.add_touch_hold_event(this.DOM_obj.next_btn, this.#next_button_event_mousehold.bind(this), 100);
        this.DOM_obj.zoom_btn.addEventListener("click", this.#zoom_button_event_click.bind(this));
	    this.DOM_obj.size_btn.addEventListener("click", this.#size_button_event_click.bind(this));
        this.DOM_obj.close_btn.addEventListener("click", this.#close_button_event_click.bind(this));

        this.DOM_obj.rotation_speed_gauge.addEventListener("change", this.#rotation_speed_gauge_event_change.bind(this));

        this.DOM_obj.main_canvas.addEventListener("dblclick", this.#main_canvas_dblclick.bind(this));

        // Loading Manager
        this.DOM_obj.load_overlay.addEventListener("click", this.#load_button_event_click.bind(this));
	    this.DOM_obj.load_btn.addEventListener("click", this.#load_button_event_click.bind(this));

        // mousedown
        document.addEventListener("mousedown", this.#document_mousedown.bind(this));
		this.DOM_obj.main_canvas.addEventListener("mousedown", this.#main_canvas_mousedown.bind(this));
		this.DOM_obj.minimap_canvas.addEventListener("mousedown", this.#minimap_canvas_mousedown.bind(this));
		this.DOM_obj.marker.addEventListener("mousedown", this.#marker_mousedown.bind(this));
		
        // mousemove
		document.addEventListener("mousemove", Thrixty.throttle(this.#document_mousemove.bind(this), 40));
		this.DOM_obj.main_canvas.addEventListener("mousemove", Thrixty.throttle(this.#main_canvas_mousemove.bind(this), 40));
		this.DOM_obj.minimap_canvas.addEventListener("mousemove", Thrixty.throttle(this.#minimap_canvas_mousemove.bind(this), 40));
		this.DOM_obj.marker.addEventListener("mousemove", Thrixty.throttle(this.#marker_mousemove.bind(this), 40));

        // mouseover
        this.DOM_obj.main_canvas.addEventListener("mouseover", Thrixty.throttle(this.#main_canvas_mouseover.bind(this), 40));

        // mouseup
        document.addEventListener("mouseup", this.#document_mouseup.bind(this));
		this.DOM_obj.main_canvas.addEventListener("mouseup", this.#main_canvas_mouseup.bind(this));
		this.DOM_obj.minimap_canvas.addEventListener("mouseup", this.#minimap_canvas_mouseup.bind(this));
		this.DOM_obj.marker.addEventListener("mouseup", this.#marker_mouseup.bind(this));

        // touchstart
        document.addEventListener("touchstart", this.#document_touchstart.bind(this), { passive: false });
        this.DOM_obj.main_canvas.addEventListener("touchstart", this.#main_canvas_touchstart.bind(this));
        this.DOM_obj.minimap_canvas.addEventListener("touchstart", this.#minimap_canvas_touchstart.bind(this));
        this.DOM_obj.marker.addEventListener("touchstart", this.#marker_touchstart.bind(this));

        // touchmove
        document.addEventListener("touchmove", this.#document_touchmove.bind(this), { passive: false });
        this.DOM_obj.main_canvas.addEventListener("touchmove", this.#main_canvas_touchmove.bind(this));
        this.DOM_obj.minimap_canvas.addEventListener("touchmove", this.#minimap_canvas_touchmove.bind(this));
        this.DOM_obj.marker.addEventListener("touchmove", this.#marker_touchmove.bind(this));

        // touchend
        document.addEventListener("touchend", this.#document_touchend.bind(this));
        this.DOM_obj.main_canvas.addEventListener("touchend", this.#main_canvas_touchend.bind(this));
        this.DOM_obj.minimap_canvas.addEventListener("touchend", this.#minimap_canvas_touchend.bind(this));
        this.DOM_obj.marker.addEventListener("touchend", this.#marker_touchend.bind(this));

        // Window resizing
        window.addEventListener("resize", Thrixty.throttle(this.#resize_window_event.bind(this), 40));

        // Scrolling
        this.root_element.addEventListener("wheel", this.#scroll_event.bind(this));

        this.events_assigned = true;
    }

    #keypresses(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        // MARK: keyCode (formerly used here) is deprecated, now doing this the new way
        let key = e.key;
        switch (key) {
            case " ": // Spacebar
                this.#play_button_event_mousedown(e);
                e.preventDefault();
                break;
            case "ArrowLeft":
                this.#prev_button_event_mousehold(e);
                e.preventDefault();
                break;
            case "ArrowRight":
                this.#next_button_event_mousehold(e);
                e.preventDefault();
                break;
            case "ArrowUp":
                this.#increase_rotation_speed();
                e.preventDefault();
                break;
            case "ArrowDown":
                this.#decrease_rotation_speed();
                e.preventDefault();
                break;
            case "Escape":
                this.#stop_rotation();
                this.#stop_zoom();
                e.preventDefault();
                this.#quit_fullpage();
                break;
            case "F":
            case "f":
                this.#size_button_event_click(e);
                e.preventDefault();
                break;
            case "G":
            case "g":
                this.#zoom_button_event_click(e);
                e.preventDefault();
                break;
            case "PageUp":
            case "PageDown":
            case "Home":
            case "End":
                // prevent scrolling while in fullpage mode
                this.#scroll_event(e);
                break;
        }
    }

    // Buttons
    #load_button_event_click(e: Event): void {
        this.#load_all_small_images();
        if (this.settings.marker_mode == "new") {
            this.#load_all_large_images();
        }
        this.root_element.removeChild(this.DOM_obj.load_overlay);
        e.stopPropagation();
    }

    #prev_button_event_mousehold(e: Event): void {
        this.#stop_rotation();
        this.#draw_previous_image();
    }

    #play_button_event_mousedown(e: Event): void {
        this.#toggle_rotation();
    }

    #next_button_event_mousehold(e: Event): void {
        this.#stop_rotation();
        this.#draw_next_image();
    }

    #zoom_button_event_click(e: Event): void {
        this.#toggle_zoom();
    }

    #size_button_event_click(e: Event): void {
        this.#toggle_fullpage();
    }

    #close_button_event_click(e: Event): void {
        this.#quit_fullpage();
    }

    #main_canvas_dblclick(e: Event): void {
        this.#toggle_zoom();
        e.preventDefault();
    }
    // /Buttons

    #rotation_speed_gauge_event_change(e: Event): void {
        this.#set_rotation_speed(parseInt((document.getElementById("rotation_speed_gauge_" + (this.player_id + 1)) as HTMLInputElement).value));
    }

    // mousedown
    #document_mousedown(e: MouseEvent): void {
        // user may want to quit fullpage
        if (this.is_fullpage) {
            let root_rect = this.root_element.getBoundingClientRect();
            let w = root_rect.width;
            let h = root_rect.height;
            let x = root_rect.left;
            let y = root_rect.top;
            if ((e.clientX - x < 0 || e.clientX - x > w || e.clientY - y < 0 || e.clientY - y > h) && e.button == 0) {
                this.#quit_fullpage();
                e.preventDefault();
            }
        }
    }

    #main_canvas_mousedown(e: MouseEvent): void {
        // A1 | user wants to turn the object
        if (this.settings.zoom_control == "progressive") {
            if (e.button == 0) {
                this.#prepare_object_turn(e.clientX, e.clientY);
                e.preventDefault();
            }
        }
        // B1 | user wants to turn the object
        else if (this.settings.zoom_control == "classic") {
            if (e.button == 0) {
                this.#prepare_object_turn(e.clientX, e.clientY);
                e.preventDefault();
            }
        }
        this.is_click = true;
    }

    #minimap_canvas_mousedown(e: MouseEvent): void {
        // A1 | user wants to turn the object
        if (this.settings.zoom_control == "progressive") {
            if (e.button == 0) {
                this.#prepare_object_turn(e.clientX, e.clientY);
                e.preventDefault();
            }
        }
        // B2 | user wants to move the section, minimap variation
        else if (this.settings.zoom_control == "classic") {
            if (e.button == 0) {
                this.#prepare_section_move("minimap");
                this.#execute_section_move(e.clientX, e.clientY); // instantly snap to target position
                e.preventDefault();
            }
        }
    }

    #marker_mousedown(e: MouseEvent): void {
        // A1 | user wants to turn the object
        if (this.settings.zoom_control == "progressive") {
            if (e.button == 0) {
                this.#prepare_object_turn(e.clientX, e.clientY);
                e.preventDefault();
            }
        }
        // B2 | user wants to move the section, marker variation
        else if (this.settings.zoom_control == "classic") {
            if (e.button == 0) {
                this.#prepare_section_move("marker");
                this.#execute_section_move(e.clientX, e.clientY); // instantly snap to target position
                e.preventDefault();
            }
        }
    }
    // /mousedown

    // mousemove
    #document_mousemove(e: MouseEvent): void {
        // user may want to stop zoom
        if (!this.is_fullpage) {
            let main_canvas_rect = this.DOM_obj.main_canvas.getBoundingClientRect();
            let w = main_canvas_rect.width;
            let h = main_canvas_rect.height;
            let x = main_canvas_rect.left;
            let y = main_canvas_rect.top;
            if (e.clientX - x < 0 || e.clientX - x > w || e.clientY - y < 0 || e.clientY - y > h) {
                this.#stop_zoom();
            }
            e.preventDefault();
        }

        // A1 | user turns the object
        // B1 | user turns the object
        if (this.object_turn.prepared) {
            this.#execute_object_turn(e.clientX, e.clientY);
            e.preventDefault();
        }
        // B2 | user moves section
        if (this.section_move.prepared) {
            this.#execute_section_move(e.clientX, e.clientY);
            e.preventDefault();
        }
    }

    #main_canvas_mousemove(e: MouseEvent): void {
        // A2 | user moves section
        if( this.is_zoomed && this.settings.zoom_control == "progressive" ){
            this.#execute_section_move(e.clientX, e.clientY);
            e.preventDefault();
        }
    }

    #minimap_canvas_mousemove(e: MouseEvent): void {
        // A2 | user moves section
        if( this.is_zoomed && this.settings.zoom_control == "progressive" ){
            this.#execute_section_move(e.clientX, e.clientY);
            e.preventDefault();
        }
    }

    #marker_mousemove(e: MouseEvent): void {
        // A2 | user moves section
        if( this.is_zoomed && this.settings.zoom_control == "progressive" ){
            this.#execute_section_move(e.clientX, e.clientY);
            e.preventDefault();
        }
    }

    // mouseover
    #main_canvas_mouseover(e: MouseEvent): void {
        // user wants to zoom
        if (!this.is_fullpage) {
            this.#start_zoom();
            e.preventDefault();
        }
    }
    // /mouseover

    // mouseup
    #document_mouseup(e: MouseEvent): void {
        // A1 | user stops turning the object
		// B1 | user stops turning the object
		if( this.object_turn.prepared ){
			this.#execute_object_turn(e.clientX, e.clientY); // do a final object turn
			this.#stop_object_turn();
			e.preventDefault();
		}
		// if this is still a click, toggle object rotation
		if( this.is_click ){
			this.#toggle_rotation();
			this.is_click = false;
			e.preventDefault();
		}
		// B2 | user stops moving section
		if( this.section_move.prepared ){
			this.#execute_section_move(e.clientX, e.clientY); // do a final section move
			this.#stop_section_move();
			e.preventDefault();
		}
    }

    #main_canvas_mouseup(e: MouseEvent): void {}

    #minimap_canvas_mouseup(e: MouseEvent): void {}

    #marker_mouseup(e: MouseEvent): void {}
    // /mouseup

    // touchstart
    #document_touchstart(e: TouchEvent): void {
        // user may want to stop zoom
        if (!this.is_fullpage) {
            let main_canvas_rect = this.DOM_obj.main_canvas.getBoundingClientRect();
            let w = main_canvas_rect.width;
            let h = main_canvas_rect.height;
            let x = main_canvas_rect.left;
            let y = main_canvas_rect.top;
            if (e.touches[0].pageX - x < 0 || e.touches[0].pageX - x > w || e.touches[0].pageY - y < 0 || e.touches[0].pageY - y > h) {
                this.#stop_zoom();
            }
        }
    }

    #main_canvas_touchstart(e: TouchEvent): void {
        // user wants to zoom
        if (!this.is_fullpage) {
            this.#start_zoom();
            e.preventDefault();
        }
        if( e.touches.length == 1 ){
            // C1 | user wants to turn the object
            this.#prepare_object_turn(e.touches[0].clientX, e.touches[0].clientY);
            // register this as starting a click
            this.is_click = true;
            e.preventDefault();
        }
    }

    #minimap_canvas_touchstart(e: TouchEvent): void {
        if( e.touches.length == 1 ){
            // C2 | user wants to move the section
            if( this.is_zoomed ){
                this.#prepare_section_move("minimap");
                this.#execute_section_move(e.touches[0].clientX, e.touches[0].clientY); // instantly snap to target position
                e.preventDefault();
            }
        }
    }

    #marker_touchstart(e: TouchEvent): void {
        if( e.touches.length == 1 ){
            // C2 | user wants to move the section
            if( this.is_zoomed ){
                this.#prepare_section_move("marker");
                this.#execute_section_move(e.touches[0].clientX, e.touches[0].clientY); // instantly snap to target position
                e.preventDefault();
            }
        }
    }
    // /touchstart

    // touchmove
    #document_touchmove(e: TouchEvent): void {
        if( e.touches.length == 1 ){
            /* stop scrolling in fullpage mode */
            if( this.is_fullpage && e.cancelable ){
                e.preventDefault();
            }
            /* C1 | user turns the object */
            if( this.object_turn.prepared ){
                this.#execute_object_turn(e.touches[0].clientX, e.touches[0].clientY);
                if (e.cancelable) e.preventDefault();
            }
            /* C2 | user moves the section */
            if( this.section_move.prepared ){
                this.#execute_section_move(e.touches[0].clientX, e.touches[0].clientY);
                if (e.cancelable) e.preventDefault();
            }
        }
    }

    #main_canvas_touchmove(e: TouchEvent): void {}

    #minimap_canvas_touchmove(e: TouchEvent): void {}

    #marker_touchmove(e: TouchEvent): void {}
    // /touchmove

    // touchend
    #document_touchend(e: TouchEvent): void {
        // C1 | user stops turning the object
        if( this.object_turn.prepared ){
            this.#stop_object_turn();
            e.preventDefault();
        }
        // C2 | user stops moving section
        if( this.section_move.prepared ){
            this.#stop_section_move();
            e.preventDefault();
        }
        // if this is still a click, toggle object rotation
        if( this.is_click ){
            this.#toggle_rotation();
            this.is_click = false;
        }
    }

    #main_canvas_touchend(e: TouchEvent): void {}

    #minimap_canvas_touchend(e: TouchEvent): void {}

    #marker_touchend(e: TouchEvent): void {}
    // /touchend

    // Object turn
    #prepare_object_turn(x: number, y: number) {
        this.object_turn.prepared = true;
        this.object_turn.start_x = x;
        this.object_turn.start_y = y; // unused
        this.object_turn.last_x = x;
        this.object_turn.last_y = y; // unused
    }

    #execute_object_turn(x: number, y: number) {
        let distance_x = x - (this.object_turn.last_x as number);
        if (Math.abs(x - (this.object_turn.start_x as number)) >= this.settings.sensitivity_x) {
            this.is_click = false;
            this.#stop_rotation();
        }
        if (!this.is_click) {
            this.object_turn.last_x = x - this.#distance_rotation(distance_x);
        }
    }

    #stop_object_turn(): void {
        this.object_turn.prepared = false;
        this.object_turn.last_x = null;
        this.object_turn.last_y = null; // unused
    }
    // /Object turn

    // Section move
    #prepare_section_move(mode: string = "") {
        if (mode != "") {
            this.section_move.prepared = true;
            if (mode === "minimap") {
                this.section_move.minimap = true;
            }
        }
    }

    #execute_section_move(x: number, y: number) {
        let coords: Coords = {
            x: x,
            y: y,
        }
        if (this.section_move.minimap) {
            coords = this.#minimap_to_main_coords(coords);
        }

        this.#update_section_position(coords.x, coords.y);
        this.draw_current_image();
    }

    #stop_section_move(): void {
        this.section_move.prepared = false;
        this.section_move.minimap = false;
    }
    // /Section move

    #resize_window_event(e: Event): void {
        this.#refresh_player_sizings();
        // reset zoom to get rid of wrong zoom display mode if orientation changes
        this.#stop_zoom();
        if (!Thrixty.is_mobile) {
            this.DOM_obj.size_btn.style.display = "";
        } else {
            this.DOM_obj.size_btn.style.display = "none";
        }
    }

    #scroll_event(e: Event): void {
        if (this.is_fullpage) {
            e.preventDefault();
        }
    }
    // /EVENTS

    // ROTATION
    #rotation(): void {
        if (!this.is_rotating) return;
        if (this.rotation_count < 0) {
            this.#draw_next_image();
        } else if (this.rotation_count > 0) {
            this.#draw_next_image();
            this.rotation_count--;
            if (this.rotation_count == 0) {
                this.#stop_rotation();
            }
        } else {
            this.#stop_rotation();
        }
    }

    #start_rotation(times: number = -1): void {
        if (this.is_rotating) return;
        this.rotation_count = times;
        if (this.rotation_count == 0) return;
        // animation is playing
        this.is_rotating = true;
        this.DOM_obj.play_btn.setAttribute("thrixty-state", "play");
        this.rotation_id = setInterval(this.#rotation.bind(this), this.rotation_delay);
    }

    #stop_rotation(): void {
        if (!this.is_rotating) return;
        clearInterval(this.rotation_id as number);
        this.rotation_id = 0;
        this.is_rotating = false;
        this.DOM_obj.play_btn.setAttribute("thrixty-state", "pause");
    }

    #toggle_rotation(): void {
        if (this.is_rotating) {
            this.#stop_rotation();
        } else {
            this.#start_rotation();
        }
    }

    #distance_rotation(distance_x: number): number {
        // TODO: improve performance by saving intermediate results

        let degree_per_image: number;
        if (this.is_zoomed || this.is_fullpage) {
            degree_per_image = 360/this.large.images_count;
        } else {
            degree_per_image = 360/this.small.images_count;
        }

        let pixel_per_image: number = this.pixel_per_degree * degree_per_image;

        let remaining_distance: number = distance_x % pixel_per_image;
        let remaining_images: number = (distance_x - remaining_distance) / pixel_per_image;

        // invert the count to emulate behavior of the finger
        remaining_images *= -1;

        this.#change_active_image_id(remaining_images);
        this.draw_current_image();

        return remaining_distance;
    }

    #set_rotation_delay(): void {
        let images_count: number = 0;
        if (this.is_zoomed || this.is_fullpage) {
            images_count = this.large.images_count;
        } else {
            images_count = this.small.images_count;
        }
        this.rotation_delay = Math.ceil( (1000 / images_count) * (this.settings.cycle_duration / this.rotation_speed_modifiers[this.rotation_speed_selected]));
        if (this.is_rotating) {
            this.#stop_rotation();
            this.#start_rotation();
        }
    }
    // /ROTATION

    // IMAGE STEERING
    #change_active_image_id(amount: number): void {
        let id = 0;
        let count = 0;

        if (this.is_zoomed || this.is_fullpage) {
            id = this.large.active_image_id;
            count = this.large.images_count;
            this.small.active_image_id = this.large.images[id].to_small as number;
		} else {
			id = this.small.active_image_id;
			count = this.small.images_count;
			this.large.active_image_id = this.small.images[id].to_large as number;
		}

        id = Math.floor((id + amount) % count);
		if( id < 0 ){
			id += count;
		}
		
		if(this.is_zoomed || this.is_fullpage) {
			this.small.active_image_id = this.large.images[id].to_small as number;
			this.large.active_image_id = id;
		} else {
			this.small.active_image_id = id;
			this.large.active_image_id = this.small.images[id].to_large as number;
		}
    }

    #draw_next_image(): void {
        if ((this.settings.reversed_drag_direction && this.settings.reversed_play_direction)
         || (!this.settings.reversed_drag_direction && !this.settings.reversed_play_direction)) {
           this.#change_active_image_id( 1 );
        } else {
           this.#change_active_image_id( -1 );
        }
        this.draw_current_image();
    }

    #draw_previous_image(): void {
        if ((this.settings.reversed_drag_direction && this.settings.reversed_play_direction)
         || (!this.settings.reversed_drag_direction && !this.settings.reversed_play_direction)) {
          this.#change_active_image_id( -1 );
        } else {
          this.#change_active_image_id( 1 );
        }
        this.draw_current_image();
    }
    // /IMAGE STEERING

    // ZOOM
    #start_zoom(): void {
        if (this.is_zoomed) return;
        if( this.settings.zoom_mode != "none" && !Thrixty.is_mobile || this.settings.zoom_mode_mobile != "none" && Thrixty.is_mobile){
            let main_canvas = this.DOM_obj.main_canvas;
            let minimap_canvas = this.DOM_obj.minimap_canvas;

            /* set zoom flag */
            this.is_zoomed = true;

            /* do main_class's part of start_zoom routine: */
            /* set zoom button to zoomout */
            this.DOM_obj.zoom_btn.setAttribute("thrixty-state", "zoomed_in");

            /* simulate zoom start at the center of the canvas */
            let click_x = main_canvas.getBoundingClientRect().left + ( main_canvas.offsetWidth / 2 );
            let click_y = main_canvas.getBoundingClientRect().top + ( main_canvas.offsetHeight / 2 );
            this.#update_section_position(click_x, click_y);

            /* check for position indicator wanted (for example a minimap) */
            if( this.settings.zoom_pointer == "minimap" ){
                minimap_canvas.style.display = "";
                minimap_canvas.style.width = (this.small.image_width * 100 / this.large.image_width) + "%";
                minimap_canvas.style.height = (this.small.image_height * 100 / this.large.image_height) + "%";
            } else if( this.settings.zoom_pointer == "marker" ){
                this.DOM_obj.marker.style.display = "";
            }

            if( this.settings.zoom_mode == "outbox" && !Thrixty.is_mobile || this.settings.zoom_mode_mobile == "outbox" && Thrixty.is_mobile) {
                this.#setup_outbox();
            }
        }
        this.draw_current_image();
    }

    #stop_zoom(): void {
        this.is_zoomed = false;
        this.DOM_obj.zoom_btn.setAttribute("thrixty-state", "zoomed_out");
        this.DOM_obj.zoom_canvas.style.display = "none";
        this.DOM_obj.minimap_canvas.style.display = "none";
        this.DOM_obj.marker.style.display = "none";
        this.draw_current_image();
    }

    #toggle_zoom(): void {
        if (!this.is_zoomed) {
            if (this.is_rotating) {
                this.#stop_rotation();
            }
            this.#start_zoom();
        } else {
            this.#stop_zoom();
        }
        this.#set_rotation_delay();
    }

    #setup_outbox(): void {
        if(!this.is_fullpage) {
            let zoom_canvas = this.DOM_obj.zoom_canvas;
            zoom_canvas.style.display = "";
        }
    }
    // /ZOOM

    // FULLPAGE
    #enter_fullpage(): void {
        if (this.is_fullpage) return;
        this.is_fullpage = true;
        this.DOM_obj.size_btn.setAttribute("thrixty-state", "fullpaged");
        this.#refresh_player_sizings();
        this.draw_current_image();
    }
    
    #quit_fullpage(): void {
        if (!this.is_fullpage) return;
        this.is_fullpage = false;
        this.DOM_obj.size_btn.setAttribute("thrixty-state", "normalsized");
        this.#refresh_player_sizings();
        this.draw_current_image();
    }

    #toggle_fullpage(): void {
        if (this.is_fullpage) {
            this.#stop_zoom();
            this.#quit_fullpage();
        } else {
            this.#stop_zoom();
            this.#enter_fullpage();
        }
    }
    // /FULLPAGE

    // DRAWING
    draw_current_image(): void {
        // Decide on a drawing strategy:
        if (!this.is_zoomed) {
            if (!this.is_fullpage) {
                this.#unzoomed();
            } else {
                this.#fullpaged();
            }
        } else {
            if(!this.is_fullpage && this.settings.zoom_mode == "outbox" && !Thrixty.is_mobile || 
                this.settings.zoom_mode_mobile == "outbox" && Thrixty.is_mobile) {
                this.#outbox_zoomed();
            } else {
                this.#inbox_zoomed();
            }
            if(this.settings.zoom_pointer == "marker") {
                this.#set_marker_position();
            } else {
                this.#draw_minimap();
            }
        }
    }

    #unzoomed(): void {
        let main_canvas = this.DOM_obj.main_canvas;
        let main_ctx = main_canvas.getContext("2d") as CanvasRenderingContext2D;

        let small_image = this.#get_current_small_image();
        
        if (this.canvas_size != 0) {
            this.#set_canvas_dimensions_to_size(0);
        }

        main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);

        if (!!small_image) {
            main_ctx.drawImage(small_image, 0, 0);
        }
    }

    #fullpaged(): void {
        // Task: Draw the unzoomed image on the canvas
        let main_canvas = this.DOM_obj.main_canvas;
        let main_ctx = main_canvas.getContext("2d") as CanvasRenderingContext2D;

        let large_image = this.#get_current_large_image();

        if (this.canvas_size != 1) {
            this.#set_canvas_dimensions_to_size(1);
        }

        main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
        if (!!large_image) {
            main_ctx.drawImage(large_image, 0, 0, main_canvas.width, main_canvas.height);
        }
    }

    #inbox_zoomed(): void {
        // Task: Draw the large image on the main canvas
        let main_canvas = this.DOM_obj.main_canvas;
        let main_ctx = main_canvas.getContext("2d") as CanvasRenderingContext2D;

        let large_image = this.#get_current_large_image();

        if (this.canvas_size != 0) {
            this.#set_canvas_dimensions_to_size(0);
        }
        
        main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);

        if (!!large_image) {
            let offsets: Coords = this.#get_zoom_offsets();
            main_ctx.drawImage(large_image, 0, 0, large_image.naturalWidth, large_image.naturalHeight, 
                               -offsets.x, -offsets.y, this.large.image_width, this.large.image_height);
        }

    }

    #outbox_zoomed(): void {
        // Task: Draw the small image on the main canvas, large image on the zoom canvas
        let main_canvas = this.DOM_obj.main_canvas;
        let zoom_canvas = this.DOM_obj.zoom_canvas;
        let main_ctx = main_canvas.getContext("2d") as CanvasRenderingContext2D;
        let zoom_ctx = zoom_canvas.getContext("2d") as CanvasRenderingContext2D;

        let small_image = this.#get_current_small_image();
        let large_image = this.#get_current_large_image();

        if (this.canvas_size != 0) {
            this.#set_canvas_dimensions_to_size(0);
        }
        
        main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
        zoom_ctx.clearRect(0, 0, zoom_canvas.width, zoom_canvas.height);

        if (!!small_image) {
            main_ctx.drawImage(small_image, 0, 0);
            
        }
        if (!!large_image) {
            if (this.settings.marker_mode == "old") {
                let offsets: Coords = this.#get_zoom_offsets();
                zoom_ctx.drawImage(large_image, 0, 0, large_image.naturalWidth, large_image.naturalHeight, 
                                   -offsets.x, -offsets.y, this.large.image_width, this.large.image_height);
            } else if (this.settings.marker_mode == "new") {
                let { x, y, width, height } = this.#get_marker_position();
                zoom_ctx.drawImage(large_image, x * this.large.image_width / this.small.image_width, y * this.large.image_height / this.small.image_height, 
                width * this.large.image_width / this.small.image_width, height * this.large.image_height / this.small.image_height, 
                    0, 0, zoom_canvas.width, zoom_canvas.height);
            }
        }
    }

    #draw_minimap(): void {
        // Task: Draw the minimap on the minimap canvas
        let main_canvas = this.DOM_obj.main_canvas;
        let minimap_canvas = this.DOM_obj.minimap_canvas;
        let minimap_ctx  = minimap_canvas.getContext("2d") as CanvasRenderingContext2D;

        let small_image = this.#get_current_small_image();

        let cutout_w: number = minimap_canvas.width * (this.small.image_width / this.large.image_width);
        let cutout_h: number = minimap_canvas.height * (this.small.image_height / this.large.image_height);
        let cutout_x: number = ( this.relative_mouse.x / main_canvas.offsetWidth ) * ( minimap_canvas.width - cutout_w );
	    let cutout_y: number = ( this.relative_mouse.y / main_canvas.offsetHeight ) * ( minimap_canvas.height - cutout_h );

        minimap_ctx.clearRect(0, 0, minimap_canvas.width, minimap_canvas.height);

        if (!!small_image) {
            minimap_ctx.drawImage(small_image, 0, 0);
        }

        // Draw the cutout
        minimap_ctx.globalAlpha = 0.5;
        minimap_ctx.fillStyle = "black";
        minimap_ctx.beginPath();
        // draw mask (rectangle clockwise)
        minimap_ctx.moveTo(0, 0);
        minimap_ctx.lineTo(this.small.image_width, 0);
        minimap_ctx.lineTo(this.small.image_width, this.small.image_height);
        minimap_ctx.lineTo(0, this.small.image_height);
        minimap_ctx.lineTo(0, 0);
        // "undraw" cutout (rectangle counterclockwise)
        minimap_ctx.moveTo(cutout_x, cutout_y);
        minimap_ctx.lineTo(cutout_x, cutout_y + cutout_h);
		minimap_ctx.lineTo(cutout_x + cutout_w, cutout_y + cutout_h);
		minimap_ctx.lineTo(cutout_x + cutout_w, cutout_y);
		minimap_ctx.lineTo(cutout_x, cutout_y);
        // fill the shape
        minimap_ctx.closePath();
        minimap_ctx.fill();
        minimap_ctx.globalAlpha = 1;
    }

    #get_marker_position(): { x: number, y: number, width: number, height: number } {
        if (this.settings.marker_mode == "old") {
            return {
                width: parseInt(this.DOM_obj.marker.style.width),
                height: parseInt(this.DOM_obj.marker.style.height),
                x: parseInt(this.DOM_obj.marker.style.left),
                y: parseInt(this.DOM_obj.marker.style.top),
            }
        } else {
            return {
                width: parseInt(this.DOM_obj.marker.style.width),
                height: parseInt(this.DOM_obj.marker.style.height),
                x: this.relative_mouse.x,
                y: this.relative_mouse.y,
            }
        }
    }

    #set_marker_position(): void {
        if (this.settings.marker_mode == "old") {
            let cc;
            if (this.settings.zoom_mode == "outbox" && !Thrixty.is_mobile || this.settings.zoom_mode_mobile == "outbox" && Thrixty.is_mobile) {
                cc = this.DOM_obj.zoom_canvas;
            }   else {
                cc = this.DOM_obj.canvas_container;
            }
            let w: number = cc.offsetWidth * this.small.image_width / this.large.image_width;
            let h: number = cc.offsetHeight * this.small.image_height / this.large.image_height;
            let x: number = this.relative_mouse.x / cc.offsetWidth * (cc.offsetWidth - w);
            let y: number = this.relative_mouse.y / cc.offsetHeight * (cc.offsetHeight - h);

            this.DOM_obj.marker.style.width = w + "px";
            this.DOM_obj.marker.style.height = h + "px";
            this.DOM_obj.marker.style.left = x + "px";
            this.DOM_obj.marker.style.top = y + "px";
        } else {
            let cc;
            if (this.settings.zoom_mode == "outbox" && !Thrixty.is_mobile || this.settings.zoom_mode_mobile == "outbox" && Thrixty.is_mobile) {
                cc = this.DOM_obj.zoom_canvas;
            }   else {
                cc = this.DOM_obj.canvas_container;
            }
            let w: number = cc.offsetWidth * this.small.image_width / this.large.image_width;
            let h: number = cc.offsetHeight * this.small.image_height / this.large.image_height;
            let x: number = this.relative_mouse.x;
            let y: number = this.relative_mouse.y;

            this.DOM_obj.marker.style.width = w + "px";
            this.DOM_obj.marker.style.height = h + "px";
            this.DOM_obj.marker.style.left = x + "px";
            this.DOM_obj.marker.style.top = y + "px";
        }
    }

    #update_section_position(x: number, y: number): void {
        let main_canvas = this.DOM_obj.main_canvas;

        let cursor_x = x - main_canvas.getBoundingClientRect().left;
        let cursor_y = y - main_canvas.getBoundingClientRect().top;

        // don't overstep the boundaries
        if( cursor_x < 0 ){
            cursor_x = 0;
        }
        if( cursor_x > main_canvas.offsetWidth){
            cursor_x = main_canvas.offsetWidth;
        }
        if( cursor_y < 0 ){
            cursor_y = 0;
        }
        if( cursor_y > main_canvas.offsetHeight){
            cursor_y = main_canvas.offsetHeight;
        }

        this.relative_mouse.x = cursor_x;
		this.relative_mouse.y = cursor_y;
    }

    #get_zoom_offsets(): Coords {
        let main_canvas = this.DOM_obj.main_canvas;
        let position_percentage_x = this.relative_mouse.x / main_canvas.offsetWidth;
        let position_percentage_y = this.relative_mouse.y / main_canvas.offsetHeight;
        return {
            x: position_percentage_x * ( this.large.image_width - this.small.image_width ),
            y: position_percentage_y * ( this.large.image_height - this.small.image_height ),
        }
    }

    #get_current_small_image(): HTMLImageElement | null {
        let current_image = this.small.images[this.small.active_image_id];
        if (current_image.elem_loaded) {
            return current_image.element;
        }
        return null;
    }

    #get_current_large_image(): HTMLImageElement | null {
        let base_small = this.small.images[this.small.active_image_id];
        let base_large = this.large.images[this.large.active_image_id];

        if (base_large.elem_loaded) {
            return base_large.element;
        }

        if (base_large.elem_loaded === null) {
            this.#load_large_image(this.large.active_image_id);
        }

        return this.#get_current_small_image();
    }
    // /DRAWING

    // GETTER & SETTER
    #refresh_player_sizings(): void {
        if (this.is_fullpage) {
            this.root_element.style.position = "fixed";
            this.root_element.style.width = "90%";
            this.root_element.style.height = "90%";
            this.root_element.style.maxWidth = "100%";
            this.root_element.style.maxHeight = "100%";
            this.root_element.style.border = "5px solid grey";
            this.root_element.style.background = "white";
            this.root_element.style.zIndex = "9999";
            this.root_element.style.top = (document.body.clientHeight - this.root_element.clientHeight) / 2 + "px";
            this.root_element.style.bottom = "0";
            this.root_element.style.left = (document.body.clientWidth - this.root_element.clientWidth) / 2 + "px";
            this.root_element.style.right = "0";
            this.DOM_obj.showroom.style.width = "";
            this.DOM_obj.showroom.style.height = "";
            this.DOM_obj.canvas_container.style.width = "";
			this.DOM_obj.canvas_container.style.height = "";
			this.DOM_obj.canvas_container.style.marginLeft = "";
			this.DOM_obj.canvas_container.style.marginTop = "";

            this.DOM_obj.close_btn.style.display = "";
            this.DOM_obj.zoom_advisory.style.display = "none";

            let root_width: number = this.root_element.clientWidth;
            let root_height: number = this.root_element.clientHeight;

            this.#resize_dom_objects(root_width, root_height, this.large.image_ratio);
        } else {
            this.root_element.style.position = "";
			this.root_element.style.top = "";
			this.root_element.style.right = "";
			this.root_element.style.bottom = "";
			this.root_element.style.left = "";
			this.root_element.style.width = "";
			this.root_element.style.height = "";
			this.root_element.style.maxWidth = "";
			this.root_element.style.maxHeight = "";
			this.root_element.style.border = "";
			this.root_element.style.background = "";
			this.root_element.style.zIndex = "";
			this.DOM_obj.showroom.style.width = "";
			this.DOM_obj.showroom.style.height = "";
			this.DOM_obj.canvas_container.style.width = "";
			this.DOM_obj.canvas_container.style.height = "";
			this.DOM_obj.canvas_container.style.marginLeft = "";
			this.DOM_obj.canvas_container.style.marginTop = "";

            this.DOM_obj.close_btn.style.display = "none";
            this.DOM_obj.zoom_advisory.style.display = "";

            let root_width: number = this.root_element.clientWidth;
            let max_width = root_width;

            if (max_width > this.small.image_width) {
                max_width = this.small.image_width;
            }

            let root_height: number = max_width / this.small.image_ratio;
            root_height += this.DOM_obj.controls.clientHeight;
            root_height += this.DOM_obj.zoom_advisory.clientHeight + 20;

            // check for possible width/height limitations (max-width/height etc.)
            this.root_element.style.width = root_width + "px";
            this.root_element.style.height = root_height + "px";

            // measure the actual dimensions
            root_width = this.root_element.clientWidth;
            root_height = this.root_element.clientHeight;

            // reassign corrected values to the element
            this.root_element.style.width = root_width + "px";
            this.root_element.style.height = root_height + "px";

            this.#resize_dom_objects(root_width, root_height, this.small.image_ratio);
        }
    }

    #resize_dom_objects(w: number, h: number, ar: number): void {
        let controls_height = this.DOM_obj.controls.offsetHeight;

        let showroom_width = w;
        let showroom_height = h - controls_height;

        this.DOM_obj.showroom.style.width = showroom_width + "px";
        this.DOM_obj.showroom.style.height = showroom_height + "px";

        let showroom_aspect_ratio = showroom_width / showroom_height;

        // portrait orientation [] => smaller than 1
        // landscape orientation [___] => bigger than 1
        // if image is "more portrait" than the showroom, center it horizontally
        // if image is "more landscape" than the showroom, center it vertically
        if (showroom_aspect_ratio > ar) {
            let canvas_container_width = showroom_height * ar;
            let canvas_container_height = showroom_height;

            let canvas_container_x = (showroom_width - canvas_container_width) / 2;
            let canvas_container_y = 0;

            this.DOM_obj.canvas_container.style.width = canvas_container_width + "px";
            this.DOM_obj.canvas_container.style.height = canvas_container_height + "px";
            this.DOM_obj.canvas_container.style.marginLeft = canvas_container_x + "px";
            this.DOM_obj.canvas_container.style.marginTop = canvas_container_y + "px";

            this.DOM_obj.zoom_canvas.style.width = this.DOM_obj.canvas_container.style.width;
            this.DOM_obj.zoom_canvas.style.height = this.DOM_obj.canvas_container.style.height;
        } else {
            let canvas_container_width = showroom_width; 
            let canvas_container_height = showroom_width / ar;

            let canvas_container_x = 0;
            let canvas_container_y = (showroom_height - canvas_container_height) / 2;

            this.DOM_obj.canvas_container.style.width = canvas_container_width + "px";
            this.DOM_obj.canvas_container.style.height = canvas_container_height + "px";
            this.DOM_obj.canvas_container.style.marginLeft = canvas_container_x + "px";
            this.DOM_obj.canvas_container.style.marginTop = canvas_container_y + "px";

            this.DOM_obj.zoom_canvas.style.width = this.DOM_obj.canvas_container.style.width;
            this.DOM_obj.zoom_canvas.style.height = this.DOM_obj.canvas_container.style.height;
        }
    }

    #set_canvas_dimensions_to_size(size: number) {
        let image_info: ThrixtyImageInfo | null = null;
        switch(size) {
            default:
            case 0:
                image_info = this.small;
                break;
            case 1:
                image_info = this.large;
                break;
        }

        let w: number = image_info.image_width;
        let h: number = image_info.image_height;
        this.DOM_obj.bg_canvas.width = w;
        this.DOM_obj.bg_canvas.height = h;
        this.DOM_obj.main_canvas.width = w;
        this.DOM_obj.main_canvas.height = h;
        this.DOM_obj.minimap_canvas.width = w;
        this.DOM_obj.minimap_canvas.height = h;
        this.DOM_obj.zoom_canvas.width = w;
        this.DOM_obj.zoom_canvas.height = h;
        this.canvas_size = size;
    }

    #set_image_offsets(): void {
        let small_images_count = this.small.images_count;
        let large_images_count = this.large.images_count;

        if (small_images_count > 0 && large_images_count > 0) {
            let small_to_large = small_images_count / large_images_count;
            let large_to_small = large_images_count / small_images_count;

            for (let i = 0; i < small_images_count; i++) {
                this.small.images[i].to_large = Math.round(i / small_to_large);
            }
            for (let i = 0; i < large_images_count; i++) {
                this.large.images[i].to_small = Math.round(i / large_to_small);
            }
        }
    }

    #increase_rotation_speed(): void {
        let s: number = this.rotation_speed_selected;
        s = (s == this.rotation_speed_modifiers.length - 1) ? this.rotation_speed_modifiers.length - 1 : s + 1;
        this.rotation_speed_selected = s;
        let rsg = this.DOM_obj.rotation_speed_gauge as HTMLInputElement;
        rsg.value = String(parseInt(rsg.value) + 1);
        this.#set_rotation_delay();
    }

    #decrease_rotation_speed(): void {
        let s: number = this.rotation_speed_selected;
        s = (s == 0) ? 0 : s - 1;
        this.rotation_speed_selected = s;
        let rsg = this.DOM_obj.rotation_speed_gauge as HTMLInputElement;
        rsg.value = String(parseInt(rsg.value) - 1);
        this.#set_rotation_delay();
    }

    #set_rotation_speed(n: number): void {
        this.rotation_speed_selected = n;
        this.#set_rotation_delay();
    }

    #minimap_to_main_coords(coords: Coords): Coords {
        // TODO: generalize size ratio        
		let size_ratio_w = this.small.image_width / this.large.image_width;
		let size_ratio_h = this.small.image_height / this.large.image_height;

        let result: Coords = {
            x: (coords.x - this.DOM_obj.minimap_canvas.getBoundingClientRect().left) / size_ratio_w + this.DOM_obj.minimap_canvas.getBoundingClientRect().left,
            y: (coords.y - this.DOM_obj.minimap_canvas.getBoundingClientRect().top) / size_ratio_h + this.DOM_obj.minimap_canvas.getBoundingClientRect().top,
        };
        return result;
    }
    
    // /GETTER & SETTER
}   