define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
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
        this._radiusMultiplierForGenVertices = 2.5;
        this.setPosition(position);
        this._spawnParticlesHandler.setParticlesColor(1.0, 0.0, 0.0);
        this._destructionParticlesHandler.setParticlesColor(1.0, 0.2, 0.2);
    }
    
    //inherit from Handler
    SpikeEnemyHandler.prototype = Object.create(EntityHandler.prototype);
    SpikeEnemyHandler.prototype.constructor = SpikeEnemyHandler; 
    
    SpikeEnemyHandler.prototype.setNumBolts = function(numBolts){
        this._uniforms.numBolts.value = [numBolts];
    }
    
    return SpikeEnemyHandler;
});