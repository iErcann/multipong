
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
 


app.use(express.static(path.join(__dirname, 'public')));

function count(array, element) { 
	var count = 0;
	for(var i = 0; i < array.length; ++i){
	    if(array[i] === element)
	        count++;
	}
	return count;
}

function getIndex(id) {
	 return clients.indexOf( clients.find((client)=> {
        return client.id_ === id
     })); 
}


function getRoomIndex(name){
	 return rooms.indexOf( rooms.find((room)=> {
        return room.name === name
     })); 
}
function collideRectCircle  (rx, ry, rw, rh, cx, cy, diameter) {
  //2d
  // temporary variables to set edges for testing
  var testX = cx;
  var testY = cy;

  // which edge is closest?
  if (cx < rx){         testX = rx       // left edge
  }else if (cx > rx+rw){ testX = rx+rw  }   // right edge

  if (cy < ry){         testY = ry       // top edge
  }else if (cy > ry+rh){ testY = ry+rh }   // bottom edge

  // // get distance from closest edges
  // var distance = this.dist(cx,cy,testX,testY)
  var distance = Math.sqrt((cx-testX)^2+(cy-testY));
  // if the distance is less than the radius, collision!
  if (distance <= diameter/2) {
    return true;
  }
  return false;
};


function collideRectRect (x, y, w, h, x2, y2, w2, h2) {
  //2d
  //add in a thing to detect rectMode CENTER
  if (x + w >= x2 &&    // r1 right edge past r2 left
      x <= x2 + w2 &&    // r1 left edge past r2 right
      y + h >= y2 &&    // r1 top edge past r2 bottom
      y <= y2 + h2) {    // r1 bottom edge past r2 top
        return true;
  }
  return false;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (min - max) + max
}

class Client{
	constructor(id){
		this.id_ = id;
		this.gameStarted = false;
		this.enemyId = undefined;
		this.posX = 0;
		this.posY = 0;
		this.cameraHeight = 0;
		this.cameraWidth = 0;

		this.playerWidth = 0;
		this.playerHeight = 0;
		this.sens = undefined;
	}
}

class Room{
	constructor(name, clients) {
		this.name = name;
		this.clients = clients;
		this.sendPosBallInt = undefined;
		this.ballPosX = canvasMaxSizeWidth/2;
		this.ballPosY = canvasMaxSizeHeight/2;
		this.dirX =  0.5;
		this.dirY =  0.5;
		this.score = [0, 0];
		this.gameStarted = false;
	}


}

var canvasMaxSizeWidth = 1920;
var canvasMaxSizeHeight = 1080;

