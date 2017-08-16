define(['Border'], function(Border){
    
    function CircleEntity(x, y, canvasHeight, radius, velocity){
        this._radius = radius;
        this._velocity = velocity;
        this.setPosition(x, y);
        this._isInSimulation = false;
    }
    
    CircleEntity.prototype.setPosition = function(newX, newY){
        this._x = newX;
        this._y = newY;
    }
    
    CircleEntity.prototype.update = function(){          
        if( (this._x - this._radius) <= Border.getLeftX()){
            this._x += 5;
            this._velocity[0] *= -1;
        }

        if( (this._y + this._radius) >= Border.getTopY()){
            this._y -= 5;
            this._velocity[1] *= -1;
        }

        if( (this._x + this._radius) >= Border.getRightX()){
            this._x -= 5;
            this._velocity[0] *= -1;
        }

        if(this._y - this._radius <= Border.getBottomY()){
            this._y += 5;
            this._velocity[1] *= -1;
        }

        this._x += this._velocity[0];
        this._y += this._velocity[1];
    }
    
    CircleEntity.prototype.setLinearVelocity = function(velX, velY){
        this._velocity = [velX, velY];
    }
    
    CircleEntity.prototype.getX = function(){
        return this._x;
    }
    
    CircleEntity.prototype.getY = function(){
        return this._y;
    }
    
    return CircleEntity;
});