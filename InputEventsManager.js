define(['Cursor', 'EventSystem', 'Custom Utility/isObjectEmpty'], function(Cursor, EventSystem, isObjectEmpty){
    
    var inputObj = {
        mouseState: {
            type: undefined,
            xPos: undefined,
            yPos: undefined
        }
    };
    var mouseDown = false;
    
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
//        document.addEventListener("keypress", function(event){
//            handleKeyboardEvent("keypress", event);
//        });
//        document.addEventListener("keyup", function(event){
//            handleKeyboardEvent("keyup", event);
//        });
        
        appMetaData = p_appMetaData;
    }
    
    function notifyOfCurrentStateAndConsume(){
        var returnObject = inputObj;

        if(inputObj.mouseState.type){
            EventSystem.publishEventImmediately(inputObj.mouseState.type, {x: inputObj.mouseState.xPos, y: inputObj.mouseState.yPos});
    
            inputObj = {
                mouseState: {
                    type: undefined,
                    xPos: undefined,
                    yPos: undefined
                }
            };  
            
            return returnObject;
        }else{
            return undefined;
        }
    }
    
    function handleMouseEvent(eventType, eventData){        
        switch(eventType){
            case "mousedown":
                Cursor.press();
                mouseDown = true;
                inputObj.mouseState.type = "mouse_down";
                break;
            case "mouseup":
                Cursor.release();
                mouseDown = false;
                inputObj.mouseState.type = "mouse_up";
                break;
            case "mousemove":
                if(mouseDown){
                    inputObj.mouseState.type = "mouse_held_down"; 
                }else{
                    inputObj.mouseState.type = "mouse_move";
                }
                break;
        }
        inputObj.mouseState.xPos = eventData.clientX;
        inputObj.mouseState.yPos = appMetaData.getCanvasHeight() - eventData.clientY;
        
        Cursor.changePosition(eventData.clientX, appMetaData.getCanvasHeight() - eventData.clientY);
    }
    
//    function handleKeyboardEvent(eventType, eventData){
//        switch(eventType){
//            case "keypress":
//                mostRecentKeyPressed = String.fromCharCode(eventData.charCode);
//                
//                if(mostRecentKeyPressed === " "){
//                    keyboardStateChangedSinceLastConsume = true;
//                    mostRecentInput.keyboardState.type = "key_press";
//                }
//                break;
//            case "keyup":
//                if(mostRecentKeyPressed === " "){
//                    keyboardStateChangedSinceLastConsume = true;
//                    mostRecentInput.keyboardState.type = "key_up";
//                }
//                mostRecentKeyPressed = undefined;
//                break;
//        }
//    }
    
    
    return {
        initialize: initialize,
        notifyOfCurrentStateAndConsume: notifyOfCurrentStateAndConsume
    }
    
});