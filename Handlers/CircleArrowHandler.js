define(['Handlers/Handler', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getVerticesNormalized', 'Custom Utility/Vector', 'timingCallbacks'], function(Handler, getGLCoordsFromNormalizedShaderCoords, getVerticesNormalized, Vector, timingCallbacks){
    
    function CircleArrowHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, widthAndHeight, opts, ShaderLibrary, textureData){        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            center: {
                type: "vec2",
                value: [300.0, 300.0]
            },
            widthAndHeight: {
                type: "float",
                value: [widthAndHeight]
            },          
            bottomLeftCornerPos: {
                type: "vec2",
                value: [0, 0]
            },
            completion: {
                type: "float",
                value: [1.0]
            },      
            arrowTexture: {
                type: "sampler2D",
                value: textureData.sampler,
                texture: textureData.texture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.CIRCLE_ARROW); 
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);  
        this._widthAndHeight = widthAndHeight;
        this.setPosition(new Vector(300, 300));
    }
    
    //inherit from Handler
    CircleArrowHandler.prototype = Object.create(Handler.prototype);
    CircleArrowHandler.prototype.constructor = CircleArrowHandler; 

    CircleArrowHandler.prototype.doCirclingArrowEffect = function(duration, numTimesToDoEffect){
        timingCallbacks.removeTimingEvents(this);
        this._shouldDraw = true;
        
        timingCallbacks.addTimingEvents(this, duration, numTimesToDoEffect, function(time){
            this._uniforms.completion.value[0] = time / duration;
        }, function(){
            this._shouldDraw = false;
            this._uniforms.completion.value[0] = 1.0;
        });
    }
    
    CircleArrowHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._uniforms.bottomLeftCornerPos.value = [newPosition.getX() - (this._widthAndHeight / 2), newPosition.getY() - (this._widthAndHeight / 2)];
        this._generateVerticesFromCurrentState();
    }   
    
    CircleArrowHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._widthAndHeight / 2;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return CircleArrowHandler;
});