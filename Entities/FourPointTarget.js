define(['SynchronizedTimers', 'Entities/MainEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(SynchronizedTimers, MainEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function FourPointTarget(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager){
        MainEntity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);    

        this._type = "main";
        this._hitbox = new CircularHitRegions(position);
        this._hitbox.addRegion(new Vector(position.getX() + radius, position.getY()), radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX() + radius, position.getY()), radius / 2, gl, canvasHeight, EffectsManager, AudioManager));
        
        this._hitbox.addRegion(new Vector(position.getX(), position.getY() + radius), radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + radius), radius / 2, gl, canvasHeight, EffectsManager, AudioManager));
        
        this._hitbox.addRegion(new Vector(position.getX() - radius, position.getY()), radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + radius), radius / 2, gl, canvasHeight, EffectsManager, AudioManager));
        
        this._hitbox.addRegion(new Vector(position.getX(), position.getY() - radius), radius / 2.5, 
                                      new SliceAlgorithm(new Vector(position.getX(), position.getY() + radius), radius / 2, gl, canvasHeight, EffectsManager, AudioManager));
        
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestFourPointLightningEffect(false, gl, 30, position, {radius: [radius]});
        
        this._rotationAngle = 0;
        this._rotationSpeed = 0.05;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
        
        this._scoreWorth = 4;
    }
    
    //inherit from MainEntity
    FourPointTarget.prototype = Object.create(MainEntity.prototype);
    FourPointTarget.prototype.constructor = FourPointTarget;
    
    FourPointTarget.prototype.setPosition = function(newPosition){
        MainEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    FourPointTarget.prototype._setPositionWithInterpolation = function(newPosition){
        MainEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    FourPointTarget.prototype.reset = function(){
        MainEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
        MainTargetsPositions.removeTargetObj(this);
    }
    
    FourPointTarget.prototype.update = function(){
        MainEntity.prototype.update.call(this);
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
        MainEntity.prototype.spawn.call(this, callback);
    }
    
    FourPointTarget.prototype.receiveEvent = function(eventInfo){
        MainEntity.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
            if(eventInfo.eventData.entity === this){
                this._hitbox.activateAllRegions(); 
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
        
        if(eventInfo.eventType === "game_restart"){
            this.setSpeed(0.01 * this._canvasHeight);
            this._rotationSpeed = 0.05;
        }
    }
    
    return FourPointTarget;
    
});