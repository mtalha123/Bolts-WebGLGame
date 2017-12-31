define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/MovingEntity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/distance', 'Custom Utility/Vector', 'EventSystem', 'SliceAlgorithm', 'MainTargetsPositions'], function(CirclePhysicsBody, SynchronizedTimers, MovingEntity, CircularHitBoxWithAlgorithm, distance, Vector, EventSystem, SliceAlgorithm, MainTargetsPositions){

    function getQuadrant(point, center){        
        var angle;
        var point_t = center.subtractFrom(point);
    
        if(point_t.getX() == 0.0){
            if(point_t.getY() >= 0.0){
                angle = 90.0;
            }

            if(point_t.getY() < 0.0){
                angle = -90.0;
            }
        }

        angle = Math.atan2(point_t.getY(), point_t.getX());
        //convert to degrees
        angle *= (180 / Math.PI);

        if(angle < 0.0){
            angle = 180.0 + (180.0 - Math.abs(angle));
        }
        
        angle = parseInt(angle.toString());
        
        if(angle >= 0 && angle <= 90){
            return 1;
        }else if(angle >= 90 && angle < 180){
            return 2;
        }else if(angle >= 180 && angle < 270){
            return 3;            
        }else if(angle >= 270 && angle <= 360){
            return 4;           
        }    
    }
    
    function TentacleEnemyDestructionState(targetHandler){
        MovingEntity.MovingEntityDestructionState.call(this, targetHandler);
    }
    
    //inherit from MovingEntityDestructionState
    TentacleEnemyDestructionState.prototype = Object.create(MovingEntity.MovingEntityDestructionState.prototype);
    TentacleEnemyDestructionState.prototype.constructor = TentacleEnemyDestructionState; 
    
    
    function TentacleEnemyNormalState(target){
        MovingEntity.MovingEntityNormalState.call(this, target);
    }
    
    //inherit from MovingEntityNormalState
    TentacleEnemyNormalState.prototype = Object.create(MovingEntity.MovingEntityNormalState.prototype);
    TentacleEnemyNormalState.prototype.constructor = TentacleEnemyNormalState;
    
    TentacleEnemyNormalState.prototype.update = function(){ 
        var allTargetObjs = MainTargetsPositions.getAllTargetObjs();
        
        for(var i = 0; i < allTargetObjs.length; i++){
            if(this._entity._charge >= this._entity._maxCharge){
                break;
            }
            
            if(allTargetObjs[i].target.getCharge() === 1 && 
               ((new Vector(this._entity._x, this._entity._y)).distanceTo(allTargetObjs[i].position) <= (this._entity._radius * 4))){
                var quadOfEntity = getQuadrant(allTargetObjs[i].position, new Vector(this._entity._x, this._entity._y));
                if((this._entity._listTentaclesHoldLg[quadOfEntity - 1] === 1) || this._entity._listTentaclesAlive[quadOfEntity-1] == 0){
                    break;
                }
                
                this._entity._listTentaclesHoldLg[quadOfEntity - 1] = 1;
                this._entity._listEntitiesCaptured[quadOfEntity - 1] = allTargetObjs[i].target;
                this._entity._charge += allTargetObjs[i].target.getCharge();
                this._entity._numSlicesNeeded += 2;
                this._entity._handler.doTentacleGrab(allTargetObjs[i].position, quadOfEntity);
                this._entity._handler.setYellowColorPrefs(this._entity._listTentaclesHoldLg);
                
                EventSystem.publishEventImmediately("entity_captured", {entity: allTargetObjs[i].target});
            }
        }
    }
    
    
    function TentacleEnemy(canvasWidth, canvasHeight, gl, p_radius, x, y, speed, EffectsManager){
        MovingEntity.MovingEntity.call(this, canvasWidth, canvasHeight, gl, x, y, 0, speed);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBox = new CircularHitBoxWithAlgorithm(x, y, p_radius, new SliceAlgorithm(x, y, p_radius, gl, EffectsManager));
        
        this._handler = EffectsManager.requestTentacleEnemyHandler(false, gl, 20, x, y, {});
        
        this._normalState = new TentacleEnemyNormalState(this);
        this._destructionState = new TentacleEnemyDestructionState(this._handler);
        this._currentState = this._normalState;
        
        this._charge = 0;
        this._maxCharge = 4;
        this._numSlicesNeeded = 4;
        this._numTimesSliced = 0;
        
        //first one represents top right tentacle, second one represents top left tentacle, etc. 0 = doesn't hold lg, 1 = holds lg
        this._listTentaclesHoldLg = [0, 0, 0, 0];
        //same as above: first one represents entity held in top right tentacle, second one represents entity held in top left tentacle, etc.
        this._listEntitiesCaptured = [undefined, undefined, undefined, undefined]; 
        //same as above in terms of which position represents which tentacle
        this._listTentaclesAlive = [1, 1, 1, 1];
    }
    
    //inherit from MovingEntity
    TentacleEnemy.prototype = Object.create(MovingEntity.MovingEntity.prototype);
    TentacleEnemy.prototype.constructor = TentacleEnemy;
    
    TentacleEnemy.prototype.getRadius = function(){
        return this._radius;
    }
    
    TentacleEnemy.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._hitBox.setPosition(newX, newY);
    }
    
    TentacleEnemy.prototype._setPositionWithInterpolation = function(newX, newY){
        MovingEntity.MovingEntity.prototype._setPositionWithInterpolation.call(this, newX, newY);
        
        this._hitBox.setPosition(newX, newY);
    }
    
    TentacleEnemy.prototype.reset = function(){
        MovingEntity.MovingEntity.prototype.reset.call(this);
        this._charge = 0;
        this._numTimesSliced = 0;
        this._numSlicesNeeded = 4;
        this._hitBox.resetAlgorithm();
    } 
    
    TentacleEnemy.prototype.spawn = function(callback){
        MovingEntity.MovingEntity.prototype.spawn.call(this, callback);
    } 
    
    TentacleEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitBox.processInput(mouseInputObj)){
            this._hitBox.resetAlgorithm();
            this._numTimesSliced++;
            
            var indexOfFirstAliveTentacle = this._listTentaclesAlive.indexOf(1);
            
            if(this._listTentaclesHoldLg[indexOfFirstAliveTentacle] === 1){
                if(this._numTimesSliced === 2){
                    this._listTentaclesHoldLg[indexOfFirstAliveTentacle] = 0;
                    this._listTentaclesAlive[indexOfFirstAliveTentacle] = 0;
                    this._handler.tentaclesToShowPrefs(this._listTentaclesAlive);
                    this._numSlicesNeeded -= 2;
                    this._numTimesSliced = 0;
                    EventSystem.publishEventImmediately("captured_entity_destroyed", {entity: this._listEntitiesCaptured[indexOfFirstAliveTentacle]})
                }
            }else{
                this._listTentaclesAlive[indexOfFirstAliveTentacle] = 0;
                this._handler.tentaclesToShowPrefs(this._listTentaclesAlive);
                this._numSlicesNeeded -= 2;
                this._numTimesSliced = 0;
            }
            
            //check if last tentacle is alive. If so, destroy and reset
            if(this._listTentaclesAlive[3] === 0)
            {
                this.destroyAndReset(callback);
                return true;
            }
        };
        
        return false;
    }
    
    return TentacleEnemy;
});