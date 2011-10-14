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