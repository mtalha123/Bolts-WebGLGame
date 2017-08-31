define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', "Handlers/BasicParticlesHandler"], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function SpikeEnemyHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary){       
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
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.ENEMY_SPIKE); 
        
        EntityHandler.call(this, shouldDraw, gl, 0, 0, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    SpikeEnemyHandler.prototype = Object.create(EntityHandler.prototype);
    SpikeEnemyHandler.prototype.constructor = SpikeEnemyHandler; 
    
    SpikeEnemyHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX;
        this._uniforms.center.value[1] = newY;
        this._generateVerticesFromCurrentState();
    }
    
    SpikeEnemyHandler.prototype.doSpawnEffect = function(x, y){
        EntityHandler.prototype.doSpawnEffect.call(this, x, y);
        this._particlesHandler.setParticlesColor(1.0, 0.0, 0.0);
    }
    
    SpikeEnemyHandler.prototype.doDestroyEffect = function(x, y){
        EntityHandler.prototype.doDestroyEffect.call(this, x, y);
        this._particlesHandler.setParticlesColor(1.0, 0.2, 0.2);
    }

    SpikeEnemyHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 3.0;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return SpikeEnemyHandler;
});