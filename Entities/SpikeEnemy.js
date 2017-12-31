define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/distance', 'Custom Utility/Vector', 'EventSystem', 'CoverDistanceAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, distance, Vector, EventSystem, CoverDistanceAlgorithm){

    function SpikeEnemyDestructionState(targetHandler){
        MovingEntity.MovingEntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from MovingEntityDestructionState
    SpikeEnemyDestructionState.prototype = Object.create(MovingEntity.MovingEntityDestructionState.prototype);
    SpikeEnemyDestructionState.prototype.constructor = SpikeEnemyDestructionState; 
    
    
    function SpikeEnemyNormalState(target){
        MovingEntity.MovingEntityNormalState.call(this, target);
    }
    
    //inherit from MovingEntityNormalState
    SpikeEnemyNormalState.prototype = Object.create(MovingEntity.MovingEntityNormalState.prototype);
    SpikeEnemyNormalState.prototype.constructor = SpikeEnemyNormalState;
    
    SpikeEnemyNormalState.prototype.update = function(){ 
        if(distance(this._entity._x, this._entity._y, this._entity._destination.getX(), this._entity._destination.getY()) > this._entity._radius * 1.3){
            var newX = this._entity._x + this._entity._velocity.getX();
            var newY = this._entity._y + this._entity._velocity.getY();
            this._entity._setPositionWithInterpolation(newX, newY);   
        }else{
            this._entity._prevX = this._entity._x;
            this._entity._prevY = this._entity._y;
            
            if(this._entity._lightningStealTimer.getTime() >= 2000){
                if(this._entity._charge < this._entity._maxCharge){
                    this._entity._charge++;
                }
                this._entity._handler.setNumBolts(this._entity._charge);
                EventSystem.publishEventImmediately("lightning_stolen", {amount: 1})
                this._entity._lightningStealTimer.reset();
                this._entity._lightningStealTimer.start();
            }
        }
    }
    
    
    function SpikeEnemy(canvasWidth, canvasHeight, gl, p_radius, x, y, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, x, y, 0, speed);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBox = new CircularHitBoxWithAlgorithm(x, y, p_radius, new CoverDistanceAlgorithm(x, y, p_radius, canvasHeight * 0.25));
        
        this._handler = EffectsManager.requestEnemySpikeEffect(false, gl, 20, x, y, {});
        
        this._normalState = new SpikeEnemyNormalState(this);
        this._destructionState = new SpikeEnemyDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._destination = new Vector(0, 0);
        this._velocity = ((new Vector(-x, -y)).getNormalized()).multiplyWithScalar(speed);
        
        this._charge = 0;
        this._maxCharge = 5;
        
        this._lightningStealTimer = SynchronizedTimers.getTimer();
    }
    
    //inherit from MovingEntity
    SpikeEnemy.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    SpikeEnemy.prototype.constructor = SpikeEnemy;
    
    SpikeEnemy.prototype.getRadius = function(){
        return this._radius;
    }
    
    SpikeEnemy.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._hitBox.setPosition(newX, newY);
    }
    
    SpikeEnemy.prototype._setPositionWithInterpolation = function(newX, newY){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
    }
    
    SpikeEnemy.prototype.setAchievementPercentage = function(percent){
//        if(percent >= 0.75){
//            this._handler.setNumBolts(7);
//        }else if(percent >= 0.50){
//            this._handler.setNumBolts(6);
//        }
//    
//        this._handler.increaseLgGlowFactor(percent / 2.0);
    }
    
    SpikeEnemy.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._lightningStealTimer.reset();
        this._charge = 0;
        this._hitBox.resetAlgorithm();
    } 
    
    SpikeEnemy.prototype.spawn = function(callback){
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
        this._lightningStealTimer.start();
    } 
    
    SpikeEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            this.destroyAndReset(callback);
            return true;
        };
        
        return false;
    }
    
    SpikeEnemy.prototype.setAchievementParameters = function(targetAreaToAchieve){
    //    this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    SpikeEnemy.prototype.setDestination = function(x, y){
        this._destination = new Vector(x, y);
        this._velocity = ((new Vector(x - this._x, y - this._y)).getNormalized()).multiplyWithScalar(this._speed);
    }
    
    return SpikeEnemy;
    
});