// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var io = require('socket.io')(server);
// var self;

var SOCKETS_LIST = {};

function playerMovements(io) {
  io.on('connection', onSocketConnection);

  function onSocketConnection(socket){
    SOCKETS_LIST[socket.id] = socket
    console.log("GAME LOGIC socket connected with socket.id: " + socket.id);
    console.log("GAME LOGIC now we have " + Object.keys(SOCKETS_LIST).length + 
      " sockets connected: " + JSON.stringify(Object.keys(SOCKETS_LIST)));
    // self = socket
    socket.on('new player', onNewPlayer);
    socket.on('disconnect', onClientDisconnect);
    socket.on('movement', onPlayerMovement);
    socket.on('bulletShot', function(data){
        //console.log("i got to on bullet shot")
        //console.log(data.bulletX)
        socket.broadcast.emit('remotePlayerBullet', {id: data.id, x: data.bulletX, y: data.bulletY})
    });

  };

  function onPlayerMovement(data){
      var pack = {}
      console.log("GAME LOGIC on player movement")
      pack = {
        id: data.id,
        x: data.x,
        y: data.y
      }
      this.broadcast.emit('playerMovement', {id: this.id, x: data.x, y: data.y})
  };


  function onClientDisconnect(){
    console.log("GAME LOGIC i got to onClientDisconnect")
    delete SOCKETS_LIST[this.id];
    this.broadcast.emit('remove player', {id: this.id});
  };

  function onNewPlayer(){
    console.log("GAME LOGIC i got to onNewPlayer")
    for(var socketID in SOCKETS_LIST){
      if(SOCKETS_LIST.hasOwnProperty(socketID)){
        this.emit('new player', {
          id: socketID,
        });
      };
    };

    this.broadcast.emit('new player', {id: this.id});
  };

  /*server.listen(3000, function(err){
    console.log("--------listening started---------")
  }); */ 
}

module.exports = playerMovements;
// app.use('/', express.static(__dirname));