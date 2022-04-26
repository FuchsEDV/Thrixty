"use strict";

export interface ThrixtyLogs {
    main_log: string[];
    player_logs: Array<Array<string>>;
}

export interface ThrixtyIcons {
    fullsize_icon: string;
    load_icon: string;
    next_icon: string;
    normalsize_icon: string;
    pause_icon: string;
    play_icon: string;
    prev_icon: string;
    zoom_in_icon: string;
    zoom_out_icon: string;
}

export interface ThrixtySettings {
    basepath: string;
    localization_path: string;
    filelist_path_small: string;
    filelist_path_large: string;
    reversed_play_direction: boolean;
    reversed_drag_direction: boolean;
    autoplay: number;
    autoload: boolean;
    start_image_id: number;
    cycle_duration: number;
    zoom_control: string;
    zoom_mode: string;
    zoom_mode_mobile: string;
    zoom_pointer: string;
    marker_mode: string;
    sensitivity_x: number;
    sensitivity_y: number;
}

export interface ThrixtyImageInfo {
    filepath: string,
    filelist_content: string,
    filelist_loaded: boolean | null,
    images_count: number,
    images_loaded: number,
    images_errored: number,
    images: ThrixtyImage[],
    context: string,
    image_width: number,
    image_height: number,
    image_ratio: number,
    active_image_id: number,
}

export interface ThrixtyImage {
    id: number,
	source: string,
	elem_loaded: boolean | null,
	to_small: number | null,
	to_large: number | null,
	element: HTMLImageElement,
}

export interface ThrixtyDOMObject {
    showroom: HTMLElement,
        canvas_container: HTMLElement,
            bg_canvas: HTMLCanvasElement,
            main_canvas: HTMLCanvasElement,
            minimap_canvas: HTMLCanvasElement,
            marker: HTMLElement,
        progress_container: HTMLElement,
            small_progress_bar: HTMLElement,
    controls: HTMLElement,
        control_container_one: HTMLElement,
            prev_btn: HTMLElement,
                prev_icon: HTMLElement,
            play_btn: HTMLElement,
                play_icon: HTMLElement,
                pause_icon: HTMLElement,
            next_btn: HTMLElement,
                next_icon: HTMLElement,
            zoom_btn: HTMLElement,
                zoom_in_icon: HTMLElement,
                zoom_out_icon: HTMLElement,
            size_btn: HTMLElement,
                fullsize_icon: HTMLElement,
                normalsize_icon: HTMLElement,
            close_btn: HTMLElement,
                close_icon: HTMLElement,
            rotation_speed_gauge: HTMLElement,
        load_overlay: HTMLElement,
            load_btn: HTMLElement,
                load_icon: HTMLElement,
        zoom_advisory: HTMLElement,
    zoom_canvas: HTMLCanvasElement,
}

export interface Coords {
    x: number,
    y: number,
}