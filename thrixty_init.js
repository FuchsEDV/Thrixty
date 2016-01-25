/**
 *  @fileOverview
 *  @author F.Heitmann @ Fuchs EDV Germany
 *  @version 1.6
 *  @license GPLv3
 *  @module ThrixtyPlayer.MainClass
 */
;"use strict";

/* 1.: define ThrixtyPlayer Namespace */
/**
 *  @description ThrixtyPlayer Application
 *  @name ThrixtyPlayer
 *
 *  @namespace ThrixtyPlayer The Thrixty Player is a 360 degree Product Presentation designed in HTML 5.
 *  @property {array} initialized_players Container for all Players initialized.
 */
var ThrixtyPlayer = {
	version: "1.6",
	mainpath: "",
	initialized_players: [],
	logs: {
		main_log: [],
		player_logs: {
			/*
			1: [],
			2: [],
			...
			*/
		},
	},
	is_mobile: (function(){
		var mobile_user_agents = {
			Android: !!navigator.userAgent.match(/Android/i),
			BlackBerry: !!navigator.userAgent.match(/BlackBerry/i),
			iOS: !!navigator.userAgent.match(/iPhone|iPad|iPod/i),
			iPad: !!navigator.userAgent.match(/iPad/i),
			Opera: !!navigator.userAgent.match(/Opera Mini/i),
			Windows: !!navigator.userAgent.match(/IEMobile/i)
		};
		return ( mobile_user_agents.Android || mobile_user_agents.BlackBerry || mobile_user_agents.iOS || mobile_user_agents.Opera || mobile_user_agents.Windows );
	})(),
	log: function(msg, id){
		/* console.log(msg); */
		if( typeof(id) != "number" ){
			/* main log */
			ThrixtyPlayer.logs.main_log.push(msg);

		} else {
			/* player log */
			if( typeof(ThrixtyPlayer.logs.player_logs[id]) == "undefined" ){
				ThrixtyPlayer.logs.player_logs[id] = [msg];
			} else {
				ThrixtyPlayer.logs.player_logs[id].push(msg);
			}
		};
	},
	export_logs: function(){
		return JSON.stringify(ThrixtyPlayer.logs);
	}




};






/* TODO: überlegen, ob man nur bei finden von player instanzen auch die dateien einbinden muss */







/* example code for debug information export */
/**
	var a = {
		abc: ["a","b","c"]
	}
	console.log(a);
	var b = JSON.stringify(a);
	console.log(b);
	var c = JSON.parse(b);
	console.log(c);
*/





(function(){


	/* fill mainpath property */
	/* TODO: instead of treating this file to be the last one loaded at runtime, actually search for it. */
	var scripts = document.getElementsByTagName('script');
	var last_inserted_file = scripts[scripts.length - 1];
	var parts = last_inserted_file.src.split("/");
	parts.pop(); /* remove "[filename].[ext]" */
	ThrixtyPlayer.mainpath = parts.join("/")+"/";
	ThrixtyPlayer.log("Script Mainpath |"+ThrixtyPlayer.mainpath+"|");



	/* include jquery dependecy */
	var jquery_path = ThrixtyPlayer.mainpath+"core/scripts/jquery-2.1.4.js";
	load_script_file( jquery_path, include_files );


	/* include the rest of the files */
	function include_files(){
		jQuery_Thrixty = jQuery.noConflict(true);
		/* storage array for file paths */
		var includes = [
			{
				typ: "js",
				path: ThrixtyPlayer.mainpath+"core/scripts/thrixty_main_class.js"
			},
			{
				typ: "js",
				path: ThrixtyPlayer.mainpath+"core/scripts/thrixty_eventhandler_class.js"
			},
			{
				typ: "js",
				path: ThrixtyPlayer.mainpath+"core/scripts/thrixty_drawinghandler_class.js"
			},
			{
				typ: "css",
				path: ThrixtyPlayer.mainpath+"core/style/thrixty_styles.css"
			}
		];



		/* on load function for starting the init after file load */
		var onload = function(){
			loaded_count += 1;
			if( loaded_count == includes_count ){
				/* append player init to document ready after all includes were loaded */
				jQuery_Thrixty(document).ready(
					init_ThrixtyPlayer
				);
			}
		};

		/* vars for counting loaded files */
		var includes_count = includes.length;
		var loaded_count = 0;
		var current_include = {};

		/* loop through the include array to load the files */
		for( var i=0; i<includes_count; i++ ){
			current_include = includes[i];
			switch( current_include.typ ){
				case "js":
					load_script_file(current_include.path, onload);
				break;
				case "css":
					load_stylesheet(current_include.path, onload);
				break;
			}
		}
	};


	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	};
	function load_script_file(url, load_callback){
		/* create and configure new element */
		var script_file = document.createElement('script');
		script_file.type = "text/javascript";
		script_file.src = url;
		script_file.onload = load_callback;
		script_file.onerror = function(event){
			ThrixtyPlayer.log("JS File not found! |"+event.target.src+"|");
		};

		/* append new element to document */
		insertAfter(script_file, last_inserted_file);
		last_inserted_file = script_file;
		ThrixtyPlayer.log("Added JS File   |"+url+"|");
	};


	function load_stylesheet(url, load_callback){
		/* create and configure new element */
		var stylesheet = document.createElement("link");
		stylesheet.type = "text/css";
		stylesheet.rel = "stylesheet";
		stylesheet.href = url;
		stylesheet.onload = load_callback;
		stylesheet.onerror = function(event){
			ThrixtyPlayer.log("CSS File not found! |"+event.target.href+"|");
		};

		/* append new element to document */
		insertAfter(stylesheet, last_inserted_file);
		last_inserted_file = stylesheet;
		ThrixtyPlayer.log("Added CSS File  |"+url+"|");
	};



	function init_ThrixtyPlayer(){
		/* initialize players */
		ThrixtyPlayer.initialized_players = (function(){
			/* start with selecting all boxes */
			var selector = jQuery_Thrixty("div.thrixty-player");

			/* first validate the selector */
			/* check for being an object AND not being a plain js obj */
			if( (typeof selector == "object") && (!jQuery_Thrixty.isPlainObject(selector)) ){
				/* valid Selector */
				/* continue */
			} else {
				/* INVALID Selector */
				throw new Error("no proper box found", 0, 0);
			}

			/* init a player for all boxes */
			var all_players = [];
			selector.each(function(index, element){
				/* new ThrixtyPlayer */
				var new_player = new ThrixtyPlayer.MainClass(index, jQuery_Thrixty(element));
				/* Trigger new processes for each initialize, so a single error will not stop the whole init */
				setTimeout(function(){
					new_player.setup();
				}, 10);

				all_players.push(new_player);
			});
			return all_players;
		})();
		console.log(ThrixtyPlayer);
	};


})();





/*



function destroy_dom(){
ThrixtyPlayer.initialized_players[0].DOM_obj.main_box.children().remove();
}

function destroy_ref(){
ThrixtyPlayer.initialized_players[0] = {};
}

destroy_dom();
destroy_ref();
init();



var abc = ThrixtyPlayer.initialized_players[0];
abc.load_one_image(abc.large.images[0], abc.DOM_obj.image_cache_large);
abc.load_all_images(abc.small, abc.DOM_obj.image_cache_small);
abc.load_all_images(abc.large, abc.DOM_obj.image_cache_large);





*/

