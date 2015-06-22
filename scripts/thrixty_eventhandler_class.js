/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.3
 *  @license GPLv3
 *  @module ThrixtyPlayer.EventHandler
 */
;(function(jQuery){

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


		// declaration of properties used by methods
		this.minimap = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, // unused
		};
		this.marker = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, // unused
		};
		this.main = {
			is_mousedown: false,
			is_click: false,
			start_x: 0,
				start_y: 0, // unused
		};
		this.is_touch = false; // to be implemented
	};
	/**
	 *  @description This function initializes the GUI events.
	 */
	ThrixtyPlayer.EventHandler.prototype.assign_events = function(){
		var root = this;


		// // TEST resize event
		// jQuery(window).on(
		// 	"resize",
		// 	function(resize_event){
		// 		// root.player.drawing_handler.draw_current_image();
		// 	}
		// );





		// This is important, as no keydown events will be fired on onfocused elements.
		this.player.DOM_obj.main_box.on("mousedown touchstart", function(){
			this.focus();
		});

		// Keypresses:
		this.player.DOM_obj.main_box.on("keydown", this.main_box_event_keys.bind(this));

		// Scrolling:
		this.player.DOM_obj.main_box.on("wheel", this.scroll_event.bind(this));

		// Buttons:
		this.player.DOM_obj.size_btn.on("click", this.size_button_event_click.bind(this));
		this.player.DOM_obj.prev_btn.on("click", this.prev_button_event_click.bind(this));
		this.player.DOM_obj.play_btn.on("click", this.play_button_event_click.bind(this));
		this.player.DOM_obj.next_btn.on("click", this.next_button_event_click.bind(this));
		this.player.DOM_obj.zoom_btn.on("click", this.zoom_button_event_click.bind(this));
		this.player.DOM_obj.main_canvas.on("dblclick", this.main_canvas_event_dblclick.bind(this));

		// Document:
		jQuery(document).on("mousedown",  this.mousedown_event_document.bind(this)  );
		jQuery(document).on("touchstart", this.touchstart_event_document.bind(this) );

		jQuery(document).on("mousemove",  this.mousemove_event_document.bind(this)  );
		jQuery(document).on("touchmove",  this.touchmove_event_document.bind(this)  );

		jQuery(document).on("mouseup",    this.mouseup_event_document.bind(this)    );
		jQuery(document).on("touchend",   this.touchend_event_document.bind(this)   );
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
				this.player.DOM_obj.play_btn.click();
				break;
			case 37:  // LEFT ARROW
				key_event.preventDefault();
				// correlate to click on left button
				this.player.DOM_obj.prev_btn.click();
				break;
			case 39:  // RIGHT ARROW
				key_event.preventDefault();
				// correlate to click on right button
				this.player.DOM_obj.next_btn.click();
				break;
			case 38:  // UP ARROW
				key_event.preventDefault();
				// doesnt have a correlating button

						// TODO: das folgende in die player klasse umlagern
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
						log("small frequency: "+this.player.small.frequency);
						log("large frequency: "+this.player.large.frequency);
				break;
			case 40:  // DOWN ARROW
				key_event.preventDefault();
				// doesnt have a correlating button

						// TODO: das folgende in die player klasse umlagern
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
				this.player.DOM_obj.size_btn.click();
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





	ThrixtyPlayer.EventHandler.prototype.touchstart_event_document = function(touchstart_event){
		this.is_touch = true;
		this.mousedown_event_document(touchstart_event);
		this.is_touch = false;
	};
	ThrixtyPlayer.EventHandler.prototype.mousedown_event_document = function(mousedown_event){
		// Emuliere Weitergabe von Events an die Canvas'e.
		// Das unterschiedliche Verhalten der Teile sollte eigentlich dazu führen, dass unterschiedliche Events durchgegeben werden können oder nicht.
		//   Die Settings würden zusammen mit dem Zustand darüber entscheiden, wann es aktiviert wird und wann nicht.

		// Emulate (...)

		var main_canvas = this.player.DOM_obj.main_canvas;
		var click_in_main_canvas = this.check_boundaries(main_canvas, mousedown_event.pageX, mousedown_event.pageY);

		if( this.player.settings.zoom_control == "progressive" ){
			// completely ignore minimap events in progressive control mode
			// completely ignore marker events in progressive control mode
			// if mousedown within main_canvas boundaries, trigger its mousedown event
			if( click_in_main_canvas ){
				// prevent default actions for this event
				mousedown_event.preventDefault();
				this.mousedown_event_main_canvas(mousedown_event);
			}
		} else if( this.player.settings.zoom_control == "classic" ){
			// click in minimap?
			var minimap_canvas = this.player.DOM_obj.minimap_canvas;
			var click_in_minimap_canvas = this.check_boundaries(minimap_canvas, mousedown_event.pageX, mousedown_event.pageY);

			// click in marker?
			var marker = this.player.DOM_obj.marker;
			var click_in_marker = this.check_boundaries(marker, mousedown_event.pageX, mousedown_event.pageY);

			if( !click_in_main_canvas ){
				// IGNORE, as this click event has nothing to do with the player
			} else { // click in main_canvas area
				mousedown_event.preventDefault();
				// is this click targeted on minimap?
				if( click_in_marker ){
					// do marker stuff
					this.mousedown_event_marker(mousedown_event);
				} else if( click_in_minimap_canvas ){
					// do minimap stuff
					this.mousedown_event_minimap_canvas(mousedown_event);
				} else {
					// do main_canvas stuff
					this.mousedown_event_main_canvas(mousedown_event);
				}
			}
		}
	};
	ThrixtyPlayer.EventHandler.prototype.mousedown_event_minimap_canvas = function(mousedown_event){
		// left click?
		if( mousedown_event.which == 1 ){
			// memorize state
			this.minimap.is_mousedown = true;
			this.minimap.is_click = true;
			// memorize coordinates
			this.minimap.start_x = mousedown_event.pageX;
			this.minimap.start_y = mousedown_event.pageY;
		}
	};
	ThrixtyPlayer.EventHandler.prototype.mousedown_event_marker = function(mousedown_event){
		// left click?
		if( mousedown_event.which == 1 ){
			// memorize state
			this.marker.is_mousedown = true;
			this.marker.is_click = true;
			// memorize coordinates
			this.marker.start_x = mousedown_event.pageX;
			this.marker.start_y = mousedown_event.pageY;
		}
	}
	ThrixtyPlayer.EventHandler.prototype.mousedown_event_main_canvas = function(mousedown_event){
		// left click?
		if( mousedown_event.which == 1 ){
			// memorize state
			this.main.is_mousedown = true;
			this.main.is_click = true;
			// memorize coordinates
			this.main.start_x = mousedown_event.pageX;
			this.main.start_y = mousedown_event.pageY;
		}
	};




	ThrixtyPlayer.EventHandler.prototype.touchmove_event_document = function(touchmove_event){
		this.is_touch = true;
		this.mousemove_event_document(touchmove_event);
		this.is_touch = false;
	};
	ThrixtyPlayer.EventHandler.prototype.mousemove_event_document = function(mousemove_event){
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
	};
	/**
	 *  @description Description. | This function is the same for both zoom controls.
	 */
	ThrixtyPlayer.EventHandler.prototype.do_main_move = function(move_event){
		//
		var distance_x = move_event.pageX - this.main.start_x;

		// when the mouse is at any point father away from the starting click position, then the sensitivity settings allows, ...
		if( this.main.is_click && (Math.abs(distance_x) > this.player.settings.sensitivity_x) ){
			// ... stop this click sequence to execute a click event.
			this.main.is_click = false;
		}

		//
		if( !this.main.is_click ){
			// stop animation
			this.player.stop_rotation();
			// distance_x set, so use that to do the turns
			var rest = this.player.distance_rotation(distance_x);
			// aktualisiere start_x zu momentaner position minus rest
			this.main.start_x = move_event.pageX - rest;
		}
	};

	ThrixtyPlayer.EventHandler.prototype.do_progressive_zoom_move = function(move_event){
		// EXECUTED ON MAIN
		// if zoomed
		if( this.player.is_zoomed ){
			// inform drawing handler of this mouse position
			this.player.drawing_handler.set_absolute_mouseposition( move_event.pageX, move_event.pageY );
			// draw curent image
			this.player.drawing_handler.draw_current_image();
		} else {
			// do nothing
		}
	};

	ThrixtyPlayer.EventHandler.prototype.do_classic_marker_move = function(move_event){
		// do marker move
		this.marker.is_click = false;
		//
		this.player.drawing_handler.set_absolute_mouseposition( move_event.pageX, move_event.pageY );
		this.player.drawing_handler.draw_current_image();
	}
	ThrixtyPlayer.EventHandler.prototype.do_classic_minimap_move = function(move_event){
		// do minimap move
		this.minimap.is_click = false;
		// update the minimap position in the same way, as the marker does, but smaller
		// this.player.drawing_handler.update_mouseposition_upon
		var X = ( ( move_event.pageX - this.player.DOM_obj.minimap_canvas.offset().left ) * ( this.player.DOM_obj.main_canvas.width()  / this.player.DOM_obj.minimap_canvas.width()  ) ) + this.player.DOM_obj.minimap_canvas.offset().left;
		var Y = ( ( move_event.pageY - this.player.DOM_obj.minimap_canvas.offset().top  ) * ( this.player.DOM_obj.main_canvas.height() / this.player.DOM_obj.minimap_canvas.height() ) ) + this.player.DOM_obj.minimap_canvas.offset().top;
		this.player.drawing_handler.set_absolute_mouseposition( X, Y );
		this.player.drawing_handler.draw_current_image();
	};






	ThrixtyPlayer.EventHandler.prototype.touchend_event_document = function(touchend_event){
		this.is_touch = true;
		this.mouseup_event_document(touchend_event);
		this.is_touch = false;
	};
	ThrixtyPlayer.EventHandler.prototype.mouseup_event_document = function(mouseup_event){
		this.mouseup_event_marker(mouseup_event);
		this.mouseup_event_minimap_canvas(mouseup_event);
		this.mouseup_event_main_canvas(mouseup_event);
	};




	ThrixtyPlayer.EventHandler.prototype.mouseup_event_marker = function(up_event){
		if( this.marker.is_mousedown ){
			// if this is still a click, move zoom to clicked position
			if( this.marker.is_click ){
				// this.do_classic_marker_move(up_event);
				this.player.toggle_rotation();
			}
		}

		// mousedown reset
		this.marker.is_mousedown = false;
		this.marker.is_click = false;
		this.marker.start_x = 0;
		this.marker.start_y = 0;
	};
	ThrixtyPlayer.EventHandler.prototype.mouseup_event_minimap_canvas = function(up_event){
		if( this.minimap.is_mousedown ){
			// if this is still a click, move zoom to clicked position
			if( this.minimap.is_click ){
				this.do_classic_minimap_move(up_event);
			}
		}

		// mousedown reset
		this.minimap.is_mousedown = false;
		this.minimap.is_click = false;
		this.minimap.start_x = 0;
		this.minimap.start_y = 0;
	};
	ThrixtyPlayer.EventHandler.prototype.mouseup_event_main_canvas = function(up_event){
		if( this.main.is_mousedown ){
			// toggle rotation if this is still a click
			if( this.main.is_click ){
				this.player.toggle_rotation();
			}
		}

		// mousedown reset
		this.main.is_mousedown = false;
		this.main.is_click = false;
		this.main.start_x = 0;
		this.main.start_y = 0;
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
	}




























	ThrixtyPlayer.EventHandler.prototype.event_touchstart = function(touchstart_event){
		// this is only valid, when targeted on the player
		if( touchstart_event.originalEvent.target == this.player.DOM_obj.main_canvas[0] ){
			// prevent default actions for this event
			touchstart_event.preventDefault();
			// memorize x coordinate
			this.start_x = touchstart_event.originalEvent.changedTouches[0].pageX;
			this.do_clickstart();
		}
	};
	ThrixtyPlayer.EventHandler.prototype.event_mousedown = function(mousedown_event){
		// this is only valid, when targeted on the player AND left clicked
		if( (mousedown_event.originalEvent.target == this.player.DOM_obj.main_canvas[0])  &&  (mousedown_event.which == 1) ){
			// memorize x coordinate
			this.start_x = mousedown_event.pageX;
			// prevent default actions for this event
			mousedown_event.preventDefault();
			this.do_clickstart();
		}
	};
	ThrixtyPlayer.EventHandler.prototype.do_clickstart = function(){
		// for click event
		this.is_mousedown = true;
		this.is_click = true;

		// reset turns
		this.player.turned_x = 0;
	};





	ThrixtyPlayer.EventHandler.prototype.event_touchend = function(touchend_event){
		// prevent default action
		touchend_event.preventDefault();
		this.do_clickend();
	};
	ThrixtyPlayer.EventHandler.prototype.event_mouseup = function(mouseup_event){
		// prevent default action
		mouseup_event.preventDefault();
		this.do_clickend();
	};
	ThrixtyPlayer.EventHandler.prototype.do_clickend = function(mouseup_event){
		// mousebutton not pressed anymore
		this.is_mousedown = false;
		// if this is still considered a click, simulate a play button click.
		if( this.is_click ){
			this.is_click = false;
			this.player.DOM_obj.play_btn.click();
		}
	};













	ThrixtyPlayer.EventHandler.prototype.main_canvas_event_dblclick = function(dblclick_event){
		// prevent default action
		dblclick_event.preventDefault();
		// simulate zoom button click
		this.player.DOM_obj.zoom_btn.click();
	};
})(jQuery_2_1_3);