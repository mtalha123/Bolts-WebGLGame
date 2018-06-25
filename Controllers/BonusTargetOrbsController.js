define(['Entities/BonusTargetOrb', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(BonusTargetOrb, SynchronizedTimers, Border, Random, EventSystem, EntityControllerThatSpawns, Vector){
    
    function BonusTargetOrbsController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.02;
        this._spawnAttemptDelay = 4000;
        
        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool.push(new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(400, 400), EffectsManager));
        }
    }
    
    //inherit from EntityControllerThatSpawns
    BonusTargetOrbsController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    BonusTargetOrbsController.prototype.constructor = BonusTargetOrbsController;
    
    BonusTargetOrbsController.prototype.spawn = function(){
        var spawnX = Random.getRandomInt(this._canvasWidth * 0.3, this._canvasWidth * 0.7);
        var spawnY = Random.getRandomInt(this._canvasHeight * 0.3, this._canvasHeight * 0.5);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));    
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){});
    } 
    
    BonusTargetOrbsController.prototype.receiveEvent = function(eventInfo){
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 7:
                    this._chanceOfSpawning = 20;
                    break;                
            }
        }
    }
    
    BonusTargetOrbsController.prototype.prepareForDrawing = function(eventInfo){
        EntityControllerThatSpawns.prototype.prepareForDrawing.call(this, eventInfo);
    }
     
    return BonusTargetOrbsController;
});