define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForImage', 'Custom Utility/getTextInfo'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForImage, getTextInfo){
    
    function ComboHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary, fontTextureData, effectTextureData, comboText){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.COMBO);
        
        var comboTextInfo = getTextInfo(comboText);
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
            iGlobalTime: {
                type: "float",
                value: [0]
            },
            center: {
                type: "vec2",
                value: [300, 500]
            },
            radiusFromText: {
                type: "float",
                value: [50]
            },
            radiusOfEdgeEffect: {
                type: "float",
                value: [40]
            },
            spreadOfEdgeEffect: {
                type: "float",
                value: [20]
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
            firstCharCoords:{
                type: "vec4",
                value: [280, 480, 300, 520]
            },
            secondTextCoords: {
                type: "vec4",
                value: [secondCharTextureCoords]
            },
            secondCharCoords:{
                type: "vec4",
                value: [310, 480, 330, 500]
            },
            thirdTextCoords: {
                type: "vec4",
                value: [-1, -1, -1, -1]
            },
            thirdCharCoords: {
                type: "vec4",
                value: [-1, -1, -1, -1]
            },
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
        this._charWidth = 0.025 * canvasHeight;
        this._gapBetweenChars = 0.004 * canvasHeight;
        this.setComboText(comboText);
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    ComboHandler.prototype = Object.create(Handler.prototype);
    ComboHandler.prototype.constructor = ComboHandler; 
    
    ComboHandler.prototype.setPosition = function(newX, newY){
        var distanceToEdgeOfEffect = (this._uniforms.radiusFromText.value[0] + this._uniforms.radiusOfEdgeEffect.value[0] + this._uniforms.spreadOfEdgeEffect.value[0]);
        this._uniforms.center.value[0] = newX + distanceToEdgeOfEffect;
        this._uniforms.center.value[1] = newY - distanceToEdgeOfEffect;

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(newX, newY - (distanceToEdgeOfEffect * 2), distanceToEdgeOfEffect * 2, distanceToEdgeOfEffect * 2, this._canvasWidth, this._canvasHeight) );
        
        //make sure text appears in right spot
        this._setPositionOfChars();
    }
    
    ComboHandler.prototype.update = function(){
        this._time+=0.1;
        this._uniforms.iGlobalTime.value[0] = this._time;
    }
    
    ComboHandler.prototype.setCompletion = function(completionVal){
        this._uniforms.completion.value = [completionVal];
    }
    
    ComboHandler.prototype.setComboText = function(comboText){
        var comboTextInfo = getTextInfo(comboText);
        var firstCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[0]], this._fontTextureWidth, this._fontTextureHeight);
        var secondCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[1]], this._fontTextureWidth, this._fontTextureHeight);
        if(comboText[2] != undefined){
            var thirdCharTextureCoords = this._getCharCoordsFromTextInfo(comboTextInfo[comboText[2]], this._fontTextureWidth, this._fontTextureHeight);
        }else{
            var thirdCharTextureCoords = [-1, -1, -1, -1];
        }       
        
        this._uniforms.firstTextCoords.value = firstCharTextureCoords;
        this._uniforms.secondTextCoords.value = secondCharTextureCoords;
        this._uniforms.thirdTextCoords.value = thirdCharTextureCoords;
        
        this._setPositionOfChars();
    }
    
    ComboHandler.prototype._setPositionOfChars = function(){
        var radiusFromText = this._uniforms.radiusFromText.value[0];
        var centerX = this._uniforms.center.value[0], centerY = this._uniforms.center.value[1];

        if(this._uniforms.thirdTextCoords.value[0] != (-1)){
            var firstCharStart = [centerX - (radiusFromText / 1.5), centerY - (radiusFromText / 2)]; 
            var firstCharEnd = [firstCharStart[0] + this._charWidth, centerY + (radiusFromText / 2)];
            var secondCharStart = [firstCharEnd[0] + this._gapBetweenChars, centerY - (radiusFromText / 2)]; 
            var secondCharEnd = [secondCharStart[0] + this._charWidth, centerY + (radiusFromText / 2)]; 
            var thirdCharStart = [secondCharEnd[0] + this._gapBetweenChars, centerY - (radiusFromText / 2)];
            var thirdCharEnd = [thirdCharStart[0] + this._charWidth, centerY + (radiusFromText / 3)];

            this._uniforms.firstCharCoords.value = [firstCharStart[0], firstCharStart[1], firstCharEnd[0], firstCharEnd[1]];
            this._uniforms.secondCharCoords.value = [secondCharStart[0], secondCharStart[1], secondCharEnd[0], secondCharEnd[1]];
            this._uniforms.thirdCharCoords.value = [thirdCharStart[0], thirdCharStart[1], thirdCharEnd[0], thirdCharEnd[1]];
        }else{
            var firstCharStart = [centerX - (radiusFromText / 2), centerY - (radiusFromText / 2)]; 
            var firstCharEnd = [firstCharStart[0] + this._charWidth, centerY + (radiusFromText / 2)];
            var secondCharStart = [firstCharEnd[0] + this._gapBetweenChars, centerY - (radiusFromText / 2)]; 
            var secondCharEnd = [secondCharStart[0] + this._charWidth, centerY + (radiusFromText / 2)]; 

            this._uniforms.firstCharCoords.value = [firstCharStart[0], firstCharStart[1], firstCharEnd[0], firstCharEnd[1]];
            this._uniforms.secondCharCoords.value = [secondCharStart[0], secondCharStart[1], secondCharEnd[0], secondCharEnd[1]];
        }
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