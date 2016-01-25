/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version 1.6
 *  @license GPLv3
 *  @module ThrixtyPlayer.DrawingHandler
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
	 *  @description DrawingHandler of the Thrixty Player managing the drawing calculations and areas.
	 *  @name ThrixtyPlayer.DrawingHandler
	 *
	 *  @namespace ThrixtyPlayer.DrawingHandler
	 *  @class
	 *  @param {MainClass} player Which player this drawing stuff belongs to.
	 *
	 *  @property {MainClass} player Which player these events belong to.
	 *  @property {object} mouse Keeping track of mouse Koordinates.
	*/
	ThrixtyPlayer.DrawingHandler = function(parent){
		this.player = parent;

		/* current mouseposition to calculate drawing positions from - fed from EventHandler */
		this.absolute_mouse = {
			x: 0,
			y: 0,
		};

		/* current mouseposition relative to the main_canvas's upper-left-hand-corner */
		this.relative_mouse = {
			x: 0,
			y: 0,
		};

		/**
		 * unused so far
		 * this.bg_canvas = {
		 * 	self: null,
		 * 	ctx: null,
		 * 	x: 0,
		 * 	y: 0,
		 * 	draw_w: 0,
		 * 	draw_h: 0,
		 * 	vp_w: 0,
		 * 	vp_h: 0,
		 * };
		 */

		/*  */
		this.main_canvas = {
			self: null,
			ctx: null,
			x: 0,
			y: 0,
			draw_w: 0,
			draw_h: 0,
			vp_w: 0,
			vp_h: 0,
		};

		/*  */
		this.minimap_canvas = {
			self: null,
			ctx: null,
			x: 0,
			y: 0,
			draw_w: 0,
			draw_h: 0,
			vp_w: 0,
			vp_h: 0,
		};

		this.marker = null;

		/*  */
		this.zoom_canvas = {
			self: null,
			ctx: null,
			x: 0,
			y: 0,
			draw_w: 0,
			draw_h: 0,
			vp_w: 0,
			vp_h: 0,
		};
	};

	/**
	 *  @description This function refreshes the mouse position saved in DrawingHandler.mouse.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.set_absolute_mouseposition = function(X, Y){
		this.absolute_mouse.x = X;
		this.absolute_mouse.y = Y;
	};

	/**
	 *  @description This function refreshes the mouse position saved in DrawingHandler.mouse.
	 *    Diese Methode bezieht sich auf this.mouse und this.main_canvas.
	 *    (Diese sollten also vorher aktualisiert werden!)
	 */
	ThrixtyPlayer.DrawingHandler.prototype.calculate_relative_mouse_position = function(){
		/* calculate relative mouse position */
		var cursor_x = (this.absolute_mouse.x - this.main_canvas.x);
		var cursor_y = (this.absolute_mouse.y - this.main_canvas.y);

		/* Borders - min and max values - reset, when overstepped */
		if( cursor_x < 0 ){
			cursor_x = 0;
		}
		if( cursor_x > this.main_canvas.vp_w ){
			cursor_x = this.main_canvas.vp_w;
		}
		if( cursor_y < 0 ){
			cursor_y = 0;
		}
		if( cursor_y > this.main_canvas.vp_h ){
			cursor_y = this.main_canvas.vp_h;
		}
		/* assign calculated values */
		this.relative_mouse.x = cursor_x;
		this.relative_mouse.y = cursor_y;
	};
	/**
	 *  @description This function calculates the offsets used in inbox zoom.
	 *    Diese Methode bezieht sich auf this.relative_mouse, this.main_canvas
	 *    (Diese sollten also vorher aktualisiert werden!)
	 */
	ThrixtyPlayer.DrawingHandler.prototype.get_zoom_offsets = function(){
		var position_percentage_x = ( this.relative_mouse.x / this.main_canvas.vp_w );
		var position_percentage_y = ( this.relative_mouse.y / this.main_canvas.vp_h );
		return {
			x: position_percentage_x * ( this.player.large.image_width - this.player.small.image_width ),
			y: position_percentage_y * ( this.player.large.image_height - this.player.small.image_height ),
		}
	};





	/**
	 *  @description This function decides where to draw the current picture.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_current_image = function(){
		if( !this.player.is_zoomed ){
			this.unzoomed();
		} else {
			if( this.player.settings.zoom_mode == "inbox" ){
				this.inbox_zoom();
			} else if( this.player.settings.zoom_mode == "outbox" ){
				if( !this.player.is_fullpage ){
					this.outbox_zoom();
				} else {
					this.inbox_zoom();
				}
			}
			if( this.player.settings.position_indicator == "minimap" ){
				this.draw_minimap();
			} else if( this.player.settings.position_indicator == "marker" ){
				this.player.set_marker_position();
			}
		}
	};
	/**
	 *  @description This function draws an unzoomed picture inside the main canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.unzoomed = function(){
		/* Task: Draw the unzoomed image on the canvas */

		/* refresh main_canvas information (in case smt changed in viewport size) */
		this.main_canvas = this.player.get_main_canvas_dimensions();

		/* get current small image */
		var small_image = this.player.get_current_small_image();

		/* clear */
		this.main_canvas.ctx.clearRect(
			0,
			0,
			this.main_canvas.draw_w,
			this.main_canvas.draw_h
		);

		/* draw current small image */
		if( !!small_image ){
			this.main_canvas.ctx.drawImage(
				small_image,
				0,
				0
			);
		}
	};
	/**
	 *  @description This function draws a zoomed picture inside the main canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.inbox_zoom = function(){
		/* Task: Draw the enlarged image on the canvas */

		/* refresh main_canvas information (in case smt changed in viewport size) */
		this.main_canvas = this.player.get_main_canvas_dimensions();

		/* refresh class-variable relative_mouse */
		this.calculate_relative_mouse_position();

		/* get current offsets */
		var offsets = this.get_zoom_offsets();

		/* get current image */
		var large_image = this.player.get_current_large_image();

		/* clear canvas */
		this.main_canvas.ctx.clearRect(
			0,
			0,
			this.main_canvas.draw_w,
			this.main_canvas.draw_h
		);

		/* draw current image */
		if( !!large_image ){
			this.main_canvas.ctx.drawImage(
				large_image,
				0,
				0,
				large_image.naturalWidth, /* this needs to be calculated by the picture, as this varies from small to large */
				large_image.naturalHeight, /* this needs to be calculated by the picture, as this varies from small to large */
				-offsets.x,
				-offsets.y,
				this.player.large.image_width,
				this.player.large.image_height
			);
		}
	};
	/**
	 *  @description This function draws a zoomed picture inside the zoom canvas.
	 *  @description This function draws a zoomed picture on a special outbox canvas and the normal picture on the main.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.outbox_zoom = function(){
		/* Task: draw the elarged image on the zoom_canvas and the small image on the main_canvas */

		/* refresh main_canvas and zoom_canvas information (in case smt changed in viewport size) */
		this.main_canvas = this.player.get_main_canvas_dimensions();
		this.zoom_canvas = this.player.get_zoom_canvas_dimensions();

		/* refresh class-variable relative_mouse */
		this.calculate_relative_mouse_position();

		/* get current offsets */
		var offsets = this.get_zoom_offsets();

		/* get current image */
		var small_image = this.player.get_current_small_image();
		var large_image = this.player.get_current_large_image();



		/* clear main_canvas and zoom_canvas */
		this.main_canvas.ctx.clearRect(
			0,
			0,
			this.main_canvas.draw_w,
			this.main_canvas.draw_h
		);
		this.zoom_canvas.ctx.clearRect(
			0,
			0,
			this.zoom_canvas.draw_w,
			this.zoom_canvas.draw_h
		);

		/* draw small_image on main_canvas */
		if( !!small_image ){
			this.main_canvas.ctx.drawImage(
				small_image,
				0,
				0
			);
		}

		/* draw large_image on zoom_canvas */
		if( !!large_image ){
			this.zoom_canvas.ctx.drawImage(
				large_image,
				0,
				0,
				large_image.naturalWidth,
				large_image.naturalHeight,
				-offsets.x,
				-offsets.y,
				this.player.large.image_width,
				this.player.large.image_height
			);
		}
	};
	/**
	 *  @description This function draws a minimap in the upper lefthand corner of the minimap canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_minimap = function(){
		/* Task: Draw the minimap on the minimap_canvas */

		/* width and height are already set globally in the HTML as inline-CSS. */

		/* refresh minimap_canvas information (in case smt changed in viewport size) */
		this.minimap_canvas = this.player.get_minimap_canvas_dimensions();

		/* get image */
		var small_image = this.player.get_current_small_image();

		/* calculate cutout dimensions */
		cutout_w = this.minimap_canvas.draw_w * (this.player.small.image_width / this.player.large.image_width);
		cutout_h = this.minimap_canvas.draw_h * (this.player.small.image_height / this.player.large.image_height);
		cutout_x = ( this.relative_mouse.x / this.main_canvas.vp_w ) * ( this.minimap_canvas.draw_w - cutout_w );
		cutout_y = ( this.relative_mouse.y / this.main_canvas.vp_h ) * ( this.minimap_canvas.draw_h - cutout_h );



		/* first clear canvas */
		this.minimap_canvas.ctx.clearRect(
			0,
			0,
			this.minimap_canvas.draw_w,
			this.minimap_canvas.draw_h
		);

		/* secondly draw image */
		if( !!small_image ){
			this.minimap_canvas.ctx.drawImage(
				small_image,
				0,
				0
			);
		}

		/* thirdly draw cutout */
		this.minimap_canvas.ctx.globalAlpha = 0.5;
			this.minimap_canvas.ctx.fillStyle = "black";
			this.minimap_canvas.ctx.beginPath();
				/* draw mask (rectangle clockwise) */
					this.minimap_canvas.ctx.moveTo(0, 0);
					this.minimap_canvas.ctx.lineTo(this.player.small.image_width, 0);
					this.minimap_canvas.ctx.lineTo(this.player.small.image_width, this.player.small.image_height);
					this.minimap_canvas.ctx.lineTo(0, this.player.small.image_height);
					this.minimap_canvas.ctx.lineTo(0, 0);
				/* "undraw" cutout (rectangle counterclockwise) */
					this.minimap_canvas.ctx.moveTo(cutout_x+0, cutout_y+0);
					this.minimap_canvas.ctx.lineTo(cutout_x+0, cutout_y+cutout_h);
					this.minimap_canvas.ctx.lineTo(cutout_x+cutout_w, cutout_y+cutout_h);
					this.minimap_canvas.ctx.lineTo(cutout_x+cutout_w, cutout_y+0);
					this.minimap_canvas.ctx.lineTo(cutout_x+0, cutout_y+0);
			this.minimap_canvas.ctx.fill();
		this.minimap_canvas.ctx.globalAlpha = 1;
	};
})(jQuery_Thrixty);