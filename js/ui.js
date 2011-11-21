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
 			handle: '.sortHandle',
			stop: function(event, ui){ 
				var layerOrder = []
				dataLayerIndex = $(".layer").not(".ui-sortable-placeholder, #layerTemplate").each(function(index){
					layerOrder.push($(this).data('layerIndex'));
				});
				//console.log(layerOrder);
				return layerOrder;
			}
 		});
 		$('.view').live('click', function(e){
			//Show strip editor toolbox
 			$(this).parents('.layer').find('.stripEditor').toggle();
			
			//trigger click on first strip
			$(this).parents('.layer').find('.pointers .pointer:data(stripIndex=0)').click();
 		});
		$('.pointer').live('click', function(){
			var currentLayer = $(this).parents('.layer'),
				currentStrip = patternz.layers[$(this).data().layerIndex].strips[$(this).data().stripIndex],
 			    currentStripHexColor = patternz.renderColor.hexgen(currentStrip.color);
 			currentLayer.find('.colorbox input, .jPicker .Icon span.Color').css('background', currentStripHexColor);
 			currentLayer.find('.colorbox input').val(currentStripHexColor);
 			currentLayer.find('.startend .start').val(currentStrip.start);
 			currentLayer.find('.startend .end').val(currentStrip.end);
 			currentLayer.find('input.opacity').val(currentStrip.color[3]*100);
 			currentLayer.find('output').val(currentStrip.color[3]*100);
 			currentLayer.find('.stripEditor').data($(this).data());
 			//TODO bind input changes to currentStrip == write changes
		});
 		$('input.opacity').live('click change', function(){
 			var currentStrip = patternz.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
 			currentStrip.color[3] = $(this).val()/100;
 			$(this).next().val($(this).val());
 			ui.layers.read();
 			ui.render();
 		});
 		$('input.start').live('click change', function(){
 			var currentStrip = patternz.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
 			currentStrip.start = $(this).val();
 			ui.layers.read();
 			ui.render();
 		});
		$('.layerName').live('blur change', function(){
			var layer = $(this).parents('.layer').data();
			patternz.layers[layer.layerIndex].name = $(this).val();
		});
 	    $('input.end').live('click change', function(){
 			var currentStrip = patternz.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
 			currentStrip.end = $(this).val();
 			ui.layers.read();
 			ui.render();
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
		$('aside, #pattern').height(innerHeight - 50 - $('footer').height());
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
		 	thisLayerIndex = thisLayer.data().layerIndex;
		 	if(patternz.layers.length != 1){
			 	patternz.removeLayer(thisLayerIndex);
				thisLayer.fadeOut(300, function(){
					$(this).remove();
					ui.render();
					ui.layers.init();
				});
		    }
		});
		$(".duplicate").live("click", function(click){
			click.preventDefault();
			thisLayer = $(this).parents(".layer")
			thisLayerIndex = thisLayer.data().layerIndex;
			thisLayer.clone().insertAfter(thisLayer);
			ui.render();
			ui.layers.init();
		});
		$('.addLayer').bind('click', function(){
			patternz.addLayer(0, 100, 100, 'New Layer');
			//ui.layers.add(patternz.layers.length); 
			ui.layers.init();
			ui.render();
		});
		return this;
	},
	toolTips: function() {

		//Tooltips
		var tip;
		$(".tip-trigger").hover(function(e){

			//Caching the tooltip and removing it from container; then appending it to the body
			tip = $(this).find('.tip').remove();
			$('body').append(tip);
			
			var triggerWidth = $(this).width();
			var tipWidth = tip.width(); //Find width of tooltip
			var tipHeight = tip.height(); //Find height of tooltip

			//Distance of element from the right edge of viewport
			var tipOffset = $(this).offset();
			var posX = tipOffset.left - (triggerWidth / 2);
			var posY = tipOffset.top - 32;

			tip.css({  top: posY, left: posX });

			tip.show(); //Show tooltip

		}, function() {

			tip.hide().remove(); //Hide and remove tooltip appended to the body
			$(this).append(tip); //Return the tooltip to its original position

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
		return this;
	},
	layers: {
		add: function(layerIndex){			
			$('aside .layersWrapper').append(
				$('#layerTemplate')
					.clone()
					.data('layerIndex', layerIndex)
					.attr('id','')
					.show()
				);				
		},
		read: function() {
			for(var i=0; i<patternz.layers.length; i++){
				if($('aside .layer:data(layerIndex=' + i + ')').length == 0){
					ui.layers.add(i);
				}
				var domLayer = $('aside .layer:data(layerIndex=' + i + ')'),
					apiLayer = patternz.layers[i];
				domLayer.find('.layerOutput').css('background', patternz.outputLayerCode(i));
				domLayer.find('.layerOptions-width').val(apiLayer.width);
				domLayer.find('.layerOptions-height').val(apiLayer.height);
				domLayer.find('.layerOptions-angle').val(apiLayer.angle);
				domLayer.find('.layerName').val(apiLayer.name);
				domLayer.find('.preview').width(apiLayer.width).height(apiLayer.height);
				ui.strips.make(i);
			}
		},
		bind: function(){
					// Layer Options input bindings
			$('.layerOptions-width').live('change click scroll keyup',function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').width($(this).val());
				patternz.layers[$(this).data().layerIndex].width = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-height').live('change click scroll keyup',function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').height($(this).val());
				patternz.layers[$(this).data().layerIndex].height = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-angle').live('change click scroll keyup',function(){
				patternz.layers[$(this).data().layerIndex].angle = parseInt($(this).val());
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
			//Find view and pointers in DOM based on given Layer Index
			var view = $('.layer:data(layerIndex=' + layerIndex + ') .inspectrum .view'),
				pointers = $('.layer:data(layerIndex=' + layerIndex + ') .stripEditor .pointers'),
				templatePointer = pointers.find('.template'),
				strip,
				viewStrip,
				pointer;
			for(var i=0; i<patternz.layers[layerIndex].strips.length; i++){
				
				//Point to api strip
				strip = patternz.layers[layerIndex].strips[i];
				
				//Make a pointer
				pointer = templatePointer
							.clone()
							.removeClass('template hidden')
							.css('left', strip.start + ( (strip.end - strip.start) / 2 ) - 5) // calculate center of the strip -5 is half of pointer width
							.data({layerIndex: layerIndex, stripIndex: i, strip: strip});
				pointer.find('.abstract').css('background', patternz.renderColor.hexgen(strip.color));
				//Make an strip to put in .view
				viewStrip = $('<div/>')
							.addClass('strip')
							.width(strip.end - strip.start)
							.css({
								'background': patternz.renderColor.rgbagen(strip.color),
								'left' : strip.start
							})
							.data('layerIndex', layerIndex)
							.data('stripIndex', i);
				
				//Append pointer and view strip
				view.append(viewStrip);
				pointers.append(pointer);
			}
		}
	},
	init: function(){
		this.bind();
		this.render();
		this.setHeights();
		this.controlButtons();
		this.layers.init();
		this.toolTips();
		this.footerHeight();
	}
};

(function(){
	ui.init();
	$(".layer:eq(1)").removeClass("minimized");
	$('.colorPreview').jPicker({ window: { expandable: true } });
})();



