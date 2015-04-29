/* thrixty_drawinghandler_class.js */
/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.1
 *  @license GPLv3
 *  @module ThrixtyPlayer.DrawingHandler
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
	 *  @description DrawingHandler of the Thrixty Player managing the drawing calculations and areas.
	 *  @name ThrixtyPlayer.DrawingHandler
	 *
	 *  @namespace ThrixtyPlayer.DrawingHandler
	 *  @class
	 *  @param {MainClass} player Which player this drawing stuff belongs to.
	 *
	 *  @property {MainClass} player Which player these events belong to.
	 *  @property {object} mouse Keeping track of mouse Koordinates.
	 *  @property {object} small_dimensions The size of the small pictures.
	 *  @property {object} large_dimensions The size of the large pictures.
	*/
	ThrixtyPlayer.DrawingHandler = function(parent){
		this.player = parent;

		this.mouse = {
			x: null,
			y: null,
		};
		this.small_dimensions = {
			w: null,
			h: null,
		}
		this.large_dimensions = {
			w: null,
			h: null,
		}
	};



	/**
	 *  @description This function decides where to draw the current picture.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_current_image = function(){
		// TODO: Diese Überprüfung fliegt raus, sobald die Optionen nur noch feste Werte annehmen können.
		if( !this.player.is_zoomed ){
			// just render the normal small image
			this.unzoomed();
		} else {
			var zoom_mode = this.player.settings.zoom_mode;
			// if in fullscreen mode, treat outbox as inbox zoom
			if( this.player.is_fullscreen && zoom_mode.indexOf("outbox") != -1 ){
				zoom_mode = "inbox";
			}
			switch( zoom_mode ){
				case "inbox":
					this.inbox_zoom_without_minimap();
					break;
				case "inbox_minimap":
					this.inbox_zoom_with_minimap();
					break;
				case "outbox_top":     // Fallthrough
				case "outbox_right":   // Fallthrough
				case "outbox_bottom":  // Fallthrough
				case "outbox_left":
					if( !this.player.is_fullscreen ){
						this.outbox_zoom();
						break;
					} // else: Fallthrough to Default
				default:
					this.unzoomed();
					break;
			}
		}
	};
	/**
	 *  @description This function draws the unzoomed picture.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.unzoomed = function(){
		// get image as HTML object
		var image = this.player.get_current_small_image();
		// collect information
		var main_canvas = this.player.get_main_canvas_dimensions();
		// check for loading state of image and draw it when it is ready
		// TODO: dies muss überarbeitet werden, da diese überprüfungslogik hier gar nicht hingehört
		if( true === this.player.small.images[this.player.small.active_image_id].elem_loaded ){
			main_canvas.context.drawImage(image, 0, 0);
		}
	};
	/**
	 *  @description This function draws a zoomed picture inside the main canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.inbox_zoom_without_minimap = function(){
		// get image as HTML object
		var image = this.player.get_current_large_image();

		// collect information
		var mouse = {
			x: this.mouse.x,
			y: this.mouse.y,
		};
		var small_dimensions = this.small_dimensions;
		var large_dimensions = this.large_dimensions;
		var main_canvas = this.player.get_main_canvas_dimensions();

		// calculate relative mouse or finger position
		var cursor = {
			x: (mouse.x - main_canvas.x),
			y: (mouse.y - main_canvas.y),
		}
		// Borders - min and max values - reset, when overstepped
		if( cursor.x < 0 ){
			cursor.x = 0;
		}
		if( cursor.x > main_canvas.w ){
			cursor.x = main_canvas.w;
		}
		if( cursor.y < 0 ){
			cursor.y = 0;
		}
		if( cursor.y > main_canvas.h ){
			cursor.y = main_canvas.h;
		}

		// calculate the zoomed image offsets
		var zoom_img_offset = {
			x: cursor.x * ( ( large_dimensions.w - small_dimensions.w ) / main_canvas.w ),
			y: cursor.y * ( ( large_dimensions.h - small_dimensions.h ) / main_canvas.h ),
		}

		// calculate marker dimension
		var marker = {
			x: zoom_img_offset.x * ( small_dimensions.w / large_dimensions.w ),
			y: zoom_img_offset.y * ( small_dimensions.h / large_dimensions.h ),
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ),
		}




		// apply the calculated values
		// draw the large image on the main canvas
		main_canvas.context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, -zoom_img_offset.x, -zoom_img_offset.y, large_dimensions.w, large_dimensions.h);
		// set and reset Alpha for drawing a less visible minimap and marker
		main_canvas.context.globalAlpha = 0.5;
			// the color of the marker is now red and will be an option
			main_canvas.context.strokeStyle = "rgb(255,0,0)";
			main_canvas.context.strokeRect(marker.x, marker.y, marker.w, marker.h);
		main_canvas.context.globalAlpha = 1;
	};
	/**
	 *  @description This function draws a zoomed picture with a minimap positioned at the upper lefthand corner.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.inbox_zoom_with_minimap = function(){
		// get images as HTML objects
		var small_image = this.player.get_current_small_image();
		var large_image = this.player.get_current_large_image();

		// collect information
		var mouse = this.mouse;
		var small_dimensions = this.small_dimensions;
		var large_dimensions = this.large_dimensions;
		var main_canvas = this.player.get_main_canvas_dimensions();

		// calculate relative mouse or finger position
		var cursor = {
			x: (mouse.x - main_canvas.x),
			y: (mouse.y - main_canvas.y),
		}
		// Borders - min and max values - reset, when overstepped
		if( cursor.x < 0 ){
			cursor.x = 0;
		}
		if( cursor.x > main_canvas.w ){
			cursor.x = main_canvas.w;
		}
		if( cursor.y < 0 ){
			cursor.y = 0;
		}
		if( cursor.y > main_canvas.h ){
			cursor.y = main_canvas.h;
		}

		// calculate the zoomed image offsets
		var zoom_img_offset = {
			x: cursor.x * ( ( large_dimensions.w - small_dimensions.w ) / main_canvas.w ),
			y: cursor.y * ( ( large_dimensions.h - small_dimensions.h ) / main_canvas.h ),
		}

		// calculate minimap dimensions
		var minimap = {
			x: 0,
			y: 0,
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ),
		}

		// calculate marker dimension
		var minimap_marker = {
			x: zoom_img_offset.x * ( small_dimensions.w / large_dimensions.w ) * ( small_dimensions.w / large_dimensions.w ),
			y: zoom_img_offset.y * ( small_dimensions.h / large_dimensions.h ) * ( small_dimensions.h / large_dimensions.h ),
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ) * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ) * ( small_dimensions.h / large_dimensions.h ),
		}

		// apply the calculated values
		// draw the large image on the main canvas
		main_canvas.context.drawImage(large_image, 0, 0, large_image.naturalWidth, large_image.naturalHeight, -zoom_img_offset.x, -zoom_img_offset.y, large_dimensions.w, large_dimensions.h);

		// set and reset Alpha for drawing a less visible minimap and marker
		main_canvas.context.globalAlpha = 0.5;
			// draw the small image as the minimap
			main_canvas.context.drawImage(small_image, 0, 0, small_image.naturalWidth, small_image.naturalHeight, minimap.x, minimap.y, minimap.w, minimap.h);
			// the color of the marker is now red and will be an option
			main_canvas.context.strokeStyle = "rgb(255,0,0)";
			main_canvas.context.strokeRect(minimap_marker.x, minimap_marker.y, minimap_marker.w, minimap_marker.h);
		main_canvas.context.globalAlpha = 1;
	};
	/**
	 *  @description This function draws a zoomed picture on a special outbox canvas and the normal picture on the main.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.outbox_zoom = function(){
		// get images as HTML objects
		var small_image = this.player.get_current_small_image();
		var large_image = this.player.get_current_large_image();

		// collect information
		var mouse = {
			x: this.mouse.x,
			y: this.mouse.y,
		};
		var small_dimensions = this.small_dimensions;
		var large_dimensions = this.large_dimensions;
		var main_canvas = this.player.get_main_canvas_dimensions();
		var zoom_canvas = this.player.get_zoom_canvas_dimensions();


		// calculate relative mouse or finger position
		var cursor = {
			x: (mouse.x - main_canvas.x),
			y: (mouse.y - main_canvas.y),
		}
		// Borders - min and max values - reset, when overstepped
		if( cursor.x < 0 ){
			cursor.x = 0;
		}
		if( cursor.x > main_canvas.w ){
			cursor.x = main_canvas.w;
		}
		if( cursor.y < 0 ){
			cursor.y = 0;
		}
		if( cursor.y > main_canvas.h ){
			cursor.y = main_canvas.h;
		}

		// calculate the zoomed image offsets
		var zoom_img_offset = {
			x: cursor.x * ( ( large_dimensions.w - small_dimensions.w ) / main_canvas.w ),
			y: cursor.y * ( ( large_dimensions.h - small_dimensions.h ) / main_canvas.h ),
		}

		// calculate marker position
		//     ( small_dimensions.w/large_dimensions.w )   is the image specific relation from small to large
		var marker = {
			x: zoom_img_offset.x * ( small_dimensions.w / large_dimensions.w ),
			y: zoom_img_offset.y * ( small_dimensions.h / large_dimensions.h ),
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ),
		}

		// apply the calculated values
		// first draw the small image on the main canvas
		main_canvas.context.drawImage(small_image, 0, 0, small_image.naturalWidth, small_image.naturalHeight, 0, 0, small_dimensions.w, small_dimensions.h);
		// second draw the large image on the outbox canvas
		zoom_canvas.context.drawImage(large_image, 0, 0, large_image.naturalWidth, large_image.naturalHeight, -zoom_img_offset.x, -zoom_img_offset.y, large_dimensions.w, large_dimensions.h);

		// set and reset Alpha for drawing a less visible marker
		main_canvas.context.globalAlpha = 0.5;
			// the color of the marker is now red and will be an option
			main_canvas.context.strokeStyle = "rgb(255,0,0)";
			main_canvas.context.strokeRect(marker.x, marker.y, marker.w, marker.h);
		main_canvas.context.globalAlpha = 1;
	};
	/**
	 *  @description This function refreshes the mouse position saved in DrawingHandler.mouse.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.set_mouseposition = function(X, Y){
		this.mouse.x = X;
		this.mouse.y = Y;
	};
	/**
	 *  @description This function sets the small dimensions saved in DrawingHandler.small_dimensions.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.set_small_dimensions = function(image_jq_obj){
		this.small_dimensions.w = image_jq_obj[0].naturalWidth;
		this.small_dimensions.h = image_jq_obj[0].naturalHeight;
	};
	/**
	 *  @description This function sets the small dimensions saved in DrawingHandler.small_dimensions.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.set_large_dimensions = function(image_jq_obj){
		this.large_dimensions.w = image_jq_obj[0].naturalWidth;
		this.large_dimensions.h = image_jq_obj[0].naturalHeight;
	};
})(jQuery_2_1_3);
/* /thrixty_drawinghandler_class.js */