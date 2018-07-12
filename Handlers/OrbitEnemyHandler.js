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
    
    return OrbitEnemyHandler;
});