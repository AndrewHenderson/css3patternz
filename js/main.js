/*
main.js
*/
//Plugins
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
// Array reorder - By Mohsen
Array.prototype.reorder = function (a){
	  var o = [], _ = this, i = 0;
	  _.forEach(function(){
		o.push(_[a[i]] ? _[a[i]] : _[i]);
		i++;
	  });
	  return o;
	};

//API
var api = {
	layers : [],
	activeLayerIndex : 0,
	activeLayer : null,
	output : '',
	prefixes: {webkit: true, moz: true, ms: true, o: true, w3c: true},
	renderColor: {
		hexgen: function(colorArray){return"#"+((256+colorArray[0]<<8|colorArray[1])<<8|colorArray[2]).toString(16).slice(1)},
		rgbagen: function(colorArray){
			return 'rgba('+colorArray.join(',')+')';
		}
	},
	addLayer : function(degree, width, height, name){
		var layer = {
				width: width || 100,
				height: height || 100,
				background: 'transparent',
				angle: degree || 0,
				name: name || 'Layer ' + this.layers.length,
				strips: []
		    };
		this.layers.push(layer);
		this.changeActiveLayer(this.activeLayerIndex++);
	},
	removeLayer : function(layerIndex){
		this.layers.remove(layerIndex);
	},
	shiftLayer: function (index) {
	  if(index == 'up'){
	  	var temp = this.layers[activeLayerIndex+1]
	  	this.layers[activeLayerIndex+1] = this.activeLayer;
	  	this.activeLayer = temp;
	  	this.activeLayerIndex++;//TODO
	  }
	},
	changeActiveLayer : function (layerIndex) {
	  this.activeLayer = this.layers[layerIndex];
	},
	addStrip: function(stripColor, startPoint, width){
		var strip = {};
		strip.color = stripColor || [0,0,0,1];
		strip.start = startPoint || 0;
		strip.width = width || 10;
		this.activeLayer.strips.push(strip);
	},
	removeStrip: function(stripIndex){
	
	},
	sortStrips : function(layerIndex){
		api.layers[layerIndex].strips.sort(function(a,b){
			return Math.min(a.start, b.start);
		});
		return this;
	},
	generateLayerCode: function(layerIndex){
		var li = layerIndex || 0, // layer index
			layer = this.layers[li],
			startStr = "linear-gradient(",
			strip,
			result;
		this.sortStrips(layerIndex);
		result = startStr + layer.angle + 'deg';
		for(var i = 0; i< layer.strips.length; i++){
			strip = layer.strips[i]; // select the strip to generate code for
			result = result
			    + ' , '
			    + this.renderColor.rgbagen(layer.background) + ' '
			    + strip.start + 'px, '
			    + this.renderColor.rgbagen(strip.color) + ' '
				+ strip.start + 'px, '
				+ this.renderColor.rgbagen(strip.color) + ' '
				+ (strip.start + strip.width) + 'px, '
				+ this.renderColor.rgbagen(layer.background) + ' '
				+ (this.layers[li].strips[i].start + this.layers[li].strips[i].width) + 'px';
		}
		return result += ')';
	},
	generate : function(){
		this.init();
		var layersCode = [],
			result = [],
			bgSize = [],
			prefixesArray = ['webkit', 'moz', 'ms', 'o', 'w3c'];
		//for every layer 
		for(var i=0; i<this.layers.length; i++){
			if(this.layers[i].strips.length > 0){
				layersCode.push(this.generateLayerCode(i));
			}
		}
		//add prefixes
		prefixesArray.forEach( function(prefix){
			var layer = [];
			if(api.prefixes[prefix]){
				for(var i=0; i<layersCode.length; i++){
					if(prefix != 'w3c') { layer.push('-' + prefix + '-' + layersCode[i]);}
					else{ layer.push(layersCode[i]);}
					
				}
				layer.join(', ');
				result.push('background-image:\n ' + layer );	
			}
		});
		result = result.join(';\n \n');
		
		for(var i=0; i<this.layers.length; i++){
			bgSize.push(this.layers[i].width + 'px ' + this.layers[i].height + 'px ')
		}
		bgSize = ';\n\nbackground-size:' + bgSize.join() + ';\n';
		return result + bgSize;
	},
	outputLayerCode: function(layerIndex){
		var rawCode = this.generateLayerCode(layerIndex);
		if(true){ // browser is webkit TODO
			return  '-webkit-' + rawCode;
		}
	},
	load: function(pattern){
		this.layers = pattern;
	},
	init : function () {
	  if(this.layers.length == 0) { this.addLayer();}
	  this.changeActiveLayer(0);
	},
	clean : function(){
		this.layers = [];
		this.init();
	}
};


