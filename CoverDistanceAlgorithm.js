define(['Custom Utility/Vector', 'Custom Utility/distance'], function(Vector, distance){
    function CoverDistanceAlgorithm(x, y, radius, areaToAchieve){
        this._x = x;
        this._y = y;
        this._radius = radius;
        this._distCovered = 0;
        this._startX = undefined;
        this._startY = undefined;
        this._areaToAchieve = areaToAchieve;
    }
    
    CoverDistanceAlgorithm.prototype.processInput = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
        
            if(distance(this._x, this._y, mouseX, mouseY) <= this._radius){
                if(!(this._startX && this._startY)){
                    this._startX = mouseX - this._x;;
                    this._startY = mouseY - this._y;;
                }

                var mouseXRelative = mouseX - this._x;
                var mouseYRelative = mouseY - this._y;
                this._distCovered += distance(this._startX, this._startY, mouseXRelative, mouseYRelative);

                this._startX = mouseXRelative;
                this._startY = mouseYRelative;

                if(this._distCovered >= this._areaToAchieve){
                    return true;
                }
            }else{
                this._startX = undefined;
                this._startY = undefined;
            }
        }
    }
    
    CoverDistanceAlgorithm.prototype.setPosition = function(x, y){
        this._x = x;
        this._y = y;
    }
    
    CoverDistanceAlgorithm.prototype.getPercentageDone = function(){
        return this._distCovered / this._areaToAchieve;
    }
    
    CoverDistanceAlgorithm.prototype.reset = function(){
        this._distCovered = 0;
        this._startX = undefined;
        this._startY = undefined;
    }
    
    return CoverDistanceAlgorithm;
});