define(['Cursor', 'EventSystem', 'Custom Utility/Vector'], function(Cursor, EventSystem, Vector){
    
    var inputObj = {
        mouseState: {
            type: undefined,
            x: undefined,
            y: undefined
        },
        keyboardState: {
            type: undefined,
            key: undefined
        }
    };
    var leftMouseDown = false;
    var rightMouseDown = false;
    
    var keyHeldDown = false;
    
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
        document.addEventListener("keydown", function(event){
            handleKeyboardEvent("keydown", event);
        });
        document.addEventListener("keyup", function(event){
            handleKeyboardEvent("keyup", event);
        });
        
        appMetaData = p_appMetaData;
    }
    
    function notifyOfCurrentStateAndConsume(){
        if(inputObj.mouseState.type){
            EventSystem.publishEventImmediately(inputObj.mouseState.type, {x: inputObj.mouseState.x, y: inputObj.mouseState.y});
    
            inputObj.mouseState = {
                type: undefined,
                x: undefined,
                y: undefined
            };  
        }
        
        if(inputObj.keyboardState.type){
            EventSystem.publishEventImmediately(inputObj.keyboardState.type, {key: inputObj.keyboardState.key});
    
            inputObj.keyboardState = {
                type: undefined,
                x: undefined,
                y: undefined
            };  
        }
    }
    
    function handleMouseEvent(eventType, eventData){        
        switch(eventType){
            case "mousedown":
                if(eventData.button === 0){ // left click
                    Cursor.press();
                    inputObj.mouseState.type = "left_mouse_down";
                    leftMouseDown = true;
                }else if(eventData.button === 2){ // right click
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
    
    function handleKeyboardEvent(eventType, eventData){
        var key = String.fromCharCode(eventData.keyCode);
        if(key === "P" || key === "p"){
            if(eventType === "keydown"){
                if(keyHeldDown === false){
                    keyHeldDown = true;
                    inputObj.keyboardState.type = eventType;
                }
            }else if(eventType === "keyup"){
                keyHeldDown = false;
                inputObj.keyboardState.type = eventType;
            }
            
            inputObj.keyboardState.key = key;
        }
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