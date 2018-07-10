define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords){
    
    function OrbitEnemyHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){       
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
                value: [70] 
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.ENEMY_ORBIT);         
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);           
        this.setPosition(position);
        this._spawnParticlesHandler.setParticlesColor(1.0, 0.0, 0.0);
        this._destructionParticlesHandler.setParticlesColor(1.0, 0.2, 0.2);
    }
    
    //inherit from Handler
    OrbitEnemyHandler.prototype = Object.create(EntityHandler.prototype);
    OrbitEnemyHandler.prototype.constructor = OrbitEnemyHandler; 
    
    OrbitEnemyHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    OrbitEnemyHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return OrbitEnemyHandler;
});