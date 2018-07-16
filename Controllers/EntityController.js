define(['SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem'], function(SynchronizedTimers, Border, Random, EventSystem){ 
    
    function EntityController(appMetaData){
        this._entitiesPool = [];
        this._entitiesActivated = [];
        // entitesCaptured will be used for entities that in a "temporary" stage where they are not activated but not in the pool to be respawned. These entities will be updated.
        this._entitiesCaptured = []; 
        this._canvasWidth = appMetaData.getCanvasWidth();
        this._canvasHeight = appMetaData.getCanvasHeight();
        
        EventSystem.register(this.receiveEvent, "mouse_input_event", this); 
        EventSystem.register(this.receiveEvent, "game_restart", this);
        EventSystem.register(this.receiveEvent, "entity_captured", this);
        EventSystem.register(this.receiveEvent, "captured_entity_destroyed", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_orbit", this);
        EventSystem.register(this.receiveEvent, "captured_entity_released_from_destruction_capture", this);
        EventSystem.register(this.receiveEvent, "bonus_target_disintegrated", this);
        EventSystem.register(this.receiveEvent, "entity_destroyed_by_lightning_strike", this);
    }
    
    EntityController.prototype.prepareForDrawing = function(interpolation){
        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].prepareForDrawing(interpolation);
        }
    }
    
    EntityController.prototype.update = function(){
        for(var a = 0; a < this._entitiesActivated.length; a++){
            this._entitiesActivated[a].update();
        }
        
        for(var a = 0; a < this._entitiesCaptured.length; a++){
            this._entitiesCaptured[a].update();
        }
    }
    
    EntityController.prototype.spawn = function(entitySpawned){
        // override
    } 
    
    EntityController.prototype.receiveEvent = function(eventInfo){
        if(eventInfo.eventType === "game_restart"){
            this.reset();
        }else if(eventInfo.eventType === "entity_captured"){
            for(var i = 0; i < this._entitiesActivated.length; i++){
                var currEntity = this._entitiesActivated[i];
                
                if(currEntity === eventInfo.eventData.entity){                  
                    this._entitiesCaptured.push(this._entitiesActivated.splice(i, 1)[0]);
                    break;
                }
            }
        }else if(eventInfo.eventType === "captured_entity_destroyed"){
            for(var i = 0; i < this._entitiesCaptured.length; i++){
                if(this._entitiesCaptured[i] === eventInfo.eventData.entity){
                    this._entitiesPool.push(this._entitiesCaptured.splice(i, 1)[0]);
                    break;
                }
            }
        }else if(eventInfo.eventType === "captured_entity_released_from_orbit" || eventInfo.eventType === "captured_entity_released_from_destruction_capture"){
            for(var i = 0; i < this._entitiesCaptured.length; i++){
                if(this._entitiesCaptured[i] === eventInfo.eventData.entity){
                    this._entitiesActivated.push(this._entitiesCaptured.splice(i, 1)[0]);
                    break;
                }
            }
        }else if(eventInfo.eventType === "bonus_target_disintegrated" || eventInfo.eventType === "entity_destroyed_by_lightning_strike"){
            for(var i = 0; i < this._entitiesActivated.length; i++){
                if(this._entitiesActivated[i] === eventInfo.eventData.entity){
                    this._entitiesPool.push(this._entitiesActivated.splice(i, 1)[0]);
                    break;
                }
            }
        }else if(eventInfo.eventType === "mouse_input_event"){            
            for(var i = 0; i < this._entitiesActivated.length; i++){
                var currEntity = this._entitiesActivated[i];
                
                if(currEntity.runAchievementAlgorithmAndReturnStatus(eventInfo.eventData, function(){})){ 
                    this._entitiesPool.push(this._entitiesActivated.splice(i, 1)[0]); 
                    i--;
                }
            }
        }
    }
    
    EntityController.prototype.reset = function(){
        while(this._entitiesActivated.length > 0){
            this._entitiesPool.push(this._entitiesActivated.shift());
        }
        
        while(this._entitiesCaptured.length > 0){
            this._entitiesPool.push(this._entitiesCaptured.shift());
        }
    }
    
    EntityController.prototype.canSpawn = function(){
        return this._entitiesPool.length;
    }
    
    return EntityController;
});