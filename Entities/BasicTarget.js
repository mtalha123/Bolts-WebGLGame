define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function BasicTarget(canvasWidth, canvasHeight, gl, p_radius, numbolts, position, EffectsManager, AudioManager){
        MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, AudioManager);
        this._radius = p_radius;
        this._hitbox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), new Vector(0, 0));
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, position, {radius: [p_radius], fluctuation: [5]});
        this._numSlicesNeededToDestroy = 1;
        this._currSlicesDone = 0;
        this._type = "main";
        this._spawnSoundEffect = AudioManager.getAudioHandler("main_target_spawn_sound_effect");
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    //inherit from MovingEntity
    BasicTarget.prototype = Object.create(MovingEntity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.setPosition = function(newPosition){
        MovingEntity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype.reset = function(){
        MovingEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitbox.resetAlgorithm();
        this._currSlicesDone = 0;
        this._handler.setCapturedToFalse();
    }
    
    BasicTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.prototype.spawn.call(this, callback);
        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
        this._spawnSoundEffect.play();
    }
    
    BasicTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){       
        if(this._hitbox.processInput(mouseInputObj)){
            this._currSlicesDone++;
            
            if(this._currSlicesDone >= this._numSlicesNeededToDestroy){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                this.destroyAndReset(callback);
                return true;
            }else{
                this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                this._hitbox.resetAlgorithm();
            }
        }
    }
    
    BasicTarget.prototype.destroyAndReset = function(callback){
        MovingEntity.prototype.destroyAndReset.call(this, callback);
        MainTargetsPositions.removeTargetObj(this);
    }
    
    BasicTarget.prototype.receiveEvent = function(eventInfo){
        MovingEntity.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                this._alive = false;
                this._hitbox.cancelTutorial();

                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
                    this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                    this._physicsBody.setSpeed(eventInfo.eventData.rotationSpeed);
                    this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                    this._handler.setCapturedToTrue();
                    MainTargetsPositions.removeTargetObj(this);
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else if(eventInfo.eventType === "captured_entity_released_from_orbit"){
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                this._handler.setCapturedToFalse();
                MainTargetsPositions.addTargetObj(this, this._position);
                this._physicsBody.setSpeed(this._speed);
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                MainTargetsPositions.addTargetObj(this, this._position);
                this.setPosition(eventInfo.eventData.position);
                this._handler.shouldDraw(true);
                timingCallbacks.addTimingEvents(this, 200, 1, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }
        }
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 2:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.02 * this._canvasHeight);
                        this._numSlicesNeededToDestroy = 2;  
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 3:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this._numSlicesNeededToDestroy = 3;   
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 7:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this._numSlicesNeededToDestroy = 4;    
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 8:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.03 * this._canvasHeight);
                        this._numSlicesNeededToDestroy = 5;   
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
            }
        }
        
        if(eventInfo.eventType === "game_restart"){
            this._numSlicesNeededToDestroy = 1;
            this.setSpeed(0.01 * this._canvasHeight);
        }
    }
    
    return BasicTarget;
    
});