define(['SynchronizedTimers', 'Controllers/EntityController', 'Custom Utility/Random', 'EventSystem'], function(SynchronizedTimers, EntityController, Random, EventSystem){
    function returnTrueWithChance(chance){
        var randomVal = Random.getRandomIntInclusive(1, 100);
        if(randomVal <= chance){
            return true;
        }
        
        return false;
    }
    
    
    function EntityControllerThatSpawns(appMetaData, spawnChance, maxEntitiesToSpawn){
        EntityController.call(this, appMetaData); 
        this._spawnTimer = SynchronizedTimers.getTimer();
        this._spawnAttemptDelay = 3000;
        this._chanceOfSpawning = spawnChance;
        this._numEntitesInPool = maxEntitiesToSpawn;
        EventSystem.register(this.receiveEvent, "game_level_up", this);
    }
    
    //inherit from EntityController
    EntityControllerThatSpawns.prototype = Object.create(EntityController.prototype);
    EntityControllerThatSpawns.prototype.constructor = EntityControllerThatSpawns;
    
    EntityControllerThatSpawns.prototype.update = function(){
        EntityController.prototype.update.call(this);
        
        if(this._entitiesPool.length > 0){
            this._spawnTimer.start();
            if(this._spawnTimer.getTime() >= this._spawnAttemptDelay){
                if(returnTrueWithChance(this._chanceOfSpawning)){
                    this.spawn();   
                }
                this._spawnTimer.reset();
            }
        }
    } 
    
    EntityControllerThatSpawns.prototype.setSpawnChance = function(spawnChance){
        this._chanceOfSpawning = spawnChance;
    }
    
    EntityControllerThatSpawns.prototype.setMaxEntitiesToSpawn = function(maxEntitiesToSpawn){
        this._maxEntitiesToSpawn = maxEntitiesToSpawn;
    }
    
    EntityControllerThatSpawns.prototype.setTimeToAttemptSpawn = function(attemptTime){
        this._spawnAttemptDelay = attemptTime;
    }
    
    EntityControllerThatSpawns.prototype.reset = function(){
        EntityController.prototype.reset.call(this);        
        this._spawnTimer.reset();
        this._spawnAttemptDelay = 3000;
        this._chanceOfSpawning = 0;
    }
    
    return EntityControllerThatSpawns;
});