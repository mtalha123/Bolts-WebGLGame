define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function TriangularTarget(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager, AudioManager){
        MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, AudioManager);    
        
        this._radius = p_radius;
        this._hitbox = new CircularHitRegions(position);
        var firstRegion = new Vector(position.getX() + p_radius, position.getY());
        var secondRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI - (Math.PI/3), position);
        var thirdRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI + (Math.PI/3), position);
        this._hitbox.addRegion(firstRegion, p_radius / 3, new SliceAlgorithm(firstRegion, p_radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._hitbox.addRegion(secondRegion, p_radius / 3, new SliceAlgorithm(secondRegion, p_radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._hitbox.addRegion(thirdRegion, p_radius / 3, new SliceAlgorithm(thirdRegion, p_radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._type = "main";
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), new Vector(0, 0));
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestTriangularTargetEffect(false, gl, 20, position, {radius: [p_radius]});
        this._spawnSoundEffect = AudioManager.getAudioHandler("main_target_spawn_sound_effect");
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        
        this._scoreWorth = 3;
        this._rotationSpeed = 0.05;
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    //inherit from MovingEntity
    TriangularTarget.prototype = Object.create(MovingEntity.prototype);
    TriangularTarget.prototype.constructor = TriangularTarget;
    
    TriangularTarget.prototype.setPosition = function(newPosition){
        MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype.reset = function(){
        MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
    }
    
    TriangularTarget.prototype.update = function(){
        MovingEntity.prototype.update.call(this);
        this._rotationAngle += this._rotationSpeed;
        this._handler.setAngle(this._rotationAngle);
        this._hitbox.rotateAllRegions(this._rotationSpeed);
    }
    
    TriangularTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitbox.processInput(mouseInputObj);
        if(possibleHitBox){
            this._numGuardsActivated++;
            if(this._numGuardsActivated === 3){
                this._numGuardsActivated = 0;
                this._guardPrefs = [0, 0, 0];
                this._handler.setGuardPrefs(this._guardPrefs);
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                this.destroyAndReset(callback);
                return true;   
            }

            this._guardPrefs[possibleHitBox.getLabel() - 1] = 1.0;
            this._handler.setGuardPrefs(this._guardPrefs);
            this._handler.increaseLgGlowFactor(1.5);
            this._hitbox.resetAllRegions();
            possibleHitBox.activated = false;
        }
        
        return false;
    }
    
    TriangularTarget.prototype.spawn = function(callback){        
        this._hitbox.activateAllRegions();
        MainTargetsPositions.addTargetObj(this, this._position);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.prototype.spawn.call(this, callback);    
    }
    
    TriangularTarget.prototype.receiveEvent = function(eventInfo){
        MovingEntity.prototype.receiveEvent.call(this, eventInfo);


        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                MainTargetsPositions.removeTargetObj(this);
                this._alive = false;
                this._hitbox.cancelTutorial();

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
                this._physicsBody.setSpeed(this._speed);
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
                case 7:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.02 * this._canvasHeight);
                        this._rotationSpeed = 0.1;
                    }.bind(this));
                    break;  
                case 8:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.023 * this._canvasHeight);
                        this._rotationSpeed = 0.15;
                    }.bind(this));
                    break;
            }
        }
        
        if(eventInfo.eventType === "game_restart"){
            this.setSpeed(0.01 * this._canvasHeight);
            this._rotationSpeed = 0.05;
        }
    }
    
    return TriangularTarget;
    
});