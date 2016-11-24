define(['Border', 'EventSystem', 'Cursor'], function(Border, EventSystem, Cursor){
    
    var currentEntities = [];
    var currentTargetInFocus = undefined;
    var inputToBeProcessed = {};
    
    var startX, startY, distRadiusCounter = 0;
    
    function initialize(){
        EventSystem.register(recieveEvent, "targetspawned"); 
        
        EventSystem.register(recieveEvent, "mousemove");
        EventSystem.register(recieveEvent, "mousedown");
        EventSystem.register(recieveEvent, "mouseup");
        EventSystem.register(recieveEvent, "mousehelddown");
    }
    
    function update(){
        if(inputToBeProcessed){
            var mouseState = inputToBeProcessed;

            switch(inputToBeProcessed.type){
                case "mousehelddown":
                    var entityPossiblyFocused = isInsideAnyEntityBoundary(mouseState.x, mouseState.y);

                    if(entityPossiblyFocused){
                        if(entityPossiblyFocused === currentTargetInFocus){
                            if(startX && startY){
                                var mouseXRelativeToTarget = mouseState.x - currentTargetInFocus.getX();
                                var mouseYRelativeToTarget = mouseState.y - currentTargetInFocus.getY();

                                if(distanceBetween(startX, startY, mouseXRelativeToTarget, mouseYRelativeToTarget) >= currentTargetInFocus.getRadius()){
                                    distRadiusCounter++;
                                    startX = mouseXRelativeToTarget;
                                    startY = mouseYRelativeToTarget;

                                    if(distRadiusCounter >= 2){
                                        console.log("TARGET ACHIEVED@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2");
                                        EventSystem.publishEventImmediately("targetdestroyed", {target: currentTargetInFocus});
                                        distRadiusCounter = 0;
                                        //currentTargetInFocus = undefined;
                                    }
                                }

                            }

                        }else{
                            targetBecameFocused(entityPossiblyFocused, mouseState.x, mouseState.y);
                        }
                    }else{
                        if(currentTargetInFocus){
                            targetBecomeUnfocused();
                        }
                    }

                    break;
                case "mousedown":
                    var entityPossiblyFocused = isInsideAnyEntityBoundary(mouseState.x, mouseState.y);

                    if(entityPossiblyFocused){
                        targetBecameFocused(entityPossiblyFocused, mouseState.x, mouseState.y);
                    }            
                    break;
                case "mousemove":
                    if(currentTargetInFocus){
                        ///DOO THE RADIUS CHECK THING
                    }
                    break;
                case "mouseup":
                    if(currentTargetInFocus){
                        targetBecomeUnfocused();
                    }
                    break;
            }

            inputToBeProcessed = undefined;
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "targetspawned"){
            currentEntities.push(eventInfo.eventData.Target);
        }else{
            //console.log("STRINGIFIED: " + JSON.stringify(eventInfo));
            inputToBeProcessed = eventInfo.eventData;
            inputToBeProcessed.type = eventInfo.eventType;
        }
    }
    
    function recieveFromServer(data){
        console.log("TARGET COLLISION RECIEVED: " + JSON.stringify(data));
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
        console.log("TARGET IN FOCUS!!!!");
        startX = whereX;
        startY = whereY;
        EventSystem.publishEvent("targetinfocus", { target: currentTargetInFocus });
    }

    function targetBecomeUnfocused(){
        EventSystem.publishEvent("targetoutoffocus", { target: currentTargetInFocus });
        currentTargetInFocus = undefined;   
        distRadiusCounter = 0;
        startX = undefined, startY = undefined;
    }
    
    return {
        initialize: initialize,
        update: update,
        recieveFromServer: recieveFromServer
    };
    
    
});