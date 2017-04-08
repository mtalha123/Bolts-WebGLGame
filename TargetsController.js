define(['Target', 'Custom Utility/Timer', 'Border', 'Custom Utility/Random', 'EventSystem'], function(Target, Timer, Border, Random, EventSystem){
    var targetsPool = [];
    var targetsActivated = [];
    var numTargets = 2;
    var authUpdateData = {};
    var canvasWidth, canvasHeight;
    var previousStates = [];

    //counts the number of updates until the next spawn
    var spawnCountDown = 20;
    
    function initialize(p_canvasWidth, p_canvasHeight, initializeData){
        canvasWidth = p_canvasWidth;
        canvasHeight = p_canvasHeight;
        
        var i = 0;
        for(var key in initializeData){
            targetsPool[i] = new Target(key, canvasWidth, canvasHeight, 60, 8, initializeData[key].x, canvasHeight - initializeData[key].y, initializeData[key].movementAngle, initializeData[key].speed);
            i++;
        }
        
        console.log("INITIALIZEDATA: " + JSON.stringify(initializeData));

        EventSystem.register(recieveEvent, "target_destroyed");
        EventSystem.register(recieveEvent, "S_game_update");
        EventSystem.register(recieveEvent, "S_initialize");
    }
    
    function draw(interpolation){
        for(var a = 0; a < targetsActivated.length; a++){
            targetsActivated[a].draw(interpolation);
        }
    }
    
    function update(){
        if(targetsPool.length > 0){
            spawnCountDown--;
            
            if(spawnCountDown <= 0){
                spawn();                
                spawnCountDown = 20;
            }
        }
        
//        if(spawnCountDown <= 0){
//            if(targetsPool.length > 0){
//                console.log("SPAWNED: " + Date.now());
//                spawn();
//            }
//            spawnCountDown = 40;
//        }

        for(var a = 0; a < targetsActivated.length; a++){
            targetsActivated[a].update();
        }
    }
    
    function serverUpdate(data){        
        for(var key in data){
            if(data[key].type === "spawn"){                
                if(!checkInPreviousStatesAndDeletePriorStatesIfSuccess(key, data[key].x, data[key].y)){
                
                    console.error("TargetsController - Server stuff not detected in previous states!");
                    
                    for(var b = 0; b < targetsPool.length; b++){
                        if(key === targetsPool[b].getId()){
                            var newlyActivatedTarget = targetsPool.splice(b, 1)[0];
                            newlyActivatedTarget.addToPhysicsSimulation();
                            newlyActivatedTarget.setMovementAngle(data[key].movementAngle);
                            newlyActivatedTarget.serverUpdate(data[key].x, data[key].y, key, data[key].linX, data[key].linY);
                            targetsActivated.push(newlyActivatedTarget);
                            
                            saveCurrentState(newlyActivatedTarget.getId(), data[key].x, data[key].y);
                            
                            EventSystem.publishEvent("target_spawned", {
                                Target: newlyActivatedTarget,
                                x: data[key].x,
                                y: data[key].y
                            });
                        }
                    }
                }                
                
            }else{
                for(var i = 0; i < targetsActivated.length; i++){
                    if(key === targetsActivated[i].getId()){
                        targetsActivated[i].serverUpdate(data[key].x, data[key].y, key, data[key].linX, data[key].linY);
                    }
                }
            }
        }
    }
    
    function checkIfTargetIsActivated(targetId){
        for(var i = 0; i < targetsActivated.length; i++){
            if(targetId === targetsActivated[i].getId()){
                return true;       
            }
        }
        
        return false;
    }
    
    function getTargetById(targetId){
        
    }
    
    function checkInPreviousStatesAndDeletePriorStatesIfSuccess(targetid, x, y){
        return true;
        for(var a = 0; a < previousStates.length; a++){
            if(targetid === previousStates[a].targetId && x === previousStates[a].spawnX && y === previousStates[a].spawnY){
                previousStates.splice(0, a + 1);
                return true;                
            }
        }
        
        return false;
    }
    
    function spawn(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        
        var newlyActivatedTarget = targetsPool.shift();   
        newlyActivatedTarget.addToPhysicsSimulation();
        
        switch(random){
            case 1:
                spawnX = Border.getLeftX();
                spawnY = Random.getRandomInt(Border.getTopY(), Border.getBottomY());
                newlyActivatedTarget.setMovementAngle(Random.getRandomIntInclusive(-90, 90));
                break;

            case 2:
                spawnX = Random.getRandomInt(Border.getLeftX(), Border.getRightX());
                spawnY = Border.getTopY();
                newlyActivatedTarget.setMovementAngle(Random.getRandomIntInclusive(0, 180));
                break;

            case 3:
                spawnX = Border.getRightX() - (newlyActivatedTarget.getRadius() * 2);
                spawnY = Random.getRandomInt(Border.getTopY(), Border.getBottomY());
                newlyActivatedTarget.setMovementAngle(Random.getRandomIntInclusive(90, 270));
                break;

            case 4:
                spawnX = Random.getRandomInt(Border.getLeftX(), Border.getRightX());
                spawnY = Border.getBottomY() - (newlyActivatedTarget.getRadius() * 2);
                newlyActivatedTarget.setMovementAngle(Random.getRandomIntInclusive(180, 360));
                break;
        }
        
        spawnX = canvasWidth * 0.2;
        spawnY = canvasHeight * 0.4;
        newlyActivatedTarget.setMovementAngle(45);
       // console.log("ID: " + newlyActivatedTarget.getId() + "      SPAWNX: " + spawnX + "     SPAWNY: " + spawnY);
        newlyActivatedTarget.setX(spawnX);
        newlyActivatedTarget.setY(spawnY);
        
        targetsActivated.push(newlyActivatedTarget);
        
        saveCurrentState(newlyActivatedTarget.getId(), spawnX, spawnY);
        
        EventSystem.publishEvent("target_spawned", {
            Target: newlyActivatedTarget,
            x: spawnX,
            y: spawnY
        });
    }
    
    //currently saves a spawn state
    function saveCurrentState(targetid, spawnx, spawny){
        previousStates.push(
            {   
                targetId: targetid, 
                spawnX: spawnx,
                spawnY: spawny
            }
        );
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "target_destroyed"){
            for(var a = 0; a < targetsActivated.length; a++){
                if(targetsActivated[a]._id === eventInfo.eventData.target._id){
//                    console.log("MOVEMENT ANGLE CHANGED - TARGETS CONTROLLER");
                    targetsActivated[a].removeFromPhysicsSimulation();
                    targetsPool.push(targetsActivated.splice(a, 1)[0]);  
                }
            }
        }else if(eventInfo.eventType === "S_initialize"){
           
        }else if(eventInfo.eventType === "S_game_update"){
          
        }
    }
    
    function getRadiusOfTarget(){
        return 60;
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        serverUpdate: serverUpdate,
        getRadiusOfTarget: getRadiusOfTarget
    }
});