 define(['Entities/BonusTargetBubblyOrb', 'Custom Utility/Random', 'Custom Utility/Vector', 'EventSystem'], function(BonusTargetBubblyOrb, Random, Vector, EventSystem){
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
        this._transitioningTargetObjs = [];

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
    }

    BonusTargetBubblyOrbCompound.prototype.spawn = function(callback){
        this._initialTargetObj.target.spawn(callback);
        this._currActivatedTargetObjs.push(this._initialTargetObj);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "bonus"});
    }

    BonusTargetBubblyOrbCompound.prototype.setPosition = function(newposition){
        this._initialTargetObj.target.setPosition(newposition);
    }

    BonusTargetBubblyOrbCompound.prototype.update = function(){
        for(var a = 0; a < this._currActivatedTargetObjs.length; a++){
            this._currActivatedTargetObjs[a].target.update();
        }

        for(var b = 0; b < this._transitioningTargetObjs.length; b++){
            this._transitioningTargetObjs[b].target.update();
        }
    }

    BonusTargetBubblyOrbCompound.prototype.prepareForDrawing = function(interpolation){
        for(var a = 0; a < this._currActivatedTargetObjs.length; a++){
            this._currActivatedTargetObjs[a].target.prepareForDrawing(interpolation);
        }

        for(var b = 0; b < this._transitioningTargetObjs.length; b++){
            this._transitioningTargetObjs[b].target.prepareForDrawing(interpolation);
        }
    }

    BonusTargetBubblyOrbCompound.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){
        for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
            var currActivatedTargetObj = this._currActivatedTargetObjs[i];
            
            var isLastTarget = (this._currActivatedTargetObjs.length === 1 && currActivatedTargetObj.stage === 3) ? true : false;
            var isAchieved = currActivatedTargetObj.target.runAchievementAlgorithmAndReturnStatus(mouseInputObj, function(){                
                if(isLastTarget){
                    this._transitioningTargetObjs = [];
                    callback();
                }
            }.bind(this));
            
            if(isAchieved){
                this._transitioningTargetObjs.push(currActivatedTargetObj);
                
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
                        return true;
                    }
                }
            }
        }
    }
    
    BonusTargetBubblyOrbCompound.prototype.reset = function(){
        // FIX
    }
    
    return BonusTargetBubblyOrbCompound;
 });