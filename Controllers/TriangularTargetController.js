define(['Entities/TriangularTarget', 'Border', 'Custom Utility/Random', 'Controllers/EntityController', 'Custom Utility/Vector'], function(TriangularTarget, Border, Random, EntityController, Vector){
    
    function TriangularTargetController(gl, appMetaData, maxEntitiesToSpawn, EffectsManager, AudioManager){
        EntityController.call(this, appMetaData, maxEntitiesToSpawn); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.08;
        this._spawnAttemptDelay = 5000;

        for(var i = 0; i < maxEntitiesToSpawn; i++){
            this._entitiesPool[i] = new TriangularTarget(appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, new Vector(100, 100), EffectsManager, AudioManager);
        }
    }
    
    //inherit from EntityController
    TriangularTargetController.prototype = Object.create(EntityController.prototype);
    TriangularTargetController.prototype.constructor = TriangularTargetController;
    
    TriangularTargetController.prototype.spawn = function(){
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
    
    return TriangularTargetController;
});