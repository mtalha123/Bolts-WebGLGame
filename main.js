//FOR CHROME DISABLING WEB SECURITY: 
//1. Go to C:\Program Files (x86)\Google\Chrome\Application in command prompt.
//2. Type following command:   chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security


//context.font = [font style] [font weight] [font size] [font face]


requirejs.config({
    baseUrl : "./",
    paths : {
        socketio: 'http://192.168.0.15:4000/socket.io/socket.io.js'
    },
    shim: {
        'Third Party/Matrix': {
            exports: 'Matrix' // what variable does the library export to the global scope?
        },
        'Third Party/Box2d.min': {
            exports: 'Box2D' // what variable does the library export to the global scope?
        },
        'socketio': {
            exports: "io"
        }
    }
});



require(['Custom Utility/Timer', 'Custom Utility/FPSCounter', 'Custom Utility/Random', 'Border', 'Target', 'Cursor', 'TargetsController', 'EventSystem', 'TargetAchiever', 'PhysicsSystem', 'NetworkManager', 'Custom Utility/isObjectEmpty', 'InputEventsManager', 'SynchronizedTimers', 'ComboSystem', 'ShaderLibrary', 'ShaderProcessor', 'appMetaData', 'AssetManager'], function(Timer, FPSCounter, Random, Border, Target, Cursor, TargetsController, EventSystem, TargetAchiever, PhysicsSystem, NetworkManager, isObjectEmpty, InputEventsManager, SynchronizedTimers, ComboSystem, ShaderLibrary, ShaderProcessor, appMetaData, AssetManager){

//-----------------------  INITIALIZATION STUFF---------------------------------------
    
    var body = document.getElementsByTagName("body");

    //make the width of the body equal to any screen width (adjusts to multiple resolutions)
    body[0].style.width = screen.availWidth + "px";

    var canvas = document.getElementById("canvas");
    
    //innerWidth and innerHeight are the width and height of the window without toolbars/scrollbars (i.e. content on page)
    var canvasWidth = canvas.width = window.innerWidth;
    var canvasHeight = canvas.height = window.innerHeight;
    
    //get context of main canvas and store in variable "context"
    //var context = canvas.getContext("2d");
    var gl = canvas.getContext("webgl");
    if(!gl){
        alert("No WebGL enabled.");
    }
//-------------------------------------------------------------------------------------
    
    var fpsCounter = Object.create(FPSCounter);
    var tickTimer = new Timer();
    
    //although there are 25 ticks that are supposed to happen, this variable ROUGHLY monitors those updates in case they were ever to drop
    //e.g. if system was processing too much
    var testTicksPerSecond = 0;
    //increments each time an update happens
    var tickCounter = 0;
    
    //set to 5 so that in the event the game can't catch up with the updates, there is still drawing happening at least once ever 5 updates
    var maxFrameSkip = 5;
    var nextTick = Date.now();
    var TICKS_PER_SECOND = 20;
    var tickTimeMillis = 1000 / TICKS_PER_SECOND;
    
    //in case updates are behind, update loop keeps looping until the number of maxFrameSkip 
    var loops = 0;
    
    var interpolation = 1;
    
    //in case of when an update happens in the next second but the # of updates hasn't been processed for the
    //first second yet, the difference between the time (which would now be over 1000 ms) and 1000 is the offsetTime
    var offsetTime = 0;
        
    NetworkManager.initializeAndConnect(canvasWidth, canvasHeight, networkEventListener);
    
    var mostRecentServerUpdateInfo = {};
    var mostRecentServerUpdateReceiptTime = 0;
    
//    var debugDraw = new Box2DStuff.b2DebugDraw();
//    debugDraw.SetSprite (context);
//    debugDraw.SetDrawScale(100);
//    debugDraw.SetFillAlpha(0.3);
//    debugDraw.SetLineThickness(1.0);
//    debugDraw.SetFlags(Box2DStuff.b2DebugDraw.e_shapeBit | Box2DStuff.b2DebugDraw.e_jointBit);
//    Box2DStuff.physicsWorld.SetDebugDraw(debugDraw)    
    
    var updateCounter = 0;
    
    var fpsHandler = null;
    
    var initializationDone = false;
    
    //testing
    var timeForUpdateToBeSlowedAt = Date.now() + 5000;
    
    //testing shaderprocessor module
    var handler = null;
    
    function gameLoop(){
        if(NetworkManager.connectedToServer() && initializationDone){
            //set to 0 each time game loop runs so that it can be utilized for the next set of updates
            loops = 0;
            
            tickTimer.start();

            //variable to hold currentTime so references to it in multiple places gives same value as opposed to using Date.now()
            var currentTime = Date.now();
            
            //update loop
            while(currentTime > nextTick && loops < maxFrameSkip){

                   // console.log("currentTick: " + nextTick + "   Current Time: " + Date.now() + "  timeCurrUpdateLate: " + (Date.now() - nextTick) + "   nextTick: " + (nextTick + tickTimeMillis));
                tickCounter+=1;
                var currentTickTime = nextTick;
                update(currentTickTime);
                nextTick += tickTimeMillis;
                loops++;
                updateCounter++;
                
                //console.log("Update Counter: " + updateCounter + " at time: " + (nextTick - tickTimeMillis));
                
                var updatesDue = Math.floor((currentTime - currentTickTime) / 50) + 1;
                
              //  console.log("LATE BY: " + updatesLateBy);
                
                //log how much time current update is late by in ms
                //console.log("Update late by: " + (Date.now() - currentTickTime));
                
                if(loops > 1){
                    console.log("MORE UPDATE ITERATIONS!     LOOPS NUM: " + loops);
                }
                
                if(mostRecentServerUpdateInfo.currentTickTimestamp > currentTickTime){
                    console.log("LOOP CONTINUED!");
                                        
                    continue; 
                }

                if(!isObjectEmpty(mostRecentServerUpdateInfo)){
                    for(var key in mostRecentServerUpdateInfo){
                        switch(key){
                            case "TargetsController":
                                TargetsController.serverUpdate(mostRecentServerUpdateInfo.TargetsController);
                                break;

                            case "CollisionSystem":
                                TargetAchiever.recieveFromServer(mostRecentServerUpdateInfo.CollisionSystem);
                                break;
                        }
                    }
                    mostRecentServerUpdateInfo = {};
                }
                
                //Use following if statement to slow down execution of an update so as to simulate a "late" update
//                if(currentTime >= timeForUpdateToBeSlowedAt){
//                    console.log("SLOWED!!!!!!!")
//                    timeForUpdateToBeSlowedAt += 5000;
//                    for(var a = 0; a < 5; a++){
//                        DrawPathsWithGlow(context, [[0,10], [400,500], [1500,300], [10,10]]);
//                    }
//                }
            }

            interpolation = ( (Date.now() + tickTimeMillis) - nextTick ) / ( tickTimeMillis );

            if(interpolation < 0){
                interpolation = 0;
            }
        
            //the time in the previous second's calculation of the TPS that went over into this second is accounted for
            //in the condition below
            if(tickTimer.getTime() >= (1000 - offsetTime)){
                testTicksPerSecond = tickCounter;
                tickCounter = 0;

                if(offsetTime == 0){
                    offsetTime = tickTimer.getTime() - 1000;
                }

                tickTimer.reset();
                tickTimer.start();
            }

            fpsCounter.start();

            draw(interpolation);
            
            if(!fpsHandler){
                fpsHandler = ShaderProcessor.requestTextEffect(true, gl, {}, canvasWidth * 0.9, canvasHeight * 0.88, fpsCounter.getFPS().toString());
            }
            fpsHandler.setText(fpsCounter.getFPS().toString(), canvasWidth, canvasHeight);

            fpsCounter.end();
        }
        
        window.requestAnimationFrame(gameLoop);
        
    }
    
    //calls the game loop(which then recursively calls itself via window.requestAnimationFrame())
    gameLoop();
    

    function draw(interpolation){
        Border.draw(interpolation);
        
        TargetsController.draw(interpolation);
        Cursor.draw(interpolation);

        ComboSystem.draw();
        //Box2DStuff.physicsWorld.DrawDebugData();  
        
        
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.65, 0.65, 0.65, 1.0);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
       // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        var handlers = ShaderProcessor.getHandlers();
        var numVerticesDone = 0;
        for(var i = 0; i < handlers.length; i++){
            gl.useProgram(handlers[i]._shaderProgram);
            ShaderProcessor.setUpAttributesAndUniforms(gl, handlers[i]);
            gl.drawArrays(gl.TRIANGLES, 0, handlers[i].getNumVertices());
            numVerticesDone += handlers[i].getNumVertices();
        }       
    }
    
    function update(currentTick){        
        SynchronizedTimers.updateAllTimers(tickTimeMillis);
        
        var inputInfo = InputEventsManager.notifyOfCurrentStateAndConsume();
        
        if(inputInfo != undefined){
            inputInfo.updateCounter = updateCounter;
            NetworkManager.sendToServer("input", inputInfo);
        }else{
            NetworkManager.sendToServer("input", "none");
        }
    
        TargetAchiever.update();
        
        ComboSystem.update();
        PhysicsSystem.update(1 / 20, 10, 6);
        Border.update();
        TargetsController.update();
        EventSystem.update();
        
        
        //TESTING SHADERPROCESSOR MODULE
        if(!handler){
            //handler = ShaderProcessor.requestComboEffect(gl, 300, 700, 80, 0.1, 3, "2x");
        }
    }
    
    function getPixelsFromPercent(widthOrHeight, percentage){
        if(widthOrHeight === "width"){
            return (percentage/100) * canvasWidth;
        }else if(widthOrHeight === "height"){
            return (percentage/100) * canvasHeight;
        }
    }
    
    function doServerUpdateFrom(serverUpdateObject){
        for(var key in serverUpdateObject){
            switch(key){
                case "TargetsController":
                    TargetsController.serverUpdate(serverUpdateObject.TargetsController);
                    break;

                case "CollisionSystem":
                    CollisionSystem.recieveFromServer(serverUpdateObject.CollisionSystem);
                    break;
            }
        }
    }
    
    function networkEventListener(eventType, eventData){
        if(eventType === "S_initialize"){
            AssetManager.loadAllAssets(gl, function(){
                //function for each asset loaded. DO LOADING GRAPHICS HERE~~~~
            }, function(){
                console.log("All assets loaded.");
                initializationDone = true;
                initialize(eventData.TargetsController, eventData.nextTick);    
            });
        }else if(eventType === "S_gameupdate"){

            //PURELY FOR TESTING (DELETE THIS AFTER BREAKS ENCAPSULATION)------
            for(var test in mostRecentServerUpdateInfo.TargetsController){
                if(mostRecentServerUpdateInfo.TargetsController[test].type === "spawn"){
                    console.log("SPAWN SKIPPED!!!!!");
                }
            }
            //-----
            
            mostRecentServerUpdateInfo = eventData;
            mostRecentServerUpdateReceiptTime = Date.now();
        }
    }
    
    function initialize(TargetsControllerInfo, nextServerTick){
        appMetaData.initialize(canvasWidth, canvasHeight);
        ShaderLibrary.initialize(gl);
        ShaderProcessor.initialize(ShaderLibrary, appMetaData, AssetManager);
        Cursor.initialize(gl, appMetaData, ShaderProcessor);
        Border.initialize(gl, appMetaData, AssetManager, ShaderProcessor);
        TargetsController.initialize(gl, appMetaData, TargetsControllerInfo);  
        ComboSystem.initialize(gl, ShaderProcessor, TargetsController, Border);
        TargetAchiever.initialize(ComboSystem);
        InputEventsManager.initialize(canvas, appMetaData);
        
        nextTick = Date.now();
    }
    
});