define(['Entities/Entity'], function(Entity){

    function MovingEntityDestructionState(handler){
        Entity.EntityDestructionState.call(this, handler);
    }
    
    MovingEntityDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    MovingEntityDestructionState.prototype.constructor = MovingEntityDestructionState;
    
    
    function MovingEntityNormalState(entity){
        Entity.EntityNormalState.call(this, entity);
        this._physicsEntity = entity._physicsEntity;
    }
    
    MovingEntityNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    MovingEntityNormalState.prototype.constructor = MovingEntityNormalState;
    
    MovingEntityNormalState.prototype.prepareForDrawing = function(interpolation){
        Entity.EntityNormalState.prototype.prepareForDrawing.call(this);
        this._handler.setPosition( this._entity._prevX + (interpolation * (this._entity._x - this._entity._prevX)), this._entity._prevY + (interpolation * (this._entity._y - this._entity._prevY)) )      
    }

    MovingEntityNormalState.prototype.update = function(){
        this._physicsEntity.update();        
        this._entity._setPositionWithInterpolation(this._physicsEntity.getX(), this._physicsEntity.getY());      
    }
    
    
    function MovingEntity(id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y);
        
        this._physicsEntity = null;
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed; 
    }
    
    MovingEntity.prototype = Object.create(Entity.Entity.prototype);
    MovingEntity.prototype.constructor = MovingEntity;
    
    MovingEntity.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        this._physicsEntity.setPosition(newX, newY);
    }
    
    MovingEntity.prototype.setMovementAngle = function(newAngle){
        this._currentMovementAngleInDeg = newAngle;
        this._xUnits = Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._yUnits = Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._physicsEntity.setLinearVelocity(this._xUnits, this._yUnits);
    }
    
    MovingEntity.prototype.getMovementAngle = function(){
        return this._currentMovementAngleInDeg;
    }
    
    MovingEntity.prototype.setAchievementPercentage = function(percent){
        //override
    }
    
    MovingEntity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitBoxRegions.isInAnyRegion(checkX, checkY);
    }
    
    MovingEntity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    MovingEntity.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
    }
    
    return {
        MovingEntity: MovingEntity,
        MovingEntityNormalState: MovingEntityNormalState,
        MovingEntityDestructionState: MovingEntityDestructionState
    };
});