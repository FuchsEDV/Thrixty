/** Prozedur/Routine zum Laden von Thrixty */
;"use strict";



// einschließen der variablen
(function(){
	// prozedurvariablen
	var scripts = document.getElementsByTagName('script');
	var last_inserted_file = scripts[scripts.length - 1];
console.log(last_inserted_file);
	// define mainpath
	var parts = last_inserted_file.src.split("/");
	parts.pop(); /* remove "[filename].[ext]" */
	var mainpath = parts.join("/")+"/";
console.log(mainpath);




	// load files
	var includes_count = 6;
	var loaded_count = 0;
	// was passiert beim load event?
	var file_loaded_event = function(){
		loaded_count += 1;
		if( loaded_count == includes_count ){
			// ALL FILES SUCCESSFULLY LOADED
			console.log("loaded");
		}
	};
	load_script(mainpath+"core/scripts/jquery-2.1.3.js", file_loaded_event);
	load_script(mainpath+"core/scripts/thrixty_init_class.js", file_loaded_event);
	load_script(mainpath+"core/scripts/thrixty_main_class.js", file_loaded_event);
	load_script(mainpath+"core/scripts/thrixty_eventhandler_class.js", file_loaded_event);
	load_script(mainpath+"core/scripts/thrixty_drawinghandler_class.js", file_loaded_event);
	load_stylesheet(mainpath+"core/style/thrixty_styles.css", file_loaded_event);





	// functions
	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	};
	function load_script(url, load_callback){
		var script_file = document.createElement('script');
		script_file.type = "text/javascript";
		script_file.src = url;
		script_file.onload = load_callback;

		insertAfter(script_file, last_inserted_file);
		last_inserted_file = script_file;
	};
	function load_stylesheet(url, load_callback){
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.type = "text/css";
		stylesheet.href = url;
		stylesheet.onload = load_callback;

		insertAfter(stylesheet, last_inserted_file);
		last_inserted_file = stylesheet;

	};
})()
