// EVENTS:  BorderCollisionEvent (Entity, coordinatesOfCollision), EntityCollisionEvent (entity1, entity2, coordinatesOfCollision), TargetClickedEvent(Target), TargetAchievedByUserEvent(Target), 
//          TargetLostFocusEvent(Target), TargetDestroyedEvent(Target)

define([], function(){
    
    var currentEventsQueue = [];
    
    var subscribers = {
        bordercollision: [],  
        entitycollision: [],    
        targetlostfocus: [],  
        targetdestroyed: [],
        targetspawned: [],
        targetinfocus: []
    };
    
    
    function initialize(){
    }
    
    function register(object, eventType){
        for(var key in subscribers){
            if(eventType === key){
                subscribers[key].push(object);
            } 
        }
    }
    
    function publishEvent(eventType, eventData){
        var eventType = eventType;
        var eventData = eventData;

        currentEventsQueue.push({eventType: eventType, eventData: eventData});
    }
    
    function update(){
        
        var eventBeingProcessed = currentEventsQueue.shift();

        while(eventBeingProcessed){
            for(var i = 0; i < subscribers[eventBeingProcessed.eventType].length; i++){
                subscribers[eventBeingProcessed.eventType][i].recieveEvent(eventBeingProcessed);
            }
            
            eventBeingProcessed = currentEventsQueue.shift();
        }
    }
    
    return {        
        initialize: initialize,
        register: register,
        publishEvent: publishEvent,
        update: update
    }
});