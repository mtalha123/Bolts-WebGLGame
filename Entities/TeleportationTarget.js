define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MainEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'Custom Utility/Timer', 'Custom Utility/Random', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'Border', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, MainEntity, CircularHitBoxWithAlgorithm, Vector, Timer, Random, SliceAlgorithm, MainTargetsPositions, EventSystem, Border, timingCallbacks){

    function TeleportationTarget(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager){
        MainEntity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);
        this._hitbox = new CircularHitBoxWithAlgorithm(position, radius, new SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager));
        
        this._physicsBody.setSpeed(0.02 * canvasHeight);
        this._handler = EffectsManager.requestTeleportationTargetHandler(false, gl, 2, position, {radius: [radius]});  
        this._type = "main";
        
        this._timer = new Timer();
        this._timeForAppearanceOrDisappearance = 2000;
        this._visible = false;
        this._appearanceLeftBoundary = 0.3 * canvasWidth;
        this._appearanceRightBoundary = 0.7 * canvasWidth;
        this._appearanceTopBoundary = 0.6 * canvasHeight;
        this._appearanceBottomBoundary = 0.4 * canvasHeight;
        this._numSlicesNeededToDestroy = 3;
        this._scoreWorth = 4;
        this._speed = 0.02 * canvasHeight;
        this.setSpeed(this._speed);
    }
    
    //inherit from MainEntity
    TeleportationTarget.prototype = Object.create(MainEntity.prototype);
    TeleportationTarget.prototype.constructor = TeleportationTarget;
    
    TeleportationTarget.prototype.setPosition = function(newPosition){
        MainEntity.prototype.setPosition.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MainEntity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype.reset = function(){
        MainEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitbox.resetAlgorithm();
        this._visible = false;
        this._timer.reset();
        this._numSlicesNeededToDestroy = 3;
        this._handler.setNumBolts(this._numSlicesNeededToDestroy);
        this._handler.setCapturedToFalse();
    }
    
    TeleportationTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        MainEntity.prototype.spawn.call(this, callback);
        this._timer.start();
        this._visible = true;
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
    }
    
    TeleportationTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){  
        if(this._visible){
            if(this._hitbox.processInput(mouseInputObj)){
                if(this._numSlicesNeededToDestroy > 1){
                    this._numSlicesNeededToDestroy--;
                    this._handler.setNumBolts(this._numSlicesNeededToDestroy);
                    this._hitbox.resetAlgorithm();
                }else if(this._numSlicesNeededToDestroy === 1){
                    EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                    this.destroyAndReset(callback);
                    return true;    
                }
            }
        }
    }
    
    TeleportationTarget.prototype.update = function(){
        MainEntity.prototype.update.call(this);
        
        if(this._alive){
            if(this._timer.getTime() > this._timeForAppearanceOrDisappearance){
                if(this._visible){
                    var posInFront = this._position.addTo(this._physicsBody.getVelocity().getNormalized().multiplyWithScalar(this._radius * 6));
                    if(posInFront.getX() > Border.getLeftX() && posInFront.getX() < Border.getRightX() &&
                       posInFront.getY() > Border.getBottomY() && posInFront.getY() < Border.getTopY()){
                        
                        this._handler.disappear(this._physicsBody.getVelocity().getNormalized());
                        this._visible = false;
                        this._timer.reset();
                        this._timer.start();
                        MainTargetsPositions.removeTargetObj(this);
                        this._numSlicesNeededToDestroy = 3;
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy);
                        
                    }
                    
                    
                }else{
                    var newPosition = new Vector(Random.getRandomInt(this._appearanceLeftBoundary, this._appearanceRightBoundary),
                                                 Random.getRandomInt(this._appearanceBottomBoundary, this._appearanceTopBoundary));
                    this.setPosition(newPosition);
                    var randomAngle = Random.getRandomInt(0, 360);
                    var velocity = new Vector(Math.cos(randomAngle * (Math.PI / 180)) * this._speed, 
                                              Math.sin(randomAngle * (Math.PI / 180)) * this._speed);
                    this._physicsBody.setVelocity(velocity);
                    this._handler.appear(velocity.getNormalized());
                    this._visible = true;
                    this._timer.reset();
                    this._timer.start();
                    MainTargetsPositions.addTargetObj(this, this._position);
                }
            }
        }
    }
    
    TeleportationTarget.prototype.receiveEvent = function(eventInfo){
        if(eventInfo.eventType === "lightning_strike"){
            if(this._alive && this._visible){
                var startCoord = eventInfo.eventData.start;
                var endCoord = eventInfo.eventData.end;
                var closestPointOnLgStrike = startCoord.addTo(this._position.subtract(startCoord).projectOnto(endCoord.subtract(startCoord)));
                var dist = this._position.distanceTo(closestPointOnLgStrike);

                if(dist < eventInfo.eventData.width){
                    this.destroyAndReset(function(){});
                    EventSystem.publishEventImmediately("entity_destroyed_by_lightning_strike", {entity: this, type: this._type});
                }
            }
            
            return;
        }
        
        MainEntity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                this._timer.reset();
                this._handler.deactivatePortal();
            }else if(eventInfo.eventType === "captured_entity_released_from_orbit"){
                this._timer.start();
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                this._timer.start();
                this._visible = true; 
            }
        }
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 10:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.03 * this._canvasHeight);
                    }.bind(this));;
                    break;  
            }
        }
        
        if(eventInfo.eventType === "game_restart"){
            this.setSpeed(0.02 * this._canvasHeight);  
        }
    }
    
    return TeleportationTarget;
    
});