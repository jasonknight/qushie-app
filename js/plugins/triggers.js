var Triggers = {
	id: "Aardwolf_Triggers",
	search_keyword: '',
	page: 1,
	per_page: 7,
};
Triggers.defined_triggers = [];
Triggers.matches = function (trigger,str) {
	try {
		var re = new RegExp(trigger.match);
		var m = re.exec(str);
		// console.log("m is: ", m, " matching against ", trigger.match,str);
		if ( m == null ) {
			return false;
		} else {
			return m;
		}
	} catch (err) {
		// console.log("Error: ", err);
		Qushie.emit("trigger_regex_error",err);
		return false;
	}
}
Triggers.new = function (trigger) {
	$('#TriggerListFrame').hide();
	var frame = $('#TriggerNewFrame');
	frame.html(' ');
	frame.show();
	if ( ! trigger ) {
		trigger = {
			id: null,
			match: '',
			enabled: false,
			html: false,
			cont: true,
			send: '',
			group: '',
			times_called: 0,
			test_match: '',
		};
	}
	if ( ! trigger.test_match ) {
		trigger.test_match = '';
	}
	frame.data('trigger',trigger);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<input id='NewTriggerMatch' type='text' placeholder='Match' />"
			})
		})
	);
	$('#NewTriggerMatch').on('keyup',function () {
		var trigger = frame.data('trigger');
		trigger.match = $('#NewTriggerMatch').val();
		$('#NewTriggerTestMatch').trigger('keyup');
	});
	$('#NewTriggerMatch').val(trigger.match);
	frame.append(
		Qushie.row({ content:
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<input id='NewTriggerEnable' type='checkbox'  />"
			}) +
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewTriggerHTML' type='checkbox'  />"
			}) + 
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewTriggerStop' type='checkbox'  />"
			}) +   
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<input id='NewTriggerSequence' type='text' placeholder='Sequence' />"
			}) +
			Qushie.column({
				small_columns: 5,
				large_columns: 5,
				content: "<input id='NewTriggerGroup' type='text' placeholder='Groupname' />"
			})
		})
	);
	$('#NewTriggerGroup').on('keyup',function () {
		var trigger = frame.data('trigger');
		trigger.group = $('#NewTriggerGroup').val();
	})
	$('#NewTriggerGroup').val(trigger.group);
	$('#NewTriggerSequence').on('keyup',function () {
		var trigger = frame.data('trigger');
		trigger.sequence = parseInt($('#NewTriggerSequence').val());
	});
	$('#NewTriggerSequence').val(trigger.sequence);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<textarea id='NewTriggerOutput' placeholder='Command' rows='10'></textarea>"
			})
		})
	);
	$('#NewTriggerOutput').on('keyup',function () {
		var trigger = frame.data('trigger');
		trigger.send = $('#NewTriggerOutput').val();
	});
	$('#NewTriggerOutput').val(trigger.send);

	frame.append(
		Qushie.row({ classes: 'collapse', content: 
			Qushie.column({
				small_columns: 20,
				large_columns: 20,
				content: "<input id='NewTriggerTestMatch' type='text' placeholder='Test the match' />"
			}) +
			Qushie.column({
				small_columns: 4,
				large_columns: 4,
				content: "<span id='NewTriggerTestMatching' class='postfix radius button alert'>Failed</span>"
			})
		})
	);
	$('#NewTriggerTestMatch').val(trigger.test_match);
	$('#NewTriggerTestMatch').on('keyup',function() {
		trigger.test_match = $('#NewTriggerTestMatch').val();
		$('#NewTriggerTestMatching').removeClass('alert');
		$('#NewTriggerTestMatching').removeClass('success');
		if ( Triggers.matches(trigger,trigger.test_match) ) {
			$('#NewTriggerTestMatching').addClass('success');
			$('#NewTriggerTestMatching').html("Success");
		} else {
			$('#NewTriggerTestMatching').addClass('alert');
			$('#NewTriggerTestMatching').html("Failed");
		}
	});
	Qushie.connect('trigger_regex_error','Triggers_NewRegexError',0,function () {
		setTimeout(function () {
			$('#NewTriggerTestMatching').html("Bad Regex");
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
				content: "<div id='NewTriggerSave' class='button small'>Save</div>"
			})
		})
	);
	// console.log(trigger);
	Qushie.toggle('NewTriggerEnable',trigger,'enabled');
	Qushie.toggle('NewTriggerHTML',trigger,'html',{on_label: 'HTML', off_label: 'Plain'});
	Qushie.toggle('NewTriggerStop',trigger,'cont',{on_label: 'Cont',off_label: 'Stop'});
	$('#NewTriggerSave').on('click',function () {
		var trigger = frame.data('trigger');
		for ( var i in Triggers.defined_triggers ) {
			var da = Triggers.defined_triggers[i];
			if ( da.id == trigger.id ) {
				da = trigger;
				Triggers.save();
				Triggers.list();
				return;
			}
		}
		trigger.id = Triggers.defined_triggers.length;
		Triggers.defined_triggers.push(trigger);
		Triggers.save();
		Triggers.list();
	});
	$('#NewTriggerTestMatch').trigger("keyup");
}
Triggers.save = function () {
	// console.log("Saving Triggers: ", Triggers.defined_triggers);
	var f = Qushie.createFileObject();
	f.putContents("triggers.json", JSON.stringify(Triggers.defined_triggers,undefined,4));
}
Triggers.list = function () {
	var frame = $('#TriggerListFrame'); 
	$('#TriggerNewFrame').hide();
	frame.html('');
	frame.show();
	var start;
	var end;
	if ( Triggers.page == 1 ) {
		start = 0;
	} else {
		start = Triggers.per_page * (Triggers.page - 1);
	}
	end = start + Triggers.per_page;
	if ( start >= Triggers.defined_triggers.length ) {
		Triggers.page = 1;
		start = 0;
		end = start + Triggers.per_page;
	}
	for ( var i = start; i < end; i++) {
		var the_trigger = Triggers.defined_triggers[i];
		if ( ! the_trigger ) {
			break;
		}
		if ( Triggers.search_keyword.length >= 3) {
			if ( the_trigger.match.indexOf(Triggers.search_keyword) == -1 && the_trigger.group.indexOf(Triggers.search_keyword) == -1) {
				continue;
			}
		}
		// We do this because of scope binding for
		// closures in JS, we lose the value of trigger
		// otherwise.
		(function (trigger) {
			// console.log("Trigger: ",trigger);
			frame.append(
				Qushie.row({ content: 
					Qushie.column({
						small_columns: 6,
						large_columns: 6,
						content: "<input id='ListTriggerMatch_"+trigger.id+"' type='text' placeholder='Match' value='"+trigger.match+"' />"
					}) +
					Qushie.column({
						small_columns: 4,
						large_columns: 4,
						content: "<input id='ListTriggerEnable_"+trigger.id+"' type='checkbox'  />"
					})  +
					Qushie.column({
						small_columns: 6,
						large_columns: 6,
						content: "<input id='ListTriggerGroup_"+trigger.id+"' type='text' placeholder='NoGroup' value='"+trigger.group+"' />"
					}) +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<input type='text' disabled value='" + trigger.times_called + "' />"
					})  +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<div id='ListTriggerEditButton_"+trigger.id+"' class='button small'>Edit</div>"
					}) +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<div id='ListTriggerDeleteButton_"+trigger.id+"' class='button small alert'>Delete</div>"
					}) +
					Qushie.column({
						small_columns: 1,
						large_columns: 1,
						content: ""
					})
				})
			);
			
			try {
				$("#ListTriggerEnable_"+trigger.id).data('trigger',trigger);
				$("#ListTriggerMatch_"+trigger.id).data('trigger',trigger).on('keyup', function () {
					// console.log("keyup called")
					var a = $(this).data('trigger');
					a.match = $(this).val();
					Triggers.save();
				});
				$("#ListTriggerGroup_"+trigger.id).data('trigger',trigger).on('keyup', function () {
					var a = $(this).data('trigger');
					a.group = $(this).val();
					Triggers.save();
				});
				Qushie.toggle("ListTriggerEnable_"+trigger.id,trigger,"enabled", null, function () {
					// console.log("Callback Called");
					Triggers.save();
				});
				$('#ListTriggerEditButton_'+ trigger.id).on('click',function () {
					Triggers.new(trigger);
					Triggers.save();
				});
				$('#ListTriggerDeleteButton_'+ trigger.id).on('click',function () {
					Triggers.remove(trigger);
					Triggers.list();
				});
			} catch (err) {
				// console.log(err);
			}
		})(the_trigger);
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
				content: '<div id="ListTriggerPrevPageButton" class="button small">Previous</div>' 
			}) +
			Qushie.column({
				large_columns: 4, small_columns: 4,
				content: '<div id="ListTriggerNextPageButton" class="button small">Next</div>' 
			}) +
			Qushie.column({
				large_columns: 8, small_columns: 8,
				content: '&nbsp;'
			})
		})
	);
	$('#ListTriggerNextPageButton').on('click', function () {
		Triggers.page++;
		Triggers.list();
	});
	$('#ListTriggerPrevPageButton').on('click', function () {
		Triggers.page--;
		if ( Triggers.page < 1 ) {
			Triggers.page = 1;
		}
		Triggers.list();
	});
}
Triggers.remove = function (the_trigger) {
	var new_triggers = [];
	for ( var i = 0; i < Triggers.defined_triggers.length; i++ ) {
		var trigger = Triggers.defined_triggers[i];
		if ( the_trigger.id != trigger.id ) {
			new_triggers.push(trigger);
		}
	}
	Triggers.defined_triggers = new_triggers;
	Triggers.save();
}
Qushie.connect('after_render_tabs','aardwolf_telnet_triggers_show_frames', 0, function () {
	var mytab = $('#Aardwolf_Trigger_Tab_Content');
	if ( ! mytab.length == 0 ) {
		if ( Triggers.defined_triggers.length == 0) {
			Triggers.new();
		} else {
			Triggers.list();
		}
	}
});
Qushie.connect('set_active_tab','aardwolf_telnet_triggers_show_frames', 0, function () {
	setTimeout(function () {
		var mytab = $('#Aardwolf_Trigger_Tab_Content');
		if ( ! mytab.length == 0 ) {
			if ( Triggers.defined_triggers.length == 0) {
				Triggers.new();
			} else {
				Triggers.list();
			}
			$('#SearchTriggers').unbind();
			$('#SearchTriggers').on('keyup', function () {
				Triggers.search_keyword = $('#SearchTriggers').val();
				if ( Triggers.search_keyword.length >= 3) {
					Triggers.list();
				} else if (Triggers.search_keyword.length == 0) {
					Triggers.list();
				}
				
			});
		}
	},150);
});
Qushie.addFilter('aardwolf_telnet_tabs','aardwolf_telnet_trigger_tab',0,function (tabs) {
	for ( i in tabs ) {
		var tab = tabs[i]
		if ( tab.id == "Aardwolf_Trigger_Tab") {
			return tabs;
		}
	}
	var f = Qushie.createFileObject();
	var txt = f.getContents("triggers.json");
	if ( txt.length > 0 ) {
		eval("Triggers.defined_triggers = " + txt + ";");
	}
	
	tabs.push({
		name: "Triggers",
		id: "Aardwolf_Trigger_Tab",
		active_tab_key: "aard_tab",
		active: true,
		content: function () {
			
			return Qushie.row({ 

						content: Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewTriggerButton" class="button small" onClick="Triggers.list();">List</div>'
							}) +
							Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewTriggerButton" class="button small" onClick="Triggers.new();">New</div>'
							}) +
							Qushie.column({
								large_columns: 16, small_columns: 16,
								content: Qushie.row({
									classes: "collapse",
									content: Qushie.column({ 
										large_columns: 22, small_columns: 22,
										content: '<input type="text" id="SearchTriggers" placeholder="Search" />'
									}) +
									Qushie.column({ 
										large_columns: 2, small_columns: 2,
										content: '<div id="SearchTriggersButton" class="button postfix radius">Find</div>'
									})
								})
							})   
				    }) +
				   '<div id="TriggerNewFrame" style="display:none;"></div>' + 
				   '<div id="TriggerListFrame"></div>' + 
				   '<style type="text/css">#NewTriggerOutput {height: 10em;}</style>';
		},
		after_content: function () {

		}
	});
	return tabs;
});

Qushie.addFilter('aardwolf_html_produced','trigger_aardwolf_cmd_entered',0,function (the_text) {
	// console.log("TRIGGERS: Executing");
	for ( var i = 0; i < Triggers.defined_triggers.length; i++ ) {
		var the_trigger = Triggers.defined_triggers[i];
		var tmp_text = the_text;
		if ( the_trigger.html != true ) {
			tmp_text = Qushie.stripHTML(the_text);
		}
		// console.log("The tmp_text is: ", tmp_text)
		var lines = tmp_text.split("\n");
		for ( var j in lines ) {
			var line = lines[j];
			if ( the_trigger.enabled == true && Triggers.matches(the_trigger,line) ) {
				try {
					eval(the_trigger.send);
				} catch (err) {
					// console.log(err);
				}
				if ( the_trigger.cont ) {
					continue;
				} else {
					break;
				}
			} else {
				// console.log("TRIGGER:", the_trigger, " does not match ", line);
			}
		}
	}
	return the_text;
});