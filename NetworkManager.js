define(['socketio', 'Custom Utility/Timer'], function(io, Timer){
    
    var isConnectedToServer = false;
    var pingTimer = new Timer();
    var ping = 0;
    var socket;
    
    function initialize(canvasWidth, canvasHeight, listenerFunction){
        socket = io.connect('http://192.168.0.17:4000');
 
        socket.on("connect", function(data){
            console.log("Connected to server.");
            socket.emit("initialize", {canvasWidth: canvasWidth, canvasHeight: canvasHeight});
            
            socket.emit("latency");
            pingTimer.start();
        });

        socket.on("initialize", function(data){
            isConnectedToServer = true;
            listenerFunction("S_initialize", data);
        });

        socket.on("gameupdate", function(data){
            listenerFunction("S_gameupdate", data);
        });

        socket.on("disconnect", function(){
            console.log("Disconnected from server."); 
            isConnectedToServer = false;
        });
        
        socket.on("latency", function(data){
            ping = pingTimer.getTime();
            socket.emit("latency");
            pingTimer.reset();
            pingTimer.start();
        });
    }

    function connectedToServer(){
        return isConnectedToServer;
    }
    
    function getPing(){
        return ping;
    }
    
    function sendToServer(name,info){
        socket.emit(name, info);
    }
    
    return {
        initialize: initialize,
        connectedToServer: connectedToServer,
        getPing: getPing,
        sendToServer: sendToServer
    }
    
});