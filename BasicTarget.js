define(['CircleEntity', 'SynchronizedTimers', 'Entity', 'Custom Utility/CircularHitRegions'], function(CircleEntity, SynchronizedTimers, Entity, CircularHitRegions){

    function BasicTargetDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BasicTargetDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BasicTargetDestructionState.prototype.constructor = BasicTargetDestructionState; 
    
    
    function BasicTargetNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    BasicTargetNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BasicTargetNormalState.prototype.constructor = BasicTargetNormalState;
    
    
    function BasicTarget(id, canvasWidth, canvasHeight, gl, p_radius, numbolts, x, y, movementangle, speed, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x + p_radius, y - p_radius);
        this._hitBoxRegions.addRegion(x + p_radius, y - p_radius, p_radius);
        
        this._physicsEntity = new CircleEntity(x, y, canvasHeight, p_radius + 10, [0, 0]);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, x, y, {radius: [p_radius], fluctuation: [5]});  
       // this._targetHandler.setCompletion(1);
        
        this._normalState = new BasicTargetNormalState(this);
        this._destructionState = new BasicTargetDestructionState(this._handler);
        this._currentState = this._normalState;
    }
    
    //inherit from Entity
    BasicTarget.prototype = Object.create(Entity.Entity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    BasicTarget.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX + this._radius, newY - this._radius);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX + this._radius, newY - this._radius);
    }
    
    BasicTarget.prototype.setAchievementPercentage = function(percent){
        if(percent >= 0.75){
            this._handler.setNumBolts(7);
        }else if(percent >= 0.50){
            this._handler.setNumBolts(6);
        }
    
        this._handler.increaseLgGlowFactor(percent / 2.0);
    }
    
    return BasicTarget;
    
});