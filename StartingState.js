define(['Custom Utility/CircularHitRegions', 'doGLDrawingFromHandlers'], function(CircularHitRegions, doGLDrawingFromHandlers){
    var PlayingState;
    var startButtonHandler;
    var callbackToSwitchState;
    var hitRegions;
    var EffectsManager;
    var context;
    var Cursor;
    var InputEventsManager;
    var shouldDrawText = true;
    
    function initialize(p_PlayingState, p_EffectsManager, appMetaData, gl, p_context, p_Cursor, p_InputEventsManager, callback){
        EffectsManager = p_EffectsManager;
        PlayingState = p_PlayingState;
        startButtonHandler = EffectsManager.requestBasicTargetEffect(true, gl, 10, appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2, {radius: [100], numBolts: [10], lgGlowFactor: [1], circleGlowFactor: [4], circleLineWidth: [4], lgLineWidth: [1], rotationBool: [1.0], spaceInCenterBool: [1.0]});
        callbackToSwitchState = callback;
        hitRegions = new CircularHitRegions(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2);
        hitRegions.addRegion(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2, 100);
        
        context = p_context;
        Cursor = p_Cursor;
        InputEventsManager = p_InputEventsManager;
    }
    
    function draw(gl, interpolation){
        startButtonHandler.update();
        Cursor.draw();
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.BLEND);
        
        doGLDrawingFromHandlers(gl, EffectsManager);
        
        if(shouldDrawText){
            context.fillStyle = "yellow";
            context.font = '40px Arial';
            context.textAlign = "center";
            context.textBaseline = "middle"; 
            context.shadowBlur = 2;
            context.shadowColor = "white";
            context.fillText("Start", (canvas.width / 2), canvas.height / 2);
        }
    }
    
    function update(){
        var inputObj = InputEventsManager.getCurrentInputObj();
        
        if(inputObj.mouseState.type === "mouse_down" || inputObj.mouseState.type === "mouse_held_down"){
            if(hitRegions.isInAnyRegion(inputObj.mouseState.x, inputObj.mouseState.y)){
                startButtonHandler.shouldDraw(false);
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                shouldDrawText = false;
                startButtonHandler.doDestroyEffect(context.canvas.width / 2, context.canvas.height / 2, function(){
                    callbackToSwitchState(PlayingState);
                });
            }
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update
    };
});