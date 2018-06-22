define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm', 'EventSystem'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm, EventSystem){

    function BonusTargetBubblyOrb(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        this._type = "bonus";
        
        this._handler = EffectsManager.requestBubblyOrbEffect(false, gl, 20, position, {radius: [p_radius]});
        this._particlesHandler = EffectsManager.requestBasicParticleEffect(false, gl, 40, 100, position, {FXType: [4], maxLifetime: [800], radiusOfSource: [p_radius]});
    }
    
    //inherit from Entity
    BonusTargetBubblyOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetBubblyOrb.prototype.constructor = BonusTargetBubblyOrb;
    
    BonusTargetBubblyOrb.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetBubblyOrb.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
    }
    
    BonusTargetBubblyOrb.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);        
        this._hitBox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
    }
    
    BonusTargetBubblyOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
    }
    
    BonusTargetBubblyOrb.prototype.disintegrate = function(){
        this._particlesHandler.doEffect();
        this.reset();
    }
    
    BonusTargetBubblyOrb.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._hitBox.resetAlgorithm();
    }
    
    BonusTargetBubblyOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus"});
            return true;
        };
        
        return false;
    }   
    
    BonusTargetBubblyOrb.prototype.receiveEvent = function(eventInfo){        
        if(this._alive){
            Entity.Entity.prototype.receiveEvent.call(this, eventInfo);
        }
    }
    
    return BonusTargetBubblyOrb;
    
});