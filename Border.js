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
    
    function initialize(gl, p_appMetaData, p_totalCharge, AssetManager, EffectsManager){     
        appMetaData = p_appMetaData;
        
        margin = 0.05 * appMetaData.getCanvasHeight();
        borderLength = appMetaData.getCanvasWidth() - (margin * 2);
        borderWidth = 0.05 * appMetaData.getCanvasHeight();
        gapForScore = 0.15 * appMetaData.getCanvasWidth();
        scoreX = margin + (borderLength/2);
        scoreY = appMetaData.getCanvasHeight() - (margin + 0.08 * appMetaData.getCanvasHeight());
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
        scoreHandler = EffectsManager.requestTextEffect(false, gl, 4, {}, new Vector(100, 100), "0");
        healthBarHandler = EffectsManager.requestLifebarHandler(false, gl, 60, new Vector(borderPath[0], borderPath[1] - 50), new Vector(borderPath[borderPath.length-2], borderPath[borderPath.length-1] - 50), {});
        lightningStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, new Vector(scoreX, scoreY + margin), new Vector(scoreX, 0), {lineWidth: [10], glowFactor: [20]});
        lightningStrikeHandler.setDuration(4000);
        
        EventSystem.register(receiveEvent, "entity_spawned");
        EventSystem.register(receiveEvent, "entity_destroyed");
        EventSystem.register(receiveEvent, "game_restart");
        EventSystem.register(receiveEvent, "lightning_stolen");
        EventSystem.register(receiveEvent, "lightning_returned");
    }
    
    function draw(interpolation){    
        scoreHandler.shouldDraw(true);
        handler.shouldDraw(true);
        healthBarHandler.shouldDraw(true);
        
        scoreHandler.setText(score.toString());
        //FIX: SHOULD BE "scoreHandler.width / 2"
        scoreHandler.setPosition(new Vector(scoreX - (scoreHandler.getWidth() / 3.5), scoreY));
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
    
    function receiveEvent(eventInfo){  
        if(eventInfo.eventType === "entity_spawned"){
            if(eventInfo.eventData.type === "main"){
                currentCharge--;
                healthBarHandler.setCompletion(currentCharge / totalCharge);
                if(currentCharge === 0){
                    lightningStrikeHandler.doStrikeEffect(function(){
//                        EventSystem.publishEventImmediately("game_lost", {score: score});    
                    });
                    healthBarHandler.shouldDraw(false);
                    scoreHandler.shouldDraw(false);
                    return;
                }
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
            currentCharge++;
            healthBarHandler.setCompletion(currentCharge / totalCharge);
        }else if(eventInfo.eventType === "game_restart"){
            healthBarHandler.shouldDraw(true);
            scoreHandler.shouldDraw(true);
            currentCharge = totalCharge;
            healthBarHandler.setCompletion(1.0);
            score = 0;
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
    }
});