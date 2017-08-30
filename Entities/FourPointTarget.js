define(['SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitRegions', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'CirclePhysicsEntity'], function(SynchronizedTimers, Entity, CircularHitRegions, rotateCoord, Vector, CirclePhysicsEntity){

    function FourPointTargetDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    FourPointTargetDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    FourPointTargetDestructionState.prototype.constructor = FourPointTargetDestructionState; 
    
    
    function FourPointTargetNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    FourPointTargetNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    FourPointTargetNormalState.prototype.constructor = FourPointTargetNormalState;
    
    FourPointTargetNormalState.prototype.update = function(){
        Entity.EntityNormalState.prototype.update.call(this);
        
        this._entity._rotationAngle+=0.05;
        this._handler.setAngle(this._entity._rotationAngle);
        this._entity._hitBoxRegions.rotateAllRegions(0.05);
    }
    
    
    function FourPointTarget(id, canvasWidth, canvasHeight, gl, p_radius, x, y, movementangle, speed, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._id = id;       
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x + p_radius, y, p_radius / 2.5);
        this._hitBoxRegions.addRegion(x, y + p_radius, p_radius / 2.5);
        this._hitBoxRegions.addRegion(x - p_radius, y, p_radius / 2.5);
        this._hitBoxRegions.addRegion(x, y - p_radius, p_radius / 2.5);
        
        this._physicsEntity = new CirclePhysicsEntity(x, y, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestFourPointLightningEffect(false, gl, 30, x, y, {radius: [p_radius]});
        
        this._normalState = new FourPointTargetNormalState(this);
        this._destructionState = new FourPointTargetDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._rotationAngle = 0;
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
    }
    
    //inherit from Entity
    FourPointTarget.prototype = Object.create(Entity.Entity.prototype);
    FourPointTarget.prototype.constructor = FourPointTarget;
    
    FourPointTarget.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    FourPointTarget.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    FourPointTarget.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._numGuardsActivated = 0;
        this._guardPrefs = [0, 0, 0, 0];
    }
    
    
    FourPointTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
            
            var possibleHitBox = this._hitBoxRegions.isInAnyRegion(mouseX, mouseY);
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
        }
        
        return false;
    }
    
    FourPointTarget.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        this._hitBoxRegions.activateAllRegions();
    }
    
    return FourPointTarget;
    
});