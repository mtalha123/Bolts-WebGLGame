define(['BasicTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController', 'Custom Utility/distance'], function(BasicTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, distance){
    
    function BasicTargetFocusedState(BasicTargetsController){
        EntityController.FocusedState.call(this, BasicTargetsController);
        this._startXInTarget = undefined;
        this._startYInTarget = undefined; 
        this._targetDistCovered = 0;
        this._targetAreaToAchieve = undefined;
    }
    
    //inherit from FocusedState
    BasicTargetFocusedState.prototype = Object.create(EntityController.FocusedState.prototype);
    BasicTargetFocusedState.prototype.constructor = BasicTargetFocusedState;
    
    BasicTargetFocusedState.prototype.setEntityFocused = function(target, hitBox, focusX, focusY){
        EntityController.FocusedState.prototype.setEntityFocused.call(this, target, hitBox);
        this._startXInTarget = focusX - target.getX();
        this._startYInTarget = focusY - target.getY();
        this._targetDistCovered = 0;
    }
    
    BasicTargetFocusedState.prototype.processInput = function(inputData){     
        EntityController.FocusedState.prototype.processInput.call(this, inputData);
    }
    
    BasicTargetFocusedState.prototype.handleMouseCoordsInsideHitBox = function(mouseX, mouseY){
        var mouseXRelativeToTarget = mouseX - this._focusedEntity.getX();
        var mouseYRelativeToTarget = mouseY - this._focusedEntity.getY();
        this._targetDistCovered += distance(this._startXInTarget, this._startYInTarget, mouseXRelativeToTarget, mouseYRelativeToTarget);
        
        this._focusedEntity.setAchievementPercentage(this._targetDistCovered / this._targetAreaToAchieve);
        
        this._startXInTarget = mouseXRelativeToTarget;
        this._startYInTarget = mouseYRelativeToTarget;

        if(this._targetDistCovered >= this._targetAreaToAchieve){
            this.achieveBasicTarget();
        }
    }
    
    BasicTargetFocusedState.prototype.achieveBasicTarget = function(){
        EntityController.FocusedState.prototype.achieveEntity.call(this);
        
        this._targetDistCovered = 0;
    }
    
    BasicTargetFocusedState.prototype.setParameters = function(targetAreaToAchieve){
        this._targetAreaToAchieve = targetAreaToAchieve;
    } 
    
    BasicTargetFocusedState.prototype.unfocusEntity = function(){
        EntityController.FocusedState.prototype.unfocusEntity.call(this);
        
        this._focusedEntity.resetVisual();
    }
    
    
    function BasicTargetUnfocusedState(BasicTargetsController){
        EntityController.UnFocusedState.call(this, BasicTargetsController);
    }
    
    //inherit from unFocusedState
    BasicTargetUnfocusedState.prototype = Object.create(EntityController.UnFocusedState.prototype);
    BasicTargetUnfocusedState.prototype.constructor = BasicTargetUnfocusedState;
    
    
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
        
        this._focusedState = new BasicTargetFocusedState(this);
        this._focusedState.setParameters(this._targetAreaToAchieve);
        this._unFocusedState = new BasicTargetUnfocusedState(this);
        this._currentState = this._unFocusedState;
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
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.doSpawnEffect(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    BasicTargetsController.prototype.recieveEvent = function(eventInfo){
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
    
    return BasicTargetsController;
});