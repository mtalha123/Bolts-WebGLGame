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
    
    function initialize(canvas){
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
    }
    
//    function recieveEvent(type, event){
//        stateChangedSinceLastConsume = true;
//        
//        switch(type){
//            case "mousedown":
//                Cursor.press();
//                mostRecentInput.mouseState.type = "mousedown";
//                break;
//            case "mouseup":
//                Cursor.release();
//                mostRecentInput.mouseState.type = "mouseup";
//                break;
//            case "mousemove":
//                if(mostRecentInput.mouseState.type === "mousedown" || mostRecentInput.mouseState.type === "mousehelddown"){
//                    mostRecentInput.mouseState.type = "mousehelddown"; 
//                }else{
//                    mostRecentInput.mouseState.type = "mousemove";
//                }
//                break;
//            case "keydown":
//                if(!mostRecentInput.keyboardState.spacebarPressed){
//                    mostRecentInput.keyboardState.spacebarPressed = true;
//                }
//                break;
//            case "keyup":
//                
//                break;
//        }
//        mostRecentInput.mouseState.xPos = event.clientX;
//        mostRecentInput.mouseState.yPos = event.clientY;
//        
//        Cursor.changePosition(event.clientX, event.clientY);
//    }
    
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
        mostRecentInput.mouseState.yPos = eventData.clientY;
        
        Cursor.changePosition(eventData.clientX, eventData.clientY);
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



//
//if(this._mostRecentState){
//        var mostRecentMouseState = this._mostRecentState.mouseState;
//        
//        if(this._mouseClicked){
//            if(mostRecentMouseState.clicked){
//                this._EventSystem.publishEventImmediately("mousehelddown", {x: mostRecentMouseState.xPos, y: mostRecentMouseState.yPos});
//            }else{
//                this._EventSystem.publishEventImmediately("mouseup", {x: mostRecentMouseState.xPos, y: mostRecentMouseState.yPos});
//                this._mouseClicked = false;
//            }
//        }else{
//            if(mostRecentMouseState.clicked){
//                this._EventSystem.publishEventImmediately("mousedown", {x: mostRecentMouseState.xPos, y: mostRecentMouseState.yPos});
//                this._mouseClicked = true;
//            }else{
//                this._EventSystem.publishEventImmediately("mousemove", {x: mostRecentMouseState.xPos, y: mostRecentMouseState.yPos});
//            }
//        }
//    }