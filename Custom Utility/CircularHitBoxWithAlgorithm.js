define(['Custom Utility/rotateCoord', 'Custom Utility/Vector', 'Custom Utility/CircularHitBox'], function(rotateCoord, Vector, CircularHitBox){
    function CircularHitBoxWithAlgorithm(centerPosition, radius, algorithm, label){
        CircularHitBox.call(this, centerPosition, radius, label);
        this.activated = true;
        this._achievementAlgorithm = algorithm;
    }
    
    CircularHitBoxWithAlgorithm.prototype = Object.create(CircularHitBox.prototype);
    CircularHitBoxWithAlgorithm.prototype.constructor = CircularHitBoxWithAlgorithm;
    
    CircularHitBoxWithAlgorithm.prototype.setPosition = function(newPosition){
        CircularHitBox.prototype.setPosition.call(this, newPosition);
        
        this._achievementAlgorithm.setPosition(newPosition);
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
    
    CircularHitBoxWithAlgorithm.prototype.prepareForDrawing = function(interpolation){
        this._achievementAlgorithm.prepareForDrawing(interpolation);
    }
    
    CircularHitBoxWithAlgorithm.prototype.doTutorial = function(){
        this._achievementAlgorithm.doTutorial();
    }
    
    return CircularHitBoxWithAlgorithm;
});