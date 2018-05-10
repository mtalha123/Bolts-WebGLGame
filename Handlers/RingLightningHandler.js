define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function RingLightning(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){
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
                value: [60] 
            },
            activatedQuads: {
                type: "vec4",
                value: [0, 0, 0, 0]
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.RING_LIGHTNING); 
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);  
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    RingLightning.prototype = Object.create(Handler.prototype);
    RingLightning.prototype.constructor = RingLightning; 
    
    RingLightning.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }

    RingLightning.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    RingLightning.prototype.activateQuad = function(quadToActivate){
        if(quadToActivate === 1){
            this._uniforms.activatedQuads.value[0] = 1;
        }else if(quadToActivate === 2){
            this._uniforms.activatedQuads.value[1] = 1;
        }else if(quadToActivate === 3){
            this._uniforms.activatedQuads.value[2] = 1;
        }else if(quadToActivate === 4){
            this._uniforms.activatedQuads.value[3] = 1;
        }
    }
    
    RingLightning.prototype.unActivateQuads = function(){
        this._uniforms.activatedQuads.value = [0, 0, 0, 0];
    }
    
    return RingLightning;
});