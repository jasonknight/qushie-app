Qushie.ui_needs_update = true;
Qushie.settings = {
	plugins: {}
};
Qushie.events = {
	init: [],
	loaded: [],
	load_plugins: [],
	settings_saved: [],
};
Qushie.filters = {};
Qushie.row = _.template( $('#template_row').html() );
Qushie.column = _.template( $('#template_column').html() );
Qushie.panel = _.template( $('#template_panel').html() );
Qushie.tab_controls = _.template( $('#template_tab_controls').html() );
Qushie.tab_contents = _.template( $('#template_tab_contents').html() );

Qushie.connect = function (name, id, priority, cb) {
	// // console.log("Connecting",name,id,priority,cb)
	if ( ! Qushie.events[name] ) {
		Qushie.events[name] = [];
	}
	for ( i in Qushie.events[name] ) {
		var desc = Qushie.events[name][i];
		if ( desc && desc.id == id ) {
			// // console.log("Already registered")
			return;
		}
	}
	Qushie.events[name].push({id: id, callback: cb, priority: priority});
}
Qushie.disconnect = function (name,id) {
	if ( ! Qushie.events[name] ) {
		Qushie.events[name] = [];
	}
	var new_events = [];
	for ( i in Qushie.events[name] ) {
		var desc = Qushie.events[name][i];
		if ( desc && desc.id == id ) {
			continue;
		}
		new_events.push(desc);
	}
	Qushie.events = new_events;
}
Qushie.emit = function (name, data) {
	console.log("Qushie Emit: ", name, data, " to ", Qushie.events[name]);
	for ( i in Qushie.events[name] ) {
		var desc = Qushie.events[name][i];
		if ( desc ) {
			desc.callback.call(data);
		}
	}
}
Qushie.addFilter = function (name,id,priority,cb) {
	// // console.log("Connecting",name,id,priority,cb)
	if ( ! Qushie.filters[name] ) {
		Qushie.filters[name] = [];
	}
	for ( i in Qushie.filters[name] ) {
		var desc = Qushie.filters[name][i];
		if ( desc && desc.id == id ) {
			// // console.log("Already registered")
			return;
		}
	}
	Qushie.filters[name].push({id: id, callback: cb, priority: priority});
}
Qushie.applyFilter = function (name,th,data) {
	// console.log("applying filter ",name)
	for ( i in Qushie.filters[name] ) {
		var desc = Qushie.filters[name][i];
		if ( desc ) {
			data = desc.callback.call(th,data);
		}
	}
	return data;
}
Qushie.registered_plugins = [
	
];
Qushie.tabs = [
	{
		name: "Settings",
		id: "Qushie_Settings",
		active: true,
		content: function () {
			var tmp = _.template( $('#template_qushie_settings').html() );
			return tmp({id: "Qushie_Settings_Form", settings: Qushie.settings, registered_plugins: Qushie.registered_plugins});
		},
		after_content: function () {

		}
	},
	
];

