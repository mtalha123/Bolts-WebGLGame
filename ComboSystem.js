define(['EventSystem', 'SynchronizedTimers'], function(EventSystem, SynchronizedTimers){
    var baseTargetCharge = 10;
    var chargeMultiplier = 1;
    var maxChargeMultiplier = 10;
    var timeUntilComboOver = 4000;
    var comboTimer = SynchronizedTimers.getTimer();
    var numTargetsNeededHigherCombo = 1;
    var currentComboLevel = 0;
    var maxComboLevel = 8;
    var numTargetsAchievedSinceLastCombo = 0;
    var comboHandler;
    EventSystem.register(recieveEvent, "entity_destroyed");
    
    function initialize(gl, EffectsManager, Border){
        comboHandler = EffectsManager.requestComboEffect(false, gl, 0, Border.getLeftX(), Border.getTopY(), {}, "1x");
    }
    
    function update(){
        if(comboTimer.getTime() >= timeUntilComboOver){
            comboTimer.reset();
            resetCombo();
        }
    }
    
    function increaseComboLevel(){
        currentComboLevel++;
        
        if(currentComboLevel <= 8){            
            if(currentComboLevel < 8){
                chargeMultiplier = currentComboLevel + 1;    
            }else{
                chargeMultiplier = maxChargeMultiplier;
            }
        
            setTimeAmountsBasedOnComboLevel();
            setNumTargetsToAchieveBasedOnComboLevel();

            EventSystem.publishEventImmediately("combo_level_increased", {comboLevel: currentComboLevel, timeUntilComboOver: timeUntilComboOver});
        }
        
        comboHandler.shouldDraw(true);
        comboTimer.reset();
        comboTimer.start();
    }
    
    function resetCombo(){        
        chargeMultiplier = 1;
        timeUntilComboOver = 4000;
        comboTimer.reset();
        currentComboLevel = 0;
        numTargetsNeededHigherCombo = 1;
        
        comboHandler.shouldDraw(false);
        
        EventSystem.publishEventImmediately("combo_level_reset", {comboLevel: currentComboLevel, timeUntilComboOver: timeUntilComboOver});
    }
    
    function decreaseComboLevel(){
        
    }
    
    function setTimeAmountsBasedOnComboLevel(){
        switch(currentComboLevel){
            case 1:
            case 2:
                timeUntilComboOver -= 40;
                break;
            case 3:
            case 4:
                timeUntilComboOver -= 50;
                break;
            case 5:
            case 6:
                timeUntilComboOver -= 100;
                break;
            case 7:
                timeUntilComboOver -= 150;
                break;
            case 8:
                timeUntilComboOver -= 200;
                break;
        }
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
    
    function draw(){        
        var comboTxt = chargeMultiplier.toString();
        comboTxt = comboTxt.concat("x");
        comboHandler.setComboText(comboTxt);
        comboHandler.setCompletion(comboTimer.getTime() / timeUntilComboOver);   
        comboHandler.update();
    }
    
    function getTargetAreaToAchieve(){
        return targetAreaToAchieve;
    }

    function getNumTargetsNeededHigherCombo(){
        return numTargetsNeededHigherCombo;
    }
    
    function recieveEvent(eventInfo){
        EventSystem.publishEventImmediately("score_achieved", chargeMultiplier * baseTargetCharge); 
        
        numTargetsAchievedSinceLastCombo++;
        if(numTargetsAchievedSinceLastCombo >= numTargetsNeededHigherCombo){
            increaseComboLevel();
            numTargetsAchievedSinceLastCombo = 0;
        }
    }
    
    return {
        increaseComboLevel: increaseComboLevel,
        update: update,
        getTargetAreaToAchieve: getTargetAreaToAchieve,
        resetCombo: resetCombo,
        draw: draw,
        getNumTargetsNeededHigherCombo: getNumTargetsNeededHigherCombo,
        initialize: initialize
    };
});