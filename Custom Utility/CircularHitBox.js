define(['Custom Utility/distance', 'Custom Utility/rotateCoord', 'Custom Utility/Vector'], function(distance, rotateCoord, Vector){
    function CircularHitBox(centerPosition, radius, label){
        this._centerPosition = centerPosition;
        this._radius = radius;
        this._label = label;
    }
    
    CircularHitBox.prototype.isInRegion = function(checkPosition){
        if( this._centerPosition.distanceTo(checkPosition) <= this._radius ){
            return true;
        }
        
        return false;
    }
    
    CircularHitBox.prototype.setPosition = function(newPosition){
        this._centerPosition = newPosition;
    }
    
    CircularHitBox.prototype.getPosition = function(){
        return this._centerPosition;
    }
    
    CircularHitBox.prototype.getLabel = function(){
        return this._label;
    }
    
    return CircularHitBox;
});