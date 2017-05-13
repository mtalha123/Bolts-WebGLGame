define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords){
    
    function CursorHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, x, y){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.CURSOR);
        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            mouseCoords: {
                type: "vec2",
                value: [x, y]
            },
            clicked: {
                type: "float",
                value: [0.0]
            }
        };
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    CursorHandler.prototype = Object.create(Handler.prototype);
    CursorHandler.prototype.constructor = CursorHandler; 
    
    CursorHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.mouseCoords.value[0] = newX;
        this._uniforms.mouseCoords.value[1] = newY;

        var x_t = getGLCoordsFromNormalizedShaderCoords([newX / this._canvasWidth])[0];
        var y_t = getGLCoordsFromNormalizedShaderCoords([newY / this._canvasHeight])[0];
        this._attributes.vertexPosition = getVerticesUnNormalized(x_t - 0.1, y_t - 0.1, 0.2, 0.2);
       // console.log("CURSOR HANDLER ATTRIBUTES: " + this._attributes.vertexPosition);
    }
    
    CursorHandler.prototype.setClicked = function(clicked){
        if(clicked){
            this._uniforms.clicked.value[0] = 1.0;
        }else{
            this._uniforms.clicked.value[0] = 0.0;
        }
    }

    return CursorHandler;
});