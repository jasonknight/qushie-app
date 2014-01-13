// Telnet Codes
var IAC 		= 255;
var DONT 		= 254;
var DO 			= 253;
var WONT 		= 252;
var WILL 		= 251;
var SB 			= 250;
var GA 			= 249;
var EL 			= 248;
var EC 			= 247;
var AYT 		= 246;
var AO 			= 245;
var IP 			= 244;
var BREAK 		= 243;
var DM 			= 242;
var NOP 		= 241;
var SE 			= 240;
var EOR 		= 239;
var ABORT 		= 238;
var SUSP 		= 237;
var EOF 		= 236;

// Telnet options
var TOPT_BINARY 		 	= 0;
var TOPT_ECHO 			 	= 1;
var TOPT_RCP 			 	= 2;
var TOPT_SGA 			 	= 3;
var TOPT_NAMS 			 	= 4;
var TOPT_STATUS 		 	= 5;
var TOPT_TM 			 	= 6;
var TOPT_RCTE 			 	= 7;
var TOPT_NAOL 			 	= 8;
var TOPT_NAOP 			 	= 9;
var TOPT_NAOCRD 		 	= 10;
var TOPT_NAOHTS 		 	= 11;
var TOPT_NAOHTD 		 	= 12;
var TOPT_NAOFFD 		 	= 13;
var TOPT_NAOVTS 		 	= 14;
var TOPT_NAOVTD 		 	= 15;
var TOPT_NAOLFD 		 	= 16;
var TOPT_XASCII 		 	= 17;
var TOPT_LOGOUT 		 	= 18;
var TOPT_BM 			 	= 19;
var TOPT_DET 			 	= 20;
var TOPT_SUPDUP 		 	= 21;
var TOPT_SUPDUPOUTPUT 	 	= 22;
var TOPT_SNDLOC 		 	= 23;
var TOPT_TTYPE 			 	= 24;
var TOPT_EOR 			 	= 25;
var TOPT_TUID 			 	= 26;
var TOPT_OUTMRK 		 	= 27;
var TOPT_TTYLOC 		 	= 28;
var TOPT_3270REGIME 	 	= 29;
var TOPT_X3PAD 			 	= 30;
var TOPT_NAWS 			 	= 31;
var TOPT_TSPEED 		 	= 32;
var TOPT_LFLOW 			 	= 33;
var TOPT_LINEMODE 		 	= 34;
var TOPT_XDISPLOC 		 	= 35;
var TOPT_ENVIRON 		 	= 36;
var TOPT_AUTHENTICATION  	= 37;
var TOPT_ENCRYPT 		 	= 38;
var TOPT_NEW_ENVIRON 	 	= 39;
var TOPT_MSSP 			 	= 70;
var TOPT_COMPRESS2 		 	= 86;
var TOPT_EXOPL 			 	= 255;
var TOPT_MCCP2 			 	= 86;
var TOPT_GMCP				= 201;
var TOPT_AARD				= 102;


var TELNET_OPTIONS_LIST = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	22,
	23,
	24,
	25,
	26,
	27,
	28,
	29,
	30,
	31,
	32,
	33,
	34,
	35,
	36,
	37,
	38,
	39,
	70,
	86,
	255,
	86,
	201,
	102 
];

