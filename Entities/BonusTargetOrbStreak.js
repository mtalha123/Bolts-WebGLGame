define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/distance', 'SliceAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, distance, SliceAlgorithm){

    function BonusTargetOrbStreakDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BonusTargetOrbStreakDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BonusTargetOrbStreakDestructionState.prototype.constructor = BonusTargetOrbStreakDestructionState; 
    
    
    function BonusTargetOrbStreakNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    BonusTargetOrbStreakNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BonusTargetOrbStreakNormalState.prototype.constructor = BonusTargetOrbStreakNormalState;
    
    
    function BonusTargetOrbStreak(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, EffectsManager));
        
        this._handler = EffectsManager.requestLightningOrbWithStreakEffect(false, gl, 20, position, {});
        
        this._normalState = new BonusTargetOrbStreakNormalState(this);
        this._destructionState = new BonusTargetOrbStreakDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._charge = 0;
    }
    
    //inherit from Entity
    BonusTargetOrbStreak.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrbStreak.prototype.constructor = BonusTargetOrbStreak;
    
    BonusTargetOrbStreak.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetOrbStreak.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
    }
    
    BonusTargetOrbStreak.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
    }
    
    BonusTargetOrbStreak.prototype.setAchievementPercentage = function(percent){
        this._handler.increaseGlow(percent / 3.0);
    }
    
    BonusTargetOrbStreak.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(this._hitBox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            return true;
        }
        
        return false;
    }
    
    return BonusTargetOrbStreak;
    
});