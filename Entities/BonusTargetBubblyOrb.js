define(['CirclePhysicsEntity', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitRegions', 'Custom Utility/distance'], function(CirclePhysicsEntity, SynchronizedTimers, Entity, CircularHitRegions, distance){

    function BonusTargetBubblyOrbDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BonusTargetBubblyOrbDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BonusTargetBubblyOrbDestructionState.prototype.constructor = BonusTargetBubblyOrbDestructionState; 
    
    
    function BonusTargetBubblyOrbNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    BonusTargetBubblyOrbNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BonusTargetBubblyOrbNormalState.prototype.constructor = BonusTargetBubblyOrbNormalState;
    
    
    function BonusTargetBubblyOrb(id, canvasWidth, canvasHeight, gl, p_radius, x, y, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y);
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x, y, p_radius);
        
        this._handler = EffectsManager.requestBubblyOrbEffect(false, gl, 20, x, y, {});
        
        this._normalState = new BonusTargetBubblyOrbNormalState(this);
        this._destructionState = new BonusTargetBubblyOrbDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._targetDistCovered = 0;
        this._startXInTarget = undefined;
        this._startYInTargetInTarget = undefined;
        this._targetAreaToAchieve = 228;
        
        this._charge = 0;
    }
    
    //inherit from Entity
    BonusTargetBubblyOrb.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetBubblyOrb.prototype.constructor = BonusTargetBubblyOrb;
    
    BonusTargetBubblyOrb.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetBubblyOrb.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BonusTargetBubblyOrb.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BonusTargetBubblyOrb.prototype.setAchievementPercentage = function(percent){
        this._handler.increaseGlow(percent / 3.0);
    }
    
    BonusTargetBubblyOrb.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._targetDistCovered = 0;
        this._startXInTarget = undefined;
        this._startYInTarget = undefined;
    }
    
    BonusTargetBubblyOrb.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
        
            if(this.areCoordsInHitRegions(mouseX, mouseY)){
                if(!(this._startXInTarget && this._startYInTarget)){
                    this._startXInTarget = mouseX - this._x;;
                    this._startYInTarget = mouseY - this._y;;
                }

                var mouseXRelativeToTarget = mouseX - this._x;
                var mouseYRelativeToTarget = mouseY - this._y;
                this._targetDistCovered += distance(this._startXInTarget, this._startYInTarget, mouseXRelativeToTarget, mouseYRelativeToTarget);

                this.setAchievementPercentage(this._targetDistCovered / this._targetAreaToAchieve);

                this._startXInTarget = mouseXRelativeToTarget;
                this._startYInTarget = mouseYRelativeToTarget;

                if(this._targetDistCovered >= this._targetAreaToAchieve){
                    Entity.Entity.prototype.destroyAndReset.call(this, callback);
                    return true;
                }
            }else{
                this._startXInTarget = undefined;
                this._startYInTarget = undefined;
            }
        }
        
        return false;
    }
    
    BonusTargetBubblyOrb.prototype.setAchievementParameters = function(targetAreaToAchieve){
        this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    return BonusTargetBubblyOrb;
    
});