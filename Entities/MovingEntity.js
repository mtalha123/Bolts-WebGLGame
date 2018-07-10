define(['Entities/Entity', 'Custom Utility/Vector'], function(Entity, Vector){

    function MovingEntity(canvasWidth, canvasHeight, gl, position, AudioManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, AudioManager);
        this._physicsBody = null;
        this._speed = 0.01 * canvasHeight;
    }
    
    MovingEntity.prototype = Object.create(Entity.prototype);
    MovingEntity.prototype.constructor = MovingEntity;
    
    MovingEntity.prototype.setPosition = function(newPosition){
        Entity.prototype.setPosition.call(this, newPosition);
        this._physicsBody.setPosition(newPosition);
    }
    
    MovingEntity.prototype.setMovementAngle = function(newAngle){
        this._physicsBody.setMovementAngle(newAngle);
    }
    
    MovingEntity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitbox.isInAnyRegion(checkX, checkY);
    }
    
    MovingEntity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    MovingEntity.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
        this._physicsBody.setSpeed(newSpeed);
    }
    
    MovingEntity.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._handler.setPosition( this._prevPosition.addTo((this._position.subtract(this._prevPosition)).multiplyWithScalar(interpolation)) ); 
    }
    
    MovingEntity.prototype.update = function(){
        this._physicsBody.update();        
        this._setPositionWithInterpolation(this._physicsBody.getPosition());  
    }
    
    return MovingEntity;
});