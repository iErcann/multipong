var socket = io();


var roomName = undefined;
var players = [];
var ball_sens;
var freeXMode = false;
class PlayerPad{
	constructor(x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.type_ = undefined;
	}
	setType(type_){ // client or enemy	
		this.type_ = type_;
	}
	show(){
		rect(this.x, this.y, this.w, this.h);
	}
	resize(){
		  if (this.type_ === "client") { 
		  	this.x = width-30;
		  }  
		this.w = 10;
		this.h = (110*height)/canvasMaxSize.y;
	}
	move(){
		if (this.type_ === "client") { 
 			this.y = mouseY - this.h/2;
 			if (freeXMode)
 				this.x = mouseX;

 		}
	}
}
 
 

 
 class Ball{
	constructor(x, y, s){
		this.x = x;
		this.y = y;
		this.s = s;
		this.dir_ = createVector(1, -1);  
		this.speed = 1;
		this.canCollide = true;
		this.size_ = 0;
	}

	show(){
		this.size_ = (10*height)/1080;
		if (ball_sens === "normal") {  
			ellipse(this.x, this.y, this.size_)
		} else if (ball_sens === "invert"){
			ellipse(width-this.x, this.y, this.size_)
		}
		//this.x += (this.speed*this.dir_.x*width ) /canvasMaxSize.x;
		//this.y += (this.speed*this.dir_.y*height)/canvasMaxSize.y;
	} 
 

}
var canvas;
var canvasMaxSize; //  = createVector(1280, 720); createVector only work in setup
var ball;
var gameStarted = false;

var btn;
var timer;
var pixelFont;
var fontReady = false;
function fontReadyF(){
	fontReady = true;
}
function preload(){
	pixelFont = loadFont("pixelart.ttf", fontReadyF);
}

function setup(){
	  noCursor();

	if (fontReady){
		textFont(pixelFont)
	}
	canvasMaxSize = createVector(1920, 1080);

	canvas = createCanvas(windowWidth/2, windowHeight/1.5)
	canvas.parent("game")
	var canvasSize = createVector(windowWidth/1.2, windowHeight/1.5, 0);

	if (canvasSize.x < canvasMaxSize.x)  {  
		resizeCanvas(canvasSize.x, height);
	}
	if (canvasSize.y < canvasMaxSize.y) {
		resizeCanvas(width, canvasSize.y);
	}
		// if (chatHistory.length > 10) {
		// 	chatHistory = [];
		// });
	windowResized();
	ball = new Ball(width/2, height/2, 10);
 	
 	players.push(new PlayerPad(width-30, height/2, 10, undefined));
	players[0].setType("client");

 	players.push(new PlayerPad(30, height/2 - (height/20),  10, undefined));
	players[1].setType("enemy");
	document.getElementById("defaultCanvas0").classList.add('w3-animate-zoom');

	// document.getElementById("chatContainer").style.width = document.getElementById("defaultCa.nvas0").style.left  ;
	// document.getElementById("chatTextField").style.width = document.getElementById("defaultCanvas0").style.left   ;
	//document.getElementById("chatContainer").style.left = windowWidth/2;
	// document.getElementById("chat").style.bottom = document.getElementById("defaultCanvas0").style.top + height + "px";
}

function draw(){
	background(21, 27, 35)




	if (gameStarted) { 
		drawPlayers();
		ball.show();
	} else {
		fill(255);
		textSize(20);
		text("Waiting for a player...", width/2, height/2+100);
	}

	fill(255);
	textSize(60);
	textAlign(CENTER, CENTER);
	if (timer != undefined)
	text(timer, width/2, height/2);
	textSize(5)
	if (ball_sens != undefined)
	text(ball_sens, width/2, 200);
	textSize(30);
	text(score, width/2, 100);


	var topA = document.getElementById("defaultCanvas0").style.top.slice(0, -1);
	topA = topA.slice(0, -1);
	topA = parseInt(topA);

	document.getElementById("chat").style.top =  topA+height+"px";

	var widthA = document.getElementById("chatContainer").style.width.slice(0, -1);
	widthA = widthA.slice(0, -1);
	widthA = parseInt(widthA);

 	document.getElementById("chat").style.left =  windowWidth/2 - widthA/2 + "px";


	document.getElementById("chatContainer").style.height = (windowHeight - height - topA*2) +"px";

	document.getElementById("chatContainer").style.width = width+"px"




}
var canX = 0;
var canY = 0;
function windowResized() {
	var canvasSize = createVector(windowWidth/1.2, windowHeight/1.5, 0);

	if (canvasSize.x < canvasMaxSize.x)  {  
		resizeCanvas(canvasSize.x, height);
	}
	if (canvasSize.y < canvasMaxSize.y) {
		resizeCanvas(width, canvasSize.y);
	}


 

	canX = (windowWidth/2 - width/2);
	canY = (windowHeight/2 - height/1.5);
	canvas.position(canX, canY);
}


function drawPlayers(){
	for (var i = 0; i < players.length; i++) {
		players[i].show();
		players[i].resize();
		players[i].move();
	}
}

function mouseMoved() {
	if (gameStarted) {  
	  var data = {
	  	id : socket.id,
	  	mouseX : mouseX,
	  	mouseY : mouseY,
	  	height : height, 
	  	width : width,
	  	playerX : players[0].x,
	  	playerY : players[0].y,
	  	playerH : players[0].h,
	  	roomName : roomName,
	  	ballSens : ball_sens
 	  }
		if (ball_sens === "invert") {
		 	data.playerX = width-data.playerX;
			// data.playerX = 30;	
		}

 	  socket.emit("mouseMoved", data);
	}
}
 
socket.on("enemyMouseMoved", (data) => {
	//on get le height du windows de l'enemy, on fait un produit en croix, on divise par le height du windows du client
	players[1].y = (  (data.mouseY - data.playerH/2)*height)/data.height
	if (freeXMode) {  
		players[1].x = width - (data.mouseX*width)/data.width;
	}
	else {
		players[1].x = 30;
	}
	console.log(data)
})

socket.on("roomName", (roomName_) => {
	roomName = roomName;
	socket.emit("setMyRoom", roomName_);
})


var gameLaunchInterval;
socket.on("gameStarted", (ballSens) => {
	console.log("ok")
	timer = 3;
	ball_sens = ballSens;
	 gameLaunchInterval = setInterval( () => {
	 	fill(255);
	 	timer--;
	 	if (timer === 0) {
	 		timer = "GO";
	 		setTimeout(()=>  {  timer = ""; }, 1000)
	 		clearInterval(gameLaunchInterval);
	 		gameStarted = true;
	 		// ball =  new Ball(width/2, height/2, 10);
	 	}
	 }, 1000);
})


 
socket.on("enemyDisconnected", (roomName) => {
	gameStarted = false;
	roomName = "";
	clearInterval(gameLaunchInterval);
	socket.emit("newGame");
	socket.emit("leaveRoom", roomName)
})

var score = "";

socket.on("ballPos", (ballPos) => {
 
	
	ball.x = (ballPos.ballPosX*width)  /canvasMaxSize.x;
	ball.y = (ballPos.ballPosY*height)/canvasMaxSize.y;
	if (ball_sens === "invert") {
		score = ballPos.score[1] + " - " + ballPos.score[0];
	}  else {
		score = ballPos.score[0] + " - " + ballPos.score[1];

	}
	// ball.x = ballPos.ballPosX;
	// ball.y = ballPos.ballPosY;

})