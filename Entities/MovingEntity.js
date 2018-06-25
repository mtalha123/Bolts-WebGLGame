define(['Entities/Entity', 'Custom Utility/Vector'], function(Entity, Vector){

    function MovingEntity(canvasWidth, canvasHeight, gl, position){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        
        this._physicsBody = null;
        
        this._speed = 0.01 * canvasHeight;
//        this._velocity = (new Vector(Math.cos(movementangle * (Math.PI / 180)), Math.sin(movementangle * (Math.PI / 180))).multiplyWithScalar(this._speed)); 
    }
    
    MovingEntity.prototype = Object.create(Entity.Entity.prototype);
    MovingEntity.prototype.constructor = MovingEntity;
    
    MovingEntity.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._physicsBody.setPosition(newPosition);
    }
    
    MovingEntity.prototype.setMovementAngle = function(newAngle){
//        var velocity = new Vector(Math.cos(newAngle * (Math.PI / 180)) * this._speed, 
//                                  Math.sin(newAngle * (Math.PI / 180)) * this._speed);
        this._physicsBody.setMovementAngle(newAngle);
    }
    
    MovingEntity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitBoxRegions.isInAnyRegion(checkX, checkY);
    }
    
    MovingEntity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    MovingEntity.prototype.setSpeed = function(newSpeed){
        this._speed = newSpeed;
//        this._velocity = new Vector(Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)), Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180))).multiplyWithScalar(newSpeed); 
        this._physicsBody.setSpeed(newSpeed);
    }
    
    MovingEntity.prototype.prepareForDrawing = function(interpolation){
        Entity.Entity.prototype.prepareForDrawing.call(this, interpolation);
        
        this._handler.setPosition( this._prevPosition.addTo((this._position.subtract(this._prevPosition)).multiplyWithScalar(interpolation)) ); 
    }
    
    MovingEntity.prototype.update = function(){
        this._physicsBody.update();        
        this._setPositionWithInterpolation(this._physicsBody.getPosition());  
    }
    
    return {
        MovingEntity: MovingEntity
    };
});