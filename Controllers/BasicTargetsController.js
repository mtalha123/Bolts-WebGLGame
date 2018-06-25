define(['Entities/BasicTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'Controllers/EntityController', 'Custom Utility/Vector'], function(BasicTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, Vector){
    
    function BasicTargetsController(gl, appMetaData, maxEntitesToSpawn, EffectsManager){
        EntityController.call(this, appMetaData, maxEntitesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.06;
        this._spawnAttemptDelay = 2000;
        
        for(var i = 0; i < maxEntitesToSpawn; i++){
            this._entitiesPool[i] = new BasicTarget(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 8, new Vector(0, 0), EffectsManager);
        }
    }
    
    //inherit from EntityController
    BasicTargetsController.prototype = Object.create(EntityController.prototype);
    BasicTargetsController.prototype.constructor = BasicTargetsController;
    
    BasicTargetsController.prototype.spawn = function(){
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
        
        newlyActivatedTarget.setPosition(new Vector(spawnX, spawnY));     
        this._entitiesActivated.push(newlyActivatedTarget);

        newlyActivatedTarget.spawn(function(){
            newlyActivatedTarget.setMovementAngle(movementAngle);
        }.bind(this));
    } 
    
    BasicTargetsController.prototype.reset = function(){
        EntityController.prototype.reset.call(this);
    }
    
    return BasicTargetsController;
});