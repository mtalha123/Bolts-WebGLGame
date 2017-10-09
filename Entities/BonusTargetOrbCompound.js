define(['Entities/BonusTargetOrb', 'Link'], function(BonusTargetOrb, Link){
    function BonusTargetOrbCompound(gl, appMetaData, EffectsManager, radiusForEachOrb, x, y){
        this._configPositions = [0, 0,
                                 0, radiusForEachOrb,
                                 0, radiusForEachOrb + 100,
                                 0, 100 + (radiusForEachOrb * 2),
                                 radiusForEachOrb, 100 + (radiusForEachOrb * 2),
                                 radiusForEachOrb + 100, 100 + (radiusForEachOrb * 2),
                                 100 + (radiusForEachOrb * 2), 100 + (radiusForEachOrb * 2),
                                 100 + (radiusForEachOrb * 2), 100 + (radiusForEachOrb * 3),
                                 100 + (radiusForEachOrb * 2), 200 + (radiusForEachOrb * 3),
                                 100 + (radiusForEachOrb * 2), 200 + (radiusForEachOrb * 4)
                                ];
        this._config = [];
        
        this._config[0] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[0], this._configPositions[1], EffectsManager);
        this._config[0].turnOnLightning();
        this._config[1] = new Link(gl, this._configPositions[2], this._configPositions[3], this._configPositions[4], this._configPositions[5], EffectsManager);
        
        this._config[2] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[6], this._configPositions[7], EffectsManager);
        this._config[3] = new Link(gl, this._configPositions[8], this._configPositions[9], this._configPositions[10], this._configPositions[11], EffectsManager);
        
        this._config[4] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[12], this._configPositions[13], EffectsManager);
        this._config[5] = new Link(gl, this._configPositions[14], this._configPositions[15], this._configPositions[16], this._configPositions[17], EffectsManager); 
        
        this._config[6] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[18], this._configPositions[19], EffectsManager);
        
        this.setPosition(x, y);
        
        this._currentWorkingIndex = 0;
    }
    
    BonusTargetOrbCompound.prototype.setPosition = function(x, y){
        var newPositions = [];
        for(var i = 0; i < this._configPositions.length-1; i+=2){
            newPositions[i] = this._configPositions[i] + x;
            newPositions[i+1] = this._configPositions[i+1] + y;;
        }
        
        this._config[0].setPosition(newPositions[0], newPositions[1]);
        this._config[1].setCoords(newPositions[2], newPositions[3], newPositions[4], newPositions[5]);
        
        this._config[2].setPosition(newPositions[6], newPositions[7]);
        this._config[3].setCoords(newPositions[8], newPositions[9], newPositions[10], newPositions[11]);
        
        this._config[4].setPosition(newPositions[12], newPositions[13]);
        this._config[5].setCoords(newPositions[14], newPositions[15], newPositions[16], newPositions[17]);
        
        this._config[6].setPosition(newPositions[18], newPositions[19]);
    }
    
    BonusTargetOrbCompound.prototype.prepareForDrawing = function(){
        for(var i = 0; i < this._config.length; i++){
            this._config[i].prepareForDrawing();
        } 
    }
    
    BonusTargetOrbCompound.prototype.update = function(){ 
    }
    
    BonusTargetOrbCompound.prototype.getCharge = function(){ 
        return 0;
    }
    
    BonusTargetOrbCompound.prototype.spawn = function(){
        for(var i = 0; i < this._config.length; i++){
            this._config[i].spawn(function(){});
        }
        this._config[0].turnOnLightning();
    }
    
    BonusTargetOrbCompound.prototype.reset = function(){
        for(var i = 0; i < this._config.length; i++){
            this._config[i].reset();
        }
    }
    
    BonusTargetOrbCompound.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        if(mouseInputObj.type === "mouse_down" || mouseInputObj.type === "mouse_held_down"){
            var mouseX = mouseInputObj.x;
            var mouseY = mouseInputObj.y;
            
            if(this._config[this._currentWorkingIndex].runAchievementAlgorithmAndReturnStatus(mouseInputObj)){   
                if(this._currentWorkingIndex === this._config.length - 1){
                    this._config[this._currentWorkingIndex].destroyAndReset(callback);
                    this._currentWorkingIndex = 0;
                    return true;
                }else{
                    this._config[this._currentWorkingIndex].destroyAndReset(function(){});
                    this._currentWorkingIndex++;
                }
            }else{
                if(this._config[this._currentWorkingIndex] instanceof BonusTargetOrb){
                    this._config[this._currentWorkingIndex].turnOnLightning();
                }
            }
        }
        
        return false;
    }
    
    return BonusTargetOrbCompound;
});