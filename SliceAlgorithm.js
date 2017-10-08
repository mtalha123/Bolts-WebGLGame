define(['Custom Utility/Vector', 'Custom Utility/distance'], function(Vector, distance){
    function SliceAlgorithm(x, y, radius){
        this._inputArray = [];   
        this._position = new Vector(x, y);
        this._radius = radius;
    }
    
    SliceAlgorithm.prototype.processInput = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
            
            this._inputArray.push(new Vector(mouseX, mouseY));
            if(this._inputArray.length > 4){
                this._inputArray.shift();
            }
        
            var lastIndex = this._inputArray.length - 1;
            var vec1 = this._position.subtractFrom(this._inputArray[0]);
            var vec2 = this._position.subtractFrom(this._inputArray[lastIndex]);
            if( (Math.PI - vec1.getAngleBetweenThisAnd(vec2)) <= (10 * (Math.PI / 180)) ){
                if(distance(this._inputArray[0].getX(), this._inputArray[0].getY(), this._inputArray[lastIndex].getX(), this._inputArray[lastIndex].getY()) >= this._radius * 2){
                    return true;    
                }
            }
        }else{
            this._inputArray = [];
        }
    }
    
    SliceAlgorithm.prototype.setPosition = function(x, y){
        this._position = new Vector(x, y);
    }
    
    SliceAlgorithm.prototype.reset = function(){
        this._inputArray = [];
    }
    
    return SliceAlgorithm;
});