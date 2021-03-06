define(['CirclePhysicsBody', 'Entities/Entity', 'Custom Utility/CircularHitBoxWithAlgorithm', 'Custom Utility/Vector', 'EventSystem', 'RingAlgorithm', 'MainTargetsPositions', 'Custom Utility/rotateCoord', 'Custom Utility/Timer'], function(CirclePhysicsBody, Entity, CircularHitBoxWithAlgorithm, Vector, EventSystem, RingAlgorithm, MainTargetsPositions, rotateCoord, Timer){
    
    function OrbitEnemy(canvasWidth, canvasHeight, gl, radius, position, EffectsManager, AudioManager){
        Entity.call(this, canvasWidth, canvasHeight, gl, position, radius, AudioManager);
        this._hitbox = new CircularHitBoxWithAlgorithm(position, radius * 1.5, new RingAlgorithm(position, radius * 2, canvasHeight * 0.2, gl, EffectsManager, AudioManager));
        this._type = "enemy";
        
        this._handler = EffectsManager.requestOrbitEnemy(false, gl, 20, position, {radius: [this._radius]});
        this._particlesEmanatingHandler = EffectsManager.requestParticlesFlowingFromCenterEffect(false, gl, 7, 30, new Vector(0, 0), {maxLifetime: [80], radiusOfParticlesEmanating: [radius * 1.5], particlesColor: [1.0, 0.0, 0.0]});
        
        this._particlesDirectedHandlersPool = [];
        for(var i = 0; i < 4; i++){
            this._particlesDirectedHandlersPool[i] = EffectsManager.requestDirectedParticlesEffect(false, gl, 20, 30, position, {randomLifetimesOn: [1.0], maxLifetime: [200], radiusOfSource: [radius / 3.0], particlesColor: [1.0, 0.0, 0.0]});
            this._particlesDirectedHandlersPool[i].setTimeIncrementor(5);
        }
        
        this._particlesDirectedHandlersActive = [];
                 
        this._numCapturedEntities = 0;
        this._maxNumCaptureEntities = 4;
        this._captureArea = this._radius * 3.5;
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._rotationSpeed = 0.01 * canvasHeight;
        this._capturedEntities = [];
        this._delayCapturingTimer = new Timer();
        this._TIME_DELAY_TO_CAPTURE = 2000;
        this._canCapture = true;
        this._spawnSoundEffect = AudioManager.getAudioHandler("enemy_spawn_sound_effect");
        this._captureSoundEffect = AudioManager.getAudioHandler("capture_sound_effect");
    }

    //inherit from Entity
    OrbitEnemy.prototype = Object.create(Entity.prototype);
    OrbitEnemy.prototype.constructor = OrbitEnemy;
    
    OrbitEnemy.prototype.setPosition = function(newPosition){
        this._position = this._prevPosition = newPosition; 
        this._handler.setPosition(newPosition);
        this._hitbox.setPosition(newPosition);
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._particlesEmanatingHandler.setPosition(newPosition);
        for(var i = 0; i < this._particlesDirectedHandlersActive.length; i++){
            this._particlesDirectedHandlersActive[i].setPosition(newPosition);
        }  
    }
    
    OrbitEnemy.prototype._setPositionWithInterpolation = function(newPosition){
        Entity.prototype._setPositionWithInterpolation.call(this, newPosition);        
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._hitbox.setPosition(newPosition);
        this._particlesEmanatingHandler.setPosition(newPosition);
        for(var i = 0; i < this._particlesDirectedHandlersActive.length; i++){
            this._particlesDirectedHandlersActive[i].setPosition(newPosition);
        }  
    }
    
    OrbitEnemy.prototype.reset = function(){
        Entity.prototype.reset.call(this);
        this._numCapturedEntities = 0;
        this._hitbox.resetAlgorithm();
        this._nextCapturePosition = new Vector(this._position.getX() + this._captureArea, this._position.getY());
        this._capturedEntities = [];
        this._particlesEmanatingHandler.reset();
        while(this._particlesDirectedHandlersActive.length > 0){
            this._particlesDirectedHandlersActive[0].reset();
            this._particlesDirectedHandlersPool.push(this._particlesDirectedHandlersActive.shift());
        }
    } 
    
    OrbitEnemy.prototype.update = function(){
        if(this._delayCapturingTimer.getTime() >= this._TIME_DELAY_TO_CAPTURE){
            this._canCapture = true;
            this._delayCapturingTimer.reset();
        }
        
        var angleIncrement = this._rotationSpeed / this._captureArea; // Get from Arc Length = radius * theta formula, where theta is angle in radians.
        this._nextCapturePosition = rotateCoord(this._nextCapturePosition, angleIncrement, this._position);   
        
        for(var i = 0; i < this._particlesDirectedHandlersActive.length; i++){
            this._particlesDirectedHandlersActive[i].setDestination(rotateCoord(this._particlesDirectedHandlersActive[i].getDestination(), angleIncrement, this._position));
            this._particlesDirectedHandlersActive[i].update();
        }
        
        var allTargetObjs = MainTargetsPositions.getAllTargetObjs();
        for(var i = 0; i < allTargetObjs.length; i++){
            if(this._numCapturedEntities >= this._maxNumCaptureEntities){
                break;
            }
            
            if(this._position.distanceTo(allTargetObjs[i].position) <= this._captureArea && this._canCapture){
                this._numCapturedEntities++;
                this._capturedEntities.push(allTargetObjs[i].target);
                EventSystem.publishEventImmediately("entity_captured", {entity: allTargetObjs[i].target, capture_type: "orbit", 
                                                                        center: this._position, 
                                                                        radius: this._captureArea, 
                                                                        capture_position: this._nextCapturePosition,
                                                                        rotationSpeed: this._rotationSpeed});
                this._particlesDirectedHandlersActive.push(this._particlesDirectedHandlersPool.shift());
                this._particlesDirectedHandlersActive[this._numCapturedEntities - 1].shouldDraw(true);
                this._particlesDirectedHandlersActive[this._numCapturedEntities - 1].setPosition(this._position);
                this._particlesDirectedHandlersActive[this._numCapturedEntities - 1].setDestination(this._nextCapturePosition);
                this._nextCapturePosition = rotateCoord(this._nextCapturePosition, Math.PI / 2, this._position);
                if(this._numCapturedEntities === 4){
                    this._particlesEmanatingHandler.shouldDraw(false);
                }
                this._captureSoundEffect.play();
            }
        }
    }
    
    OrbitEnemy.prototype.prepareForDrawing = function(interpolation){
        Entity.prototype.prepareForDrawing.call(this, interpolation);
        this._hitbox.prepareForDrawing(interpolation);
        this._particlesEmanatingHandler.update();
    }
    
    OrbitEnemy.prototype.runAchievementAlgorithmAndReturnStatus = function(mouseInputObj, callback){        
        if(this._hitbox.processInput(mouseInputObj)){            
            if(this._numCapturedEntities > 0){
                var entityToRelease = this._capturedEntities.shift();
                if(this._numCapturedEntities == 4){ // Else, there is already a vacant nextCapturePosition (no target captured in that position), 
                                                    // so no need to set this._nextCapturePosition to entityToRelease.getPosition()
                    this._nextCapturePosition = entityToRelease.getPosition();
                }
                EventSystem.publishEventImmediately("captured_entity_released_from_orbit", {entity: entityToRelease});
                this._particlesDirectedHandlersActive[0].reset();
                this._particlesDirectedHandlersPool.push(this._particlesDirectedHandlersActive.shift());
                this._numCapturedEntities--;
                this._delayCapturingTimer.start();
                this._canCapture = false;
            }else{
                EventSystem.publishEventImmediately("entity_destroyed", {entity: this, type: "enemy"});
                this.destroyAndReset(callback);
                return true;   
            }
        }
        
        return false;
    }
    
    OrbitEnemy.prototype.spawn = function(callback){
        Entity.prototype.spawn.call(this, callback);
        EventSystem.publishEventImmediately("entity_spawned", {entity: this, type: "enemy"});
        this._particlesEmanatingHandler.shouldDraw(true);
    }
    
    OrbitEnemy.prototype.receiveEvent = function(eventInfo){
        // duplicate this._capturedEntities because the line of code after the for loop may reset this orbit enemy, and access to the entities inside this._capturedEntities will be lost
        var copyOfCapturedEntities = [];
        for(var i = 0; i < this._capturedEntities.length; i++){
            copyOfCapturedEntities[i] = this._capturedEntities[i];
        }
        
        Entity.prototype.receiveEvent.call(this, eventInfo);
        
        if(eventInfo.eventType === "lightning_strike"){
            // check to see if its been destroyed by lightning strike
            if(!this._alive){
                // release all captured entities
                while(copyOfCapturedEntities.length > 0){
                    var entityToRelease = copyOfCapturedEntities.shift();
                    EventSystem.publishEventImmediately("captured_entity_released_from_orbit", {entity: entityToRelease});
                }
            }
        }
    }
    
    return OrbitEnemy;
    
});