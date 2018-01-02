define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'SliceAlgorithm', 'MainTargetsPositions'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, SliceAlgorithm, MainTargetsPositions){

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
    
    
    function BasicTarget(canvasWidth, canvasHeight, gl, p_radius, numbolts, position, movementangle, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, movementangle, speed);
        this._radius = p_radius;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, EffectsManager));
        
        this._physicsBody = new CirclePhysicsBody(position, canvasHeight, p_radius + (0.02 * canvasHeight), [0, 0]);
        this._handler = EffectsManager.requestBasicTargetEffect(false, gl, 2, position, {radius: [p_radius], fluctuation: [5]});  
        
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
    
    BasicTarget.prototype.setPosition = function(newPosition){
        MovingEntity.MovingEntity.prototype.setPosition.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype._setPositionWithInterpolation = function(newPosition){                
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
        
        MainTargetsPositions.updateTargetPosition(this, newPosition);
    }
    
    BasicTarget.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        MainTargetsPositions.removeTargetObj(this);
        this._hitBox.resetAlgorithm();
    }
    
    BasicTarget.prototype.spawn = function(callback){
        MainTargetsPositions.addTargetObj(this, this._position);
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