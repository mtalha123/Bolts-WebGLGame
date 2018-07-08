define(['EventSystem', 'Custom Utility/Vector'], function(EventSystem, Vector){    
    var PlayingState;
    var pausedTextHandler;
    var callbackToSwitchState;
    var InputEventsManager;
    var appMetaData;
    
    function initialize(p_appMetaData, gl, p_PlayingState, EffectsManager, p_callbackToSwitchState, p_InputEventsManager, TextManager){
        PlayingState = p_PlayingState;
        callbackToSwitchState = p_callbackToSwitchState;
        InputEventsManager = p_InputEventsManager;
        appMetaData = p_appMetaData;
        pausedTextHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 0, 1.0], appMetaData.getCanvasHeight() * 0.04, new Vector(100, 100), "", false);
    }
    
    function update(){
        var inputObj = InputEventsManager.getCurrentInputObj();
        
        if(inputObj.keyboardState.type === "keydown"){
            if(inputObj.keyboardState.key === "p" || inputObj.keyboardState.key === "P"){
                EventSystem.publishEventImmediately("game_resume");
                callbackToSwitchState(PlayingState);
            }
        }
    }
    
    function draw(){
        pausedTextHandler.shouldDraw(true);
        
        var gapBetweenLinesOfText = appMetaData.getCanvasHeight() * 0.07;
        
        pausedTextHandler.setText("PAUSED");
        pausedTextHandler.setPosition(new Vector(appMetaData.getCanvasWidth() / 2, (appMetaData.getCanvasHeight() / 2) + (gapBetweenLinesOfText / 2)));
        pausedTextHandler.draw();
        
        pausedTextHandler.setText("PRESS P TO RESUME GAME");
        pausedTextHandler.setPosition(new Vector(appMetaData.getCanvasWidth() / 2, (appMetaData.getCanvasHeight() / 2) - (gapBetweenLinesOfText / 2)));
        pausedTextHandler.draw();
    }
    
    return {
        initialize: initialize,
        update: update,
        draw: draw,
    };   
});