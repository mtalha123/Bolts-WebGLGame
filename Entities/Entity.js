define(['EventSystem'], function(EventSystem){
    
    function Entity(canvasWidth, canvasHeight, gl, position){       
        this._position = this._prevPosition = position; 
        this._hitBoxRegions = null;
        
        this._handler = null;
        this._alive = false;
        this._type = undefined; // type of Entity this is. This will be overridden by specific entities.
        this._scoreWorth = 1;
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._changeFunctionsToApplyNextSpawn = [];
        EventSystem.register(this.receiveEvent, "lightning_strike", this);
        EventSystem.register(this.receiveEvent, "game_level_up", this);
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
        this._alive = true;
        for(var i = 0; i < this._changeFunctionsToApplyNextSpawn.length; i++){
            this._changeFunctionsToApplyNextSpawn[i]();
        }
        this._changeFunctionsToApplyNextSpawn = [];
        callback();
    }
    
    Entity.prototype.reset = function(){
        this._handler.resetProperties();
        this._handler.shouldDraw(false);
        this._alive = false;
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
    
    Entity.prototype.getScoreWorth = function(){
        return this._scoreWorth;
    }
    
    Entity.prototype.receiveEvent = function(eventInfo){
        if(this._alive && eventInfo.eventType === "lightning_strike"){
            var startCoord = eventInfo.eventData.start;
            var endCoord = eventInfo.eventData.end;
            var closestPointOnLgStrike = startCoord.addTo(this._position.subtract(startCoord).projectOnto(endCoord.subtract(startCoord)));
            var dist = this._position.distanceTo(closestPointOnLgStrike);

            if(dist < eventInfo.eventData.width){
                this.destroyAndReset(function(){});
                EventSystem.publishEventImmediately("entity_destroyed_by_lightning_strike", {entity: this, type: this._type});
            }
        }
    }
    
    return {
        Entity: Entity
    };
});