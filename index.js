
// Setup basic express server
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
// var io = require('../..')(server)
var io = require('socket.io')(server); 
var port = process.env.PORT || 3000;
var users = [];

var playerMovement = require('./server');
var clickedhost = false;

var util = require('util');

var inspect = function(o, d)
{
  console.log(util.inspect(o, { colors: true, depth: d || 1 }));
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


// MongoDB
mongoose.connect('mongodb://localhost/point', function(err){
  if(err){
    console.log(err);

  } else {
    console.log('Connection to mongodb');
  };
});

var pointSchema = mongoose.Schema({
  username: String, 
  points: Number,
  created: {type: Date, default: Date.now}
});

var Point = mongoose.model('Message',pointSchema);

// Routing
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next)
{
  if(req.url === '/admin')
  {
    res.end(JSON.stringify(getUsers()));
  }
  else
  {
    next(req, res);
  }
})

// Chatroom

var numUsers = 0;
// var USERS = {};

function getUsers()
{
  var ret = {};
  Object.keys(io.sockets.sockets).forEach(function(socketId)
  {
    ret[socketId] = io.sockets.sockets[socketId].state;
  });
  return ret;
}


io.on('connection', function (socket) {




  socket.state = {
    username: "",
    score: 0,
    hosting: false,
    typing: false
  };

  // console.log(Point.find({}));
  // console.log('User connected. %s', socket.id);
  // inspect(io, 1);
  var addedUser = false;
  // console.log(socket.id)


    socket.emit('check',{
      users: users
    });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    // console.log(socket.username);
    // console.log(socket.state.username);
      socket.broadcast.emit('new message', {
      username: socket.state.username,
      message: data
    });
  });

  socket.on('add join event', function (data)
  { 
    socket.state.hosting = true;
    // console.log(data);
    data.hosting = true;
    // console.log(data);
    // for (var key in tHash){
    //   if (key == "name") doSomething();
    // }
  

    io.emit('add join event others', data);
  });

  socket.on('cancel video event', function (data){
    console.log(data);

    // socket.state.hosting = false
    data.hosting = false
    io.emit ('cancel join event others', data);
  })

  // socket.on('add user', function (data)
  // {
  //   socket.state.username = socket.username;
  //   io.emit('online', data);
  // });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;
    if (users.indexOf(username)!= -1){
      socket.emit('invalid user', username);
      return;
    }
 

    // we store the username in the socket session for this client


    socket.state.username = username;

    ++numUsers;
    addedUser = true;
    users.push({username:socket.state.username, hosting: socket.state.hosting});

    socket.emit('login successful', { 
      username: username,
      numUsers: numUsers,
      hosting: socket.state.hosting,
      users: users,
      allusers: getUsers()
    });

    var newPoint = new Point({username: username, points: 0});
    newPoint.save(function(err){
      if (err) throw err;
    });
 
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.state.username,
      numUsers: numUsers,
      users: users
    });
    // console.log(socket.username);  
    // console.log(socket.state.username);
    socket.emit('online', {
    username: socket.state.username,
    numUsers: numUsers,
    hosting: socket.state.hosting,
    users: users,
    allusers: getUsers()
    });

     // console.log(getUsers());


  });


  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    // console.log(socket.username);
    socket.broadcast.emit('typing', {

      username: socket.state.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.state.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      // delete a user
      var index = users.indexOf(socket.username);
      // console.log("BEFORE SPLICE "+ users);
      users.splice(index, 1);
      // console.log("AFTER SPLICE "+ users);
      // users.delete();

      // echo globally that this client has left
      // console.log("THI IS USERNMAE "+ username);
      // console.log("THIS IS SOCKET USERNAME "+socket.username);
      console.log("THIS IS SECOND NAME "+ socket.state.username);
      socket.broadcast.emit('user left', {
        username: socket.state.username,
        numUsers: numUsers,
        users: users
      });
    }

  });

  socket.on('update hosting',function(data){
    // console.log("UPDATE HOSTING " +data.users);
    users = data.users;
    // console.log("UPDATE HOSTING" + users);
  });

  socket.on('cancelimg',function(){
    socket.emit('cancelimg', {
      username: socket.state.username,
      users: users
    });
  });
});

// console.log(playerMovement);
playerMovement(io);