var defaultPattern = [{
	type: 'linear',
	angle: -90,
	background: [1,1,1,0],
	height: 50,
	width: 50,
	name: "Sample Layer 0",
	strips:[
		{
			color: [115,40,250,0.9],
			start: 19,
			width: 6
		},
		{
			color: [115,40,100,0.9],
			start: 10,
			width: 5
		}
		]},
		{
	type: 'linear',
	angle: 0,
	background: [1,1,1,0],
	height: 50,
	width: 50,
	name: "Sample Layer 1",
	strips:[{
			color: [110,75,255,0.8],
			start: 24,
			width:1
		}]
	},
	{
	type: 'linear',
	angle: 45,
	background: [1,1,1,0],
	height: 100,
	width: 100,
	name: "Sample Layer 2",
	strips:[
		{
			color: [115,0,0,0.5],
			start: 45,
			width: 50
		}
		]},
	{
	type: 'linear',
	angle: -45,
	background: [1,1,1,0],
	height: 100,
	width: 100,
	name: "Sample Layer 3",
	strips:[
		{
			color: [115,0,0,0.5],
			start: 45,
			width: 50
		}
		]}];
	
// api loading
api.load(defaultPattern); 



 var ui = {
 	bind: function(){
 		window.onresize = this.setLayout;
 		$('#output-header .options input[type="checkbox"]').bind('change click', function(){
 			ui.prefixChange();
 			ui.render();
 		});
 		$('.layersWrapper').sortable({
 			axis: 'y',
 			handle: '.sortHandle',
			stop: function(event){ 
				var layerOrder = []
				dataLayerIndex = $(".layer").not(".ui-sortable-placeholder, #layerTemplate").each(function(index){
					layerOrder.push($(this).data('layerIndex'));
				});
				api.layers = api.layers.reorder(layerOrder);
				ui.render();
			}
 		});
		$("#save").click(function(){
			$( "#dialog-form" ).dialog({
				height: 200,
				width: 350,
				modal: true,
				buttons: {
					"Save": function() {
						console.log('Saved!');
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					// allFields.val( "" ).removeClass( "ui-state-error" );
				}
			});
		});
		/*
		//we don't need it anymore
 		$('.inspectrum').live('click', function(e){
			//Show strip editor toolbox
 			$(this).parents('.layer').find('.inspectrumEditor').slideToggle(100);
			//trigger click on first strip
			$(this).parents('.layer').find('.pointers .pointer:data(stripIndex=0)').trigger('mousedown');
 		});
		*/
 		$('input.opacity').live('click change', function(){
			var currentStrip = api.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
 			currentStrip.color[3] = $(this).val()/100;
 			$(this).next().val($(this).val());
 			ui.layers.read();
 			ui.render();
 		});
 		$('input.start').live('click change', function(){
 			var currentStrip = api.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
 			currentStrip.start = $(this).val();
 			ui.layers.read();
 			ui.render();
 		});
		$('.layerName').live('blur change', function(){
			var layer = $(this).parents('.layer').data();
			api.layers[layer.layerIndex].name = $(this).val();
		});
 	    $('input.width').live('click change', function(){
 			var currentStrip = api.layers[$(this).parents('.stripEditor').data().layerIndex].strips[$(this).parents('.stripEditor').data().stripIndex];
			currentStrip.width = parseInt($(this).val()); // Convert to number
 			ui.layers.read();
 			ui.render();
 		});
 		$('.pointer').live('mousedown',function(mde){ //TODO buggy
			var currentLayer = $(this).parents('.layer'),
					currentStrip = api.layers[$(this).data().layerIndex].strips[$(this).data().stripIndex],
					currentStripHexColor = api.renderColor.hexgen(currentStrip.color);
				currentLayer.find('.colorbox input, .jPicker .Icon span.Color').css('background', currentStripHexColor);
				currentLayer.find('.colorbox input').val(currentStripHexColor);
				currentLayer.find('.startend .start').val(currentStrip.start);
				currentLayer.find('.startend .width').val(currentStrip.width);
				currentLayer.find('input.opacity').val(currentStrip.color[3]*100);
				currentLayer.find('output').val(currentStrip.color[3]*100);
				currentLayer.find('.stripEditor').data($(this).data());
				currentLayer.find('.manipulate-overlay').hide();
			
 			mdss = currentStrip.start, // mouse down strip start
 			mdse = currentStrip.width; // mouse down strip end
 			$(window.document).bind('mousemove', function(mme){
 				var dist = mme.pageX - mde.pageX; // distance moved 
 	
 				currentStrip.start = mdss + dist;
 				currentStrip.width = mdse;
				ui.render();
 				$(window.document).bind('mouseup', function(){
 					$(this).unbind('mousemove');
 				});
 			});
 		});
		$('.CodeMirror').live('keydown, keyup', ui.readFromEditor);
 		return this;
 	},
 	prefixChange: function(){
 		api.prefixes.webkit = $('#prefixCheckbox-webkit')[0].checked;
 		api.prefixes.moz = $('#prefixCheckbox-moz')[0].checked;
 		api.prefixes.ms = $('#prefixCheckbox-ms')[0].checked;
 		api.prefixes.o = $('#prefixCheckbox-o')[0].checked;
 		api.prefixes.w3c = $('#prefixCheckbox-w3c')[0].checked;
		ui.readFromEditor();
 		return api.prefixes;
 	},
	readFromEditor: function(){
			$('#render').text('#pattern{'+ editor.getValue() + '}').attr('type','text/css');
	},
	render: function(){
		$('#render').text('#pattern{'+ api.generate() + '}').attr('type','text/css');
		$('#output').val( api.generate() );
		ui.strips.readAll();
		ui.layers.readAll();
		if(window.editor) window.editor.setValue( $('#output').val() );
		return this;
	},
	setLayout: function(){
		winHeight = $(window).height();
		winWidth = $(window).width();
		asideWidth = $('aside').width();
		headerHeight = $('header').height();
		$('aside, #pattern').height(winHeight - headerHeight);
		$('footer').width(winWidth - asideWidth).css("left", asideWidth + 1);
		return this;
	},
	controlButtons: function() {
		$(".minimize").live('click', function(click){
			click.preventDefault();
			var e = $(this);
			e.parents('.layer').toggleClass('minimized');
			if (e.is(".open")) {
				e.removeClass("open").find(".arrow").text("∨");
				e.find(".toggle-word").text("Maximize");
			}
			else {
				e.addClass("open").find(".arrow").text("∧");
				e.find(".toggle-word").text("Minimize");
			}
		});
		$(".remove").live('click', function(click){
			click.preventDefault();
			thisLayer = $(this).parents('.layer')
		 	thisLayerIndex = thisLayer.data().layerIndex;
		 	if(api.layers.length != 1){
			 	api.removeLayer(thisLayerIndex);
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
			api.addLayer(0, 100, 100, 'New Layer');
			//ui.layers.add(api.layers.length); 
			ui.layers.init();
			ui.render();
		});
		$('.jPicker.Container').bind('mousemove, mousedown', function(){
			
			
		})
		return this;
	},
	toolTips: function() {
		
		//Tooltip Static
		var tip;
		
		$(".tip-trigger.static").live({
			
			mouseenter: function(e){

				//Caching the tooltip and removing it from container; then appending it to the body
				tip = $(this).find('.tip').remove();
				$('body').append(tip);
			
				var triggerWidth = $(this).width();
				var tipWidth = tip.width(); //Find width of tooltip
				var tipHeight = tip.height(); //Find height of tooltip

				//Distance of element from the right edge of viewport
				var tipOffset = $(this).offset();
				var posX = tipOffset.left;
				var posY = tipOffset.top - 32;

				tip.css({  top: posY, left: posX });

				tip.show(); //Show tooltip

		}, 
			mouseleave: function() {

				tip.hide().remove(); //Hide and remove tooltip appended to the body
				$(this).append(tip); //Return the tooltip to its original position
		
			},
			
			mousedown: function() {
				
				tip.hide().remove(); //Hide and remove tooltip appended to the body
				$(this).append(tip); //Return the tooltip to its original position
				
			}

		});
	
		
		//Tooltip Mobile
		$(".tip-trigger.mobile").live({
			
			mouseenter: function(){

				//Caching the tooltip and removing it from container; then appending it to the body
				tip = $(this).find('.tip').remove();
				$('body').append(tip);

				tip.show(); //Show tooltip

			}, 
			mouseleave: function() {

				tip.hide().remove(); //Hide and remove tooltip appended to the body
				$(this).append(tip); //Return the tooltip to its original position

			},
			mousedown: function() {
				
				tip.hide().remove(); //Hide and remove tooltip appended to the body
				$(this).append(tip); //Return the tooltip to its original position
				
			},
		    mousemove: function(e) {
			
			    //console.log(e.pageX)
				  var mousex = e.pageX - 11; //Get X coodrinates
				  var mousey = e.pageY - 39; //Get Y coordinates
				  var tipWidth = tip.width(); //Find width of tooltip
				  var tipHeight = tip.height(); //Find height of tooltip

				 //Distance of element from the right edge of viewport
				  var tipVisX = $(window).width() - (mousex + tipWidth);
				  var tipVisY = $(window).height() - (mousey + tipHeight);

				if ( tipVisX < 20 ) { //If tooltip exceeds the X coordinate of viewport
					mousex = e.pageX - tipWidth - 20;
					$(this).find('.tip').css({  top: mousey, left: mousex });
				} if ( tipVisY < 20 ) { //If tooltip exceeds the Y coordinate of viewport
					mousey = e.pageY - tipHeight - 20;
					tip.css({  top: mousey, left: mousex });
				} else {
					tip.css({  top: mousey, left: mousex });
				}
			}
		});

	},
	footerHeight: function(){
		$('footer .resize.handle').bind('mousedown', function(mde){
		var currentHeight = $('footer').height();
			$(window).bind('mousemove', function(mme){
				if(mme.pageY < innerHeight - 100 && mme.pageY > 150){
					$('footer').height(currentHeight + mde.pageY - mme.pageY);
					$('#output, .CodeMirror-scroll').height($('footer').height() - 40);
					ui.setLayout();
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
		read: function(layerIndex) {
			var domLayer = $('aside .layer:data(layerIndex=' + layerIndex+ ')'),
					apiLayer = api.layers[layerIndex];
				domLayer.find('.layerOutput').css('background', api.outputLayerCode(layerIndex));
				domLayer.find('.layerOptions-width').val(apiLayer.width);
				domLayer.find('.layerOptions-height').val(apiLayer.height);
				domLayer.find('.layerOptions-angle').val(apiLayer.angle);
				domLayer.find('.layerName').val(apiLayer.name);
				domLayer.find('.preview').width(apiLayer.width).height(apiLayer.height);
				ui.strips.make(layerIndex);
			for(var i=0; i<api.layers.length; i++){
				
				
			}
		},
		readAll: function(){
			for(var i=0; i<api.layers.length; i++){
				if($('aside .layer:data(layerIndex=' + i + ')').length == 0){
					ui.layers.add(i);
				}
				ui.layers.read(i);
			}
		},
		bind: function(){
			// Layer Options input bindings
			$('.layerOptions-width').live('change click scroll keyup', function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').width($(this).val());
				api.layers[$(this).parents('.layer').data().layerIndex].width = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-height').live('change click scroll keyup', function(){
				$(this).parents(".layerOptions").siblings(".previewWrapper").children('.preview').height($(this).val());
				api.layers[$(this).parents('.layer').data().layerIndex].height = parseInt($(this).val());
				ui.render();
			});
			$('.layerOptions-angle').live('change click scroll keyup', function(){
				api.layers[$(this).parents('.layer').data().layerIndex].angle = parseInt($(this).val());
				ui.render();
				//ui.layers.read();
			});
		},
		write: function(){
			
		},
		init: function(){
			
			ui.layers.readAll();
			ui.layers.bind();
		}
	},
	strips: {
		make: function(layerIndex){
			//Find view and pointers in DOM based on given Layer Index
			var layer = api.layers[layerIndex],
				view = $('.layer:data(layerIndex=' + layerIndex + ') .inspectrum .view, .layer:data(layerIndex=' + layerIndex + ') .inspectrum'),
				sqRt = Math.sqrt( layer.width*layer.width + layer.height * layer.height ),
				pointers = $('.layer:data(layerIndex=' + layerIndex + ') .stripEditor .pointers'),
				templatePointer = pointers.find('.template'),
				strip,
				viewStrip,
				pointer;
			//Make view's width equal to maximum possible length
			view.width(sqRt);
			for(var i=0; i<api.layers[layerIndex].strips.length; i++){
				
				//Point to api strip
				strip = api.layers[layerIndex].strips[i];
				
				//Make a pointer
				pointer = templatePointer
							.clone()
							.removeClass('template hidden')
							.css('left', strip.start + ( strip.width / 2 ) - 5) // calculate center of the strip -5 is half of pointer width
							.data({layerIndex: layerIndex, stripIndex: i, strip: strip});
				pointer.find('.abstract').css('background', api.renderColor.hexgen(strip.color));
				//Make an strip to put in .view
				viewStrip = $('<div/>')
							.addClass('strip')
							.width(strip.width)
							.css({
								'background': api.renderColor.rgbagen(strip.color),
								'left' : strip.start
							})
							.data('layerIndex', layerIndex)
							.data('stripIndex', i);
				
				//Append pointer and view strip
				view.append(viewStrip);
				pointers.append(pointer);
			}
		},
		read: function(layerIndex){ //read strip data from API to UI
			//Find view and pointers in DOM based on given Layer Index
			var view = $('.layer:data(layerIndex=' + layerIndex + ') .inspectrum .view'),
				pointers = $('.layer:data(layerIndex=' + layerIndex + ') .stripEditor .pointers'),
				templatePointer = pointers.find('.template'),
				strip,
				stripElem,
				viewStrip,
				pointer;
			for(var i=0; i<api.layers[layerIndex].strips.length; i++){
				//Point to api strip
				strip = api.layers[layerIndex].strips[i];
				
				//Find the right pointer and make css changes
				pointer =  $('.layer:data(layerIndex=' + layerIndex + ') .stripEditor .pointers .pointer:data(stripIndex=' + i + ')');
				pointer.css('left', strip.start + ( strip.width / 2 ) - 5) // calculate center of the strip -5 is half of pointer width
					   .find('.abstract').css('background', api.renderColor.hexgen(strip.color));
				
				//Find the strip and make css changes
				stripElem = $('.layer:data(layerIndex=' + layerIndex + ') .view .strip:data(stripIndex=' + i + ')');
				stripElem.width(strip.width)
						 .css({
							'background': api.renderColor.rgbagen(strip.color),
							'left' : strip.start
						 });
			}
		},
		readAll: function(){
			for(var i=0; i< api.layers.length; i++){
				ui.strips.read(i);
			
			}
			
		}
	},
	init: function(){
		this.bind();
		this.render();
		this.setLayout();
		this.controlButtons();
		this.layers.init();
		this.toolTips();
		this.footerHeight();
	}
};