Qushie.onLoad = function () {
	// console.log("onLoad")
	Qushie.loadSettings();
	Qushie.emit('load_plugins',{});
	for ( i in Qushie.tabs) {
		if ( Qushie.tabs[i].id == Qushie.settings.active_tab ) {
			// console.log("Restoring Active Tab")
			Qushie.tabs[i].active = true;
		} else {
			Qushie.tabs[i].active = false;
		}
	}
	setTimeout(Qushie.redraw,90);
	setInterval(function () {
		Qushie.saveSettings(false);
	},1500);
}
Qushie.registerPlugin = function (pl) {
	// console.log("registerPlugin")
	// // console.log("registering plugin",pl);
	for ( i in Qushie.registered_plugins ) {
		var epl = Qushie.registered_plugins[i];
		if ( epl.id == pl.id ) {
			// // console.log("Already Registered");
			return;
		}
	}
	Qushie.registered_plugins.push(pl);
}
Qushie.getAvailableTabs = function () {
	//// console.log("getAvailableTabs")
	var tabs = $.extend([],Qushie.tabs);
	$.each(Qushie.registered_plugins,function (i,pl) {
		if (Qushie.isPluginActive(pl.id)) {
			if ( pl.tabs ) {
				var pl_tabs = pl.tabs();
				for (_i in pl_tabs ) {
					tabs.push(pl_tabs[_i]);
				}
			}
		}
	});	
	return tabs;
}
Qushie.redraw = function () {
	if ( Qushie.ui_needs_update ) {
		Qushie.emit("before_redraw",{});
		var tabs = Qushie.getAvailableTabs();
		//// console.log("Tabs are", tabs);
		Qushie.renderTabs("Qushie_Main_Tabs","Main",tabs);
		Qushie.ui_needs_update = false;
		Qushie.emit("after_redraw",{});
	}
}
Qushie.renderTabs = function (id,target,tabs,silent) {

	//// console.log("renderTabs", Qushie.tabs)
	if ( ! silent ) {
		Qushie.emit("before_render_tabs",{});
	}
	
	var html = Qushie.tab_controls({id: id, tabs: tabs});
	$("#" + target).html("");
	$("#" + target).append(html);

	html = Qushie.tab_contents({id: id + "_Contents", tabs: tabs});
	$("#" + target).append(html);

	// Seems to be a bug in foundation so we do it ourselves.
	// we only wanted the CSS anyway.
	$('#' + id).find('dd').each(function (i,entry) {
		$(entry).on('click',function () {
			var tab = Qushie.findTabById( $(this).attr('data-qushie-tab-id'),tabs );
			// // console.log("Tab is", tab);
			$('#' + id + "_Contents").find('.content').removeClass('active');
			$(this).parent().find('dd').removeClass('active');
			$(this).addClass('active');
			$('#' + tab.id + '_Content').addClass('active');
			$('#' + tab.id + '_Content').show();
			Qushie.setActiveTab($(this).attr('data-qushie-tab-id'),tab.active_tab_key);
			
			if ( tab.drawWidgets ) {
				tab.drawWidgets();
				$('body').scrollTop(0);
			}
		} );
	});
	if ( ! silent ) {
		Qushie.emit("after_render_tabs",{});
	}
	$('body').scrollTop(0);
}
Qushie.findTabById = function (id,tabs) {
	if ( ! tabs ) {
		tabs = Qushie.getAvailableTabs();
	}
	for ( i in tabs) {
		if ( tabs[i].id == id ) {
			return tabs[i];
		}
	}
	return null;
}
Qushie.findPluginById = function (id) {
	//// console.log("findPluginById");
	for ( i in Qushie.registered_plugins) {
		if ( Qushie.registered_plugins[i].id == id ) {
			return Qushie.registered_plugins[i];
		}
	}
	return null;
}
Qushie.setActiveTab = function (id, key) {
	// console.log("Setting Active Tab", id);
	if ( ! key ) {
		key = 'active_tab';
	}
	Qushie.settings[key] = id;
	Qushie.emit('set_active_tab',{id: id});
	$('body').scrollTop(0);
	Qushie.saveSettings();
}
Qushie.isTabActive = function (id, key) {
	if ( ! key ) {
		key = 'active_tab';
	}
	//// console.log("isTabActive: ", key,id,id == Qushie.settings[key])
	return id == Qushie.settings[key];
}
Qushie.loadSettings = function () {
	var sfile = Qushie.createFileObject();
	sfile.SignalFileDoesNotExist.connect(function () {
		// // console.log("No settings to load");
	});
	sfile.SignalOpened.connect(function () {
		sfile.read();
	});
	sfile.SignalBytesRead.connect(function (str) {
		eval("Qushie.settings = " + str + ";");
		
	});
	sfile.SignalEndOfFile.connect(function () {
		sfile.close();
	});
	sfile.open("settings.json","r");
}
Qushie.saveSettings = function (update_ui) {
	if ( ! update_ui === false ) {
		update_ui = true;
	}
	var sfile = Qushie.createFileObject();
	sfile.putContents("settings.json", JSON.stringify(Qushie.settings,undefined,4));
	Qushie.ui_needs_update = update_ui;
}
Qushie.togglePluginActive = function (id) {
	var pl = Qushie.findPluginById(id);
	if ( ! Qushie.settings.plugins[pl.id] ) {
		Qushie.settings.plugins[pl.id] = {}
	}
	Qushie.settings.plugins[pl.id].active = ! Qushie.settings.plugins[pl.id].active;
	Qushie.saveSettings();
}
Qushie.isPluginActive = function (id) {
	var pl = Qushie.findPluginById(id);
	if ( ! Qushie.settings.plugins[pl.id] ) {
		Qushie.settings.plugins[pl.id] = {}
	}
	return Qushie.settings.plugins[pl.id].active;
}

