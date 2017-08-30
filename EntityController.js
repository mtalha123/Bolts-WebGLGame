define(['SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Custom Utility/distance'], function(SynchronizedTimers, Border, Random, EventSystem, distance){ 
    
    function returnTrueWithChance(chance){
        var randomVal = Random.getRandomIntInclusive(1, 100);
        if(randomVal <= chance){
            return true;
        }
        
        return false;
    }
    
    function EntityController(spawnChance, maxEntitiesToSpawn, speed){
        this._entitiesPool = [];
        this._entitiesActivated = [];
        this._entitiesInTransition = [];
        this._spawnAttemptDelay = 1000;
        this._chanceOfSpawning = spawnChance;
        this._spawnTimer = SynchronizedTimers.getTimer();  
        this._speed = speed;
        this._maxEntitiesToSpawn = this._totalPoolSize = maxEntitiesToSpawn;
        
        EventSystem.register(this.receiveEvent, "mouse_move", this);
        EventSystem.register(this.receiveEvent, "mouse_down", this);
        EventSystem.register(this.receiveEvent, "mouse_up", this);
        EventSystem.register(this.receiveEvent, "mouse_held_down", this); 
        EventSystem.register(this.receiveEvent, "combo_level_increased", this);
        EventSystem.register(this.receiveEvent, "combo_level_reset", this);
        EventSystem.register(this.receiveEvent, "game_restart", this);
        EventSystem.register(this.receiveEvent, "game_level_up", this);
    }
    
    EntityController.prototype.prepareForDrawing = function(interpolation){
        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].prepareForDrawing(interpolation);
        }
        
        for(var a = 0; a < this._entitiesInTransition.length; a++){
            this._entitiesInTransition[a].prepareForDrawing(interpolation);
        }
    }
    
    EntityController.prototype.update = function(){
        if(this._entitiesPool.length > (this._totalPoolSize - this._maxEntitiesToSpawn)){
            this._spawnTimer.start();
            if(this._spawnTimer.getTime() >= this._spawnAttemptDelay){
                if(returnTrueWithChance(this._chanceOfSpawning)){
                    this._spawn();   
                }
                this._spawnTimer.reset();
            }
        }

        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].update();
        }
        
        for(var a = 0; a < this._entitiesInTransition.length; a++){
            this._entitiesInTransition[a].update();
        }
    }
    
    EntityController.prototype._spawn = function(entitySpawned){
        EventSystem.publishEventImmediately("entity_spawned", {entity: entitySpawned, charge: entitySpawned.getCharge()})
    } 
    
    EntityController.prototype.receiveEvent = function(eventInfo){
        if(eventInfo.eventType === "game_restart"){
            this.reset();
        }else if(eventInfo.eventType === "combo_level_increased"){
        }else if(eventInfo.eventType === "combo_level_reset"){
        }else if(eventInfo.eventType === "game_level_up"){
            //override
        }else{
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            
            for(var i = 0; i < this._entitiesActivated.length; i++){
                if(this._entitiesActivated[i].runAchievementAlgorithmAndReturnStatus(inputToBeProcessed.mouseState, function(){
                    var indexOfTarget = 0;     
                    this._entitiesPool.push(this._entitiesInTransition.splice(indexOfTarget, 1)[0]); 
                }.bind(this))){
                    EventSystem.publishEventImmediately("entity_destroyed", {entity: this._entitiesActivated[i], charge: this._entitiesActivated[i].getCharge()});
                    this._entitiesInTransition.push(this._entitiesActivated.splice(i, 1)[0]);
                }
            }
        }
    }
    
    EntityController.prototype.setSpawnChance = function(spawnChance){
        this._chanceOfSpawning = spawnChance;
    }
    
    EntityController.prototype.setMaxEntitiesToSpawn = function(maxEntitiesToSpawn){
        this._maxEntitiesToSpawn = maxEntitiesToSpawn;
    }
    
    EntityController.prototype.setTimeToAttemptSpawn = function(attemptTime){
        this._spawnAttemptDelay = attemptTime;
    }
    
    EntityController.prototype.reset = function(){
        var len = this._entitiesActivated.length;
        for(var i = 0; i < len; i++){
            var entity = this._entitiesActivated.shift();
            entity.reset();
            this._entitiesPool.push(entity);
        }
        
        len = this._entitiesInTransition.length;
        for(var i = 0; i < len; i++){
            var entity = this._entitiesInTransition.shift();
            entity.reset();
            this._entitiesPool.push(entity);
        }
        
        this._spawnTimer.reset();
        this._speed = 10;
        this._spawnAttemptDelay = 5000;
        this._chanceOfSpawning = 0;
    }
    
    EntityController.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
    }
    
    return EntityController;
});