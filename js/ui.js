/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 
//setHeights
function setHeights(){
	$('aside, #pattern').height(innerHeight - 60 - $('footer').height());
}

// generate code
function generateCode(){
	$("#generate").click(function(){
		var pattern = $("#pattern").attr("style");
		$("#output").empty().html(pattern);	
	});
}

// save preset
function savePreset(){
	$("#save").click(function(){
		var preset = prompt("Choose a name for this preset.");
	});
}

// document load
 $(document).ready(function(){
	
 	setHeights();
 	generateCode();
	savePreset();

 });
 
// footer resizable
$('footer .resize.handle').bind('mousedown', function(mde){
	var currentHeight = $('footer').height();
	$(window).bind('mousemove', function(mme){
		if(mme.pageY < innerHeight - 100 && mme.pageY > 150){
			$('footer').height(currentHeight + mde.pageY - mme.pageY);
			$('#output').height($('footer').height() - 40);
			setHeights();
	    }
		$(window).bind('mouseup', function(){
			$(window).unbind('mousemove');
		})
	})
});


window.onresize = function  () {
  setHeights();
}

//Layers

	//temp layer binding
	for(var i=0; i<patternz.layers.length; i++){
		var domLayer = $($('.layer')[i]),
			apiLayer = patternz.layers[i];
		domLayer.find('.layerOutput').css('background', patternz.outputLayerCode(i));
		domLayer.find('.layerOptions-width').val(apiLayer.width);
		domLayer.find('.layerOptions-height').val(apiLayer.height);
		domLayer.find('.layerOptions-angle').val(apiLayer.angle);
	}
	// layers loading
