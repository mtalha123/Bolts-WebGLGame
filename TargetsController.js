define(['Target', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem'], function(Target, SynchronizedTimers, Border, Random, EventSystem){
   
    function distance(startX, startY, endX, endY){
        return Math.sqrt( Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2) );
    }
    
    function isInsideTargetBoundary(target, checkX, checkY){
        if( distance(checkX, checkY, target.getX() + target.getRadius(), target.getY() - target.getRadius()) <= target.getRadius() ){
            return true;
        }
        
        return false;
    }
    
    function TargetFocusedState(TargetsController){
        this._targetsController = TargetsController;
        this._focusedTarget = undefined;
        this._startXInTarget = undefined;
        this._startYInTarget = undefined; 
        this._targetDistCovered = 0;
        this._targetAreaToAchieve = undefined;
    }
    
    TargetFocusedState.prototype.setTargetFocused = function(target, focusX, focusY, targetAreaToAchieve){
        this._focusedTarget = target;
        this._startXInTarget = focusX - target.getX();
        this._startYInTarget = focusY - target.getY();
        this._targetDistCovered = 0;
        this._targetAreaToAchieve = targetAreaToAchieve;
    }
    
    TargetFocusedState.prototype.processInput = function(inputData){        
        var mouseState = inputData.mouseState;
        
        switch(mouseState.type){
            case "mouse_held_down":
            case "mouse_down":
                if(isInsideTargetBoundary(this._focusedTarget, mouseState.x, mouseState.y)){
                    this.handleMouseCoordsInsideCurrFocusedTarget(mouseState.x, mouseState.y);
                }else{
                    this.unfocusTarget();
                }
                break;
            case "mouse_up":
                this.unfocusTarget();
        }
    }
    
    TargetFocusedState.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetsController._targetRadius * 4;
        }else{
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            this.processInput(inputToBeProcessed);   
        }
    }
    
    TargetFocusedState.prototype.handleMouseCoordsInsideCurrFocusedTarget = function(mouseX, mouseY){
        var mouseXRelativeToTarget = mouseX - this._focusedTarget.getX();
        var mouseYRelativeToTarget = mouseY - this._focusedTarget.getY();
        this._targetDistCovered += distance(this._startXInTarget, this._startYInTarget, mouseXRelativeToTarget, mouseYRelativeToTarget);
        
        this._focusedTarget.setAchievementPercentage(this._targetDistCovered / this._targetAreaToAchieve);
        
        this._startXInTarget = mouseXRelativeToTarget;
        this._startYInTarget = mouseYRelativeToTarget;

        if(this._targetDistCovered >= this._targetAreaToAchieve){
            this.achieveTarget();
        }
    }
    
    TargetFocusedState.prototype.achieveTarget = function(){
        EventSystem.publishEventImmediately("target_destroyed", {target: this._focusedTarget});
        
        for(var a = 0; a < this._targetsController._targetsActivated.length; a++){
            if(this._targetsController._targetsActivated[a]._id === this._focusedTarget._id){
                this._targetsController._targetsActivated[a].removeFromPhysicsSimulation();
                this._targetsController._targetsInTransition.push(this._targetsController._targetsActivated.splice(a, 1)[0]);
            }
        }
          
        this._focusedTarget.destroyAndReset(function(){
            //targetsInTransition array acts in FIFO manner, so index of currently pushed target will be 0 because all previous objects will be spliced before this one
            var indexOfTarget = 0;     
            this._targetsController._targetsPool.push(this._targetsController._targetsInTransition.splice(indexOfTarget, 1)[0]); 
        }.bind(this));
        
        this._targetDistCovered = 0; 
        this._targetsController._currentState = this._targetsController._unFocusedState;
    }
    
    TargetFocusedState.prototype.unfocusTarget = function(){
        this._targetsController._currentState = this._targetsController._unFocusedState;
    }
    
    
    
    function TargetUnfocusedState(TargetsController){
        this._targetsController = TargetsController;
    }
    
    TargetUnfocusedState.prototype.processInput = function(inputData){        
        var mouseState = inputData.mouseState;
        
        switch(mouseState.type){
            case "mouse_held_down":
            case "mouse_down":
                var entityPossiblyFocused = this.isInsideAnyEntityBoundary(mouseState.x, mouseState.y);
                if(entityPossiblyFocused){
                    this._targetsController._currentState = this._targetsController._focusedState;
                    this._targetsController._currentState.setTargetFocused(entityPossiblyFocused, mouseState.x, mouseState.y, this._targetsController._targetAreaToAchieve);
                }
                break;
        }
    }
    
    TargetUnfocusedState.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventType != "combo_level_increased" && eventInfo.eventType != "combo_level_reset"){
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            this.processInput(inputToBeProcessed); 
        }
    }
    
    TargetUnfocusedState.prototype.isInsideAnyEntityBoundary = function(checkX, checkY){
        var targetsActivated = this._targetsController._targetsActivated;
        for(var i = 0; i < targetsActivated.length; i++){             
            if(isInsideTargetBoundary(targetsActivated[i], checkX, checkY)){
                return targetsActivated[i];
            }
        }
        return false;
    }
    
    
    function TargetsController(gl, appMetaData, initializeData, EffectsManager){
        this._targetsPool = [];
        this._targetsActivated = [];
        this._targetsInTransition = [];
        this._spawnDelay = 1000;
        this._spawnTimer = SynchronizedTimers.getTimer();        
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        
        var i = 0;
        for(var key in initializeData){
            this._targetsPool[i] = new Target(key, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 8, initializeData[key].x, appMetaData.getCanvasHeight() - initializeData[key].y, initializeData[key].movementAngle, initializeData[key].speed / 2, 1000, EffectsManager);
            
            i++;
        }
        
        this._targetAreaToAchieve = this._targetRadius * 4;
        this._areaToAchieveReductionAmount = 0.04 * this._targetAreaToAchieve;
        
        EventSystem.register(this.recieveEvent, "mouse_move", this);
        EventSystem.register(this.recieveEvent, "mouse_down", this);
        EventSystem.register(this.recieveEvent, "mouse_up", this);
        EventSystem.register(this.recieveEvent, "mouse_held_down", this); 
        EventSystem.register(this.recieveEvent, "combo_level_increased", this);
        EventSystem.register(this.recieveEvent, "combo_level_reset", this);
        
        this._spawnTimer.start();
        
        this._focusedState = new TargetFocusedState(this);
        this._unFocusedState = new TargetUnfocusedState(this);
        this._currentState = this._unFocusedState;
    }
    
    TargetsController.prototype.draw = function(interpolation){
        for(var a = 0; a < this._targetsActivated.length; a++){
            this._targetsActivated[a].draw(interpolation);
        }
        
        for(var a = 0; a < this._targetsInTransition.length; a++){
            this._targetsInTransition[a].draw(interpolation);
        }
    }
    
    TargetsController.prototype.update = function(){
        if(this._targetsPool.length > 0){
            if(this._spawnTimer.getTime() >= this._spawnDelay){
                this._spawn();
                this._spawnTimer.reset();
            }
            this._spawnTimer.start();
        }

        for(var a = 0; a < this._targetsActivated.length; a++){
            this._targetsActivated[a].update();
        }
        
        for(var a = 0; a < this._targetsInTransition.length; a++){
            this._targetsInTransition[a].update();
        }
    }
    
    TargetsController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        var movementAngle;
        
        var newlyActivatedTarget = this._targetsPool.shift();   
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
        this._targetsActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.doSpawnEffect(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    TargetsController.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventType === "combo_level_increased"){
            this._targetAreaToAchieve -= this._areaToAchieveReductionAmount;
        }else if(eventInfo.eventType === "combo_level_reset"){
            this._targetAreaToAchieve = this._targetRadius * 4;
        }else{
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            this._currentState.processInput(inputToBeProcessed);   
        }
    }
    
    return TargetsController;
});