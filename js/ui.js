/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 var ui = {
 	bind: function(){
 		onresize = this.setHeight;
 		$('#output-header .options input[type="checkbox"]').bind('chnage click', function(){
 			ui.prefixChange();
 			ui.render();
 		});
 	},
 	prefixChange: function(){
 		patternz.prefixes.webkit = $('#prefixCheckbox-webkit')[0].checked;
 		patternz.prefixes.moz = $('#prefixCheckbox-moz')[0].checked;
 		patternz.prefixes.ms = $('#prefixCheckbox-ms')[0].checked;
 		patternz.prefixes.o = $('#prefixCheckbox-o')[0].checked;
 		patternz.prefixes.w3c = $('#prefixCheckbox-w3c')[0].checked;
 		return patternz.prefixes;
 	},
	render: function(){
		$('#render').text('#pattern{'+ patternz.generate() + '}').attr('type','text/css');
		$('#output').val( patternz.generate() );
	},
	setHeights: function(){
		$('aside, #pattern').height(innerHeight - 60 - $('footer').height());
	},
	controlButtons: function() {
		$(".minimize").click(function(){
			$(this).parent().siblings(".maniptool").toggle("fast");
		});
		$(".remove").click(function(){
			$(this).parents(".layer").fadeOut(700, function(){
				$(this).remove();
			});
		});
		$(".moveUp").click(function(){
			thisLayer = $(this).parents(".layer")
			thisLayer.insertBefore(thisLayer.prev(".layer"));
		});
		$(".moveDown").click(function(){
			thisLayer = $(this).parents(".layer")
			thisLayer.insertAfter(thisLayer.next(".layer"));
		});
	},
	footerHeight: function(){
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
	},
	setLayersValues: function (){
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
	},
	init: function(){
		this.bind();
		this.render();
		this.setHeights();
		this.controlButtons();
		this.footerHeight();
		this.setLayersValues();
	}
};

(function(){
	ui.init();
})();

 


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
	

// Layer Options input bindings  WORST CODE I WROTE EVER
$('.layerOptions-width').bind('change click scroll keyup',function(){
	$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').width($(this).val());
	patternz.layers[parseInt($(this).parents(".layer").attr('data-layer-index'))].width = parseInt($(this).val());
	bindLayersToAPI();
});
$('.layerOptions-height').bind('change click scroll keyup',function(){
	$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').height($(this).val());
	patternz.layers[parseInt($(this).parents(".layer").attr('data-layer-index'))].height = parseInt($(this).val());
	bindLayersToAPI();
});



