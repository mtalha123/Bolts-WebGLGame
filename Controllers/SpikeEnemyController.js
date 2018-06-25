define(['Entities/SpikeEnemy', 'Border', 'Custom Utility/Random', 'Controllers/EntityControllerThatSpawns', 'Custom Utility/Vector'], function(SpikeEnemy, Border, Random, EntityControllerThatSpawns, Vector){
    
    function SpikeEnemyController(gl, appMetaData, maxEntitiesToSpawn, spawnChance, EffectsManager){
        EntityControllerThatSpawns.call(this, appMetaData, spawnChance, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 5000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new SpikeEnemy(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager);
        }
    }
    
    //inherit from EntityControllerThatSpawns
    SpikeEnemyController.prototype = Object.create(EntityControllerThatSpawns.prototype);
    SpikeEnemyController.prototype.constructor = SpikeEnemyController;
    
    SpikeEnemyController.prototype.spawn = function(){
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
        EntityControllerThatSpawns.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 5:
                    this._chanceOfSpawning = 30;
                    break;                
            }
        }
    }
    
    return SpikeEnemyController;
});