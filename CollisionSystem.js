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
                        EventSystem.publishEvent("targetinfocus", {
                            Target: currentEntities[i],
                            x: Cursor.getX(),
                            y: Cursor.getY()
                        });
                    }
                }
            }             
            
        }
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.getType() === "targetspawned"){
            currentEntities.push(eventInfo.Target);
        }else if(eventInfo.getType() === "targetdestroyed"){
            
            for(var i = 0; i < currentEntities.length; i++){
                if(currentEntities[i].getId() === eventInfo.Target.getId()){
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