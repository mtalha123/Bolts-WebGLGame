define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MainEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'SliceAlgorithm', 'MainTargetsPositions', 'EventSystem', 'timingCallbacks'], function(CirclePhysicsBody, SynchronizedTimers, MainEntity, CircularHitBoxWithAlgorithm, Vector, SliceAlgorithm, MainTargetsPositions, EventSystem, timingCallbacks){

    function BasicTarget(canvasWidth, canvasHeight, gl, radius, numbolts, position, EffectsManager, AudioManager){
        MainEntity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);
        this._hitbox = new CircularHitBoxWithAlgorithm(position, radius, new SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager));
        this._physicsBody.setSpeed(this._speed);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, position, {radius: [radius], fluctuation: [5]});
        this._numSlicesNeededToDestroy = 1;
        this._currSlicesDone = 0;
        this._type = "main";
    }
    
    //inherit from MainEntity
    BasicTarget.prototype = Object.create(MainEntity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.setPosition = function(newPosition){
        MainEntity.prototype.setPosition.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MainEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitbox.setPosition(newPosition);
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype.reset = function(){
        MainEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitbox.resetAlgorithm();
        this._currSlicesDone = 0;
        this._handler.setCapturedToFalse();
    }
    
    BasicTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "main"});
        MainEntity.prototype.spawn.call(this, callback);
        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
        this._spawnSoundEffect.play();
    }
    
    BasicTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){       
        if(this._hitbox.processInput(mouseInputObj)){
            this._currSlicesDone++;
            
            if(this._currSlicesDone >= this._numSlicesNeededToDestroy){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "main"});
                this.destroyAndReset(callback);
                return true;
            }else{
                this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                this._hitbox.resetAlgorithm();
            }
        }
    }
    
    BasicTarget.prototype.destroyAndReset = function(callback){
        MainEntity.prototype.destroyAndReset.call(this, callback);
        MainTargetsPositions.removeTargetObj(this);
    }
    
    BasicTarget.prototype.receiveEvent = function(eventInfo){
        MainEntity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 2:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.02 * this._canvasHeight);
                        this._numSlicesNeededToDestroy = 2;  
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 3:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this._numSlicesNeededToDestroy = 3;   
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 7:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this._numSlicesNeededToDestroy = 4;    
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
                case 8:
                    this._changeFunctionsToApplyNextSpawn.push(function(){
                        this.setSpeed(0.03 * this._canvasHeight);
                        this._numSlicesNeededToDestroy = 5;   
                        this._handler.setNumBolts(this._numSlicesNeededToDestroy - this._currSlicesDone);
                    }.bind(this));
                    break;
            }
        }
        
        if(eventInfo.eventType === "game_restart"){
            this._numSlicesNeededToDestroy = 1;
            this.setSpeed(0.01 * this._canvasHeight);
        }
    }
    
    return BasicTarget;
    
});