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
	generateLayerCode: function(){
		var startStr = "linear-gradient(",
			result;
		result = startStr + this.activeLayer.angle + 'deg, ';
		
		return result += ');';
	},
	generate : function(){
		var layersCode = [],
			result = [];
		//for every layer 
	    layersCode.push(this.generateLayerCode()); // 
		
		//add prefixes
		
		for(var i=0; i<layersCode.length; i++){
			if(this.prefixes.webkit){
				result.push('-webkit-' + layersCode[i]);
			}
			if(this.prefixes.moz){
				result.push('-moz-' + layersCode[i]);
			}
		};
		return result.join('\n');
	},
	init : function () {
	  if(this.layers.length == 0) this.addLayer();
	  this.changeActiveLayer(0);
	}
};


//API useage
patternz.init();
patternz.addStrip('red', 10, 30);
patternz.addStrip('blue', 50, 80);
patternz.addLayer(90);
patternz.addStrip('red', 10, 30);
patternz.addStrip('blue', 50, 80);
patternz.generate();
