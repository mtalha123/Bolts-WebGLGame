define(['Custom Utility/CircularHitRegions', 'doGLDrawingFromHandlers', 'Custom Utility/Vector'], function(CircularHitRegions, doGLDrawingFromHandlers, Vector){
    var PlayingState;
    var startButtonHandler;
    var callbackToSwitchState;
    var hitRegions;
    var EffectsManager;
    var canvasWidth;
    var canvasHeight;
    var Cursor;
    var InputEventsManager;
    var lightningStrikeHandler;
    var lightningStrikeSoundEffect;
    var Border; 
    var textHandler;
    
    function initialize(p_PlayingState, p_EffectsManager, AudioManager, appMetaData, gl, p_Cursor, p_InputEventsManager, p_Border, TextManager, callback){
        EffectsManager = p_EffectsManager;
        PlayingState = p_PlayingState;
        Cursor = p_Cursor;
        InputEventsManager = p_InputEventsManager;
        Border = p_Border;
        canvasWidth = appMetaData.getCanvasWidth();
        canvasHeight = appMetaData.getCanvasHeight();
        
        startButtonHandler = EffectsManager.requestBasicTargetEffect(true, gl, 10, new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), {radius: [appMetaData.getCanvasHeight() * 0.15], numBolts: [10], lgGlowFactor: [1], circleGlowFactor: [4], circleLineWidth: [4], lgLineWidth: [1], rotationBool: [1.0], spaceInCenterBool: [1.0]});
        callbackToSwitchState = callback;
        hitRegions = new CircularHitRegions(new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2));
        hitRegions.addRegion(new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), 100);
        lightningStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), Border.getScorePosition(), {lineWidth: [10], glowFactor: [20]});
        lightningStrikeHandler.setDuration(2000);
        lightningStrikeSoundEffect = AudioManager.getAudioHandler("lightning_strike_sound_effect");
        textHandler = TextManager.requestTextHandler("Comic Sans MS", "yellow", appMetaData.getCanvasHeight() * 0.05, new Vector(appMetaData.getCanvasWidth() / 2, appMetaData.getCanvasHeight() / 2), "Start", false);
    }
    
    function draw(gl, interpolation){
        startButtonHandler.update();
        Cursor.draw();
        Border.draw(interpolation);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.BLEND);
        
        doGLDrawingFromHandlers(gl, EffectsManager);
        
        textHandler.shouldDraw(true);
        textHandler.draw();
    }
    
    function update(){
        var inputObj = InputEventsManager.getCurrentInputObj();
        
        if(inputObj.mouseState.type === "left_mouse_down" || inputObj.mouseState.type === "left_mouse_held_down"){
            if(hitRegions.isInAnyRegion(new Vector(inputObj.mouseState.x, inputObj.mouseState.y))){
                startButtonHandler.shouldDraw(false);
                startButtonHandler.doDestroyEffect(new Vector(canvasWidth / 2, canvasHeight / 2), function(){ });
                lightningStrikeHandler.doStrikeEffect();
                Border.showScore();
                Border.showHealthBar();
                lightningStrikeSoundEffect.play();
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