Qushie.wordWrap = function (str, width, brk, cut) {
 
    brk = brk || '\n';
    width = width || 80;
    cut = cut || false;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
 
    return str.match( RegExp(regex, 'g') ).join( brk );
}
Qushie.toggle = function (id,obj,key,options,callback) {
	if ( obj[key] === true ) {
		// console.log(id + " " + key + " is true so setting checked");
		$('#' + id).attr('checked',true);
	} else {
		$('#' + id).removeAttr('checked');
	}
	var default_options = { 
		on_label: "On", 
		off_label: "Off",
		width: 30,
		height: 15,
		button_width: 15,
	};
	if ( ! options ) {
		options = default_options;
	} else {
		for ( var k in options ) {
			default_options[k] = options[k];
		}
	}
	$('#' + id).switchButton(default_options).on('change',function () {
		obj[key] = $(this).is(":checked");
		if ( callback ) {
			callback.call(obj);
		}
	});



}
Qushie.stripHTML = function (html) {
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}
// Proxy functions
Qushie.miniWindow = function (id,title,content) {
	// console.log("MINIWINDOW:","Adding a mini window");
	var div = $('#'+ id + '_MiniWindow');
	if (div.length == 0 ) {
		// console.log("MINIWINDOW:","Mini window doesn't exist");
		div = '<div id="' + id + '_MiniWindow" class="miniwindow">' +
			'<div id="'+ id +'_Header" class="miniwindow-header">' + title + '</div>' +
			'<div id="' + id + '_Content" class="miniwindow-content">' +
				content.call(Qushie) +
			'</div>' +
		'</div>';
		$('body').append(div);
		div = $('#'+ id + '_MiniWindow');
	} else {
		// console.log("MINIWINDOW:","Window exists");
		div.find('#' + id + '_Content').html( content.call(Qushie) );
	}
	Qushie.positionRememberable(div,".miniwindow-header");
	
}
 Qushie.positionRememberable = function (elem, h) {
  var key = 'position_rememberable.' + elem.attr('id');
  var position = JSON.parse(localStorage.getItem(key));
  elem.css({position: 'absolute'});
  if (!position) {
    position = elem.offset();
    localStorage.setItem(key, JSON.stringify(position));
  } else {
    elem.offset(position);
  }
  elem.draggable({
  	handle: h,
    stop: function () {
      localStorage.setItem(key, JSON.stringify($(this).offset()));
    }
  });
}
Qushie.set = function (key,value) {
	if ( ! Qushie.settings.variables ) {
		Qushie.settings.variables = {};
	}
	Qushie.settings.variables[key] = value;
	Qushie.saveSettings(false);
}
Qushie.get = function (key,default_value) {
	if ( ! Qushie.settings.variables ) {
		Qushie.settings.variables = {};
	}
	var value = Qushie.settings.variables[key];
	if ( !value ) {
		return default_value;
	}
}