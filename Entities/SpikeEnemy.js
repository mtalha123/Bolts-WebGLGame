define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'CoverDistanceAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, EventSystem, CoverDistanceAlgorithm){
    
    function SpikeEnemy(canvasWidth, canvasHeight, gl, p_radius, position, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, 0, speed);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new CoverDistanceAlgorithm(position, p_radius, canvasHeight * 0.25));
        
        this._handler = EffectsManager.requestEnemySpikeEffect(false, gl, 20, position, {});
                
        this._destination = new Vector(0, 0);
        this._velocity = (position.multiplyWithScalar(-1).getNormalized()).multiplyWithScalar(speed);
        
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
    
    SpikeEnemy.prototype.setPosition = function(newPosition){
        this._position = this._prevPosition = newPosition; 
        this._handler.setPosition(newPosition);
        this._hitBox.setPosition(newPosition);
    }
    
    SpikeEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
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
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "enemy"});
    } 
    
    SpikeEnemy.prototype.update = function(){
        if(this._position.distanceTo(this._destination) > this._radius * 1.3){
            var newPos = this._position.addTo(this._velocity);
            this._setPositionWithInterpolation(newPos);   
        }else{
            this._prevPosition = this._position;
            
            if(this._lightningStealTimer.getTime() >= 2000){
                if(this._charge < this._maxCharge){
                    this._charge++;
                }
                this._handler.setNumBolts(this._charge);
                EventSystem.publishEventImmediately("lightning_stolen", {amount: 1})
                this._lightningStealTimer.reset();
                this._lightningStealTimer.start();
            }
        }
    }
    
    SpikeEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "enemy"});
            this.destroyAndReset(callback);
            return true;
        }
        
        return false;
    }
    
    SpikeEnemy.prototype.setAchievementParameters = function(targetAreaToAchieve){
    //    this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    SpikeEnemy.prototype.setDestination = function(destPosition){
        this._destination = destPosition;
        this._velocity = ((destPosition.subtract(this._position)).getNormalized()).multiplyWithScalar(this._speed);
    }
    
    return SpikeEnemy;
    
});