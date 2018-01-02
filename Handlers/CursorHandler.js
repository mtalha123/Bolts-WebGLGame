define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getVerticesNormalized'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, getVerticesNormalized){
    
    function CursorHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, position){
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            mouseCoords: {
                type: "vec2",
                value: [position.getX(), position.getY()]
            },
            clicked: {
                type: "float",
                value: [0.0]
            },
            radius: {
                type: "float",
                value: [35]
            },
            iGlobalTime: {
                type: "float",
                value: [0.0]
            }
        };
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.CURSOR);
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);   
        
        this._padding = 0.03 * canvasHeight;
        
        this.setPosition(position);
        this._setVerticesFromCurrState();   
    }
    
    //inherit from Handler
    CursorHandler.prototype = Object.create(Handler.prototype);
    CursorHandler.prototype.constructor = CursorHandler; 
    
    CursorHandler.prototype.setPosition = function(newPosition){
        this._uniforms.mouseCoords.value[0] = newPosition.getX();
        this._uniforms.mouseCoords.value[1] = newPosition.getY();

        this._setVerticesFromCurrState();
    }
    
    CursorHandler.prototype.setClicked = function(clicked){
        if(clicked){
            this._uniforms.clicked.value[0] = 1.0;
        }else{
            this._uniforms.clicked.value[0] = 0.0;
        }
    }
    
    CursorHandler.prototype._setVerticesFromCurrState = function(){
        var x = this._uniforms.mouseCoords.value[0];
        var y = this._uniforms.mouseCoords.value[1];

        var x_t = getGLCoordsFromNormalizedShaderCoords([x / this._canvasWidth])[0];
        var y_t = getGLCoordsFromNormalizedShaderCoords([y / this._canvasHeight])[0];
        
        var radius_t = this._uniforms.radius.value[0];
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(x - radius_t - this._padding, y - radius_t - this._padding, (radius_t * 2) + (this._padding * 2), (radius_t * 2) + (this._padding * 2), this._canvasWidth, this._canvasHeight) );
    }

    return CursorHandler;
});