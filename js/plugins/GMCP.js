var GMCP = {
	id: "GMCP",
	sent_do: false,
	sent_hello: false,
	version: "0.0.1",
	
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
	console.log("GMCP: ", "Sending [[["+pkt+"]]]")
    AardwolfTelnet.sendRaw(pkt);
}
Qushie.addFilter('aardwolf_telnet_tabs','aardwolf_telnet_GMCP_MiniWindow',0,function (tabs) {
	// We don't really want to have a tab, but a mini window :)
	console.log("GMCP", "Adding Miniwindow!");
	Qushie.miniWindow("GMCP","AardWolf GMCP Controller",function () {
		return "Hello World";
	});
	return tabs;
});
Qushie.addFilter('aardwolf_text_received_raw','aardwolf_telnet_GMCP_negotiator',0,function (txt) {
	// We don't really want to have a tab, but a mini window :)
	if ( ! GMCP.sent_do ) {
		console.log("GMCP: ", "Haven't Sent DO");
		for ( var i = 0; i < txt.length; i++ ) {
			var c = txt.charCodeAt(i);
			if ( c == IAC ) {
				console.log("GMCP: ", "IAC Found");
				var operation = txt.charCodeAt(++i);
				var option = txt.charCodeAt(++i);
				console.log("GMCP: ", operation,option);
				if ( operation == WILL && option == TOPT_GMCP ) {
					console.log("GMCP: ", "The server is offering GMCP ");
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
		console.log("GMCP: ", "All negotiation Done");
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
				if (state.iac && state.sb ) {
					state = { iac: false, sb: false, se: false, gmcp: false };
					try {
						eval(pkt.replace(/^([\w\.]+)\s/,'Qushie.emit("gmcp.$1",') + ");");	
					} catch (err) {
						console.log("GMCP: ", err);
					}
					
					pkt = "";
				}
				break;
			default:
				if ( state.iac && state.sb && state.gmcp ) {
					pkt += txt[i];
				} else {
					data += txt[i];
				}
				break;
		}
	}
	return data;
}
//if ( txt.charCodeAt(i) == IAC ) {
			// 	var operation = txt.charCodeAt(++i);
			// 	var option = txt.charCodeAt(++i);
			// 	if ( operation == SB && option == TOPT_GMCP ) {
			// 		console.log("We've received a GMCP Packet");
			// 		var data = "";
			// 		var c = null;
			// 		var c2 = null;
			// 		var sof = i + 1;
			// 		while( true ) {
			// 			c = txt[++i];
			// 			c2 = txt[i+1];
			// 			if ( c.charCodeAt(0) != IAC && i < txt.length) {
			// 				data += c;
			// 			} else {
			// 				i++;
			// 				break;
			// 			}
			// 		}
			// 		var eof = i;
			// 		var lside = txt.substring(0,sof - 2);
			// 		var rside = txt.substring(eof + 1,txt.length);

			// 		txt = lside + rside;
			// 		//console.log("GMCP After substring: ",sof,eof,lside,rside,txt);
			// 		if ( data.length > 0 ) {
			// 			//console.log("GMCP: ",data.replace(/^([\w\.]+)\s/,'pkt._$1 = ') + ";");
			// 			try {
			// 				console.log(data.replace(/^([\w\.]+)\s/,'Qushie.emit("gmcp.$1",') + ");");
			// 				eval(data.replace(/^([\w\.]+)\s/,'Qushie.emit("gmcp.$1",') + ");");
			// 				txt = GMCP.parseMessage(txt);
			// 				break;
			// 			} catch (err) {
			// 				console.log("GMCP: ", err);
			// 			}
			// 		}
			// 	} 
			// }
