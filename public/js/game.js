var SideScroller = SideScroller || {};
var specialC;
var bulletTime = 0;
var bullets;
var localPlayer;
var remotePlayers = {};
var REMOTE_PLAYERS = {};
var remoteBullets = {};
// var remoteBullet; 
var bullet;
var socket
var bulletHitPlayer = false;
var afterHitSpeed = 0.5;
// var fullLobby = false;
SideScroller.Boot = function(){};

//setting game configuration and loading assets for the loading screen.

SideScroller.Boot.prototype = {
  preload: function(){
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');
  },

  create: function(){
    this.game.stage.backgroundColor = "#87CEFA";
    this.stage.disableVisibilityChange = false;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    // this.scale.setScreenSize(true);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.state.start('Preload');
  }
}

SideScroller.Preload = function(){};

SideScroller.Preload.prototype = {
  preload: function(){
    this.preloadbar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadbar.anchor.setTo(0.5, 0.5);
    this.preloadbar.scale.setTo(3);
    this.load.setPreloadSprite(this.preloadbar);

    this.load.tilemap('level1', 'assets/tilemaps/map10.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/orig_tiles_spritesheet2.png');
    this.load.spritesheet('player', 'assets/images/enemymoving.png', 68, 96);
    // this.load.image('playerDuck', 'assets/images/player_duck.png');
    // this.load.image('playerDead', 'assets/images/player_dead.png');
    // this.load.image('goldCoin', 'assets/images/goldCoin.png');
    // this.load.audio('coin', 'assets/audio/coin.wav');
    this.load.image('bullet', '/assets/images/bullet.png')
  },

  create: function(){
    this.state.start('Game');
    // socket = io.connect('http://localhost:3000');

    // socket.name = "yoooo"
    // console.log(socket.name + Math.random())
    // console.log(socket)
    // socket.emit('lobby', {name: socket.name})
    // socket.on('gameStart', checkIfPlayer);

  },

  // update: function(){
  //   // if(fullLobby == true){

  //   // }
  // }
}


SideScroller.Game = function(){};

