/******************************************************************************

Copyright 2014 Lorenzo Zottar

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*******************************************************************************/


/*
TODO:
- add drag & drop
- create filters
- add more compatibility checks
*/


var googleApiKey = 'AIzaSyBPRLLzkocIsUUH0VSKFUvLFuqIoXUAHxw';
window.lastColsCheck = "'3'";

d = new Detector();
var safeFonts_sans = ['arial','arial narrow','calibri','candara','century gothic','franklin gothic medium','futura','geneva','gill sans','helvetica','impact','lucida grande','optima','segoe ui','tahoma','trebuchet ms', 'Verdana'];
var safeFonts_serif = ['Baskerville', 'Big Caslon', 'Bodoni MT', 'Book Antiqua', 'Calisto MT', 'Cambria', 'Didot', 'Garamond', 'Georgia', 'Goudy Old Style', 'Hoefler Text', 'Lucida Bright', 'Palatino', 'Perpetua', 'Rockwell', 'Rockwell Extra Bold', 'Times New Roman' ];
var customFontList = {id: 'custom', text: 'Custom Fonts', children: [], disabled: true};
var globalFontList = [customFontList];

//////////////////////
//	Document Ready 	//
//////////////////////

$(document).ready(function() {
	var fontList = [];

	draggableInizialize();
	optionsInizialize();
	editableInizialize();
	uploadInizialize();
	select2Inizialize();
	checkResolution();
});

$(document).ready(function() { 
	globalFontList.unshift(detectSafeFonts());
	$('#spinner').hide();
});

$(document).ready(function() { 
	getWebFonts();
	$('#spinner').hide();
});

var delay;

$(window).on('resize', function() {
	clearTimeout(delay);
	delay = setTimeout(function(){ checkResolution(); }, 500);
});

//////////////////////////////
//	 	Font Functions 		//
//////////////////////////////

// Detect websafe system fonts

// Format list to fits Select2 needs

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
			defOffset: 4
		} );
	};

	return { id: 'google', text: 'Google Fonts' , children: selectList, disabled: true };
}

// Get Json Google webfont and trigger webFontLoaded with the normal and the formatted list
function getWebFonts() {
	$.getJSON( "https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=" + googleApiKey, function( data ) {
		googleFontList = data.items;
		formattedList = formatGoogleList(data.items);
		globalFontList.unshift(formattedList);
		sendAlert('success','Google Fonts Loaded');
	})
	.error(function() { sendAlert('error', 'Google Font failed to load'); });
}

function loadGoogleFont(font) {
	var variants;
	if (font.weights) {
		variants = ':' + font.weights.join();
	} else {
		variants = '';
	};
	var fontString = font.text + variants;
	console.log('Loading webfonts: ' + font.text);
	WebFont.load({
	    google: {
	    families: [ fontString ],
		},
		loading: function() {},
		active: function() { appendSelected(font); $('#font-select').select2('readonly', false); },
		inactive: function() { sendAlert('error', 'Google Font not loaded!'); $('#font-select').select2('readonly', false);}
	})	
}


function handleSelectedFonts(selectedList) {
	var loadList = [];
	for (var i = 0; i < selectedList.length; i++) {
		var choice = selectedList[i];
		loadList.push(choice);
	};
	applyFonts(loadList);
}

