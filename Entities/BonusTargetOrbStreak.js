define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm', 'EventSystem', 'timingCallbacks', 'Custom Utility/Vector'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm, EventSystem, timingCallbacks, Vector){

    function BonusTargetOrbStreak(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager, TextManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);
        this._hitbox = new CircularHitBoxWithAlgorithm(position, radius, new SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._type = "bonus";
        this._scoreWorth = 2;
        
        this._handler = EffectsManager.requestLightningOrbWithStreakEffect(false, gl, 20, position, {});
        this._numSlicesNeededToDestroy = 2;
        this._disintegratingParticles = EffectsManager.requestParticlesFlowingUpwardEffect(false, gl, 40, 100, position, {maxLifetime: [800], radiusOfSource: [radius]});
        this._spawnSoundEffect = AudioManager.getAudioHandler("bonus_target_spawn_sound_effect");
        this._bonusTextHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 255, 1.0], canvasHeight * 0.03, position.addTo(new Vector(radius * 2, 0)), "Bonus", false);
        EventSystem.register(this.receiveEvent, "game_lost", this);
    }
    
    //inherit from Entity
    BonusTargetOrbStreak.prototype = Object.create(Entity.prototype);
    BonusTargetOrbStreak.prototype.constructor = BonusTargetOrbStreak;
    
    BonusTargetOrbStreak.prototype.setPosition = function(newPosition){
        Entity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._disintegratingParticles.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetOrbStreak.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._disintegratingParticles.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetOrbStreak.prototype.reset = function(){
        Entity.prototype.reset.call(this);
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
        Entity.prototype.spawn.call(this, callback);
        this._handler.setLightningState(true);
        timingCallbacks.addTimingEvents(this, 3000, 1, function(){}, function(){
            this._disintegratingParticles.doEffect();
            this.reset();
            EventSystem.publishEventImmediately("bonus_target_disintegrated", {entity: this});
        });
        
        this._bonusTextHandler.doFadeUpwardsEffect();
        
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }
    
    BonusTargetOrbStreak.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._bonusTextHandler.draw();
    }
    
    BonusTargetOrbStreak.prototype.receiveEvent = function(eventInfo){
        Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_lost"){
            timingCallbacks.removeTimingEvents(this);
            this._disintegratingParticles.reset();
        }
    }
    
    return BonusTargetOrbStreak;
    
});