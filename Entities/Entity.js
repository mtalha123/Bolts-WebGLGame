define([], function(){
    
    function Entity(canvasWidth, canvasHeight, gl, position){       
        this._position = this._prevPosition = position; 
        this._hitBoxRegions = null;
        
        this._handler = null;
    }
    
    Entity.prototype.prepareForDrawing = function(interpolation){
        this._handler.update();
    }
    
    Entity.prototype.update = function(){ } 
    
    Entity.prototype.setPosition = function(newPosition){
        this._position = this._prevPosition = newPosition; 
        this._handler.setPosition(newPosition);
    }
    
    Entity.prototype._setPositionWithInterpolation = function(newPosition){
        this._prevPosition = this._position;
        this._position = newPosition;
        
        this._handler.setPosition(newPosition);
    }
    
    Entity.prototype.getPosition = function(){
        return this._position;
    }
    
    Entity.prototype.spawn = function(callback){
        this._handler.doSpawnEffect(this._position);
        callback();
    }
    
    Entity.prototype.reset = function(){
        this._handler.resetProperties();
        this._handler.shouldDraw(false);
    }
    
    Entity.prototype.destroyAndReset = function(callback){        
        this._handler.doDestroyEffect(this._position, function(){
            callback();
        }.bind(this));
        
        this.reset();
    }
    
    Entity.prototype.areCoordsInHitRegions = function(checkPosition){
        return this._hitBoxRegions.isInAnyRegion(checkPosition);
    }
    
    Entity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    return {
        Entity: Entity
    };
});