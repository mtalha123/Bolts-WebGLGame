//FOR CHROME DISABLING WEB SECURITY: 
//1. Go to C:\Program Files (x86)\Google\Chrome\Application in command prompt.
//2. Type following command:   chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security


//context.font = [font style] [font weight] [font size] [font face]


requirejs.config({
    baseUrl : "./",
    paths : {
        socketio: 'http://192.168.0.11:4000/socket.io/socket.io.js'
    },
    shim: {
        'Third Party/Matrix': {
            exports: 'Matrix' // what variable does the library export to the global scope?
        },
        'socketio': {
            exports: "io"
        }
    }
});



require(['Custom Utility/Timer', 'Cursor', 'EventSystem', 'NetworkManager', 'InputEventsManager', 'SynchronizedTimers', 'ShaderLibrary', 'EffectsManager', 'appMetaData', 'AssetManager', 'LoadingState', 'StartingState', 'PlayingState', 'RestartState', 'addToAutomaticDrawing'], function(Timer, Cursor, EventSystem, NetworkManager, InputEventsManager, SynchronizedTimers, ShaderLibrary, EffectsManager, appMetaData, AssetManager, LoadingState, StartingState, PlayingState, RestartState, addToAutomaticDrawing){

//-----------------------  INITIALIZATION STUFF---------------------------------------
    
    var body = document.getElementsByTagName("body");

    //make the width of the body equal to any screen width (adjusts to multiple resolutions)
    body[0].style.width = screen.availWidth + "px";

    var canvas = document.getElementById("canvas");
    
    //innerWidth and innerHeight are the width and height of the window without toolbars/scrollbars (i.e. content on page)
    var canvasWidth = canvas.width = window.innerWidth; //CHANGE TO LOWER RESOLUTION FOR PERFORMANCE
    var canvasHeight = canvas.height = window.innerHeight; //CHANGE TO LOWER RESOLUTION FOR PERFORMANCE
    
    //get context of main canvas and store in variable "context"
    //var context = canvas.getContext("2d");
    var gl = canvas.getContext("webgl");
    if(!gl){
        alert("No WebGL enabled.");
    }
    
    var context = (document.getElementById("2dCanvas")).getContext("2d");
    context.canvas.width = canvasWidth;
    context.canvas.height = canvasHeight;
//-------------------------------------------------------------------------------------
    
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
    
    var updateCounter = 0;
    
    var initializationDone = false;
    
    LoadingState.initialize(context);
    var currentState = LoadingState;
    currentState.draw();
    
    var windowFocused = true;
    
    // Additive blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    function gameLoop(){
        if(NetworkManager.connectedToServer() && windowFocused){                
                //set to 0 each time game loop runs so that it can be utilized for the next set of updates
                loops = 0;

                tickTimer.start();

                //variable to hold currentTime so references to it in multiple places gives same value as opposed to using Date.now()
                var currentTime = Date.now();

                //update loop
                while(currentTime > nextTick && loops < maxFrameSkip){
                    tickCounter+=1;
                    var currentTickTime = nextTick;
                    update();
                    nextTick += tickTimeMillis;
                    loops++;
                    updateCounter++;

                    var updatesDue = Math.floor((currentTime - currentTickTime) / 50) + 1;

                    if(loops > 1){
                       // console.log("MORE UPDATE ITERATIONS!     LOOPS NUM: " + loops);
                    }
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

                draw(interpolation);
        }
        
        window.requestAnimationFrame(gameLoop);
        
    }
    
    //calls the game loop(which then recursively calls itself via window.requestAnimationFrame())
    gameLoop();
    

    function draw(interpolation){
        addToAutomaticDrawing.prepareForDrawing();
        currentState.draw(gl, interpolation);
    }
    
    function update(){        
        SynchronizedTimers.updateAllTimers(tickTimeMillis);        
        currentState.update();
    }
    
    function networkEventListener(eventType, eventData){
        if(eventType === "S_initialize"){
            AssetManager.loadAllAssets(gl, function(completion){
                LoadingState.setCompletion(completion);
            }, function(){
                console.log("All assets loaded.");
                initializationDone = true;
                initialize();
                LoadingState.clear();
                currentState = StartingState;
            });
        }
    }
    
    function initialize(){
        appMetaData.initialize(canvasWidth, canvasHeight);
        ShaderLibrary.initialize(gl);
        EffectsManager.initialize(ShaderLibrary, appMetaData, AssetManager);
        Cursor.initialize(gl, appMetaData, EffectsManager);
        
        InputEventsManager.initialize(canvas, appMetaData);
       
        RestartState.initialize(PlayingState, EffectsManager, appMetaData, gl, context, Cursor, InputEventsManager, function(state){
            currentState = state;
        });
        
        PlayingState.initialize(gl, appMetaData, EffectsManager, InputEventsManager, AssetManager, Cursor, RestartState, function(state){
            currentState = state;
        });
        
        StartingState.initialize(PlayingState, EffectsManager, appMetaData, gl, context, Cursor, InputEventsManager, function(state){
            currentState = state;
        });
        
        nextTick = Date.now();
    }
    
    window.onfocus = function(){
        windowFocused = true;
        nextTick = Date.now();
    }
    
    window.onblur = function(){
        windowFocused = false;
    }    
});