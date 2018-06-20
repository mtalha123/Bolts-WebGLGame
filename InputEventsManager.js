define(['Cursor', 'EventSystem', 'Custom Utility/isObjectEmpty', 'Custom Utility/Vector'], function(Cursor, EventSystem, isObjectEmpty, Vector){
    
    var inputObj = {
        mouseState: {
            type: undefined,
            x: undefined,
            y: undefined
        }
    };
    var leftMouseDown = false;
    var rightMouseDown = false;
    
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
        
        canvas.addEventListener("contextmenu", function(event){
            event.preventDefault();
            return false;
        });
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
            EventSystem.publishEventImmediately(inputObj.mouseState.type, {x: inputObj.mouseState.x, y: inputObj.mouseState.y});
    
            inputObj = {
                mouseState: {
                    type: undefined,
                    x: undefined,
                    y: undefined
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
                if(event.button === 0){ // left click
                    Cursor.press();
                    inputObj.mouseState.type = "left_mouse_down";
                    leftMouseDown = true;
                }else if(event.button === 2){ // right click
                    inputObj.mouseState.type = "right_mouse_down";
                    rightMouseDown = true;
                }
                
                break;
            case "mouseup":
                Cursor.release();
                leftMouseDown = false;
                rightMouseDown = false;
                inputObj.mouseState.type = "mouse_up";
                break;
            case "mousemove":
                if(leftMouseDown){
                    inputObj.mouseState.type = "left_mouse_held_down"; 
                }else if(rightMouseDown){
                    inputObj.mouseState.type = "right_mouse_held_down";
                }else{
                    inputObj.mouseState.type = "mouse_move";
                }
                break;
        }
        inputObj.mouseState.x = eventData.clientX;
        inputObj.mouseState.y = appMetaData.getCanvasHeight() - eventData.clientY;
        
        Cursor.changePosition(new Vector(eventData.clientX, appMetaData.getCanvasHeight() - eventData.clientY));
    }
    
    function getCurrentInputObj(){
        return inputObj;
    }
    
    
    return {
        initialize: initialize,
        notifyOfCurrentStateAndConsume: notifyOfCurrentStateAndConsume,
        getCurrentInputObj: getCurrentInputObj
    }
    
});