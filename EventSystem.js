define([], function(){
    
    var currentEventsQueue = [];
    
    var subscribers = {
        keydown: [],
        keyup: [],
        mouse_input_event: [],

        entity_spawned: [],
        entity_destroyed: [],
        captured_entity_destroyed: [],
        captured_entity_released_from_orbit: [],
        captured_entity_released_from_destruction_capture: [],
        entity_captured: [],
        game_lost: [],
        game_restart: [],
        game_level_up: [],
        lightning_stolen: [],
        lightning_returned: [],
        bonus_target_disintegrated: [],
        lightning_strike: [],
        entity_destroyed_by_lightning_strike: [],
        score_achieved: [],
        game_pause: [],
        game_resume: []
    };
    
    
    function register(callback, eventType, optObject ){
        for(var key in subscribers){
            if(eventType === key){
                if(optObject != undefined){
                    subscribers[key].push(optObject);
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
    
    function publishEventImmediately(eventType, eventData){
        var eventType = eventType;
        var eventData = eventData;

        for(var i = 0; i < subscribers[eventType].length; i++){
            if(typeof subscribers[eventType][i] === "function"){
                if(typeof subscribers[eventType][i-1] === "object"){
                    subscribers[eventType][i].call(subscribers[eventType][i-1], {eventType: eventType, eventData: eventData});
                }else{
                    subscribers[eventType][i]({eventType: eventType, eventData: eventData});
                }
            }
        }
    }

    return {        
        register: register,
        publishEvent: publishEvent,
        publishEventImmediately: publishEventImmediately,
        update: update
    }
});