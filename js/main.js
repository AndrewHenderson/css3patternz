/*
main.js
*/

var patternz = {
	layers : [],
	activeLayerIndex : 0,
	activeLayer : null,
	output : '',
	prefixes: {webkit: true, moz: true, ms: true, o: true, w3c: true},
	addLayer : function(){
		var layer = {
			width: 100,
			height: 100,
			background: 'transparent',
			angle: 0,
			strips: []
		};
		patternz.layers.push(layer);
	},
	changeActiveLayer : function (layerIndex) {
	  patternz.activeLayer = patternz.layers[layerIndex];
	},
	modifyLayer: {
		addStrip: function(stripColor, startPoint, endPoint){
			var strip = {};
			strip.color = stripColor || "#000";
			strip.start = startPoint || 0;
			strip.end = endPoint || 10;
			patternz.activeLayer.strips.push(strip);
		},
		removeStrip: function(stripIndex){

		},
		changeStripSize: function(stripIndex, start, end){},
		changeStripColor: function(stripIndex, color){}
	},
	generate: function(){
		var startStr = "linear-gradient(",
			result;
		
	},
	init : function () {
	  if(patternz.layers.length == 0) patternz.addLayer();
	  patternz.changeActiveLayer(0);
	}
};

patternz.init();
