define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'SynchronizedTimers'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, SynchronizedTimers){
    
    function BackgroundFieldHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, worleyNoiseInfo){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.BACKGROUND_FIELD);
        
        this._effectTimer = SynchronizedTimers.getTimer();
        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
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
    
    BackgroundFieldHandler.prototype.update = function(){
        this._time+=0.01;
        this._uniforms.iGlobalTime.value[0] = this._time;
        
        this._uniforms.completion.value[0] = this._effectTimer.getTime() / 1000;
        if(this._effectTimer.getTime() >= 1000){
            this._effectTimer.reset();
        }
    }
    
    BackgroundFieldHandler.prototype.doEffect = function(){
        this._effectTimer.start();
    }
    
    return BackgroundFieldHandler;
});