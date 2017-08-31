define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitRegions', 'Custom Utility/distance'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitRegions, distance){

    function BasicTargetDestructionState(targetHandler){
        MovingEntity.MovingEntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from MovingEntityDestructionState
    BasicTargetDestructionState.prototype = Object.create(MovingEntity.MovingEntityDestructionState.prototype);
    BasicTargetDestructionState.prototype.constructor = BasicTargetDestructionState; 
    
    
    function BasicTargetNormalState(target){
        MovingEntity.MovingEntityNormalState.call(this, target);
    }
    
    //inherit from MovingEntityNormalState
    BasicTargetNormalState.prototype = Object.create(MovingEntity.MovingEntityNormalState.prototype);
    BasicTargetNormalState.prototype.constructor = BasicTargetNormalState;
    
    
    function BasicTarget(id, canvasWidth, canvasHeight, gl, p_radius, numbolts, x, y, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._radius = p_radius;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x, y, p_radius);
        
        this._physicsBody = new CirclePhysicsBody(x, y, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, x, y, {radius: [p_radius], fluctuation: [5]});  
        
        this._normalState = new BasicTargetNormalState(this);
        this._destructionState = new BasicTargetDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._targetDistCovered = 0;
        this._startXInTarget = undefined;
        this._startYInTargetInTarget = undefined;
        this._targetAreaToAchieve = 228;
    }
    
    //inherit from MovingEntity
    BasicTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    BasicTarget.prototype.setPosition = function(newX, newY){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newX, newY){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    BasicTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._targetDistCovered = 0;
        this._startXInTarget = undefined;
        this._startYInTarget = undefined;
    }
    
    BasicTarget.prototype.setAchievementPercentage = function(percent){
        if(percent >= 0.75){
            this._handler.setNumBolts(7);
        }else if(percent >= 0.50){
            this._handler.setNumBolts(6);
        }
    
        this._handler.increaseLgGlowFactor(percent / 2.0);
    }
    
    BasicTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(mouseInputObj.type === "moquse_down" || mouseInputObj.type === "mouse_held_down"){
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
                    MovingEntity.MovingEntity.prototype.destroyAndReset.call(this, callback);
                    return true;
                }
            }else{
                this._startXInTarget = undefined;
                this._startYInTarget = undefined;
            }
        }
        
        return false;
    }
    
    BasicTarget.prototype.setAchievementParameters = function(targetAreaToAchieve){
        this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    return BasicTarget;
    
});