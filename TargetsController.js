define(['Target', 'Custom Utility/Timer', 'Border', 'Custom Utility/Random', 'EventSystem'], function(Target, Timer, Border, Random, EventSystem){
    var targetsPool = [];
    var targetsActivated = [];
    var spawnTimer = new Timer();
    
    function initialize(canvasWidth, canvasHeight){
        var targetIds = 1;
        
        for(var i = 0; i < 10; i++){
            targetsPool[i] = new Target(targetIds, canvasWidth, canvasHeight, 60, 8, 0, 0, 0, 10);
            targetIds++;
        }
        spawnTimer.start();
        EventSystem.register(this, "E_bordercollision");
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
        var random = 3;//Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        
        var newlyActivatedTarget = targetsPool.shift();        
        
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
                newlyActivatedTarget.setMovementAngle(Random.getRandomIntInclusive(170, 180));//90, 270
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
        //console.log("SIDE: " + eventInfo.getSide());
        switch(eventInfo.getSide()){
            case "left":
                eventInfo.getEntity().setMovementAngle(Random.getRandomIntInclusive(-90, 90));
                break;
            
            case "top":

                break;
                
            case "right":
                
                break;
                
            case "bottom":
                
                break;
        }
    }
    
    return {
        initialize: initialize,
        draw: draw,
        update: update,
        recieveEvent: recieveEvent
    }
});