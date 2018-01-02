define([], function(){

    function EntityDestructionState(handler){
        this._handler = handler;
    }
    
    EntityDestructionState.prototype.prepareForDrawing = function(){
        this._handler.update();
    }

    EntityDestructionState.prototype.update = function(){ }
    
    EntityDestructionState.prototype.startDestruction = function(callback, position){
        this._handler.doDestroyEffect(position, callback);
    }
    
    
    function EntityNormalState(entity){
        this._entity = entity;
        this._handler = entity._handler;
    }
    
    EntityNormalState.prototype.prepareForDrawing = function(){
        this._handler.update();        
    }

    EntityNormalState.prototype.update = function(){ }
    
    
    function Entity(canvasWidth, canvasHeight, gl, position){       
        this._position = this._prevPosition = position; 
        this._hitBoxRegions = null;
        this._charge = 1;
        
        this._handler = null;
        
        this._normalState = null;
        this._destructionState = null;
        this._currentState = this._normalState;
    }
    
    Entity.prototype.prepareForDrawing = function(interpolation){
        this._currentState.prepareForDrawing(interpolation);
    }
    
    Entity.prototype.update = function(){        
        this._currentState.update();
    } 
    
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
        this._currentState = this._normalState;
    }
    
    Entity.prototype.setAchievementPercentage = function(percent){
        //override
    }
    
    Entity.prototype.destroyAndReset = function(callback){
        this._currentState = this._destructionState;
        
        this._currentState.startDestruction(function(){
            this.reset();
            callback();
        }.bind(this), this._position);
    }
    
    Entity.prototype.areCoordsInHitRegions = function(checkPosition){
        return this._hitBoxRegions.isInAnyRegion(checkPosition);
    }
    
    Entity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    Entity.prototype.getCharge = function(){
        return this._charge;
    }
    
    return {
        Entity: Entity,
        EntityNormalState: EntityNormalState,
        EntityDestructionState: EntityDestructionState
    };
});