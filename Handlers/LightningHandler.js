define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Custom Utility/getGLTextureToPassInfoFromRGBData', 'Custom Utility/coordsToRGB', 'Custom Utility/Vector', 'timingCallbacks'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, getGLTextureToPassInfoFromRGBData, coordsToRGB, Vector, timingCallbacks){
    
    function LightningHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, coords, ShaderLibrary, noiseTextureData, coordsSamplerVal){
        var widthOfCoordsTexture = coordsToRGB(coords, canvasWidth, canvasHeight).length / 3;
        this._uniforms = { 
            iResolution: { 
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1]
            },
            numCoords: {
                type: "int",
                value: [coords.length / 2]
            },
            widthOfCoordsTexture: {
                type: "float",
                value: [widthOfCoordsTexture]
            },
            fluctuation: {
                type: "float",
                value: [25.0]
            },
            glowFactor: {
                type: "float",
                value: [20]
            },
            lineWidth: {
                type: "float",
                value: [2.0]
            },
            boltColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.0]
            },
            glowColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.7]
            },
            spikedLgBool: {
                type: "float",
                value: [0.0]
            },
            completion: {
                type: "float",
                value: [0.0]
            },
            coords: {
                type: "sampler2D",
                value: coordsSamplerVal,
                texture: null
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIGHTNING);
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts); 
        
        this._gl = gl;
       
        this.setLightningCoords(coords);   
    }
    
    //inherit from Handler
    LightningHandler.prototype = Object.create(Handler.prototype);
    LightningHandler.prototype.constructor = LightningHandler; 
    
    // startX refers to the x coordinate of the start of the border lightning
    // endX refers to the x coordinate of the end of the border lightning
    LightningHandler.prototype.setToBorderPath = function(gl, startX, endX){   
        var width = 0.1 * this._canvasHeight;
        var spaceForLightningEnds = 0.06 * this._canvasHeight; // so the lightning effect is not "cut off" sharply at the beginning and end (i.e. close to the score location)
        var borderVertices = [  //              X                           Y
                                0,                                   this._canvasHeight,
                                startX + spaceForLightningEnds,      this._canvasHeight,
                                startX + spaceForLightningEnds,      this._canvasHeight - width,
                                startX + spaceForLightningEnds,      this._canvasHeight - width,
                                0,                                   this._canvasHeight - width,
                                0,                                   this._canvasHeight,
                                
                                0,                                   this._canvasHeight - width,
                                width,                               this._canvasHeight - width,
                                width,                               0,
                                width,                               0,
                                0,                                   0,
                                0,                                   this._canvasHeight - width,
                                
                                width,                               width,
                                this._canvasWidth,                   width,
                                this._canvasWidth,                   0, 
                                this._canvasWidth,                   0, 
                                width,                               0,
                                width,                               width,
            
                                this._canvasWidth - width,           width,
                                this._canvasWidth - width,           this._canvasHeight - width,
                                this._canvasWidth,                   this._canvasHeight - width,
                                this._canvasWidth,                   this._canvasHeight - width,
                                this._canvasWidth,                   width,
                                this._canvasWidth - width,           width,
            
                                this._canvasWidth,                   this._canvasHeight - width,
                                endX - spaceForLightningEnds,        this._canvasHeight - width,
                                endX - spaceForLightningEnds,        this._canvasHeight,
                                endX - spaceForLightningEnds,        this._canvasHeight,
                                this._canvasWidth,                   this._canvasHeight,
                                this._canvasWidth,                   this._canvasHeight - width
                             ];
        // normalize
        for(var i = 0; i <= borderVertices.length - 2; i+=2){
            borderVertices[i] /= this._canvasWidth;
            borderVertices[i+1] /= this._canvasHeight;
        }
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords(borderVertices);
    }

    LightningHandler.prototype.setLightningCoords = function(coords){
        var coordsInRGB = coordsToRGB(coords, this._canvasWidth, this._canvasHeight);
        this._uniforms.coords.texture = getGLTextureToPassInfoFromRGBData(coordsInRGB, this._gl);
        this._generateVerticesFromCoords(coords);
    }
    
    LightningHandler.prototype._generateVerticesFromCoords = function(coords){
        var vertices = [];
        
        for(var i = 0; i < coords.length - 2; i += 2){
            var startCoord = new Vector(coords[i], coords[i+1]);
            var endCoord = new Vector(coords[i+2], coords[i+3]);
            
            var padding = 0.06 * this._canvasHeight;

            var dirVec = (endCoord.subtract(startCoord)).getNormalized().multiplyWithScalar(padding);
            var negDirVec = dirVec.multiplyWithScalar(-1);
            var perp1 = new Vector(-dirVec.getY(), dirVec.getX());
            var perp2 = new Vector(dirVec.getY(), -dirVec.getX());

            var firstVertex = (startCoord.addTo(negDirVec)).addTo(perp1);
            var secondVertex = (startCoord.addTo(negDirVec)).addTo(perp2);
            var thirdVertex = (endCoord.addTo(dirVec)).addTo(perp1);
            var fourthVertex = (endCoord.addTo(dirVec)).addTo(perp2);

            var currVertices = [firstVertex.getX(), firstVertex.getY(), secondVertex.getX(), secondVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), thirdVertex.getX(), thirdVertex.getY(), secondVertex.getX(), secondVertex.getY(), fourthVertex.getX(), fourthVertex.getY()];

            //normalize
            for(var a = 0; a < currVertices.length-1; a+=2){
                currVertices[a] /= this._canvasWidth; 
                currVertices[a+1] /= this._canvasHeight; 
            }

            vertices = vertices.concat(getGLCoordsFromNormalizedShaderCoords(currVertices));
        }
        
        this._attributes.vertexPosition = vertices;
    }
    
    LightningHandler.prototype.doDisappearEffect = function(){
        this._shouldDraw = true;
        
        timingCallbacks.addTimingEvents(this, 500, 1, function(time){
            this._uniforms.completion.value[0] = time / 500;
        }, function(){
            this._shouldDraw = false; 
        });
    }
    
    return LightningHandler;
});