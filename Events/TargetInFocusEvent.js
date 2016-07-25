define([''], function(){
    
    function TargetInFocusEvent(){
        this._x = undefined;
        this._y = undefined;
        this._target = undefined;
    }
    
    TargetInFocusEvent.prototype.setProperties = function(Target, x, y){
        this._x = x;
        this._y = y;
        this._target = Target;
    }
    
    TargetInFocusEvent.prototype.getX = function(){
        return this._x;
    }
    
    TargetInFocusEvent.prototype.getY = function(){
        return this._y;
    }
    
    TargetInFocusEvent.prototype.getTarget = function(){
        return this._target;
    }
    
    TargetInFocusEvent.prototype.getType = function(){
        return "targetinfocus";
    }
    
    return TargetInFocusEvent;
});