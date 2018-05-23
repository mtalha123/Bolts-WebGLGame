define(['Entities/FourPointTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController', 'Custom Utility/Vector'], function(FourPointTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, Vector){
    
    function FourPointTargetController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.1;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new FourPointTarget(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), 10, 10, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    FourPointTargetController.prototype = Object.create(EntityController.prototype);
    FourPointTargetController.prototype.constructor = FourPointTargetController;
    
    FourPointTargetController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        switch(random){
            case 1:
                spawnX = Border.getLeftX() + this._targetRadius;
                spawnY = Random.getRandomInt(Border.getBottomY() + this._targetRadius, Border.getTopY() - this._targetRadius);
                movementAngle = Random.getRandomIntInclusive(-90, 90);
                break;

            case 2:
                spawnX = Random.getRandomInt(Border.getLeftX() + this._targetRadius, Border.getRightX() - this._targetRadius);
                spawnY = Border.getTopY() - this._targetRadius;
                movementAngle = Random.getRandomIntInclusive(-180, 0);
                break;

            case 3:
                spawnX = Border.getRightX() - this._targetRadius;
                spawnY = Random.getRandomInt(Border.getBottomY() + this._targetRadius, Border.getTopY() - this._targetRadius);;
                movementAngle = Random.getRandomIntInclusive(90, 270);
                break;

            case 4:
                spawnX = Random.getRandomInt(Border.getLeftX() + this._targetRadius, Border.getRightX() - this._targetRadius);
                spawnY = Border.getBottomY() + this._targetRadius;
                movementAngle = Random.getRandomIntInclusive(0, 180);
                break;
        }
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        }.bind(this));
    } 
    
    FourPointTargetController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 6:
                    this._chanceOfSpawning = 10;
                    break;
                case 7:
                    this._chanceOfSpawning = 20;
                    break;
                case 8:
                    this._chanceOfSpawning = 50;
                    break;
            }
        }
    }
    
    return FourPointTargetController;
});