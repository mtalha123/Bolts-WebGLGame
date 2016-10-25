define(['socketio', 'EventSystem', 'Custom Utility/Timer'], function(io, EventSystem, Timer){
    
    var isConnectedToServer = false;
    var pingTimer = new Timer();
    var ping = 0;
    var socket;
    
    function initialize(canvasWidth, canvasHeight, listenerFunction){
        socket = io.connect('192.168.0.20:4000');
 
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
        
        EventSystem.register(recieveEvent, "mousemove");
        EventSystem.register(recieveEvent, "mouseup");
        EventSystem.register(recieveEvent, "mousedown");
        
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
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "mousemove"){
            socket.emit("mousemove", eventInfo.eventData)
        }else if(eventInfo.eventType === "mousedown"){
            socket.emit("mousedown", eventInfo.eventData)
        }else if(eventInfo.eventType === "mouseup"){
            socket.emit("mouseup", eventInfo.eventData)
        }
    }
    
    return {
        initialize: initialize,
        connectedToServer: connectedToServer,
        getPing: getPing,
        recieveEvent: recieveEvent
    }
    
});