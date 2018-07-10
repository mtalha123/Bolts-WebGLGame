define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'SliceAlgorithm', 'EventSystem', 'Custom Utility/Vector'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, SliceAlgorithm, EventSystem, Vector){

    function BonusTargetBubblyOrb(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager, AudioManager, TextManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, AudioManager);
        this._radius = p_radius;
        this._hitbox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._type = "bonus";
        
        this._handler = EffectsManager.requestBubblyOrbEffect(false, gl, 20, position, {radius: [p_radius]});
        this._particlesHandler = EffectsManager.requestParticlesFlowingUpwardEffect(false, gl, 40, 100, position, {maxLifetime: [800], radiusOfSource: [p_radius]});
        this._spawnSoundEffect = AudioManager.getAudioHandler("bonus_target_spawn_sound_effect");
        this._bonusTextHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 255, 1.0], canvasHeight * 0.03, position.addTo(new Vector(p_radius * 2, 0)), "Bonus", false);
        
        EventSystem.register(this.receiveEvent, "game_lost", this);
    }
    
    //inherit from Entity
    BonusTargetBubblyOrb.prototype = Object.create(Entity.prototype);
    BonusTargetBubblyOrb.prototype.constructor = BonusTargetBubblyOrb;
    
    BonusTargetBubblyOrb.prototype.spawn = function(callback){
        Entity.prototype.spawn.call(this, callback);
        this._bonusTextHandler.doFadeUpwardsEffect();
    }
    
    BonusTargetBubblyOrb.prototype.setPosition = function(newPosition){
        Entity.prototype.setPosition.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetBubblyOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetBubblyOrb.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._bonusTextHandler.draw();
    }
    
    BonusTargetBubblyOrb.prototype.disintegrate = function(){
        this._particlesHandler.doEffect();
        this.reset();
    }
    
    BonusTargetBubblyOrb.prototype.reset = function(){
        Entity.prototype.reset.call(this);
        this._hitbox.resetAlgorithm();
    }
    
    BonusTargetBubblyOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitbox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus"});
            return true;
        };
        
        return false;
    }       
    
    BonusTargetBubblyOrb.prototype.receiveEvent = function(eventInfo){  
        Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_lost"){
            this._particlesHandler.reset();
        }
    }   
    
    return BonusTargetBubblyOrb;
    
});