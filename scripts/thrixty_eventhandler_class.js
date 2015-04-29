/* thrixty_eventhandler_class.js */
/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.1
 *  @license GPLv3
 *  @module ThrixtyPlayer.EventHandler
 */

(function(jQuery){

	/**
	 *  @description ThrixtyPlayer Application
	 *  @name ThrixtyPlayer
	 *
	 *  @namespace ThrixtyPlayer The Thrixty Player is a 360 degree Product Presentation designed in HTML 5.
	 */
	ThrixtyPlayer = ThrixtyPlayer || {};



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
		// assign events to the parents elements
		this.assign_events();
	};

	/**
	 *  @description This function initializes the GUI events.
	 */
	ThrixtyPlayer.EventHandler.prototype.assign_events = function(){
		// This is important, as no keydown events will be fired on onfocused elements.
		this.player.main_box.on("mousedown touchstart", function(){
			this.focus();
		});

		// Keypresses:
		this.player.main_box.on("keydown", this.main_box_event_keys.bind(this));

		// Scrolling:
		this.player.main_box.on("wheel", this.scroll_event.bind(this));

		// Buttons:
		this.player.size_btn.on("click", this.size_button_event_click.bind(this));
		this.player.prev_btn.on("click", this.prev_button_event_click.bind(this));
		this.player.play_btn.on("click", this.play_button_event_click.bind(this));
		this.player.next_btn.on("click", this.next_button_event_click.bind(this));
		this.player.zoom_btn.on("click", this.zoom_button_event_click.bind(this));
		this.player.main_canvas.on("dblclick", this.main_canvas_event_dblclick.bind(this));

		// Document:
		jQuery(document).on("mousedown", this.event_mousedown.bind(this));
		jQuery(document).on("touchstart", this.event_touchstart.bind(this));
		jQuery(document).on("mousemove", this.event_mousemove.bind(this));
		jQuery(document).on("touchmove", this.event_touchmove.bind(this));
		jQuery(document).on("mouseup", this.event_mouseup.bind(this));
		jQuery(document).on("touchend", this.event_touchend.bind(this));
	};
	/**
	 *  @description This function manages the keypress events.
	 */
	ThrixtyPlayer.EventHandler.prototype.main_box_event_keys = function(key_event){
		if( key_event.altKey || key_event.ctrlKey || key_event.metaKey ){
			// do nothing, when these keys are pressed
			return true;
		}
		// get pressed key and check which one was pressed
		var keycode = key_event.keyCode || key_event.which;
		switch( keycode ){
			case 32:  // SPACEBAR
				key_event.preventDefault();
				// correlate to click on play/pause button
				this.player.play_btn.click();
				break;
			case 37:  // LEFT ARROW
				key_event.preventDefault();
				// correlate to click on left button
				this.player.prev_btn.click();
				break;
			case 39:  // RIGHT ARROW
				key_event.preventDefault();
				// correlate to click on right button
				this.player.next_btn.click();
				break;
			case 38:  // UP ARROW
				key_event.preventDefault();
				// doesnt have a correlating button

						// TODO: das folgende in die player klasse umlagern
						var small_frequency = this.player.small.frequency;
						if( 100 >= small_frequency ){
							small_frequency += 5;
							if( 100 < small_frequency ){
								small_frequency = 100;
							}
							this.player.small.frequency = small_frequency;
							this.player.large.frequency = Math.ceil(small_frequency*(this.player.large.images_count/this.player.small.images_count));
							this.player.start_rotation();
						}
						log("small frequency: "+this.player.small.frequency);
						log("large frequency: "+this.player.large.frequency);
				break;
			case 40:  // DOWN ARROW
				key_event.preventDefault();
				// doesnt have a correlating button

						// TODO: das folgende in die player klasse umlagern
						var small_frequency = this.player.small.frequency;
						if( 1 < small_frequency ){
							small_frequency -= 5;
							if( 1 > small_frequency ){
								small_frequency = 1;
							}
							this.player.small.frequency = small_frequency;
							this.player.large.frequency = Math.ceil(small_frequency*(this.player.large.images_count/this.player.small.images_count));
							this.player.start_rotation();
						}
						log("small frequency: "+this.player.small.frequency);
						log("large frequency: "+this.player.large.frequency);
				break;
			case 27:  // ESCAPE
				key_event.preventDefault();
				// doesnt have a correlating button
				this.player.stop_rotation();
				this.player.stop_zoom();
				this.player.quit_fullpage();
				break;
			case 70:  // F
				key_event.preventDefault();
				// correlate to click on fullscreen button
				this.player.size_btn.click();
				break;
			case 33:  // PAGEUP
			case 34:  // PAGEDOWN
			case 35:  // END
			case 36:  // HOME
				// prevent scrolling, when in fullscreen mode
				if( this.player.is_fullscreen ){
					key_event.preventDefault();
				}
				break;
		}
	};
	/**
	 *  @description This function manages the scroll events.
	 */
	ThrixtyPlayer.EventHandler.prototype.scroll_event = function(e){
		// prevent the User from scrolling the content while in fullscreen
		if( this.player.is_fullscreen ){
			e.preventDefault();
		}
	};
	/**
	 *  @description This function manages the click events on the "previous"-button.
	 */
	ThrixtyPlayer.EventHandler.prototype.prev_button_event_click = function(click_event){
		this.player.stop_rotation();
		this.player.previousImage();
	};
	/**
	 *  @description This function manages the click events on the "play"-button.
	 */
	ThrixtyPlayer.EventHandler.prototype.play_button_event_click = function(click_event){
		this.player.toggle_rotation();
	};
	/**
	 *  @description This function manages the click events on the "next"-button.
	 */
	ThrixtyPlayer.EventHandler.prototype.next_button_event_click = function(click_event){
		this.player.stop_rotation();
		this.player.nextImage();
	};
	/**
	 *  @description This function manages the click events on the "zoom"-button.
	 */
	ThrixtyPlayer.EventHandler.prototype.zoom_button_event_click = function(click_event){
		this.player.toggle_zoom();
	};
	/**
	 *  @description This function manages the click events on the "size"-button.
	 */
	ThrixtyPlayer.EventHandler.prototype.size_button_event_click = function(click_event){
		this.player.toggle_fullscreen();
	};

	/**
	 *  @description This function reacts on the touchstart event with memorizing the starting position.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_touchstart = function(touchstart_event){
		// this is only valid, when targeted on the player
		if( touchstart_event.originalEvent.target == this.player.main_canvas[0] ){
			// prevent default actions for this event
			touchstart_event.preventDefault();
			// memorize x coordinate
			this.start_x = touchstart_event.originalEvent.changedTouches[0].pageX;
			this.do_clickstart();
		}
	};
	/**
	 *  @description This function reacts on the mousedown event with memorizing the starting position.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_mousedown = function(mousedown_event){
		// this is only valid, when targeted on the player AND left clicked
		if( mousedown_event.originalEvent.target == this.player.main_canvas[0]  &&  mousedown_event.which == 1 ){
			// memorize x coordinate
			this.start_x = mousedown_event.pageX;
			// prevent default actions for this event
			mousedown_event.preventDefault();
			this.do_clickstart();
		}
	};
	/**
	 *  @description This function wraps, what both clickstart-variants do.
	 */
	ThrixtyPlayer.EventHandler.prototype.do_clickstart = function(){
		// for click event
		this.is_mousedown = true;
		this.is_click = true;

		// reset turns
		this.player.turned_x = 0;
	};
	/**
	 *  @description This function reacts to the finger movement after touching.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_touchmove = function(touchmove_event){
		// different behaviors for zoom and unzoomed state
		// do zoom move, when touching the image AND in zoom state
		if( this.player.is_zoomed && this.is_mousedown ){
			// prevent default action
			touchmove_event.preventDefault();
			// as the player is in zoom mode, this touch CANNOT be treated as a click
			this.is_click = false;
			// get event coordinates and start function to deal with them.
			var current_x = touchmove_event.originalEvent.changedTouches[0].pageX;
			var current_y = touchmove_event.originalEvent.changedTouches[0].pageY;
			this.player.move_zoom(current_x, current_y);

		// do rotation, when touching the image (AND NOT in zoom)
		} else if( this.is_mousedown ){
			// prevent default action
			touchmove_event.preventDefault();
			// get event coordinates and start function to deal with them.
			var current_x = touchmove_event.originalEvent.changedTouches[0].pageX;
			this.do_rotation(current_x);
		}
	};
	/**
	 *  @description This function reacts to the mouse movement after clicking.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_mousemove = function(mousemove_event){
		// moving the mouse after holding the mouse button ("swipe")
		if( this.is_mousedown ){
			// prevent default action
			mousemove_event.preventDefault();
			// rotate considering these coordinates.
			this.do_rotation(mousemove_event.pageX);
		// do zoom move, when zoom is on
		} else if( this.player.is_zoomed ){
			// prevent default action
			mousemove_event.preventDefault();
			// get event coordinates and start function to deal with them.
			var current_x = mousemove_event.pageX;
			var current_y = mousemove_event.pageY;
			this.player.move_zoom(current_x, current_y);
		}
	};
	/**
	 *  @description This function gets called, whenever an event handler decides on roating the visible object.
	 */
	ThrixtyPlayer.EventHandler.prototype.do_rotation = function(current_x){
		// Get distance between current and startig x-position.
		var distance_x = ( current_x - this.start_x );
		// check for this being a drag operation - which exceedes the sensitivity setting.
		if( this.is_click && (Math.abs(distance_x) > this.player.settings.sensitivity_x) ){
			this.is_click = false;
		}
		// only rotate the object, when this cycle is not considered as a click.
		if( !this.is_click ){
			// distance_x set, so use that to do the turns
			this.player.distance_rotation(distance_x);
			// also stop animation
			this.player.stop_rotation();
		}
	};
	/**
	 *  @description This function reacts to the touchend event to end the click cycle.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_touchend = function(touchend_event){
		// prevent default action
		touchend_event.preventDefault();
		this.do_clickend();
	};
	/**
	 *  @description This function reacts to the mouseup event to end the click cycle.
	 */
	ThrixtyPlayer.EventHandler.prototype.event_mouseup = function(mouseup_event){
		// prevent default action
		mouseup_event.preventDefault();
		this.do_clickend();
	};
	/**
	 *  @description This function wraps, what both clickend-variants do.
	 */
	ThrixtyPlayer.EventHandler.prototype.do_clickend = function(mouseup_event){
		// mousebutton not pressed anymore
		this.is_mousedown = false;
		// if this is still considered a click, simulate a play button click.
		if( this.is_click ){
			this.is_click = false;
			this.player.play_btn.click();
		}
	};
	/**
	 *  @description This function reacts to doubleclicks.
	 */
	ThrixtyPlayer.EventHandler.prototype.main_canvas_event_dblclick = function(dblclick_event){
		// prevent default action
		dblclick_event.preventDefault();
		// simulate zoom button click
		this.player.zoom_btn.click();
	};
})(jQuery_2_1_3);
/* /thrixty_eventhandler_class.js */