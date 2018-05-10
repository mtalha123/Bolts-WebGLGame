define(['Border', 'Custom Utility/Vector', 'Custom Utility/rotateCoord'], function(Border, Vector, rotateCoord){
    
    function CirclePhysicsBody(position, canvasHeight, radius, velocity){
        this._radius = radius;
        this._velocity = velocity;
        this.setPosition(position);
        this._isInSimulation = false;
        
        this._isInOrbit = false;
        this._orbitCenter = undefined;
        this._orbitRadius = undefined;
    }
    
    CirclePhysicsBody.prototype.setPosition = function(newPosition){
        this._isInOrbit = false;
        this._position = newPosition;
    }
    
    CirclePhysicsBody.prototype.update = function(){     
        if(!this._isInOrbit){
            if( (this._position.getX() - this._radius) <= Border.getLeftX()){
                this._position.setCoords(this._position.getX() + 5, this._position.getY());
                this._velocity.setCoords(this._velocity.getX() * -1, this._velocity.getY());;
            }

            if( (this._position.getY() + this._radius) >= Border.getTopY()){
                this._position.setCoords(this._position.getX(), this._position.getY() - 5);
                this._velocity.setCoords(this._velocity.getX(), this._velocity.getY() * -1);;
            }

            if( (this._position.getX() + this._radius) >= Border.getRightX()){
                this._position.setCoords(this._position.getX() - 5, this._position.getY());
                this._velocity.setCoords(this._velocity.getX() * -1, this._velocity.getY());;
            }

            if(this._position.getY() - this._radius <= Border.getBottomY()){
                this._position.setCoords(this._position.getX(), this._position.getY() + 5);
                this._velocity.setCoords(this._velocity.getX(), this._velocity.getY() * -1);;
            }

            this._position = this._position.addTo(this._velocity);
        }else{
            var angleIncrement = this._velocity.getMagnitude() / this._orbitRadius; // Get from Arc Length = radius * theta formula, where theta is angle in radians.
            this._position = rotateCoord(this._position, angleIncrement, this._orbitCenter);  
        }
    }
    
    CirclePhysicsBody.prototype.setLinearVelocity = function(velocity){
        this._velocity = velocity;
    }
    
    CirclePhysicsBody.prototype.setToOrbit = function(orbitCenter, orbitRadius){
        this._isInOrbit = true;
        this._orbitCenter = orbitCenter;
        this._orbitRadius = orbitRadius;
    }
    
    CirclePhysicsBody.prototype.isInOrbit = function(){
        return this._isInOrbit;
    }
    
    CirclePhysicsBody.prototype.getPosition = function(){
        return this._position;
    }
    
    return CirclePhysicsBody;
});