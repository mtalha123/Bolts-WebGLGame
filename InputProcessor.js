define(['Border', 'EventSystem', 'Cursor', 'SynchronizedTimers', 'ComboSystem'], function(Border, EventSystem, Cursor, SynchronizedTimers, ComboSystem){
    
    var currentEntities = [];
    var currentTargetInFocus = undefined;
    var inputToBeProcessed = {
        mouseState: undefined,
        keyboardState: undefined
    };
    
    var startXInTarget, startYInTarget, targetDistCovered = 0;
    
    var numTargetsAchievedSinceLastCombo = 0;
    
    function initialize(){
        EventSystem.register(recieveEvent, "target_spawned"); 
        
        EventSystem.register(recieveEvent, "mouse_move");
        EventSystem.register(recieveEvent, "mouse_down");
        EventSystem.register(recieveEvent, "mouse_up");
        EventSystem.register(recieveEvent, "mouse_held_down");
        EventSystem.register(recieveEvent, "key_press");
    }
    
    function update(){
        ComboSystem.update();       
        
        if(inputToBeProcessed.mouseState){
            var mouseState = inputToBeProcessed.mouseState;

            switch(mouseState.type){
                case "mouse_held_down":
                    var entityPossiblyFocused = isInsideAnyEntityBoundary(mouseState.x, mouseState.y);
                    if(entityPossiblyFocused){
                        if(entityPossiblyFocused === currentTargetInFocus){
                            if(startXInTarget && startYInTarget){
                                var mouseXRelativeToTarget = mouseState.x - currentTargetInFocus.getX();
                                var mouseYRelativeToTarget = mouseState.y - currentTargetInFocus.getY();

                                targetDistCovered += distanceBetween(startXInTarget, startYInTarget, mouseXRelativeToTarget, mouseYRelativeToTarget);

                                startXInTarget = mouseXRelativeToTarget;
                                startYInTarget = mouseYRelativeToTarget;
                                
                                if(targetDistCovered >= ComboSystem.getTargetAreaToAchieve()){
                                    numTargetsAchievedSinceLastCombo++;
                                    console.log("TARGET ACHIEVED@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2");
                                    EventSystem.publishEventImmediately("target_destroyed", {target: currentTargetInFocus});
                                    
                                    console.log("NUM TARGETS NEEDED FOR HIGHER COMBO: " + ComboSystem.getNumTargetsNeededHigherCombo());
                                    if(numTargetsAchievedSinceLastCombo >= ComboSystem.getNumTargetsNeededHigherCombo()){
                                        ComboSystem.increaseTotalStoredCharge();
                                        ComboSystem.increaseComboLevel();
                                        numTargetsAchievedSinceLastCombo = 0;
                                    }
                                    
                                    targetDistCovered = 0;                                    
                                    currentTargetInFocus = undefined;
                                }
                            }

                        }else{
                            targetBecomeUnfocused(currentTargetInFocus);
                            targetBecameFocused(entityPossiblyFocused, mouseState.x, mouseState.y);
                        }
                    }else{
                        if(currentTargetInFocus){
                            targetBecomeUnfocused();
                        }
                    }

                    break;
                case "mouse_down":
                    var entityPossiblyFocused = isInsideAnyEntityBoundary(mouseState.x, mouseState.y);

                    if(entityPossiblyFocused){
                        targetBecameFocused(entityPossiblyFocused, mouseState.x, mouseState.y);
                    }            
                    break;
                case "mouse_move":
                    if(currentTargetInFocus){
                        ///DOO THE RADIUS CHECK THING
                    }
                    break;
                case "mouse_up":
                    if(currentTargetInFocus){
                        targetBecomeUnfocused();
                    }
                    break;
            }
        }
            
        if(inputToBeProcessed.keyboardState){
            releaseScoreAndResetComboStuff();
        }

        inputToBeProcessed = {
            mouseState: undefined,
            keyboardState: undefined
        };
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "target_spawned"){
            currentEntities.push(eventInfo.eventData.Target);
        }else if(eventInfo.eventType === "key_press"){
            inputToBeProcessed.keyboardState = eventInfo.eventData;
            inputToBeProcessed.keyboardState.type = eventInfo.eventType;
        }else{
            inputToBeProcessed.mouseState = eventInfo.eventData;
            inputToBeProcessed.mouseState.type = eventInfo.eventType;
        }
    }
    
    function recieveFromServer(data){
        //console.log("TARGET COLLISION RECIEVED: " + JSON.stringify(data));
    }
    
    function isInsideAnyEntityBoundary(checkX, checkY){
        for(var i = 0; i < currentEntities.length; i++){
            var isInsideLeftAndRightBoundary = (checkX >= currentEntities[i].getX()) && (checkX <= (currentEntities[i].getX() + (currentEntities[i].getRadius()*2)) );
            var isInsideTopAndBottomBoundary = (checkY >= currentEntities[i].getY()) && (checkY <= (currentEntities[i].getY() + (currentEntities[i].getRadius()*2)) );
             
            if(isInsideLeftAndRightBoundary && isInsideTopAndBottomBoundary){
                return currentEntities[i];
            }
        }
        return false;
    }
    
    function deleteTarget(){
        for(var i = 0; i < currentEntities.length; i++){
            if(currentEntities[i].getId() === eventInfo.eventData.getId()){
                currentEntities[i].splice(i, 1);    
            }
        }
    }
    
    function distanceBetween(startX, startY, endX, endY){
        return Math.sqrt( Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2) );
    }

    function targetBecameFocused(targetfocused, whereX, whereY){
        currentTargetInFocus = targetfocused;
        startXInTarget = whereX - currentTargetInFocus.getX();
        startYInTarget = whereY - currentTargetInFocus.getY();
        EventSystem.publishEvent("target_in_focus", { target: currentTargetInFocus });
    }

    function targetBecomeUnfocused(){
        EventSystem.publishEvent("target_out_of_focus", { target: currentTargetInFocus });
        currentTargetInFocus = undefined;   
        targetDistCovered = 0;
        startXInTarget = undefined, startYInTarget = undefined;
    }
    
    function handleTargetAchieved(){
    }
    
    function releaseScoreAndResetComboStuff(){
        EventSystem.publishEventImmediately("score_achieved", ComboSystem.getTotalStoredCharge());        
        ComboSystem.resetCombo();
    } 
    
    return {
        initialize: initialize,
        update: update,
        recieveFromServer: recieveFromServer
    };
    
    
});