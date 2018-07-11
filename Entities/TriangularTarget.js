define(['SynchronizedTimers', 'Entities/MainEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(SynchronizedTimers, MainEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function TriangularTarget(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager){
        MainEntity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);    
        
        this._hitbox = new CircularHitRegions(position);
        var firstRegion = new Vector(position.getX() + radius, position.getY());
        var secondRegion = rotateCoord(new Vector(position.getX() + radius, position.getY()), Math.PI - (Math.PI/3), position);
        var thirdRegion = rotateCoord(new Vector(position.getX() + radius, position.getY()), Math.PI + (Math.PI/3), position);
        this._hitbox.addRegion(firstRegion, radius / 3, new SliceAlgorithm(firstRegion, radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._hitbox.addRegion(secondRegion, radius / 3, new SliceAlgorithm(secondRegion, radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._hitbox.addRegion(thirdRegion, radius / 3, new SliceAlgorithm(thirdRegion, radius / 3, gl, canvasHeight, EffectsManager, AudioManager));
        this._type = "main";
        
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestTriangularTargetEffect(false, gl, 20, position, {radius: [radius]});
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        
        this._scoreWorth = 3;
        this._rotationSpeed = 0.05;
    }
    
    //inherit from MainEntity
    TriangularTarget.prototype = Object.create(MainEntity.prototype);
    TriangularTarget.prototype.constructor = TriangularTarget;
    
    TriangularTarget.prototype.setPosition = function(newPosition){
        MainEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MainEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    TriangularTarget.prototype.reset = function(){
        MainEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
    }
    
    TriangularTarget.prototype.update = function(){
        MainEntity.prototype.update.call(this);
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
        MainEntity.prototype.spawn.call(this, callback);    
    }
    
    TriangularTarget.prototype.receiveEvent = function(eventInfo){
        MainEntity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
            if(eventInfo.eventData.entity === this){
                this._hitbox.activateAllRegions();
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