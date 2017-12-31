define(['Entities/TentacleEnemy', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController', 'Custom Utility/distance'], function(TentacleEnemy, SynchronizedTimers, Border, Random, EventSystem, EntityController, distance){
    
    function TentacleEnemyController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;

        for(var i = 0; i < 2; i++){
            this._entitiesPool[i] = new TentacleEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 5, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    TentacleEnemyController.prototype = Object.create(EntityController.prototype);
    TentacleEnemyController.prototype.constructor = TentacleEnemyController;
    
    TentacleEnemyController.prototype._spawn = function(){
        var spawnX = Random.getRandomInt(0.2 * this._canvasWidth, 0.7 * this._canvasWidth);
        var spawnY = Random.getRandomInt(0.3 * this._canvasHeight, 0.7 * this._canvasHeight);
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);  
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){});
        
//        EntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    TentacleEnemyController.prototype.receiveEvent = function(eventInfo){
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
    
    return TentacleEnemyController;
});