define(['EntityController', 'SynchronizedTimers'], function(EntityController, SynchronizedTimers){

    function EntityDestructionState(handler){
        this._handler = handler;
        this._timer = SynchronizedTimers.getTimer();
        this._callback = null;
    }
    
    EntityDestructionState.prototype.draw = function(){
        if(this._timer.getTime() >= 2000){
            this._timer.reset();
            this._callback();
        }
        this._handler.update();
    }

    EntityDestructionState.prototype.update = function(){ }
    
    EntityDestructionState.prototype.startDestruction = function(callback, x, y){
        this._timer.start();
        this._handler.doDestroyEffect(x, y);
        this._callback = callback;
    }
    
    
    function EntityNormalState(entity){
        this._entity = entity;
        this._handler = entity._handler;
        this._physicsEntity = entity._physicsEntity;
    }
    
    EntityNormalState.prototype.draw = function(interpolation){
        this._handler.setPosition( this._entity._prevX + (interpolation * (this._entity._x - this._entity._prevX)), this._entity._prevY + (interpolation * (this._entity._y - this._entity._prevY)) );
        this._handler.update();        
    }

    EntityNormalState.prototype.update = function(){
        this._physicsEntity.update();        
        this._entity._setPositionWithInterpolation(this._physicsEntity.getX(), this._physicsEntity.getY());      
    }
    
    
    function Entity(id, canvasWidth, canvasHeight, gl, x, y, movementangle, speed){
        this._id = id;       
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        this._hitBoxRegions = null;
        
        this._physicsEntity = null;//new CircleEntity("dynamic", x, y, canvasHeight, p_radius + 10, 1, 0, 1);
        
        this._currentMovementAngleInDeg = movementangle;
        this._speed = speed;
        this._xUnits = Math.cos(movementangle * (Math.PI / 180)) * speed;
        this._yUnits = Math.sin(movementangle * (Math.PI / 180)) * speed; 
        
        this._handler = null;
        
        this._normalState = null;
        this._destructionState = null;
        this._currentState = this._normalState;
    }
    
    Entity.prototype.draw = function(interpolation){
        this._currentState.draw(interpolation);
    }
    
    Entity.prototype.update = function(){        
        this._currentState.update();
    } 
    
    Entity.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._physicsEntity.setPosition(newX, newY);
    }
    
    Entity.prototype._setPositionWithInterpolation = function(newX, newY){
        this._prevX = this._x;
        this._x = newX;
        
        this._prevY = this._y;
        this._y = newY;
    }
    
    Entity.prototype.doSpawnEffect = function(callback){
        this._handler.doSpawnEffect(this._x, this._y);
        callback();
    }
    
    Entity.prototype.getX = function(){
        return this._x;
    }
    
    Entity.prototype.getY = function(){
        return this._y;
    }
    
    Entity.prototype.setMovementAngle = function(newAngle){
        this._currentMovementAngleInDeg = newAngle;
        this._xUnits = Math.cos(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._yUnits = Math.sin(this._currentMovementAngleInDeg * (Math.PI / 180)) * this._speed;
        this._physicsEntity.setLinearVelocity(this._xUnits, this._yUnits);
    }
    
    Entity.prototype.getMovementAngle = function(){
        return this._currentMovementAngleInDeg;
    }
    
    Entity.prototype.getId = function(){
        return this._id;
    }
    
    Entity.prototype.addToPhysicsSimulation = function(){
        this._physicsEntity.addToSimulation();
        this._handler.shouldDraw(true);
    }
    
    Entity.prototype.removeFromPhysicsSimulation = function(){
        this._physicsEntity.removeFromSimulation();
        this._handler.shouldDraw(false);
    }
    
    Entity.prototype.setAchievementPercentage = function(percent){
        //override
    }
    
    Entity.prototype.resetVisual = function(){
        this._handler.resetProperties();
    }
    
    Entity.prototype.destroyAndReset = function(callback){
        this._currentState = this._destructionState;
        
        this._currentState.startDestruction(function(){
            this._handler.resetProperties();
            this._currentState = this._normalState;
            callback();
        }.bind(this), this._x, this._y);
    }
    
    Entity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitBoxRegions.isInAnyRegion(checkX, checkY);
    }
    
    return {
        Entity: Entity,
        EntityNormalState: EntityNormalState,
        EntityDestructionState: EntityDestructionState
    };
});