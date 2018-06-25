define(['Entities/TentacleEnemy', 'Custom Utility/Random', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(TentacleEnemy, Random, EntityControllerThatSpawns, Vector){
    
    function TentacleEnemyController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 4000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new TentacleEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager);
        }
    }
    
    //inherit from EntityControllerThatSpawns
    TentacleEnemyController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    TentacleEnemyController.prototype.constructor = TentacleEnemyController;
    
    TentacleEnemyController.prototype.spawn = function(){
        var spawnPosition = new Vector( Random.getRandomInt(0.2 * this._canvasWidth, 0.7 * this._canvasWidth),
                                        Random.getRandomInt(0.3 * this._canvasHeight, 0.7 * this._canvasHeight));
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnPosition);  
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){});
    } 
    
    TentacleEnemyController.prototype.receiveEvent = function(eventInfo){
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 9:
                    this._chanceOfSpawning = 30;
                    break;
                
            }
        }
    }
    
    return TentacleEnemyController;
});