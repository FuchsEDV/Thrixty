/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version dev1.2
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

		// fed from EventHandler
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



		this.tmp_obj = {
			small: {
				image: null,
				w: 0,
				h: 0,
			},
			large: {
				image: null,
				w: 0,
				h: 0,
			},
			cursor: {
				x: 0,
				y: 0,
			},
			zoom_img_offset: {
				x: 0,
				y: 0,
			},
			marker: {
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			},
			main_canvas: {},
			minimap_canvas: {},
		}

	};
		// Diese Setter sollten weg, weil nicht DRY.
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






	/**
	 *  @description This function decides where to draw the current picture.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_current_image = function(){
		this.allgemeine_kalkulationen_in_objekt();






		if( !this.player.is_zoomed ){
			this.unzoomed();
		} else {
			if( this.player.settings.zoom_mode == "inbox" ){
					this.inbox_zoom();
			} else if( this.player.settings.zoom_mode == "outbox" ){
					// outbox zoom ist unfertig... !
					this.outbox_zoom();
			}
			if( this.player.settings.zoom_position_indicator == "minimap" ){
						this.draw_minimap();
			} else if( this.player.settings.zoom_position_indicator == "marker" ){
						this.draw_marker();
			}
		}
	};
	ThrixtyPlayer.DrawingHandler.prototype.allgemeine_kalkulationen_in_objekt = function(){
		var small_image = this.player.get_current_small_image();
		this.tmp_obj.small = {
			image: small_image,
			w: small_image.naturalWidth,
			h: small_image.naturalHeight,
		};

		var large_image = this.player.get_current_large_image();
		this.tmp_obj.large = {
			image: large_image,
			w: large_image.naturalWidth,
			h: large_image.naturalHeight,
		};



		// calculate relative mouse or finger position
		this.tmp_obj.cursor = {
			x: (this.mouse.x - this.tmp_obj.main_canvas.x),
			y: (this.mouse.y - this.tmp_obj.main_canvas.y),
		};
			// this.check_cursor_boundaries();
				// Borders - min and max values - reset, when overstepped
				if( this.tmp_obj.cursor.x < 0 ){
					this.tmp_obj.cursor.x = 0;
				}
				if( this.tmp_obj.cursor.x > this.tmp_obj.main_canvas.w ){
					this.tmp_obj.cursor.x = this.tmp_obj.main_canvas.w;
				}
				if( this.tmp_obj.cursor.y < 0 ){
					this.tmp_obj.cursor.y = 0;
				}
				if( this.tmp_obj.cursor.y > this.tmp_obj.main_canvas.h ){
					this.tmp_obj.cursor.y = this.tmp_obj.main_canvas.h;
				}



		this.tmp_obj.zoom_img_offset = {
			x: this.tmp_obj.cursor.x * ( ( this.tmp_obj.large.w - this.tmp_obj.small.w ) / this.tmp_obj.main_canvas.w ),
			y: this.tmp_obj.cursor.y * ( ( this.tmp_obj.large.h - this.tmp_obj.small.h ) / this.tmp_obj.main_canvas.h ),
		};




		var small_dimensions = this.small_dimensions;
		var large_dimensions = this.large_dimensions;
		this.tmp_obj.marker = {
			x: this.tmp_obj.zoom_img_offset.x * ( small_dimensions.w / large_dimensions.w ),
			y: this.tmp_obj.zoom_img_offset.y * ( small_dimensions.h / large_dimensions.h ),
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ),
		};
		this.tmp_obj.minimap = {
			x: 0,
			y: 0,
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ),
		};
		this.tmp_obj.minimap_marker = {
			x: this.tmp_obj.zoom_img_offset.x * ( small_dimensions.w / large_dimensions.w ) * ( small_dimensions.w / large_dimensions.w ),
			y: this.tmp_obj.zoom_img_offset.y * ( small_dimensions.h / large_dimensions.h ) * ( small_dimensions.h / large_dimensions.h ),
			w: small_dimensions.w * ( small_dimensions.w / large_dimensions.w ) * ( small_dimensions.w / large_dimensions.w ),
			h: small_dimensions.h * ( small_dimensions.h / large_dimensions.h ) * ( small_dimensions.h / large_dimensions.h ),
		};





		this.tmp_obj.main_canvas = this.player.get_main_canvas_dimensions();
		this.tmp_obj.minimap_canvas = this.player.get_minimap_canvas_dimensions();





	};
	/**
	 *  @description This function draws an unzoomed picture inside the main canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.unzoomed = function(){
		// check for loading state of image and draw it when it is ready
		// TODO: dies muss überarbeitet werden, da diese überprüfungslogik hier gar nicht hingehört
		if( this.player.small.images[this.player.small.active_image_id].elem_loaded === true ){
			this.tmp_obj.main_canvas.context.clearRect(
				0,
				0,
				this.player.DOM_obj.main_canvas[0].width,
				this.player.DOM_obj.main_canvas[0].height
			);
			this.tmp_obj.main_canvas.context.drawImage(
				this.tmp_obj.small.image,
				0,
				0
			);
		}
	};
	/**
	 *  @description This function draws a zoomed picture inside the main canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.inbox_zoom = function(){
		// draw zoomed image on main canvas
		this.tmp_obj.main_canvas.context.clearRect(
			0,
			0,
			this.player.DOM_obj.main_canvas[0].width,
			this.player.DOM_obj.main_canvas[0].height
		);
		this.tmp_obj.main_canvas.context.drawImage(
			this.tmp_obj.large.image,
			0,
			0,
			this.tmp_obj.large.image.naturalWidth,
			this.tmp_obj.large.image.naturalHeight,
			-this.tmp_obj.zoom_img_offset.x,
			-this.tmp_obj.zoom_img_offset.y,
			this.tmp_obj.large.w,
			this.tmp_obj.large.h
		);
	};
	/**
	 *  @description This function draws a black bordered rectangle to the zoomed position.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_marker = function(){
		// draw marker on fullsized minimap
		this.tmp_obj.minimap_canvas.context.clearRect(
			0,
			0,
			this.player.DOM_obj.minimap_canvas[0].width,
			this.player.DOM_obj.minimap_canvas[0].height
		);
		this.tmp_obj.minimap_canvas.context.strokeStyle = "rgb(0,0,0)"; // The color of the marker is black. Will be an Option.
		this.tmp_obj.minimap_canvas.context.strokeRect(
			this.tmp_obj.marker.x,
			this.tmp_obj.marker.y,
			this.tmp_obj.marker.w,
			this.tmp_obj.marker.h
		);
	};
	/**
	 *  @description This function draws a minimap in the upper lefthand corner of the minimap canvas.
	 */
	ThrixtyPlayer.DrawingHandler.prototype.draw_minimap = function(){
		// ACHTUNG! Diese Methode geht davon aus, dass die Minimap das gesamte Main Canvas bedeckt!
		// TODO: Überlegen, ob dieser Weg richtig ist, und evtl. anpassen.
		this.tmp_obj.minimap_canvas.context.globalAlpha = 0.5;
			this.tmp_obj.minimap_canvas.context.drawImage(
				this.tmp_obj.small.image,
				0,
				0,
				this.tmp_obj.small.image.naturalWidth,
				this.tmp_obj.small.image.naturalHeight,
				this.tmp_obj.minimap.x,
				this.tmp_obj.minimap.y,
				this.tmp_obj.minimap.w,
				this.tmp_obj.minimap.h
			);
			this.tmp_obj.minimap_canvas.context.fillStyle = "black";
			this.tmp_obj.minimap_canvas.context.beginPath();
			this.tmp_obj.minimap_canvas.context.rect(
				0,
				0,
				this.tmp_obj.minimap.w,
				this.tmp_obj.minimap.h
			);
			this.tmp_obj.minimap_canvas.context.rect(
				this.tmp_obj.minimap_marker.x + this.tmp_obj.minimap_marker.w,
				this.tmp_obj.minimap_marker.y,
				-this.tmp_obj.minimap_marker.w,
				this.tmp_obj.minimap_marker.h
			);
			this.tmp_obj.minimap_canvas.context.fill();
		this.tmp_obj.minimap_canvas.context.globalAlpha = 1;
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

		// clear canvas
		main_canvas.context.clearRect(0, 0, this.player.DOM_obj.main_canvas[0].width, this.player.DOM_obj.main_canvas[0].height);

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










})(jQuery_2_1_3);