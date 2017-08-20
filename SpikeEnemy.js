define(['CirclePhysicsEntity', 'SynchronizedTimers', 'Entity', 'Custom Utility/CircularHitRegions', 'Custom Utility/distance', 'Custom Utility/Vector'], function(CirclePhysicsEntity, SynchronizedTimers, Entity, CircularHitRegions, distance, Vector){

    function SpikeEnemyDestructionState(targetHandler){
        Entity.EntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from EntityDestructionState
    SpikeEnemyDestructionState.prototype = Object.create(Entity.EntityDestructionState.prototype);
    SpikeEnemyDestructionState.prototype.constructor = SpikeEnemyDestructionState; 
    
    
    function SpikeEnemyNormalState(target){
        Entity.EntityNormalState.call(this, target);
    }
    
    //inherit from EntityNormalState
    SpikeEnemyNormalState.prototype = Object.create(Entity.EntityNormalState.prototype);
    SpikeEnemyNormalState.prototype.constructor = SpikeEnemyNormalState;
    
    SpikeEnemyNormalState.prototype.update = function(){ 
        if(distance(this._entity._x, this._entity._y, this._entity._destination.getX(), this._entity._destination.getY()) > this._entity._radius * 1.3){
            var newX = this._entity._x + this._entity._velocity.getX();
            var newY = this._entity._y + this._entity._velocity.getY();
            this._entity._setPositionWithInterpolation(newX, newY);   
        }else{
            this._entity._prevX = this._entity._x;
            this._entity._prevY = this._entity._y;
        }
    }
    
    
    function SpikeEnemy(id, canvasWidth, canvasHeight, gl, p_radius, x, y, speed, EffectsManager){
        Entity.Entity.call(this, id, canvasWidth, canvasHeight, gl, x, y, 0, speed);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBoxRegions = new CircularHitRegions(x, y);
        this._hitBoxRegions.addRegion(x, y, p_radius * 2.8);
        
        this._handler = EffectsManager.requestEnemySpikeEffect(false, gl, 20, x, y, {});
        
        this._normalState = new SpikeEnemyNormalState(this);
        this._destructionState = new SpikeEnemyDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._destination = new Vector(0, 0);
        this._velocity = ((new Vector(-x, -y)).getNormalized()).multiplyWithScalar(speed);
        
        this._inputArray = [];
    }
    
    //inherit from Entity
    SpikeEnemy.prototype = Object.create(Entity.Entity.prototype);
    SpikeEnemy.prototype.constructor = SpikeEnemy;
    
    SpikeEnemy.prototype.getRadius = function(){
        return this._radius;
    }
    
    SpikeEnemy.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._hitBoxRegions.setPosition(newX, newY);
    }
    
    SpikeEnemy.prototype._setPositionWithInterpolation = function(newX, newY){
        var posDiff = new Vector(newX - this._x, newY - this._y);        
        this._inputArray = this._inputArray.map(function(currValue){
            currValue.addTo(posDiff);
            return currValue;
        });
        
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBoxRegions.setPosition(newX, newY);
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
    
    SpikeEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseX, mouseY, callback){
        if(this.areCoordsInHitRegions(mouseX, mouseY)){
            this._inputArray.push(new Vector(mouseX, mouseY));
            if(this._inputArray.length > 8){
                this._inputArray.shift();
            }
    
            
            var lastIndex = this._inputArray.length - 1;
            if(distance(this._inputArray[0].getX(), this._inputArray[0].getY(), this._inputArray[lastIndex].getX(), this._inputArray[lastIndex].getY()) >= this._radius * 2){
                var achieved = true;
                this._inputArray.map(function(val, index, array){
                    var startToCurr = array[0].subtractFrom(val);
                    var startToLast = array[0].subtractFrom(array[array.length-1]);
                    var projection = startToCurr.projectOnto(startToLast);
                    var pointOnLine = array[0].addTo(projection);
                    var dist = distance(val.getX(), val.getY(), pointOnLine.getX(), pointOnLine.getY());
                    
                    if(dist >= 15){
                        achieved = false;
                    }
                });
                if(achieved){
                    this.destroyAndReset(callback);
                    return true;   
                }
            }
        }else{
            this._inputArray = [];
        }
        
        return false;
    }
    
    SpikeEnemy.prototype.setAchievementParameters = function(targetAreaToAchieve){
    //    this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    SpikeEnemy.prototype.unfocus = function(targetAreaToAchieve){
        this._inputArray = [];
    }
    
    SpikeEnemy.prototype.setDestination = function(x, y){
        this._destination = new Vector(x, y);
        this._velocity = ((new Vector(x - this._x, y - this._y)).getNormalized()).multiplyWithScalar(this._speed);
    }
    
    return SpikeEnemy;
    
});