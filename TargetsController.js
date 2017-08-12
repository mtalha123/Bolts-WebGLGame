define(['Target', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController', 'Custom Utility/distance'], function(Target, SynchronizedTimers, Border, Random, EventSystem, EntityController, distance){
    
    function TargetFocusedState(TargetsController){
        EntityController.FocusedState.call(this, TargetsController);
        this._startXInTarget = undefined;
        this._startYInTarget = undefined; 
        this._targetDistCovered = 0;
        this._targetAreaToAchieve = undefined;
    }
    
    //inherit from FocusedState
    TargetFocusedState.prototype = Object.create(EntityController.FocusedState.prototype);
    TargetFocusedState.prototype.constructor = TargetFocusedState;
    
    TargetFocusedState.prototype.setEntityFocused = function(target, hitBox, focusX, focusY){
        EntityController.FocusedState.prototype.setEntityFocused.call(this, target, hitBox);
        this._startXInTarget = focusX - target.getX();
        this._startYInTarget = focusY - target.getY();
        this._targetDistCovered = 0;
    }
    
    TargetFocusedState.prototype.processInput = function(inputData){     
        EntityController.FocusedState.prototype.processInput.call(this, inputData);
    }
    
    TargetFocusedState.prototype.handleMouseCoordsInsideHitBox = function(mouseX, mouseY){
        var mouseXRelativeToTarget = mouseX - this._focusedEntity.getX();
        var mouseYRelativeToTarget = mouseY - this._focusedEntity.getY();
        this._targetDistCovered += distance(this._startXInTarget, this._startYInTarget, mouseXRelativeToTarget, mouseYRelativeToTarget);
        
        this._focusedEntity.setAchievementPercentage(this._targetDistCovered / this._targetAreaToAchieve);
        
        this._startXInTarget = mouseXRelativeToTarget;
        this._startYInTarget = mouseYRelativeToTarget;

        if(this._targetDistCovered >= this._targetAreaToAchieve){
            this.achieveTarget();
        }
    }
    
    TargetFocusedState.prototype.achieveTarget = function(){
        EntityController.FocusedState.prototype.achieveEntity.call(this);
        
        this._targetDistCovered = 0;
    }
    
    TargetFocusedState.prototype.setParameters = function(targetAreaToAchieve){
        this._targetAreaToAchieve = targetAreaToAchieve;
    } 
    
    TargetFocusedState.prototype.unfocusEntity = function(){
        console.log("UNFOCUSED!");
        EntityController.FocusedState.prototype.unfocusEntity.call(this);
        
        this._focusedEntity.resetVisual();
    }
    
    
    function TargetUnfocusedState(TargetsController){
        EntityController.UnFocusedState.call(this, TargetsController);
    }
    
    //inherit from unFocusedState
    TargetUnfocusedState.prototype = Object.create(EntityController.UnFocusedState.prototype);
    TargetUnfocusedState.prototype.constructor = TargetUnfocusedState;
    
    
    function TargetsController(gl, appMetaData, initializeData, EffectsManager){
        EntityController.EntityController.call(this); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        
        var i = 0;
        for(var key in initializeData){
            this._entitiesPool[i] = new Target(key, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 8, initializeData[key].x, appMetaData.getCanvasHeight() - initializeData[key].y, initializeData[key].movementAngle, initializeData[key].speed / 2, EffectsManager);
            
            i++;
        }
        
        this._spawnTimer.start();
        
        this._focusedState = new TargetFocusedState(this);
        this._focusedState.setParameters(this._targetAreaToAchieve);
        this._unFocusedState = new TargetUnfocusedState(this);
        this._currentState = this._unFocusedState;
    }
    
    //inherit from EntityController
    TargetsController.prototype = Object.create(EntityController.EntityController.prototype);
    TargetsController.prototype.constructor = TargetsController;
    
    TargetsController.prototype._spawn = function(){
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
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.doSpawnEffect(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    TargetsController.prototype.recieveEvent = function(eventInfo){
        EntityController.EntityController.prototype.recieveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
            this._focusedState.setParameters(this._targetAreaToAchieve);
              console.log("are ato achieve: " + this._targetAreaToAchieve);
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
            console.log("are ato achieve: " + this._targetAreaToAchieve);
            this._focusedState.setParameters(this._targetAreaToAchieve);
        }
    }
    
    return TargetsController;
});