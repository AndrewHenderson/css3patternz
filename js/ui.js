/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 
//setAsideHeight
function setAsideHeight(){
	$('aside').height(innerHeight - 60 - $('footer').height());
}



// document load
 $(document).ready(function(){
	
 	setAsideHeight();

	// copy to clipboard
	
	var clip = new ZeroClipboard.Client();

    clip.setText( '' ); // will be set later on mouseDown
    clip.setHandCursor( true );
    clip.setCSSEffects( true );

    clip.addEventListener( 'load', function(client) {
            // alert( "movie is loaded" );
    } );

    clip.addEventListener( 'complete', function(client, text) {
            alert("Copied text to clipboard: " + text );
    } );

    clip.addEventListener( 'mouseOver', function(client) {
            // alert("mouse over"); 
    } );

    clip.addEventListener( 'mouseOut', function(client) { 
            // alert("mouse out"); 
    } );

    clip.addEventListener( 'mouseDown', function(client) { 
            // set text to copy here
            clip.setText( $('#output .content').text );

            // alert("mouse down"); 
    } );

    clip.addEventListener( 'mouseUp', function(client) { 
            // alert("mouse up"); 
    } );
	
	clip.glue( 'clip_button' );
	
	$("#ZeroClipboardMovie_1").parents("div").hover(
	  function () {
	    $("#clip_button").addClass("hover");
	  },
	  function () {
	    $("#clip_button").removeClass("hover");
	  }
	);
	
 });
 
// footer resizable
$('footer .resize.handle').bind('mousedown', function(mde){
	var currentHeight = $('footer').height();
	$(window).bind('mousemove', function(mme){
		if(mme.pageY < innerHeight - 100 && mme.pageY > 150){
			$('footer').height(currentHeight + mde.pageY - mme.pageY);
			$('#output').height($('footer').height() - 40);
			setAsideHeight();
	    }
		$(window).bind('mouseup', function(){
			$(window).unbind('mousemove');
		})
	})
});


window.onresize = function  () {
  setAsideHeight();
}

