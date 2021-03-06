/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */


(function(){
	ui.init();
	var minMax = $(".layer:eq(1)").removeClass("minimized").find(".minimize").addClass("open");
	minMax.find(".toggle-word").text("Minimize");
	$('.colorPreview').jPicker({ window: { expandable: true } });
	
	//Code Mirror 
	
	window.editor = CodeMirror.fromTextArea(document.getElementById("output"), {
			mode: 'css',
			lineWrapping: true,
			theme: 'night'
		});
		
	$('#output, .CodeMirror-scroll').height($('footer').height() - 40);
})();



