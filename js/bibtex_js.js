// Issues:
//  no comment handling within strings
//  no string concatenation
//  no variable values yet

// Grammar implemented here:
//  bibtex -> (string | preamble | comment | entry)*;
//  string -> '@STRING' '{' key_equals_value '}';
//  preamble -> '@PREAMBLE' '{' value '}';
//  comment -> '@COMMENT' '{' value '}';
//  entry -> '@' key '{' key ',' key_value_list '}';
//  key_value_list -> key_equals_value (',' key_equals_value)*;
//  key_equals_value -> key '=' value;
//  value -> value_quotes | value_braces | key;
//  value_quotes -> '"' .*? '"'; // not quite
//  value_braces -> '{' .*? '"'; // not quite
function BibtexParser() {
  this.pos = 0;
  this.input = "";
  
  this.entries = {};
  this.strings = {
      JAN: "January",
      FEB: "February",
      MAR: "March",      
      APR: "April",
      MAY: "May",
      JUN: "June",
      JUL: "July",
      AUG: "August",
      SEP: "September",
      OCT: "October",
      NOV: "November",
      DEC: "December"
  };
  this.currentKey = "";
  this.currentEntry = "";
  

  this.setInput = function(t) {
    this.input = t;
  }
  
  this.getEntries = function() {
      return this.entries;
  }

  this.isWhitespace = function(s) {
    return (s == ' ' || s == '\r' || s == '\t' || s == '\n');
  }

  this.match = function(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) == s) {
      this.pos += s.length;
    } else {
      throw "Token mismatch, expected " + s + ", found " + this.input.substring(this.pos);
    }
    this.skipWhitespace();
  }

  this.tryMatch = function(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) == s) {
      return true;
    } else {
      return false;
    }
    this.skipWhitespace();
  }

  this.skipWhitespace = function() {
    while (this.isWhitespace(this.input[this.pos])) {
      this.pos++;
    }
    if (this.input[this.pos] == "%") {
      while(this.input[this.pos] != "\n") {
        this.pos++;
      }
      this.skipWhitespace();
    }
  }

  this.value_braces = function() {
    var bracecount = 0;
    this.match("{");
    var start = this.pos;
    while(true) {
      if (this.input[this.pos] == '}' && this.input[this.pos-1] != '\\') {
        if (bracecount > 0) {
          bracecount--;
        } else {
          var end = this.pos;
          this.match("}");
          return this.input.substring(start, end);
        }
      } else if (this.input[this.pos] == '{') {
        bracecount++;
      } else if (this.pos == this.input.length-1) {
        throw "Unterminated value";
      }
      this.pos++;
    }
  }

  this.value_quotes = function() {
    this.match('"');
    var start = this.pos;
    while(true) {
      if (this.input[this.pos] == '"' && this.input[this.pos-1] != '\\') {
          var end = this.pos;
          this.match('"');
          return this.input.substring(start, end);
      } else if (this.pos == this.input.length-1) {
        throw "Unterminated value:" + this.input.substring(start);
      }
      this.pos++;
    }
  }
  
  this.single_value = function() {
    var start = this.pos;
    if (this.tryMatch("{")) {
      return this.value_braces();
    } else if (this.tryMatch('"')) {
      return this.value_quotes();
    } else {
      var k = this.key();
      if (this.strings[k.toUpperCase()]) {
        return this.strings[k];
      } else if (k.match("^[0-9]+$")) {
        return k;
      } else {
        throw "Value expected:" + this.input.substring(start);
      }
    }
  }
  
  this.value = function() {
    var values = [];
    values.push(this.single_value());
    while (this.tryMatch("#")) {
      this.match("#");
      values.push(this.single_value());
    }
    return values.join("");
  }

  this.key = function() {
    var start = this.pos;
    while(true) {
      if (this.pos == this.input.length) {
        throw "Runaway key";
      }
    
      if (this.input[this.pos].match("[a-zA-Z0-9_:\\./-]")) {
        this.pos++
      } else {
        return this.input.substring(start, this.pos).toUpperCase();
      }
    }
  }

  this.key_equals_value = function() {
    var key = this.key();
    if (this.tryMatch("=")) {
      this.match("=");
      var val = this.value();
      return [ key, val ];
    } else {
      throw "... = value expected, equals sign missing:" + this.input.substring(this.pos);
    }
  }

  this.key_value_list = function() {
    var kv = this.key_equals_value();
    this.entries[this.currentEntry][kv[0]] = kv[1];
    while (this.tryMatch(",")) {
      this.match(",");
      // fixes problems with commas at the end of a list
      if (this.tryMatch("}")) {
        break;
      }
      kv = this.key_equals_value();
      this.entries[this.currentEntry][kv[0]] = kv[1];
    }
  }

  this.entry_body = function(type) {
    this.currentEntry = this.key();
    this.entries[this.currentEntry] = new Object();
    this.entries[this.currentEntry]["TYPE"] = type.toUpperCase();
    this.entries[this.currentEntry]["URL"] = '';
    this.match(",");
    this.key_value_list();
  }

  this.directive = function () {
    this.match("@");
    return "@"+this.key();
  }

  this.string = function () {
    var kv = this.key_equals_value();
    this.strings[kv[0].toUpperCase()] = kv[1];
  }

  this.preamble = function() {
    this.value();
  }

  this.comment = function() {
    this.value(); // this is wrong
  }

  this.entry = function(type) {
    this.entry_body(type);
  }

  this.bibtex = function() {
    while(this.tryMatch("@")) {
      var d = this.directive().toUpperCase();
      this.match("{");
      if (d == "@STRING") {
        this.string();
      } else if (d == "@PREAMBLE") {
        this.preamble();
      } else if (d == "@COMMENT") {
        this.comment();
      } else {
        this.entry(d);
      }
      this.match("}");
    }
  }
}

