define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function BasicTarget(canvasWidth, canvasHeight, gl, p_radius, numbolts, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, position, {radius: [p_radius], fluctuation: [5]});
        this._numSlicesToDestroy = 5;
        this._type = "main";
        
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
    }
    
    //inherit from MovingEntity
    BasicTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    BasicTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitBox.resetAlgorithm();
        this._numSlicesToDestroy = 5;
    }
    
    BasicTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    }
    
    BasicTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){       
        if(this._hitBox.processInput(mouseInputObj)){
            if(this._numSlicesToDestroy === 1){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                this.destroyAndReset(callback);
                return true;
            }else{
                this._numSlicesToDestroy--;
                this._handler.setNumBolts(this._numSlicesToDestroy);
                this._hitBox.resetAlgorithm();
            }
        }
    }
    
    BasicTarget.prototype.destroyAndReset = function(callback){
        MovingEntity.MovingEntity.prototype.destroyAndReset.call(this, callback);
        MainTargetsPositions.removeTargetObj(this);
    }
    
    BasicTarget.prototype.receiveEvent = function(eventInfo){
        MovingEntity.MovingEntity.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                this._alive = false;

                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
                    this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                    this._physicsBody.setLinearVelocity((this._velocity.getNormalized()).multiplyWithScalar(eventInfo.eventData.rotationSpeed))
                    this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                    this._handler.setCapturedToTrue();
                    MainTargetsPositions.removeTargetObj(this);
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else if(eventInfo.eventType === "captured_entity_released_from_orbit"){
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                this._physicsBody.setLinearVelocity(this._velocity);
                this._handler.setCapturedToFalse();
                MainTargetsPositions.addTargetObj(this, this._position);
                timingCallbacks.addTimingEvent(this, 200, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }else if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
                MainTargetsPositions.addTargetObj(this, this._position);
                this.setPosition(eventInfo.eventData.position);
                this._handler.shouldDraw(true);
                timingCallbacks.addTimingEvent(this, 200, function(){}, function(){this._alive = true;}); // Need this so that lightning strike doesn't directly affect immediately released targets
            }
        }    
    }
    
    return BasicTarget;
    
});