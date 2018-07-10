define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'SliceAlgorithm', 'MainTargetsPositions', 'Custom Utility/getQuadrant', 'Custom Utility/Timer'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, Vector, EventSystem, SliceAlgorithm, MainTargetsPositions, getQuadrant, Timer){  
    
    function TentacleEnemy(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager, AudioManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position, AudioManager);
        this._radius = p_radius;
        this._hitbox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._type = "enemy";
        
        this._handler = EffectsManager.requestTentacleEnemyHandler(false, gl, 20, position, {});
        this._spawnSoundEffect = AudioManager.getAudioHandler("enemy_spawn_sound_effect");
        this._captureSoundEffect = AudioManager.getAudioHandler("capture_sound_effect");
        
        this._maxNumCaptureEntities = 4;
        this._numTimesSliced = 0;
        this._delayCapturingTimer = new Timer();
        this._TIME_DELAY_TO_CAPTURE = 2000;
        this._canCapture = true;
        
        //first one represents top right tentacle, second one represents top left tentacle, etc. 0 = doesn't hold lg, 1 = holds lg
        this._listTentaclesHoldLg = [0, 0, 0, 0];
        //same as above: first one represents entity held in top right tentacle, second one represents entity held in top left tentacle, etc.
        this._listEntitiesCaptured = [undefined, undefined, undefined, undefined]; 
        //same as above in terms of which position represents which tentacle
        this._listTentaclesAlive = [1, 1, 1, 1];
    }
    
    //inherit from Entity
    TentacleEnemy.prototype = Object.create(Entity.Entity.prototype);
    TentacleEnemy.prototype.constructor = TentacleEnemy;
    
    TentacleEnemy.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
    }
    
    TentacleEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitbox.setPosition(newPosition);
    }
    
    TentacleEnemy.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._numTimesSliced = 0;
        this._hitbox.resetAlgorithm();
        this._listTentaclesHoldLg = [0, 0, 0, 0];
        this._listEntitiesCaptured = [undefined, undefined, undefined, undefined]; 
        this._listTentaclesAlive = [1, 1, 1, 1];
    } 
    
    TentacleEnemy.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "enemy"});
    } 
    
    TentacleEnemy.prototype.update = function(){
        if(this._delayCapturingTimer.getTime() >= this._TIME_DELAY_TO_CAPTURE){
            this._delayCapturingTimer.reset();
            this._canCapture = true;
        }
        
        if(this._canCapture){
            var allTargetObjs = MainTargetsPositions.getAllTargetObjs();

            for(var i = 0; i < allTargetObjs.length; i++){
                if(this._position.distanceTo(allTargetObjs[i].position) <= (this._radius * 4)){
                    var quadOfEntity = getQuadrant(allTargetObjs[i].position, this._position);
                    if((this._listTentaclesHoldLg[quadOfEntity - 1] === 1) || this._listTentaclesAlive[quadOfEntity-1] === 0){
                        break;
                    }

                    this._listTentaclesHoldLg[quadOfEntity - 1] = 1;
                    this._listEntitiesCaptured[quadOfEntity - 1] = allTargetObjs[i].target;
                    this._handler.doTentacleGrab(allTargetObjs[i].position, quadOfEntity);
                    this._handler.setYellowColorPrefs(this._listTentaclesHoldLg);
                    this._captureSoundEffect.play();
                    
                    EventSystem.publishEventImmediately("entity_captured", {entity: allTargetObjs[i].target, capture_type: "destroy"});
                }
            }
        }
    }
    
    TentacleEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitbox.processInput(mouseInputObj)){
            this._hitbox.resetAlgorithm();
            this._numTimesSliced++;
            
            var indexOfATentacleHoldingLg = this._listTentaclesHoldLg.indexOf(1);
            if(indexOfATentacleHoldingLg != -1){
                if(this._numTimesSliced === 2){
                    this._listTentaclesHoldLg[indexOfATentacleHoldingLg] = 0;
                    this._handler.setYellowColorPrefs(this._listTentaclesHoldLg);
                    this._numTimesSliced = 0;
                    this._delayCapturingTimer.start();
                    this._canCapture = false;
                    EventSystem.publishEventImmediately("captured_entity_released_from_destruction_capture", {entity: this._listEntitiesCaptured[indexOfATentacleHoldingLg], position: this._position});
                }
            }else{
                var indexOfFirstAliveTentacle = this._listTentaclesAlive.indexOf(1);
                this._listTentaclesAlive[indexOfFirstAliveTentacle] = 0;
                this._handler.tentaclesToShowPrefs(this._listTentaclesAlive);
                this._numTimesSliced = 0;
            }
            
            //check if last tentacle is dead. If not, destroy and reset
            if(this._listTentaclesAlive[3] === 0){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "enemy"});
                this.destroyAndReset(callback);
                return true;
            }
        }
        
        return false;
    }
    
    TentacleEnemy.prototype.receiveEvent = function(eventInfo){        
        Entity.Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "lightning_strike"){
            // check to see if its been destroyed by lightning strike
            if(!this._alive){
                // release all captured entities
                for(var i = 0; i < this._listTentaclesHoldLg.length; i++){
                    if(this._listTentaclesHoldLg[i] === 1){
                        this._listTentaclesHoldLg[i] = 0;
                        EventSystem.publishEventImmediately("captured_entity_released_from_destruction_capture", {entity: this._listEntitiesCaptured[i], position: this._position});
                    }
                }
            }
        }
    }
    
    return TentacleEnemy;
});