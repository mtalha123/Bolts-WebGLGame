define(['Entities/OrbitEnemy', 'Custom Utility/Random', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(OrbitEnemy, Random, EntityControllerThatSpawns, Vector){
    
    function OrbitEnemyController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 4000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new OrbitEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager);
        }
    }
    
    //inherit from EntityControllerThatSpawns
    OrbitEnemyController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    OrbitEnemyController.prototype.constructor = OrbitEnemyController;
    
    OrbitEnemyController.prototype.spawn = function(){
        var spawnPosition = new Vector( Random.getRandomInt(0.5 * this._canvasWidth, 0.6 * this._canvasWidth),
                                        0.5 * this._canvasHeight);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnPosition);  
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){});
    } 
    
    OrbitEnemyController.prototype.receiveEvent = function(eventInfo){
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 8:
                    this._chanceOfSpawning = 35;
                    break;
                
            }
        }
    }
    
    return OrbitEnemyController;
});