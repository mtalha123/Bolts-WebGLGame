define(['Custom Utility/CircularHitBox', 'Custom Utility/distance', 'EventSystem', 'Custom Utility/Vector'], function(CircularHitBox, distance, EventSystem, Vector){
    
    function Link(gl, x1, y1, x2, y2, EffectsManager){
        this._handler = new EffectsManager.requestLinkHandler(false, gl, 10, x1, y1, x2, y2, EffectsManager);
        this.setCoords(x1, y1, x2, y2);
    }
    
    Link.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
        
            if(this._hitBox.isInRegion(mouseX, mouseY)){
                var currHitBoxPosition = this._hitBox.getPosition();
                var currHitBoxPosToMouse = (new Vector(currHitBoxPosition[0], currHitBoxPosition[1])).subtractFrom(new Vector(mouseX, mouseY));
                var projection = currHitBoxPosToMouse.projectOnto(this._dirVec);

                if(projection.hasSameDirection(this._dirVec)){
                    var newHitBoxPosition = (new Vector(currHitBoxPosition[0], currHitBoxPosition[1])).addTo(projection);
                    if( (this._startPosition.subtractFrom(newHitBoxPosition)).getMagnitude() >= this._lineLength){
                        this._handler.setCompletion(1.5); 
                        this.destroyAndReset();
                        return true;
                    }else{
                        this._hitBox.setPosition(newHitBoxPosition.getX(), newHitBoxPosition.getY());

                        var completion = distance(this._startPosition.getX(), this._startPosition.getY(), newHitBoxPosition.getX(), newHitBoxPosition.getY()) / this._lineLength;
                        this._handler.setCompletion(completion);   
                    }
                }
            }
        }
        
        return false;
    }
    
    Link.prototype.setCoords = function(x1, y1, x2, y2){
        this._dirVec = new Vector(x2 - x1, y2 - y1);
        this._lineLength = distance(x1, y1, x2, y2);
        this._startPosition = new Vector(x1, y1);
        this._endPosition = new Vector(x2, y2);
        this._hitBox = new CircularHitBox(x1, y1, 200, 1);
        this._handler.setCoords(x1, y1, x2, y2);
    }
    
    Link.prototype.destroyAndReset = function(){
        this._handler.doDestroyEffect(this._endPosition.getX(), this._endPosition.getY());
        this._hitBox.setPosition(this._startPosition.getX(), this._startPosition.getY());
        this._handler.setCompletion(0);
    }
    
    Link.prototype.spawn = function(){
        this._handler.shouldDraw(true);
    }
    
    Link.prototype.reset = function(){
        this._hitBox.setPosition(this._startPosition.getX(), this._startPosition.getY());
        this._handler.setCompletion(0);
        this._handler.shouldDraw(false);
    }
    
    Link.prototype.prepareForDrawing = function(){
        this._handler.update();
    }
    
    return Link;
});