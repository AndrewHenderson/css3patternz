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
	removeLayer : function(){
		//TODO
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
		for(var i = 0; i< this.layers[li].strips.length; i++){
			result = result 
			    + ' , '
			    + this.layers[li].background + ' '
			    + this.layers[li].strips[i].start + 'px, '
			    + this.layers[li].strips[i].color + ' '
				+ this.layers[li].strips[i].start + 'px, '
				+ this.layers[li].strips[i].color + ' '
				+ this.layers[li].strips[i].end + 'px, '
				+ this.layers[li].background + ' '
				+ this.layers[li].strips[i].end + 'px';
		}
		return result += ') ' + this.activeLayer.width + 'px ' + this.activeLayer.height + 'px';
	},
	generate : function(){
		this.init();
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
	outputLayerCode: function(layerIndex){
		var rawCode = this.generateLayerCode(layerIndex);
		if(true){ // browser is webkit TODO
			return  '-webkit-' + rawCode;
		}
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


//Load sample pattern

var defaultPattern = [{
	angle: -60,
	background: "transparent",
	height: 200,
	width: 80,
	name: "Sample Layer 1",
	strips:[{
			color: 'silver',
			end: 40,
			start: 35
		},
		{
			color: 'yellow',
			end: 60,
			start: 40
		},
		{
			color: 'gray',
			end: 65,
			start: 60
		}]},
		{
	angle: 0,
	background: "transparent",
	height: 100,
	width: 100,
	name: "Sample Layer 2",
	strips:[{
			color: 'green',
			end: 40,
			start: 25
		},
		{
			color: "rgba(255, 215, 0, 0.5)",
			end: 60,
			start: 40
		},
		{
			color: 'gray',
			end: 65,
			start: 60
		}]
	}];
	
// patternz loading
patternz.layers = defaultPattern;
document.getElementById("pattern").setAttribute('style', 'background: ' + patternz.generate() );


