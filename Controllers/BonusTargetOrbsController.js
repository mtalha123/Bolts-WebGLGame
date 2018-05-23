define(['Entities/BonusTargetOrbCompound', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController', 'Custom Utility/Vector'], function(BonusTargetOrbCompound, SynchronizedTimers, Border, Random, EventSystem, EntityController, Vector){
    
    function BonusTargetOrbsController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.02;
        this._spawnAttemptDelay = 2000;
        
        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool.push(new BonusTargetOrbCompound(gl, appMetaData, EffectsManager, this._targetRadius, new Vector(400, 400)));
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BonusTargetOrbsController.prototype = Object.create(EntityController.prototype);
    BonusTargetOrbsController.prototype.constructor = BonusTargetOrbsController;
    
    BonusTargetOrbsController.prototype._spawn = function(){
        var spawnX = Random.getRandomInt(this._canvasWidth * 0.3, this._canvasWidth * 0.7);
        var spawnY = Random.getRandomInt(this._canvasHeight * 0.3, this._canvasHeight * 0.5);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));    
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn();
    } 
    
    BonusTargetOrbsController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 2:
                    this._chanceOfSpawning = 10;
                    break;
                case 3:
                    this._chanceOfSpawning = 20;
                    break;
                case 5:
                    this._chanceOfSpawning = 45;
                    break;
                case 6:
                    this._chanceOfSpawning = 50;
                    break;                
            }
        }
    }
    
    BonusTargetOrbsController.prototype.prepareForDrawing = function(eventInfo){
        EntityController.prototype.prepareForDrawing.call(this, eventInfo);
    }
     
    return BonusTargetOrbsController;
});