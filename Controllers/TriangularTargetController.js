define(['Entities/TriangularTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/MovingEntityController'], function(TriangularTarget, SynchronizedTimers, Border, Random, EventSystem, MovingEntityController, ){
    
    function TriangularTargetController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager){
        MovingEntityController.call(this, appMetaData, 100, maxEntitiesToSpawn, 10); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.08;
        this._spawnAttemptDelay = 5000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new TriangularTarget(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 10, 10, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from MovingEntityController
    TriangularTargetController.prototype = Object.create(MovingEntityController.prototype);
    TriangularTargetController.prototype.constructor = TriangularTargetController;
    
    TriangularTargetController.prototype._spawn = function(){
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
        
        newlyActivatedTarget.setPosition(spawnX, spawnY);     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            newlyActivatedTarget.setSpeed(this._speed);
            newlyActivatedTarget.setMovementAngle(movementAngle);
        }.bind(this));
        
        MovingEntityController.prototype._spawn.call(this, newlyActivatedTarget);
    } 
    
    TriangularTargetController.prototype.receiveEvent = function(eventInfo){
        MovingEntityController.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "game_level_up"){
            switch(eventInfo.eventData.level){
                case 4:
                    this._chanceOfSpawning = 20;
                    break;
                case 5:
                    this._chanceOfSpawning = 40;
                    break;
                case 6:
                    this._chanceOfSpawning = 50;
                    break;
                case 7:
                    this._chanceOfSpawning = 70;
                    break;
                case 8:
                    this._chanceOfSpawning = 50;
                    break;
                
            }
        }
    }
    
    return TriangularTargetController;
});