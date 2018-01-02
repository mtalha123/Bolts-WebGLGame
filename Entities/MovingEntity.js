define(['Entities/Entity', 'Custom Utility/Vector'], function(Entity, Vector){

    function MovingEntityDestructionState(handler){
        Entity.EntityDestructionState.call(this, handler);
    }
    
    MovingEntityDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    MovingEntityDestructionState.prototype.constructor = MovingEntityDestructionState;
    
    
    function MovingEntityNormalState(entity){
        Entity.EntityNormalState.call(this, entity);
        this._physicsBody = entity._physicsBody;
    }
    
    MovingEntityNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    MovingEntityNormalState.prototype.constructor = MovingEntityNormalState;
    
    MovingEntityNormalState.prototype.prepareForDrawing = function(interpolation){
        Entity.EntityNormalState.prototype.prepareForDrawing.call(this);
        
        this._handler.setPosition( this._entity._prevPosition.addTo((this._entity._prevPosition.subtractFrom(this._entity._position)).multiplyWithScalar(interpolation)) )      
    }

    MovingEntityNormalState.prototype.update = function(){
        this._physicsBody.update();        
        this._entity._setPositionWithInterpolation(this._physicsBody.getPosition());      
    }
    
    
    function MovingEntity(canvasWidth, canvasHeight, gl, position, movementangle, speed){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        
        this._physicsBody = null;
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._velocity = (new Vector(Math.cos(movementangle * (Math.PI / 180)), Math.sin(movementangle * (Math.PI / 180))).multiplyWithScalar(speed)); 
    }
    
    MovingEntity.prototype = Object.create(Entity.Entity.prototype);
    MovingEntity.prototype.constructor = MovingEntity;
    
    MovingEntity.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._physicsBody.setPosition(newPosition);
    }
    
    MovingEntity.prototype.setMovementAngle = function(newAngle){
        this._currentMovementAngleInDeg = newAngle;
        //this._xUnits = Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        //this._yUnits = Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._velocity = new Vector(Math.cos(newAngle * (Math.PI / 180)) * this._speed, 
                                    Math.sin(newAngle * (Math.PI / 180)) * this._speed);
        this._physicsBody.setLinearVelocity(this._velocity);
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
        this._velocity = (new Vector(Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)), Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180))).multiplyWithScalar(newSpeed)); 
    }
    
    return {
        MovingEntity: MovingEntity,
        MovingEntityNormalState: MovingEntityNormalState,
        MovingEntityDestructionState: MovingEntityDestructionState
    };
});