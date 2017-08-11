define(['CircleEntity', 'SynchronizedTimers'], function(CircleEntity, SynchronizedTimers){

    function TargetDestructionState(targetHandler){
        this._targetHandler = targetHandler;
        this._timer = SynchronizedTimers.getTimer();
        this._callback = null;
    }
    
    TargetDestructionState.prototype.draw = function(){
        if(this._timer.getTime() >= 2000){
            this._timer.reset();
            this._callback();
        }
        this._targetHandler.update();
    }

    TargetDestructionState.prototype.update = function(){ }
    
    TargetDestructionState.prototype.startDestruction = function(callback, x, y){
        this._timer.start();
        this._targetHandler.doDestroyEffect(x, y);
        this._callback = callback;
    }
    
    
    function TargetNormalState(target){
        this._target = target;
        this._targetHandler = target._targetHandler;
        this._physicsEntity = target._physicsEntity;
    }
    
    TargetNormalState.prototype.draw = function(interpolation){
        this._targetHandler.setPosition( this._target._prevX + (interpolation * (this._target._x - this._target._prevX)), this._target._prevY + (interpolation * (this._target._y - this._target._prevY)) );
        this._targetHandler.update();        
    }

    TargetNormalState.prototype.update = function(){
        this._physicsEntity.update();        
        this._target._setXWithInterpolation(this._physicsEntity.getX());
        this._target._setYWithInterpolation(this._physicsEntity.getY());        
    }
    
    
    function Target(id, canvasWidth, canvasHeight, gl, p_radius, numbolts, x, y, movementangle, speed, spawnDurationTime, EffectsManager){
        this._id = id;
        this._radius = p_radius;        
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        this._spawnDurationTime = spawnDurationTime;
        this._spawnDurationTimer = SynchronizedTimers.getTimer();
        
        this._physicsEntity = new CircleEntity("dynamic", x, y, canvasHeight, p_radius + 10, 1, 0, 1);
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed; 
        
        this._targetHandler = EffectsManager.requestTargetEffect(false, gl, 2, x, y, {radius: [p_radius], fluctuation: [5]});  
       // this._targetHandler.setCompletion(1);
        
        this._normalState = new TargetNormalState(this);
        this._destructionState = new TargetDestructionState(this._targetHandler);
        this._currentState = this._normalState;
    }
    
    Target.prototype.draw = function(interpolation){
        this._currentState.draw(interpolation);
    }
    
    Target.prototype.update = function(){        
        this._currentState.update();
    } 
    
    Target.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._physicsEntity.setPosition(newX, newY);
    }
    
    Target.prototype._setXWithInterpolation = function(newX){
        this._prevX = this._x;
        this._x = newX;
    }
    
    Target.prototype._setYWithInterpolation = function(newY){
        this._prevY = this._y;
        this._y = newY;
    }
    
    Target.prototype.doSpawnEffect = function(callback){
        this._targetHandler.doSpawnEffect(this._x, this._y);
        callback();
    }
    
    Target.prototype.getX = function(){
        return this._x;
    }
    
    Target.prototype.getY = function(){
        return this._y;
    }
    
    Target.prototype.setMovementAngle = function(newAngle){
        this._currentMovementAngleInDeg = newAngle;
        this._xUnits = Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._yUnits = Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._physicsEntity.setLinearVelocity(this._xUnits, this._yUnits);
    }
    
    Target.prototype.getMovementAngle = function(){
        return this._currentMovementAngleInDeg;
    }
    
    Target.prototype.getRadius = function(){
        return this._radius;
    }
    
    Target.prototype.getId = function(){
        return this._id;
    }
    
    Target.prototype.addToPhysicsSimulation = function(){
        this._physicsEntity.addToSimulation();
        this._targetHandler.shouldDraw(true);
    }
    
    Target.prototype.removeFromPhysicsSimulation = function(){
        this._physicsEntity.removeFromSimulation();
        this._targetHandler.shouldDraw(false);
    }
    
    Target.prototype.setAchievementPercentage = function(percent){
        if(percent >= 0.75){
            this._targetHandler.setNumBolts(7);
        }else if(percent >= 0.50){
            this._targetHandler.setNumBolts(6);
        }
    
        this._targetHandler.increaseLgGlowFactor(percent / 2.0);
    }
    
    Target.prototype.destroyAndReset = function(callback){
        this._currentState = this._destructionState;
        
        this._currentState.startDestruction(function(){
            this._targetHandler.resetProperties();
            this._currentState = this._normalState;
            callback();
        }.bind(this), this._x, this._y);
    }
    
    return Target;
    
});