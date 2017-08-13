define(['BasicTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController', 'Custom Utility/distance'], function(BasicTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, distance){
    
    function BasicTargetsController(gl, appMetaData, initializeData, EffectsManager){
        EntityController.EntityController.call(this); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        
        var i = 0;
        for(var key in initializeData){
            this._entitiesPool[i] = new BasicTarget(key, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 8, initializeData[key].x, appMetaData.getCanvasHeight() - initializeData[key].y, initializeData[key].movementAngle, initializeData[key].speed * 4, EffectsManager);
            
            i++;
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BasicTargetsController.prototype = Object.create(EntityController.EntityController.prototype);
    BasicTargetsController.prototype.constructor = BasicTargetsController;
    
    BasicTargetsController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        newlyActivatedTarget.addToPhysicsSimulation();
        
        switch(random){
            case 1:
                spawnX = Border.getLeftX() + newlyActivatedTarget.getRadius();
                spawnY = Random.getRandomInt(Border.getBottomY() + newlyActivatedTarget.getRadius(), Border.getTopY() - newlyActivatedTarget.getRadius());
                movementAngle = Random.getRandomIntInclusive(-90, 90);
                break;

            case 2:
                spawnX = Random.getRandomInt(Border.getLeftX() + newlyActivatedTarget.getRadius(), Border.getRightX() - newlyActivatedTarget.getRadius());
                spawnY = Border.getTopY() - newlyActivatedTarget.getRadius();
                movementAngle = Random.getRandomIntInclusive(-180, 0);
                break;

            case 3:
                spawnX = Border.getRightX() - newlyActivatedTarget.getRadius();
                spawnY = Random.getRandomInt(Border.getBottomY() + newlyActivatedTarget.getRadius(), Border.getTopY() - newlyActivatedTarget.getRadius());;
                movementAngle = Random.getRandomIntInclusive(90, 270);
                break;

            case 4:
                spawnX = Random.getRandomInt(Border.getLeftX() + newlyActivatedTarget.getRadius(), Border.getRightX() - newlyActivatedTarget.getRadius());
                spawnY = Border.getBottomY() + newlyActivatedTarget.getRadius();
                movementAngle = Random.getRandomIntInclusive(0, 180);
                break;
        }
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        newlyActivatedTarget.setAchievementParameters(this._targetAreaToAchieve);
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.doSpawnEffect(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    BasicTargetsController.prototype.recieveEvent = function(eventInfo){
        EntityController.EntityController.prototype.recieveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
            this._setAchievementParamtersForAllActiveTargets();
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
            this._setAchievementParamtersForAllActiveTargets();
        }
    }
    
    BasicTargetsController.prototype._setAchievementParamtersForAllActiveTargets = function(){
        for(var i = 0; i < this._entitiesActivated.length; i++){
            this._entitiesActivated[i].setAchievementParameters(this._targetAreaToAchieve);
        }
    }
    
    return BasicTargetsController;
});