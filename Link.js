define(['Custom Utility/CircularHitRegions', 'Custom Utility/distance', 'EventSystem', 'Custom Utility/Vector'], function(CircularHitRegions, distance, EventSystem, Vector){
    
    function Link(gl, x1, y1, x2, y2, EffectsManager){
        this._handler = new EffectsManager.requestLinkHandler(false, gl, 30, x1, y1, x2, y2, EffectsManager);
        this.setCoords(x1, y1, x2, y2);
    }
    
    Link.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseX, mouseY){
        var possibleHitBox = this._hitBoxRegions.isInAnyRegion(mouseX, mouseY);
        if(possibleHitBox){
            var currHitBoxPosition = this._hitBoxRegions.getPosition();
            var currHitBoxPosToMouse = (new Vector(currHitBoxPosition[0], currHitBoxPosition[1])).subtractFrom(new Vector(mouseX, mouseY));
            var projection = currHitBoxPosToMouse.projectOnto(this._dirVec);
            
            if(projection.hasSameDirection(this._dirVec)){
                var newHitBoxPosition = (new Vector(currHitBoxPosition[0], currHitBoxPosition[1])).addTo(projection);
                if( (this._startPosition.subtractFrom(newHitBoxPosition)).getMagnitude() >= this._lineLength){
                    this._handler.setCompletion(1.5); 
                    this.destroyAndReset();
                    return true;
                }else{
                    this._hitBoxRegions.setPosition(newHitBoxPosition.getX(), newHitBoxPosition.getY());

                    var completion = distance(this._startPosition.getX(), this._startPosition.getY(), newHitBoxPosition.getX(), newHitBoxPosition.getY()) / this._lineLength;
                    this._handler.setCompletion(completion);   
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
        this._hitBoxRegions = new CircularHitRegions(x1, y1);
        this._hitBoxRegions.addRegion(x1, y1, 150);
        this._handler.setCoords(x1, y1, x2, y2);
    }
    
    Link.prototype.destroyAndReset = function(){
        this._handler.doDestroyEffect(this._endPosition.getX(), this._endPosition.getY());
        this._hitBoxRegions.setPosition(this._startPosition.getX(), this._startPosition.getY());
        this._handler.setCompletion(0);
    }
    
    Link.prototype.spawn = function(){
        this._handler.shouldDraw(true);
    }
    
    Link.prototype.prepareForDrawing = function(){
        this._handler.update();
    }
    
    return Link;
});