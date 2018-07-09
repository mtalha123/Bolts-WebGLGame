define(['Border', 'Custom Utility/Vector', 'EventSystem', 'Border', 'timingCallbacks', 'Custom Utility/Timer'], function(Border, Vector, EventSystem, Border, timingCallbacks, Timer){
    var glowingRingHandler;
    var lgBoltIconHandler;
    var lgBoltCoverAreaHandler;
    var lgStrikeHandler;
    var numChargesNeeded = 10;
    var currNumCharges = 0;
    var readyToFire = false;
    var startCoord;
    var widthOfAreaCovered;
    var canActivate = true;
    var lightningStrikeSoundEffect;
    var mouseIconClickedHandler;
    var mouseIconUnclickedHandler;
    var particlesFromDestroyedTargetHandlers = [];
    
    var mouseAnimationTimer;
    var mouseAnimationClicked = false;
    var clickDuration = 500;
    
    function initialize(gl, canvasHeight, AssetManager, EffectsManager, AudioManager, p_Cursor){
        var radius = canvasHeight * 0.05;
        var lgBoltIconWidthAndHeight = canvasHeight * 0.05;
        widthOfAreaCovered = canvasHeight * 0.15;
        startCoord = new Vector(Border.getRightX() - radius, Border.getTopY() - radius);
        glowingRingHandler = EffectsManager.requestGlowingRingHandler(false, gl, 300, startCoord, {radius: [radius]});
        lgBoltIconHandler = EffectsManager.requestSpriteHandler(false, gl, 100, startCoord, lgBoltIconWidthAndHeight, {color: [0.3, 0.3, 0.3], useCustomColor: [1.0]}, AssetManager.getTextureAsset("lightningBolt"));
        lgBoltCoverAreaHandler = EffectsManager.requestRectangleHandler(false, gl, 100, startCoord, new Vector(100, 100), widthOfAreaCovered, {color: [1.0, 0.0, 0.4, 0.3]});
        Cursor = p_Cursor;
        mouseIconUnclickedHandler = EffectsManager.requestSpriteHandler(false, gl, 300, startCoord.subtract(new Vector(0, radius * 2)), lgBoltIconWidthAndHeight, {}, AssetManager.getTextureAsset("mouse_unclicked"));
        mouseIconClickedHandler = EffectsManager.requestSpriteHandler(false, gl, 300, startCoord.subtract(new Vector(0, radius * 2)), lgBoltIconWidthAndHeight, {}, AssetManager.getTextureAsset("mouse_clicked"));
        mouseAnimationTimer = new Timer();
        lgStrikeHandler = EffectsManager.requestLightningStrikeHandler(false, gl, 100, startCoord, new Vector(100, 100), {lineWidth: [6], glowFactor: [40], jaggedFactor: [1], fluctuation: [80], boltColor: [1.0, 0.0, 0.4]});
        lgStrikeHandler.setDuration(6000);
        lightningStrikeSoundEffect = AudioManager.getAudioHandler("lightning_strike_sound_effect");
        
        for(var i = 0; i < 5; i++){
            particlesFromDestroyedTargetHandlers[i] = EffectsManager.requestBasicParticleEffect(false, gl, 20, 300, new Vector(100, 100), {FXType: [5], maxLifetime: [1000], radiusOfSource: [60], particlesColor: [1.0, 0.0, 0.4]});
            particlesFromDestroyedTargetHandlers[i].setDestinationForParticles(startCoord);
        }
        
        EventSystem.register(receiveEvent, "right_mouse_down");
        EventSystem.register(receiveEvent, "left_mouse_down");
        EventSystem.register(receiveEvent, "right_mouse_held_down");
        EventSystem.register(receiveEvent, "left_mouse_held_down");
        EventSystem.register(receiveEvent, "entity_destroyed");
        EventSystem.register(receiveEvent, "game_restart");
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
        
        if(mouseAnimationTimer.getTime() > clickDuration){
            mouseAnimationClicked = !mouseAnimationClicked;
            if(mouseAnimationClicked){
                mouseIconUnclickedHandler.shouldDraw(false);
                mouseIconClickedHandler.shouldDraw(true);
            }else{
                mouseIconUnclickedHandler.shouldDraw(true);
                mouseIconClickedHandler.shouldDraw(false);
            }
            mouseAnimationTimer.reset();
            mouseAnimationTimer.start();
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
                lightningStrikeSoundEffect.play();
                mouseAnimationTimer.reset();
                mouseIconUnclickedHandler.shouldDraw(false);
                mouseIconClickedHandler.shouldDraw(false);
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
                
                var particlesHandlerToUse = particlesFromDestroyedTargetHandlers[0];
                for(var i = 0; i < particlesFromDestroyedTargetHandlers.length; i++){
                    if(!particlesFromDestroyedTargetHandlers[i].isDrawing()){
                        particlesHandlerToUse = particlesFromDestroyedTargetHandlers[i];
                        break;
                    }
                }
                
                particlesHandlerToUse.setPosition(eventInfo.eventData.entity.getPosition());
                particlesHandlerToUse.setRadiusOfSource(eventInfo.eventData.entity.getRadius() * 2);
                particlesHandlerToUse.doEffect(function(){
                    glowingRingHandler.setCompletion(currNumCharges / numChargesNeeded);

                    if(currNumCharges === numChargesNeeded){
                        lgBoltIconHandler.setColor(1.0, 0.0, 0.4);
                        mouseAnimationTimer.start();
                    }
                });
            }
        }else if(eventInfo.eventType === "game_restart"){
            currNumCharges = 0;
            readyToFire = false;
            canActivate = true;
            lgBoltCoverAreaHandler.shouldDraw(false);
            lgBoltIconHandler.setColor(0.3, 0.3, 0.3);
            lgBoltIconHandler.resetTime();
            glowingRingHandler.setCompletion(0.0);
        }
    }
    
    return {
        initialize: initialize,
        prepareForDrawing: prepareForDrawing
    };
});