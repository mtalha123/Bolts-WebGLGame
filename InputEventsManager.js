define(['Cursor', 'EventSystem', 'Custom Utility/isObjectEmpty'], function(Cursor, EventSystem, isObjectEmpty){
    
    /*mostRecentInput obj organization:    
    { 
        mouseState: {
            xPos: the x position,
            yPos: the y position,
            clicked: whether the left click has been clicked
        },
        keyboardState: {
            spacebarPressed = false OR true
        }
    }
       */
    
    var mostRecentInput = {
        mouseState: {
            type: undefined
        },
        keyboardState: {
            type: undefined
        }
    };
    
    var keyboardStateChangedSinceLastConsume = false;
    var mouseStateChangedSinceLastConsume = false;
    
    var mostRecentKeyPressed;
    
    var appMetaData;
    
    function initialize(canvas, p_appMetaData){
        canvas.addEventListener("mousemove", function(event){
            handleMouseEvent("mousemove", event);
        }, false);    
        canvas.addEventListener("mousedown", function(event){
           handleMouseEvent("mousedown", event);
        }, false);    
        canvas.addEventListener("mouseup", function(event){
           handleMouseEvent("mouseup", event);
        }, false);
        document.addEventListener("keypress", function(event){
            handleKeyboardEvent("keypress", event);
        });
        document.addEventListener("keyup", function(event){
            handleKeyboardEvent("keyup", event);
        });
        
        appMetaData = p_appMetaData;
    }
    
    function notifyOfCurrentStateAndConsume(){
        var returnObject = {};
        
        if(mouseStateChangedSinceLastConsume){
            mouseStateChangedSinceLastConsume = false;
            EventSystem.publishEventImmediately(mostRecentInput.mouseState.type, {x: mostRecentInput.mouseState.xPos, y: mostRecentInput.mouseState.yPos});
            returnObject.mouseState = mostRecentInput.mouseState;   
        }
        
        if(keyboardStateChangedSinceLastConsume){
            keyboardStateChangedSinceLastConsume = false;
            EventSystem.publishEventImmediately(mostRecentInput.keyboardState.type, {});
            returnObject.keyboardState = mostRecentInput.keyboardState;
        }
        
        if(isObjectEmpty(returnObject)){
            return undefined;
        }else{
            return returnObject;   
        }
    }
    
    function handleMouseEvent(eventType, eventData){
        mouseStateChangedSinceLastConsume = true;
        
        switch(eventType){
            case "mousedown":
                Cursor.press();
                mostRecentInput.mouseState.type = "mouse_down";
                break;
            case "mouseup":
                Cursor.release();
                mostRecentInput.mouseState.type = "mouse_up";
                break;
            case "mousemove":
                if(mostRecentInput.mouseState.type === "mouse_down" || mostRecentInput.mouseState.type === "mouse_held_down"){
                    mostRecentInput.mouseState.type = "mouse_held_down"; 
                }else{
                    mostRecentInput.mouseState.type = "mouse_move";
                }
                break;
        }
        mostRecentInput.mouseState.xPos = eventData.clientX;
        mostRecentInput.mouseState.yPos = appMetaData.getCanvasHeight() - eventData.clientY;
        
        Cursor.changePosition(eventData.clientX, appMetaData.getCanvasHeight() - eventData.clientY);
    }
    
    function handleKeyboardEvent(eventType, eventData){
        switch(eventType){
            case "keypress":
                mostRecentKeyPressed = String.fromCharCode(eventData.charCode);
                
                if(mostRecentKeyPressed === " "){
                    keyboardStateChangedSinceLastConsume = true;
                    mostRecentInput.keyboardState.type = "key_press";
                }
                break;
            case "keyup":
                if(mostRecentKeyPressed === " "){
                    keyboardStateChangedSinceLastConsume = true;
                    mostRecentInput.keyboardState.type = "key_up";
                }
                mostRecentKeyPressed = undefined;
                break;
        }
    }
    
    
    return {
        initialize: initialize,
        notifyOfCurrentStateAndConsume: notifyOfCurrentStateAndConsume
    }
    
});