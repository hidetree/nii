var dgram = require('dgram');
var fs = require('fs');

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
		console.log(new Date().toJSON()+','+Object.keys(counter).length);
		fs.appendFileSync('./log/counter.local.log', new Date().toJSON()+','+Object.keys(counter).length+'\n');
		fs.appendFileSync('./log/'+new Date().toJSON(), JSON.stringify(counter));
		counter = {};
		timerAndCount(interval_ms);
	}, interval_ms);
}

//timerAndCount(60000);
timerAndCount(10000);
