define(['Custom Utility/Vector', 'Custom Utility/rotateCoord'], function(Vector, rotateCoord){
    function SliceAlgorithm(position, radius, gl, canvasHeight, EffectsManager, AudioManager){
        this._inputArray = [];   
        this._position = position;
        this._radius = radius;
        this._handler = EffectsManager.requestLightningEffect(false, gl, 80, {lineWidth: [0.5], glowFactor: [7], spikedLgBool: [1.0], boltColor: [1.0, 0.0, 0.4], glowColor: [1.0, 0.1, 0.3], fluctuation: [35]}, [0, 0, 100, 100]);
        this._degreeLeeway = 55;
        this._maxDist = canvasHeight * 0.7;
        this._straightArrowHandler = EffectsManager.requestStraightArrowHandler(false, gl, 200, canvasHeight * 0.5, {});
        this._sliceSoundEffect = AudioManager.getAudioHandler("achievement_algorithm_sound_effect");
    }
    
    SliceAlgorithm.prototype.processInput = function(mouseInputObj){        
        for(var a = 0; a < mouseInputObj.length; a++){
            if(mouseInputObj[a].type === "left_mouse_down" || mouseInputObj[a].type === "left_mouse_held_down"){
                this._inputArray.push(new Vector(mouseInputObj[a].x, mouseInputObj[a].y));
            }else{
                this._inputArray = [];
            }
        }
        
        if(this._inputArray.length){            
            while(this._inputArray.length > 6){
                this._inputArray.shift();
            }
            var lastIndex = this._inputArray.length - 1;
            
            if(this._inputArray[0].distanceTo(this._inputArray[lastIndex]) >= this._maxDist){
                this._inputArray = [];
                return false;
            }
            
            var vec1 = this._inputArray[0].subtract(this._position);
            var vec2 = this._inputArray[lastIndex].subtract(this._position);
            if( vec1.getAngleBetweenThisAnd(vec2) >= (Math.PI - (this._degreeLeeway * (Math.PI / 180)) )){
                if(this._inputArray[0].distanceTo(this._inputArray[lastIndex]) >= this._radius * 2.0){
                    var coordsForBolt = this._getCoordsForSliceBolt();
                    this._handler.setLightningCoords([coordsForBolt[0].getX(), coordsForBolt[0].getY(), coordsForBolt[1].getX(), coordsForBolt[1].getY()]);
                    this._handler.doDisappearEffect();
                    this._sliceSoundEffect.play();
                    this._inputArray = [];
                    return true;    
                }
            }
        }
    }
    
    SliceAlgorithm.prototype.setPosition = function(newPosition){
        this._position = newPosition;
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