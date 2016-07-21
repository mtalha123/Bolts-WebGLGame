//FOR CHROME DISABLING WEB SECURITY: 
//1. Go to C:\Program Files (x86)\Google\Chrome\Application in command prompt.
//2. Type following command:   chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security


//context.font = [font style] [font weight] [font size] [font face]


requirejs.config({
    baseUrl : "./",
    paths: {
        Matrix: "Third Party/Matrix",
        Box2D: "Third Party/Box2d.min"
    },
    shim: {
        'Matrix': {
            exports: 'Matrix' // what variable does the library export to the global scope?
        },
        'Box2D': {
            exports: 'Box2D' // what variable does the library export to the global scope?
        },
        
    }
});



require(['Custom Utility/Timer', 'Custom Utility/FPSCounter', 'DrawPathWithGlow', 'LightningPiece', 'Custom Utility/Random','Matrix', 'BorderLightning', 'BackgroundLines', 'Target', 'Cursor', 'TargetsController', 'EventSystem', 'CollisionSystem'], function(Timer, FPSCounter, DrawPathsWithGlow, LightningPiece, Random, Matrix, BorderLightning, BackgroundLines, Target, Cursor, TargetsController, EventSystem, CollisionSystem){

//-----------------------  INITIALIZATION STUFF---------------------------------------
    
    var body = document.getElementsByTagName("body");

    //make the width of the body equal to any screen width (adjusts to multiple resolutions)
    body[0].style.width = screen.availWidth + "px";

    var canvas = document.getElementById("canvas");
    
    //innerWidth and innerHeight are the width and height of the window without toolbars/scrollbars (i.e. content on page)
    var canvasWidth = canvas.width = window.innerWidth;
    var canvasHeight = canvas.height = window.innerHeight;
    
    //get context of main canvas and store in variable "context"
    var context = canvas.getContext("2d");
    
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
    var TICKS_PER_SECOND = 25;
    var tickTimeMillis = 1000 / TICKS_PER_SECOND;
    
    //in case updates are behind, update loop keeps looping until the number of maxFrameSkip 
    var loops = 0;
    
    var interpolation = 1;
    
    //in case of when an update happens in the next second but the # of updates hasn't been processed for the
    //first second yet, the difference between the time (which would now be over 1000 ms) and 1000 is the offsetTime
    var offsetTime = 0;
    
    var image = new Image();
    image.src = "Assets/borderbluefield.png";
    
    //var BIG_TEST = new LightningPiece(canvasWidth, canvasHeight, [[300, 200, 80, 80], [300, 200, 250, 50],  [300, 200, 500, 100]], 10, 30, {lineWidth: 1});
    BorderLightning.initialize(canvasWidth, canvasHeight);
    TargetsController.initialize(canvasWidth, canvasHeight);
    CollisionSystem.initialize();
    
    //BackgroundLines.initialize(canvasWidth, canvasHeight, 15, 100);
    
    var target2 = new Target(canvasWidth, canvasHeight, 40, 8, 100, 100);
    var TESTX,TESTY;
    function gameLoop(){
        
        //set to 0 each time game loop runs so that it can be utilized for the next set of updates
        loops = 0;
       
        tickTimer.start();
        
        //update loop
        while(Date.now() > nextTick && loops < maxFrameSkip){
            tickCounter+=1;
            update();  
            nextTick += tickTimeMillis;
            loops++;
        }
        
        interpolation = ( (Date.now() + tickTimeMillis) - nextTick ) / ( tickTimeMillis );

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
        
        //----set text info then draw the FPS and TPS numbers-----
        context.fillStyle = "blue";
        context.font = "20px Arial";        
        context.fillText("FPS: " + fpsCounter.getFPS(), canvasWidth - (canvasWidth * 0.05), canvasHeight * 0.03);
        context.fillText("TPS: " + testTicksPerSecond, canvasWidth - (canvasWidth * 0.05), canvasHeight * 0.06);
        //-------------------------------------
        
        fpsCounter.end();
        
        
        window.requestAnimationFrame(gameLoop);
        
    }
    
    //calls the game loop(which then recursively calls itself via window.requestAnimationFrame())
    gameLoop();
    

    function draw(interpolation){
        //---clear screen---
        context.clearRect(0, 0, canvasWidth, canvasHeight);       
        context.fillStyle = "#a6a6a6";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        //--------------
        
        //TESTING
//        context.strokeStyle = "black";
//        context.lineWidth = 6;
//        context.beginPath();
//
//        context.moveTo(20, 30);
//        context.lineTo(80, 80);
//        context.lineTo(100, 140);
//        
//        context.moveTo(200, 130);
//        context.lineTo(250, 50);
//
//        context.moveTo(400, 300);
//        context.lineTo(600, 100);        
//
//        context.stroke();
        
        
        //BIG_TEST.draw(context, interpolation);
        BorderLightning.draw(context, interpolation);
        TargetsController.draw(context, interpolation);
        //context.drawImage(image, -400, -20, 2800, 120);
        //BackgroundLines.draw(context, interpolation);
        Cursor.draw(context, interpolation, 0.01 * canvasWidth);
                
    }
    
    function update(){
        //BIG_TEST.incrementAnimationFrame();
        EventSystem.update();
        BorderLightning.update();
        TargetsController.update();
        CollisionSystem.checkBorderCollision();
    }
    
    function getPixelsFromPercent(widthOrHeight, percentage){
        if(widthOrHeight === "width"){
            return (percentage/100) * canvasWidth;
        }else if(widthOrHeight === "height"){
            return (percentage/100) * canvasHeight;
        }
    }
    
    canvas.addEventListener("mousemove", function(event){
        Cursor.useCoordinates(event.clientX, event.clientY);
    }, false);
    
    
});