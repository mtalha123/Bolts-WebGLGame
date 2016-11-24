define(['Cursor', 'EventSystem'], function(Cursor, EventSystem){
    
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
        }
    };
    
    var stateChangedSinceLastConsume = false;
    
    
    function recieveEvent(type, event){
        stateChangedSinceLastConsume = true;
        
        switch(type){
            case "mousedown":
                Cursor.press();
                mostRecentInput.mouseState.type = "mousedown";
                break;
            case "mouseup":
                Cursor.release();
                mostRecentInput.mouseState.type = "mouseup";
                break;
            case "mousemove":
                if(mostRecentInput.mouseState.type === "mousedown" || mostRecentInput.mouseState.type === "mousehelddown"){
                    mostRecentInput.mouseState.type = "mousehelddown"; 
                }else{
                    mostRecentInput.mouseState.type = "mousemove";
                }
                break;
        }
        mostRecentInput.mouseState.xPos = event.clientX;
        mostRecentInput.mouseState.yPos = event.clientY;
        
        Cursor.changePosition(event.clientX, event.clientY);
    }
    
    function notifyOfCurrentStateAndConsume(){
        if(stateChangedSinceLastConsume){
            stateChangedSinceLastConsume = false;
            EventSystem.publishEventImmediately(mostRecentInput.mouseState.type, {x: mostRecentInput.mouseState.xPos, y: mostRecentInput.mouseState.yPos});
            return mostRecentInput;   
        }
        
        return undefined;
    }
    
    
    return {
        recieveEvent: recieveEvent,
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