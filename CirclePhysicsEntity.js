define(['PhysicsEntity', 'Border'], function(PhysicsEntity, Border){
    
    function CircleEntity(x, y, canvasHeight, radius, velocity){
        this._radius = radius;
        this._velocity = velocity;
        this.setPosition(x, y);
    }
    
    //inherit from PhysicsEntity
    CircleEntity.prototype = Object.create(PhysicsEntity.prototype);
    CircleEntity.prototype.constructor = CircleEntity; 
    
    CircleEntity.prototype.setPosition = function(newX, newY){
        this._x = newX;
        this._y = newY;
    }
    
    CircleEntity.prototype.update = function(){
        if(this._isInSimulation){            
            if(this._x <= Border.getLeftX()){
                this._x += 5;
                this._velocity[0] *= -1;
            }
            
            if(this._y >= Border.getTopY()){
                this._y -= 5;
                this._velocity[1] *= -1;
            }
            
            if(this._x + this._radius * 2 >= Border.getRightX()){
                this._x -= 5;
                this._velocity[0] *= -1;
            }
            
            if(this._y - this._radius * 2 <= Border.getBottomY()){
                this._y += 5;
                this._velocity[1] *= -1;
            }
            
            this._x += this._velocity[0];
            this._y += this._velocity[1];
        }
    }
    
    CircleEntity.prototype.setLinearVelocity = function(velX, velY){
        this._velocity = [velX, velY];
    }
    
    return CircleEntity;
});