define(['Custom Utility/FPSCounter', 'Border', 'Cursor', 'Controllers/BasicTargetsController', 'EventSystem', 'NetworkManager', 'ComboSystem', 'Background', 'Controllers/BonusTargetOrbsController', 'Controllers/BonusTargetOrbsStreakController', 'Controllers/BonusTargetBubblyOrbsController', 'Controllers/TriangularTargetController', 'Controllers/FourPointTargetController', 'Controllers/SpikeEnemyController', 'LoadingState', 'StartingState', 'SynchronizedTimers', 'doGLDrawingFromHandlers'], function(FPSCounter, Border, Cursor, BasicTargetsController, EventSystem, NetworkManager, ComboSystem, Background, BonusTargetOrbsController, BonusTargetOrbsStreakController, BonusTargetBubblyOrbsController, TriangularTargetController, FourPointTargetController, SpikeEnemyController, LoadingState, StartingState, SynchronizedTimers, doGLDrawingFromHandlers){
    var Cursor;
    var Background;
    var Border;
    
    var basicTargetsController;
    var bonusTargetOrbsController;
    var bonusTargetOrbsStreakController;
    var bonusTargetOrbsStreakController;
    var bonusTargetBubblyOrbsController;
    var triangularTargetController;
    var fourPointTargetController;
    var spikeEnemyController;
    
    var InputEventsManager;
    var EffectsManager;
    
    var gameLevelTimer = SynchronizedTimers.getTimer();
    var fpsCounter = Object.create(FPSCounter);
    var fpsHandler;
    
    var canvasWidth, canvasHeight;
    var callbackToSwitchState;
    var RestartState;
    
    function initialize(gl, appMetaData, p_EffectsManager, p_InputEventsManager, AssetManager, p_Cursor, p_RestartState, callback){
        InputEventsManager = p_InputEventsManager;
        EffectsManager = p_EffectsManager;
        
        Background.initialize(gl, EffectsManager);
        Border.initialize(gl, appMetaData, 10, AssetManager, EffectsManager);
        ComboSystem.initialize(gl, EffectsManager, Border);
        basicTargetsController = new BasicTargetsController(gl, appMetaData, 10, EffectsManager); 
        bonusTargetOrbsController = new BonusTargetOrbsController(gl, appMetaData, 2, EffectsManager); 
        bonusTargetOrbsStreakController = new BonusTargetOrbsStreakController(gl, appMetaData, 2, EffectsManager); 
        bonusTargetBubblyOrbsController = new BonusTargetBubblyOrbsController(gl, appMetaData, 2, EffectsManager);
        triangularTargetController = new TriangularTargetController(gl, appMetaData, 5, EffectsManager);
        fourPointTargetController = new FourPointTargetController(gl, appMetaData, 5, EffectsManager);
        spikeEnemyController = new SpikeEnemyController(gl, appMetaData, 3, EffectsManager);
        
        fpsHandler = EffectsManager.requestTextEffect(false, gl, 1, {}, appMetaData.getCanvasWidth() * 0.9, appMetaData.getCanvasHeight() * 0.88, fpsCounter.getFPS().toString());
        
        Cursor = p_Cursor;
        
        canvasWidth = appMetaData.getCanvasWidth();
        canvasHeight = appMetaData.getCanvasHeight();
        callbackToSwitchState = callback;
        RestartState = p_RestartState;
        
        EventSystem.register(receiveEvent, "game_lost");
    }
    
    function draw(gl, interpolation){
        fpsHandler.shouldDraw(true);
        fpsCounter.start();
        
        Border.draw(interpolation);
        
        basicTargetsController.prepareForDrawing(interpolation);
        bonusTargetOrbsController.prepareForDrawing(interpolation);
        bonusTargetOrbsStreakController.prepareForDrawing(interpolation);
        bonusTargetBubblyOrbsController.prepareForDrawing(interpolation);
        triangularTargetController.prepareForDrawing(interpolation);
        fourPointTargetController.prepareForDrawing(interpolation);
        spikeEnemyController.prepareForDrawing(interpolation);
        Cursor.draw(interpolation);

        ComboSystem.draw();
        Background.draw();
        
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.65, 0.65, 0.65, 1.0);
        gl.enable(gl.BLEND);
       // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        doGLDrawingFromHandlers(gl, EffectsManager);
        
        fpsHandler.setText(fpsCounter.getFPS().toString(), canvasWidth, canvasHeight);
        fpsCounter.end();
    }
    
    function update(inputObj){
        gameLevelTimer.start();
        handleGameLeveling();
//        if(intputObj != undefined){
//            inputInfo.updateCounter = updateCounter;
//            NetworkManager.sendToServer("input", inputInfo);
//        }else{
//            NetworkManager.sendToServer("input", "none");
//        }
        
//        //testing
//        var inputObj = InputEventsManager.getCurrentInputObj();
//        if(inputObj.mouseState.type === "mouse_held_down" && inputObj.mouseState.x <= 100){
//            RestartState.activate();
//            callbackToSwitchState(RestartState);
//        }
        
        InputEventsManager.notifyOfCurrentStateAndConsume();
        
        ComboSystem.update();
        Border.update();
        basicTargetsController.update();
        bonusTargetOrbsController.update();
        bonusTargetOrbsStreakController.update();
        bonusTargetBubblyOrbsController.update();
        triangularTargetController.update();
        fourPointTargetController.update();
        spikeEnemyController.update();
        EventSystem.update();
    }
    
    function receiveEvent(eventInfo){
        gameLevelTimer.reset();
        RestartState.activate(eventInfo.eventData.score);
        callbackToSwitchState(RestartState);
    }
    
    function activate(){
        
    }
    
    function handleGameLeveling(){
        console.log("CURRENT TIME: " + gameLevelTimer.getTime());
        
        if(gameLevelTimer.getTime() >= 290000){
            EventSystem.publishEvent("game_level_up", {level: 8})
            console.log("LEVEL 8");
        }else if(gameLevelTimer.getTime() >= 230000){
            EventSystem.publishEvent("game_level_up", {level: 7})
            console.log("LEVEL 7");
        }else if(gameLevelTimer.getTime() >= 170000){
            EventSystem.publishEvent("game_level_up", {level: 6})
            console.log("LEVEL 6");
        }else if(gameLevelTimer.getTime() >= 130000){
            EventSystem.publishEvent("game_level_up", {level: 5})
            console.log("LEVEL 5");
        }else if(gameLevelTimer.getTime() >= 90000){
            EventSystem.publishEvent("game_level_up", {level: 4})
            console.log("LEVEL 4");
        }else if(gameLevelTimer.getTime() >= 60000){
            EventSystem.publishEvent("game_level_up", {level: 3})
            console.log("LEVEL 3");
        }else if(gameLevelTimer.getTime() >= 20000){
            EventSystem.publishEvent("game_level_up", {level: 2})
            console.log("LEVEL 2");
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update
    };
});