var AardwolfTelnet = {
	id: "Aardwolf_Telnet",
	send_buffer: "",
}
AardwolfTelnet.tabs = [

];
AardwolfTelnet.wills = [];
AardwolfTelnet.wonts = [];
AardwolfTelnet.parseServerOutput = function (txt) {
	// Here we need to parse what the server sends us
	
	//var log = Qushie.createFileObject();

	txt = Qushie.applyFilter('AardwolfTelnet.text_received.raw',AardwolfTelnet,txt);
	var now = Qushie.time();
	var stamp = now.ymdhis;
	txt = txt.replace(/\x0D/g,"");
	//log.append(".log-" + now.ymd,"[" +stamp+ "]" + txt);
	

	txt = Qushie.applyFilter("AardwolfTelnet.text_received",AardwolfTelnet,txt);
	if ( txt.length > 120 && txt.indexOf("\n") == -1 ) {
		txt = Qushie.wordWrap(txt,120);
	}
	//txt = Qushie.applyFilter("aardwolf_text_wordwrapped",AardwolfTelnet,txt);
	try {
		txt = txt.replace("<","&lt;");
		txt = txt.replace(">","&gt;");
	} catch (err) {
		console.log("Failed to replace in text");
	}
	
	var html = ansi_up.ansi_to_html(txt);
	html = Qushie.applyFilter("AardwolfTelnet.html_produced",AardwolfTelnet,html);
	$("#Aardwolf_Mud_Output").append( html.replace("[m","").replace(/\n+/g,"\n") + "\n" );
	var nh = $('#AardwolfTelnet_Window > pre').height();
	$('#AardwolfTelnet_Window').scrollTop( nh );
}
AardwolfTelnet.onLoad = function () {
	if ( !Qushie.aardwolf_socket ) {
		Qushie.aardwolf_socket = -1;
	}
	AardwolfTelnet.connection = Qushie.getTelnetObjectById(Qushie.aardwolf_socket);

	AardwolfTelnet.connection.SignalSocketReadyRead.connect(function () {
		var txt = AardwolfTelnet.connection.readAll();
		AardwolfTelnet.parseServerOutput(txt);
		Qushie.settings.aardwolf_socket = AardwolfTelnet.connection.getId();
		AardwolfTelnet.setConnectButtonClass('success');
	});

	AardwolfTelnet.connection.SignalConnected.connect(function (server,port) {
		//console.log("Connected to: ", server,port);
		Qushie.settings.aardwolf_socket = AardwolfTelnet.connection.id;
		AardwolfTelnet.setConnectButtonClass('success');
	});

	AardwolfTelnet.connection.SignalSocketConnectionClosed.connect(function () {
		//console.log("Connection has been closed");
		AardwolfTelnet.setConnectButtonClass('alert');
	});

	AardwolfTelnet.connection.SignalSocketError.connect(function (err) {
		//console.log("Error: ", err);
		AardwolfTelnet.setConnectButtonClass('alert');
	});

	AardwolfTelnet.connection.SignalSocketException.connect(function (code) {
		//console.log("Exception: ", code);
		AardwolfTelnet.setConnectButtonClass('alert');
	});
	
	
};
AardwolfTelnet.setConnectButtonClass = function (c) {
	var el = $('#AardwolfTelnet_Connect_Button');
	el.removeClass('alert').removeClass('success').addClass(c);
}
AardwolfTelnet.connect = function() {
	console.log("connect called");
	if ( AardwolfTelnet.connection.isConnected() != true ) {
		AardwolfTelnet.connection.connectToHost("127.0.0.1",4010);
	}
}

