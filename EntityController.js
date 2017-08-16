define(['SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Custom Utility/distance'], function(SynchronizedTimers, Border, Random, EventSystem, distance){ 
    
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
    }
    
    EntityController.prototype.prepareForDrawing = function(interpolation){
        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].prepareForDrawing(interpolation);
        }
        
        for(var a = 0; a < this._entitiesInTransition.length; a++){
            this._entitiesInTransition[a].prepareForDrawing(interpolation);
        }
    }
    
    EntityController.prototype.update = function(){
        if(this._entitiesPool.length > 0){
            this._spawnTimer.start();
            if(this._spawnTimer.getTime() >= this._spawnDelay){
                this._spawn();
                this._spawnTimer.reset();
            }
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
        }else if(eventInfo.eventType === "mouse_down" || eventInfo.eventType === "mouse_held_down"){
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
            
            for(var i = 0; i < this._entitiesActivated.length; i++){
                if(this._entitiesActivated[i].runAchievementAlgorithmAndReturnStatus(inputToBeProcessed.mouseState.x, inputToBeProcessed.mouseState.y, function(){
                    var indexOfTarget = 0;     
                    this._entitiesPool.push(this._entitiesInTransition.splice(indexOfTarget, 1)[0]); 
                }.bind(this))){
                    EventSystem.publishEventImmediately("entity_destroyed", {entity: this._entitiesActivated[i]});
                    this._entitiesInTransition.push(this._entitiesActivated.splice(i, 1)[0]);
                }
            }
        }
    }
    
    return {
        EntityController: EntityController,
    };
});