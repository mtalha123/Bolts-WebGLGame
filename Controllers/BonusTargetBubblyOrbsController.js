define(['Entities/BonusTargetBubblyOrbCompound', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController', 'Custom Utility/Vector'], function(BonusTargetBubblyOrbCompound, SynchronizedTimers, Border, Random, EventSystem, EntityController, Vector){
    
    function BonusTargetBubblyOrbsController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.07;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        this._spawnAttemptDelay = 5000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){              
//            this._entitiesPool[i] = new BonusTargetBubblyOrb(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, EffectsManager);
            this._entitiesPool[i] = new BonusTargetBubblyOrbCompound(gl, appMetaData, this._targetRadius, new Vector(100, 100), EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BonusTargetBubblyOrbsController.prototype = Object.create(EntityController.prototype);
    BonusTargetBubblyOrbsController.prototype.constructor = BonusTargetBubblyOrbsController;
    
    BonusTargetBubblyOrbsController.prototype._spawn = function(){
        var spawnX = Random.getRandomInt(this._canvasWidth * 0.3, this._canvasWidth * 0.7);
        var spawnY = Random.getRandomInt(this._canvasHeight * 0.3, this._canvasHeight * 0.7);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){ });
        
        EntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    BonusTargetBubblyOrbsController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 5:
                    this._chanceOfSpawning = 20;
                    break;
                case 6:
                    this._chanceOfSpawning = 35;
                    break;
            }
        }
    }
    
    BonusTargetBubblyOrbsController.prototype.update = function(){
       // console.log("entites pool length: " + this._entitiesPool.length);
        EntityController.prototype.update.call(this);
    }
    
    return BonusTargetBubblyOrbsController;
});