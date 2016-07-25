define(['Target', 'Custom Utility/Timer', 'Border', 'Custom Utility/Random', 'EventSystem'], function(Target, Timer, Border, Random, EventSystem){
    var targetsPool = [];
    var targetsActivated = [];
    var spawnTimer = new Timer();
    var numTargets = 10;
    
    function initialize(canvasWidth, canvasHeight){
        var targetIds = 1;
        
        for(var i = 0; i < numTargets; i++){
            targetsPool[i] = new Target(targetIds, canvasWidth, canvasHeight, 60, 8, 0, 0, 0, 1);
            targetIds++;
        }
        spawnTimer.start();
        EventSystem.register(this, "targetinfocus");
    }
    
    function draw(context, interpolation){
        for(var a = 0; a < targetsActivated.length; a++){
            targetsActivated[a].draw(context, interpolation);
        }
    }
    
    function update(){
        if(spawnTimer.getTime() > 1000){
            if(targetsPool.length > 0){
                spawn();
            }
            spawnTimer.reset();
            spawnTimer.start();
        }
  
        for(var a = 0; a < targetsActivated.length; a++){
            targetsActivated[a].update();
        }
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
    
        
        newlyActivatedTarget.setX(spawnX);
        newlyActivatedTarget.setY(spawnY);
        
        targetsActivated.push(newlyActivatedTarget);
        
        var eventObject = EventSystem.getEventObject("targetspawned");
        eventObject.setProperties(newlyActivatedTarget, spawnX, spawnY);
        EventSystem.publishEvent(eventObject);
    }
    
    function recieveEvent(eventInfo){
        console.log("HAPPENED!");
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        recieveEvent: recieveEvent
    }
});