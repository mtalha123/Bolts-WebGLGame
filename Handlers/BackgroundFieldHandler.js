define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords){
    
    function BackgroundFieldHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, worleyNoiseInfo){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.BACKGROUND_FIELD);
        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            time: {
                type: "float",
                value: [0.0]
            },
            completion: {
                type: "float",
                value: [0.0]
            },
            worleyNoise: {
                type: "sampler2D",
                value: worleyNoiseInfo.sampler,
                texture: worleyNoiseInfo.noiseTexture
            }
        };
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        //whole screen
        this._attributes.vertexPosition = getVerticesUnNormalized(-1, -1, 2, 2);
    }
    
    //inherit from Handler
    BackgroundFieldHandler.prototype = Object.create(Handler.prototype);
    BackgroundFieldHandler.prototype.constructor = BackgroundFieldHandler; 
    
    BackgroundFieldHandler.prototype.setTime = function(newTime){
        this._uniforms.time.value = [newTime];
    }
    
    BackgroundFieldHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value = [completion];
    }
    
    return BackgroundFieldHandler;
});