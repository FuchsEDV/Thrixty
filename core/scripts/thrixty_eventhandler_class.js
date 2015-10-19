/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version 1.4
 *  @license GPLv3
 *  @module ThrixtyPlayer.EventHandler
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
	 *  @description Sub Class of ThrixtyPlayer managing User Interaction Events.
	 *	@name ThrixtyPlayer.EventHandler
	 *
	 *  @namespace ThrixtyPlayer.EventHandler
	 *  @class
	 *  @param {MainClass} MainClass parent
	 *
	 *  @property {MainClass} player Which player these events belong to.
	 *  @property {Integer} start_x Where the current Click and Drag Event started.
	 */
	ThrixtyPlayer.EventHandler = function(parent){
		this.player = parent;

		this.assign_events();

		this.is_click = false; /* for click events */
	};
	/**
	 *  @description This function initializes the GUI events.
	 */
	ThrixtyPlayer.EventHandler.prototype.assign_events = function(){
		var root = this;

		/* This is important, as no keydown events will be fired on onfocused elements. */
		this.player.DOM_obj.main_box.on("mousedown touchstart", function(){
			this.focus();
		});
		/* Keypresses: */
		this.player.DOM_obj.main_box.on("keydown", this.keypresses.bind(this));

		/* Buttons */
			this.player.DOM_obj.prev_btn.on("click", this.prev_button_event_click.bind(this));
			this.player.DOM_obj.play_btn.on("click", this.play_button_event_click.bind(this));
			this.player.DOM_obj.next_btn.on("click", this.next_button_event_click.bind(this));
			this.player.DOM_obj.zoom_btn.on("click", this.zoom_button_event_click.bind(this));
			this.player.DOM_obj.size_btn.on("click", this.size_button_event_click.bind(this));
		/* /Buttons */
		this.player.DOM_obj.main_canvas.on("dblclick", this.main_canvas_dblclick.bind(this));
		/* Loading Manager */
			this.player.DOM_obj.load_overlay.on("click", this.load_button_event_click.bind(this));
			this.player.DOM_obj.load_btn.on("click", this.load_button_event_click.bind(this));
		/* /Loading Manager */


		/* Mouse Interaction */
			/* mousedown */
			jQuery(document).on("mousedown", this.document_mousedown.bind(this));
			this.player.DOM_obj.main_canvas.on("mousedown", this.main_canvas_mousedown.bind(this));
			this.player.DOM_obj.minimap_canvas.on("mousedown", this.minimap_canvas_mousedown.bind(this));
			this.player.DOM_obj.marker.on("mousedown", this.marker_mousedown.bind(this));
			/* mousemove */
			jQuery(document).on("mousemove", this.document_mousemove.bind(this));
			this.player.DOM_obj.main_canvas.on("mousemove", this.main_canvas_mousemove.bind(this));
			this.player.DOM_obj.minimap_canvas.on("mousemove", this.minimap_canvas_mousemove.bind(this));
			this.player.DOM_obj.marker.on("mousemove", this.marker_mousemove.bind(this));
			/* mouseup */
			jQuery(document).on("mouseup", this.document_mouseup.bind(this));
			this.player.DOM_obj.main_canvas.on("mouseup", this.main_canvas_mouseup.bind(this));
			this.player.DOM_obj.minimap_canvas.on("mouseup", this.minimap_canvas_mouseup.bind(this));
			this.player.DOM_obj.marker.on("mouseup", this.marker_mouseup.bind(this));
		/* /Mouse Interaction */
		/* Touch Interaction */
			/* touchstart */
			jQuery(document).on("touchstart", this.document_touchstart.bind(this));
			this.player.DOM_obj.main_canvas.on("touchstart", this.main_canvas_touchstart.bind(this));
			this.player.DOM_obj.minimap_canvas.on("touchstart", this.minimap_canvas_touchstart.bind(this));
			this.player.DOM_obj.marker.on("touchstart", this.marker_touchstart.bind(this));
			/* touchmove */
			jQuery(document).on("touchmove", this.document_touchmove.bind(this));
			this.player.DOM_obj.main_canvas.on("touchmove", this.main_canvas_touchmove.bind(this));
			this.player.DOM_obj.minimap_canvas.on("touchmove", this.minimap_canvas_touchmove.bind(this));
			this.player.DOM_obj.marker.on("touchmove", this.marker_touchmove.bind(this));
			/* touchend */
			jQuery(document).on("touchend", this.document_touchend.bind(this));
			this.player.DOM_obj.main_canvas.on("touchend", this.main_canvas_touchend.bind(this));
			this.player.DOM_obj.minimap_canvas.on("touchend", this.minimap_canvas_touchend.bind(this));
			this.player.DOM_obj.marker.on("touchend", this.marker_touchend.bind(this));
		/* /Touch Interaction */


		/* Window Resize: */
		jQuery(window).on("resize", this.resize_window_event.bind(this));


		/* Scrolling: */
		this.player.DOM_obj.main_box.on("wheel", this.scroll_event.bind(this));

	};






	/** Keypresses: */
		/**
		 *  @description This function manages the keypress events.
		 */
		ThrixtyPlayer.EventHandler.prototype.keypresses = function(keydown_event){
			if( keydown_event.altKey || keydown_event.ctrlKey || keydown_event.metaKey ){
				/* do nothing, when these keys are pressed */
				return true;
			}
			/* get pressed key and check which one was pressed */
			var keycode = keydown_event.keyCode || keydown_event.which;
			switch( keycode ){
				case 32:  /* SPACEBAR */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* correlate to click on play/pause button */
						this.player.DOM_obj.play_btn.click();
					}
					break;
				case 37:  /* LEFT ARROW */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* correlate to click on left button */
						this.player.DOM_obj.prev_btn.click();
					}
					break;
				case 39:  /* RIGHT ARROW */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* correlate to click on right button */
						this.player.DOM_obj.next_btn.click();
					}
					break;
				case 38:  /* UP ARROW */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* doesnt have a correlating button */
						this.player.increase_rotation_frequency();
					}
					break;
				case 40:  /* DOWN ARROW */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* doesnt have a correlating button */
						this.player.decrease_rotation_frequency();
					}
					break;
				case 27:  /* ESCAPE */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* doesnt have a correlating button */
						this.player.stop_rotation();
						this.player.stop_zoom();
						this.player.quit_fullpage();
					}
					break;
				case 70:  /* F */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* correlate to click on fullpage button */
						this.player.DOM_obj.size_btn.click();
					}
					break;
				case 33:  /* PAGEUP */
				case 34:  /* PAGEDOWN */
				case 35:  /* END */
				case 36:  /* HOME */
					/* prevent scrolling, when in fullpage mode */
					if( this.player.is_fullpage ){
						keydown_event.preventDefault();
					}
					break;
			}
		};
	/** /Keypresses */





	/** Buttons: */
		/**
		 *  @description This function handles the click event on the "load"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.load_button_event_click = function(e){
			this.player.DOM_obj.load_overlay.hide();
			this.player.DOM_obj.load_btn.hide();

			this.player.load_all_images(this.player.small, this.player.DOM_obj.image_cache_small);
		};
		/**
		 *  @description This function handles the click event on the "previous"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.prev_button_event_click = function(click_event){
			if( this.player.are_events_enabled() ){
				this.player.stop_rotation();
				this.player.previousImage();
			}
		};
		/**
		 *  @description This function handles the click event on the "play"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.play_button_event_click = function(click_event){
			if( this.player.are_events_enabled() ){
				this.player.toggle_rotation();
			}
		};
		/**
		 *  @description This function handles the click event on the "next"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.next_button_event_click = function(click_event){
			if( this.player.are_events_enabled() ){
				this.player.stop_rotation();
				this.player.nextImage();
			}
		};
		/**
		 *  @description This function handles the click event on the "zoom"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.zoom_button_event_click = function(click_event){
			if( this.player.is_zoom_enabled() ){
				this.player.toggle_zoom();
			}
		};
		/**
		 *  @description This function handles the click event on the "size"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.size_button_event_click = function(click_event){
			if( this.player.are_events_enabled() ){
				this.player.toggle_fullpage();
			}
		};
		/**
		 *  @description This function handles the double click event on the event-capture area.
		 */
		ThrixtyPlayer.EventHandler.prototype.main_canvas_dblclick = function(dblclick_event){
			if( this.player.are_events_enabled() ){
				dblclick_event.preventDefault();
				this.player.toggle_zoom();
			}
		};
	/** /Buttons */





	/** Interaction */
		/* mousedown */
			ThrixtyPlayer.EventHandler.prototype.document_mousedown = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_mousedown = function(e){
				/* A1 | user wants to turn the object */
				if( this.player.settings.zoom_control == "progressive" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_object_turn(e.pageX, e.pageY);
						e.preventDefault();
					}
				}
				/* B1 | user wants to turn the object */
				if( this.player.settings.zoom_control == "classic" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_object_turn(e.pageX, e.pageY);
						e.preventDefault();
					}
				}
				this.is_click = true;
			};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_mousedown = function(e){
				/* A1 | user wants to turn the object */
				if( this.player.settings.zoom_control == "progressive" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_object_turn(e.pageX, e.pageY);
						e.preventDefault();
					}
				}
				/* B2 | user wants to move the section | minimap variation */
				if( this.player.settings.zoom_control == "classic" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_section_move("minimap");
						this.execute_section_move(e.pageX, e.pageY); /* instantly snap to target position */
						e.preventDefault();
					}
				}
			};
			ThrixtyPlayer.EventHandler.prototype.marker_mousedown = function(e){
				/* A1 | user wants to turn the object */
				if( this.player.settings.zoom_control == "progressive" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_object_turn(e.pageX, e.pageY);
						e.preventDefault();
					}
				}
				/* B2 | user wants to move the section */
				if( this.player.settings.zoom_control == "classic" ){
					/* left click only */
					if( e.which == 1 ){
						this.prepare_section_move("marker");
						this.execute_section_move(e.pageX, e.pageY); /* instantly snap to target position */
						e.preventDefault();
					}
				}
			};
		/* /mousedown */
		/* mousemove */
			ThrixtyPlayer.EventHandler.prototype.document_mousemove = function(e){
				/* A1 | user turns the object */
				/* B1 | user turns the object */
				if( this.object_turn.prepared ){
					this.execute_object_turn(e.pageX, e.pageY);
					e.preventDefault();
				}
				/* A2 | user moves section */
				if( this.player.is_zoomed && this.player.settings.zoom_control == "progressive" ){
					this.execute_section_move(e.pageX, e.pageY);
					e.preventDefault();
				}
				/* B2 | user moves section */
				if( this.section_move.prepared ){
					this.execute_section_move(e.pageX, e.pageY);
					e.preventDefault();
				}
			};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_mousemove = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_mousemove = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.marker_mousemove = function(e){/**/};
		/* /mousemove */
		/* mouseup */
			ThrixtyPlayer.EventHandler.prototype.document_mouseup = function(e){
				/* A1 | user stops turning the object */
				/* B1 | user stops turning the object */
				if( this.object_turn.prepared ){
					this.execute_object_turn(e.pageX, e.pageY); /* do a final object turn */
					this.stop_object_turn();
					e.preventDefault();
				}
				/* if this is still a click, toggle object rotation */
				if( this.is_click ){
					this.player.toggle_rotation();
					this.is_click = false;
				}
				/* B2 | user stops moving section */
				if( this.section_move.prepared ){
					this.execute_section_move(e.pageX, e.pageY); /* do a final section move */
					this.stop_section_move();
					e.preventDefault();
				}
			};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_mouseup = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_mouseup = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.marker_mouseup = function(e){/**/};
		/* /mouseup */
		/* touchstart */
			ThrixtyPlayer.EventHandler.prototype.document_touchstart = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_touchstart = function(e){
				/* C1 | user wants to turn the object */
				this.prepare_object_turn(e.originalEvent.pageX, e.originalEvent.pageY);
				e.preventDefault();
				/* register this as starting a click */
				this.is_click = true;
			};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_touchstart = function(e){
				// objektausschnitt verschieben
				/* C2 | user wants to move the section */
				if( this.player.is_zoomed ){
					this.prepare_section_move("minimap");
					this.execute_section_move(e.originalEvent.pageX, e.originalEvent.pageY); /* instantly snap to target position */
					e.preventDefault();
				}
			};
			ThrixtyPlayer.EventHandler.prototype.marker_touchstart = function(e){
				// objektausschnitt verschieben
				/* C2 | user wants to move the section */
				if( this.player.is_zoomed ){
					this.prepare_section_move("marker");
					this.execute_section_move(e.originalEvent.pageX, e.originalEvent.pageY); /* instantly snap to target position */
					e.preventDefault();
				}
			};
		/* /touchstart */
		/* touchmove */
			ThrixtyPlayer.EventHandler.prototype.document_touchmove = function(e){
				/* stop scrolling in fullpage mode */
				if( this.player.is_fullpage ){
					e.preventDefault();
				}
				/* C1 | user turns the object */
				if( this.object_turn.prepared ){
					this.execute_object_turn(e.originalEvent.pageX, e.originalEvent.pageY);
					e.preventDefault();
				}
				/* C2 | user moves the section */
				if( this.section_move.prepared ){
					this.execute_section_move(e.originalEvent.pageX, e.originalEvent.pageY);
					e.preventDefault();
				}
			};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_touchmove = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_touchmove = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.marker_touchmove = function(e){/**/};
		/* /touchmove */
		/* touchend */
			ThrixtyPlayer.EventHandler.prototype.document_touchend = function(e){
				/* C1 | user stop turning the object */
				if( this.object_turn.prepared ){
					this.execute_object_turn(e.originalEvent.pageX, e.originalEvent.pageY); /* do a final object turn */
					this.stop_object_turn();
					e.preventDefault();
				}
				/* C2 | user stops moving section */
				if( this.section_move.prepared ){
					this.execute_section_move(e.originalEvent.pageX, e.originalEvent.pageY); /* do a final section move */
					this.stop_section_move();
					e.preventDefault();
				}
				/* if this is still a click, toggle object rotation */
				if( this.is_click ){
					this.player.toggle_rotation();
					this.is_click = false;
				}
			};
			ThrixtyPlayer.EventHandler.prototype.main_canvas_touchend = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.minimap_canvas_touchend = function(e){/**/};
			ThrixtyPlayer.EventHandler.prototype.marker_touchend = function(e){/**/};
		/* /touchend */
	/** /Interaction */





	/** Interaction Functions */
		/* Object Turn */
			ThrixtyPlayer.EventHandler.prototype.object_turn = {
				prepared: false,
				start_x: null,
				start_y: null,
				last_x: null,
				last_y: null,
			};
			ThrixtyPlayer.EventHandler.prototype.prepare_object_turn = function(x, y){
				if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
					/* prepare turn by memorizing important information */
					this.object_turn.prepared = true;
					this.object_turn.start_x = x;
					/* this.object_turn.start_y = y; *//* unused */
					this.object_turn.last_x = x;
					/* this.object_turn.last_y = y; */ /* unused */
				}
			};
			ThrixtyPlayer.EventHandler.prototype.execute_object_turn = function(x, y){
				if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
					/* distance travelled since last object turn call */
					var distance_x = x - this.object_turn.last_x;

					/* following 2 lines unused */
					/* phytagoras: d = sqrt( x^2 + y^2 ) */
					/* var distance = Math.pow( Math.pow( x - this.object_turn.start_x, 2) + Math.pow( y - this.object_turn.start_y, 2), 1/2 ); */

					if( Math.abs( x - this.object_turn.start_x) >= this.player.settings.sensitivity_x ){
						this.is_click = false;
						this.player.stop_rotation();
					}
					/* memorize x and subtract the left-over pixels */
					this.object_turn.last_x = x - this.player.distance_rotation(distance_x);
				}
			};
			ThrixtyPlayer.EventHandler.prototype.stop_object_turn = function(){
				/* forget the event data */
				this.object_turn.prepared = false;
				this.object_turn.last_x = null;
				/* this.object_turn.last_y = null; *//* unused */
			};
		/* /Object Turn */
		/* Section Move */
			ThrixtyPlayer.EventHandler.prototype.section_move = {
				prepared: false, /* prepared flag */
				minimap: false,  /* triggered-by-click-on-minimap flag */
			};
			ThrixtyPlayer.EventHandler.prototype.prepare_section_move = function(mode){
				if( typeof(mode) != "undefined" ){
					/* flag prepared */
					this.section_move.prepared = true;
					if( mode === "minimap" ){
						/* flag as minimap */
						this.section_move.minimap = true;
					}
				}
			};
			ThrixtyPlayer.EventHandler.prototype.execute_section_move = function(x, y){
				if( typeof(x) != "undefined" && typeof(y) != "undefined" ){
					var coords = {x: x, y: y};

					/* if mode is minimap, convert minimap to main coordinates */
					if( this.section_move.minimap ){
						coords = this.player.minimap_to_main_coords(coords);
					}

					/* update mouseposition and redraw image */
					this.player.drawing_handler.set_absolute_mouseposition( coords.x, coords.y );
					this.player.drawing_handler.draw_current_image();
				}
			};
			ThrixtyPlayer.EventHandler.prototype.stop_section_move = function(){
				/* unflag prepared and unset mode*/
				this.section_move.prepared = false;
				this.section_move.minimap = false;
			};
		/* Section Move */
	/** /Interaction Functions */





	/** Window Resize: */
		/**
		 * @description  This method handles the resizing events.
		 */
		ThrixtyPlayer.EventHandler.prototype.resize_window_event = function(resize_event){
			if( this.player.is_fullpage ){
				this.player.set_fullpage_canvas_dimensions();
			}
		};
	/** /Window Resize */





	/** Scrolling: */
		/**
		 *  @description This function manages the scroll events.
		 */
		ThrixtyPlayer.EventHandler.prototype.scroll_event = function(wheel_event){
			/* prevent the User from scrolling the content while in fullpage */
			if( this.player.is_fullpage ){
				wheel_event.preventDefault();
			}
		};
	/** /Scrolling */

})(jQuery_Thrixty);