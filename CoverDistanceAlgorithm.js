define(['Custom Utility/Vector', 'Custom Utility/distance'], function(Vector, distance){
    function CoverDistanceAlgorithm(position, radius, areaToAchieve){
        this._position = position;
        this._radius = radius;
        this._distCovered = 0;
        this._startPos = undefined;
        this._areaToAchieve = areaToAchieve;
    }
    
    CoverDistanceAlgorithm.prototype.processInput = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mousePos = new Vector(mouseInputObj.x, mouseInputObj.y);
        
            if(this._position.distanceTo(mousePos) <= this._radius){
                if(!this._startPos){
                    this._startPos = mousePos.subtract(this._position);
                }

                var mousePosRelative = mousePos.subtract(this._position);
                this._distCovered += this._startPos.distanceTo(mousePos);

                this._startPos = this._startPos.addTo(mousePos);

                if(this._distCovered >= this._areaToAchieve){
                    return true;
                }
            }else{
                this._startPos = undefined;
            }
        }
    }
    
    CoverDistanceAlgorithm.prototype.setPosition = function(newPosition){
        this._position = newPosition;
    }
    
    CoverDistanceAlgorithm.prototype.getPercentageDone = function(){
        return this._distCovered / this._areaToAchieve;
    }
    
    CoverDistanceAlgorithm.prototype.reset = function(){
        this._distCovered = 0;
        this._startPos = undefined;
    }
    
    return CoverDistanceAlgorithm;
});