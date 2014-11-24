var dgram = require('dgram');

var item = {host:'localhost', port:3001};
var server = dgram.createSocket('udp4');

server.on('listening', function(){
 var addr = server.address();
 console.log('UDP listening on: '+addr.address+':'+addr.port);
});

server.on('message', function(message, remote){
	console.log('[Receiver]'+message);
});

server.bind(item.port, item.host);

