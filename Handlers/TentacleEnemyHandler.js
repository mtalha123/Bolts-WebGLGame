define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', "Handlers/BasicParticlesHandler", "Custom Utility/Vector", 'addToAutomaticDrawing'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler, Vector, addToAutomaticDrawing){
    
    function TentacleEnemyHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){       
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1.0]
            },
            center: {
                type: "vec2",
                value: [960.0, 475.0]
            },
            yellowColorPrefs: {
                type: "vec4",
                value: [0.0, 0.0, 0.0, 0.0]
            },
            tentaclesToShow: {
                type: "vec4",
                value: [1.0, 1.0, 1.0, 1.0]
            },
            completionsForTentacleGrabs: {
                type: "vec4",
                value: [0.0, 0.0, 0.0, 0.0]
            },
            tentaclesGrabPositions: {
                type: "vec2",
                value: [0.0, 0.0, 
                        0.0, 0.0,
                        0.0, 0.0,
                        0.0, 0.0]
            },
            radius: {
                type: "float",
                value: [20.0]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TENTACLE_ENEMY);         
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);          
        this.setPosition(position);
        this._spawnParticlesHandler.setParticlesColor(1.0, 0.0, 0.0);
        this._destructionParticlesHandler.setParticlesColor(1.0, 0.2, 0.2);
    }
    
    //inherit from Handler
    TentacleEnemyHandler.prototype = Object.create(EntityHandler.prototype);
    TentacleEnemyHandler.prototype.constructor = TentacleEnemyHandler; 
    
    TentacleEnemyHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    TentacleEnemyHandler.prototype.setYellowColorPrefs = function(prefs){
        this._uniforms.yellowColorPrefs.value = prefs;
    }    
    
    TentacleEnemyHandler.prototype.tentaclesToShowPrefs = function(prefs){
        this._uniforms.tentaclesToShow.value = prefs;
    }
    
    TentacleEnemyHandler.prototype.doTentacleGrab = function(point, quadOfPoint){
        var totalTimeForGrab = 100;
        
        if(quadOfPoint === 1){
            this._uniforms.tentaclesGrabPositions.value[0] = point.getX();
            this._uniforms.tentaclesGrabPositions.value[1] = point.getY();
            addToAutomaticDrawing.addToAutomaticDrawing(this, totalTimeForGrab, function(time){
                this._uniforms.completionsForTentacleGrabs.value[0] = 1.0;
            }, function(){
                this._uniforms.completionsForTentacleGrabs.value[0] = 0.0;
            });            
        }else if(quadOfPoint == 2){
            this._uniforms.tentaclesGrabPositions.value[2] = point.getX();
            this._uniforms.tentaclesGrabPositions.value[3] = point.getY();
            addToAutomaticDrawing.addToAutomaticDrawing(this, totalTimeForGrab, function(time){
                this._uniforms.completionsForTentacleGrabs.value[1] = 1.0;
            }, function(){
                this._uniforms.completionsForTentacleGrabs.value[1] = 0.0;
            }); 
        }else if(quadOfPoint == 3){
            this._uniforms.tentaclesGrabPositions.value[4] = point.getX();
            this._uniforms.tentaclesGrabPositions.value[5] = point.getY();
            addToAutomaticDrawing.addToAutomaticDrawing(this, totalTimeForGrab, function(time){
                this._uniforms.completionsForTentacleGrabs.value[2] = 1.0;
            }, function(){
                this._uniforms.completionsForTentacleGrabs.value[2] = 0.0;
            });            
        }else if(quadOfPoint == 4){
            this._uniforms.tentaclesGrabPositions.value[6] = point.getX();
            this._uniforms.tentaclesGrabPositions.value[7] = point.getY();
            addToAutomaticDrawing.addToAutomaticDrawing(this, totalTimeForGrab, function(time){
                this._uniforms.completionsForTentacleGrabs.value[3] = 1.0;
            }, function(){
                this._uniforms.completionsForTentacleGrabs.value[3] = 0.0;
            });             
        }                
    }

    TentacleEnemyHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 7.0;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return TentacleEnemyHandler;
});