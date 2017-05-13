define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForImage', 'Custom Utility/getTextInfo'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForImage, getTextInfo){
    
    function ComboHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, ShaderLibrary, fontTextureData, effectTextureData, comboText){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.COMBO);
        
        var comboTextInfo = getTextInfo(comboText);
        var gap = comboTextInfo[comboText[0]].xadvance;
        var firstCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[0]], fontTextureData.width, fontTextureData.height);
        var secondCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[1]], fontTextureData.width, fontTextureData.height);
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            completion: {
                type: "float",
                value: [0.5]
            },
            time: {
                type: "float",
                value: [0]
            },
            center: {
                type: "vec2",
                value: [300, 500]
            },
            radius: {
                type: "float",
                value: [50]
            },
            lineWidth: {
                type: "float",
                value: [3]
            },
            fontTexture: {
                type: "sampler2D",
                value: fontTextureData.sampler,
                texture: fontTextureData.fontTexture
            },
            effectTexture: {
                type: "sampler2D",
                value: effectTextureData.sampler,
                texture: effectTextureData.effectTexture
            },
            firstTextCoords: {
                type: "vec4",
                value: [firstCharTextureCoords]
            },
            secondTextCoords: {
                type: "vec4",
                value: [secondCharTextureCoords]
            },
            uniformGap: {
                type: "float",
                value: [gap]
            }
        };
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        this._fontTextureWidth = fontTextureData.width;
        this._fontTextureHeight = fontTextureData.height;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
        var lineWidth = this._uniforms.lineWidth.value[0];
        var radius = this._uniforms.radius.value[0];
        this.setPosition(centerX - (radius + lineWidth), centerY + (radius + lineWidth));
    }
    
    //inherit from Handler
    ComboHandler.prototype = Object.create(Handler.prototype);
    ComboHandler.prototype.constructor = ComboHandler; 
    
    ComboHandler.prototype.setPosition = function(newX, newY){
        var radiusWithLineWidth = (this._uniforms.radius.value[0] + this._uniforms.lineWidth.value[0]) * 4;
        this._uniforms.center.value[0] = newX + radiusWithLineWidth;
        this._uniforms.center.value[1] = newY - radiusWithLineWidth;

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(newX, newY - (radiusWithLineWidth * 2), radiusWithLineWidth * 2, radiusWithLineWidth * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    ComboHandler.prototype.setCompletion = function(completionVal){
        this._uniforms.completion.value = [completionVal];
    }
    
    ComboHandler.prototype.setComboText = function(comboText){
        var comboTextInfo = getTextInfo(comboText);
        var firstCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[0]], this._fontTextureWidth, this._fontTextureHeight);
        var secondCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[1]], this._fontTextureWidth, this._fontTextureHeight);
        this._uniforms.firstTextCoords.value = firstCharTextureCoords;
        this._uniforms.secondTextCoords.value = secondCharTextureCoords;
    }
    
    ComboHandler.prototype.setTime = function(timeVal){
        this._uniforms.time.value = [timeVal];
    }
    
    ComboHandler.prototype._getCharCoordsFromTextInfo = function(textInfoForSingleChar, fontTextureWidth, fontTextureHeight){
        var charXNormalized = textInfoForSingleChar.x / fontTextureWidth;
        var charYNormalized = (fontTextureHeight - textInfoForSingleChar.y) / fontTextureHeight;
        var charWidthNormalized = textInfoForSingleChar.width / fontTextureWidth;
        var charHeightNormalized = textInfoForSingleChar.height / fontTextureHeight;

        return [charXNormalized, charYNormalized - charHeightNormalized, charXNormalized + charWidthNormalized, charYNormalized];
    }

    return ComboHandler;
});