AardwolfTelnet.tabContent = function () {
	var height = $(window).height() * 0.75;
	var file = Qushie.createFileObject();
	var contents = '';//file.getContents(".buffer");
	var content = '<div id="AardwolfTelnet_Tab_Content">' +
					Qushie.row({
						content: Qushie.column({
							large_columns: 15, small_columns: 15,
							classes: 'collapse',
							content: '<div id="AardwolfTelnet_Connect_Button" class="button radius tiny alert" onClick="AardwolfTelnet.connect();">Connect</div>' 
						})
					}) +
				  Qushie.row( { content: 
				  	Qushie.column({
				  		content: '<div id="AardwolfTelnet_Window"><pre id="Aardwolf_Mud_Output" class="mud-output">' + contents + '</pre></div> ' +
				  		'<textarea id="AardwolfTelnet_Input"></textarea>', 
				  		large_columns: 15, small_columns: 15 
				  	}) +
				  	Qushie.column({ 
				  		content: Qushie.panel({ content: '<div id="AardwolfTelnet_RightWidgets"></div>'}), 
				  		large_columns: 9, 
				  		small_columns:9
				  	})
				  }) +
				  ' ' +
				  '</div>' +
				  '<style type="text/css">' + 
				  	'#AardwolfTelnet_Window { background-color: #262626;padding: 10px; font-size: 1.3em;color: white;margin-bottom: 10px; width: 100%; height: ' +height+ 'px; overflow-y: scroll; overflow-x: hidden;}' +
				  	'#AardwolfTelnet_Input { font-size: 1.2em;}' +
				  	'.sent-command { color: red;}' +
				  	'.note { color: white; background-color: #203356; padding: 10px;}' +
				  	'.success-note { color: white; background-color: #567d31; padding: 10px;}' +
				  	'.error-note { color: white; background-color: #7e0101; padding: 10px;}' +
				  	'.debug { color: white; background-color: #3a4125; padding: 10px;}' +
				  	'#AardwolfTelnet_RightWidgets .tabs dd a { font-weight: normal;padding-left: 10px; padding-right: 10px;padding-top: 2px; padding-bottom: 5px;}' +
				  '</style>';
	return content;
}
AardwolfTelnet.appendToOutput = function (thing) {
	$("#Aardwolf_Mud_Output").append( thing + "\n" );
}
AardwolfTelnet.execute = function (cmd) {
	if ( cmd.indexOf(';') ) {
		var cmds = cmd.split(';');
		for ( i in cmds ) {
			var the_cmd = cmds[i];
			the_cmd = Qushie.applyFilter('AardwolfTelnet.cmd_entered',AardwolfTelnet,the_cmd);
			try {
				AardwolfTelnet.send(the_cmd);
				AardwolfTelnet.appendToOutput('<span class="sent-command">' + the_cmd + "</span>");
			} catch (err) {
				errorNote(err);
			}
			
		} 
	} else {
		the_cmd = Qushie.applyFilter('AardwolfTelnet.cmd_entered',AardwolfTelnet,cmd);
		try {
			AardwolfTelnet.send(the_cmd);
			AardwolfTelnet.appendToOutput('<span class="sent-command">' + cmd + "</span>");
		} catch (err) {
			errorNote(err);
		}
		
	}
	var nh = $('#AardwolfTelnet_Window > pre').height();
	$('#AardwolfTelnet_Window').scrollTop( nh );
}
AardwolfTelnet.send = function (cmd) {
	AardwolfTelnet.connection.write(cmd + "\n\r");
	
	var nh = $('#AardwolfTelnet_Window > pre').height();
	$('#AardwolfTelnet_Window').scrollTop( nh );	
}
AardwolfTelnet.sendRaw = function (cmd) {
	AardwolfTelnet.connection.write(cmd);
}
AardwolfTelnet.installListeners = function () {
	$('#AardwolfTelnet_Input').unbind();
	$('#AardwolfTelnet_Input').on('keyup',function (event) {
		if ( event.which == 13 && event.shiftKey == false ) {
			var cmd = $('#AardwolfTelnet_Input').val();
			$('#AardwolfTelnet_Input').val('');
			cmd = cmd.trim();
			if ( cmd && typeof cmd == 'string' && cmd != '[object Object]' ) {
				AardwolfTelnet.execute(cmd);
			} else {
				AardwolfTelnet.send(" ");
			}
		} 
		$('#AardwolfTelnet_Input').focus();
		event.preventDefault();
	});
	AardwolfTelnet.drawWidgets();
}
AardwolfTelnet.fakeConnection = function () {
	// We fake a connection by loading up recorded
	// text files from actual servers that we've connected to.
	var f = Qushie.createFileObject();
	var txt = f.getContents("C:\\Users\\ayon\\Documents\\GitHub\\qushie-app\\js\\plugins\\aard_outpur_1.txt");
	console.log("File contents are: ", txt);
}
AardwolfTelnet.drawWidgets = function () {
	var tabs = AardwolfTelnet.tabs;
	tabs = Qushie.applyFilter('AardwolfTelnet.tabs',AardwolfTelnet,tabs);
	Qushie.renderTabs(
		"AardwolfTelnet_RightWidgets_Tabs",
		"AardwolfTelnet_RightWidgets",
		AardwolfTelnet.tabs,
		true // i.e. silent
	);
	setTimeout(function () {
		var nh = $('#AardwolfTelnet_Window > pre').height();
		$('#AardwolfTelnet_Window').scrollTop( nh );
	},120);
}
Qushie.connect('Qushie.load_plugins',AardwolfTelnet.id, 0, AardwolfTelnet.onLoad);
Qushie.connect('Qushie.render_tabs.after',AardwolfTelnet.id,0,AardwolfTelnet.installListeners);
Qushie.addFilter("Qushie.tabs","AardwolfTelnet_Tabs",0,function (tabs) {
	for ( var i in tabs ) {
		var tab = tabs[i];
		if ( tab.id == "Aardwolf_Telnet_Tab") {
			return tabs;
		}
	}
	tabs.push({
		name: "Aardwolf",
		id: "Aardwolf_Telnet_Tab",
		active: false,
		content: function () {
			return AardwolfTelnet.tabContent();
		},
		drawWidgets: AardwolfTelnet.drawWidgets,
	});
	return tabs;
});

