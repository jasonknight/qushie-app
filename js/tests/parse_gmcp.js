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


txt = 'ÿúÉcomm.tick {}ÿð-->[1;37m TICK [0;37m<-- (All: 100%, Qt: 0)';
txt += 'ÿúÉchar.status { "level": 9, "tnl": 1964, "hunger": 0, "thirst": 0, "align": 2494, "state": 3, "pos": "Standing" , "enemy": "" }ÿð';
txt += 'SantaClaws wakes and stands up.';
txt += '   ';
txt += 'ÿúÉcomm.tick {}ÿð[1;31m[1;31mWARFARE: A [1;36mClan[1;31m war has been declared by Ivar for levels [1;33m15[1;31m to [1;33m137[1;31m![0;37m[0;37m';
txt += '[1;31m[1;31mWARFARE: The preparation grounds shall close in approx 2 minutes![0;37m';
txt += '[1;31m[1;31mWARFARE: Type \'combat\' to join the war. No death penalties![0;37m';
txt += '-->[1;37m TICK [0;37m<-- (All: 100%, Qt: 0)';
txt += 'ÿúÉchar.status { "level": 9, "tnl": 1964, "hunger": 0, "thirst": 0, "align": 2494, "state": 3, "pos": "Standing" , "enemy": "" }ÿð';

function parseMessage(txt) {
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
					console.log("Packet: ", pkt);
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
	console.log("Data: ", data);
}

parseMessage(txt);