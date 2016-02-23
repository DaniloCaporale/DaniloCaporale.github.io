function is_touch_device() {
	return (('ontouchstart' in window)
		|| (navigator.MaxTouchPoints > 0)
		|| (navigator.msMaxTouchPoints > 0));
}

function loadbib() {
	bibtex_js_draw();
	// Instantiate MixItUp:
	$('#PubList').mixItUp(); 
	$( ".pub_button" ).click(function() {
		window.open($(this).parent().attr('href'));
	});
	$('.pub_button').tooltip();
}
	
$(document).ready(function(){
	$('#bibtex_input').load('mybibtex.bib', loadbib);
	
	$( window ).load(function() {
		var wh = window.innerHeight;
		var padtop  = 0.3 * wh;
		$('.header-text').css('padding-top', padtop);
	});
	
	if (!is_touch_device()) {
		$( window ).resize(function() {
			var wh = window.innerHeight;
			var padtop  = 0.3 * wh;
			$('.header-text').css('padding-top', padtop);
		});
	}
	
	if (is_touch_device()) {
		var ratio = window.devicePixelRatio || 1;
		var h = screen.height;
		$('#home').css('height', h);
		$('#home').css('min-height', h);
	}
	
	// tooltip
	$('.downloadCol').find("a").tooltip();
	
	// pubblication collapse
	//open
	$('.pub_collapse').on('shown.bs.collapse', function () {
		var button = $('div[href=#' + this.id + ']').find(".collapse_button");
		button.removeClass("glyphicon-collapse-down").addClass("glyphicon-collapse-up")		
	});
	// close
	$('.pub_collapse').on('hidden.bs.collapse', function () {
		var button = $('div[href=#' + this.id + ']').find(".collapse_button");
		button.removeClass("glyphicon-collapse-up").addClass("glyphicon-collapse-down")	
	});
	// stellar
	if(!is_touch_device()){
		$("#home").attr('data-stellar-background-ratio', "0.3");
		$(window).stellar({
			horizontalScrolling: false,
			verticalOffset: 0,
			horizontalOffset: 0,
		});
	}
	
	//scrolling
	$('.navbar a[href^="#"]').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash,
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 1000, 'swing', function () {
	        window.location.hash = target;
	    });
	});
	
	// click paper link in news section
	$('.news_paper_link').on('click',function(e){
		var target = $(this).attr('href');
		var heading = $('.panel-heading[href="'+target+'"');
		$('html, body').stop().animate({
			'scrollTop': $(heading).offset().top - 60
		}, 1000, 'swing', function () {
			$(target).delay(2000).collapse('show');
		});
	});
});
