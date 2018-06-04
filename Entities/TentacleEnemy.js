define(['CirclePhysicsBody', 'SynchronizedTimers', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'SliceAlgorithm', 'MainTargetsPositions', 'Custom Utility/getQuadrant'], function(CirclePhysicsBody, SynchronizedTimers, Entity, CircularHitBoxWithAlgorithm, Vector, EventSystem, SliceAlgorithm, MainTargetsPositions, getQuadrant){  
    
    function TentacleEnemy(canvasWidth, canvasHeight, gl, p_radius, position, EffectsManager){
        Entity.Entity.call(this, canvasWidth, canvasHeight, gl, position);
        this._radius = p_radius;
        this._currentMovementAngleInDeg = null;
        this._hitBox = new CircularHitBoxWithAlgorithm(position, p_radius, new SliceAlgorithm(position, p_radius, gl, canvasHeight, EffectsManager));
        
        this._handler = EffectsManager.requestTentacleEnemyHandler(false, gl, 20, position, {});
        
        this._numCapturedEntities = 0;
        this._maxNumCaptureEntities = 4;
        this._numSlicesNeeded = 4;
        this._numTimesSliced = 0;
        
        //first one represents top right tentacle, second one represents top left tentacle, etc. 0 = doesn't hold lg, 1 = holds lg
        this._listTentaclesHoldLg = [0, 0, 0, 0];
        //same as above: first one represents entity held in top right tentacle, second one represents entity held in top left tentacle, etc.
        this._listEntitiesCaptured = [undefined, undefined, undefined, undefined]; 
        //same as above in terms of which position represents which tentacle
        this._listTentaclesAlive = [1, 1, 1, 1];
    }
    
    //inherit from Entity
    TentacleEnemy.prototype = Object.create(Entity.Entity.prototype);
    TentacleEnemy.prototype.constructor = TentacleEnemy;
    
    TentacleEnemy.prototype.getRadius = function(){
        return this._radius;
    }
    
    TentacleEnemy.prototype.setPosition = function(newPosition){
        Entity.Entity.prototype.setPosition.call(this, newPosition);
        this._hitBox.setPosition(newPosition);
    }
    
    TentacleEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.Entity.prototype._setPositionWithInterpolation.call(this, newPosition);
        
        this._hitBox.setPosition(newPosition);
    }
    
    TentacleEnemy.prototype.reset = function(){
        Entity.Entity.prototype.reset.call(this);
        this._numCapturedEntities = 0;
        this._numTimesSliced = 0;
        this._numSlicesNeeded = 4;
        this._hitBox.resetAlgorithm();
    } 
    
    TentacleEnemy.prototype.spawn = function(callback){
        Entity.Entity.prototype.spawn.call(this, callback);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "enemy"});
    } 
    
    TentacleEnemy.prototype.update = function(){
        var allTargetObjs = MainTargetsPositions.getAllTargetObjs();

        for(var i = 0; i < allTargetObjs.length; i++){
            if(this._numCapturedEntities >= this._maxNumCaptureEntities){
                break;
            }

            if(this._position.distanceTo(allTargetObjs[i].position) <= (this._radius * 4)){
                var quadOfEntity = getQuadrant(allTargetObjs[i].position, this._position);
                if((this._listTentaclesHoldLg[quadOfEntity - 1] === 1) || this._listTentaclesAlive[quadOfEntity-1] == 0){
                    break;
                }

                this._listTentaclesHoldLg[quadOfEntity - 1] = 1;
                this._listEntitiesCaptured[quadOfEntity - 1] = allTargetObjs[i].target;
                this._numCapturedEntities++;
                this._numSlicesNeeded += 2;
                this._handler.doTentacleGrab(allTargetObjs[i].position, quadOfEntity);
                this._handler.setYellowColorPrefs(this._listTentaclesHoldLg);

                EventSystem.publishEventImmediately("entity_captured", {entity: allTargetObjs[i].target, capture_type: "destroy"});
            }
        }
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
            if(this._listTentaclesAlive[3] === 0){
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "enemy"});
                this.destroyAndReset(callback);
                return true;
            }
        }
        
        return false;
    }
    
    return TentacleEnemy;
});