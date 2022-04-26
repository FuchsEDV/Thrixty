"use strict";

import { ThrixtyPlayer } from "./ThrixtyPlayer";
import { ThrixtyLogs, ThrixtyIcons } from "./ThrixtyInterfaces";

export abstract class Thrixty {
    // static properties
    private static is_initialized: boolean = false;
    static get version(): string {
        return "3.0";
    }
    static players: ThrixtyPlayer[] = [];
    static get mainpath(): string {
        let scripts: HTMLCollectionOf<HTMLScriptElement> = document.getElementsByTagName("script");
        let last_inserted_file: HTMLScriptElement = scripts[scripts.length - 1];
        let parts: string[] = last_inserted_file.src.split("/");
        parts.pop();
        return parts.join("/") + "/";
    }
    static logs: ThrixtyLogs = {
        main_log: [],
        player_logs: [[]]
    };
    static icons: ThrixtyIcons = {
        fullsize_icon:   "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='18.5,18.5 42.566,18.5 42.566,25.72 25.72,25.72 25.72,42.566 18.5,42.566'/><polygon class='icon_polygons' fill='#000000' points='81.5,18.5 81.5,42.566 74.283,42.566 74.283,25.72 57.435,25.72 57.435,18.5'/><polygon class='icon_polygons' fill='#000000' points='18.5,81.5 18.5,57.435 25.72,57.435 25.72,74.283 42.566,74.283 42.566,81.5'/><polygon class='icon_polygons' fill='#000000' points='81.5,81.5 57.435,81.5 57.435,74.283 74.283,74.283 74.283,57.435 81.5,57.435'/>",
        load_icon:       "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' points='35.481,12.501 35.481,87.501 81.519,50.217' fill='#000000'/>",
		next_icon:       "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='44.587,87.5 90.641,50.217 44.587,12.5'/><polygon class='icon_polygons' fill='#000000' points='37.139,87.5 28.156,87.5 28.156,12.5 37.139,12.5'/>",
		normalsize_icon: "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='35.348,18.5 42.565,18.5 42.565,42.566 18.5,42.566 18.5,35.348 35.348,35.348'/><polygon class='icon_polygons' fill='#000000' points='18.5,64.652 18.5,57.435 42.565,57.435 42.565,81.5 35.348,81.5 35.348,64.652'/><polygon class='icon_polygons' fill='#000000' points='64.652,81.5 57.435,81.5 57.435,57.435 81.5,57.435 81.5,64.652 64.652,64.652'/><polygon class='icon_polygons' fill='#000000' points='81.5,35.348 81.5,42.566 57.435,42.566 57.435,18.5 64.652,18.5 64.652,35.348'/>",
		pause_icon:      "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' points='36.5,12.5 45.5,12.5 45.5,87.5 36.5,87.5' fill='#000000'/><polygon class='icon_polygons' points='54.5,12.5 63.5,12.5 63.5,87.5 54.5,87.5' fill='#000000'/>",
		play_icon:       "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' points='35.481,12.501 35.481,87.501 81.519,50.217' fill='#000000'/>",
		prev_icon:       "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='55.413,12.5 9.359,50.217 55.413,87.5'/><polygon class='icon_polygons' fill='#000000' points='62.862,12.5 71.844,12.5 71.844,87.5 62.862,87.5'/>",
		zoom_in_icon:    "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='45.5,12.5 54.5,12.5 54.5,45.5 87.5,45.5 87.5,54.5 54.5,54.5 54.5,87.5 45.5,87.5 45.5,54.5 12.5,54.5 12.5,45.5 45.5,45.5'/>",
		zoom_out_icon:   "<circle class='icon_backgrounds' stroke-width='3' cx='50' cy='50' r='47' fill='transparent' stroke='black'/><polygon class='icon_polygons' fill='#000000' points='12.5,45.5 87.5,45.5 87.5,54.5 12.5,54.5'/>",
    };
    static get is_mobile(): boolean {
        // v3.1.0: now works based on width/height. Reason: Safari on iPad masks its user-agent as its desktop version by default.
        let w = window.innerWidth;
        let h = window.innerHeight;
        return h > w || w < 960;
    }
    // static methods
    static log(msg: string, player_id: number): void {
        if (player_id === -1) {
            this.logs.main_log.push(msg);
            return;
        }
        if (!this.logs.player_logs[player_id]) {
            this.logs.player_logs[player_id] = [msg];
            return;
        }
        this.logs.player_logs[player_id].push(msg);
    }
    static export_logs(): string {
        return JSON.stringify(this.logs);
    }
    static create_element(inner_html: string): HTMLElement {
        let div: HTMLDivElement = document.createElement("div");
        div.innerHTML = inner_html;
        return div.children[0] as HTMLElement;
    }
    static add_touch_click_event(elem: HTMLElement, callback: Function): void {
        let is_clicked: boolean = false;
        elem.addEventListener("touchstart", e => { 
            is_clicked = true; 
            e.preventDefault(); 
        });
        elem.addEventListener("touchend", e => {
            callback();
            is_clicked = false;
            e.preventDefault();
        });
    }
    static add_mouse_hold_event(elem: HTMLElement, callback: Function, interval: number): void {
        let i_id = 0;
		elem.addEventListener( "mouseup",   function(e: Event){ clearInterval(i_id); e.preventDefault(); } );
		elem.addEventListener( "mouseout",  function(e: Event){ clearInterval(i_id); e.preventDefault(); } );
		elem.addEventListener( "mousedown", function(e: MouseEvent){
            if (e.button > 1) {
                clearInterval(i_id);
            } else {
			    // (maybe) create custom event object 'custom_e' here
			    let custom_e = e;
			    callback(custom_e);
			    // start interval which calls 'callback(custom_e)'
			    i_id = setInterval(callback, interval);
            }
			e.preventDefault();
		} );
    }
    static add_touch_hold_event(elem: HTMLElement, callback: Function, interval: number): void {
        let i_id = 0;
		elem.addEventListener( "touchend",   function(e: Event){ clearInterval(i_id); e.preventDefault(); } );
		elem.addEventListener( "touchstart", function(e: Event){
			// (maybe) create custom event object 'custom_e' here
			let custom_e = e;
			callback(custom_e);
			// start interval which calls 'callback(custom_e)'
			i_id = setInterval(callback, interval);
			e.preventDefault();
		} );
    }
    static throttle(f: Function, ms: number): () => void {
        let is_throttled: boolean = false;
        let args: any;
        let context: any;

        function wrapper(this: any) {
            if (is_throttled) {
                args = arguments;
                context = this;
                return;
            }
            is_throttled = true;
            f.apply(this, arguments);
            setTimeout(function() {
                is_throttled = false;
                if (args) {
                    wrapper.apply(context, args);
                    args = context = null;
                }
            }, ms);
        }
        return wrapper;
    }
    static init(): void {
        if (this.is_initialized) {
            return;
        }
        this.is_initialized = true;
        Thrixty.log("Initializing Thrixty...", -1);
        let player_candidates: NodeListOf<HTMLElement> = document.querySelectorAll("div.thrixty");
        let candidates_count: number = player_candidates.length;
        for (let i: number = 0; i < candidates_count; i++) {
            let current_candidate: HTMLElement = player_candidates[i];
            new ThrixtyPlayer(current_candidate);
        }
    }
}

// initialize Thrixty on load
window.addEventListener( "DOMContentLoaded", Thrixty.init );
