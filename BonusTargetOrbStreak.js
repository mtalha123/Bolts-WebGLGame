define(['CirclePhysicsEntity', 'SynchronizedTimers', 'Entity', 'Custom Utility/CircularHitRegions', 'Custom Utility/distance'], function(CirclePhysicsEntity, SynchronizedTimers, Entity, CircularHitRegions, distance){

    function BonusTargetOrbStreakDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    BonusTargetOrbStreakDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    BonusTargetOrbStreakDestructionState.prototype.constructor = BonusTargetOrbStreakDestructionState; 
    
    
    function BonusTargetOrbStreakNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    BonusTargetOrbStreakNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    BonusTargetOrbStreakNormalState.prototype.constructor = BonusTargetOrbStreakNormalState;
    
    
    function BonusTargetOrbStreak(id, canvasWidth, canvasHeight, gl, p_radius, x, y, movementangle, speed, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x, y, p_radius);
        
        this._physicsEntity = new CirclePhysicsEntity(x, y, canvasHeight, p_radius + 10, [0, 0]);
        this._handler = EffectsManager.requestLightningOrbWithStreakEffect(false, gl, 20, x, y, {});
        
        this._normalState = new BonusTargetOrbStreakNormalState(this);
        this._destructionState = new BonusTargetOrbStreakDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._targetDistCovered = 0;
        this._startXInTarget = undefined;
        this._startYInTargetInTarget = undefined;
        this._targetAreaToAchieve = 228;
    }
    
    //inherit from Entity
    BonusTargetOrbStreak.prototype = Object.create(Entity.Entity.prototype);
    BonusTargetOrbStreak.prototype.constructor = BonusTargetOrbStreak;
    
    BonusTargetOrbStreak.prototype.getRadius = function(){
        return this._radius;
    }
    
    BonusTargetOrbStreak.prototype.setPosition = function(newX, newY){
        Entity.Entity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BonusTargetOrbStreak.prototype._setPositionWithInterpolation = function(newX, newY){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BonusTargetOrbStreak.prototype.setAchievementPercentage = function(percent){
        this._handler.increaseGlow(percent / 3.0);
    }
    
    BonusTargetOrbStreak.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseX, mouseY, callback){
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
                this._targetDistCovered = 0;
                Entity.Entity.prototype.destroyAndReset.call(this, callback);
                return true;
            }
        }else{
            this._startXInTarget = undefined;
            this._startYInTarget = undefined;
        }
        
        return false;
    }
    
    BonusTargetOrbStreak.prototype.setAchievementParameters = function(targetAreaToAchieve){
        this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    return BonusTargetOrbStreak;
    
});