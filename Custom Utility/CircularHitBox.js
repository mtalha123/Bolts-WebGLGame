define(['Custom Utility/distance', 'Custom Utility/rotateCoord', 'Custom Utility/Vector', 'SliceAlgorithm'], function(distance, rotateCoord, Vector, SliceAlgorithm){
    function CircularHitBox(centerX, centerY, radius, label){
        this._centerX = centerX;
        this._centerY = centerY;
        this._radius = radius;
        this._label = label;
    }
    
    CircularHitBox.prototype.isInRegion = function(checkX, checkY){
        if( distance(checkX, checkY, this._centerX, this._centerY) <= this._radius ){
            return true;
        }
        
        return false;
    }
    
    CircularHitBox.prototype.setPosition = function(newX, newY){
        this._centerX = newX;
        this._centerY = newY;
    }
    
    CircularHitBox.prototype.getPosition = function(){
        var x = this._centerX;
        var y = this._centerY;
        return [x, y];
    }
    
    CircularHitBox.prototype.getLabel = function(){
        return this._label;
    }
    
    return CircularHitBox;
});