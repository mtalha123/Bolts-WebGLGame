define(['Border', 'EventSystem', 'Cursor'], function(Border, EventSystem, Cursor){
    
    var currentEntities = [];
    var currentTargetInFocus = undefined;
    
    function initialize(){
        EventSystem.register(recieveEvent, "targetspawned");  
        EventSystem.register(recieveEvent, "targetdestroyed");
        EventSystem.register(recieveEvent, "S_targetinfocus");
    }
    
    function update(){
        if(Cursor.isMouseButtonHeldDown()){
            var possibleFocusedEntity = isInsideAnyEntityBoundary(Cursor.getX(), Cursor.getY());

            if(possibleFocusedEntity){
                if(currentTargetInFocus === possibleFocusedEntity){
                    // RADIUS CHECK THING
                }else{
                    currentTargetInFocus = possibleFocusedEntity;
                    EventSystem.publishEvent("targetinfocus", {
                        Target: currentEntities[i],
                        x: Cursor.getX(),
                        y: Cursor.getY()
                    });   
                }   
            }else {
                currentTargetInFocus = undefined;
            }
            
        }else {
            currentTargetInFocus = undefined;
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "S_targetinfocus"){
        }else if(eventInfo.eventType === "targetspawned"){
            currentEntities.push(eventInfo.eventData.Target);
        }else if(eventInfo.eventType === "targetdestroyed"){
            
            for(var i = 0; i < currentEntities.length; i++){
                if(currentEntities[i].getId() === eventInfo.eventData.getId()){
                    currentEntities[i].splice(i, 1);    
                }
            }
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
    
    return {
        initialize: initialize,
        update: update,
        recieveFromServer: recieveFromServer
    };
    
    
});