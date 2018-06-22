define(['EventSystem', 'SynchronizedTimers', 'Custom Utility/Vector'], function(EventSystem, SynchronizedTimers, Vector){
    var timeUntilComboOver = 2000;
    var comboTimer = SynchronizedTimers.getTimer();
    var numTargetsNeededHigherCombo = 1;
    var currentComboLevel = 1;
    var maxComboLevel = 10;
    var numTargetsAchievedSinceLastCombo = 0;
    var comboHandler;
    EventSystem.register(receiveEvent, "entity_destroyed");
    EventSystem.register(receiveEvent, "game_restart");
    EventSystem.register(receiveEvent, "entity_destroyed_by_lightning_strike");
    
    function initialize(gl, EffectsManager, Border){
        comboHandler = EffectsManager.requestComboEffect(false, gl, 0, new Vector(Border.getLeftX(), Border.getTopY()), {}, "1x");
    }
    
    function update(){
        if(comboTimer.getTime() >= timeUntilComboOver){
            comboTimer.reset();
            resetCombo();
        }
    }
    
    function increaseComboLevel(){
        if(currentComboLevel < maxComboLevel){
            currentComboLevel++;
            
            if(currentComboLevel <= 4){
                timeUntilComboOver -= 300;
            }else if(currentComboLevel <= 8){
                timeUntilComboOver -= 150;
            }else {
                timeUntilComboOver -= 100;
            }

            if(currentComboLevel > 1 && currentComboLevel < 7){
                numTargetsNeededHigherCombo = 2;
            }else{
                numTargetsNeededHigherCombo = 3;
            }
        }
        
        comboHandler.shouldDraw(true);
        comboTimer.reset();
        comboTimer.start();
    }
    
    function resetCombo(){        
        timeUntilComboOver = 2000;
        comboTimer.reset();
        currentComboLevel = 1;
        numTargetsNeededHigherCombo = 1;
        
        comboHandler.shouldDraw(false);
    }
    
    function draw(){        
        var comboTxt = currentComboLevel.toString();
        comboTxt = comboTxt.concat("x");
        comboHandler.setComboText(comboTxt);
        comboHandler.setCompletion(comboTimer.getTime() / timeUntilComboOver);   
        comboHandler.update();
    }
    
    function receiveEvent(eventInfo){
        if(eventInfo.eventType === "entity_destroyed" || eventInfo.eventType === "entity_destroyed_by_lightning_strike"){
            EventSystem.publishEventImmediately("score_achieved", {amount: eventInfo.eventData.entity.getScoreWorth() * currentComboLevel})
            
            numTargetsAchievedSinceLastCombo++;
            if(numTargetsAchievedSinceLastCombo >= numTargetsNeededHigherCombo){
                increaseComboLevel();
                numTargetsAchievedSinceLastCombo = 0;
            }
        }else if(eventInfo.eventType === "game_restart"){
            resetCombo();
        }
    }
    
    return {
        update: update,
        draw: draw,
        initialize: initialize
    };
});