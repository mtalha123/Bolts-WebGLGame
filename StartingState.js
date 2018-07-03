define(['Custom Utility/CircularHitRegions', 'doGLDrawingFromHandlers', 'Custom Utility/Vector'], function(CircularHitRegions, doGLDrawingFromHandlers, Vector){
    var PlayingState;
    var startButtonHandler;
    var callbackToSwitchState;
    var hitRegions;
    var EffectsManager;
    var context;
    var Cursor;
    var InputEventsManager;
    var shouldDrawText = true;
    var lightningStrikeHandler;
    var Border;
    
    function initialize(p_PlayingState, p_EffectsManager, appMetaData, gl, p_context, p_Cursor, p_InputEventsManager, p_Border, callback){
        EffectsManager = p_EffectsManager;
        PlayingState = p_PlayingState;
        context = p_context;
        Cursor = p_Cursor;
        InputEventsManager = p_InputEventsManager;
        Border = p_Border;
        
        startButtonHandler = EffectsManager.requestBasicTargetEffect(true, gl, 10, new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), {radius: [100], numBolts: [10], lgGlowFactor: [1], circleGlowFactor: [4], circleLineWidth: [4], lgLineWidth: [1], rotationBool: [1.0], spaceInCenterBool: [1.0]});
        callbackToSwitchState = callback;
        hitRegions = new CircularHitRegions(new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2));
        hitRegions.addRegion(new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), 100);
        lightningStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), Border.getScorePosition(), {lineWidth: [10], glowFactor: [20]});
        lightningStrikeHandler.setDuration(2000);
    }
    
    function draw(gl, interpolation){
        startButtonHandler.update();
        Cursor.draw();
        Border.draw(interpolation);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.BLEND);
        
        doGLDrawingFromHandlers(gl, EffectsManager);
        
        if(shouldDrawText){
            context.fillStyle = "yellow";
            context.font = '40px Comic Sans MS';
            context.textAlign = "center";
            context.textBaseline = "middle"; 
            context.shadowBlur = 2;
            context.shadowColor = "white";
            context.fillText("Start", (canvas.width / 2), canvas.height / 2);
        }
    }
    
    function update(){
        var inputObj = InputEventsManager.getCurrentInputObj();
        
        if(inputObj.mouseState.type === "left_mouse_down" || inputObj.mouseState.type === "left_mouse_held_down"){
            if(hitRegions.isInAnyRegion(new Vector(inputObj.mouseState.x, inputObj.mouseState.y))){
                startButtonHandler.shouldDraw(false);
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                shouldDrawText = false;
                startButtonHandler.doDestroyEffect(new Vector(context.canvas.width / 2, context.canvas.height / 2), function(){ });
                lightningStrikeHandler.doStrikeEffect();
                Border.showScore();
                Border.showHealthBar();
                callbackToSwitchState(PlayingState);
            }
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update
    };
});