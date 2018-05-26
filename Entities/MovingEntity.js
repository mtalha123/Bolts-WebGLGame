define(['Entities/Entity', 'Custom Utility/Vector'], function(Entity, Vector){

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
        this._velocity = new Vector(Math.cos(newAngle * (Math.PI / 180)) * this._speed, 
                                    Math.sin(newAngle * (Math.PI / 180)) * this._speed);
        this._physicsBody.setLinearVelocity(this._velocity);
    }
    
    MovingEntity.prototype.getMovementAngle = function(){
        return this._currentMovementAngleInDeg;
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