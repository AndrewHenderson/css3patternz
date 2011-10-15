/* Project: CSS3 Patternz
 * Description: Generate CSS3 Patterns and the necessary code.
 * Authors: Mohsen Nabiloo-Azimi (@mohsen____), Andrew Henderson (@AndrewHenderson)
 * Start Date: Oct 12, 2011
 */
 
 $(document).ready(function(){
 
	// make variable height divs equal heights
    $.fn.sameHeights = function() {
        $(this).each(function(){
            var tallest = 0;
            $(this).children().each(function(i){
                if (tallest < $(this).height()) { tallest = $(this).height(); }
            });
            $(this).children().css({'height': tallest});
        });
        return this;
    };
	
    // make boxes same height
    $(".sameHeights").sameHeights();
 
 });
 
//setAsideHeight
function setAsideHeight(){
	$('aside').height(innerHeight - 60 - $('footer').height());
}
// document load

 $(document).ready(function(){
 	setAsideHeight();
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
<<<<<<< HEAD
=======

window.onresize = function  () {
  setAsideHeight();
}
>>>>>>> scrollable aside
