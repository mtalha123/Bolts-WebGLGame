define([], function(){
    
    var currentEventsQueue = [];
    
    var subscribers = {
        mouse_move: [],
        mouse_down: [],
        mouse_up: [],
        mouse_held_down: [],
        key_press: [],
        key_held_down: [],
        key_up: [],
        
        S_initialize: [],    
        entity_spawned: [],
        entity_destroyed: [],
        captured_entity_destroyed: [],
        captured_entity_released: [],
        entity_captured: [],
        score_achieved: [],
        combo_level_increased: [],
        combo_level_reset: [],
        game_lost: [],
        game_restart: [],
        game_level_up: [],
        lightning_stolen: []
    };
    
    
    function initialize(){
    }
    
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
        initialize: initialize,
        register: register,
        publishEvent: publishEvent,
        publishEventImmediately: publishEventImmediately,
        update: update
    }
});