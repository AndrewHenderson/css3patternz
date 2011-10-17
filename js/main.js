/*
main.js
*/
//API
var patternz = {
	layers : [],
	activeLayerIndex : 0,
	activeLayer : null,
	output : '',
	prefixes: {webkit: true, moz: true, ms: true, o: true, w3c: true},
	addLayer : function(degree){
		var layer = {
				width: 100,
				height: 100,
				background: 'transparent',
				angle: degree || 0,
				strips: []
		    };
		this.layers.push(layer);
		this.changeActiveLayer(this.activeLayerIndex++);
	},
	changeActiveLayer : function (layerIndex) {
	  this.activeLayer = this.layers[layerIndex];
	},
	addStrip: function(stripColor, startPoint, endPoint){
		var strip = {};
		strip.color = stripColor || "#000";
		strip.start = startPoint || 0;
		strip.end = endPoint || 10;
		this.activeLayer.strips.push(strip);
	},
	removeStrip: function(stripIndex){

	},
	changeStripSize: function(stripIndex, start, end){},
	changeStripColor: function(stripIndex, color){},
	generateLayerCode: function(layerIndex){
		var li = layerIndex || 0,
			startStr = "linear-gradient(",
			result;
		result = startStr + this.layers[li].angle + 'deg';
		for(var i = 0; i< this.activeLayer.strips.length; i++){
			result = result 
			    + ' , '
			    + this.activeLayer.background + ' '
			    + this.activeLayer.strips[i].start + 'px, '
			    + this.activeLayer.strips[i].color + ' '
				+ this.activeLayer.strips[i].start + 'px, '
				+ this.activeLayer.strips[i].color + ' '
				+ this.activeLayer.strips[i].end + 'px, '
				+ this.activeLayer.background + ' '
				+ this.activeLayer.strips[i].end + 'px';
		}
		return result += ')';
	},
	generate : function(){
		var layersCode = [],
			result = [];
		//for every layer 
		for(var i=0; i<this.layers.length; i++){
			 layersCode.push(this.generateLayerCode(i)); // 
		}
	   
		//add prefixes
		
		for(var i=0; i<this.prefixes.length; i++){
			//TODO try to figure out if it is possble to do *add prefixes* with a loop
		}
		if(this.prefixes.webkit){
			var layer = [];
			for(var i=0; i<layersCode.length; i++){
				layer.push('-webkit-' + layersCode[i]);
			}
			layer.join(', ');
			result.push(layer);
		}
		
		if(this.prefixes.moz){
			var layer = [];
			for(var i=0; i<layersCode.length; i++){
				layer.push('-moz-' + layersCode[i]);
			}
			layer.join(', ');
			result.push(layer);
		}
		if(this.prefixes.ms){
			var layer = [];
			for(var i=0; i<layersCode.length; i++){
				layer.push('-ms-' + layersCode[i]);
			}
			layer.join(', ');
			result.push(layer);
		}
		if(this.prefixes.o){
			var layer = [];
			for(var i=0; i<layersCode.length; i++){
				layer.push('-o-' + layersCode[i]);
			}
			layer.join(', ');
			result.push(layer);
		}
		if(this.prefixes.w3c){
			var layer = [];
			for(var i=0; i<layersCode.length; i++){
				layer.push('' + layersCode[i]);
			}
			layer.join(', ');
			result.push(layer);
		}

		return result.join(';\n');
	},
	init : function () {
	  if(this.layers.length == 0) { this.addLayer();}
	  this.changeActiveLayer(0);
	}
};


//API useage - remove later
patternz.init();
patternz.addStrip('red', 10, 30);
patternz.addStrip('blue', 50, 80);
patternz.addLayer(90);
patternz.addStrip('red', 10, 30);
patternz.addStrip('blue', 50, 80);

document.body.setAttribute('style', 'background-size:100px 100px; background-image: ' + patternz.generate() );