define(['SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBox'], function(SynchronizedTimers, Entity, CircularHitBox){

    function BonusTargetOrbDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BonusTargetOrbDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BonusTargetOrbDestructionState.prototype.constructor = BonusTargetOrbDestructionState; 
    
    
    function BonusTargetOrbNormalState(target){
        this._entity = target;
        this._handler = target._handler;
    }
    
    //inherit from EntityNormalState
    BonusTargetOrbNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BonusTargetOrbNormalState.prototype.constructor = BonusTargetOrbNormalState;
    
    
    BonusTargetOrbNormalState.prototype.prepareForDrawing = function(interpolation){
        this._handler.setPosition(this._entity._x, this._entity._y);
        this._handler.update();        
    }
    
    BonusTargetOrbNormalState.prototype.update = function(){ }
    
    
    function BonusTargetOrb(id, canvasWidth, canvasHeight, gl, p_radius, x, y, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y);
        this._id = id;       
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        
        this._radius = p_radius;
        this._hitBox = new CircularHitBox(x, y, p_radius);
        
        this._handler = EffectsManager.requestLightningOrbEffect(false, gl, 20, x, y, {radius: [p_radius]});
        
        this._normalState = new BonusTargetOrbNormalState(this);
        this._destructionState = new BonusTargetOrbDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._charge = 0;
    }
    
    //inherit from Entity
    BonusTargetOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrb.prototype.constructor = BonusTargetOrb;
    
    BonusTargetOrb.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._hitBox.setPosition(newX, newY);
        this._handler.setPosition(newX, newY);
    }
    
    BonusTargetOrb.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
    }
    
    BonusTargetOrb.prototype.turnOnLightning = function(){ 
        this._handler.turnOnLightning();
    }
        
    BonusTargetOrb.prototype.turnOffLightning = function(){ 
        this._handler.turnOffLightning();
    }
   
    BonusTargetOrb.prototype.destroyAndReset = function(callback){
        Entity.Entity.prototype.destroyAndReset.call(this, callback);
        this._handler.turnOffLightning();
    }
    
    
    BonusTargetOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
            
            if(this._hitBox.isInRegion(mouseX, mouseY)){
                return true;
            }
        }
        
        return false;
    }
    
    return BonusTargetOrb;
    
});