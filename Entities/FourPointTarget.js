define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function FourPointTarget(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position);    
        
        this._radius = p_radius;
        this._type = "main";
        this._hitbox = new CircularHitRegions(position);
        this._hitbox.addRegion(new Vector(position.getX() + p_radius, position.getY()), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX() + p_radius, position.getY()), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitbox.addRegion(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitbox.addRegion(new Vector(position.getX() - p_radius, position.getY()), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitbox.addRegion(new Vector(position.getX(), position.getY() - p_radius), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), new Vector(0, 0));
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestFourPointLightningEffect(false, gl, 30, position, {radius: [p_radius]});
        
        this._rotationAngle = 0;
        this._rotationSpeed = 0.05;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
        
        this._scoreWorth = 4;
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    //inherit from MovingEntity
    FourPointTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    FourPointTarget.prototype.constructor = FourPointTarget;
    
    FourPointTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    FourPointTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    FourPointTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
    }
    
    FourPointTarget.prototype.update = function(){
        MovingEntity.MovingEntity.prototype.update.call(this);
        this._rotationAngle += this._rotationSpeed;
        this._handler.setAngle(this._rotationAngle);
        this._hitbox.rotateAllRegions(this._rotationSpeed);
    }
    
    
    FourPointTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitbox.processInput(mouseInputObj);
        
        if(possibleHitBox){
            this._numGuardsActivated++;
            if(this._numGuardsActivated === 4){
                this._numGuardsActivated = 0;
                this._guardPrefs = [0, 0, 0, 0];
                this._handler.setGuardPrefs(this._guardPrefs);
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                this.destroyAndReset(callback);
                return true;   
            }

            this._hitbox.resetAllRegions();
            this._guardPrefs[possibleHitBox.getLabel() - 1] = 1.0;
            this._handler.setGuardPrefs(this._guardPrefs);
            this._handler.increaseLgGlowFactor(1.5);
            possibleHitBox.activated = false;
         }
        

        return false;
    }
    
    FourPointTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        this._hitbox.activateAllRegions();
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    }
    
    FourPointTarget.prototype.receiveEvent = function(eventInfo){
        MovingEntity.MovingEntity.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                MainTargetsPositions.removeTargetObj(this);
                this._alive = false;

                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
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
                this._handler.setCapturedToFalse();
                MainTargetsPositions.addTargetObj(this, this._position);
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                MainTargetsPositions.addTargetObj(this, this._position);
                this.setPosition(eventInfo.eventData.position);
                this._hitbox.activateAllRegions();
                this._handler.shouldDraw(true);
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }
        }  
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){  
                case 9:                    
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.02 * this._canvasHeight);
                        this._rotationSpeed = 0.1;
                    }.bind(this));
                    break;
                case 12:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.022 * this._canvasHeight);
                        this._rotationSpeed = 0.12;
                    }.bind(this));
                    break;
            }
        }
    }
    
    return FourPointTarget;
    
});