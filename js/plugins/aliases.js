var Aliases = {
	id: "Aardwolf_Aliases",
	search_keyword: '',
	page: 1,
	per_page: 7,
};
Aliases.defined_aliases = [];
Aliases.matches = function (alias,str) {
	try {
		var re = new RegExp(alias.match);
		var m = re.exec(str);
		// console.log("m is: ", m, " matching against ", alias.match,str);
		if ( m == null ) {
			return false;
		} else {
			return m;
		}
	} catch (err) {
		// console.log("Error: ", err);
		Qushie.emit("alias_regex_error",err);
		return false;
	}
}
Aliases.new = function (alias) {
	$('#AliasListFrame').hide();
	var frame = $('#AliasNewFrame');
	frame.html(' ');
	frame.show();
	if ( ! alias ) {
		alias = {
			id: null,
			match: '',
			enabled: false,
			script: false,
			cont: true,
			send: '',
			group: '',
			times_called: 0,
			test_match: '',
		};
	}
	if ( ! alias.test_match ) {
		alias.test_match = '';
	}
	frame.data('alias',alias);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<input id='NewAliasMatch' type='text' placeholder='Match' />"
			})
		})
	);
	$('#NewAliasMatch').on('keyup',function () {
		var alias = frame.data('alias');
		alias.match = $('#NewAliasMatch').val();
		$('#NewAliasTestMatch').trigger('keyup');
	});
	$('#NewAliasMatch').val(alias.match);
	frame.append(
		Qushie.row({ content:
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<input id='NewAliasEnable' type='checkbox'  />"
			}) +
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewAliasScript' type='checkbox'  />"
			}) + 
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewAliasStop' type='checkbox'  />"
			}) +   
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<input id='NewAliasSequence' type='text' placeholder='Sequence' />"
			}) +
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewAliasGroup' type='text' placeholder='Groupname' />"
			})
		})
	);
	$('#NewAliasGroup').on('keyup',function () {
		var alias = frame.data('alias');
		alias.group = $('#NewAliasGroup').val();
	})
	$('#NewAliasGroup').val(alias.group);
	$('#NewAliasSequence').on('keyup',function () {
		var alias = frame.data('alias');
		alias.sequence = parseInt($('#NewAliasSequence').val());
	});
	$('#NewAliasSequence').val(alias.sequence);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<div id='NewAliasOutputScript' style='margin-bottom: 20px;font-size: 14px;font-family: monospace; display:none;width: 100%;min-height: 300px'></div><textarea id='NewAliasOutput' placeholder='Command' rows='10'></textarea>"
			})
		})
	);
	$('#NewAliasOutput').on('keyup',function () {
		var alias = frame.data('alias');
		alias.send = $('#NewAliasOutput').val();
	});
	$('#NewAliasOutput').val(alias.send);

	frame.append(
		Qushie.row({ classes: 'collapse', content: 
			Qushie.column({
				small_columns: 20,
				large_columns: 20,
				content: "<input id='NewAliasTestMatch' type='text' placeholder='Test the match' />"
			}) +
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<span id='NewAliasTestMatching' class='postfix radius button alert'>Failed</span>"
			})
		})
	);
	$('#NewAliasTestMatch').val(alias.test_match);
	$('#NewAliasTestMatch').on('keyup',function() {
		alias.test_match = $('#NewAliasTestMatch').val();
		$('#NewAliasTestMatching').removeClass('alert');
		$('#NewAliasTestMatching').removeClass('success');
		if ( Aliases.matches(alias,alias.test_match) ) {
			$('#NewAliasTestMatching').addClass('success');
			$('#NewAliasTestMatching').html("Success");
		} else {
			$('#NewAliasTestMatching').addClass('alert');
			$('#NewAliasTestMatching').html("Failed");
		}
	});
	Qushie.connect('alias_regex_error','Aliases_NewRegexError',0,function () {
		setTimeout(function () {
			$('#NewAliasTestMatching').html("Bad Regex");
		},150);
	});
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 22,
				large_columns: 22,
				content: ""
			}) +
			Qushie.column({
				small_columns: 2,
				large_columns: 2,
				content: "<div id='NewAliasSave' class='button small'>Save</div>"
			})
		})
	);
	// console.log(alias);
	Qushie.toggle('NewAliasEnable',alias,'enabled');
	Qushie.toggle('NewAliasScript',alias,'script',{on_label: 'Script', off_label: 'Plain'}, function () {
		if ( $('#NewAliasScript').is(':checked') ) {
			$('#NewAliasOutputScript').show();
			$('#NewAliasOutput').hide();
			var editor = ace.edit("NewAliasOutputScript");
		    editor.getSession().setMode("ace/mode/javascript");
		    setTimeout(function ( ) {
		    	editor.resize();
		    	editor.setHighlightActiveLine(false);
		    	editor.getSession().setTabSize(4);
		    	editor.setTheme("ace/theme/twilight");
		    	editor.setShowPrintMargin(false);
		    	editor.setValue($('#NewAliasOutput').val(),0);
		    	editor.on('change',function (o) {
		    		$('#NewAliasOutput').val(editor.getValue());
		    	});
		    },100);
		} else {
			$('#NewAliasOutputScript').hide();
			$('#NewAliasOutput').show();
		}
		
	});
	Qushie.toggle('NewAliasStop',alias,'cont',{on_label: 'Cont',off_label: 'Stop'});
	$('#NewAliasSave').on('click',function () {
		var alias = frame.data('alias');
		for ( var i in Aliases.defined_aliases ) {
			var da = Aliases.defined_aliases[i];
			if ( da.id == alias.id ) {
				da = alias;
				Aliases.save();
				Aliases.list();
				return;
			}
		}
		alias.id = Aliases.defined_aliases.length;
		Aliases.defined_aliases.push(alias);
		Aliases.save();
		Aliases.list();
	});
	$('#NewAliasTestMatch').trigger("keyup");
}
Aliases.save = function () {
	// console.log("Saving Aliases: ", Aliases.defined_aliases);
	var f = Qushie.createFileObject();
	f.putContents("aliases.json", JSON.stringify(Aliases.defined_aliases,undefined,4));
}
Aliases.list = function () {
	var frame = $('#AliasListFrame'); 
	$('#AliasNewFrame').hide();
	frame.html('');
	frame.show();
	var start;
	var end;
	if ( Aliases.page == 1 ) {
		start = 0;
	} else {
		start = Aliases.per_page * (Aliases.page - 1);
	}
	end = start + Aliases.per_page;
	if ( start >= Aliases.defined_aliases.length ) {
		Aliases.page = 1;
		start = 0;
		end = start + Aliases.per_page;
	}
	for ( var i = start; i < end; i++) {
		var the_alias = Aliases.defined_aliases[i];
		if ( ! the_alias ) {
			break;
		}
		if ( Aliases.search_keyword.length >= 3) {
			if ( the_alias.match.indexOf(Aliases.search_keyword) == -1 && the_alias.group.indexOf(Aliases.search_keyword) == -1) {
				continue;
			}
		}
		// We do this because of scope binding for
		// closures in JS, we lose the value of alias
		// otherwise.
		(function (alias) {
			// console.log("Alias: ",alias);
			frame.append(
				Qushie.row({ content: 
					Qushie.column({
						small_columns: 6,
						large_columns: 6,
						content: "<input id='ListAliasMatch_"+alias.id+"' type='text' placeholder='Match' value='"+alias.match+"' />"
					}) +
					Qushie.column({
						small_columns: 4,
						large_columns: 4,
						content: "<input id='ListAliasEnable_"+alias.id+"' type='checkbox'  />"
					})  +
					Qushie.column({
						small_columns: 6,
						large_columns: 6,
						content: "<input id='ListAliasGroup_"+alias.id+"' type='text' placeholder='NoGroup' value='"+alias.group+"' />"
					}) +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<input type='text' disabled value='" + alias.times_called + "' />"
					})  +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<div id='ListAliasEditButton_"+alias.id+"' class='button small'>Edit</div>"
					}) +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<div id='ListAliasDeleteButton_"+alias.id+"' class='button small alert'>Delete</div>"
					}) +
					Qushie.column({
						small_columns: 1,
						large_columns: 1,
						content: ""
					})
				})
			);
			
			try {
				$("#ListAliasEnable_"+alias.id).data('alias',alias);
				$("#ListAliasMatch_"+alias.id).data('alias',alias).on('keyup', function () {
					// console.log("keyup called")
					var a = $(this).data('alias');
					a.match = $(this).val();
					Aliases.save();
				});
				$("#ListAliasGroup_"+alias.id).data('alias',alias).on('keyup', function () {
					var a = $(this).data('alias');
					a.group = $(this).val();
					Aliases.save();
				});
				Qushie.toggle("ListAliasEnable_"+alias.id,alias,"enabled", null, function () {
					// console.log("Callback Called");
					Aliases.save();
				});
				$('#ListAliasEditButton_'+ alias.id).on('click',function () {
					Aliases.new(alias);
					Aliases.save();
				});
				$('#ListAliasDeleteButton_'+ alias.id).on('click',function () {
					Aliases.remove(alias);
					Aliases.list();
				});
			} catch (err) {
				// console.log(err);
			}
		})(the_alias);
	}
	// Now we need to paginate.
	frame.append(
		Qushie.row({
			content: Qushie.column({
				large_columns: 8, small_columns: 8,
				content: '&nbsp;'
			}) +
			Qushie.column({
				large_columns: 4, small_columns: 4,
				content: '<div id="ListAliasPrevPageButton" class="button small">Previous</div>' 
			}) +
			Qushie.column({
				large_columns: 4, small_columns: 4,
				content: '<div id="ListAliasNextPageButton" class="button small">Next</div>' 
			}) +
			Qushie.column({
				large_columns: 8, small_columns: 8,
				content: '&nbsp;'
			})
		})
	);
	$('#ListAliasNextPageButton').on('click', function () {
		Aliases.page++;
		Aliases.list();
	});
	$('#ListAliasPrevPageButton').on('click', function () {
		Aliases.page--;
		if ( Aliases.page < 1 ) {
			Aliases.page = 1;
		}
		Aliases.list();
	});
}
Aliases.remove = function (the_alias) {
	var new_aliases = [];
	for ( var i = 0; i < Aliases.defined_aliases.length; i++ ) {
		var alias = Aliases.defined_aliases[i];
		if ( the_alias.id != alias.id ) {
			new_aliases.push(alias);
		}
	}
	Aliases.defined_aliases = new_aliases;
	Aliases.save();
}
Qushie.connect('after_render_tabs','aardwolf_telnet_aliases_show_frames', 0, function () {
	var mytab = $('#Aardwolf_Alias_Tab_Content');
	if ( ! mytab.length == 0 ) {
		if ( Aliases.defined_aliases.length == 0) {
			Aliases.new();
		} else {
			Aliases.list();
		}
	}
});
Qushie.connect('set_active_tab','aardwolf_telnet_aliases_show_frames', 0, function () {
	setTimeout(function () {
		var mytab = $('#Aardwolf_Alias_Tab_Content');
		if ( ! mytab.length == 0 ) {
			if ( Aliases.defined_aliases.length == 0) {
				Aliases.new();
			} else {
				Aliases.list();
			}
			$('#SearchAliases').unbind();
			$('#SearchAliases').on('keyup', function () {
				Aliases.search_keyword = $('#SearchAliases').val();
				if ( Aliases.search_keyword.length >= 3) {
					Aliases.list();
				} else if (Aliases.search_keyword.length == 0) {
					Aliases.list();
				}
				
			});
		}
	},150);
});
Qushie.addFilter('aardwolf_telnet_tabs','aardwolf_telnet_alias_tab',0,function (tabs) {
	for ( i in tabs ) {
		var tab = tabs[i]
		if ( tab.id == "Aardwolf_Alias_Tab") {
			return tabs;
		}
	}
	var f = Qushie.createFileObject();
	var txt = f.getContents("aliases.json");
	if ( txt.length > 0 ) {
		eval("Aliases.defined_aliases = " + txt + ";");
	}
	
	tabs.push({
		name: "Aliases",
		id: "Aardwolf_Alias_Tab",
		active_tab_key: "aard_tab",
		active: true,
		content: function () {
			
			return Qushie.row({ 

						content: Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewAliasButton" class="button small" onClick="Aliases.list();">List</div>'
							}) +
							Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewAliasButton" class="button small" onClick="Aliases.new();">New</div>'
							}) +
							Qushie.column({
								large_columns: 16, small_columns: 16,
								content: Qushie.row({
									classes: "collapse",
									content: Qushie.column({ 
										large_columns: 22, small_columns: 22,
										content: '<input type="text" id="SearchAliases" placeholder="Search" />'
									}) +
									Qushie.column({ 
										large_columns: 2, small_columns: 2,
										content: '<div id="SearchAliasesButton" class="button postfix radius">Find</div>'
									})
								})
							})   
				    }) +
				   '<div id="AliasNewFrame" style="display:none;"></div>' + 
				   '<div id="AliasListFrame"></div>' + 
				   '<style type="text/css">#NewAliasOutput {height: 10em;}</style>';
		},
		after_content: function () {

		}
	});
	return tabs;
});

Qushie.addFilter('aardwolf_cmd_entered','alias_aardwolf_cmd_entered',0,function (the_cmd) {
	for ( var i = 0; i < Aliases.defined_aliases.length; i++ ) {
		var the_alias = Aliases.defined_aliases[i];
		var m = false;
		m = Aliases.matches(the_alias,the_cmd)
		if ( the_alias.enabled == true &&  m ) {
			if ( the_alias.script ) {
				try {
					console.log("Evaling: ", the_alias.send);
					eval(the_alias.send);
					return ''; // we don't send the origina command.
				} catch (err) {
					 console.log(err);
				}
			} else {
				// we replace the command.
				the_cmd = the_alias.send;
			}
			if ( the_alias.cont ) {
				continue;
			} else {
				break;
			}
		} else {
			console.log("Aliases: ", the_cmd, " does not match ", the_alias.match );
		}
	}
	// console.log("the_cmd is ",the_cmd);
	return the_cmd;
});