define(['Entities/SpikeEnemy', 'Border', 'Custom Utility/Random', 'Controllers/EntityController', 'Custom Utility/Vector'], function(SpikeEnemy, Border, Random, EntityController, Vector){
    
    function SpikeEnemyController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;
        var speed = 0.005 * appMetaData.getCanvasHeight();

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new SpikeEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), speed, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    SpikeEnemyController.prototype = Object.create(EntityController.prototype);
    SpikeEnemyController.prototype.constructor = SpikeEnemyController;
    
    SpikeEnemyController.prototype._spawn = function(){
        var spawnPosition = new Vector( Random.getRandomInt(0.2 * this._canvasWidth, 0.7 * this._canvasWidth),
                                        Random.getRandomInt(0.3 * this._canvasHeight, 0.7 * this._canvasHeight) );
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        var distances = [];
        distances.push( spawnPosition.distanceTo(new Vector(Border.getRightX(), spawnPosition.getY())) );
        distances.push( spawnPosition.distanceTo(new Vector(spawnPosition.getX(), Border.getBottomY())) );
        distances.push( spawnPosition.distanceTo(new Vector(Border.getLeftX(), spawnPosition.getY())) );
        
        var minDist = distances[0];
        var minDistIndex = 0;
        distances.map(function(val, index){
            if(val < minDist){
                minDist = val;
                minDistIndex = index;
            }
        });
        
        newlyActivatedTarget.setPosition(spawnPosition);  
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            switch(minDistIndex){
                case 0:
                    newlyActivatedTarget.setDestination(new Vector(Border.getRightX(), spawnPosition.getY()));
                    break;
                case 1:
                    newlyActivatedTarget.setDestination(new Vector(spawnPosition.getX(), Border.getBottomY()));
                    break;
                case 2:
                    newlyActivatedTarget.setDestination(new Vector(Border.getLeftX(), spawnPosition.getY()));
                    break;
            }
        });
    } 
    
    SpikeEnemyController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
//        if(eventInfo.eventType === "game_level_up"){
//            switch(eventInfo.eventData.level){
//                case 3:
//                    this._chanceOfSpawning = 20;
//                    break;
//                case 4:
//                    this._chanceOfSpawning = 25;
//                    break;
//                case 5:
//                    this._chanceOfSpawning = 35;
//                    break;
//                case 6:
//                    this._chanceOfSpawning = 50;
//                    break;
//                case 7:
//                    this._chanceOfSpawning = 60;
//                    break;
//                case 8:
//                    this._chanceOfSpawning = 70;
//                    break;
//                
//            }
//        }
    }
    
    return SpikeEnemyController;
});