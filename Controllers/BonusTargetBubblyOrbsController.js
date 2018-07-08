define(['Entities/BonusTargetBubblyOrbCompound', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(BonusTargetBubblyOrbCompound, SynchronizedTimers, Border, Random, EventSystem, EntityControllerThatSpawns, Vector){
    
    function BonusTargetBubblyOrbsController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager, AudioManager, TextManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.07;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        this._spawnAttemptDelay = 4000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){              
            this._entitiesPool[i] = new BonusTargetBubblyOrbCompound(gl, appMetaData, this._targetRadius, new Vector(100, 100), EffectsManager, AudioManager, TextManager);
        }
    }
    
    //inherit from EntityControllerThatSpawns
    BonusTargetBubblyOrbsController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    BonusTargetBubblyOrbsController.prototype.constructor = BonusTargetBubblyOrbsController;
    
    BonusTargetBubblyOrbsController.prototype.spawn = function(){
        var spawnX = Random.getRandomInt(this._canvasWidth * 0.3, this._canvasWidth * 0.7);
        var spawnY = Random.getRandomInt(this._canvasHeight * 0.3, this._canvasHeight * 0.7);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){ });
    } 
    
    BonusTargetBubblyOrbsController.prototype.receiveEvent = function(eventInfo){
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 4:
                    this._chanceOfSpawning = 30;
                    break;
            }
        }
    }
    
    BonusTargetBubblyOrbsController.prototype.update = function(){
       // console.log("entites pool length: " + this._entitiesPool.length);
        EntityControllerThatSpawns.prototype.update.call(this);
    }
    
    return BonusTargetBubblyOrbsController;
});