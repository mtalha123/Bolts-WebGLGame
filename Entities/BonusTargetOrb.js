define(['SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBox', 'Custom Utility/Vector'], function(SynchronizedTimers, Entity, CircularHitBox, Vector){

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
        this._handler.setPosition(this._entity._position);
        this._handler.update();        
    }
    
    BonusTargetOrbNormalState.prototype.update = function(){ }
    
    
    function BonusTargetOrb(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);     
        
        this._radius = p_radius;
        this._hitBox = new CircularHitBox(position, p_radius * 1.5);
        
        this._handler = EffectsManager.requestLightningOrbEffect(false, gl, 20, position, {radius: [p_radius]});
        
        this._normalState = new BonusTargetOrbNormalState(this);
        this._destructionState = new BonusTargetOrbDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._charge = 0;
    }
    
    //inherit from Entity
    BonusTargetOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrb.prototype.constructor = BonusTargetOrb;
    
    BonusTargetOrb.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
    }
    
    BonusTargetOrb.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._hitBox.setPosition(newPosition);
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
            var mousePos = new Vector(mouseInputObj.x, mouseInputObj.y);
            
            if(this._hitBox.isInRegion(mousePos)){
                return true;
            }
        }
        
        return false;
    }
    
    return BonusTargetOrb;
    
});