SideScroller.Game.prototype = {
  preload: function(){
    this.game.time.advancedTiming = true;
  },
  create: function(){
    // this.Stage.disableVisibilityChange = true;
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('orig_tiles_spritesheet', 'gameTiles')
    // this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.game.world.setBounds(0,0,7700,1540);

    this.blockedlayer = this.map.createLayer('blockedLayer');
    // this.blockedlayer.debug = true;
    this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');
    // this.backgroundlayer.resizeWorld();
    // if(socket == undefined){
    // }
    socket = io.connect('http://localhost:3000');
    createRemotePlayers()
    createRemoteBullets()
    addSocketHandlers();

    localPlayer = this.game.add.sprite(100, 200, 'player');

    this.game.physics.arcade.enable(localPlayer);
    this.game.camera.follow(localPlayer);


    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(3, 'bullet');
    bullets.setAll('anchor.x', 1);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    socket.on('playerMovement', onPlayerMovement);
    localPlayer.body.gravity.y = 800;
    // remotePlayers.animations.add('walkk', 25, true); 
    localPlayer.animations.add('idlee', [0,1,2]);
    localPlayer.animations.add('attackk', [3,4,5,6,7,8,9,10,11,12]);
    localPlayer.animations.add('jumpattackk', [13,14,15,16,17,18,19,20,21,22]);
    localPlayer.animations.add('jumpp', [23,24,25,26,27,28,29,30,31,32]);
    localPlayer.animations.add('runn', [33,34,35,36,37,38,39,40,41,42]);
    localPlayer.animations.add('walkk', [43,44,45,46,47,48,49,50,51,52]);
    specialC = this.game.input.keyboard.addKey(Phaser.KeyCode.TILDE);
    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors = this.game.input.keyboard.createCursorKeys();
    // socket.on('playerMovement', onPlayerMovement);  
    // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
  },
  update: function(){
    this.game.physics.arcade.collide(localPlayer, this.blockedlayer)
    this.game.physics.arcade.collide(remotePlayers, this.blockedlayer);
    // this.game.physics.arcade.collide(remoteBullets, localPlayer);
    localPlayer.body.velocity.x = 0;

    // localPlayer.animations.play('idlee', 5, true)
    this.game.physics.arcade.collide(remoteBullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(bullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(remoteBullets, localPlayer, processHandler, null, this);
    this.game.physics.arcade.overlap(bullets, remotePlayers, processHandler2, null, this);
    // this.game.physics.arcade.collide(remotePlayers, localPlayer);
    // if (this.fireButton.isDown){
    //   localPlayer.animations.play('attackk', 25, true);
    //   if (this.game.time.now > bulletTime) {
    //     bullet = bullets.getFirstExists(false);
    //     if (bullet) {
    //             //Bullet origin
    //             bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
    //             //Bullet speed
    //             bullet.body.velocity.x = 400;
    //             socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
    //             console.log("this is my bullet's x: "+ bullet.x);
    //             console.log("this is my bullet's y: "+ bullet.y);
    //             // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y})
    //             bulletTime = this.game.time.now + 500;
    //     }
    //   }
    // } 
    
    if(!bulletHitPlayer){
    if (this.cursors.left.isDown && specialC.isDown) {
          localPlayer.body.velocity.x = -300;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
              localPlayer.body.velocity.y = -690;
              localPlayer.animations.play('jumpp', 25, true);
          }
    }
    else if (this.cursors.left.isDown) {
            localPlayer.body.velocity.x = -250;
      // localPlayer.animations.play('walkk', 25, true);
      if (this.cursors.up.isDown && localPlayer.body.blocked.down){
        localPlayer.body.velocity.y = -580;
        localPlayer.animations.play('jumpp', 25, true);
      }
      else {
        localPlayer.animations.play('walkk', 25, true);
      }
    }  
    else if (this.cursors.right.isDown && specialC.isDown) {
          localPlayer.body.velocity.x = 300;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -690;
              localPlayer.animations.play('jumpp', 25, true);
          } 
    }
    else if (this.cursors.right.isDown) {
          localPlayer.body.velocity.x = 250;
          localPlayer.animations.play('walkk', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -580;
              localPlayer.animations.play('jumpp', 25, true);
          }   
    } 
    else if (this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -690;
          localPlayer.animations.play('jumpattackk', 25, true);      
    }    
    else if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -580;
          localPlayer.animations.play('jumpp', 25, true);
    }


    else if (this.fireButton.isDown){
          localPlayer.animations.play('attackk', 25, true);
          if (this.game.time.now > bulletTime) {
              bullet = bullets.getFirstExists(false);
              if (bullet) {
                  //Bullet origin
                  bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
                  //Bullet speed
                  bullet.body.velocity.x = 400;
                  //Bullet fire rate
                  console.log("this is my bullet's x: "+ bullet.x);
                  console.log("this is my bullet's y: "+ bullet.y);
                  socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  bulletTime = this.game.time.now + 500;
              }
          }
    }
    else {
        localPlayer.animations.play('idlee', 5, true);
    };
  } else {
        if (this.cursors.left.isDown && specialC.isDown) {
          localPlayer.body.velocity.x = -300*afterHitSpeed;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
              localPlayer.body.velocity.y = -690*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          }
    }
    else if (this.cursors.left.isDown) {
            localPlayer.body.velocity.x = -250*afterHitSpeed;
      // localPlayer.animations.play('walkk', 25, true);
      if (this.cursors.up.isDown && localPlayer.body.blocked.down){
        localPlayer.body.velocity.y = -580*afterHitSpeed;
        localPlayer.animations.play('jumpp', 25, true);
      }
      else {
        localPlayer.animations.play('walkk', 25, true);
      }
    }  
    else if (this.cursors.right.isDown && specialC.isDown) {
          localPlayer.body.velocity.x = 300*afterHitSpeed;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -690*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          } 
    }
    else if (this.cursors.right.isDown) {
          localPlayer.body.velocity.x = 250*afterHitSpeed;
          localPlayer.animations.play('walkk', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -580*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          }   
    } 
    else if (this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -690*afterHitSpeed;
          localPlayer.animations.play('jumpattackk', 25, true);      
    }    
    else if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -580*afterHitSpeed;
          localPlayer.animations.play('jumpp', 25, true);
    }


    else if (this.fireButton.isDown){
          localPlayer.animations.play('attackk', 25, true);
          if (this.game.time.now > bulletTime) {
              bullet = bullets.getFirstExists(false);
              if (bullet) {
                  //Bullet origin
                  bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
                  //Bullet speed
                  bullet.body.velocity.x = 400;
                  //Bullet fire rate
                  console.log("this is my bullet's x: "+ bullet.x);
                  console.log("this is my bullet's y: "+ bullet.y);
                  socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  bulletTime = this.game.time.now + 500;
              }
          }
    }
    else {
        localPlayer.animations.play('idlee', 5, true);
    };
  }
      if(localPlayer.x >= this.game.world.width) {
        this.game.state.start('Game');
      }
    // console.log("this is my x: " + localPlayer.x)
    // console.log("this is my y: " + localPlayer.y)
    // if(bullet){

    // }
    socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
    // socket.on('playerMovement', onPlayerMovement);  
  },
  render: function(){
    this.game.debug.text(this.game.time.fps || "---", 20, 70, "#00ff00", "40px Courier");

    // Sprite debug info
    this.game.debug.spriteInfo(localPlayer, 32, 32);

}
  

};

