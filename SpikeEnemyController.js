define(['SpikeEnemy', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController', 'Custom Utility/distance'], function(SpikeEnemy, SynchronizedTimers, Border, Random, EventSystem, EntityController, distance){
    
    function SpikeEnemyController(gl, appMetaData, EffectsManager){
        EntityController.EntityController.call(this); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        this._canvasWidth = appMetaData.getCanvasWidth();
        this._canvasHeight = appMetaData.getCanvasHeight();

        for(var i = 0; i < 2; i++){
            this._entitiesPool[i] = new SpikeEnemy(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 5, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    SpikeEnemyController.prototype = Object.create(EntityController.EntityController.prototype);
    SpikeEnemyController.prototype.constructor = SpikeEnemyController;
    
    SpikeEnemyController.prototype._spawn = function(){
        var spawnX = Random.getRandomInt(0.2 * this._canvasWidth, 0.7 * this._canvasWidth);
        var spawnY = Random.getRandomInt(0.3 * this._canvasHeight, 0.7 * this._canvasHeight);
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        var distances = [];
        distances.push( distance(spawnX, spawnY, Border.getRightX(), spawnY) );
        distances.push( distance(spawnX, spawnY, spawnX, Border.getBottomY()) );
        distances.push( distance(spawnX, spawnY, Border.getLeftX(), spawnY) );
        
        var minDist = distances[0];
        var minDistIndex = 0;
        distances.map(function(val, index){
            if(val < minDist){
                minDist = val;
                minDistIndex = index;
            }
        });
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            switch(minDistIndex){
                case 0:
                    newlyActivatedTarget.setDestination(Border.getRightX(), spawnY);
                    break;
                case 1:
                    newlyActivatedTarget.setDestination(spawnX, Border.getBottomY());
                    break;
                case 2:
                    newlyActivatedTarget.setDestination(Border.getLeftX(), spawnY);
                    break;
            }
        });
    } 
    
    SpikeEnemyController.prototype.recieveEvent = function(eventInfo){
        EntityController.EntityController.prototype.recieveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
    //        this._setAchievementParamtersForAllActiveTargets();
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
      //      this._setAchievementParamtersForAllActiveTargets();
        }
    }
    
    SpikeEnemyController.prototype._setAchievementParamtersForAllActiveTargets = function(){
//        for(var i = 0; i < this._entitiesActivated.length; i++){
//            this._entitiesActivated[i].setAchievementParameters(this._targetAreaToAchieve);
//        }
    }
    
    return SpikeEnemyController;
});