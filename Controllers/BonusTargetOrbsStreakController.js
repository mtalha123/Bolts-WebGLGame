define(['Entities/BonusTargetOrbStreak', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(BonusTargetOrbStreak, SynchronizedTimers, Border, Random, EventSystem, EntityControllerThatSpawns, Vector){
    
    function BonusTargetOrbsStreakController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager, AudioManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.05;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        this._spawnAttemptDelay = 4000;
        
        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new BonusTargetOrbStreak(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager, AudioManager);
        }
    }
    
    //inherit from EntityControllerThatSpawns
    BonusTargetOrbsStreakController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    BonusTargetOrbsStreakController.prototype.constructor = BonusTargetOrbsStreakController;
    
    BonusTargetOrbsStreakController.prototype.spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX = Random.getRandomInt(this._canvasWidth * 0.3, this._canvasWidth * 0.7);
        var spawnY = Random.getRandomInt(this._canvasHeight * 0.3, this._canvasHeight * 0.7);
        var movementAngle = Random.getRandomIntInclusive(0, 360);;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){ });
    } 
    
    BonusTargetOrbsStreakController.prototype.receiveEvent = function(eventInfo){
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);

        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 4:
                    this._chanceOfSpawning = 30;
                    break;
            }
        }
    }
    
    return BonusTargetOrbsStreakController;
});