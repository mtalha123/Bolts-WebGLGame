define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm', 'EventSystem'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm, EventSystem){

    function BonusTargetOrbStreak(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, EffectsManager));
        
        this._handler = EffectsManager.requestLightningOrbWithStreakEffect(false, gl, 20, position, {});
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
            EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus"});
            this.destroyAndReset(callback);
            return true;
        }
        
        return false;
    }
    
    BonusTargetOrbStreak.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }
    
    return BonusTargetOrbStreak;
    
});