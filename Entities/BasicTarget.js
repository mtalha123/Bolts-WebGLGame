define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/distance', 'Custom Utility/Vector', 'SliceAlgorithm', 'MainTargetsPositions'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, distance, Vector, SliceAlgorithm, MainTargetsPositions){

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
    
    
    function BasicTarget(canvasWidth, canvasHeight, gl, p_radius, numbolts, x, y, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, x, y, movementangle, speed);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(x, y, p_radius, new SliceAlgorithm(x, y, p_radius, gl, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(x, y, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, x, y, {radius: [p_radius], fluctuation: [5]});  
        
        this._normalState = new BasicTargetNormalState(this);
        this._destructionState = new BasicTargetDestructionState(this._handler);
        this._currentState = this._normalState;
    }
    
    //inherit from MovingEntity
    BasicTarget.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    BasicTarget.prototype.constructor = BasicTarget;
    
    BasicTarget.prototype.getRadius = function(){
        return this._radius;
    }
    
    BasicTarget.prototype.setPosition = function(newX, newY){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
        
        MainTargetsPositions.updateTargetPosition(this, new Vector(newX, newY));
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newX, newY){                
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
        
        MainTargetsPositions.updateTargetPosition(this, new Vector(newX, newY));
    }
    
    BasicTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitBox.resetAlgorithm();
    }
    
    BasicTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, new Vector(this._x, this._y));
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    }
    
    BasicTarget.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){       
        if(this._hitBox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            return true;
        };
    }
    
    return BasicTarget;
    
});