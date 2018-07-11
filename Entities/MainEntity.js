define(['Entities/Entity', 'Custom Utility/Vector', 'EventSystem', 'MainTargetsPositions', 'CirclePhysicsBody', 'timingCallbacks'], function(Entity, Vector, EventSystem, MainTargetsPositions, CirclePhysicsBody, timingCallbacks){

    function MainEntity(canvasWidth, canvasHeight, gl, position, radius, AudioManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, radius, new Vector(0, 0));
        this._speed = 0.01 * canvasHeight;
        this._spawnSoundEffect = AudioManager.getAudioHandler("main_target_spawn_sound_effect");
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    MainEntity.prototype = Object.create(Entity.prototype);
    MainEntity.prototype.constructor = MainEntity;
    
    MainEntity.prototype.setPosition = function(newPosition){
        Entity.prototype.setPosition.call(this, newPosition);
        this._physicsBody.setPosition(newPosition);
    }
    
    MainEntity.prototype.setMovementAngle = function(newAngle){
        this._physicsBody.setMovementAngle(newAngle);
    }
    
    MainEntity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitbox.isInAnyRegion(checkX, checkY);
    }
    
    MainEntity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    MainEntity.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
        this._physicsBody.setSpeed(newSpeed);
    }
    
    MainEntity.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._handler.setPosition( this._prevPosition.addTo((this._position.subtract(this._prevPosition)).multiplyWithScalar(interpolation)) ); 
    }
    
    MainEntity.prototype.update = function(){
        this._physicsBody.update();        
        this._setPositionWithInterpolation(this._physicsBody.getPosition());  
    }    
    
    MainEntity.prototype.reset = function(){
        Entity.prototype.reset.call(this);
        timingCallbacks.removeTimingEvents(this);
    }
    
    MainEntity.prototype.receiveEvent = function(eventInfo){
        Entity.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                if(this._alive){
                    this._hitbox.cancelTutorial();
                    this._alive = false;

                    if(eventInfo.eventData.capture_type === "destroy"){
                        this.destroyAndReset(function(){});
                    }else if(eventInfo.eventData.capture_type === "orbit"){
                        this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                        this._physicsBody.setSpeed(eventInfo.eventData.rotationSpeed);
                        this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                        this._handler.setCapturedToTrue();
                        MainTargetsPositions.removeTargetObj(this);
                    }
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else if(eventInfo.eventType === "captured_entity_released_from_orbit"){
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                this._handler.setCapturedToFalse();
                this._physicsBody.setSpeed(this._speed);
                
                // Need this so that lightning strike doesn't directly affect immediately released targets
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){
                    this._alive = true;
                    MainTargetsPositions.addTargetObj(this, this._position);
                });
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                this.setPosition(eventInfo.eventData.position);
                this._handler.shouldDraw(true);
                
                // Need this so that lightning strike doesn't directly affect immediately released targets
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){
                    this._alive = true;
                    MainTargetsPositions.addTargetObj(this, this._position);
                });
            }
        }
    }
    
    return MainEntity;
});