define(['Custom Utility/Vector', 'Custom Utility/distance'], function(Vector, distance){
    function SliceAlgorithm(x, y, radius, gl, EffectsManager){
        this._inputArray = [];   
        this._position = new Vector(x, y);
        this._radius = radius;
        this._handler = EffectsManager.requestLightningEffect(false, gl, 80, {lineWidth: [0.5], glowFactor: [7], spikedLgBool: [1.0], boltColor: [1.0, 0.0, 0.4], glowColor: [1.0, 0.1, 0.3], fluctuation: [35]}, [0, 0, 100, 100], false);
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
                    var coordsForBolt = this._getCoordsForSliceBolt();
                    this._handler.setLightningCoords([coordsForBolt[0].getX(), coordsForBolt[0].getY(), coordsForBolt[1].getX(), coordsForBolt[1].getY()]);
                    this._handler.doDisappearEffect();
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
    
    SliceAlgorithm.prototype._getCoordsForSliceBolt = function(){
        var coord1 = this._position.addTo(this._position.subtractFrom(this._inputArray[0]).getNormalized().multiplyWithScalar(this._radius * 2));
        var coord2 = this._position.addTo(this._position.subtractFrom(this._inputArray[this._inputArray.length-1]).getNormalized().multiplyWithScalar(this._radius * 3));
        
        return [coord1, coord2];
    }
    
    return SliceAlgorithm;
});