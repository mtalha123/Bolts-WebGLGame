define(['Handlers/Handler', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getVerticesNormalized'], function(Handler, getGLCoordsFromNormalizedShaderCoords, getVerticesNormalized){
    
    function SpriteHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, position, widthAndHeight, ShaderLibrary, textureData){
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },         
            iGlobalTime: {
                type: "float",
                value: [0]
            },       
            widthAndHeight: {
                type: "float",
                value: [widthAndHeight]
            },          
            bottomLeftCornerPos: {
                type: "vec2",
                value: [0, 0]
            },
            center: {
                type: "vec2",
                value: [0, 0]
            },
            color: {
                type: "vec3",
                value: [1.0, 0.0, 0.0]
            },
            sprite: {
                type: "sampler2D",
                value: textureData.sampler,
                texture: textureData.texture
            }
        };
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.SPRITE);        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);  
        this._widthAndHeight = widthAndHeight;
        this.setPosition(position);
    }
    
    //inherit from Handler
    SpriteHandler.prototype = Object.create(Handler.prototype);
    SpriteHandler.prototype.constructor = SpriteHandler; 
    
    SpriteHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._uniforms.bottomLeftCornerPos.value = [newPosition.getX() - (this._widthAndHeight / 2), newPosition.getY() - (this._widthAndHeight / 2)];
        this._generateVerticesFromCurrentState();
    }    
    
    SpriteHandler.prototype.setColor = function(r, g, b){
        this._uniforms.color.value = [r, g, b];
    }
    
    SpriteHandler.prototype.resetTime = function(){
        this._uniforms.iGlobalTime.value = [0];
    }
    
    SpriteHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._widthAndHeight / 2;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
    
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }

    return SpriteHandler;
});