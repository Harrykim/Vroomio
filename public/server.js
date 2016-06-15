var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
// var io = require('../..')(server)
var io = require('socket.io')(server); 
var port = process.env.PORT || 3000;
var users = [];
var playerMovement = require('./server');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var self;

var SOCKETS_LIST = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', onSocketConnection);

function onSocketConnection(socket){
  SOCKETS_LIST[socket.id] = socket
  console.log(socket.id + " connected");
  self = socket
  socket.on('new player', onNewPlayer);
  socket.on('disconnect', onClientDisconnect);
  socket.on('movement', onPlayerMovement);
  socket.on('bulletShot', function(data){
      //console.log("i got to on bullet shot")
      console.log(data.bulletX)
      socket.broadcast.emit('remotePlayerBullet', {id: data.id, x: data.bulletX, y: data.bulletY})
  });

};

function onPlayerMovement(data){
    var pack = {}
    console.log("on player movement")
    pack = {
      id: data.id,
      x: data.x,
      y: data.y
    }
    this.broadcast.emit('playerMovement', {id: this.id, x: data.x, y: data.y})
};


function onClientDisconnect(){
 // console.log("i got to onClientDisconnect")
  delete SOCKETS_LIST[this.id];
  this.broadcast.emit('remove player', {id: this.id});
};

function onNewPlayer(){
//console.log("i got to onNewPlayer")
  for(var socketID in SOCKETS_LIST){
    if(SOCKETS_LIST.hasOwnProperty(socketID)){
      this.emit('new player', {
        id: socketID,
      });
    };
  };

  this.broadcast.emit('new player', {id: this.id});
};

server.listen(3000, function(err){
  console.log("--------listening started---------")
});