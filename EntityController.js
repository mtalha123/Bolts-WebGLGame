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
        }else if(eventInfo.eventType === "mouse_down" || eventInfo.eventType === "mouse_held_down"){
            var inputToBeProcessed = {};
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
           // this._currentState.processInput(inputToBeProcessed); 
            for(var i = 0; i < this._entitiesActivated.length; i++){
                if(this._entitiesActivated[i].runAchievementAlgorithmAndReturnStatus(inputToBeProcessed.mouseState.x, inputToBeProcessed.mouseState.y)){
                    this.achieveEntity(i);   
                }
            }
        }
    }
    
    EntityController.prototype.achieveEntity = function(indexOfEntity){
        var entity = this._entitiesActivated[indexOfEntity];
        
        EventSystem.publishEventImmediately("entity_destroyed", {entity: entity});        
        entity.removeFromPhysicsSimulation();
        this._entitiesInTransition.push(this._entitiesActivated.splice(indexOfEntity, 1)[0]);
          
        entity.destroyAndReset(function(){
            //entitiesInTransition array acts in FIFO manner, so index of currently pushed entity will be 0 because all previous objects will be spliced before this one
            var indexOfTarget = 0;     
            this._entitiesPool.push(this._entitiesInTransition.splice(indexOfTarget, 1)[0]); 
        }.bind(this));
    }
    
    return {
        EntityController: EntityController,
    };
});