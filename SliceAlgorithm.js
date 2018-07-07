define(['Custom Utility/Vector', 'Custom Utility/rotateCoord'], function(Vector, rotateCoord){
    function SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager){
        this._inputArray = [];   
        this._position = position;
        this._radius = radius;
        this._handler = EffectsManager.requestLightningEffect(false, gl, 80, {lineWidth: [0.5], glowFactor: [7], spikedLgBool: [1.0], boltColor: [1.0, 0.0, 0.4], glowColor: [1.0, 0.1, 0.3], fluctuation: [35]}, [0, 0, 100, 100]);
        this._degreeLeeway = 30;
        this._maxDist = canvasHeight * 0.5;
//        this._lineSegmentHandlerForTutorial = EffectsManager.requestLineSegmentHandler(false, gl, 200, rotateCoord(position.addTo(new Vector(radius * 3, 0)), Math.PI / 4, position),
        this._straightArrowHandler = EffectsManager.requestStraightArrowHandler(false, gl, 200, 500, {});
        this._sliceSoundEffect = AudioManager.getAudioHandler("achievement_algorithm_sound_effect");
    }
    
    SliceAlgorithm.prototype.processInput = function(mouseInputObj){
        if(mouseInputObj.type === "left_mouse_down" || mouseInputObj.type === "left_mouse_held_down"){
            var mousePos = new Vector(mouseInputObj.x, mouseInputObj.y);
            
            this._inputArray.push(mousePos);
            if(this._inputArray.length >= 5){
                this._inputArray.shift();
            }
        
            var lastIndex = this._inputArray.length - 1;
            
            if(this._inputArray[0].distanceTo(this._inputArray[lastIndex]) >= this._maxDist){
                this._inputArray = [];
                return false;
            }
            
            var vec1 = this._inputArray[0].subtract(this._position);
            var vec2 = this._inputArray[lastIndex].subtract(this._position);
            if( (Math.PI - vec1.getAngleBetweenThisAnd(vec2)) <= (this._degreeLeeway * (Math.PI / 180)) ){
                if(this._inputArray[0].distanceTo(this._inputArray[lastIndex]) >= this._radius * 1.5){
                    var coordsForBolt = this._getCoordsForSliceBolt();
                    this._handler.setLightningCoords([coordsForBolt[0].getX(), coordsForBolt[0].getY(), coordsForBolt[1].getX(), coordsForBolt[1].getY()]);
                    this._handler.doDisappearEffect();
                    this._sliceSoundEffect.play();
                    return true;    
                }
            }
        }else{
            this._inputArray = [];
        }
    }
    
    SliceAlgorithm.prototype.setPosition = function(newPosition){
        this._position = newPosition;
//        this._lineSegmentHandlerForTutorial.setCoords(rotateCoord(newPosition.addTo(new Vector(this._radius * 3, 0)), Math.PI / 4, newPosition),
//                                                      rotateCoord(newPosition.addTo(new Vector(this._radius * 3, 0)), Math.PI + (Math.PI / 4), newPosition));
        this._straightArrowHandler.setPosition(newPosition);
    }
    
    SliceAlgorithm.prototype.reset = function(){
        this._inputArray = [];
    }
    
    SliceAlgorithm.prototype._getCoordsForSliceBolt = function(){
        var coord1 = this._position.addTo(this._inputArray[0].subtract(this._position).getNormalized().multiplyWithScalar(this._radius * 2));
        var coord2 = this._position.addTo(this._inputArray[this._inputArray.length-1].subtract(this._position).getNormalized().multiplyWithScalar(this._radius * 3));
        
        return [coord1, coord2];
    } 
    
    SliceAlgorithm.prototype.doTutorial = function(){   
        this._straightArrowHandler.doSliceEffect(700, 2);
    }
    
    SliceAlgorithm.prototype.cancelTutorial = function(){   
        this._straightArrowHandler.cancelSliceEffect();
    }
    
    return SliceAlgorithm;
});