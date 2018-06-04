define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem){

    function FourPointTarget(canvasWidth, canvasHeight, gl, p_radius, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);    
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(position);
        this._hitBoxRegions.addRegion(new Vector(position.getX() + p_radius, position.getY()), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX() + p_radius, position.getY()), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitBoxRegions.addRegion(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitBoxRegions.addRegion(new Vector(position.getX() - p_radius, position.getY()), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._hitBoxRegions.addRegion(new Vector(position.getX(), position.getY() - p_radius), p_radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + p_radius), p_radius / 2, gl, canvasHeight, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestFourPointLightningEffect(false, gl, 30, position, {radius: [p_radius]});
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
        
        EventSystem.register(this.recieveEvent, "entity_captured", this);
        EventSystem.register(this.recieveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.recieveEvent, "captured_entity_released", this);
    }
    
    //inherit from MovingEntity
    FourPointTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    FourPointTarget.prototype.constructor = FourPointTarget;
    
    FourPointTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    FourPointTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
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
        this._rotationAngle+=0.05;
        this._handler.setAngle(this._rotationAngle);
        this._hitBoxRegions.rotateAllRegions(0.05);
    }
    
    
    FourPointTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitBoxRegions.processInput(mouseInputObj);
        
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

            this._hitBoxRegions.resetAllRegions();
            this._guardPrefs[possibleHitBox.getLabel() - 1] = 1.0;
            this._handler.setGuardPrefs(this._guardPrefs);
            this._handler.increaseLgGlowFactor(1.5);
            possibleHitBox.activated = false;
         }
        

        return false;
    }
    
    FourPointTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        this._hitBoxRegions.activateAllRegions();
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    }
    
    FourPointTarget.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                MainTargetsPositions.removeTargetObj(this);
                
                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
                    this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                    this._physicsBody.setLinearVelocity((this._velocity.getNormalized()).multiplyWithScalar(eventInfo.eventData.rotationSpeed))
                    this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                    this._handler.setCapturedToTrue();
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else{
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                this._handler.setCapturedToFalse();
                MainTargetsPositions.addTargetObj(this, this._position);
            }
        }        
    }
    
    return FourPointTarget;
    
});