/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 var ui = {
 	bind: function(){
 		window.onresize = this.setHeight;
 		$('#output-header .options input[type="checkbox"]').bind('change click', function(){
 			ui.prefixChange();
 			ui.render();
 		});
 		$('.layersWrapper').sortable({
 			axis: 'y',
 			handle: '.sortHandle'
 		});
 		return this;
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
		return this;
	},
	setHeights: function(){
		$('aside, #pattern').height(innerHeight - 60 - $('footer').height());
		return this;
	},
	controlButtons: function() {
		$(".minimize").live('click', function(click){
			click.preventDefault();
			$(this).parents('.layer').toggleClass('minimized');
		});
		$(".remove").live('click', function(click){
			click.preventDefault();
			thisLayer = $(this).parents('.layer')
		 	thisLayerIndex = parseInt(thisLayer.attr('data-layer-index'),10);
		 	patternz.removeLayer(thisLayerIndex);
			thisLayer.fadeOut(700, function(){
				$(this).remove();
			});
		});
		$('.addLayer').bind('click', function(){
			patternz.addLayer(0, 100, 100, 'New Layer');
			ui.layers.add(patternz.layers.length); //TODO remove +1
		});
		return this;
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
		return this;
	},
	layers: {
		add: function(layerIndex){
			$('aside .layersWrapper').append(
				$('#layerTemplate')
					.clone()
					.attr('data-layer-index', layerIndex)
					.attr('id','')
					.show()
				);
		},
		read: function() {
			for(var i=0; i<patternz.layers.length; i++){
				if($('aside .layer[data-layer-index="' + i + '"]').length == 0){
					ui.layers.add(i);
				}
				var domLayer = $('aside .layer[data-layer-index="' + i + '"]'),
					apiLayer = patternz.layers[i];
				domLayer.find('.layerOutput').css('background', patternz.outputLayerCode(i));
				domLayer.find('.layerOptions-width').val(apiLayer.width);
				domLayer.find('.layerOptions-height').val(apiLayer.height);
				domLayer.find('.layerOptions-angle').val(apiLayer.angle);
				domLayer.find('.layerName').text(apiLayer.name);
				domLayer.find('.preview').width(apiLayer.width).height(apiLayer.height);
				ui.strips.make(i);
			}
		},
		bind: function(){
					// Layer Options input bindings
			$('.layerOptions-width').live('change click scroll keyup',function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').width($(this).val());
				patternz.layers[parseInt($(this).parents(".layer").attr('data-layer-index'))].width = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-height').live('change click scroll keyup',function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').height($(this).val());
				patternz.layers[parseInt($(this).parents(".layer").attr('data-layer-index'))].height = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-angle').live('change click scroll keyup',function(){
				patternz.layers[parseInt($(this).parents(".layer").attr('data-layer-index'))].angle = parseInt($(this).val());
				ui.render();
				//ui.layers.read();
			});
		},
		write: function(){
			
		},
		init: function(){
			ui.layers.read();
			ui.layers.bind();
		}
	},
	strips: {
		make: function(layerIndex){
			var view = $('.layer[data-layer-index="' + layerIndex + '"] .inspectrum .view');
			for(var i=0; i<patternz.layers[layerIndex].strips.length; i++){
				view.append(
					$('<div/>')
						.addClass('strip')
						.width(patternz.layers[layerIndex].strips[i].end - patternz.layers[layerIndex].strips[i].start)
						.css({
							'background': patternz.layers[layerIndex].strips[i].color,
							'left' : patternz.layers[layerIndex].strips[i].start
						})
				);
			}
		}
	},
	init: function(){
		this.bind();
		this.render();
		this.setHeights();
		this.controlButtons();
		this.layers.init();
		this.footerHeight();
	}
};

(function(){
	ui.init();
})();



