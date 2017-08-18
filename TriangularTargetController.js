define(['TriangularTarget', 'SynchronizedTimers', 'Border', 'Custom Utility/Random', 'EventSystem', 'EntityController'], function(TriangularTarget, SynchronizedTimers, Border, Random, EventSystem, EntityController, ){
    
    function TriangularTargetController(gl, appMetaData, EffectsManager){
        EntityController.EntityController.call(this); 
        this._targetRadius = appMetaData.getCanvasHeight() * 0.08;

        for(var i = 0; i < 2; i++){
            this._entitiesPool[i] = new TriangularTarget(i, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, this._targetRadius, 100, 100, 10, 10, EffectsManager);
        }
        
        this._spawnTimer.start();
    }
    
    //inherit from EntityController
    TriangularTargetController.prototype = Object.create(EntityController.EntityController.prototype);
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
            newlyActivatedTarget.setMovementAngle(movementAngle);
        });
    } 
    
    TriangularTargetController.prototype.recieveEvent = function(eventInfo){
        EntityController.EntityController.prototype.recieveEvent.call(this, eventInfo);
    }
    
    return TriangularTargetController;
});