function applyFonts(selectedFamilies) {
	if (!selectedFamilies) {
		sendAlert('error', 'Something happened!'); 
		selectedFamilies = [];
	} else {
		$('body').removeClass('none single double triple');
	}

	if (selectedFamilies.length == 0) {
		$('body').addClass('none');
	} else if (selectedFamilies.length == 1) {
		$('body').addClass('single');
	} else if (selectedFamilies.length == 2) {
		$('body').addClass('double');
	} else if (selectedFamilies.length == 3) {
		$('body').addClass('triple');
	} else {
		selectedFamilies.pop();
	}



	for (var i = selectedFamilies.length - 1; i >= 0; i--) {
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
}

function populateWeightSelect(weights) {
	var html = '<ul>';
	for (var i = weights.length - 1; i >= 0; i--) {
		var weight = weights[i].match(/\d+|regular|bold|lighter/) ;
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
		suffix += '<span class="suffix">System font detected</span>';
	}
	if (item.weights && item.type=='google') {
		suffix += '<small class="details colored">' + item.weights.length + ' variants</small>';
	}
	if (item.cat) {
		 suffix += '<small class="details">' + item.cat + '</small>';
	} 

	return prefix + item.text + suffix;
}

function select2FormatSelection(item) { 
	return item.text; 
}

function select2SystemFont (term) {
	return detectSystemFont(term, 'system');
}

function select2Data(list) {
	// var returnList = [];
	// var tmpObject;
	// for (var i = 0; i < list.length; i++) {
	// 	if (list[i].children){
	// 		tmpObject = list[i];
	// 		tmpObject.children = select2Data(list[i].children);
	// 		returnList.push(tmpObject);
	// 	}
	// 	if (true) {
	// 		returnList.push(list[i])
	// 	};
	// };
	// return returnList;
	return list;
}

function select2Inizialize(list) {
	$('#font-select').select2({
		containerCssClass: 'font-select',
		placeholder: 'Select fonts you want to test (max. 3)',
		maximumSelectionSize: 3,
		multiple: true,
		data: select2Data(globalFontList),
		formatResult: select2FormatResult,
		formatSelection: select2FormatSelection,
		dropdownCssClass: "bigdrop",
		createSearchChoice: select2SystemFont,
		createSearchChoicePosition: 'bottom',
	});


	$("#font-select").select2("container").find("ul.select2-choices").sortable({
	    containment: 'parent',
	    start: function() { $("#font-select").select2("onSortStart"); },
	    update: function() { $("#font-select").select2("onSortEnd"); }
	});

	$('#font-select').on('select2-selecting', function(event) {
		var font = event.choice;
		if (font.type == 'google') {
			event.preventDefault();
			$('#font-select').select2('close');
			$('#font-select').select2('readonly', true);
			loadGoogleFont(font);
		};
	})

	$('#font-select').on('change', function(object) {
		var selectedList = $(this).select2('data');
		handleSelectedFonts(selectedList);
		// applyFonts(selectedFamilies);
	})

	$('.brand, .logo').on('click', function() {
		$('#font-select').select2('data', null, true);
	})
}

function appendSelected(element) {
		selectedFonts = $('#font-select').select2('data');

		if (selectedFonts.length < 3) {
			selectedFonts.push(element);
			$('#font-select').select2('data', selectedFonts, true );
			return true;
		} else {
			return false;
		};
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

	$('.edit_toggle').on('click', function() {
		if ( $(this).hasClass('active') ) {
			$('.editable').removeClass('is_editable').attr('contenteditable', 'false');
			$('.font span').addClass('is_draggable').draggable("enable");
		} else {
			$('.editable').addClass('is_editable').attr('contenteditable', 'true');
			$('.font span').removeClass('is_draggable').draggable("disable");
		};

		$(this).toggleClass('active');
	});

	$('.font .editable').on( 'keydown', function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
		};
		if ([8,37,38,39,40,46].indexOf(e.keyCode) == -1 && $(this).text().length >= 5) {
			e.preventDefault();
		};
	});
	$('.editable').on('input', function() {
		text = $(this).html();
    	$(this).parents('.tableWrapper').find('.editable').not(this).html(text);
	});


}

