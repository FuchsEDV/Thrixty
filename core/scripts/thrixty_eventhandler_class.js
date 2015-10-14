/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.4
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
		this.start_x = 0;
		/* assign events to the parents elements */
		this.assign_events();


		/* declaration of properties used by methods */
		this.minimap = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, /* unused */
		};
		this.marker = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, /* unused */
		};
		this.main = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, /* unused */
		};
		this.is_touch = false; /* to be implemented */
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

		/* Window Resize: */
		jQuery(window).on("resize", this.resize_window_event.bind(this));

		/* Keypresses: */
		this.player.DOM_obj.main_box.on("keydown", this.keypresses.bind(this));

		/* Scrolling: */
		this.player.DOM_obj.main_box.on("wheel", this.scroll_event.bind(this));

		/* Buttons: */
		this.player.DOM_obj.load_btn.on("click", this.load_button_event_click.bind(this));
		this.player.DOM_obj.prev_btn.on("click", this.prev_button_event_click.bind(this));
		this.player.DOM_obj.play_btn.on("click", this.play_button_event_click.bind(this));
		this.player.DOM_obj.next_btn.on("click", this.next_button_event_click.bind(this));
		this.player.DOM_obj.zoom_btn.on("click", this.zoom_button_event_click.bind(this));
		this.player.DOM_obj.size_btn.on("click", this.size_button_event_click.bind(this));
		this.player.DOM_obj.event_capture.on("dblclick", this.event_capture_dblclick.bind(this));

		/* Mouse/Touch Interaction: */
		this.player.DOM_obj.event_capture.on("touchstart", this.event_capture_touchstart_event.bind(this));
		this.player.DOM_obj.event_capture.on("mousedown", this.event_capture_mousedown_event.bind(this));
		jQuery(document).on("touchmove", this.touchmove_event_document.bind(this));
		jQuery(document).on("mousemove", this.mousemove_event_document.bind(this));
		jQuery(document).on("touchend", this.touchend_event_document.bind(this));
		jQuery(document).on("mouseup", this.mouseup_event_document.bind(this));
	};










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

								/* TODO: das folgende in die player klasse umlagern */
								var small_frequency = this.player.small.frequency;
								if( small_frequency <= 100 ){
									small_frequency += 5;
									if( small_frequency > 100 ){
										small_frequency = 100;
									}
									this.player.small.frequency = small_frequency;
									this.player.large.frequency = Math.ceil(small_frequency*(this.player.large.images_count/this.player.small.images_count));
									this.player.start_rotation();
								}
								ThrixtyPlayer.log("frequency change to "+this.player.small.frequency+"(for small) and "+this.player.large.frequency+"(for large).");

					}
					break;
				case 40:  /* DOWN ARROW */
					if( this.player.are_events_enabled() ){
						keydown_event.preventDefault();
						/* doesnt have a correlating button */

								/* TODO: das folgende in die player klasse umlagern */
								var small_frequency = this.player.small.frequency;
								if( small_frequency > 1 ){
									small_frequency -= 5;
									if( small_frequency < 1 ){
										small_frequency = 1;
									}
									this.player.small.frequency = small_frequency;
									this.player.large.frequency = Math.ceil(small_frequency*(this.player.large.images_count/this.player.small.images_count));
									this.player.start_rotation();
								}
								ThrixtyPlayer.log("frequency change to "+this.player.small.frequency+"(for small) and "+this.player.large.frequency+"(for large).");
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

	/** Buttons: */
		/**
		 *  @description This function handles the click event on the "load"-button.
		 */
		ThrixtyPlayer.EventHandler.prototype.load_button_event_click = function(click_event){
			/* TODO: rework!! */
			this.player.load_all_images(this.player.small, this.player.DOM_obj.image_cache_small);
			this.player.DOM_obj.load_btn.hide();
			/* this.player.interaction_block = false; */
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
		ThrixtyPlayer.EventHandler.prototype.event_capture_dblclick = function(dblclick_event){
			if( this.player.are_events_enabled() ){
				dblclick_event.preventDefault();
				this.player.toggle_zoom();
			}
		};
	/** /Buttons */

	/** Mouse/Touch Interaction: */
		/* START MOVE EVENT */
		ThrixtyPlayer.EventHandler.prototype.event_capture_touchstart_event = function(touchstart_event){
			if( this.player.are_events_enabled() ){
				this.is_touch = true;
				this.event_capture_mousedown_event(touchstart_event.originalEvent);
				this.is_touch = false;
			}
		};
		ThrixtyPlayer.EventHandler.prototype.event_capture_mousedown_event = function(mousedown_event){
			if( this.player.are_events_enabled() ){
				var main_canvas = this.player.DOM_obj.main_canvas;

				if( this.player.settings.zoom_control == "progressive" ){
					/**
					 * completely ignore minimap events in progressive control mode
					 * completely ignore marker events in progressive control mode
					 * trigger main_canvas's mousedown event
					 */
					mousedown_event.preventDefault();
					this.mousedown_event_main_canvas(mousedown_event);
				} else if( this.player.settings.zoom_control == "classic" ){
					var click_in_main_canvas = this.check_boundaries(main_canvas, mousedown_event.pageX, mousedown_event.pageY);

					/* click in minimap? */
					var minimap_canvas = this.player.DOM_obj.minimap_canvas;
					var click_in_minimap_canvas = this.check_boundaries(minimap_canvas, mousedown_event.pageX, mousedown_event.pageY);

					/* click in marker? */
					var marker = this.player.DOM_obj.marker;
					var click_in_marker = this.check_boundaries(marker, mousedown_event.pageX, mousedown_event.pageY);

					if( !click_in_main_canvas ){
						/* IGNORE, as this click event has nothing to do with the player */
					} else { /* click in main_canvas area */
						mousedown_event.preventDefault();
						/* is this click targeted on minimap? */
						if( click_in_marker ){
							/* do marker stuff */
							this.mousedown_event_marker(mousedown_event);
						} else if( click_in_minimap_canvas ){
							/* do minimap stuff */
							this.mousedown_event_minimap_canvas(mousedown_event);
						} else {
							/* do main_canvas stuff */
							this.mousedown_event_main_canvas(mousedown_event);
						}
					}
				}

			}
		};
			ThrixtyPlayer.EventHandler.prototype.check_boundaries = function(jQ_element, X, Y){
				var offset = jQ_element.offset();
				offset.right = offset.left + jQ_element.width();
				offset.bottom = offset.top + jQ_element.height();
				if( ( jQ_element.css("display") != "none" )
				&&  ( offset.left <= X )
				&&  ( X <= offset.right )
				&&  ( offset.top <= Y )
				&&  ( Y <= offset.bottom )
				){
					return true;
				} else {
					return false;
				}
			};
			ThrixtyPlayer.EventHandler.prototype.mousedown_event_minimap_canvas = function(mousedown_event){
				/* left click? */
				if( mousedown_event.which == 1 || mousedown_event.type == "touchstart" ){
					/* memorize state */
					this.minimap.is_mousedown = true;
					this.minimap.is_click = true;
					/* memorize coordinates */
					this.minimap.start_x = mousedown_event.pageX;
					this.minimap.start_y = mousedown_event.pageY;
				}
			};
			ThrixtyPlayer.EventHandler.prototype.mousedown_event_marker = function(mousedown_event){
				/* left click? */
				if( mousedown_event.which == 1 || mousedown_event.type == "touchstart" ){
					/* memorize state */
					this.marker.is_mousedown = true;
					this.marker.is_click = true;
					/* memorize coordinates */
					this.marker.start_x = mousedown_event.pageX;
					this.marker.start_y = mousedown_event.pageY;
				}
			}
			ThrixtyPlayer.EventHandler.prototype.mousedown_event_main_canvas = function(mousedown_event){
				/* left click? */
				if( mousedown_event.which == 1 || mousedown_event.type == "touchstart" ){
					/* memorize state */
					this.main.is_mousedown = true;
					this.main.is_click = true;
					/* memorize coordinates */
					this.main.start_x = mousedown_event.pageX;
					this.main.start_y = mousedown_event.pageY;
				}
			};

		/* MOVE EVENT ITSELF */
		ThrixtyPlayer.EventHandler.prototype.touchmove_event_document = function(touchmove_event){
			if( this.player.are_events_enabled() ){
				this.is_touch = true;
				this.mousemove_event_document(touchmove_event.originalEvent);
				this.is_touch = false;
			}
		};
		ThrixtyPlayer.EventHandler.prototype.mousemove_event_document = function(mousemove_event){
			if( this.player.are_events_enabled() ){
				if( this.player.settings.zoom_control == "progressive" ){
					if( this.main.is_mousedown ){
						this.do_main_move(mousemove_event);
					} else {
						this.do_progressive_zoom_move(mousemove_event);
					}
				} else {
					if( this.marker.is_mousedown ){
						this.do_classic_marker_move(mousemove_event);
					}
					if( this.minimap.is_mousedown ){
						this.do_classic_minimap_move(mousemove_event);
					}
					if( this.main.is_mousedown ){
						this.do_main_move(mousemove_event);
					}
				}
			}
		};
			ThrixtyPlayer.EventHandler.prototype.do_main_move = function(move_event){
				var distance_x = move_event.pageX - this.main.start_x;

				/* when the mouse is at any point father away from the starting click position, then the sensitivity settings allows, ... */
				if( this.main.is_click && (Math.abs(distance_x) > this.player.settings.sensitivity_x) ){
					/* ... stop this click sequence to execute a click event. */
					this.main.is_click = false;
				}

				if( !this.main.is_click ){
					/* stop animation */
					this.player.stop_rotation();
					/* distance_x set, so use that to do the turns */
					var rest = this.player.distance_rotation(distance_x);
					/* aktualisiere start_x zu momentaner position minus rest */
					this.main.start_x = move_event.pageX - rest;
				}
			};
			ThrixtyPlayer.EventHandler.prototype.do_progressive_zoom_move = function(move_event){
				/* EXECUTED ON MAIN */
				/* if zoomed */
				if( this.player.is_zoomed ){
					/* inform drawing handler of this mouse position */
					this.player.drawing_handler.set_absolute_mouseposition( move_event.pageX, move_event.pageY );
					/* draw curent image */
					this.player.drawing_handler.draw_current_image();
				} else {
					/* do nothing */
				}
			};
			ThrixtyPlayer.EventHandler.prototype.do_classic_marker_move = function(move_event){
				/* do marker move */
				this.marker.is_click = false;
				/*  */
				this.player.drawing_handler.set_absolute_mouseposition( move_event.pageX, move_event.pageY );
				this.player.drawing_handler.draw_current_image();
			};
			ThrixtyPlayer.EventHandler.prototype.do_classic_minimap_move = function(move_event){
				/* do minimap move */
				this.minimap.is_click = false;
				/* update the minimap position in the same way, as the marker does, but smaller */
				/* this.player.drawing_handler.update_mouseposition_upon */
				var X = ( ( move_event.pageX - this.player.DOM_obj.minimap_canvas.offset().left ) * ( this.player.DOM_obj.main_canvas.width()  / this.player.DOM_obj.minimap_canvas.width()  ) ) + this.player.DOM_obj.minimap_canvas.offset().left;
				var Y = ( ( move_event.pageY - this.player.DOM_obj.minimap_canvas.offset().top  ) * ( this.player.DOM_obj.main_canvas.height() / this.player.DOM_obj.minimap_canvas.height() ) ) + this.player.DOM_obj.minimap_canvas.offset().top;
				this.player.drawing_handler.set_absolute_mouseposition( X, Y );
				this.player.drawing_handler.draw_current_image();
			};

		/* END MOVE EVENT */
		ThrixtyPlayer.EventHandler.prototype.touchend_event_document = function(touchend_event){
			if( this.player.are_events_enabled() ){
				this.is_touch = true;
				this.mouseup_event_document(touchend_event.originalEvent);
				this.is_touch = false;
			}
		};
		ThrixtyPlayer.EventHandler.prototype.mouseup_event_document = function(mouseup_event){
			if( this.player.are_events_enabled() ){
				this.mouseup_event_marker(mouseup_event);
				this.mouseup_event_minimap_canvas(mouseup_event);
				this.mouseup_event_main_canvas(mouseup_event);
			}
		};
			ThrixtyPlayer.EventHandler.prototype.mouseup_event_marker = function(up_event){
				if( this.marker.is_mousedown ){
					/* if this is still a click, move zoom to clicked position */
					if( this.marker.is_click ){
						/* this.do_classic_marker_move(up_event); */
						this.player.toggle_rotation();
					}
				}

				/* mousedown reset */
				this.marker.is_mousedown = false;
				this.marker.is_click = false;
				this.marker.start_x = 0;
				this.marker.start_y = 0;
			};
			ThrixtyPlayer.EventHandler.prototype.mouseup_event_minimap_canvas = function(up_event){
				if( this.minimap.is_mousedown ){
					/* if this is still a click, move zoom to clicked position */
					if( this.minimap.is_click ){
						this.do_classic_minimap_move(up_event);
					}
				}

				/* mousedown reset */
				this.minimap.is_mousedown = false;
				this.minimap.is_click = false;
				this.minimap.start_x = 0;
				this.minimap.start_y = 0;
			};
			ThrixtyPlayer.EventHandler.prototype.mouseup_event_main_canvas = function(up_event){
				if( this.main.is_mousedown ){
					/* toggle rotation if this is still a click */
					if( this.main.is_click ){
						this.player.toggle_rotation();
					}
				}

				/* mousedown reset */
				this.main.is_mousedown = false;
				this.main.is_click = false;
				this.main.start_x = 0;
				this.main.start_y = 0;
			};
	/** /Interaction */

})(jQuery_Thrixty);