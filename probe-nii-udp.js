var pcap = require('pcap');
var dgram = require('dgram');
var dclient = dgram.createSocket('udp4');

var apMeta = require('./conf/apMeta.json');
var item = {host:'localhost', port:3001};

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
	   var now = new Date();
	   //console.log(apMeta.id+','+now.toJSON()+','+ieee802frame.shost+','+packet2.ssiSignal+','+packet2.ssiNoise+','+4);	   
	   var result = apMeta.id+','+now.toJSON()+','+ieee802frame.shost+','+packet2.ssiSignal+','+packet2.ssiNoise+','+4;
	   var buf = new Buffer(result);
	   dclient.send(buf, 0, buf.length, item.port, item.host, function(err, bytes){
		   if(err){
			   console.log(err);
			   return;
		   }
	   });
   }
   else if(ieee802frame.subType == 8){
   }
  }
 }catch(e){
 }
});
