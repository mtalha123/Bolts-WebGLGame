define(['Border', 'Custom Utility/Vector', 'EventSystem', 'Border', 'timingCallbacks'], function(Border, Vector, EventSystem, Border, timingCallbacks){
    var glowingRingHandler;
    var lgBoltIconHandler;
    var lgBoltCoverAreaHandler;
    var lgStrikeHandler;
    var numChargesNeeded = 5;
    var currNumCharges = 0;
    var readyToFire = false;
    var startCoord;
    var widthOfAreaCovered;
    var canActivate = true;
    
    function initialize(gl, canvasHeight, AssetManager, EffectsManager, p_Cursor){
        var radius = canvasHeight * 0.05;
        var lgBoltIconWidthAndHeight = canvasHeight * 0.05;
        widthOfAreaCovered = canvasHeight * 0.15;
        startCoord = new Vector(Border.getRightX() - radius, Border.getTopY() - radius);
        glowingRingHandler = EffectsManager.requestGlowingRingHandler(false, gl, 300, startCoord, {radius: [radius]});
        lgBoltIconHandler = EffectsManager.requestSpriteHandler(false, gl, 100, startCoord, lgBoltIconWidthAndHeight, {color: [0.3, 0.3, 0.3]}, AssetManager.getTextureAsset("lightningBolt"));
        lgBoltCoverAreaHandler = EffectsManager.requestRectangleHandler(false, gl, 100, startCoord, new Vector(100, 100), widthOfAreaCovered, {color: [1.0, 0.0, 0.4, 0.3]});
        Cursor = p_Cursor;
        lgStrikeHandler = EffectsManager.requestLightningStrikeHandler(true, gl, 100, startCoord, new Vector(100, 100), {lineWidth: [6], glowFactor: [40], jaggedFactor: [1], fluctuation: [80], boltColor: [1.0, 0.0, 0.4]});
        lgStrikeHandler.setDuration(6000);
        EventSystem.register(receiveEvent, "right_mouse_down");
        EventSystem.register(receiveEvent, "left_mouse_down");
        EventSystem.register(receiveEvent, "right_mouse_held_down");
        EventSystem.register(receiveEvent, "left_mouse_held_down");
        EventSystem.register(receiveEvent, "entity_destroyed");
    }
    
    function prepareForDrawing(){ 
        glowingRingHandler.shouldDraw(true);
        lgBoltIconHandler.shouldDraw(true);
        
        if(currNumCharges === numChargesNeeded){
            lgBoltIconHandler.update();
        }
        
        if(readyToFire){
            lgBoltCoverAreaHandler.setEndCoord(Cursor.getPosition());
        }
    }
    
    function receiveEvent(eventInfo){
        if(eventInfo.eventType === "left_mouse_down" || eventInfo.eventType === "left_mouse_held_down"){
            if(readyToFire){
                lgBoltCoverAreaHandler.shouldDraw(false);
                lgBoltIconHandler.setColor(0.3, 0.3, 0.3);
                lgBoltIconHandler.resetTime();
                glowingRingHandler.setCompletion(0.0);
                lgStrikeHandler.setLightningStrikeEndCoord(Cursor.getPosition());
                lgStrikeHandler.doStrikeEffect();
                readyToFire = false;
                currNumCharges = 0;
                EventSystem.publishEventImmediately("lightning_strike", {start: startCoord, end: Cursor.getPosition(), width: widthOfAreaCovered});
            }
        }else if(eventInfo.eventType === "right_mouse_down" || eventInfo.eventType === "right_mouse_held_down"){
            if(canActivate){
                if(readyToFire){
                    readyToFire = false;
                    lgBoltCoverAreaHandler.shouldDraw(false);
                }else if(currNumCharges === numChargesNeeded){
                    readyToFire = true;
                    lgBoltCoverAreaHandler.shouldDraw(true);
                }
                canActivate = false;
                timingCallbacks.addTimingEvents(this, 200, 1, function(){} , function(){
                    canActivate = true;
                });
            }
        }else if(eventInfo.eventType === "entity_destroyed" && eventInfo.eventData.type === "bonus"){
            if(currNumCharges < numChargesNeeded){
                currNumCharges++;
                glowingRingHandler.setCompletion(currNumCharges / numChargesNeeded);
                
                if(currNumCharges === numChargesNeeded){
                    lgBoltIconHandler.setColor(1.0, 0.0, 0.4);
                }
            }
        }
    }
    
    return {
        initialize: initialize,
        prepareForDrawing: prepareForDrawing
    };
});