function weightInizialize() {
	$(document).off('click').on('click', function() {
		$('.weight').children('ul').stop().slideUp();
	})

	$('.weight').off().on('click', function(e) {
		e.stopPropagation();
		$(this).children('ul').stop().slideToggle();
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

function uploadInizialize() {
	if (Modernizr.filereader) {
		var fileInput = document.getElementById('fileInput');
		$('#upload').on('change', function() {
			var file = $(this)[0].files[0];
			var reader = new FileReader();

			reader.onload = function(e) {
			  var dataURL = reader.result;
			  createUserFont(dataURL, file.name);
			}

			reader.readAsDataURL(file);

			$(this).val('');
		})
		$('#uploadButton').on('click', function(e) {
			e.preventDefault();
			$('#upload').trigger('click');
		})
	} else {
		$('#uploadButton').prop('disabled', true);
		sendAlert('error', 'Browser doesn\'t support file upload')
	}
}

//////////////////////////////
//	   Upload Functions 	//
//////////////////////////////

function createUserFont(data, name) {

	name = name.toLowerCase().replace(/\.(ttf|otf|woff|eot)/,"").replace(/[\.,\/\\#!$%\^&\*;:{}=`~()]/g,"");
	var exist = false;
	var alertMsg = name + ' custom font';

	for (var i = customFontList.children.length - 1; i >= 0; i--) {
		var exist =( customFontList.children[i].id == name )
	};

	if (exist) {
		sendAlert('error', 'Font already uploaded');
	} else {
		var newStyle = $('style');
		newStyle.appendTo('head').append("@font-face { font-family:" + name + "; src:url(" + data + "); font-style:normal; font-weight:400; }");
		var newFont = { 
			'id': name, 
			'text':  name.substr(0, 1).toUpperCase() + name.substr(1), 
			type: 'user', 
			defWeight: 'normal', 
			defStyle: 'normal',
			defOffset: 4
		};
		
		customFontList.children.push(newFont);
		var append = appendSelected(newFont);

		if (append) {
			alertMsg += ' added and applied'
		} else {
			alertMsg += ' added to list'
		}
		
		sendAlert('info', alertMsg);
	}
}

//////////////////////////////
//	System Fonts Functions 	//
//////////////////////////////

function detectSystemFont(fontName, type, cat) {
	var font = fontName.trim().toLowerCase().replace(/([^\w\s|\-|\_|\.])/g,"");
	if (font && font != ' ' && font != '' && d.detect(font)) {
		var newFont = { 
			'id': font, 
			'text':  font.substr(0, 1).toUpperCase() + font.substr(1), 
			type: type,
			weights: ['bold', 'bold italic', 'regular', 'italic', 'lighter', 'lighter italic'], 
			defWeight: 'normal', 
			defStyle: 'normal',
			defOffset: 4
		};
		if (cat) {
			newFont.cat = cat;
		};
		return newFont;
	} 
}

function detectSafeFonts() {
	var safeList = [];
	for (var i = 0; i < window.safeFonts_sans.length; i++) {
		var font = detectSystemFont( window.safeFonts_sans[i], 'safe', 'sans-serif' )
		if (font) {
			safeList.push(font);
		};
	};

	for (var i = 0; i < window.safeFonts_serif.length; i++) {
		var font = detectSystemFont( window.safeFonts_serif[i], 'safe', 'serif' )
		if (font) {
			safeList.push(font);
		};
	};

	safeList.sort(function(a,b) {
		if ( a.text > b.text) {
			return 1;
		} else if ( a.text < b.text) {
			return -1;
		} else {
			return 0;
		};
	})

	if (safeList.length > 0) {
		sendAlert('success','WebSafe Fonts Loaded');
		return { id: 'safe', text: 'Websafe Fonts' , children: safeList, disabled: true }
	};
}

//////////////////////////////
//	    Alert Functions 	//
//////////////////////////////

function sendAlert(type, message, permanent) {
	delay = 4000;
	alertClass= 'alertBox';
	if (type=='error') {
		alertClass += ' error';
		delay = 6000;
	} else if (type == "success") {
		alertClass += ' success';
	} else {
		alertClass += ' info';
	};



	var alertBox = $('<div class="' + alertClass + '">' + message + '</div>');
	alertBox.appendTo('#alertBar');

	alertBox.on('click', function() {
		$(this).remove();
	})

	if (!permanent) {
		alertBox.fadeIn(1000).delay(delay).fadeOut(1000, function(){ $(this).remove()});
	}

}

function checkResolution() {
	maxCols = $('body').css('content');
	if (maxCols != window.lastColsCheck) {
		sendAlert('info', 'Max font at this resolution: ' + maxCols);
		window.lastColsCheck = maxCols;
	}
}

// IE8 Polyfill

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}