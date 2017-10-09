define(['SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsBody', 'SliceAlgorithm'], function(SynchronizedTimers, MovingEntity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsBody, SliceAlgorithm){

    function FourPointTargetDestructionState(targetHandler){
        MovingEntity.MovingEntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from MovingEntityDestructionState
    FourPointTargetDestructionState.prototype = Object.create(MovingEntity.MovingEntityDestructionState.prototype);
    FourPointTargetDestructionState.prototype.constructor = FourPointTargetDestructionState; 
    
    
    function FourPointTargetNormalState(target){
        MovingEntity.MovingEntityNormalState.call(this, target);
    }
    
    //inherit from MovingEntityNormalState
    FourPointTargetNormalState.prototype = Object.create(MovingEntity.MovingEntityNormalState.prototype);
    FourPointTargetNormalState.prototype.constructor = FourPointTargetNormalState;
    
    FourPointTargetNormalState.prototype.update = function(){
        MovingEntity.MovingEntityNormalState.prototype.update.call(this);
        
        this._entity._rotationAngle+=0.05;
        this._handler.setAngle(this._entity._rotationAngle);
        this._entity._hitBoxRegions.rotateAllRegions(0.05);
    }
    
    
    function FourPointTarget(canvasWidth, canvasHeight, gl, p_radius, x, y, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);    
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x + p_radius, y, p_radius / 2.5, new SliceAlgorithm(x + p_radius, y, p_radius / 2.5));
        this._hitBoxRegions.addRegion(x, y + p_radius, p_radius / 2.5, new SliceAlgorithm(x, y + p_radius, p_radius / 2.5));
        this._hitBoxRegions.addRegion(x - p_radius, y, p_radius / 2.5, new SliceAlgorithm(x - p_radius, y, p_radius / 2.5));
        this._hitBoxRegions.addRegion(x, y - p_radius, p_radius / 2.5, new SliceAlgorithm(x, y - p_radius, p_radius / 2.5));
        
        this._physicsBody = new CirclePhysicsBody(x, y, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestFourPointLightningEffect(false, gl, 30, x, y, {radius: [p_radius]});
        
        this._normalState = new FourPointTargetNormalState(this);
        this._destructionState = new FourPointTargetDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
    }
    
    //inherit from MovingEntity
    FourPointTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    FourPointTarget.prototype.constructor = FourPointTarget;
    
    FourPointTarget.prototype.setPosition = function(newX, newY){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    FourPointTarget.prototype._setPositionWithInterpolation = function(newX, newY){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    FourPointTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
    }
    
    
    FourPointTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        var possibleHitBox = this._hitBoxRegions.processInput(mouseInputObj);
        if(possibleHitBox){
            this._numGuardsActivated++;
            if(this._numGuardsActivated === 4){
                this._numGuardsActivated = 0;
                this._guardPrefs = [0, 0, 0, 0];
                this._handler.setGuardPrefs(this._guardPrefs);
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
    
    FourPointTarget.prototype.spawn = function(callback){
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
        this._hitBoxRegions.activateAllRegions();
    }
    
    return FourPointTarget;
    
});