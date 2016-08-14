define(['socketio', 'EventSystem', 'Custom Utility/Timer'], function(io, EventSystem, Timer){
    
    var isConnectedToServer = false;
    var pingTimer = new Timer();
    var ping = 0;
    var socket;
    
    function initialize(canvasWidth, canvasHeight, listenerFunction){
        socket = io.connect('192.168.0.19:4000');
 
        socket.on("connect", function(data){
            console.log("Connected to server.");
            socket.emit("initialize", {canvasWidth: canvasWidth, canvasHeight: canvasHeight});
            
           // socket.emit("ping");
            //pingTimer.start();
        });

        socket.on("initialize", function(data){
            isConnectedToServer = true;
            listenerFunction("initializefromserver", data);
        });

        socket.on("gameupdate", function(data){
            listenerFunction("gameupdatefromserver", data);
        });

        socket.on("disconnect", function(){
            console.log("Disconnected from server."); 
            isConnectedToServer = false;
        });
        
//        socket.on("ping", function(data){
//            ping = pingTimer.getTime();
//            socket.emit("ping");
//            pingTimer.reset();
//            pingTimer.start();
//        });
    }

    function connectedToServer(){
        return isConnectedToServer;
    }
    
    function getPing(){
        return ping;
    }
    
    return {
        initialize: initialize,
        connectedToServer: connectedToServer,
        getPing: getPing,
    }
    
});