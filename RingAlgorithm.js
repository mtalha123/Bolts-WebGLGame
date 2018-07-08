define(['Custom Utility/Vector', 'Custom Utility/getQuadrant'], function(Vector, getQuadrant){
    var NUM_QUADRANTS = 4;
    var CLOCKWISE = "CW";
    var COUNTER_CLOCKWISE = "CCW";
    
    function RingAlgorithm(position, radius, regionThickness, gl, EffectsManager, AudioManager){
        this._inputArray = [];   
        this._position = position;
        this._radius = radius;
        this._regionThickness = regionThickness;
        
        this._possibleRoute1 = undefined;
        this._possibleRoute2 = undefined;
        this._currRouteActive = undefined;
        this._currentActiveQuad = undefined;
        this._handler = EffectsManager.requestRingLightning(true, gl, 80, position, {radius: [radius]});
        this._circleArrowHandler = EffectsManager.requestCircleArrowHandler(false, gl, 80, 300, {});
        this._ringSoundEffect = AudioManager.getAudioHandler("achievement_algorithm_sound_effect");
    }
    
    RingAlgorithm.prototype.processInput = function(mouseInputObj){
        if(mouseInputObj.type === "left_mouse_down" || mouseInputObj.type === "left_mouse_held_down"){
            var mousePos = new Vector(mouseInputObj.x, mouseInputObj.y);
            
            // Determine if inside region
            var magnitude = (mousePos.subtract(this._position)).getMagnitude();
            if( (magnitude < (this._radius - (this._regionThickness / 2))) ||  (magnitude > (this._radius + (this._regionThickness / 2))) ){
                this.reset();
                return;
            }
            
            var quadOfMousePos = getQuadrant(mousePos, this._position);               
            if(quadOfMousePos === this._currentActiveQuad){
                // Mouse is in same quadrant... maybe do some timer stuff here
                return;
            }
            
            this._currentActiveQuad = quadOfMousePos;
            
            this._handler.activateQuad(quadOfMousePos);
            this._handler.shouldDraw(true);
                        
            if(!this._possibleRoute1){
                this._possibleRoute1 = this._getRoute(quadOfMousePos, CLOCKWISE);
                this._possibleRoute2 = this._getRoute(quadOfMousePos, COUNTER_CLOCKWISE);
            }else if(!this._currRouteActive){
                if(quadOfMousePos === this._possibleRoute1[0]){
                    this._currRouteActive = this._possibleRoute1;
                    this._currRouteActive.shift();
                }else if(quadOfMousePos === this._possibleRoute2[0]){
                    this._currRouteActive = this._possibleRoute2;
                    this._currRouteActive.shift();
                }else{
                    this.reset();
                }
            }else{                
                if(quadOfMousePos === this._currRouteActive[0]){
                    this._currRouteActive.shift();
                    
                    if(this._currRouteActive.length === 0){
                        this._ringSoundEffect.play();
                        this.reset();
                        return true;
                    }
                }else{
                    this.reset();
                }
            }          
        }
    }
    
    RingAlgorithm.prototype.setPosition = function(newPosition){
        this._position = newPosition;
        this._handler.setPosition(newPosition);
        this._circleArrowHandler.setPosition(newPosition);
    }
    
    RingAlgorithm.prototype.reset = function(){
        this._currRouteActive = undefined;
        this._possibleRoute1 = undefined;
        this._possibleRoute2 = undefined;
        this._currentActiveQuad = undefined;
        this._handler.shouldDraw(false);
        this._handler.unActivateQuads();
    }
    
    RingAlgorithm.prototype._getRoute = function(quadOfPoint, direction){
        var returnArray = [];
        
        if(direction === COUNTER_CLOCKWISE){
            for(var i = 0; i < NUM_QUADRANTS; i++){
                quadOfPoint++;
                if(quadOfPoint === 5){
                    quadOfPoint = 1;
                }
                returnArray.push(quadOfPoint);
            }
        }else{
            for(var i = 0; i < NUM_QUADRANTS; i++){
                quadOfPoint--;
                if(quadOfPoint === 0){
                    quadOfPoint = 4;
                }
                returnArray.push(quadOfPoint);
            }
        }
        
        return returnArray;
    }
    
    RingAlgorithm.prototype.prepareForDrawing = function(){
        this._handler.update();
    }   
    
    RingAlgorithm.prototype.doTutorial = function(){
        this._circleArrowHandler.doCirclingArrowEffect(800, 2);
    }
    
    return RingAlgorithm;
});