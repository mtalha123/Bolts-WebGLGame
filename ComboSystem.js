define(['EventSystem', 'SynchronizedTimers', 'Custom Utility/Vector'], function(EventSystem, SynchronizedTimers, Vector){
    var timeUntilComboOver = 2000;
    var comboTimer = SynchronizedTimers.getTimer();
    var numTargetsNeededHigherCombo = 1;
    var currentComboLevel = 1;
    var maxComboLevel = 10;
    var numTargetsAchievedSinceLastCombo = 0;
    var comboHandler;
    var comboTextHandler;
    EventSystem.register(receiveEvent, "entity_destroyed");
    EventSystem.register(receiveEvent, "game_restart");
    EventSystem.register(receiveEvent, "entity_destroyed_by_lightning_strike");
    
    function initialize(gl, canvasHeight, EffectsManager, Border, TextManager){
        var radius = canvasHeight * 0.06;   
        var center = new Vector(Border.getLeftX() + (radius * 1.5), Border.getTopY() - (radius * 1.5));
        comboHandler = EffectsManager.requestComboEffect(false, gl, 0, center, {radius: [radius], spreadOfEdgeEffect: [canvasHeight * 0.015]});
        comboTextHandler = TextManager.requestTextHandler("Comic Sans MS", [255, 0, 0, 1.0], canvasHeight * 0.05, center, "", false);
        comboTextHandler.setShadowColor("red");
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
        comboTextHandler.shouldDraw(true);
        comboTimer.reset();
        comboTimer.start();
    }
    
    function resetCombo(){        
        timeUntilComboOver = 2000;
        comboTimer.reset();
        currentComboLevel = 1;
        numTargetsNeededHigherCombo = 1;
        
        comboHandler.shouldDraw(false);
        comboTextHandler.shouldDraw(false);
    }
    
    function draw(){        
        var comboTxt = currentComboLevel.toString();
        comboTxt = comboTxt.concat("x");
        comboTextHandler.setText(comboTxt);
        comboHandler.setCompletion(comboTimer.getTime() / timeUntilComboOver);   
        comboHandler.update();
        comboTextHandler.draw();
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