define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm', 'EventSystem', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm, EventSystem, timingCallbacks){

    function BonusTargetOrbStreak(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._hitbox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        this._type = "bonus";
        this._scoreWorth = 2;
        
        this._handler = EffectsManager.requestLightningOrbWithStreakEffect(false, gl, 20, position, {});
        this._numSlicesNeededToDestroy = 2;
        this._disintegratingParticles = EffectsManager.requestBasicParticleEffect(false, gl, 40, 100, position, {FXType: [4], maxLifetime: [800], radiusOfSource: [p_radius]});
        EventSystem.register(this.receiveEvent, "game_lost", this);
    }
    
    //inherit from Entity
    BonusTargetOrbStreak.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrbStreak.prototype.constructor = BonusTargetOrbStreak;
    
    BonusTargetOrbStreak.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetOrbStreak.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._disintegratingParticles.setPosition(newPosition);
    }
    
    BonusTargetOrbStreak.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._disintegratingParticles.setPosition(newPosition);
    }
    
    BonusTargetOrbStreak.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._numSlicesNeededToDestroy = 2;
    }
    
    BonusTargetOrbStreak.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(this._hitbox.processInput(mouseInputObj)){
            if(this._numSlicesNeededToDestroy === 1){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus"});
                timingCallbacks.removeTimingEvents(this);
                this.destroyAndReset(callback);
                return true;
            }else{
                this._numSlicesNeededToDestroy--;
                this._hitbox.resetAlgorithm();
                this._handler.setLightningState(false);
            }
        }
        
        return false;
    }
    
    BonusTargetOrbStreak.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        this._handler.setLightningState(true);
        timingCallbacks.addTimingEvents(this, 3000, 1, function(){}, function(){
            this._disintegratingParticles.doEffect();
            this.reset();
            EventSystem.publishEventImmediately("bonus_target_disintegrated", {entity: this});
        });
        
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }
    
    BonusTargetOrbStreak.prototype.receiveEvent = function(eventInfo){
        Entity.Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_lost"){
            timingCallbacks.removeTimingEvents(this);
            this._disintegratingParticles.reset();
        }
    }
    
    return BonusTargetOrbStreak;
    
});