function BibtexDisplay() {
  this.fixValue = function (value) {
    value = value.replace(/\\glqq\s?/g, "&bdquo;");
    value = value.replace(/\\grqq\s?/g, '&rdquo;');
    value = value.replace(/\\ /g, '&nbsp;');
    value = value.replace(/\\url/g, '');
    value = value.replace(/---/g, '&mdash;');
    value = value.replace(/{\\"a}/g, '&auml;');
    value = value.replace(/\{\\"o\}/g, '&ouml;');
    value = value.replace(/{\\"u}/g, '&uuml;');
    value = value.replace(/{\\"A}/g, '&Auml;');
    value = value.replace(/{\\"O}/g, '&Ouml;');
    value = value.replace(/{\\"U}/g, '&Uuml;');
    value = value.replace(/\\ss/g, '&szlig;');
    value = value.replace(/\{(.*?)\}/g, '$1');
    return value;
  }

  this.displayBibtex = function(input, output) {
    // parse bibtex input
    var b = new BibtexParser();
    b.setInput(input);
    b.bibtex();
    // save old entries to remove them later
    var old = output.find("*");    

    // iterate over bibTeX entries
    var entries = b.getEntries();
    
    var categories = [];
    categories['catpaper']   = 0;
    categories['catjournal'] = 0;
    categories['catbook']    = 0;
    var categories_text = [];
    categories_text['catpaper']   = 'Conference Papers';
    categories_text['catjournal'] = 'International Journals';
    categories_text['catbook']    = 'Books';
    var style_text = [];
    style_text['catpaper']   = 'green-link';
    style_text['catjournal']   = 'blue-link';
    style_text['catbook']   = 'yellow-link';
    
    for (var entryKey in entries) {
      var entry = entries[entryKey];
            
//       // find all keys in the entry
//       var keys = [];
//       for (var key in entry) {
//         keys.push(key.toUpperCase());
//       }
// 
// 	alert(entryKey);
	var headentry = '<div style="width:100%" class="panel panel-default mix '
	var pubentry = '<div class="panel-heading" data-toggle="collapse" href="#'+entryKey+'">';
	var type = entry['TYPE'];
	var bibGenEntry = '';
	var bibURL = entry['URL'];
	if (type.toUpperCase() == "@INPROCEEDINGS") {
	  categories['catpaper'] = categories['catpaper'] + 1;
	  //REQUIRED FIELDS: author, title, booktitle, year
	  var author     = entry['AUTHOR'];
	  var title      = entry['TITLE'];
	  var booktitle  = entry['BOOKTITLE'];
	  var year       = entry['YEAR'];
	  bibGenEntry = type.toLowerCase() + '{'+entryKey.toLowerCase() +',\n author = {' + author + '},\n title={'+title+'},\n';
	  bibGenEntry = bibGenEntry + ' booktitle={'+booktitle+'},\n year={'+year+'}\n}';
	  headentry = headentry + 'catpaper" data-myorder="' + year + '">'
	  pubentry = pubentry + '<span class="label label-success">Conference Paper</span>';
// 	  pubentry = pubentry + '<div class="ribbon-green">Conference</div>';
	  pubentry = pubentry + '<div class="pub_title">' + this.fixValue(title) + '.</div><div class="pub_authors">' + this.fixValue(author) + '</div><div class="pub_place">' + this.fixValue(booktitle) + ', ' + year + '</div>';
	} else if (type.toUpperCase() == "@ARTICLE") {
	  categories['catjournal'] = categories['catjournal'] + 1;
	   //REQUIRED FIELDS: author, title, journal, year
	  var author   = entry['AUTHOR'];
	  var title    = entry['TITLE'];
	  var journal  = entry['JOURNAL'];
	  var year     = entry['YEAR'];
	  bibGenEntry = type.toLowerCase() + '{'+entryKey.toLowerCase() +',\n author = {' + author + '},\n title={'+title+'},\n';
	  bibGenEntry = bibGenEntry + ' journal={'+journal+'},\n year={'+year+'}\n}';
	  headentry = headentry + 'catjournal" data-myorder="' + year + '">'
	  pubentry = pubentry + '<span class="label label-primary">Journal Paper</span>';
	  pubentry = pubentry + '<div class="pub_title">' + this.fixValue(title) + '.</div><div class="pub_authors">' + this.fixValue(author) + '</div><div class="pub_place">' + this.fixValue(journal) + ', ' + year + '</div>';
// 	  pubentry = pubentry + this.fixValue(author) + ', ' + this.fixValue(title) + ', ' + this.fixValue(journal) + ', ' + year;
	} else if (type.toUpperCase() == "@BOOK") {
	  categories['catbook'] = categories['catbook'] + 1;
	   //REQUIRED FIELDS: author, title, publisher, year
	  var author     = entry['AUTHOR'];
	  var title      = entry['TITLE'];
	  var publisher  = entry['PUBLISHER'];
	  var year       = entry['YEAR'];
	  bibGenEntry = type.toLowerCase() + '{'+entryKey.toLowerCase() +',\n author = {' + author + '},\n title={'+title+'},\n';
	  bibGenEntry = bibGenEntry + ' publisher={'+publisher+'},\n year={'+year+'}\n}';
	  headentry = headentry + 'catbook" data-myorder="' + year + '">'
	  pubentry = pubentry + '<span class="label label-warning">Book</span>';
	  pubentry = pubentry + '<div class="pub_title">' + this.fixValue(title) + '.</div><div class="pub_authors">' + this.fixValue(author) + '</div><div class="pub_place">' + this.fixValue(publisher) + ', ' + year + '</div>';
// 	  pubentry = pubentry + this.fixValue(author) + ', ' + this.fixValue(title) + ', ' + this.fixValue(publisher) + ', ' + year;
	} else {
	   alert(type + " is not implemented!");
	}
	
// 	bibGenEntry = bibGenEntry.replace(/\(/g, "%28");
// 	bibGenEntry = bibGenEntry.replace(/\)/g, "%29");
	bibGenEntry = encodeURIComponent(bibGenEntry);
	
	// TODO check link & download
	//http://spin.atomicobject.com/2014/02/05/generate-files-javascript-ember-js/
	pubentry = pubentry + '<ul class="list-inline pub_buttons"><li>',
	pubentry = pubentry + '<a download="'+ entryKey.toLowerCase() +'.bib" href="data:text/plain;charset=UTF-8,'+ bibGenEntry +'">';
	pubentry = pubentry + '<span class="pub_button glyphicon glyphicon-cloud-download" data-toggle="tooltip" title="Download BibTeX" ></span></a></li>';
	if (bibURL != '') {
	pubentry = pubentry + '<li><a href="'+bibURL+'"><span class="pub_button glyphicon glyphicon-link" data-toggle="tooltip" title="External link" ></span></a></li>';
	}
	pubentry = pubentry + '<li><span class="collapse_button glyphicon glyphicon-collapse-down active"></span></li></ul>';
	pubentry = pubentry + '</div>';
	pubentry = pubentry + '<div id="'+entryKey+'" class="panel-collapse collapse pub_collapse"><div class="panel-body"><h1>Abstract</h1><p class="text-justify">'+entry['ABSTRACT']+'</p></div></div></div>';
	  
// 	alert(pubentry);
	$("#PubList").append(headentry+pubentry);
    }
    
    
    for (var catKey in categories) {
      var entry = categories[catKey];
      if (entry > 0) {
// 	$("#catfilters").append('<option value=".' + catKey + '">' + categories_text[catKey] + '</option>');
// 	$(".typeFilter").append('<button type="button" class="btn btn-default btn-lg '+style_text[catKey]+' filter" data-filter=".'+catKey+'">'+ categories_text[catKey].toUpperCase() +'</button>');
	$(".typeFilterCollapse").append('<li class="'+style_text[catKey]+' filter" data-filter=".'+catKey+'">'+ categories_text[catKey].toUpperCase() +'</li>');
      }
    }
  $('#PubList').mixItUp(); 
    
  }

}

function bibtex_js_draw() {
  (new BibtexDisplay()).displayBibtex($("#bibtex_input").val(), $("#bibtex_display"));
}
