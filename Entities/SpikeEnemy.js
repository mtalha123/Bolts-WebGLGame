define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'RingAlgorithm'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, Vector, EventSystem, RingAlgorithm){
    
    function SpikeEnemy(canvasWidth, canvasHeight, gl, p_radius, position, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, position, 0, speed);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius * 1.5, new RingAlgorithm(position, p_radius * 2, canvasHeight * 0.2, gl, EffectsManager));
        
        this._handler = EffectsManager.requestEnemySpikeEffect(false, gl, 20, position, {});
        this._particlesHandler = EffectsManager.requestBasicParticleEffect(false, gl, 25, 30, position, {FXType: [2], maxLifetime: [100], radiusOfSource: [canvasHeight * 0.02], particlesColor: [1.0, 1.0, 0.7]});
        this._particlesHandler.setTimeIncrementor(6);
                
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
        this._particlesHandler.setPosition(newPosition);
    }
    
    SpikeEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
        this._particlesHandler.setPosition(newPosition);
    }
    
    SpikeEnemy.prototype.destroyAndReset = function(callback){
        MovingEntity.MovingEntity.prototype.destroyAndReset.call(this, callback);
        this._particlesHandler.reset();
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
    
    SpikeEnemy.prototype.prepareForDrawing = function(interpolation){
        MovingEntity.MovingEntity.prototype.prepareForDrawing.call(this, interpolation);
        this._hitBox.prepareForDrawing();
        this._particlesHandler.update();
    }
    
    SpikeEnemy.prototype.update = function(){
        if(this._position.distanceTo(this._destination) > this._radius * 2.0){
            var newPos = this._position.addTo(this._velocity);
            this._setPositionWithInterpolation(newPos);   
        }else{
            this._particlesHandler.shouldDraw(true);
            this._particlesHandler.setDestinationForParticles(this._position);
            this._particlesHandler.setPosition(this._destination);
            this._prevPosition = this._position;
            
            if(this._lightningStealTimer.getTime() >= 2000){
                if(this._charge < this._maxCharge){
                    this._charge++;
                    EventSystem.publishEventImmediately("lightning_stolen");
                    this._handler.setNumBolts(this._charge);
                }
                this._lightningStealTimer.reset();
                this._lightningStealTimer.start();
            }
        }
    }
    
    SpikeEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            if(this._charge > 0){
                this._charge--;
                this._handler.setNumBolts(this._charge);
                EventSystem.publishEventImmediately("lightning_returned");
            }else{
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "enemy"});
                this.destroyAndReset(callback);
                return true;
            }
        }
        
        return false;
    }
    
    SpikeEnemy.prototype.setDestination = function(destPosition){
        this._destination = destPosition;
        this._velocity = ((destPosition.subtract(this._position)).getNormalized()).multiplyWithScalar(this._speed);
    }
    
    return SpikeEnemy;
    
});