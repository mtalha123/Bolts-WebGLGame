define(['Cursor'], function(Cursor){
    
    /*inputState obj organization:    
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
    var inputState = {
        mouseState: {
            clicked: false
        }
    };
    
    var stateChangedSinceLastConsume = false;
    
    function recieveEvent(type, event){
        stateChangedSinceLastConsume = true;
        
        switch(type){
            case "mousedown":
                Cursor.press();
                inputState.mouseState.clicked = true;
                break;
            case "mouseup":
                Cursor.release();
                inputState.mouseState.clicked = false;
                break;
        }
        inputState.mouseState.xPos = event.clientX;
        inputState.mouseState.yPos = event.clientY;
        
        Cursor.changePosition(event.clientX, event.clientY);
    }
    
    function consumeCurrentState(){
        if(stateChangedSinceLastConsume){
            stateChangedSinceLastConsume = false;
            return inputState;   
        }
        
        return undefined;
    }
    
    return {
        recieveEvent: recieveEvent,
        consumeCurrentState: consumeCurrentState
    }
    
});