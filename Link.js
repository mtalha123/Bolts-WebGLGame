define(['Custom Utility/CircularHitBox', 'EventSystem', 'Custom Utility/Vector'], function(CircularHitBox, EventSystem, Vector){
    
    function Link(gl, startPos, endPos, EffectsManager){
        this._handler = new EffectsManager.requestLinkHandler(false, gl, 10, startPos, endPos, EffectsManager);
        this.setCoords(startPos, endPos);
    }
    
    Link.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mousePos = new Vector(mouseInputObj.x, mouseInputObj.y);
            
            if(this._hitBox.isInRegion(mousePos)){
                var currHitBoxPosition = this._hitBox.getPosition();
                var currHitBoxPosToMouse = currHitBoxPosition.subtractFrom(mousePos);
                var projection = currHitBoxPosToMouse.projectOnto(this._dirVec);

                if(projection.hasSameDirection(this._dirVec)){
                    var newHitBoxPosition = currHitBoxPosition.addTo(projection);
                    if( (this._startPosition.subtractFrom(newHitBoxPosition)).getMagnitude() >= this._lineLength){
                        this._handler.setCompletion(1.5); 
                        this.destroyAndReset();
                        return true;
                    }else{
                        this._hitBox.setPosition(newHitBoxPosition);

                        var completion = this._startPosition.distanceTo(newHitBoxPosition) / this._lineLength;
                        this._handler.setCompletion(completion);   
                    }
                }
            }
        }
        
        return false;
    }
    
    Link.prototype.setCoords = function(startPos, endPos){
        this._dirVec = startPos.subtractFrom(endPos);
        this._lineLength = startPos.distanceTo(endPos);
        this._startPosition = startPos;
        this._endPosition = endPos;
        this._hitBox = new CircularHitBox(startPos, 200, 1);
        this._handler.setCoords(startPos, endPos);
    }
    
    Link.prototype.destroyAndReset = function(){
        this._handler.doDestroyEffect(this._endPosition);
        this._hitBox.setPosition(this._startPosition);
        this._handler.setCompletion(0);
    }
    
    Link.prototype.spawn = function(){
        this._handler.shouldDraw(true);
    }
    
    Link.prototype.reset = function(){
        this._hitBox.setPosition(this._startPosition);
        this._handler.setCompletion(0);
        this._handler.shouldDraw(false);
    }
    
    Link.prototype.prepareForDrawing = function(){
        this._handler.update();
    }
    
    return Link;
});