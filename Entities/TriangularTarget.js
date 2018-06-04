define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem){

    function TriangularTarget(canvasWidth, canvasHeight, gl, p_radius, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);    
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(position);
        var firstRegion = new Vector(position.getX() + p_radius, position.getY());
        var secondRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI - (Math.PI/3), position);
        var thirdRegion = rotateCoord(new Vector(position.getX() + p_radius, position.getY()), Math.PI + (Math.PI/3), position);
        this._hitBoxRegions.addRegion(firstRegion, p_radius / 3, new SliceAlgorithm(firstRegion, p_radius / 3, gl, canvasHeight, EffectsManager));
        this._hitBoxRegions.addRegion(secondRegion, p_radius / 3, new SliceAlgorithm(secondRegion, p_radius / 3, gl, canvasHeight, EffectsManager));
        this._hitBoxRegions.addRegion(thirdRegion, p_radius / 3, new SliceAlgorithm(thirdRegion, p_radius / 3, gl, canvasHeight, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestTriangularTargetEffect(false, gl, 20, position, {radius: [p_radius]});
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        
        EventSystem.register(this.recieveEvent, "entity_captured", this);
        EventSystem.register(this.recieveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.recieveEvent, "captured_entity_released", this);
    }
    
    //inherit from MovingEntity
    TriangularTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    TriangularTarget.prototype.constructor = TriangularTarget;
    
    TriangularTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBoxRegions.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
    }
    
    TriangularTarget.prototype.update = function(){
        MovingEntity.MovingEntity.prototype.update.call(this);
        this._rotationAngle+=0.05;
        this._handler.setAngle(this._rotationAngle);
        this._hitBoxRegions.rotateAllRegions(0.05);
    }
    
    TriangularTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitBoxRegions.processInput(mouseInputObj);
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
            possibleHitBox.activated = false;
        }
        
        return false;
    }
    
    TriangularTarget.prototype.spawn = function(callback){        
        this._hitBoxRegions.activateAllRegions();
        MainTargetsPositions.addTargetObj(this, this._position);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);    
    }
    
    TriangularTarget.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventData.entity === this){
            if(eventInfo.eventType === "entity_captured"){
                MainTargetsPositions.removeTargetObj(this);
                
                if(eventInfo.eventData.capture_type === "destroy"){
                    this.destroyAndReset(function(){});
                }else if(eventInfo.eventData.capture_type === "orbit"){
                    this._physicsBody.setPosition(eventInfo.eventData.capture_position);
                    this._physicsBody.setLinearVelocity((this._velocity.getNormalized()).multiplyWithScalar(eventInfo.eventData.rotationSpeed))
                    this._physicsBody.setToOrbit(eventInfo.eventData.center, eventInfo.eventData.radius);
                }
            }else if(eventInfo.eventType === "captured_entity_destroyed"){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
            }else{
                // Will take it out of orbit
                this._physicsBody.setPosition(this._position);
                MainTargetsPositions.addTargetObj(this, this._position);
            }
        }        
    }
    
    return TriangularTarget;
    
});