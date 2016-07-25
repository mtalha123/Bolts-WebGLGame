define([''], function(){
    
    function TargetSpawnedEvent(){
        this._x = undefined;
        this._y = undefined;
        this._target = undefined;
    }
    
    TargetSpawnedEvent.prototype.setProperties = function(Target, x, y){
        this._x = x;
        this._y = y;
        this._target = Target;
    }
    
    TargetSpawnedEvent.prototype.getX = function(){
        return this._x;
    }
    
    TargetSpawnedEvent.prototype.getY = function(){
        return this._y;
    }
    
    TargetSpawnedEvent.prototype.getTarget = function(){
        return this._target;
    }
    
    TargetSpawnedEvent.prototype.getType = function(){
        return "targetspawned";
    }
    
    return TargetSpawnedEvent;
});