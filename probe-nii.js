var pcap = require('pcap');
var util = require('util');
var fs = require('fs');
var dgram = require('dgram');
var dclient = dgram.createSocket('udp4');
var crypto = require('crypto');
var HashMap = require('hashmap').HashMap;
var map = new HashMap();
var mapBool = true;
var isBeaconSending = false;
var udpPort = 3000;
var udpServer = 'localhost';

//var Schema = require('protobuf').Schema;
//var schema = new Schema(fs.readFileSync('conf/wifiUpdtMsg.desc'));

var ap_mac_example = 1234567;

var conf = undefined;
var route = require('./conf/route2.json');
var apMeta = require('./conf/apMeta.json');

//LINKTYPE_IEEE802_11_RADIO is defined as LinkType
//var pcapSession = pcap.createSession('en1', 'tcp');
//var pcapSession = pcap.createSession('en1', 'ether broadcast'); //en0 -> MacBook Air, en1 -> others
var pcapSession = pcap.createSession('en1', 'ether broadcast', undefined, true); //en0 -> MacBook Air, en1 -> others

pcapSession.on('packet', function(packet){

 try{
  if(packet.pcap_header.link_type == 'LINKTYPE_IEEE802_11_RADIO'){
   var packet2 = pcap.decode.ieee802_11_radio(packet, 0);
   var ieee802frame = packet2.ieee802_11Frame;
   //subType=4 is probe, 8 is beacon
   if(ieee802frame.subType == 4 ){
	   var strs = ieee802frame.shost.split(':');
	   var oui = "";
	   var devi = "";
	   if(strs.length == 6){
		   oui = strs[0]+strs[1]+strs[2];
		   devi = strs[3]+strs[4]+strs[5];
	   }
	   var tmpi = new Buffer(devi);
	   var digest = crypto.createHash('sha1').update(tmpi).digest('base64');
	   var now = new Date();
	   var result = apMeta.id+","+now.toJSON()+","+oui+","+digest+","+packet2.ssiSignal+"," +packet2.ssiNoise+","+packet2.ssiChType1+","+packet2.ssiChType2+","+ieee802frame.subType;
	   //console.log(result);
	   console.log(apMeta.id+','+now.toJSON()+','+ieee802frame.shost+','+packet2.ssiSignal+','+packet2.ssiNoise+','+4);	   
   }
   else if(ieee802frame.subType == 8){
	if(mapBool && map.get(ieee802frame.shost) == undefined){
		var strs = ieee802frame.shost.split(':');
		var oui = "";
		var devi = "";
		if(strs.length == 6){
			oui = strs[0]+strs[1]+strs[2];
			devi = strs[3]+strs[4]+strs[5];
		}
		var tmpi = new Buffer(devi);
		var digest = crypto.createHash('sha1').update(tmpi).digest('base64');
		var now = new Date();
		var result = apMeta.id+","+now.toJSON()+","+oui+","+digest+","+packet2.ssiSignal+","+packet2.ssiNoise+","+packet2.ssiChType1+","+packet2.ssiChType2+","+ieee802frame.subType;
		console.log(apMeta.id+','+now.toJSON()+','+ieee802frame.shost+','+packet2.ssiSignal+','+packet2.ssiNoise+','+8);
		map.set(ieee802frame.shost, result);
		if(now.getSeconds() == 30){
			mapBool = false;
		}
	}else if(mapBool){
		var now = new Date();
		if(now.getSeconds() == 30){
			mapBool = false;
		}
	}else{
	}

   }
  }
 }catch(e){
 }
});
