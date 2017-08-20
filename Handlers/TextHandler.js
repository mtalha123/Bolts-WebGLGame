define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForImage', 'Custom Utility/getTextInfo'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForImage, getTextInfo){
    
    function TextHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, fontTextureData, x, y, text){
        this._uniforms = {
            fontTexture: {
                type: "sampler2D",
                value: fontTextureData.sampler,
                texture: fontTextureData.fontTexture
            },
            textColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.0]
            }
        };
        
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight, opts);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TEXT);
        
        this._attributes.texCoord = [];
        this._width = 0, this._x = x, this._y = y;
        this._fontTextureWidth = fontTextureData.width;
        this._fontTextureHeight = fontTextureData.height;
        
        this.setText(text);
    }
    
    //inherit from Handler
    TextHandler.prototype = Object.create(Handler.prototype);
    TextHandler.prototype.constructor = TextHandler; 
    
    TextHandler.prototype.setPosition = function(newX, newY){
        var prevX_t = getGLCoordsFromNormalizedShaderCoords([this._x / this._canvasWidth])[0];
        var newX_t = getGLCoordsFromNormalizedShaderCoords([newX / this._canvasWidth])[0];
        
        var prevY_t = getGLCoordsFromNormalizedShaderCoords([this._y / this._canvasHeight])[0];
        var newY_t = getGLCoordsFromNormalizedShaderCoords([newY / this._canvasHeight])[0];


        var moveX = 0;
        var moveY = 0;

        if(newX_t < prevX_t){
            moveX = Math.abs(newX_t - prevX_t) * -1;
        }else if(newX_t > prevX_t){
            moveX = Math.abs(newX_t - prevX_t);
        }
        
        if(newY_t < prevY_t){
            moveY = Math.abs(newY_t - prevY_t) * -1;
        }else if(newY_t > prevY_t){
            moveY = Math.abs(newY_t - prevY_t);
        }

        for(var i = 0; i < (this._attributes.vertexPosition.length-1); i+=2){
            this._attributes.vertexPosition[i] += moveX;
            this._attributes.vertexPosition[i+1] += moveY;
        }

        this._x = newX;
        this._y = newY;
    }
    
    TextHandler.prototype.setText = function(string){
        this._attributes.vertexPosition = [];
        var textObject = getTextInfo(string);
        this._attributes.texCoord = [];
        this._width = 0;

        var textCursorX = getGLCoordsFromNormalizedShaderCoords([this._x / this._canvasWidth])[0];
        var textCursorY = getGLCoordsFromNormalizedShaderCoords([this._y / this._canvasHeight])[0];

        for(var i = 0; i < string.length; i++){                            
            var x = textObject[string[i]].x;
            var y = this._fontTextureHeight - textObject[string[i]].y;
            var widthOfChar = textObject[string[i]].width;
            var heightOfChar = textObject[string[i]].height;

            var xOffset = textObject[string[i]].xoffset / this._canvasWidth;
            var yOffset = textObject[string[i]].yoffset / this._canvasHeight;
            var xAdvance = textObject[string[i]].xadvance / this._canvasWidth;

            y -= heightOfChar;

            x /= this._fontTextureWidth;
            y /= this._fontTextureHeight;
            widthOfChar /= this._fontTextureWidth;
            heightOfChar /= this._fontTextureHeight;

            this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getVerticesUnNormalized(textCursorX, textCursorY + heightOfChar, xAdvance, heightOfChar) );
            
            this._attributes.texCoord.push(x + widthOfChar);
            this._attributes.texCoord.push(y);

            this._attributes.texCoord.push(x);
            this._attributes.texCoord.push(y);

            this._attributes.texCoord.push(x);
            this._attributes.texCoord.push(y + heightOfChar);

            this._attributes.texCoord.push(x);
            this._attributes.texCoord.push(y + heightOfChar);

            this._attributes.texCoord.push(x + widthOfChar);
            this._attributes.texCoord.push(y + heightOfChar);

            this._attributes.texCoord.push(x + widthOfChar);
            this._attributes.texCoord.push(y);

            textCursorX += xAdvance;
            this._width += (xAdvance * this._canvasWidth);
        }
    }
    
    TextHandler.prototype.getWidth = function(){
        return this._width;
    }
    
    
    return TextHandler;
});