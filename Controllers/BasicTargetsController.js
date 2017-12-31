define(['Entities/BasicTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController'], function(BasicTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, ){
    
    function BasicTargetsController(gl, appMetaData, maxEntitesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, 100, maxEntitesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;

        for(var i = 0; i < maxEntitesToSpawn; i++){
            this._entitiesPool[i] = new BasicTarget(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 8, 0, 0, 30, 10, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    BasicTargetsController.prototype = Object.create(EntityController.prototype);
    BasicTargetsController.prototype.constructor = BasicTargetsController;
    
    BasicTargetsController.prototype._spawn = function(){
        var random = Random.getRandomIntInclusive(1, 4);
        var spawnX, spawnY;
        var movementAngle;
        
        var newlyActivatedTarget = this._entitiesPool.shift();   
        
        switch(random){
            case 1:
                spawnX = Border.getLeftX() + newlyActivatedTarget.getRadius();
                spawnY = Random.getRandomInt(Border.getBottomY() + newlyActivatedTarget.getRadius(), Border.getTopY() - newlyActivatedTarget.getRadius());
                movementAngle = Random.getRandomIntInclusive(-90, 90);
                break;

            case 2:
                spawnX = Random.getRandomInt(Border.getLeftX() + newlyActivatedTarget.getRadius(), Border.getRightX() - newlyActivatedTarget.getRadius());
                spawnY = Border.getTopY() - newlyActivatedTarget.getRadius();
                movementAngle = Random.getRandomIntInclusive(-180, 0);
                break;

            case 3:
                spawnX = Border.getRightX() - newlyActivatedTarget.getRadius();
                spawnY = Random.getRandomInt(Border.getBottomY() + newlyActivatedTarget.getRadius(), Border.getTopY() - newlyActivatedTarget.getRadius());;
                movementAngle = Random.getRandomIntInclusive(90, 270);
                break;

            case 4:
                spawnX = Random.getRandomInt(Border.getLeftX() + newlyActivatedTarget.getRadius(), Border.getRightX() - newlyActivatedTarget.getRadius());
                spawnY = Border.getBottomY() + newlyActivatedTarget.getRadius();
                movementAngle = Random.getRandomIntInclusive(0, 180);
                break;
        }
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        }.bind(this));
        
        EntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    BasicTargetsController.prototype.receiveEvent = function(eventInfo){
        EntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 2:
                    this._spawnAttemptDelay = 1000;
                    break;
                case 3:
                    break;
                case 4:
                    this._chanceOfSpawning = 80;
                    break;
                case 5:
                    this._chanceOfSpawning = 60;
                    break;
                case 6:
                    this._chanceOfSpawning = 40;
                    break;
                case 7:
                    this._chanceOfSpawning = 10;
                    break;
                case 8:
                    this._chanceOfSpawning = 0;
                    break;
                
            }
        }
    }
    
    BasicTargetsController.prototype.reset = function(){
        EntityController.prototype.reset.call(this);
        this._spawnAttemptDelay = 2000;
        this._chanceOfSpawning = 100;
    }
    
    return BasicTargetsController;
});