function addSocketHandlers(){
  console.log("i got to addSocketHandlers")
  socket.on('connect', onSocketConnect);
  socket.on('new player', onNewRemotePlayer);
  socket.on('remove player', onRemovePlayer);
  socket.on('playerMovement', onPlayerMovement);
  socket.on('remotePlayerBullet', onRemotePlayerBullet);

};

function onSocketConnect(){
  console.log("i got to onSocketConnect")
  socket.emit('new player')
};

function onPlayerMovement(data){
  // console.log("remote player's x: " + data.x)
  // console.log("remote player's y: " + data.y)
  // if(remotePlayers[data.id].id == data.id) {
    // var id = "/#" + data.id;
    // console.log("i got to on player movement")
    // console.log("this is on player movement" + data.id)
    // console.log("this is on player movement" + remotePlayers[data.id])
  remotePlayers[data.id].x = data.x;
  remotePlayers[data.id].y = data.y;
    // remotePlayers[data.id].animations.play('walkk', 25, true);
  // }
}

function onRemotePlayerBullet(data) {
  console.log("i got to on remote player bullet")
  console.log("remote player's bullet x: " + data.x);
  console.log(data.y);

  this.remoteBullet = remoteBullets.create(
    data.x,
    data.y - 13,
    'bullet'
    )
  this.remoteBullet.body.velocity.x = 400;
  // console.log(remoteBullet.body)
  // remoteBullet.x = data.x;
  // remoteBullet.y = data.y + 5;
  // remoteBullet = bullet;
  // bullet.body.velocity.x = 400;
  this.remoteBullet.enableBody = true;
  SideScroller.game.physics.enable(this.remoteBullet,Phaser.Physics.ARCADE);
  
  this.remoteBullet.physicsBodyType = Phaser.Physics.ARCADE;
  this.remoteBullet.body.velocity.x = 400;
}

function onNewRemotePlayer(data){
  console.log("i got to onNewRemotePlayer")
  console.log(data.id)
  REMOTE_PLAYERS[data.id] = {
    id: data.id
  };
  remotePlayers[data.id] = {
    id: data.id
  };
  console.log(socket.id)
  if(data.id != "/#" + socket.id){
    createRemotePlayer(data);
    createRemoteBullets()
  }
};

function createRemoteBullets(){
  remoteBullets = SideScroller.game.add.group();
  remoteBullets.enableBody = true;
  remoteBullets.physicsBodyType = Phaser.Physics.ARCADE;
}

function createRemotePlayers(){
  console.log("i got to create remote players")
  remotePlayers = SideScroller.game.add.group();
  remotePlayers.enableBody = true;
  remotePlayers.physicsBodyType = Phaser.Physics.ARCADE;
}

function createRemotePlayer(data){
  var player = data.id;
  var remotePlayer;

  console.log("i got to create remote player")

  remotePlayer = remotePlayers.create(
    100,
    100,
    'player'
    );
  var color = Math.random() * 0xffffff
  // remotePlayer.anchor.setTo(0.5, 0.5);
  SideScroller.game.physics.enable(remotePlayer, Phaser.Physics.ARCADE);
  remotePlayer.enableBody = true;
  remotePlayer.body.collideWorldBounds = true;
  remotePlayer.name = player;
  remotePlayer.body.immovable = true;
  // remotePlayer.blendMode = PIXI.blendModes.ADD;
  remotePlayer.alpha = 0.7;
  remotePlayer.tint = color;
  remotePlayer.body.gravity.y = 1000;
  remotePlayers[player] = remotePlayer;
  // console.log(remotePlayers[player])
}

function onRemovePlayer(data){
  console.log("i got to onRemovePlayer")
  remotePlayers[data.id].kill();
  delete REMOTE_PLAYERS[data.id];
}

function processHandler(bullet, object){
  console.log("i got to process handler")
  console.log(bullet)
  console.log(object)
  object.kill();
  bulletHitPlayer = true;
  setTimeout(fasterFunc, 3000);
  console.log(bulletHitPlayer);
}

function fasterFunc(){
  bulletHitPlayer = false;
}

function checkIfPlayer(data){
  // console.log(data.id);
  // if(data.players[0] != socket.name ||
  //   data.players[1] != socket.name ||
  //   data.players[2] != socket.name ||
  //   data.players[3] != socket.name
  //   ) {
       fullLobby = true;
  // }consol
}

function processHandler2(bullet, object){
  console.log("i got to process handler")
  console.log(bullet)
  console.log(object)
  bullet.kill();
}

function collisionHandler(bullet1, object){
  console.log("i got to collision handler!")
  bullet1.kill();
}

// function onRemovePlayer(data){
//     console.log("i got to onRemovePlayer")
//     delete REMOTE_PLAYERS[data.id];
// }