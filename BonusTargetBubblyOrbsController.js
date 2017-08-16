define(['BonusTargetBubblyOrb', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController'], function(BonusTargetBubblyOrb, SynchronizedTimers, Border, Random, EventSystem, EntityController, ){
    
    function BonusTargetBubblyOrbsController(gl, appMetaData, EffectsManager){
        EntityController.EntityController.call(this); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.05;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;

        for(var i = 0; i < 2; i++){              
            this._entitiesPool[i] = new BonusTargetBubblyOrb(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 30, 10, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BonusTargetBubblyOrbsController.prototype = Object.create(EntityController.EntityController.prototype);
    BonusTargetBubblyOrbsController.prototype.constructor = BonusTargetBubblyOrbsController;
    
    BonusTargetBubblyOrbsController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX = Random.getRandomInt(200, 600);
        var spawnY = Random.getRandomInt(300, 400);
        var movementAngle = Random.getRandomIntInclusive(0, 360);;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        newlyActivatedTarget.setAchievementParameters(this._targetAreaToAchieve);
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    BonusTargetBubblyOrbsController.prototype.recieveEvent = function(eventInfo){
        EntityController.EntityController.prototype.recieveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
            this._setAchievementParamtersForAllActiveTargets();
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
            this._setAchievementParamtersForAllActiveTargets();
        }
    }
    
    BonusTargetBubblyOrbsController.prototype._setAchievementParamtersForAllActiveTargets = function(){
        for(var i = 0; i < this._entitiesActivated.length; i++){
            this._entitiesActivated[i].setAchievementParameters(this._targetAreaToAchieve);
        }
    }
    
    return BonusTargetBubblyOrbsController;
});