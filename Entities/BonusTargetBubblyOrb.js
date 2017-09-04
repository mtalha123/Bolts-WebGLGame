define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/distance', 'SliceAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, distance, SliceAlgorithm){

    function BonusTargetBubblyOrbDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BonusTargetBubblyOrbDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BonusTargetBubblyOrbDestructionState.prototype.constructor = BonusTargetBubblyOrbDestructionState; 
    
    
    function BonusTargetBubblyOrbNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    BonusTargetBubblyOrbNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BonusTargetBubblyOrbNormalState.prototype.constructor = BonusTargetBubblyOrbNormalState;
    
    
    function BonusTargetBubblyOrb(id, canvasWidth, canvasHeight, gl, p_radius, x, y, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(x, y, p_radius, new SliceAlgorithm(x, y, p_radius));
        
        this._handler = EffectsManager.requestBubblyOrbEffect(false, gl, 20, x, y, {});
        
        this._normalState = new BonusTargetBubblyOrbNormalState(this);
        this._destructionState = new BonusTargetBubblyOrbDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._charge = 0;
    }
    
    //inherit from Entity
    BonusTargetBubblyOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetBubblyOrb.prototype.constructor = BonusTargetBubblyOrb;
    
    BonusTargetBubblyOrb.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetBubblyOrb.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
    }
    
    BonusTargetBubblyOrb.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
    }
    
    BonusTargetBubblyOrb.prototype.setAchievementPercentage = function(percent){
        this._handler.increaseGlow(percent / 3.0);
    }
    
    BonusTargetBubblyOrb.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._hitBox.resetAlgorithm();
    }
    
    BonusTargetBubblyOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            return true;
        };
        
        return false;
    }
    
    return BonusTargetBubblyOrb;
    
});