define([''], function(){
    
    function BorderCollisionEvent(){
        this._x = undefined;
        this._y = undefined;
        this._entity = undefined;
        this._side = undefined;
    }
    
    BorderCollisionEvent.prototype.setProperties = function(entity, x, y, side){
        this._x = x;
        this._y = y;
        this._entity = entity;
        this._side = side;
    }
    
    BorderCollisionEvent.prototype.getX = function(){
        return this._x;
    }
    
    BorderCollisionEvent.prototype.getY = function(){
        return this._y;
    }
    
    BorderCollisionEvent.prototype.getEntity = function(){
        return this._entity;
    }
    
    BorderCollisionEvent.prototype.getSide = function(){
        return this._side;
    }
    
    BorderCollisionEvent.prototype.getType = function(){
        return "bordercollision";
    }
    
    return BorderCollisionEvent;
});