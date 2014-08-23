
d = new Detector();
var safeFonts_sans = ['arial','arial narrow','calibri','candara','century gothic','franklin gothic medium','futura','geneva','gill sans','helvetica','impact','lucida grande','optima','segoe ui','tahoma','trebuchet ms','verdana'];
var safeFonts_serif = ['Baskerville','Big Caslon', 'Bodoni MT', 'Book Antiqua', 'Calisto MT', 'Cambria', 'Didot', 'Garamond', 'Georgia', 'Goudy Old Style','Hoefler Text', 'Lucida Bright', 'Palatino', 'Perpetua', 'Rockwell', 'Rockwell Extra Bold', 'Times New Roman'];

//////////////////////
//	Document Ready 	//
//////////////////////

$(document).ready(function() {
	var fontList = [];

	draggableInizialize();
	optionsInizialize();
	editableInizialize();

	var safeList = detectSafeFonts();
	getWebFonts(safeList);

	$('#upload').on('change', function(e) {
		file = document.getElementById('upload').files[0];
		var reader  = new FileReader();
		console.log(file)
		  reader.onloadend = function () {
   			 console.log(render);
 		 }

	})
});

$(document).on('webFontLoaded', function(event) {
	var fontList = event.fontList;

	$('.spinner').hide();

	select2Inizialize(fontList);

	$('#font-select').on('change', function(object) {
		var selectedList = $(this).select2('data');
		var	selectedFamilies = handleSelectedFonts(selectedList);
		applyFonts(selectedFamilies);
	})
	
});



//////////////////////////////
//	 Font List Functions 	//
//////////////////////////////

// Format list to fits Select2 needs

function detectSafeFonts() {
	window.safeFonts= []
	var safeList = [];
	for (var i = 0; i < window.safeFonts_sans.length; i++) {
		var font = window.safeFonts_sans[i]
		if ( d.detect(font) ){
			safeList.push(
				{ 
					'id': font, 
					'text':  font.substr(0, 1).toUpperCase() + font.substr(1), 
					type: 'safe', 
					weights: ['bold', 'bold italic', 'regular', 'italic'], 
					defWeight: 'normal', 
					defStyle: 'normal',
					defOffset: 0,
					cat: 'sans-serif'
				}
			);
			window.safeFonts.push(font.toLowerCase())
		}
	};
	for (var i = 0; i < window.safeFonts_serif.length; i++) {
		var font = window.safeFonts_serif[i]
		if ( d.detect(font) ){
			safeList.push(
				{ 
					'id': font, 
					'text':  font.substr(0, 1).toUpperCase() + font.substr(1), 
					type: 'safe', 
					weights: ['bold', 'bold italic', 'regular', 'italic'], 
					defWeight: 'normal', 
					defStyle: 'normal',
					defOffset: 0,
					cat: 'serif'
				}
			);
			window.safeFonts.push(font.toLowerCase())
		}
	};
	return { id: 'safe', text: 'Websafe Fonts' , children: safeList, disabled: true };
}

function formatGoogleList(list) {
	var selectList = [];
	for (var i = 0 ; i <= list.length - 1; i++) {
		selectList.push( { 
			'id': i, 
			'text': list[i].family, 
			cat: list[i].category, 
			type: 'google', 
			weights: list[i].variants, 
			defWeight: 'normal', 
			defStyle: 'normal',
			defOffset: 0
		} );
	};

	return { id: 'google', text: 'Google Fonts' , children: selectList, disabled: true };
}

// Get Json Google webfont and trigger webFontLoaded with the normal and the formatted list
function getWebFonts(otherList) {
	$.getJSON( "https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyBPRLLzkocIsUUH0VSKFUvLFuqIoXUAHxw", function( data ) {
		googleFontList = data.items;
		$.event.trigger({
			type: 'webFontLoaded',
			fontList: [formatGoogleList(googleFontList), otherList]
		});
	});
}


function handleSelectedFonts(selectedList) {
	var loadList = [];
	var googleList = [];
	for (var i = 0; i < selectedList.length; i++) {
		var choice = selectedList[i];
		loadList.push(choice);
		if ( choice.type == 'google' ) {
			var variants;
			if (choice.weights) {
				variants = ':' + choice.weights.join();
			} else {
				variants = '';
			};
			googleList.push(choice.text + variants);
		}
	};

	console.log(googleList)

	if (googleList.length > 0) {
		console.log('Loading webfonts: ' + googleList);
		WebFont.load({
		    google: {
		    families: googleList,
			}
		});
	};

	return loadList;
}

function applyFonts(selectedFamilies) {
	for (var i = selectedFamilies.length - 1; i >= 0; i--) {
		console.log(selectedFamilies[i])
		var fontObject = selectedFamilies[i]
		$('.col' + (i+1) ).css('font-family', fontObject.text);
		$('.col' + (i+1) ).css('font-weight', fontObject.defWeight);
		$('.col' + (i+1) ).css('font-style', fontObject.defStyle);
		$('.magnifier .col' + (i+1) + ' span' ).css('top', fontObject.defOffset);
		$('.fontName .col' + (i+1) + ' .name').text(fontObject.text);
		if (fontObject.weights) {
			$('.fontName .col' + (i+1) + ' .weight').html( '<span class="selectedWeight">' + fontObject.defWeight + ( (fontObject.defStyle=='italic') ? ' italic' : '' ) + '</span>' + populateWeightSelect(fontObject.weights) );
			weightInizialize();
		} else {
			$('.fontName .col' + (i+1) + ' .weight').hide().html('')
		}
		
	};

	$('body').removeClass('none single double triple');

	if (selectedFamilies.length == 1) {
		$('body').addClass('single');
	} else if (selectedFamilies.length == 2) {
		$('body').addClass('double');
	} else if (selectedFamilies.length == 3) {
		$('body').addClass('triple');
	} else {
		$('body').addClass('none');
	}
}