function send(txt) {
	AardwolfTelnet.send(txt);
}
function execute(cmd) {
	AardwolfTelnet.execute(cmd);
}
function note(txt) {
	AardwolfTelnet.appendToOutput('<div class="note"><h4>Notice</h4><p>' + txt + "</p></div>" );	
}
function debug(txt) {
	AardwolfTelnet.appendToOutput('<div class="debug"><h4>Debug</h4><pre>' + txt + "</pre></div>" );	
}
function successNote(txt) {
	AardwolfTelnet.appendToOutput('<div class="success-note"><h4>Success</h4><p>' + txt + "</p></div>" );	
}
function errorNote(txt) {
	AardwolfTelnet.appendToOutput('<div class="error-note"><h4>Error</h4><p>' + txt + "</p></div>" );
}
function appendToOutput(thing) {
	AardwolfTelnet.appendToOutput(thing);
}
function stripTelnetChars(txt) {
	var result = '';
	var state = { iac: false, sb: false, se: false, opt: false, will: false, wont: false, do: false, dont: false };
	for ( var i = 0; i < txt.length; i++ ) {
		var c = txt.charCodeAt(i);
		switch( c ) {
			case IAC:
				state.iac = true;
				break;
			case SB:
				state.sb = true;
				break;
			case SE:
				state.se = true;
				break;
			case WILL:
				state.will = true;
				break;
			case DO:
				state.do = true;
				break;
			case DONT:
				state.dont = true;
				break;
			case WONT:
				state.wont = true;
				break;
			default:
				try {
					if ( state.iac && (state.do || state.will || state.wont || state.dont ) && TELNET_OPTIONS_LIST.indexOf(c) != -1 ) {
						Qushie.log("Found an option: ",c,state);
						Qushie.emit("telnet_option",{ state: state, option: c, index: i, full_text: txt} );
						state = { iac: false, sb: false, se: false, opt: false, will: false, wont: false, do: false, dont: false };
						continue;
					}
					if ( state.sb && state.se ) {
						state = { iac: false, sb: false, se: false, opt: false, will: false, wont: false, do: false, dont: false };
					}
					if ( txt.charCodeAt(i) >= EOF ) {
						// we don't want any of these.
						continue;
					}
					if ( c <= 126 && c >= 31 ) {
						result += txt[i];
					}
				} catch (err) {
					errorNote(err);
				}
				break;
				
		}
	}
	return result;
}