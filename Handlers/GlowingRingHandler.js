define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getVerticesNormalized'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, getVerticesNormalized){
    
    function GlowingRingHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, position, ShaderLibrary){
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            center: {
                type: "vec2",
                value: [100, 100]
            },
            radius: {
                type: "float",
                value: [35]
            },
            angleCompletion: {
                type: "float",
                value: [0.0]
            },
            primaryColor: {
                type: "vec3",
                value: [0.3, 0.3, 0.3]
            },
            secondaryColor: {
                type: "vec3",
                value: [1.0, 0.0, 0.4]
            }
        };
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.GLOWING_RING);        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);  
        this.setPosition(position);   
    }
    
    //inherit from Handler
    GlowingRingHandler.prototype = Object.create(Handler.prototype);
    GlowingRingHandler.prototype.constructor = GlowingRingHandler; 
    
    GlowingRingHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();

        this._generateVerticesFromCurrentState();
    }  
    
    GlowingRingHandler.prototype.setCompletion = function(completion){
        this._uniforms.angleCompletion.value = [completion];
    }
    
    GlowingRingHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 2;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }

    return GlowingRingHandler;
});