define(['Target', 'Custom Utility/Timer', 'Border', 'Custom Utility/Random', 'EventSystem', 'Custom Utility/isObjectEmpty'], function(Target, Timer, Border, Random, EventSystem, isObjectEmpty){
    var targetsPool = [];
    var targetsActivated = [];
    var spawnTimer = new Timer();
    var numTargets = 2;
    var authUpdateData = {};
    
    function initialize(canvasWidth, canvasHeight, initializeData){
        var i = 0;
        for(var key in initializeData){
            targetsPool[i] = new Target(key, canvasWidth, canvasHeight, 60, 8, initializeData[key].x, initializeData[key].y, initializeData[key].movementAngle, initializeData[key].speed);
            i++;
        }
        console.log(JSON.stringify(initializeData));
        spawnTimer.start();
        EventSystem.register(this, "targetinfocus");
        EventSystem.register(this, "S_gameupdate");
        EventSystem.register(this, "S_initialize");
    }
    
    function draw(context, interpolation){
        for(var a = 0; a < targetsActivated.length; a++){
            targetsActivated[a].draw(context, interpolation);
        }
    }
    
    function update(){
        if(isObjectEmpty(authUpdateData)){
            if(spawnTimer.getTime() > 1000){
                if(targetsPool.length > 0){
                    spawn();
                }
                spawnTimer.reset();
                spawnTimer.start();
            }

            for(var a = 0; a < targetsActivated.length; a++){
                targetsActivated[a].update();
                //console.log("LOCAL: " + targetsActivated[a].getId() + "   X: " + targetsActivated[a].getX() + "   Y: " + targetsActivated[a].getY());
               // console.log("");
            }
        }else{
            authoritativeUpdate(authUpdateData);
            authUpdateData = {};
            
//            for(var a = 0; a < targetsActivated.length; a++){
//                targetsActivated[a].update();
//            }
        }
    }
    
    function authoritativeUpdate(data){
        for(var key in data){
            if(data[key].type === "spawn"){
                for(var i = 0; i < targetsActivated.length; i++){
                    if(key === targetsActivated[i].getId()){
                        targetsActivated[i].setMovementAngle(data[key].movementAngle);
//                        targetsActivated[i].setX(data[key].x);
//                        targetsActivated[i].setY(data[key].y);
                        targetsActivated[i].mergeUpdate(data[key].x, data[key].y);
                    }
                }
                    
                for(var b = 0; b < targetsPool.length; b++){
                    if(key === targetsPool[b].getId()){
                        var newlyActivatedTarget = targetsPool.splice(b, 1)[0];
                        newlyActivatedTarget.addToPhysicsSimulation();
                        newlyActivatedTarget.setMovementAngle(data[key].movementAngle);
//                        newlyActivatedTarget.setX(data[key].x);
//                        newlyActivatedTarget.setY(data[key].y);
                        newlyActivatedTarget.mergeUpdate(data[key].x, data[key].y);
                        targetsActivated.push(newlyActivatedTarget);
                        
                        EventSystem.publishEvent("targetspawned", {
                            Target: newlyActivatedTarget,
                            x: data[key].x,
                            y: data[key].y
                        });
                    }
                }
                
            }else{
                for(var i = 0; i < targetsActivated.length; i++){
                    if(key === targetsActivated[i].getId()){
//                        targetsActivated[i].setX(data[key].x);
//                        targetsActivated[i].setY(data[key].y);
                        targetsActivated[i].mergeUpdate(data[key].x, data[key].y);
                    }
                }
            }
        }
    }
    
    function setAuthoritativeUpdate(data){
        authUpdateData = data;
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
        
        spawnX = 400;
        spawnY = 400;
        newlyActivatedTarget.setMovementAngle(45);
        
        newlyActivatedTarget.setX(spawnX);
        newlyActivatedTarget.setY(spawnY);
        
        targetsActivated.push(newlyActivatedTarget);

        EventSystem.publishEvent("targetspawned", {
            Target: newlyActivatedTarget,
            x: spawnX,
            y: spawnY
        });
    }
    
    function recieveEvent(eventInfo){
        if(eventInfo.eventType === "targetinfocus"){
            console.log("HAPPENED!");
        }else if(eventInfo.eventType === "S_initialize"){
           
        }else if(eventInfo.eventType === "S_gameupdate"){
          
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        authoritativeUpdate: authoritativeUpdate,
        setAuthoritativeUpdate: setAuthoritativeUpdate,
        recieveEvent: recieveEvent
    }
});