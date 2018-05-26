define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm){

    function BonusTargetBubblyOrb(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, EffectsManager));
        
        this._handler = EffectsManager.requestBubblyOrbEffect(false, gl, 20, position, {radius: [p_radius]});
    }
    
    //inherit from Entity
    BonusTargetBubblyOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetBubblyOrb.prototype.constructor = BonusTargetBubblyOrb;
    
    BonusTargetBubblyOrb.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetBubblyOrb.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
    }
    
    BonusTargetBubblyOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
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