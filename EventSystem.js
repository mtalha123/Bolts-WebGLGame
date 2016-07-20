// EVENTS:  BorderCollisionEvent (Entity, coordinatesOfCollision), EntityCollisionEvent (entity1, entity2, coordinatesOfCollision), TargetClickedEvent(Target), TargetAchievedByUserEvent(Target), 
//          TargetLostFocusEvent(Target), TargetDestroyedEvent(Target)

define(['Events/BorderCollisionEvent', 'Events/TargetSpawnedEvent', 'Events/TargetDestroyedEvent'], function(BorderCollisionEvent, TargetSpawnedEvent, TargetDestroyedEvent){
    
    var allEvents = {
        bordercollision: function(){
            return new BorderCollisionEvent();
        },  
        entitycollision: function(){
            //FILL IN LATER
        },  
        targetclicked: function(){
            //FILL IN LATER
        },  
        targetlostfocus: function(){
            //FILL IN LATER
        },  
        targetdestroyed: function(){
            return new TargetDestroyedEvent();
        },
        targetspawned: function(){
            return new TargetSpawnedEvent();
        }
    };
    
    var currentEventsQueue = [];
    
    var subscribers = {
        E_bordercollision: [],  
        E_entitycollision: [],  
        E_targetclicked: [],  
        E_targetlostfocus: [],  
        E_targetdestroyed: [],
        E_targetspawned: []
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
    
    function publishEvent(eventObject){
        currentEventsQueue.push(eventObject);
    }
    
    function getEventObject(eventObjectType){
        return allEvents[eventObjectType]();
    }
    
    function update(){
        
        var eventBeingProcessed = currentEventsQueue.shift();
    
        while(eventBeingProcessed){
            for(var i = 0; i < subscribers[eventBeingProcessed.getType()].length; i++){
                subscribers[eventBeingProcessed.getType()][i].recieveEvent(eventBeingProcessed);
            }
            
            eventBeingProcessed = currentEventsQueue.shift();
        }
    }
    
    return {        
        initialize: initialize,
        register: register,
        publishEvent: publishEvent,
        getEventObject: getEventObject,
        update: update
    }
});