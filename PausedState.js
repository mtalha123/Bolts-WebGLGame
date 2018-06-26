define(['EventSystem', 'Custom Utility/Vector'], function(EventSystem, Vector){    
    var PlayingState;
    var pausedTextHandler;
    var callbackToSwitchState;
    var InputEventsManager;
    var context;
    var appMetaData;
    
    function initialize(p_appMetaData, gl, p_PlayingState, p_context, EffectsManager, p_callbackToSwitchState, p_InputEventsManager){
        PlayingState = p_PlayingState;
        callbackToSwitchState = p_callbackToSwitchState;
        InputEventsManager = p_InputEventsManager;
        context = p_context;
        appMetaData = p_appMetaData;
    }
    
    function update(){
        var inputObj = InputEventsManager.getCurrentInputObj();
        
        if(inputObj.keyboardState.type === "keydown"){
            if(inputObj.keyboardState.key === "p" || inputObj.keyboardState.key === "P"){
                context.clearRect(0, 0, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight());
                EventSystem.publishEventImmediately("game_resume");
                callbackToSwitchState(PlayingState);
            }
        }
    }
    
    function draw(){
        context.fillStyle = "yellow";
        context.font = '40px Comic Sans MS';
        context.textAlign = "center";
        context.textBaseline = "middle"; 
        context.shadowBlur = 2;
        context.shadowColor = "white";
        context.fillText("PAUSED", (canvas.width / 2), canvas.height / 2);
        context.fillText("PRESS P TO RESUME GAME", (canvas.width / 2), (canvas.height / 2) + (appMetaData.getCanvasHeight() * 0.07));
    }
    
    return {
        initialize: initialize,
        update: update,
        draw: draw,
    };   
});