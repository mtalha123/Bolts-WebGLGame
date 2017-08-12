define(['Target', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Custom Utility/distance'], function(Target, SynchronizedTimers, Border, Random, EventSystem, distance){
    
    function FocusedState(EntityController){
        this._entityController = EntityController;
        this._focusedEntity = undefined;
        this._hitBox = undefined;
    }
    
    FocusedState.prototype.setEntityFocused = function(entity, hitBox){
        this._focusedEntity = entity;
        this._hitBox = hitBox;
    }
    
    FocusedState.prototype.processInput = function(inputData){        
        var mouseState = inputData.mouseState;
        
        switch(mouseState.type){
            case "mouse_held_down":
            case "mouse_down":
                if(this._hitBox.isInRegion(mouseState.x, mouseState.y)){
                    this.handleMouseCoordsInsideHitBox(mouseState.x, mouseState.y);
                }else{
                    this.unfocusEntity();
                }
                break;
            case "mouse_up":
                this.unfocusEntity();
                break;
        }
    }
    
    FocusedState.prototype.handleMouseCoordsInsideHitBox = function(mouseX, mouseY){
    }
    
    FocusedState.prototype.achieveEntity = function(){
        EventSystem.publishEventImmediately("entity_destroyed", {entity: this._focusedEntity});
        
        for(var a = 0; a < this._entityController._entitiesActivated.length; a++){
            if(this._entityController._entitiesActivated[a]._id === this._focusedEntity._id){
                this._entityController._entitiesActivated[a].removeFromPhysicsSimulation();
                this._entityController._entitiesInTransition.push(this._entityController._entitiesActivated.splice(a, 1)[0]);
            }
        }
          
        this._focusedEntity.destroyAndReset(function(){
            //entitiesInTransition array acts in FIFO manner, so index of currently pushed entity will be 0 because all previous objects will be spliced before this one
            var indexOfTarget = 0;     
            this._entityController._entitiesPool.push(this._entityController._entitiesInTransition.splice(indexOfTarget, 1)[0]); 
        }.bind(this));
        
        this._entityController._currentState = this._entityController._unFocusedState;
    }
    
    FocusedState.prototype.unfocusEntity = function(){
        this._entityController._currentState = this._entityController._unFocusedState;
    }
    
    FocusedState.prototype.setParameters = function(){
        //override 
    }
    
    
    
    function UnfocusedState(EntityController){
        this._entityController = EntityController;
    }
    
    UnfocusedState.prototype.processInput = function(inputData){        
        var mouseState = inputData.mouseState;
        
        switch(mouseState.type){
            case "mouse_held_down":
            case "mouse_down":
                var entityPossiblyFocusedInfo = this.isInsideAnyEntityHitRegions(mouseState.x, mouseState.y);
                if(entityPossiblyFocusedInfo){
                    this._entityController._currentState = this._entityController._focusedState;
                    this._entityController._currentState.setEntityFocused(entityPossiblyFocusedInfo.entity, entityPossiblyFocusedInfo.hitBox, mouseState.x, mouseState.y);
                }
                break;
        }
    }
    
    UnfocusedState.prototype.isInsideAnyEntityHitRegions = function(checkX, checkY){
        var entitiesActivated = this._entityController._entitiesActivated;
        for(var i = 0; i < entitiesActivated.length; i++){      
            var possibleHitBox = entitiesActivated[i].areCoordsInHitRegions(checkX, checkY);
            if(possibleHitBox){
                return {
                    entity: entitiesActivated[i],
                    hitBox: possibleHitBox
                };
            }
        }
        return false;
    }
    
    
    function EntityController(){
        this._entitiesPool = [];
        this._entitiesActivated = [];
        this._entitiesInTransition = [];
        this._spawnDelay = 1000;
        this._spawnTimer = SynchronizedTimers.getTimer();        
        
        EventSystem.register(this.recieveEvent, "mouse_move", this);
        EventSystem.register(this.recieveEvent, "mouse_down", this);
        EventSystem.register(this.recieveEvent, "mouse_up", this);
        EventSystem.register(this.recieveEvent, "mouse_held_down", this); 
        EventSystem.register(this.recieveEvent, "combo_level_increased", this);
        EventSystem.register(this.recieveEvent, "combo_level_reset", this);
        
        this._focusedState = undefined;
        this._unFocusedState = undefined;
        this._currentState = this._unFocusedState;
    }
    
    EntityController.prototype.draw = function(interpolation){
        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].draw(interpolation);
        }
        
        for(var a = 0; a < this._entitiesInTransition.length; a++){
            this._entitiesInTransition[a].draw(interpolation);
        }
    }
    
    EntityController.prototype.update = function(){
        if(this._entitiesPool.length > 0){
            if(this._spawnTimer.getTime() >= this._spawnDelay){
                this._spawn();
                this._spawnTimer.reset();
            }
            this._spawnTimer.start();
        }

        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].update();
        }
        
        for(var a = 0; a < this._entitiesInTransition.length; a++){
            this._entitiesInTransition[a].update();
        }
    }
    
    EntityController.prototype._spawn = function(){
    } 
    
    EntityController.prototype.recieveEvent = function(eventInfo){
        if(eventInfo.eventType === "combo_level_increased"){
        }else if(eventInfo.eventType === "combo_level_reset"){
        }else{
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            this._currentState.processInput(inputToBeProcessed);   
        }
    }
    
    return {
        EntityController: EntityController,
        FocusedState: FocusedState,
        UnFocusedState: UnfocusedState
    };
});