/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 var ui = {
 	elems:{
 		
 	},
 	bind: function(){
 		onresize = this.setHeight;
 	},
	render: function(){
		if($('#render').length == 0){
			$('head').append($('<style>').text('#pattern{'+ patternz.generate() + '}').attr('type','text/css').attr('id', 'render'));
		}
		else{
			$('#render').text('#pattern{ background: ' + patternz.generate() + '}');
		}
	},
	setHeights: function(){
		$('aside, #pattern').height(innerHeight - 60 - $('footer').height());
	},
	init: function(){
		this.bind();
		this.render();
	}
};
 
ui.init();

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
	
 	ui.setHeights();
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
			ui.setHeights();
	    }
		$(window).bind('mouseup', function(){
			$(window).unbind('mousemove');
		})
	})
});


//Layers
	// layers loading
	
	/*
	 * How I will create new layers:
	 * 
	 * We will have a hidden layer div that have default values on it
	 * then we will clone it as a new layer.  
	 * $('#defauleLayer').clone().show();
	 * 
	 * to load all layers from API we will first create all neccessery layer divs:
	 * 
	 * for(var i=0; i<patternz.layers.length; i++){
	 * $('aside').append($('#defauleLayer').clone().show());
	 * }
	 * 
	 * and then load them with API data:
	 * 
	 */
	
	//temp layer binding
	function bindLayersToAPI(){
		for(var i=0; i<patternz.layers.length; i++){
			var domLayer = $($('.layer')[i]),
				apiLayer = patternz.layers[i];
			domLayer.find('.layerOutput').css('background', patternz.outputLayerCode(i));
			domLayer.find('.layerOptions-width').val(apiLayer.width);
			domLayer.find('.layerOptions-height').val(apiLayer.height);
			domLayer.find('.layerOptions-angle').val(apiLayer.angle);
			domLayer.find('.layerName').text(apiLayer.name);
			domLayer.find('.preview').width(apiLayer.width).height(apiLayer.height);
			domLayer.attr('data-li', i);
		}
	}

	bindLayersToAPI();
// Layer Options input bindings  WORST CODE I WROTE EVER
$('.layerOptions-width').change(function(){
	$(this).parent().parent().parent().parent().find('.preview').width($(this).val()); // should fix with jQuery .closest() I don't know why is not working here
	patternz.layers[parseInt($(this).parent().parent().parent().parent().attr('data-layer-index'))].width = parseInt($(this).val());
	bindLayersToAPI();
});



