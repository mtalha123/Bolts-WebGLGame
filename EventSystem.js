// EVENTS:  BorderCollisionEvent (Entity, coordinatesOfCollision), EntityCollisionEvent (entity1, entity2, coordinatesOfCollision), TargetClickedEvent(Target), TargetAchievedByUserEvent(Target), 
//          TargetLostFocusEvent(Target), TargetDestroyedEvent(Target)

define([], function(){
    
    var currentEventsQueue = [];
    
    var subscribers = {
        mousemove: [],
        mousedown: [],
        mouseup: [],
        
        S_initialize: [],
        S_gameupdate: [],
        bordercollision: [],  
        entitycollision: [],    
        targetlostfocus: [],  
        targetdestroyed: [],
        targetspawned: [],
        targetinfocus: []
    };
    
    
    function initialize(){
    }
    
    function register(callback, eventType, object ){
        for(var key in subscribers){
            if(eventType === key){
                if(object != undefined){
                    subscribers[key].push(object);
                }
                subscribers[key].push(callback);
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
                if(typeof subscribers[eventBeingProcessed.eventType][i] === "function"){
                    if(typeof subscribers[eventBeingProcessed.eventType][i-1] === "object"){
                        subscribers[eventBeingProcessed.eventType][i].call(subscribers[eventBeingProcessed.eventType][i-1], eventBeingProcessed);
                    }else{
                        subscribers[eventBeingProcessed.eventType][i](eventBeingProcessed);
                    }
                }
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