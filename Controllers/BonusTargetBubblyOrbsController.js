define(['Entities/BonusTargetBubblyOrb', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController'], function(BonusTargetBubblyOrb, SynchronizedTimers, Border, Random, EventSystem, EntityController, ){
    
    function BonusTargetBubblyOrbsController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, 0, maxEntitiesToSpawn, 10); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.05;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        this._spawnAttemptDelay = 5000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){              
            this._entitiesPool[i] = new BonusTargetBubblyOrb(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BonusTargetBubblyOrbsController.prototype = Object.create(EntityController.prototype);
    BonusTargetBubblyOrbsController.prototype.constructor = BonusTargetBubblyOrbsController;
    
    BonusTargetBubblyOrbsController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX = Random.getRandomInt(200, 600);
        var spawnY = Random.getRandomInt(300, 400);
        var movementAngle = Random.getRandomIntInclusive(0, 360);;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        newlyActivatedTarget.setAchievementParameters(this._targetAreaToAchieve);
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){ });
        
        EntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    BonusTargetBubblyOrbsController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
            this._setAchievementParamtersForAllActiveTargets();
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
            this._setAchievementParamtersForAllActiveTargets();
        }else if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 2:
                    this._chanceOfSpawning = 100;
                    break;
                case 5:
                    this._chanceOfSpawning = 20;
                    break;
                case 6:
                    this._chanceOfSpawning = 35;
                    break;
            }
        }
    }
    
    BonusTargetBubblyOrbsController.prototype._setAchievementParamtersForAllActiveTargets = function(){
        for(var i = 0; i < this._entitiesActivated.length; i++){
            this._entitiesActivated[i].setAchievementParameters(this._targetAreaToAchieve);
        }
    }
    
    return BonusTargetBubblyOrbsController;
});