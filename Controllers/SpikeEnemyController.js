define(['Entities/SpikeEnemy', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/MovingEntityController', 'Custom Utility/distance'], function(SpikeEnemy, SynchronizedTimers, Border, Random, EventSystem, MovingEntityController, distance){
    
    function SpikeEnemyController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        MovingEntityController.call(this, appMetaData, 100, maxEntitiesToSpawn, 10); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;

        for(var i = 0; i < 2; i++){
            this._entitiesPool[i] = new SpikeEnemy(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 5, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from MovingEntityController
    SpikeEnemyController.prototype = Object.create(MovingEntityController.prototype);
    SpikeEnemyController.prototype.constructor = SpikeEnemyController;
    
    SpikeEnemyController.prototype._spawn = function(){
        var spawnX = Random.getRandomInt(0.2 * this._canvasWidth, 0.7 * this._canvasWidth);
        var spawnY = Random.getRandomInt(0.3 * this._canvasHeight, 0.7 * this._canvasHeight);
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        var distances = [];
        distances.push( distance(spawnX, spawnY, Border.getRightX(), spawnY) );
        distances.push( distance(spawnX, spawnY, spawnX, Border.getBottomY()) );
        distances.push( distance(spawnX, spawnY, Border.getLeftX(), spawnY) );
        
        var minDist = distances[0];
        var minDistIndex = 0;
        distances.map(function(val, index){
            if(val < minDist){
                minDist = val;
                minDistIndex = index;
            }
        });
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);  
        newlyActivatedTarget.setSpeed(this._speed);
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            switch(minDistIndex){
                case 0:
                    newlyActivatedTarget.setDestination(Border.getRightX(), spawnY);
                    break;
                case 1:
                    newlyActivatedTarget.setDestination(spawnX, Border.getBottomY());
                    break;
                case 2:
                    newlyActivatedTarget.setDestination(Border.getLeftX(), spawnY);
                    break;
            }
        });
        
//        MovingEntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    SpikeEnemyController.prototype.receiveEvent = function(eventInfo){
        MovingEntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
        }else if(eventInfo.eventType === "combo_level_reset"){
        }else if(eventInfo.eventType === "game_level_up"){
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
    
    return SpikeEnemyController;
});