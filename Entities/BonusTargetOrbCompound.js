define(['Entities/BonusTargetOrb', 'Link', 'Custom Utility/Vector'], function(BonusTargetOrb, Link, Vector){
    function BonusTargetOrbCompound(gl, appMetaData, EffectsManager, radiusForEachOrb, position){
        this._configPositions = [new Vector(0, 0),
                                 new Vector(0, radiusForEachOrb),
                                 new Vector(0, radiusForEachOrb + 100),
                                 new Vector(0, 100 + (radiusForEachOrb * 2)),
                                 new Vector(radiusForEachOrb, 100 + (radiusForEachOrb * 2)),
                                 new Vector(radiusForEachOrb + 100, 100 + (radiusForEachOrb * 2)),
                                 new Vector(100 + (radiusForEachOrb * 2), 100 + (radiusForEachOrb * 2)),
                                 new Vector(100 + (radiusForEachOrb * 2), 100 + (radiusForEachOrb * 3)),
                                 new Vector(100 + (radiusForEachOrb * 2), 200 + (radiusForEachOrb * 3)),
                                 new Vector(100 + (radiusForEachOrb * 2), 200 + (radiusForEachOrb * 4))
                                ];
        this._config = [];
        
        this._config[0] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[0], EffectsManager);
        this._config[0].turnOnLightning();
        this._config[1] = new Link(gl, this._configPositions[1], this._configPositions[2], EffectsManager);
        
        this._config[2] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[3], EffectsManager);
        this._config[3] = new Link(gl, this._configPositions[4], this._configPositions[5], EffectsManager);
        
        this._config[4] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[6], EffectsManager);
        this._config[5] = new Link(gl, this._configPositions[7], this._configPositions[8], EffectsManager); 
        
        this._config[6] = new BonusTargetOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, radiusForEachOrb, this._configPositions[9], EffectsManager);
        
        this.setPosition(position);
        
        this._currentWorkingIndex = 0;
    }
    
    BonusTargetOrbCompound.prototype.setPosition = function(newPosition){
        var newPositions = [];

        for(var i = 0; i < this._configPositions.length; i++){
            //this works because first config position is (0, 0), so no need to have a positionDiff that you would add to configPositions
            newPositions[i] = this._configPositions[i].addTo(newPosition);
        }
        
        this._config[0].setPosition(newPositions[0]);
        this._config[1].setCoords(newPositions[1], newPositions[2]);
        
        this._config[2].setPosition(newPositions[3]);
        this._config[3].setCoords(newPositions[4], newPositions[5]);
        
        this._config[4].setPosition(newPositions[6]);
        this._config[5].setCoords(newPositions[7], newPositions[8]);
        
        this._config[6].setPosition(newPositions[9]);
    }
    
    BonusTargetOrbCompound.prototype.prepareForDrawing = function(interpolation){
        for(var i = 0; i < this._config.length; i++){
            this._config[i].prepareForDrawing(interpolation);
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