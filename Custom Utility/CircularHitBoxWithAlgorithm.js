define(['Custom Utility/distance', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'Custom Utility/CircularHitBox'], function(distance, rotateCoord, Vector, CircularHitBox){
    function CircularHitBoxWithAlgorithm(centerX, centerY, radius, algorithm, label){
        CircularHitBox.call(this, centerX, centerY, radius, label);
        this._centerX = centerX;
        this._centerY = centerY;
        this._radius = radius;
        this.activated = true;
        this._achievementAlgorithm = algorithm;
    }
    
    CircularHitBoxWithAlgorithm.prototype = Object.create(CircularHitBox.prototype);
    CircularHitBoxWithAlgorithm.prototype.constructor = CircularHitBoxWithAlgorithm;
    
    CircularHitBoxWithAlgorithm.prototype.setPosition = function(newX, newY){
        CircularHitBox.prototype.setPosition.call(this, newX, newY);
        
        this._achievementAlgorithm.setPosition(newX, newY);
    }
    
    CircularHitBoxWithAlgorithm.prototype.processInput = function(mouseInputObj){
        if(this.activated){
            if(this._achievementAlgorithm.processInput(mouseInputObj)){
                return true;   
            }   
        }
        
        return false;
    }
    
    CircularHitBoxWithAlgorithm.prototype.resetAlgorithm = function(){
        this._achievementAlgorithm.reset();
    }
    
    return CircularHitBoxWithAlgorithm;
});