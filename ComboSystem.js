define(['EventSystem', 'TargetsController', 'SynchronizedTimers', 'ShaderProcessor'], function(EventSystem, TargetsController, SynchronizedTimers, ShaderProcessor){
    var totalStoredCharge = 0;
    var baseTargetCharge = 10;
    var chargeMultiplier = 1;
    var maxChargeMultiplier = 10;
    var timeUntilDisintegration = 2000;
    var timeAllDisintegrates = 2000;
    var untilDisintegrationTimer = SynchronizedTimers.getTimer();
    var allDisintegratesTimer = SynchronizedTimers.getTimer();
    var numTargetsNeededHigherCombo = 1;
    var currentComboLevel = 0;
    var maxComboLevel = 8;
    var targetAreaToAchieve = TargetsController.getRadiusOfTarget() * 4;
    var areaToAchieveReductionAmount = 0.04 * targetAreaToAchieve;
    
    var comboHandler;
    
    function initialize(gl){
        comboHandler = ShaderProcessor.requestComboEffect(gl, 300, 700, 80, 0.0, 3, "1x");
    }
    
    function update(){
        if(untilDisintegrationTimer.getTime() >= timeUntilDisintegration){
            untilDisintegrationTimer.reset();
            allDisintegratesTimer.start();
        }
        
        if(allDisintegratesTimer.getTime() >= timeAllDisintegrates){
            resetCombo();
        }
    }
    
    function increaseComboLevel(){
        if(currentComboLevel < 8){
            currentComboLevel++;
            allDisintegratesTimer.reset();
            untilDisintegrationTimer.reset();
            
            chargeMultiplier = currentComboLevel + 1;   
            targetAreaToAchieve -= areaToAchieveReductionAmount;
            
            if(currentComboLevel >= 8){
                chargeMultiplier = maxChargeMultiplier;
                areaToAchieveReductionAmount = 0.22;
                targetAreaToAchieve -= areaToAchieveReductionAmount;
            }

            setTimeAmountsBasedOnComboLevel();
            setNumTargetsToAchieveBasedOnComboLevel();

            EventSystem.publishEventImmediately("combo_level_changed", {comboLevel: currentComboLevel, timeUntilDisintegration: timeUntilDisintegration, timeAllDisintegrates: timeAllDisintegrates});
        }
        
        comboHandler.shouldDraw(true);
        
        untilDisintegrationTimer.reset();
        untilDisintegrationTimer.start();
        allDisintegratesTimer.reset();
    }
    
    function resetCombo(){        
        chargeMultiplier = 1;
        totalStoredCharge = 0;
        timeUntilDisintegration = timeAllDisintegrates = 2000;
        allDisintegratesTimer.reset();
        untilDisintegrationTimer.reset();
        currentComboLevel = 0;
        targetAreaToAchieve = TargetsController.getRadiusOfTarget() * 4;
        areaToAchieveReductionAmount = 0.04 * targetAreaToAchieve;
        numTargetsNeededHigherCombo = 1;
        
        comboHandler.shouldDraw(false);
        
        console.log("COMBO RESET!!!");
        EventSystem.publishEventImmediately("combo_level_changed", {comboLevel: currentComboLevel, timeUntilDisintegration: timeUntilDisintegration, timeAllDisintegrates: timeAllDisintegrates});
    }
    
    function decreaseComboLevel(){
        
    }
    
    function setTimeAmountsBasedOnComboLevel(){
//        switch(currentComboLevel){
//            case 1:
//            case 2:
//                timeUntilDisintegration -= 100;
//                timeAllDisintegrates -= 50;
//                break;
//            case 3:
//            case 4:
//                timeUntilDisintegration -= 150;
//                timeAllDisintegrates -= 100;
//                break;
//            case 5:
//            case 6:
//                timeUntilDisintegration -= 200;
//                timeAllDisintegrates -= 150;
//                break;
//            case 7:
//                timeUntilDisintegration -= 250;
//                timeAllDisintegrates -= 200;
//                break;
//            case 8:
//                timeUntilDisintegration -= 350;
//                timeAllDisintegrates -= 200;
//                break;
//        }
    }
    
    function setNumTargetsToAchieveBasedOnComboLevel(){
        if(currentComboLevel === 0 || currentComboLevel === 1){
            numTargetsNeededHigherCombo = 1;
        }else if(currentComboLevel > 1 && currentComboLevel < 7){
            numTargetsNeededHigherCombo = 2;
        }else{
            numTargetsNeededHigherCombo = 3;
        }
    }
    
    function getChargeMultiplier(){
        return chargeMultiplier;
    }
    
    function getTotalStoredCharge(){
        return totalStoredCharge;
    }
    
    function draw(){
//        context.save();
//        
//        context.fillStyle = "black";
//        context.font = "20px Arial";
//        context.fillText("x" + chargeMultiplier, 100, 100);
//        context.fillText("timeUntilDisintegration: " + untilDisintegrationTimer.getTime(), 100, 150);
//        context.fillText("timeAllDisintegrates: " + allDisintegratesTimer.getTime(), 100, 200);
//        context.fillText("Area needed to achieve: " + targetAreaToAchieve, 100, 250);
//        
//        context.restore();
        
        var comboTxt = currentComboLevel.toString();
        comboTxt = comboTxt.concat("x");
        comboHandler.setComboText(comboTxt);
        comboHandler.setCompletion(allDisintegratesTimer.getTime() / 2000);
        
    }
    
    function getTargetAreaToAchieve(){
        return targetAreaToAchieve;
    }
    
    function increaseTotalStoredCharge(){
        totalStoredCharge += chargeMultiplier * baseTargetCharge;
    }
    
    function getNumTargetsNeededHigherCombo(){
        return numTargetsNeededHigherCombo;
    }
    
    return {
        increaseComboLevel: increaseComboLevel,
        update: update,
        getTargetAreaToAchieve: getTargetAreaToAchieve,
        resetCombo: resetCombo,
        getTotalStoredCharge: getTotalStoredCharge,
        draw: draw,
        increaseTotalStoredCharge: increaseTotalStoredCharge,
        getNumTargetsNeededHigherCombo: getNumTargetsNeededHigherCombo,
        initialize: initialize
    };
});