var SideScroller = SideScroller || {};
var specialC;
// var socket;
var bulletTime = 0;
var bullets;
var localPlayer;
var remotePlayers = {};
var REMOTE_PLAYERS = {};
var remoteBullets = {};
var locplaydirection;
// var remoteBullet; 
// var bullet;
var remplayfire;


var bGMusic;
var enemyShot;
var sad;
var death;

var mute = false;
var muteButton;
var fireButton;
var bulletHitPlayer = false;
var afterHitSpeed = 0.5;

SideScroller.Game = function(game){
  this.bg;
  this.fire;
  this.jump;
  this.getting_hit;
  this.teleport;
  this.sad;
  this.death;
};

SideScroller.Game.prototype = {
  preload: function() {
    this.game.time.advancedTiming = true;
  },
  create: function() {
    this.bg = this.add.audio('bg');
    bGMusic = this.bg;
    this.fire = this.add.audio('fire');
    enemyShot = this.fire;
    this.sad = this.add.audio('sad');
    sad = this.sad;
    this.death = this.add.audio('death');
    death = this.death;
    this.jump = this.add.audio('jump');
    this.getting_hit = this.add.audio('getting_hit');
    this.teleport = this.add.audio('teleport');


    this.stage.disableVisibilityChange = true;
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('orig_tiles_spritesheet', 'gameTiles')
    // this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.game.world.setBounds(0,0,3500,1900);

    this.blockedlayer = this.map.createLayer('blockedLayer');
    this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');
    // this.backgroundlayer.resizeWorld();
    // socket = io.connect('http://localhost:3000');
    // if(!socket){
    //   socket = io.connect();
    // }
    createRemotePlayers()
    createRemoteBullets()
    addSocketHandlers();
    localUsername = this.game.add.text(-500, -500, '', {font: "25px Comic Sans MS", fill: "white"});
    localUsername.anchor.setTo(0.5, 0.5);
    var randomLocationX = Math.floor(Math.random() * 3400) + 100;
    localPlayer = this.game.add.sprite(randomLocationX, 200, 'player');


    localPlayer.anchor.setTo(0.5, 1);
    localHealthText = this.game.add.image(-500, -500, 'heart');
    localHealthText2 = this.game.add.image(-500, -500, 'heart');
    localHealthText3 = this.game.add.image(-500, -500, 'heart');
    localHealthText.anchor.setTo(0.5, 0.5);
    localHealthText2.anchor.setTo(0.5, 0.5);
    localHealthText3.anchor.setTo(0.5, 0.5);
    localPlayer.health = 3;
    localPlayer.points = 0;
    this.game.physics.arcade.enable(localPlayer);
    this.game.camera.follow(localPlayer);
    // socket.emit('new player')

    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(3, 'bullet');
    bullets.setAll('anchor.x', 1);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    bullets.id = socket.id;
    socket.on('playerMovement', onPlayerMovement);
    localPlayer.body.gravity.y = 400;

    localPlayer.animations.add('idlee', [0,1,2]);
    localPlayer.animations.add('attackk', [3,4,5,6,7,8,9,10,11,12]);
    localPlayer.animations.add('jumpattackk', [13,14,15,16,17,18,19,20,21,22]);
    localPlayer.animations.add('jumpp', [23,24,25,26,27,28,29,30,31,32]);
    localPlayer.animations.add('runn', [33,34,35,36,37,38,39,40,41,42]);
    localPlayer.animations.add('walkk', [43,44,45,46,47,48,49,50,51,52]);

    specialC = this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE);
    this.cursors = this.game.input.keyboard.createCursorKeys();
    // socket.on('playerMovement', onPlayerMovement);  
    // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
    // var pingStart;
    // socket.on('p0ng', function()
    // {
    //   var pingEnd = new Date().getTime();
    //  console.log("Ping: %s ms", pingEnd - pingStart);
    // });
    // window.ping = function()
    // {
    //  pingStart = new Date().getTime();
    //  socket.emit('p1ng');
    // }

    // setInterval(function()
    // {
    //   socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
    // }, 96);

  },
  update: function(){

    if(muteButton && muteButton.isDown && mute == false){
      setTimeout(function(){
       mute = true;
        SideScroller.game.sound.mute = true;
      }, 150);
    } else if(muteButton && muteButton.isDown && mute == true){
      setTimeout(function(){
        mute = false;
        SideScroller.game.sound.mute = false;
      }, 150);
    }

    this.game.physics.arcade.collide(localPlayer, this.blockedlayer)
    this.game.physics.arcade.collide(remotePlayers, this.blockedlayer);
    // this.game.physics.arcade.collide(remoteBullets, localPlayer);
    localPlayer.body.velocity.x = 0;

    // localPlayer.animations.play('idlee', 5, true)
    this.game.physics.arcade.collide(remoteBullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(bullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(remoteBullets, localPlayer, processHandler, null, this);
    this.game.physics.arcade.overlap(bullets, remotePlayers, processHandler3, null, this);
    this.game.physics.arcade.overlap(remoteBullets, remotePlayers, processHandler2, null, this);
    this.game.physics.arcade.overlap(localPlayer, bullets, processHandler2, null, this);
if(fireButton){
if(fireButton.isDown) {
      localPlayer.animations.play('attackk', 40, true);
      if(this.game.time.now > bulletTime) {
          bullet = bullets.getFirstExists(false);
          if(bullet) {
              if(remplayfire === 'leftt') {
                  bullet.reset(localPlayer.x - 75, localPlayer.y + -49);
                  bullet.body.velocity.x = -400;
                  // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
              }
              else if(remplayfire === 'rightt') {
                  bullet.reset(localPlayer.x + 75, localPlayer.y + -49);
                  bullet.body.velocity.x = 400;
                  // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
              }
              socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y, direction: locplaydirection, fired: remplayfire});
              
              bulletTime = this.game.time.now + 500;
              this.fire.play();
              this.fire.volume = 0.3;
          }
      }
  }
}
    
if(!bulletHitPlayer) {
    if(this.cursors.left.isDown && specialC.isDown) {
      locplaydirection = "left";
      remplayfire = "leftt";
        playerDirectionLeft();
        localPlayer.body.velocity.x = -300;
        localPlayer.animations.play('runn', 25, true);
            // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
            localPlayer.body.velocity.y = -480;
            localPlayer.animations.play('jumpp', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;

                // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        }
    }
    else if(this.cursors.left.isDown) {
      locplaydirection = "left";
      remplayfire = "leftt";
        localPlayer.body.velocity.x = -250;
        playerDirectionLeft();
            socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
            localPlayer.body.velocity.y = -360;
            localPlayer.animations.play('jumpp', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;
                // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        }
        else {
            localPlayer.animations.play('walkk', 25, true);
        }
    }  
    else if(this.cursors.right.isDown && specialC.isDown) {
      locplaydirection = "right";
      remplayfire = 'rightt';
        playerDirectionRight();
        localPlayer.body.velocity.x = 300;
            // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        localPlayer.animations.play('runn', 25, true);
        if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
            localPlayer.body.velocity.y = -480;
            localPlayer.animations.play('jumpp', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;
                // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        } 
    }
    else if(this.cursors.right.isDown) {
      locplaydirection = "right";
      remplayfire = 'rightt';
        playerDirectionRight();
        localPlayer.body.velocity.x = 250;
        localPlayer.animations.play('walkk', 25, true);
            // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        if (this.cursors.up.isDown && localPlayer.body.blocked.down){
            localPlayer.body.velocity.y = -360;
            localPlayer.animations.play('jumpp', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;

                // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
        }   
    } 
    else if(this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
        localPlayer.body.velocity.y = -480;
        localPlayer.animations.play('jumpattackk', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;      
            // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
    }    
    else if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
        localPlayer.body.velocity.y = -360;
        localPlayer.animations.play('jumpp', 25, true);
        this.jump.play();
        this.jump.volume = 0.3;
            // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y});
    }
    else if(fireButton && fireButton.isDown) {
        localPlayer.animations.play('attackk', 40, true);
        locplaydirection = "shoot";
    }
    else {
        localPlayer.animations.play('idlee', 5, true);
        locplaydirection = "nothing";
    };
} 
else {
    if(this.cursors.left.isDown && specialC.isDown) {
      locplaydirection = "left";
      remplayfire = 'leftt';
        playerDirectionLeft();
        localPlayer.body.velocity.x = -300*afterHitSpeed;
        localPlayer.animations.play('runn', 25, true);
        if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
            localPlayer.body.velocity.y = -480*afterHitSpeed;
            localPlayer.animations.play('jumpp', 25, true);
            this.jump.play();
            this.jump.volume = 0.3;
        }
    }
    else if(this.cursors.left.isDown) {
      locplaydirection = "left";
      remplayfire = 'leftt';
        playerDirectionLeft();
        localPlayer.body.velocity.x = -250*afterHitSpeed;
            if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
                localPlayer.body.velocity.y = -360*afterHitSpeed;
                localPlayer.animations.play('jumpp', 25, true);
                this.jump.play();
                this.jump.volume = 0.3;
            }
            else {
                localPlayer.animations.play('walkk', 25, true);
            }
    }  
    else if(this.cursors.right.isDown && specialC.isDown) {
      locplaydirection = "right";
      remplayfire = 'rightt';
        playerDirectionRight();
        localPlayer.body.velocity.x = 300*afterHitSpeed;
        localPlayer.animations.play('runn', 25, true);
            if(this.cursors.up.isDown && localPlayer.body.blocked.down){
                localPlayer.body.velocity.y = -480*afterHitSpeed;
                localPlayer.animations.play('jumpp', 25, true);
                this.jump.play();
                this.jump.volume = 0.3;
            } 
    }
    else if(this.cursors.right.isDown) {
      locplaydirection = "right";
      remplayfire = 'rightt';
        playerDirectionRight();
        localPlayer.body.velocity.x = 250*afterHitSpeed;
        localPlayer.animations.play('walkk', 25, true);
            if(this.cursors.up.isDown && localPlayer.body.blocked.down){
                localPlayer.body.velocity.y = -360*afterHitSpeed;
                localPlayer.animations.play('jumpp', 25, true);
                this.jump.play();
                this.jump.volume = 0.3;
            }   
    } 
    else if(this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
        localPlayer.body.velocity.y = -480*afterHitSpeed;
        localPlayer.animations.play('jumpattackk', 25, true);
        this.jump.play();
        this.jump.volume = 0.3;      
    }    
    else if(this.cursors.up.isDown && localPlayer.body.blocked.down) {
        localPlayer.body.velocity.y = -360*afterHitSpeed;
        localPlayer.animations.play('jumpp', 25, true);
        this.jump.play();
        this.jump.volume = 0.3;
    }
    else if(fireButton.isDown) {
        localPlayer.animations.play('attackk', 40, true);
        locplaydirection = 'shoot';
    }
    else {
        localPlayer.animations.play('idlee', 5, true);
        locplaydirection = "nothing";
    };
  }
      if(localPlayer.x >= this.game.world.width) {
        localPlayer.x = 20;
        this.teleport.play();
        this.teleport.volume = 0.2;
        // localPlayer.y = 0;
      }
      if(localPlayer.x < 0) {
        localPlayer.x = this.game.world.width - 20;
        this.teleport.play();
        this.teleport.volume = 0.2;
        // localPlayer.y = 0;
      }
    // console.log("this is my x: " + localPlayer.x)
    // console.log("this is my y: " + localPlayer.y)
    // if(bullet){

    // }
    if(localUsername){
      localUsername.anchor.setTo(0.5, 0.5);
      localUsername.x = localPlayer.x;
      localUsername.y = localPlayer.y + 25;
    }
    if(localHealthText){
      // console.log("hello")
      localHealthText.anchor.setTo(0.5, 0.5);
      localHealthText.x = localPlayer.x;
      localHealthText.y = localPlayer.y - 110;
    }
    if(localHealthText2){
      localHealthText2.anchor.setTo(0.5, 0.5);
      localHealthText2.x = localPlayer.x - 50;
      localHealthText2.y = localPlayer.y - 110;
    }
    if(localHealthText3){
      localHealthText3.anchor.setTo(0.5, 0.5);
      localHealthText3.x = localPlayer.x + 50;
      localHealthText3.y = localPlayer.y - 110;
    }
    if(localPlayer.y > 1800){
      localPlayer.y = 1750;
    }
    // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
    // socket.on('playerMovement', onPlayerMovement);  
      socket.emit('movement', 
      {id: socket.id, 
        x: localPlayer.x, 
        y: localPlayer.y, 
        healthBarX: localHealthText.x, 
        healthBarY: localHealthText.y,
        healthBar2X: localHealthText2.x,
        healthBar2Y: localHealthText2.y,
        healthBar3X: localHealthText3.x,
        healthBar3Y: localHealthText3.y,
        direction: locplaydirection, 
        fired: remplayfire
      });

        if(localPlayer.health == 2){
    localHealthText3.kill();
  }
  if(localPlayer.health == 1){
    localHealthText2.kill();
  }
  if(localPlayer.health == 0){
    sad.volume = 0.5;
    sad.play();
    var bang = SideScroller.game.add.sprite(localPlayer.x, localPlayer.y - 40, 'bang');
      bang.anchor.setTo(0.5, 0.5);
      bang.animations.add('bang', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
      bang.animations.play('bang', 25)
      setTimeout(function(){
        bang.kill();
    }, 3000);
    var randomLocation = Math.floor(Math.random() * 3400) + 100;
    localHealthText.kill();
    localPlayer.health = 3;
    localPlayer.x = randomLocation
    localPlayer.y = -100
    var coins1 = SideScroller.game.add.sprite(localPlayer.x, localPlayer.y + 200, 'coins')
    var coins2 = SideScroller.game.add.sprite(localPlayer.x + 40, localPlayer.y + 200, 'coins')
    var coins3 = SideScroller.game.add.sprite(localPlayer.x - 40, localPlayer.y + 200, 'coins')
    coins1.animations.add('spinning', [0,1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,9,10]);
    coins2.animations.add('spinning', [0,1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,9,10]);
    coins3.animations.add('spinning', [0,1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,9,10]);
    coins1.animations.play('spinning', 10)
    coins2.animations.play('spinning', 10)
    coins3.animations.play('spinning', 10)
    localPlayer.body.gravity.y = 0;
    setTimeout(function(){
      coins3.kill();
    }, 1000);
    setTimeout(function(){
      coins2.kill();
    }, 2000);

    setTimeout(function(){
      coins1.kill();
      localPlayer.health = 3;
      localPlayer.body.gravity.y = 400;
      localPlayer.x = randomLocation;
      localPlayer.y = 200;
  }, 3000)
      localHealthText = SideScroller.game.add.image(-500, -500, 'heart')
      localHealthText2 = SideScroller.game.add.image(-500, -500, 'heart')
      localHealthText3 = SideScroller.game.add.image(-500, -500, 'heart')
  }

for(var i = 0; i < remotePlayers.children.length; i++){

  if(remotePlayers.children[i].hp == 2 && remotePlayers.children[i].y == 200){
    remotePlayers.children[i].heart3.kill();
    remotePlayers.children[i].heart2.kill();
    remotePlayers.children[i].heart1.kill();
    remotePlayers.children[i].hp = 3;
    remotePlayers.children[i].heart1 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart2 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart3 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart1.anchor.setTo(0.5, 0.5);
    remotePlayers.children[i].heart2.anchor.setTo(0.5, 0.5);
    remotePlayers.children[i].heart3.anchor.setTo(0.5, 0.5);
  }else if(remotePlayers.children[i].hp == 2){
    remotePlayers.children[i].heart3.kill();
  }

  if(remotePlayers.children[i].hp == 1 && remotePlayers.children[i].y == 200){
    remotePlayers.children[i].heart2.kill();
    remotePlayers.children[i].heart1.kill();
    remotePlayers.children[i].hp = 3;
    remotePlayers.children[i].heart1 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart2 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart3 = SideScroller.game.add.image(-500, -500, "heart");
    remotePlayers.children[i].heart1.anchor.setTo(0.5, 0.5);
    remotePlayers.children[i].heart2.anchor.setTo(0.5, 0.5);
    remotePlayers.children[i].heart3.anchor.setTo(0.5, 0.5);
  } else if(remotePlayers.children[i].hp == 1){
    remotePlayers.children[i].heart2.kill();
  }
  if(remotePlayers.children[i].hp == 0){
    remotePlayers.children[i].heart1.kill();
    // object.x = -500
    // object.y = -500;
      // setTimeout(function(){
        remotePlayers.children[i].hp = 3;
      // }, 2500)

      remotePlayers.children[i].heart1 = SideScroller.game.add.image(-500, -500, "heart");
      remotePlayers.children[i].heart2 = SideScroller.game.add.image(-500, -500, "heart");
      remotePlayers.children[i].heart3 = SideScroller.game.add.image(-500, -500, "heart");
      remotePlayers.children[i].heart1.anchor.setTo(0.5, 0.5);
      remotePlayers.children[i].heart2.anchor.setTo(0.5, 0.5);
      remotePlayers.children[i].heart3.anchor.setTo(0.5, 0.5);


    // socket.emit('remote player killed', {myId: localPlayer.id, remoteId: object.id})
   }
 }

  },
  render: function(){
    // this.game.debug.text(Math.round(this.game.time.totalElapsedSeconds()*1)/1 || "---", 25, 60, "#A9BCF5", "40px Courier");
    // this.game.debug.text(Math.round("Boost: " + boostAmt || "---", 25, 160, "#A9BCF5", "40px Courier");
      
  }

};
function addSocketHandlers(){
  // console.log("i got to addSocketHandlers")
  socket.on('connect', onSocketConnect);
  socket.on('new player', onNewRemotePlayer);
  socket.on('remove player', onRemovePlayer);
  socket.on('playerMovement', onPlayerMovement);
  socket.on('remotePlayerBullet', onRemotePlayerBullet);
  socket.on('login successful', function(data){
    localPlayer.username = data.username;
    localPlayer.users = data.users;
    localUsername.setText(localPlayer.username)
    fireButton = SideScroller.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    muteButton = SideScroller.game.input.keyboard.addKey(Phaser.Keyboard.M)
    bGMusic.play('',0,0.25,true);
  });
  socket.on('user joined',function(data){
    localPlayer.users = data.users;
  });
  socket.on('change points s2c',function(data){
    localPlayer.users = data.users;
  });
  socket.on('local player damage', function(){
    localPlayer.health -= 1;
  })

};

function onSocketConnect(){
  // console.log("i got to onSocketConnect")
  socket.emit('new player')
};

function onPlayerMovement(data)
{
  // var $stats = document.getElementById('stats');
  // $stats.innerText = JSON.stringify(data, "\t", 4);
  // console.log('Remote players movement', data);
  // console.log("remote player's x: " + data.x)
  // console.log("remote player's y: " + data.y)
  // if(remotePlayers[data.id].id == data.id) {
    // var id = "/#" + data.id;
    // console.log("i got to on player movement")
    // console.log("this is on player movement" + data.id)
    // console.log("this is on player movement" + remotePlayers[data.id])

  for(var i = 0; i < remotePlayers.children.length; i++){

      if(remotePlayers.children[i].id == data.id){
              if(data.direction) {
              // remotePlayers.children[i].animations.play('walkk', 25, true);
              // remotePlayers.children[i].animations.play('walkk', 25, true);  
              if(data.direction === 'left'){
                remotePlayers.children[i].anchor.setTo(.5, 1); 
                remotePlayers.children[i].scale.x = -1;
                remotePlayers.children[i].animations.play('walkk', 25, true);
              }
              else if(data.direction === 'right') {
                remotePlayers.children[i].anchor.setTo(.5, 1); 
                remotePlayers.children[i].scale.x = 1;
                remotePlayers.children[i].animations.play('walkk', 25, true);
              }
              else if(data.direction === 'nothing') {
                remotePlayers.children[i].animations.play('idlee', 5, true);
              }
              else if(data.direction === 'shoot') {
                remotePlayers.children[i].animations.play('attackk', 40, true);
              }
            }

        // console.log(remotePlayers.children[i].id + " this is remote players id")
        // console.log(data.id + " this is data.id")
        remotePlayers.children[i].heart1.x = data.healthX;
        remotePlayers.children[i].heart1.y = data.healthY;
        remotePlayers.children[i].heart2.x = data.health2X;
        remotePlayers.children[i].heart2.y = data.health2Y;
        remotePlayers.children[i].heart3.x = data.health3X;
        remotePlayers.children[i].heart3.y = data.health3Y;
        remotePlayers.children[i].x = data.x;
        remotePlayers.children[i].y = data.y;
      }
  }

    // remotePlayers[data.id].animations.play('walkk', 25, true);
  // }
}

function playerDirectionLeft() {
    localPlayer.anchor.setTo(.5, 1); 
    localPlayer.scale.x = -1;
}

function playerDirectionRight() {
    localPlayer.anchor.setTo(.5, 1);
    localPlayer.scale.x = 1;
}

function onRemotePlayerBullet(data) {

  this.remoteBullet = remoteBullets.create(
    data.x,
    data.y - 18,
    'bullet'
  );
  this.remoteBullet.id = data.id

  this.remoteBullet.enableBody = true;
  SideScroller.game.physics.enable(this.remoteBullet,Phaser.Physics.ARCADE);
  
  this.remoteBullet.physicsBodyType = Phaser.Physics.ARCADE;
  // this.remoteBullet.body.velocity.x = 400;
  if(data.fired === 'rightt') {
    this.remoteBullet.body.velocity.x = 400;
    // remoteBullet.reset(localPlayer.x - 139, localPlayer.y + -149);
  }
  else if(data.fired === 'leftt') {
    this.remoteBullet.body.velocity.x = -400;
    // remoteBullet.reset(localPlayer.x - 139, localPlayer.y + -149);
  }
  if(data.x + 500 < localPlayer.x || data.x - 500 < localPlayer.x){
    enemyShot.play();
    enemyShot.volume = 0.3;
  }

}

function onNewRemotePlayer(data){
  // console.log("i got to onNewRemotePlayer")
  // console.log(data.id)
  REMOTE_PLAYERS[data.id] = {
    id: data.id
  };
  remotePlayers[data.id] = {
    id: data.id
  };
  // console.log(socket.id)
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

  // console.log("i got to create remote player")

  remotePlayer = remotePlayers.create(
    100,
    100,
    'player'
    );
  var color = Math.random() * 0xffffff;
  // remotePlayer.anchor.setTo(0.5, 0.5);
  SideScroller.game.physics.enable(remotePlayer, Phaser.Physics.ARCADE);
  remotePlayer.enableBody = true;
  remotePlayer.body.collideWorldBounds = true;
  remotePlayer.name = player;
  remotePlayer.body.immovable = true;
  remotePlayer.id = data.id;
  // remotePlayer.blendMode = PIXI.blendModes.ADD;
  remotePlayer.tint = color;
  remotePlayer.body.gravity.y = 400;
  remotePlayer.anchor.setTo(0.5, 1);
  remotePlayer.heart1 = SideScroller.game.add.image(-500, -500, "heart");
  remotePlayer.heart2 = SideScroller.game.add.image(-500, -500, "heart");
  remotePlayer.heart3 = SideScroller.game.add.image(-500, -500, "heart");
  remotePlayer.heart1.anchor.setTo(0.5, 0.5)
  remotePlayer.heart2.anchor.setTo(0.5, 0.5)
  remotePlayer.heart3.anchor.setTo(0.5, 0.5)
  remotePlayer.hp = 3;
  // console.log(remotePlayers[player])
  remotePlayers.add(remotePlayer);
  remotePlayer.animations.add('idlee', [0,1,2]);
  remotePlayer.animations.add('attackk', [3,4,5,6,7,8,9,10,11,12]);
  remotePlayer.animations.add('jumpattackk', [13,14,15,16,17,18,19,20,21,22]);
  remotePlayer.animations.add('jumpp', [23,24,25,26,27,28,29,30,31,32]);
  remotePlayer.animations.add('runn', [33,34,35,36,37,38,39,40,41,42]);
  remotePlayer.animations.add('walkk', [43,44,45,46,47,48,49,50,51,52]);  
}

function onRemovePlayer(data){
  // console.log("i got to onRemovePlayer")
  // console.log(remotePlayers.children)
  for(var i = 0; i < remotePlayers.children.length; i++){
    if (remotePlayers.children[i].id == data.id) {
        remotePlayers.children[i].heart1.kill();
        remotePlayers.children[i].heart2.kill();
        remotePlayers.children[i].heart3.kill();
        remotePlayers.children[i].kill();
        // remotePlayers.children.splice(1, i)
        // console.log(remotePlayers.children.length)
        // console.log(remotePlayers.children.length)
    }
  }
  // remotePlayers.children[data.id].kill();
  delete REMOTE_PLAYERS[data.id];

}

function processHandler(bullet, object){
  // console.log("i got to process handler")
  // console.log(bullet)
  // console.log(object)
  object.kill();
  bulletHitPlayer = true;
  socket.emit('took damage')
  this.getting_hit.play();
  this.getting_hit.volume = 0.2;
  setTimeout(fasterFunc, 3000);
  // console.log(bulletHitPlayer);
}

function fasterFunc(){
  bulletHitPlayer = false;
}

function processHandler3(bullet, object){
  // console.log("i got to process handler")
  // console.log(bullet)
  // console.log(object)
  object.hp -= 1;
  // console.log(localPlayer.users);
  if(object.hp == 0){
      console.log("got to bang")
      death.volume = 0.3;
      death.play();
      var bang = SideScroller.game.add.sprite(object.x, object.y - 40, 'bang');
      bang.anchor.setTo(0.5, 0.5);
      bang.animations.add('bang', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
      bang.animations.play('bang', 25)
      setTimeout(function(){
        bang.kill();
      }, 3000);
    for(var i=0; i < localPlayer.users.length; i++){
      if(localPlayer.users[i].username === localPlayer.username){
        localPlayer.users[i].score += 1;
      };
    };
    socket.emit('change points', {
      users: localPlayer.users,
      username: localPlayer.username
    })
    // console.log(localPlayer.users);
  }
  bullet.kill();
}

function collisionHandler(bullet1, object){
  // console.log("i got to collision handler!")
  bullet1.kill();
}

function processHandler2(bullet, object){
  console.log(bullet.id)
  console.log(object.id)
  // console.log("i got to process handler")
  // console.log(bullet)
  // console.log(object)
  if("/#"+ bullet.id != object.id){
    object.hp -= 1;
    if(object.hp == 0){
      death.volume = 0.3;
      death.play();
      console.log("got to bang")
      var bang = SideScroller.game.add.sprite(object.x, object.y - 40, 'bang');
      bang.anchor.setTo(0.5, 0.5);
      bang.animations.add('bang', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
      bang.animations.play('bang', 25)
      setTimeout(function(){
        bang.kill();
      }, 3000);
    }
  }
  // if(object.hp == 0){
  //   localPlayer.points += 50;
    
  // }
  if(bullet != localPlayer){
   bullet.kill();
  } else {
    object.kill();
  }
}


// function onRemovePlayer(data){
//     console.log("i got to onRemovePlayer")
//     delete REMOTE_PLAYERS[data.id];
// }