function populateWeightSelect(weights) {
	var html = '<ul>';
	for (var i = weights.length - 1; i >= 0; i--) {
		var weight = weights[i].match(/\d+|regular|bold/) ;
		var style = weights[i].match(/italic/);
		html += '<li'
		if (style) {
			html += ' data-style="' + style + '"'
		} else {
			html += ' data-style="normal"'
		};
		if (weight == 'regular') {
			html += ' data-weight="normal"';
		} else if (weight) {
			html += ' data-weight="' + weight + '"';
		} else {
			html += ' data-weight="normal"';
		}
		html += '>'
		if (weight == 'regular') {
			html += 'normal';
		} else if (weight) {
			html += weight;
		}
		if (style) {
			html += " " + style;
		};		
		html += '</li>' 
	};
	html += '</ul>'
	console.log(html);
	return html;
}


// function convertToFVD(variants) {
// 	var fvdWeishts = [];
// 	for (var i = variants.length - 1; i >= 0; i--) {
// 		if (variants[i] == 'regular' || !variants[i].match(/\D+/)) {
// 			fvdWeishts[i] = "n"
// 		} else if ( variants[i].match(/italic/) == 'italic' ) {
// 			fvdWeishts[i] = "i"
// 		} else {
// 			fvdWeishts[i]=''
// 		}
// 		if ( variants[i].match(/\d/) ) {
// 			fvdWeishts[i] = fvdWeishts[i] + variants[i].match(/\d/);
// 		} else {
// 			fvdWeishts[i] = fvdWeishts[i] + '4';
// 		}
// 	};
// 	fvdNotation = ':' + fvdWeishts.join();
// 	return fvdNotation;
// }

//////////////////////////////
//	  Select2 Functions 	//
//////////////////////////////

function select2FormatResult(item) { 
	var prefix = '';
	var suffix = ''
	if (item.type=='system') {
		suffix = '<span class="suffix">System font detected</span>'
	}
	if (item.cat) {
		return prefix + item.text + suffix +'<small class="details">' + item.cat + '</small>';
	} else {
		return prefix + item.text + suffix;
	}
}

function select2FormatSelection(item) { 
	return item.text; 
}

function select2SystemFont (term) {
	var font = term.trim().toLowerCase();
	var uploader = { id: 'fileLoader', text: 'Select a custom font file <input type="file">', disabled: true };
	// return uploader;
	console.log( window.safeFonts )
	if ( window.safeFonts.indexOf(font) == -1 && font != '\'' && d.detect(font)) {
		return { 
			'id': font, 
			'text':  font.substr(0, 1).toUpperCase() + font.substr(1), 
			type: 'system', 
			weights: ['bold', 'bold italic', 'regular', 'italic'], 
			defWeight: 'normal', 
			defStyle: 'normal',
			defOffset: 0
		}
	} 
}

function select2NoResult(term) {
	return 'No font matches for ' + term;
}

function select2Inizialize(list) {
	$('#font-select').select2({
		containerCssClass: 'font-select',
		placeholder: 'Select fonts you want to test (max. 3)',
		maximumSelectionSize: 3,
		multiple: true,
		data: list,
		formatResult: select2FormatResult,
		formatSelection: select2FormatSelection,
		dropdownCssClass: "bigdrop",
		createSearchChoice: select2SystemFont,
		allowClear: true,
		formatNoMatches: select2NoResult
	});



	$("#font-select").select2("container").find("ul.select2-choices").sortable({
	    containment: 'parent',
	    start: function() { $("#font-select").select2("onSortStart"); },
	    update: function() { $("#font-select").select2("onSortEnd"); }
	});
}

//////////////////////////////
//	  	 UI Functions 		//
//////////////////////////////

function draggableInizialize() {
	$('.font span').draggable({
		axis: "y", 
		containment: ".magnifier",
		opacity: 0.35
	});

	$('.movable').draggable({
		axis: "y", 
		containment: ".magnifier",
		opacity: 0.35
	});

	$('.font span').on('dragstop', function(event, ui) {
		var target = $(this).attr('data-object');
		var selectedFonts = $('#font-select').select2('data');
		selectedFonts[target].defOffset = ui.position.top;
	})
}

function optionsInizialize() {
	$('.option').on('click', function(){
		var target = $(this).attr('data-target');
		var status = $(this).hasClass('selected');
		if (target != undefined && status ) {
			$(target).fadeOut();
		} else if ( target != undefined && !status ) {
			$(target).fadeIn();
		} else {
			console.log("Something's wrong!")
			return;
		}
		$(this).toggleClass('selected');
	})	
}

function editableInizialize() {
	$('.editable').on('input', function() {
		text = $(this).text();
    	$(this).parents('.tableWrapper').find('.editable').not(this).text(text);
	});
}

function weightInizialize() {
	$(document).on('click', function() {
		$('.weight').children('ul').stop().slideUp();
	})

	$('.weight').off().on('click', function(e) {
		e.stopPropagation();
		$(this).children('ul').stop().slideToggle();
		console.log('slide');
	})

	$('.weight li').off().on('click', function(e) {
		e.stopPropagation();
		var context = $(this).parents('.weight');
		var style = $(this).attr('data-style');
		var weight = $(this).attr('data-weight');
		var target = context.attr('data-object');
		var selectedFonts = $('#font-select').select2('data');
		selectedFonts[target].defWeight = weight;
		selectedFonts[target].defStyle = style;
		applyFonts(selectedFonts);
	})
}