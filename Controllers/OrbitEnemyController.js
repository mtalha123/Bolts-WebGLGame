define(['Entities/OrbitEnemy', 'Custom Utility/Random', 'Controllers/EntityController', 'Custom Utility/Vector'], function(OrbitEnemy, Random, EntityController, Vector){
    
    function OrbitEnemyController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new OrbitEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    OrbitEnemyController.prototype = Object.create(EntityController.prototype);
    OrbitEnemyController.prototype.constructor = OrbitEnemyController;
    
    OrbitEnemyController.prototype._spawn = function(){
        var spawnPosition = new Vector( Random.getRandomInt(0.5 * this._canvasWidth, 0.6 * this._canvasWidth),
                                        0.5 * this._canvasHeight);
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnPosition);  
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){});
    } 
    
    OrbitEnemyController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 3:
                    this._chanceOfSpawning = 20;
                    break;
                case 4:
                    this._chanceOfSpawning = 25;
                    break;
                case 5:
                    this._chanceOfSpawning = 35;
                    break;
                case 6:
                    this._chanceOfSpawning = 50;
                    break;
                case 7:
                    this._chanceOfSpawning = 60;
                    break;
                case 8:
                    this._chanceOfSpawning = 70;
                    break;
                
            }
        }
    }
    
    return OrbitEnemyController;
});