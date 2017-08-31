define(['SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Custom Utility/distance', 'Controllers/EntityController'], function(SynchronizedTimers, Border, Random, EventSystem, distance, EntityController){ 
    
    function MovingEntityController(appMetaData, spawnChance, maxEntitiesToSpawn, speed){
        EntityController.call(this, appMetaData, spawnChance, maxEntitiesToSpawn);
        this._speed = speed;
    }
    
    MovingEntityController.prototype = Object.create(EntityController.prototype);
    MovingEntityController.prototype.constructor = MovingEntityController;
    
    MovingEntityController.prototype.reset = function(){
        EntityController.prototype.reset.call(this);
        this._speed = 10;
    }
    
    MovingEntityController.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
    }
    
    return MovingEntityController;
});