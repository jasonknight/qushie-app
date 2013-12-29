var QScripts = {
	id: "Aardwolf_QScripts",
	search_keyword: '',
	page: 1,
	per_page: 7,
};
QScripts.defined_qscripts = null;
QScripts.matches = function (qscript,str) {
	try {
		var re = new RegExp(qscript.name);
		var m = re.exec(str);
		// console.log("m is: ", m, " matching against ", qscript.name,str);
		if ( m == null ) {
			return false;
		} else {
			return m;
		}
	} catch (err) {
		// console.log("Error: ", err);
		Qushie.emit("QScripts.regex.error",err);
		return false;
	}
}
QScripts.new = function (qscript) {
	$('#QScriptListFrame').hide();
	var frame = $('#QScriptNewFrame');
	frame.html(' ');
	frame.show();
	if ( ! qscript ) {
		qscript = {
			id: null,
			name: '',
			enabled: false,
			send: '',
			group: '',
		};
	}
	if ( ! qscript.test_match ) {
		qscript.test_match = '';
	}
	frame.data('qscript',qscript);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<input id='NewQScriptName' type='text' placeholder='Name' />"
			})
		})
	);
	$('#NewQScriptName').on('keyup',function () {
		var qscript = frame.data('qscript');
		qscript.name = $('#NewQScriptName').val();
	});
	$('#NewQScriptName').val(qscript.name);
	frame.append(
		Qushie.row({ content:
			Qushie.column({
				small_columns: 7,
				large_columns: 7,
				content: "<input id='NewQScriptEnable' type='checkbox'  />"
			}) +
			Qushie.column({
				small_columns: 10,
				large_columns: 10,
				content: "<input id='NewQScriptGroup' type='text' placeholder='Groupname' />"
			})
		})
	);
	$('#NewQScriptGroup').on('keyup',function () {
		var qscript = frame.data('qscript');
		qscript.group = $('#NewQScriptGroup').val();
	})
	$('#NewQScriptGroup').val(qscript.group);
	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 24,
				large_columns: 24,
				content: "<div id='NewQScriptOutputScript' style='margin-bottom: 20px;font-size: 20px;font-family: monospace;width: 100%;min-height: 150px'></div><textarea id='NewQScriptOutput' placeholder='Command' rows='10' style='display:none;'></textarea>"
			})
		})
	);
	$('#NewQScriptOutput').on('keyup',function () {
		var qscript = frame.data('qscript');
		qscript.send = $('#NewQScriptOutput').val();
	});
	$('#NewQScriptOutput').val(qscript.send);

	frame.append(
		Qushie.row({ content: 
			Qushie.column({
				small_columns: 23,
				large_columns: 23,
				content: ""
			}) +
			Qushie.column({
				small_columns: 1,
				large_columns: 1,
				content: "<div id='NewQScriptSave' class='button tiny radius'>Save</div>"
			})
		})
	);
	// console.log(qscript);
	Qushie.toggle('NewQScriptEnable',qscript,'enabled');
	var editor = ace.edit("NewQScriptOutputScript");
    editor.getSession().setMode("ace/mode/javascript");

	var h = $('#Main').height();
	h = h * 0.70;
	$('#NewQScriptOutputScript').height(h);
	editor.resize();
	editor.setHighlightActiveLine(false);
	editor.getSession().setTabSize(4);
	editor.setTheme("ace/theme/twilight");
	editor.setShowPrintMargin(false);
	editor.setValue($('#NewQScriptOutput').val(),0);
	editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true
    });
	editor.on('change',function (o) {
		
		$('#NewQScriptOutput').val(editor.getValue());
		$('#NewQScriptOutput').trigger('keyup');
	});
   
	$('#NewQScriptSave').on('click',function () {
		var qscript = frame.data('qscript');
		for ( var i in QScripts.defined_qscripts ) {
			var da = QScripts.defined_qscripts[i];
			if ( da.id == qscript.id ) {
				da = qscript;
				try { eval(da.send); } catch (err) { Qushie.emit("QScripts.script.error",da); }
				QScripts.save();
				QScripts.list();
				return;
			}
		}
		qscript.id = QScripts.defined_qscripts.length;
		QScripts.defined_qscripts.push(qscript);
		QScripts.save();
		QScripts.list();
	});
	$('#NewQScriptTestMatch').trigger("keyup");
}
QScripts.save = function () {
	// console.log("Saving QScripts: ", QScripts.defined_qscripts);
	var f = Qushie.createFileObject();
	f.putContents("qscripts.json", JSON.stringify(QScripts.defined_qscripts,undefined,4));
}
QScripts.list = function () {
	var frame = $('#QScriptListFrame'); 
	$('#QScriptNewFrame').hide();
	frame.html('');
	frame.show();
	var start;
	var end;
	if ( QScripts.page == 1 ) {
		start = 0;
	} else {
		start = QScripts.per_page * (QScripts.page - 1);
	}
	end = start + QScripts.per_page;
	if ( start >= QScripts.defined_qscripts.length ) {
		QScripts.page = 1;
		start = 0;
		end = start + QScripts.per_page;
	}
	for ( var i = start; i < end; i++) {
		var the_qscript = QScripts.defined_qscripts[i];
		if ( ! the_qscript ) {
			break;
		}
		if ( QScripts.search_keyword.length >= 3) {
			if ( the_qscript.name.indexOf(QScripts.search_keyword) == -1 && the_qscript.group.indexOf(QScripts.search_keyword) == -1) {
				continue;
			}
		}
		// We do this because of scope binding for
		// closures in JS, we lose the value of qscript
		// otherwise.
		(function (qscript) {
			// console.log("QScript: ",qscript);
			frame.append(
				
				Qushie.row({ content: 
					Qushie.column({
						small_columns: 5,
						large_columns: 5,
						content: "<input id='ListQScriptName_"+qscript.id+"' type='text' placeholder='Match' value='"+qscript.name+"' />"
					}) +
					Qushie.column({
						small_columns: 3,
						large_columns: 3,
						content: "<input id='ListQScriptEnable_"+qscript.id+"' type='checkbox'  />"
					})  +
					Qushie.column({
						small_columns: 5,
						large_columns: 5,
						content: "<input id='ListQScriptGroup_"+qscript.id+"' type='text' placeholder='NoGroup' value='"+qscript.group+"' />"
					}) +
					Qushie.column({
						small_columns: 6,
						large_columns: 6,
						content: "&nbsp;"
					}) +
					Qushie.column({
						small_columns: 2,
						large_columns: 2,
						content: "<div id='ListQScriptEditButton_"+qscript.id+"' class='button small'>Edit</div>"
					}) +
					Qushie.column({
						small_columns: 3,
						large_columns: 3,
						content: "<div id='ListQScriptDeleteButton_"+qscript.id+"' class='button small alert'>Delete</div>"
					})
				}) +
				Qushie.row({
					content: Qushie.column({
						small_columns: 24, large_columns: 24,
						content: "<div><hr /></div>"
					})
				})
			);
			
			try {
				$("#ListQScriptEnable_"+qscript.id).data('qscript',qscript);
				$("#ListQScriptName_"+qscript.id).data('qscript',qscript).on('keyup', function () {
					// console.log("keyup called")
					var a = $(this).data('qscript');
					a.match = $(this).val();
					QScripts.save();
				});
				$("#ListQScriptGroup_"+qscript.id).data('qscript',qscript).on('keyup', function () {
					var a = $(this).data('qscript');
					a.group = $(this).val();
					QScripts.save();
				});
				Qushie.toggle("ListQScriptEnable_"+qscript.id,qscript,"enabled", null, function () {
					// console.log("Callback Called");
					QScripts.save();
				});
				$('#ListQScriptEditButton_'+ qscript.id).on('click',function () {
					QScripts.new(qscript);
					QScripts.save();
				});
				$('#ListQScriptDeleteButton_'+ qscript.id).on('click',function () {
					QScripts.remove(qscript);
					QScripts.list();
				});
			} catch (err) {
				// console.log(err);
			}
		})(the_qscript);
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
				content: '<div id="ListQScriptPrevPageButton" class="button tiny radius">Previous</div>' 
			}) +
			Qushie.column({
				large_columns: 4, small_columns: 4,
				content: '<div id="ListQScriptNextPageButton" class="button tiny radius">Next</div>' 
			}) +
			Qushie.column({
				large_columns: 8, small_columns: 8,
				content: '&nbsp;'
			})
		})
	);
	$('#ListQScriptNextPageButton').on('click', function () {
		QScripts.page++;
		QScripts.list();
	});
	$('#ListQScriptPrevPageButton').on('click', function () {
		QScripts.page--;
		if ( QScripts.page < 1 ) {
			QScripts.page = 1;
		}
		QScripts.list();
	});
}
QScripts.remove = function (the_qscript) {
	var new_qscripts = [];
	for ( var i = 0; i < QScripts.defined_qscripts.length; i++ ) {
		var qscript = QScripts.defined_qscripts[i];
		if ( the_qscript.id != qscript.id ) {
			new_qscripts.push(qscript);
		}
	}
	QScripts.defined_qscripts = new_qscripts;
	QScripts.save();
}
Qushie.connect('Qushie.render_tabs.after','qscripts_show_frames', 0, function () {
	var mytab = $('#QScript_Tab_Content');
	if ( ! mytab.length == 0 ) {
		if ( QScripts.defined_qscripts.length == 0) {
			QScripts.new();
		} else {
			QScripts.list();
		}
	}
});
Qushie.connect('Qushie.set_active_tab','qscripts_show_frames', 0, function () {
	setTimeout(function () {
		var mytab = $('#QScript_Tab_Content');
		if ( ! mytab.length == 0 ) {
			if ( QScripts.defined_qscripts.length == 0) {
				QScripts.new();
			} else {
				QScripts.list();
			}
			$('#SearchQScripts').unbind();
			$('#SearchQScripts').on('keyup', function () {
				QScripts.search_keyword = $('#SearchQScripts').val();
				if ( QScripts.search_keyword.length >= 3) {
					QScripts.list();
				} else if (QScripts.search_keyword.length == 0) {
					QScripts.list();
				}
				
			});
		}
	},150);
});
Qushie.connect("Qushie.load_plugins",'qsripts_load_scripts',0,function () {
	if ( QScripts.defined_qscripts == null ) {
		var f = Qushie.createFileObject();
		var txt = f.getContents("qscripts.json");
		if ( txt.length > 0 ) {
			eval("QScripts.defined_qscripts = " + txt + ";");
			for ( var i in QScripts.defined_qscripts ) {
				var script = QScripts.defined_qscripts[i];
				if ( script.enabled === true ) {
					try { eval(script.send); } catch (err) { Qushie.emit("QScripts.script.error",script); }
				}
			}
		}
	}
});
Qushie.addFilter('Qushie.tabs','qscript_tab',0,function (tabs) {
	for ( i in tabs ) {
		var tab = tabs[i]
		if ( tab.id == "QScript_Tab") {
			return tabs;
		}
	}
	if ( QScripts.defined_qscripts == null ) {
		var f = Qushie.createFileObject();
		var txt = f.getContents("qscripts.json");
		if ( txt.length > 0 ) {
			eval("QScripts.defined_qscripts = " + txt + ";");
		}
	}
	
	tabs.push({
		name: "Qushie Scripts",
		id: "QScript_Tab",
		active: false,
		content: function () {
			
			return Qushie.row({ 

						content: Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewQScriptButton" class="button small" onClick="QScripts.list();">List</div>'
							}) +
							Qushie.column({ 
								large_columns: 4, small_columns: 4,
								content: '<div id="NewQScriptButton" class="button small" onClick="QScripts.new();">New</div>'
							}) +
							Qushie.column({
								large_columns: 16, small_columns: 16,
								content: Qushie.row({
									classes: "collapse",
									content: Qushie.column({ 
										large_columns: 22, small_columns: 22,
										content: '<input type="text" id="SearchQScripts" placeholder="Search" />'
									}) +
									Qushie.column({ 
										large_columns: 2, small_columns: 2,
										content: '<div id="SearchQScriptsButton" class="button postfix radius">Find</div>'
									})
								})
							})   
				    }) +
				   '<div id="QScriptNewFrame" style="display:none;"></div>' + 
				   '<div id="QScriptListFrame"></div>' + 
				   '<style type="text/css">#NewQScriptOutput {height: 10em;}</style>';
		},
		after_content: function () {

		}
	});
	return tabs;
});
