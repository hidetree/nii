var dgram = require('dgram');

var item = {host:'localhost', port:3001};
var server = dgram.createSocket('udp4');

var counter = {};

server.on('listening', function(){
 var addr = server.address();
 console.log('UDP listening on: '+addr.address+':'+addr.port);
});

server.on('message', function(message, remote){
	//console.log('[Receiver]'+message);
	var strs = message.toString().split(',');
	if(!counter[strs[2]]) counter[strs[2]]=1;
});

server.bind(item.port, item.host);

function timerAndCount(interval_ms){
	setTimeout(function(){
		var temp = new Date();
		console.log(temp.getFullYear()+'-'+temp.getMonth()+'-'+temp.getDate()+'T'+temp.getHours()+':'+temp.getMinutes()+':'+temp.getSeconds()+','+Object.keys(counter).length);
		counter = {};
		timerAndCount(interval_ms);
	}, interval_ms);
}

//timerAndCount(60000);
timerAndCount(10000);