function searchForEnemy(id_){
	clients[getIndex(id_)].gameStarted = false;
	for (var i = 0; i < clients.length; i++) {
		if (!clients[i].gameStarted && clients[i].id_ != id_) {
			console.log(clients[i].id_ + " "  + id_)
			gameNbr++;

			var temp_room = new Room(String(gameNbr), [ clients[i], clients[getIndex(id_)] ] );
			temp_room.clients[0].enemyId =  temp_room.clients[1].id_;
			temp_room.clients[1].enemyId =  temp_room.clients[0].id_;
			rooms.push(temp_room);

			io.to(id_).emit("roomName", String(gameNbr));
			io.to(clients[i].id_).emit("roomName", String(gameNbr));
 			
 			temp_room.sendPosBallInt = setInterval( ()=> {
				if (temp_room.gameStarted) {
	 				if (temp_room.ballPosY < 0) {
						temp_room.dirY = Math.abs(temp_room.dirY);
	 				}  else if (temp_room.ballPosY > canvasMaxSizeHeight) {
						temp_room.dirY = -Math.abs(temp_room.dirY);
	 				} 
	  				if (temp_room.ballPosX < 0) {
	  					temp_room.ballPosX = canvasMaxSizeWidth/2;
	  					temp_room.ballPosY = canvasMaxSizeHeight/2;
	  					temp_room.dirY =  0.5;
	  					temp_room.dirX =   0.5;
	  					temp_room.score[1]++;
	  					temp_room.gameStarted =false;
	  					setTimeout( () => {
	  						temp_room.gameStarted = true;
	  					}, 2000)
	  					
					} else if (temp_room.ballPosX > canvasMaxSizeWidth) {
	  					temp_room.ballPosX = canvasMaxSizeWidth/2;
	  					temp_room.ballPosY = canvasMaxSizeHeight/2;
	  					temp_room.dirY =  0.5;
	  					temp_room.dirX =   0.5;
	  					temp_room.score[0]++;
	  					temp_room.gameStarted =false;
	  					setTimeout( () => {
	  						temp_room.gameStarted = true;
	  					}, 2000)
					}
					for (var i = 0; i < temp_room.clients.length; i++) { 
						// if (collideRectCircle( temp_room.clients[i].posX, temp_room.clients[i].posY, 10, temp_room.clients[i].cameraHeight, temp_room.ballPosX, temp_room.ballPosY, 10)) {

						var posX_to_real = (temp_room.clients[i].posX * canvasMaxSizeWidth)/temp_room.clients[i].cameraWidth;
						var posY_to_real = (temp_room.clients[i].posY * canvasMaxSizeHeight)/temp_room.clients[i].cameraHeight;
						var player_height_to_real = ( temp_room.clients[i].playerHeight * canvasMaxSizeHeight)/temp_room.clients[i].cameraHeight;

						if ( collideRectRect( posX_to_real, posY_to_real, 10, player_height_to_real, temp_room.ballPosX, temp_room.ballPosY, 10, 10)) {
								if (temp_room.dirX > 0) {
									temp_room.dirX = -Math.abs(temp_room.dirX);
								} else if (temp_room.dirX < 0) {
									temp_room.dirX = Math.abs(temp_room.dirX);
								} // si 2 fois la meme position = laisse passer DONC FUAT INVERSEER
								
								// if (temp_room.ballPosY > posY_to_real) {
								// 	temp_room.dirY = Math.abs(  temp_room.ballPosY -  posY_to_real  + player_height_to_real/2);
								// }
								// else if (temp_room.ballPosY < posY_to_real) {
								// 	temp_room.dirY = Math.abs(  posY_to_real + player_height_to_real/2 -  temp_room.ballPosY  );
								// }
								var distance =  posY_to_real  + player_height_to_real/2 - temp_room.ballPosY ;
								var maxDistance = Math.abs(player_height_to_real/2);
								console.log(distance + " " + maxDistance)
								temp_room.dirY = (distance*0.7)/maxDistance;
								temp_room.dirY *= -1;	
								console.log(temp_room.dirY)

								// temp_room.dirX *= (Math.abs(distance)*2)/maxDistance;
								temp_room.dirX *=1.1;
						}	 
					}
 	 				temp_room.ballPosY+=temp_room.dirY*12;
	 				temp_room.ballPosX+=temp_room.dirX*12;
 				}

 				io.in(temp_room.name).emit("ballPos", { ballPosX : temp_room.ballPosX, ballPosY : temp_room.ballPosY, score : temp_room.score});
 			}, 10);


		}
	}
}
var gameNbr = 0;
var clients = [];
var rooms = [];
var chatHistory = [];
io.on('connection', (socket) =>{
  console.log('a user connected');
  clients.push(new Client(socket.id));
  searchForEnemy(socket.id)

  socket.on('disconnect',() => {  
  	console.log(socket.id)
	var ind = getIndex(socket.id);
	var enemyOfdisconnectedPlayerId = clients[ind].enemyId;  // au moins c'est EXPLICITE  


	var roomToRemoveInd = undefined;
	for (var i = 0 ; i < rooms.length; i++) { 
 		for (var j = 0; j < rooms[i].clients.length; j++) {
 			if (rooms[i].clients[j].id_ === socket.id) {
 				roomToRemoveInd = i;
 				break;
 			}
 		}
	}
	if (roomToRemoveInd != undefined) { 
		io.to(enemyOfdisconnectedPlayerId).emit("enemyDisconnected", rooms[roomToRemoveInd].name);
	 	clearInterval( rooms[roomToRemoveInd].sendPosBallInt );
	  	// socket.leave( rooms[roomToRemoveInd].name);
		rooms.splice(rooms[roomToRemoveInd], 1); 
	} else {
		console.log("FIX THIS  ")
	}
	clients.splice(ind, 1);
  });

 
  socket.on("setMyRoom", (roomName_)=> {
  	var clientInd = getIndex(socket.id);
  	socket.join(roomName_);
 

  	var room = rooms[ getRoomIndex(roomName_) ];
  	clients[ clientInd ].gameStarted = true;
	  	

  	if (room.clients[0].gameStarted != false && room.clients[0].gameStarted ===  room.clients[1].gameStarted){
	  	clients[ clientInd ].sens = "normal";
	  	clients[ getIndex( clients[clientInd].enemyId) ].sens = "invert";
	  	
  		socket.emit("gameStarted", "normal");
		io.to(clients[clientInd].enemyId).emit("gameStarted",  "invert");
		setTimeout( () => {
			room.gameStarted = true;
		}, 4000)

  	}  
 	 
  });
	

	socket.on('mouseMoved',(data) => {  
   	  	var clientInd = getIndex(socket.id);
   	  	if (data.ballSens === "invert") {
   	  	}
  		clients[clientInd].posX = data.playerX;
   	  	clients[clientInd].posY = data.playerY;
   	  	clients[clientInd].cameraHeight = data.height;
   	  	clients[clientInd].cameraWidth  = data.width;
   	  	
   	  	clients[clientInd].playerHeight = data.playerH;
   	  	clients[clientInd].playerWidth  = data.playerW;
   	  	io.to(clients[clientInd].enemyId).emit("enemyMouseMoved", data)
	});
	socket.on("newGame", () => {
		searchForEnemy(socket.id);
	})


	socket.on("leaveRoom", (roomName) => {
		socket.leave(roomName)
	})
	socket.on("message", (message) => {
		chatHistory.push(message)

		// if (chatHistory.length > 10) {
		// 	chatHistory = [];
		// }
	  	io.emit('messageHistory', chatHistory);

	})




});