window.onload = function () {
 
    var main = new Vue({
        el: '#app',
        data: {
            messageHistory: ["Chat started"],
            startButtonPressed : false
        },
        methods: {
        	sendMessage(){
        		var msg = document.getElementById("chatTextField").value;
        		document.getElementById("chatTextField").value = "";
        		socket.emit("message", msg)
        	}
        }
    });
  
    socket.on("messageHistory", (messageHistory) => {
		main.messageHistory = messageHistory;
		console.log(messageHistory);
		 // var l = document.getElementsByClassName("messages").length;
	  //   document.getElementsByClassName("messages")[l-1].scrollIntoView();
	  setTimeout( () => {  
		var chatContainer =  document.getElementById("chatContainer");
		chatContainer.scrollTop = chatContainer.scrollHeight;
	  }, 200);

	})
}


