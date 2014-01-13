var GMCP = {
	id: "GMCP",
	sent_do: false,
	sent_hello: false,
	version: "0.0.1",
	debug: 'no',
	
};
var pkt_template = {
	_comm: {

	},
	_group: {

	},
	_room: {

	},
	_char: {

	},
};
GMCP.send = function (what) {
	var pkt = String.fromCharCode(IAC) + String.fromCharCode(SB) + String.fromCharCode(TOPT_GMCP) +
			  what.replace("\x255","\x255\x255") +
			  String.fromCharCode(IAC) + String.fromCharCode(SE);
	if ( GMCP.debug == 'yes' ) {
		Qushie.log("GMCP: ", "Sending [[["+pkt+"]]]")
	}
    AardwolfTelnet.sendRaw(pkt);
}
Qushie.addFilter('AardwolfTelnet.tabs','aardwolf_telnet_GMCP_MiniWindow',0,function (tabs) {
	tabs.push({
		name: "GMCP",
		id: "Aardwolf_GMCP_Tab",
		active_tab_key: "aard_tab",
		active: true,
		content: function () {
			
			return Qushie.row({ 
				content: "Hello World"
			});
		},
		after_content: function () {

		}
	});
	return tabs;
});
Qushie.addFilter('AardwolfTelnet.text_received.raw','aardwolf_telnet_GMCP_negotiator',0,function (txt) {
	// We don't really want to have a tab, but a mini window :)
	if ( ! GMCP.sent_do ) {
		if ( GMCP.debug == 'yes') { Qushie.log("GMCP: ", "Haven't Sent DO"); }
		for ( var i = 0; i < txt.length; i++ ) {
			var c = txt.charCodeAt(i);
			if ( c == IAC ) {
				if ( GMCP.debug == 'yes') { Qushie.log("GMCP: ", "IAC Found"); }
				var operation = txt.charCodeAt(++i);
				var option = txt.charCodeAt(++i);
				Qushie.log("GMCP: ", operation,option);
				if ( operation == WILL && option == TOPT_GMCP ) {
					if ( GMCP.debug == 'yes' ) { Qushie.log("GMCP: ", "The server is offering GMCP "); }
					var resp = String.fromCharCode(IAC) + String.fromCharCode(DO) + String.fromCharCode(TOPT_GMCP);
					AardwolfTelnet.send(resp);
					GMCP.sent_do = true
				}
			}
		}
	} else if ( GMCP.sent_do && ! GMCP.sent_hello ) {
		GMCP.send('Core.Hello { "client": "Qushie", "version": "'+ GMCP.version +'" }');
      	GMCP.send('Core.Supports.Set [ "Char 1", "Comm 1", "Room 1" ]');
      	GMCP.sent_hello = true;
	} else {
		if ( GMCP.debug == 'yes' ) { Qushie.log("GMCP: ", "All negotiation Done"); }
		txt = GMCP.parseMessage(txt);
	}
	return txt;
});

GMCP.parseMessage = function (txt) {
	var state = { iac: false, sb: false, se: false, gmcp: false };
	var pkt = "";
	var data = "";
	for ( var i = 0; i < txt.length; i++ ) {
		var c = txt.charCodeAt(i);
		switch(c) {
			case IAC: 
				state.iac = true;
				break;
			case SB:
				state.sb = true;
				break;
			case TOPT_GMCP:
				state.gmcp = true;
				break;
			case SE:
				if (state.sb ) {
					state = { iac: false, sb: false, se: false, gmcp: false };
					try {
						var code = pkt.replace(/^([\w\.]+)\s/,'Qushie.emit("gmcp.$1",') + ");";
						Qushie.log("Evaluating :", code);
						eval(code);	
					} catch (err) {
						errorNote(err);
					}
					
					pkt = "";
				} else {
					if ( GMCP.debug == 'yes' ) {
						Qushie.log("Found SE, but never found SB?");
					}
				}
				break;
			default:
				if ( state.sb && state.gmcp ) {
					pkt += txt[i];
				} else {
					data += txt[i];
				}
				break;
		}
	}
	return data;
}
