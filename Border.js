define(['EventSystem', 'Custom Utility/coordsToRGB', 'Custom Utility/Vector'], function(EventSystem, coordsToRGB, Vector){
    
    var margin;    
    var borderLength;
    var borderWidth;
    var gapForScore;
    var score = 0;
    var scoreX, scoreY;
    
    var borderPath;
    var handler;
    var scoreHandler;
    var healthBarHandler;
    var appMetaData;
    var totalCharge, currentCharge;
    var lightningStrikeHandler;
    var lightningStrikeSoundEffect;
    
    function initialize(gl, p_appMetaData, p_totalCharge, AssetManager, EffectsManager, AudioManager, TextManager){     
        appMetaData = p_appMetaData;
        
        margin = 0.05 * appMetaData.getCanvasHeight();
        borderLength = appMetaData.getCanvasWidth() - (margin * 2);
        borderWidth = 0.05 * appMetaData.getCanvasHeight();
        gapForScore = 0.15 * appMetaData.getCanvasWidth();
        scoreX = margin + (borderLength/2);
        scoreY = appMetaData.getCanvasHeight() - margin;
        totalCharge = currentCharge = p_totalCharge;
        
        
        borderPath = [ //               X                                                                           Y
                            margin + (borderLength/2) - (gapForScore/2),                                  appMetaData.getCanvasHeight() - margin,
                            margin,                                                                       appMetaData.getCanvasHeight() - margin, 
                            margin,                                                                       margin,       
                            appMetaData.getCanvasWidth() - margin,                                        margin, 
                            appMetaData.getCanvasWidth() - margin,                                        appMetaData.getCanvasHeight() - margin,
                            (appMetaData.getCanvasWidth() - margin - (borderLength/2)) + (gapForScore/2), appMetaData.getCanvasHeight() - margin           
        ];
        
        handler = EffectsManager.requestLightningEffect(false, gl, 3, {}, borderPath);
        handler.setToBorderPath(gl, borderPath[0], borderPath[10]);
        scoreHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 0, 1.0], appMetaData.getCanvasHeight() * 0.05, new Vector(scoreX, scoreY), "0", false);
        healthBarHandler = EffectsManager.requestLifebarHandler(false, gl, 60, new Vector(borderPath[0], borderPath[1] - (appMetaData.getCanvasHeight() * 0.07)), new Vector(borderPath[borderPath.length-2], borderPath[borderPath.length-1] - (appMetaData.getCanvasHeight() * 0.07)), {glowFactor: [10]});
        lightningStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, new Vector(scoreX, scoreY), new Vector(scoreX, 0), {lineWidth: [10], glowFactor: [20]});
        lightningStrikeHandler.setDuration(4000);
        lightningStrikeSoundEffect = AudioManager.getAudioHandler("lightning_strike_sound_effect");
        
        
        EventSystem.register(receiveEvent, "entity_spawned");
        EventSystem.register(receiveEvent, "entity_destroyed");
        EventSystem.register(receiveEvent, "game_restart");
        EventSystem.register(receiveEvent, "lightning_stolen");
        EventSystem.register(receiveEvent, "lightning_returned");
        EventSystem.register(receiveEvent, "entity_destroyed_by_lightning_strike");
        EventSystem.register(receiveEvent, "score_achieved");
    }
    
    function draw(interpolation){    
        handler.shouldDraw(true);        
        scoreHandler.setText(score.toString());
        scoreHandler.draw();
        handler.update();
    }
    
    function update(){        
    }
    
    function getLeftX(){
        return (margin + borderWidth);
    }
    function getTopY(){
        return appMetaData.getCanvasHeight() - (margin + borderWidth);
    }
    function getRightX(){
        return (appMetaData.getCanvasWidth() - margin - borderWidth);
    }
    function getBottomY(){
        return margin + borderWidth;
    }
    
    function getScorePosition(){
        return new Vector(scoreX, scoreY);
    }
    
    function showHealthBar(){
        healthBarHandler.shouldDraw(true);
    }
    
    function showScore(){
        scoreHandler.shouldDraw(true);
    }
    
    function receiveEvent(eventInfo){  
        if(eventInfo.eventType === "entity_spawned"){
            if(eventInfo.eventData.type === "main"){
                currentCharge--;
                healthBarHandler.setCompletion(currentCharge / totalCharge);
            }
        }else if(eventInfo.eventType === "entity_destroyed"){
            if(eventInfo.eventData.type === "main"){
                currentCharge++;
                healthBarHandler.setCompletion(currentCharge / totalCharge );
            }
        }else if(eventInfo.eventType === "lightning_stolen"){
            currentCharge--;
            healthBarHandler.setCompletion(currentCharge / totalCharge);
        }else if(eventInfo.eventType === "lightning_returned"){
            currentCharge += eventInfo.eventData.amount;
            healthBarHandler.setCompletion(currentCharge / totalCharge);
        }else if(eventInfo.eventType === "game_restart"){
            healthBarHandler.shouldDraw(true);
            scoreHandler.shouldDraw(true);
            currentCharge = totalCharge;
            healthBarHandler.setCompletion(1.0);
            score = 0;
        }else if(eventInfo.eventType === "entity_destroyed_by_lightning_strike"){
            if(eventInfo.eventData.type === "main"){
                currentCharge++;
                healthBarHandler.setCompletion(currentCharge / totalCharge);
            }
        }else if(eventInfo.eventType === "score_achieved"){
            score += eventInfo.eventData.amount;
            healthBarHandler.setCompletion(currentCharge / totalCharge);
        }
        
        processGameLosing();
    }
    
    function processGameLosing(){
        if(currentCharge === 0){
            lightningStrikeHandler.doStrikeEffect(function(){});
            lightningStrikeSoundEffect.play();
            healthBarHandler.shouldDraw(false);
            scoreHandler.shouldDraw(false);
            
            // save score in cookie
            var farDateInTheFuture = new Date("July 1, 2030 01:00:00");
            if(document.cookie === ""){
                // cookie doesn't exist
                document.cookie = "score=" + score + "; expires=" + farDateInTheFuture.toUTCString();   
            }else{
                var previousBest = parseInt(document.cookie.substring(6)); 
                if(score > previousBest){
                    document.cookie = "score=" + score + "; expires=" + farDateInTheFuture.toUTCString();   
                }
            }
            
            EventSystem.publishEventImmediately("game_lost", {score: score});
        }                  
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        getLeftX: getLeftX,
        getTopY: getTopY,
        getRightX: getRightX,
        getBottomY: getBottomY,
        getScorePosition: getScorePosition,
        showHealthBar: showHealthBar,
        showScore: showScore
    }
});