define(['Border', 'EventSystem', 'Cursor'], function(Border, EventSystem, Cursor){
    
    var currentEntities = [];
    
    function initialize(){
        EventSystem.register(recieveEvent, "targetspawned");  
        EventSystem.register(recieveEvent, "targetdestroyed");
        EventSystem.register(recieveEvent, "S_targetinfocus");
    }
    
    function update(){
        for(var i = 0; i < currentEntities.length; i++){
            if(Cursor.getX() >= currentEntities[i].getX() && (Cursor.getX() <= currentEntities[i].getX() + (currentEntities[i].getRadius()*2)) ){
                if(Cursor.getY() >= currentEntities[i].getY() && (Cursor.getY() <= currentEntities[i].getY() + (currentEntities[i].getRadius()*2)) ){
                    if(Cursor.isMouseButtonHeldDown()){
//                        EventSystem.publishEvent("targetinfocus", {
//                            Target: currentEntities[i],
//                            x: Cursor.getX(),
//                            y: Cursor.getY()
//                        });
                    }
                }
            }             
            
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "S_targetinfocus"){
            //console.log("TARGETINFOCUS");
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
        console.log("TARGETINFOCUS: " + data);
    }
    
    return {
        initialize: initialize,
        update: update,
        recieveFromServer: recieveFromServer
    };
    
    
});