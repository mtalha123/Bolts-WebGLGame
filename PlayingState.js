define(['Custom Utility/FPSCounter', 'Controllers/BasicTargetsController', 'EventSystem', 'NetworkManager', 'ComboSystem', 'Controllers/BonusTargetOrbsController', 'Controllers/BonusTargetOrbsStreakController', 'Controllers/BonusTargetBubblyOrbsController', 'Controllers/TriangularTargetController', 'Controllers/FourPointTargetController', 'Controllers/SpikeEnemyController', 'Controllers/TentacleEnemyController', 'Controllers/OrbitEnemyController', 'Controllers/TeleportationTargetsController', 'LoadingState', 'StartingState', 'SynchronizedTimers', 'doGLDrawingFromHandlers', 'Custom Utility/Vector', 'BigLightningStrike', 'Custom Utility/Random', 'timingCallbacks'], function(FPSCounter, BasicTargetsController, EventSystem, NetworkManager, ComboSystem, BonusTargetOrbsController, BonusTargetOrbsStreakController, BonusTargetBubblyOrbsController, TriangularTargetController, FourPointTargetController, SpikeEnemyController, TentacleEnemyController, OrbitEnemyController, TeleportationTargetsController, LoadingState, StartingState, SynchronizedTimers, doGLDrawingFromHandlers, Vector, BigLightningStrike, Random, timingCallbacks){
    var NUM_MILLISECONDS_IN_SECOND = 1000;
    
    var Cursor;
    var Border;
    
    var basicTargetsController;
    var bonusTargetOrbsController;
    var bonusTargetOrbsStreakController;
    var bonusTargetBubblyOrbsController;
    var triangularTargetController;
    var fourPointTargetController;
    var spikeEnemyController;
    var tentacleEnemyController;
    var orbitEnemyController;
    var teleportationTargetsController;
    
    var InputEventsManager;
    var EffectsManager;
    
    var gameLevelTimer = SynchronizedTimers.getTimer();
    var currentGameLevel = 1;
    var timeUntilNextLevel = Random.getRandomIntInclusive(15 * NUM_MILLISECONDS_IN_SECOND, 20 * NUM_MILLISECONDS_IN_SECOND);
    var fpsCounter = Object.create(FPSCounter);
    var fpsTextHandler;
    
    var canvasWidth, canvasHeight;
    var callbackToSwitchState;
    var RestartState;
    var PausedState;
    var canPause = true;

    var spawnTimer = SynchronizedTimers.getTimer();
    var timeUntilNextMainTargetSpawns = 2500;
    var mainTargetsChancesOfSpawning = [];
    
    function initialize(gl, appMetaData, p_EffectsManager, p_InputEventsManager, AssetManager, AudioManager, p_Cursor, p_Border, p_RestartState, p_PausedState, TextManager, callback){
        InputEventsManager = p_InputEventsManager;
        EffectsManager = p_EffectsManager;
        Border = p_Border;

        ComboSystem.initialize(gl, appMetaData.getCanvasHeight(), EffectsManager, Border, TextManager);
        BigLightningStrike.initialize(gl, appMetaData.getCanvasHeight(), AssetManager, EffectsManager, AudioManager, p_Cursor);
        
        // Main target controllers
        basicTargetsController = new BasicTargetsController(gl, appMetaData, 10, EffectsManager, AudioManager); 
        triangularTargetController = new TriangularTargetController(gl, appMetaData, 7, EffectsManager, AudioManager);
        fourPointTargetController = new FourPointTargetController(gl, appMetaData, 4, EffectsManager, AudioManager);
        teleportationTargetsController = new TeleportationTargetsController(gl, appMetaData, 6, EffectsManager, AudioManager);
        
        // Bonus target controllers
        bonusTargetOrbsController = new BonusTargetOrbsController(gl, appMetaData, 3, 0, EffectsManager, AudioManager); 
        bonusTargetOrbsStreakController = new BonusTargetOrbsStreakController(gl, appMetaData, 3, 0, EffectsManager, AudioManager); 
        bonusTargetBubblyOrbsController = new BonusTargetBubblyOrbsController(gl, appMetaData, 3, 0, EffectsManager, AudioManager);
        
        // Enemy controllers
        spikeEnemyController = new SpikeEnemyController(gl, appMetaData, 2, 0, EffectsManager, AudioManager);
        tentacleEnemyController = new TentacleEnemyController(gl, appMetaData, 2, 0, EffectsManager, AudioManager);
        orbitEnemyController = new OrbitEnemyController(gl, appMetaData, 2, 0, EffectsManager, AudioManager);
        
        fpsTextHandler = TextManager.requestTextHandler("Comic Sans MS", "blue", appMetaData.getCanvasHeight() * 0.05, new Vector(appMetaData.getCanvasWidth() * 0.9, appMetaData.getCanvasHeight() * 0.95), fpsCounter.getFPS().toString(), false);
        
        Cursor = p_Cursor;
        
        canvasWidth = appMetaData.getCanvasWidth();
        canvasHeight = appMetaData.getCanvasHeight();
        callbackToSwitchState = callback;
        RestartState = p_RestartState;
        PausedState = p_PausedState;
        
        mainTargetsChancesOfSpawning = [[0, triangularTargetController], [0, fourPointTargetController], [0, teleportationTargetsController], [100, basicTargetsController]];
        
        EventSystem.register(receiveEvent, "game_lost");
        EventSystem.register(receiveEvent, "keydown");
    }
    
    function draw(gl, interpolation){
        fpsTextHandler.shouldDraw(true);
        fpsCounter.start();
        
        Border.draw(interpolation);
        
        BigLightningStrike.prepareForDrawing();
        
        basicTargetsController.prepareForDrawing(interpolation);
        bonusTargetOrbsController.prepareForDrawing(interpolation);
        bonusTargetOrbsStreakController.prepareForDrawing(interpolation);
        bonusTargetBubblyOrbsController.prepareForDrawing(interpolation);
        triangularTargetController.prepareForDrawing(interpolation);
        fourPointTargetController.prepareForDrawing(interpolation);
        spikeEnemyController.prepareForDrawing(interpolation);
        tentacleEnemyController.prepareForDrawing(interpolation);
        orbitEnemyController.prepareForDrawing(interpolation);
        teleportationTargetsController.prepareForDrawing(interpolation);
        Cursor.draw(interpolation);

        ComboSystem.draw();
        
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.BLEND);
       // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Additive blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        doGLDrawingFromHandlers(gl, EffectsManager);
        
        fpsTextHandler.setText(fpsCounter.getFPS().toString());
        fpsTextHandler.draw();
        fpsCounter.end();
    }
    
    function update(inputObj){
        
        gameLevelTimer.start();
        handleGameLeveling();
        
        spawnTimer.start();
        if(spawnTimer.getTime() >= timeUntilNextMainTargetSpawns){            
            var controllerToMakeSpawn = getWeightedRandomController();
            if(!controllerToMakeSpawn.canSpawn()){                
                // since random controller cannot spawn, find the next controller that can spawn starting from the beginning of mainTargetsChancesOfSpawning array
                for(var j = 0; j < mainTargetsChancesOfSpawning.length; j++){
                    if(mainTargetsChancesOfSpawning[j][1].canSpawn()){
                        controllerToSpawn = mainTargetsChancesOfSpawning[j][1];
                        break;
                    }
                }
            }
            
            // if controller was found that can spawn, then it will spawn. Else, nothing will happen
            if(controllerToMakeSpawn.canSpawn()){
                controllerToMakeSpawn.spawn();
            }
            
            spawnTimer.reset();
            spawnTimer.start();
        }
        
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
        tentacleEnemyController.update();
        orbitEnemyController.update();
        teleportationTargetsController.update();
        
        EventSystem.update();
    }
    
    function receiveEvent(eventInfo){
        if(eventInfo.eventType === "game_lost"){
            gameLevelTimer.reset();
            mainTargetsChancesOfSpawning = [[0, triangularTargetController], [0, fourPointTargetController], [0, teleportationTargetsController], [100, basicTargetsController]];
            currentGameLevel = 1;
            timeUntilNextLevel = Random.getRandomIntInclusive(15 * NUM_MILLISECONDS_IN_SECOND, 20 * NUM_MILLISECONDS_IN_SECOND);
            timeUntilNextMainTargetSpawns = 2500
            RestartState.activate(eventInfo.eventData.score);
            callbackToSwitchState(RestartState);
        }else if(eventInfo.eventType === "keydown"){
            if(eventInfo.eventData.key === "p" || eventInfo.eventData.key === "P"){
                if(canPause){
                    callbackToSwitchState(PausedState);
                    canPause = false;
                    timingCallbacks.addTimingEvents(this, 1000, 1, function(){}, function(){
                        canPause = true;
                    });
                    EventSystem.publishEventImmediately("game_pause");
                }
            }
        }
    }
    
    function getWeightedRandomController(){
        var sum = 0;
        var randVal = Random.getRandomIntInclusive(1, 100);
        for(var i = 0; i < mainTargetsChancesOfSpawning.length; i++){
            sum += mainTargetsChancesOfSpawning[i][0];
            if(randVal <= sum){
                return mainTargetsChancesOfSpawning[i][1];
            }
        }
    }
    
    function handleGameLeveling(){ 
        if(gameLevelTimer.getTime() >= timeUntilNextLevel){
            currentGameLevel++;
            
            if(currentGameLevel === 2){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(15 * NUM_MILLISECONDS_IN_SECOND, 20 * NUM_MILLISECONDS_IN_SECOND);
                
            }else if(currentGameLevel === 3){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(15 * NUM_MILLISECONDS_IN_SECOND, 20 * NUM_MILLISECONDS_IN_SECOND);  
                
            }else if(currentGameLevel === 4){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(20 * NUM_MILLISECONDS_IN_SECOND, 25 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 2000;
                
            }else if(currentGameLevel === 5){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(20 * NUM_MILLISECONDS_IN_SECOND, 30 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 1500;
                mainTargetsChancesOfSpawning = [[0, fourPointTargetController], [0, teleportationTargetsController], [10, triangularTargetController], [90, basicTargetsController]];
                
            }else if(currentGameLevel === 6){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(25 * NUM_MILLISECONDS_IN_SECOND, 30 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 1000;
                mainTargetsChancesOfSpawning = [[0, fourPointTargetController], [0, teleportationTargetsController], [20, triangularTargetController], [80, basicTargetsController]];
                
            }else if(currentGameLevel === 7){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(25 * NUM_MILLISECONDS_IN_SECOND, 30 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 700;
                mainTargetsChancesOfSpawning = [[0, fourPointTargetController], [0, teleportationTargetsController], [30, triangularTargetController], [70, basicTargetsController]];
                
            }else if(currentGameLevel === 8){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(20 * NUM_MILLISECONDS_IN_SECOND, 30 * NUM_MILLISECONDS_IN_SECOND);
                mainTargetsChancesOfSpawning = [[0, teleportationTargetsController], [25, fourPointTargetController], [25, triangularTargetController], [50, basicTargetsController]];
                
            }else if(currentGameLevel === 9){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(30 * NUM_MILLISECONDS_IN_SECOND, 40 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 300;
                mainTargetsChancesOfSpawning = [[0, teleportationTargetsController], [30, basicTargetsController], [30, triangularTargetController], [40, fourPointTargetController]];
                
            }else if(currentGameLevel === 10){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(60 * NUM_MILLISECONDS_IN_SECOND, 70 * NUM_MILLISECONDS_IN_SECOND);
                mainTargetsChancesOfSpawning = [[20, teleportationTargetsController], [20, basicTargetsController], [20, triangularTargetController], [40, fourPointTargetController]];
                
            }else if(currentGameLevel === 11){
                
                timeUntilNextLevel = Random.getRandomIntInclusive(30 * NUM_MILLISECONDS_IN_SECOND, 40 * NUM_MILLISECONDS_IN_SECOND);
                timeUntilNextMainTargetSpawns = 200;
                mainTargetsChancesOfSpawning = [[20, fourPointTargetController], [20, basicTargetsController], [20, triangularTargetController], [40, teleportationTargetsController]];
                
            }
            
            gameLevelTimer.reset();
            gameLevelTimer.start();
            
            EventSystem.publishEvent("game_level_up", {level: currentGameLevel});
            console.log("LEVEL: " + currentGameLevel);
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update
    };
});