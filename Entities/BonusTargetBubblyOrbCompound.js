 define(['Entities/BonusTargetBubblyOrb', 'Custom Utility/Random', 'Custom Utility/Vector', 'EventSystem', 'timingCallbacks'], function(BonusTargetBubblyOrb, Random, Vector, EventSystem, timingCallbacks){
    function getPositionsFor2Targets(canvasWidth, canvasHeight, posToSplitFrom){
        var splitDirection = Random.getRandomIntInclusive(1, 2); // 1 represents left and right split, 2 represents up and down split
        
        var gap;
        if(splitDirection === 1){
            gap = canvasWidth * 0.07;
            return [new Vector(posToSplitFrom.getX() - gap, posToSplitFrom.getY()), 
                    new Vector(posToSplitFrom.getX() + gap, posToSplitFrom.getY())];
        }else{
            gap = canvasHeight * 0.1;
            return [new Vector(posToSplitFrom.getX(), posToSplitFrom.getY() - gap), 
                    new Vector(posToSplitFrom.getX(), posToSplitFrom.getY() + gap)];
        }
    }
     
     
     function BonusTargetBubblyOrbCompound(gl, appMetaData, targetRadius, position, EffectsManager){
        this._appMetaData = appMetaData;
        this._currActivatedTargetObjs = [];
        this._scoreWorth = 10;

        this._initialTargetObj = {
            target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius, position, EffectsManager),
            stage: 1
        };

        this._targetObjsSecondStage = [];        
        this._targetObjsThirdStage = [];

        for(var i = 0; i < 4; i++){
            if(i < 2){
               this._targetObjsSecondStage[i] = {
                    target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius / 1.5, position, EffectsManager),
                    stage: 2
                }; 
            }

            this._targetObjsThirdStage[i] = {
                target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius / 2, position, EffectsManager),
                stage: 3
            };
        }
         
        EventSystem.register(this.receiveEvent, "entity_destroyed_by_lightning_strike", this);
    }

    BonusTargetBubblyOrbCompound.prototype.spawn = function(callback){
        this._initialTargetObj.target.spawn(callback);
        this._currActivatedTargetObjs.push(this._initialTargetObj);
        
        timingCallbacks.addTimingEvents(this, 3000, 1, function(){}, function(){
            for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
                this._currActivatedTargetObjs[i].target.disintegrate();
            }
            this.reset();
            EventSystem.publishEventImmediately("bonus_target_disintegrated", {entity: this});
        });
        
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }

    BonusTargetBubblyOrbCompound.prototype.setPosition = function(newposition){
        this._initialTargetObj.target.setPosition(newposition);
    }

    BonusTargetBubblyOrbCompound.prototype.update = function(){
        for(var a = 0; a < this._currActivatedTargetObjs.length; a++){
            this._currActivatedTargetObjs[a].target.update();
        }
    }

    BonusTargetBubblyOrbCompound.prototype.prepareForDrawing = function(interpolation){
        for(var a = 0; a < this._currActivatedTargetObjs.length; a++){
            this._currActivatedTargetObjs[a].target.prepareForDrawing(interpolation);
        }
    }

    BonusTargetBubblyOrbCompound.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
            var currActivatedTargetObj = this._currActivatedTargetObjs[i];
            
            var isLastTarget = (this._currActivatedTargetObjs.length === 1 && currActivatedTargetObj.stage === 3) ? true : false;
            var isAchieved = currActivatedTargetObj.target.runAchievementAlgorithmAndReturnStatus(mouseInputObj, function(){                
                if(isLastTarget){
                    callback();
                }
            }.bind(this));
            
            if(isAchieved){
                timingCallbacks.resetTimeOfAddedTimeEvents(this);
                
                if(currActivatedTargetObj.stage === 1 || currActivatedTargetObj.stage === 2){
                    var targetObj1, targetObj2;

                    if(currActivatedTargetObj.stage === 1){
                        targetObj1 = this._targetObjsSecondStage.shift();
                        targetObj2 = this._targetObjsSecondStage.shift();
                        this._currActivatedTargetObjs.shift(); //since we know there's only 1 element in the array since it's stage 1
                    }

                    if(currActivatedTargetObj.stage === 2){
                        targetObj1 = this._targetObjsThirdStage.shift();
                        targetObj2 = this._targetObjsThirdStage.shift();                    
                        this._targetObjsSecondStage.push(this._currActivatedTargetObjs.splice(i, 1)[0]);
                    }

                    var positions = getPositionsFor2Targets(this._appMetaData.getCanvasWidth(), this._appMetaData.getCanvasHeight(), currActivatedTargetObj.target.getPosition());
                    targetObj1.target.setPosition(positions[0]);
                    targetObj1.target.spawn(function(){});
                    targetObj2.target.setPosition(positions[1]);
                    targetObj2.target.spawn(function(){});

                    this._currActivatedTargetObjs.push(targetObj1);
                    this._currActivatedTargetObjs.push(targetObj2);
                }

                if(currActivatedTargetObj.stage === 3){
                    this._targetObjsThirdStage.push(this._currActivatedTargetObjs.splice(i, 1)[0]);
                    if(isLastTarget){
                        EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "bonus"});
                        timingCallbacks.removeTimingEvents(this);
                        return true;
                    }
                }
            }
        }
    }
    
    BonusTargetBubblyOrbCompound.prototype.reset = function(){
        while(this._currActivatedTargetObjs.length > 0){
            var currActivatedTargetObj = this._currActivatedTargetObjs[0];
            
            if(currActivatedTargetObj.stage === 1){
                this._currActivatedTargetObjs.shift();
            }else if(currActivatedTargetObj.stage === 2){
                this._targetObjsSecondStage.push(this._currActivatedTargetObjs.shift());
            }else if(currActivatedTargetObj.stage === 3){
                this._targetObjsThirdStage.push(this._currActivatedTargetObjs.shift());
            }
            
            currActivatedTargetObj.target.reset();
        }
    }   
    
    BonusTargetBubblyOrbCompound.prototype.getScoreWorth = function(){
        return this._scoreWorth;
    }    
    
    BonusTargetBubblyOrbCompound.prototype.receiveEvent = function(eventInfo){        
        for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
            var isLastTarget = (this._currActivatedTargetObjs.length === 1 && this._currActivatedTargetObjs[i].stage === 3) ? true : false;

            if(eventInfo.eventData.entity === this._currActivatedTargetObjs[i].target){
                if(isLastTarget){
                    EventSystem.publishEventImmediately("entity_destroyed_by_lightning_strike", {entity: this, type: "bonus"});
                    timingCallbacks.removeTimingEvents(this);
                }
                
                if(this._currActivatedTargetObjs[i].stage === 1){
                    this._currActivatedTargetObjs.shift();
                }else if(this._currActivatedTargetObjs[i].stage === 2){
                    this._targetObjsSecondStage.push(this._currActivatedTargetObjs.splice(i, 1)[0]);
                }else{
                    this._targetObjsThirdStage.push(this._currActivatedTargetObjs.splice(i, 1)[0]);
                }
            }
        }
    }
    
    return BonusTargetBubblyOrbCompound;
 });