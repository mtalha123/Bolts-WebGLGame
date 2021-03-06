define(['SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBox', 'Custom Utility/Vector', 'SliceAlgorithm', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Border', 'Custom Utility/Random', 'EventSystem', 'timingCallbacks'], function(SynchronizedTimers, Entity, CircularHitBox, Vector, SliceAlgorithm, CircularHitBoxWithAlgorithm, Border, Random, EventSystem, timingCallbacks){

    function BonusTargetOrb(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager, TextManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager, TextManager);     

        this._hitbox = new CircularHitBoxWithAlgorithm(position, radius, new SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._handler = EffectsManager.requestLightningOrbEffect(false, gl, 20, position, {radius: [radius]});
        this._particlesHandler = EffectsManager.requestDirectedParticlesEffect(false, gl, 50, 30, new Vector(0, 0), {randomLifetimesOn: [1.0], maxLifetime: [100], radiusOfSource: [radius * 1.5]});
        this._particlesDestDist = 0.1 * canvasHeight;
        this._scoreWorth = 8;
        this._currParticlesDirection = "LEFT";
        this._type = "bonus";        
        this._currentStage = 1;
        this._nextOrbSpawnPosition = new Vector(0, 0); 
        this._disintegratingParticles = EffectsManager.requestParticlesFlowingUpwardEffect(false, gl, 40, 100, position, {maxLifetime: [800], radiusOfSource: [radius]});
        this._spawnSoundEffect = AudioManager.getAudioHandler("bonus_target_spawn_sound_effect");
        this._bonusTextHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 255, 255, 1.0], canvasHeight * 0.04, position.addTo(new Vector(radius * 2, 0)), "Bonus", false);
        EventSystem.register(this.receiveEvent, "game_lost", this);
    }
    
    //inherit from Entity
    BonusTargetOrb.prototype = Object.create(Entity.prototype);
    BonusTargetOrb.prototype.constructor = BonusTargetOrb;
    
    BonusTargetOrb.prototype.setPosition = function(newPosition){
        Entity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this._setNextOrbSpawnDirection();
        this.setParticlesDirection(this._currParticlesDirection);
        this._disintegratingParticles.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._hitbox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
        this.setParticlesDirection(this._currParticlesDirection);
        this._setNextOrbSpawnDirection();
        this._disintegratingParticles.setPosition(newPosition);
        this._bonusTextHandler.setPosition(newPosition.addTo(new Vector(this._radius * 2, 0)));
    }
    
    BonusTargetOrb.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._particlesHandler.update();
        this._bonusTextHandler.draw();
    }
    
    BonusTargetOrb.prototype.spawn = function(callback){
        Entity.prototype.spawn.call(this, callback);
        this._particlesHandler.shouldDraw(true);
        this._handler.turnOnLightning();
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
        timingCallbacks.addTimingEvents(this, 3000, 1, function(){}, function(){
            this._disintegratingParticles.doEffect();
            this.reset();
            EventSystem.publishEventImmediately("bonus_target_disintegrated", {entity: this});
        });
        this._bonusTextHandler.doFadeUpwardsEffect();
    }
    
    BonusTargetOrb.prototype.reset = function(){
        Entity.prototype.reset.call(this);
        this._hitbox.resetAlgorithm();
        this._particlesHandler.reset();
        this._currentStage = 1;
        this._handler.shouldDraw(false);
    }
    
    BonusTargetOrb.prototype.setParticlesDirection = function(direction){
        this._currParticlesDirection = direction;
        
        if(direction === "LEFT"){
            this._particlesHandler.setDestination(new Vector(this._position.getX() - this._particlesDestDist, this._position.getY()));
        }else if(direction === "UP"){
            this._particlesHandler.setDestination(new Vector(this._position.getX(), this._position.getY() + this._particlesDestDist));
        }else if(direction === "RIGHT"){
            this._particlesHandler.setDestination(new Vector(this._position.getX() + this._particlesDestDist, this._position.getY()));
        }else if(direction === "DOWN"){
            this._particlesHandler.setDestination(new Vector(this._position.getX(), this._position.getY() - this._particlesDestDist));
        } 
    }
    
    BonusTargetOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(this._hitbox.processInput(mouseInputObj)){
            if(this._currentStage < 4){
               this._handler.doDestroyEffect(this._position, function(){
                    callback();
                });
                this._hitbox.resetAlgorithm();
                
                
                this.setPosition(this._nextOrbSpawnPosition);
                this._handler.doSpawnEffect(this._position);
                if(this._currentStage === 3){
                    this._particlesHandler.shouldDraw(false);
                }
                this._currentStage++;
                timingCallbacks.resetTimeOfAddedTimeEvents(this);
            }else if(this._currentStage === 4){
                this.destroyAndReset(function(){
                    callback();
                }.bind(this));
                
                timingCallbacks.removeTimingEvents(this);
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus", lgStrikePoints: 2, position: this._position, radius: this._radius});
                return true;
            }
        }
    }
    
    BonusTargetOrb.prototype._setNextOrbSpawnDirection = function(){
        var borderWalls = [];
        var position = this._position;
        
        if(position.distanceTo(new Vector(Border.getLeftX(), position.getY())) >= this._particlesDestDist * 2){
            borderWalls.push("LEFT");
        }        
        if(position.distanceTo(new Vector(position.getX(), Border.getTopY())) >= this._particlesDestDist * 2){
            borderWalls.push("UP");
        }        
        if(position.distanceTo(new Vector(Border.getRightX(), position.getY())) >= this._particlesDestDist * 2){
            borderWalls.push("RIGHT");
        }        
        if(position.distanceTo(new Vector(position.getX(), Border.getBottomY())) >= this._particlesDestDist * 2){
            borderWalls.push("DOWN");
        }
        
        var randomWall = borderWalls[Random.getRandomInt(0, borderWalls.length)];
        this.setParticlesDirection(randomWall);
        this._currParticlesDirection = randomWall;
        
        if(randomWall === "LEFT"){
            this._nextOrbSpawnPosition = new Vector(position.getX() - this._particlesDestDist, position.getY());
        }else if(randomWall === "UP"){
            this._nextOrbSpawnPosition = new Vector(position.getX(), position.getY() + this._particlesDestDist);
        }else if(randomWall === "RIGHT"){
            this._nextOrbSpawnPosition = new Vector(position.getX() + this._particlesDestDist, position.getY());
        }else if(randomWall === "DOWN"){
            this._nextOrbSpawnPosition = new Vector(position.getX(), position.getY() - this._particlesDestDist);
        } 
    }
    
    BonusTargetOrb.prototype.receiveEvent = function(eventInfo){
        Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "lightning_strike"){
            // check to see if its been destroyed by lightning strike
            if(!this._alive){
                timingCallbacks.removeTimingEvents(this);
            }
        }else if(eventInfo.eventType === "game_lost"){
            timingCallbacks.removeTimingEvents(this);
            this._disintegratingParticles.reset();
        }
    }
    
    return BonusTargetOrb;
    
});