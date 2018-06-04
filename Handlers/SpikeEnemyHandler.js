define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', "Handlers/BasicParticlesHandler"], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function SpikeEnemyHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){       
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
            radius: {
                type: "float",
                value: [30] 
            },
            numBolts: {
                type: "float",
                value: [0]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.ENEMY_SPIKE); 
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    SpikeEnemyHandler.prototype = Object.create(EntityHandler.prototype);
    SpikeEnemyHandler.prototype.constructor = SpikeEnemyHandler; 
    
    SpikeEnemyHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    SpikeEnemyHandler.prototype.doSpawnEffect = function(position){
        EntityHandler.prototype.doSpawnEffect.call(this, position);
        this._particlesHandler.setParticlesColor(1.0, 0.0, 0.0);
    }
    
    SpikeEnemyHandler.prototype.doDestroyEffect = function(position, callback){
        EntityHandler.prototype.doDestroyEffect.call(this, position, callback);
        this._particlesHandler.setParticlesColor(1.0, 0.2, 0.2);
    }
    
    SpikeEnemyHandler.prototype.setNumBolts = function(numBolts){
        this._uniforms.numBolts.value = [numBolts];
    }

    SpikeEnemyHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 3.0;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return SpikeEnemyHandler;
});