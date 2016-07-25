define(['Border', 'EventSystem', 'Cursor'], function(Border, EventSystem, Cursor){
    
    var currentEntities = [];
    
    function initialize(){
        EventSystem.register(this, "targetspawned");  
        EventSystem.register(this, "targetdestroyed");
    }
    
    function update(){
        for(var i = 0; i < currentEntities.length; i++){
            if(Cursor.getX() >= currentEntities[i].getX() && (Cursor.getX() <= currentEntities[i].getX() + (currentEntities[i].getRadius()*2)) ){
                if(Cursor.getY() >= currentEntities[i].getY() && (Cursor.getY() <= currentEntities[i].getY() + (currentEntities[i].getRadius()*2)) ){
                    if(Cursor.isMouseButtonHeldDown()){
                        var eventObject = EventSystem.getEventObject("targetinfocus");
                        eventObject.setProperties(currentEntities[i], Cursor.getX(), Cursor.getY());
                        EventSystem.publishEvent(eventObject);
                    }
                }
            }             
            
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.getType() === "targetspawned"){
            currentEntities.push(eventInfo.getTarget());
        }else if(eventInfo.getType() === "targetdestroyed"){
            
            for(var i = 0; i < currentEntities.length; i++){
                if(currentEntities[i].getId() === eventInfo.getTarget().getId()){
                    currentEntities[i].splice(i, 1);    
                }
            }
        }
    }
    
    return {
        initialize: initialize,
        update: update,
        recieveEvent: recieveEvent
    };
    
    
});