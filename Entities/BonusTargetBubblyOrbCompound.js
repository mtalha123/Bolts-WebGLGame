 define(['Entities/BonusTargetBubblyOrb', 'Custom Utility/Random'], function(BonusTargetBubblyOrb, Random){
    function getPositionsFor2Targets(canvasWidth, canvasHeight, xToSplitFrom, yToSplitFrom){
        var splitDirection = Random.getRandomIntInclusive(1, 2); // 1 represents left and right split, 2 represents up and down split
        
        if(splitDirection === 1){
            var gap = canvasWidth * 0.07;
            return [xToSplitFrom - gap, yToSplitFrom, xToSplitFrom + gap, yToSplitFrom];
        }else{
            var gap = canvasHeight * 0.1;
            return [xToSplitFrom, yToSplitFrom - gap, xToSplitFrom, yToSplitFrom + gap];
        }
    }
     
     
     function BonusTargetBubblyOrbCompound(gl, appMetaData, targetRadius, x, y, EffectsManager){
        this._appMetaData = appMetaData;
        this._currActivatedTargetObjs = [];
        this._transitioningTargetObjs = [];

        this._initialTargetObj = {
            target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius, x, y, EffectsManager),
            stage: 1
        };

        this._targetObjsSecondStage = [];        
        this._targetObjsThirdStage = [];

        for(var i = 0; i < 4; i++){
            if(i < 2){
               this._targetObjsSecondStage[i] = {
                    target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius / 1.5, x, y, EffectsManager),
                    stage: 2
                }; 
            }

            this._targetObjsThirdStage[i] = {
                target: new BonusTargetBubblyOrb(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, targetRadius / 2, x, y, EffectsManager),
                stage: 3
            };
        }
    }

    BonusTargetBubblyOrbCompound.prototype.spawn = function(callback){
        this._initialTargetObj.target.spawn(callback);
        this._currActivatedTargetObjs.push(this._initialTargetObj);
    }

    BonusTargetBubblyOrbCompound.prototype.setPosition = function(newX, newY){
        this._initialTargetObj.target.setPosition(newX, newY);
    }

    BonusTargetBubblyOrbCompound.prototype.update = function(){
        for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
            this._currActivatedTargetObjs[i].target.update();
        }

        for(var i = 0; i < this._transitioningTargetObjs.length; i++){
            this._transitioningTargetObjs[i].target.update();
        }
    }

    BonusTargetBubblyOrbCompound.prototype.prepareForDrawing = function(interpolation){
        for(var i = 0; i < this._currActivatedTargetObjs.length; i++){
            this._currActivatedTargetObjs[i].target.prepareForDrawing(interpolation);
        }

        for(var i = 0; i < this._transitioningTargetObjs.length; i++){
            this._transitioningTargetObjs[i].target.prepareForDrawing(interpolation);
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

                    var positions = getPositionsFor2Targets(this._appMetaData.getCanvasWidth(), this._appMetaData.getCanvasHeight(), currActivatedTargetObj.target.getX(), currActivatedTargetObj.target.getY());
                    targetObj1.target.setPosition(positions[0], positions[1]);
                    targetObj1.target.spawn(function(){});
                    targetObj2.target.setPosition(positions[2], positions[3]);
                    targetObj2.target.spawn(function(){});

                    this._currActivatedTargetObjs.push(targetObj1);
                    this._currActivatedTargetObjs.push(targetObj2);
                }

                if(currActivatedTargetObj.stage === 3){
                    this._targetObjsThirdStage.push(this._currActivatedTargetObjs.splice(i, 1)[0]);
                    if(isLastTarget){
                        return true;
                    }
                }
            }
        }
    }

    BonusTargetBubblyOrbCompound.prototype.getCharge = function(){
        return 1;
    }
    
    return BonusTargetBubblyOrbCompound;
 });