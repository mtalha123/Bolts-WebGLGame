define(['BorderLightning', 'EventSystem'], function(BorderLightning, EventSystem){
    
    var currentEntities = [];
    
    function initialize(){
        EventSystem.register(this, "E_targetspawned");  
        EventSystem.register(this, "E_targetdestroyed");
    }
    
    function checkBorderCollisions(){
        
        for(var i = 0; i < currentEntities.length; i++){
            
            if(currentEntities[i].getX() < 0){
                var eventObject = EventSystem.getEventObject("bordercollision");
                eventObject.setProperties(currentEntities[i], currentEntities[i].getX(), currentEntities[i].getY(), "left");
                EventSystem.publishEvent(eventObject);
            }
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.getType() === "E_targetspawned"){
            currentEntities.push(eventInfo.getTarget());
            
        }else if(eventInfo.getType() === "E_targetdestroyed"){
            
            for(var i = 0; i < currentEntities.length; i++){
                if(currentEntities[i].getId() === eventInfo.getTarget().getId()){
                    currentEntities[i].splice(i, 1);    
                }
            }
        }
    }
    
    return {
        initialize: initialize,
        checkBorderCollision: checkBorderCollisions,
        recieveEvent: recieveEvent
    };
    
    
});