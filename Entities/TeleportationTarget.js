define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'Custom Utility/Timer', 'Custom Utility/Random', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'Border', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, Timer, Random, SliceAlgorithm, MainTargetsPositions, EventSystem, Border, timingCallbacks){

    function TeleportationTarget(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitbox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), new Vector(0, 0));
        this._physicsBody.setSpeed(0.02 * canvasHeight);
        this._handler = EffectsManager.requestTeleportationTargetHandler(false, gl, 2, position, {radius: [p_radius]});  
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
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    //inherit from MovingEntity
    TeleportationTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    TeleportationTarget.prototype.constructor = TeleportationTarget;
    
    TeleportationTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    TeleportationTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TeleportationTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
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
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
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
        MovingEntity.MovingEntity.prototype.update.call(this);
        
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
        MovingEntity.MovingEntity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                this._alive = false;
                MainTargetsPositions.removeTargetObj(this);
                this._handler.deactivatePortal();
                this._hitbox.cancelTutorial();

                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
                    this._timer.reset();
                    this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                    this._physicsBody.setSpeed(eventInfo.eventData.rotationSpeed);
                    this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                    this._handler.setCapturedToTrue();
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else if(eventInfo.eventType === "captured_entity_released_from_orbit"){
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                MainTargetsPositions.addTargetObj(this, this._position);
                this._physicsBody.setSpeed(this._speed);
                this._handler.setCapturedToFalse();
                this._timer.start();
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                MainTargetsPositions.addTargetObj(this, this._position);
                this.setPosition(eventInfo.eventData.position);
                this._handler.shouldDraw(true);
                this._timer.start();
                this._visible = true;
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }
        }
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 11:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.03 * this._canvasHeight);
                    }.bind(this));;
                    break;  
                case 12:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.035 * this._canvasHeight);
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