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
	
	var log = Qushie.createFileObject();
	txt = Qushie.applyFilter('aardwolf_text_received_raw',AardwolfTelnet,txt);
	txt = txt.replace(/\x0D/g,"");
	log.append(".log",txt);
	
	txt = Qushie.applyFilter("aardwolf_text_received",AardwolfTelnet,txt);
	console.log("AARD:", txt);
	//txt = Qushie.applyFilter("aardwolf_text_wordwrapped",AardwolfTelnet,txt);
	var html = ansi_up.ansi_to_html(txt.replace("<","&lt;").replace(">","&gt;"));
	log.append(".buffer",html);
	html = Qushie.applyFilter("aardwolf_html_produced",AardwolfTelnet,html);
	$("#Aardwolf_Mud_Ouput").append( html.replace("[m","").replace(/\n+/g,"\n") + "\n" );
	var nh = $('#AardwolfTelnet_Window > pre').height();
	$('#AardwolfTelnet_Window').scrollTop( nh );
}
AardwolfTelnet.onLoad = function () {
	console.log("Loading AardwolfTelnet this is", this);
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
		console.log("Connected to: ", server,port);
		Qushie.settings.aardwolf_socket = AardwolfTelnet.connection.id;
		AardwolfTelnet.setConnectButtonClass('success');
	});

	AardwolfTelnet.connection.SignalSocketConnectionClosed.connect(function () {
		console.log("Connection has been closed");
		AardwolfTelnet.setConnectButtonClass('alert');
	});

	AardwolfTelnet.connection.SignalSocketError.connect(function (err) {
		console.log("Error: ", err);
		AardwolfTelnet.setConnectButtonClass('alert');
	});

	AardwolfTelnet.connection.SignalSocketException.connect(function (code) {
		console.log("Exception: ", code);
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
				  Qushie.row( { content: 
				  	Qushie.column({content: '<div id="AardwolfTelnet_Window"><pre id="Aardwolf_Mud_Ouput" class="mud-output">' + contents + '</pre></div>', large_columns: 15, small_columns: 15 }) +
				  	Qushie.column({ 
				  		content: Qushie.panel({ content: '<div id="AardwolfTelnet_RightWidgets"></div>'}), 
				  		large_columns: 9, 
				  		small_columns:9
				  	})
				  }) +
				  ' <textarea id="AardwolfTelnet_Input"></textarea>' +
				  '</div>' +
				  '<style type="text/css">' + 
				  	'#AardwolfTelnet_Window { background-color: #262626;padding: 10px; font-size: 1.3em;color: white;margin-bottom: 10px; width: 100%; height: ' +height+ 'px; overflow-y: scroll; overflow-x: hidden;}' +
				  	'#AardwolfTelnet_Input { font-size: 1.2em;}' +
				  	'.sent-command { color: red;}' +
				  	'#AardwolfTelnet_RightWidgets .tabs dd a { font-weight: normal;padding-left: 10px; padding-right: 10px;padding-top: 2px; padding-bottom: 5px;}' +
				  '</style>';
	return content;
}
AardwolfTelnet.execute = function (cmd) {
	if ( cmd.indexOf(';') ) {
		var cmds = cmd.split(';');
		for ( i in cmds ) {
			var the_cmd = cmds[i];
			the_cmd = Qushie.applyFilter('aardwolf_cmd_entered',AardwolfTelnet,the_cmd);
			try {
				AardwolfTelnet.send(the_cmd);
			} catch (err) {
				console.log(err);
			}
			
		} 
	} else {
		the_cmd = Qushie.applyFilter('aardwolf_cmd_entered',AardwolfTelnet,cmd);
		try {
			AardwolfTelnet.send(the_cmd);
		} catch (err) {
			console.log(err);
		}
		
	}
}
AardwolfTelnet.send = function (cmd) {
	AardwolfTelnet.connection.write(cmd + "\n\r");
	$("#Aardwolf_Mud_Ouput").append("\n" + '<span class="sent-command">' + cmd + "</span>\n" );	
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
			
			AardwolfTelnet.execute(cmd);
			
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
	console.log("Rendering aard tabs");
	var tabs = AardwolfTelnet.tabs;
	tabs = Qushie.applyFilter('aardwolf_telnet_tabs',AardwolfTelnet,tabs);
	Qushie.renderTabs(
		"AardwolfTelnet_RightWidgets_Tabs",
		"AardwolfTelnet_RightWidgets",
		AardwolfTelnet.tabs,
		true // i.e. silent
	);
}
Qushie.connect('load_plugins',AardwolfTelnet.id, 0, AardwolfTelnet.onLoad);
Qushie.connect('after_render_tabs',AardwolfTelnet.id,0,AardwolfTelnet.installListeners);
Qushie.registerPlugin({
	name: "Aardwolf Telnet Client",
	id: "Aarwolf_Telnet_Client",
	description: "Allows you to connect to Aardwolf Mud",
	path: "",
	url: "",
	version: 1.0,
	settingsContent: function () {
		return '<div id="AardwolfTelnet_Connect_Button" href="#" class="button tiny alert" onclick="AardwolfTelnet.connect()">Connect</div>';
	},
	tabs: function () {
		return [
			{
				name: "Aardwolf",
				id: "Aardwolf_Telnet_Tab",
				active: false,
				content: function () {
					return AardwolfTelnet.tabContent();
				},
				drawWidgets: AardwolfTelnet.drawWidgets,
			},
		];
	}

});

function send(txt) {
	AardwolfTelnet.send(txt);
}
function execute(cmd) {
	AardwolfTelnet.execute(cmd);
}
function note(txt) {
	$("#Aardwolf_Mud_Ouput").append("\n" + '<span class="note">' + txt + "</span>\n" );	
}