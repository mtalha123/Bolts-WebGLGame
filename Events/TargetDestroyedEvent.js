define([''], function(){
    
    function TargetDestroyedEvent(){
        this._x = undefined;
        this._y = undefined;
        this._target = undefined;
    }
    
    TargetDestroyedEvent.prototype.setProperties = function(Target, x, y){
        this._x = x;
        this._y = y;
        this._target = Target;
    }
    
    TargetDestroyedEvent.prototype.getX = function(){
        return this._x;
    }
    
    TargetDestroyedEvent.prototype.getY = function(){
        return this._y;
    }
    
    TargetDestroyedEvent.prototype.getTarget = function(){
        return this._target;
    }
    
    TargetDestroyedEvent.prototype.getType = function(){
        return "E_targetdestroyed";
    }
    
    return TargetDestroyedEvent;
});