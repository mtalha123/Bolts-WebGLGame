define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Custom Utility/getGLTextureToPassInfoFromRGBData', 'Custom Utility/coordsToRGB', 'Custom Utility/Vector', 'addToAutomaticDrawing'], function(Handler, getVerticesUnNormalized, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, getGLTextureToPassInfoFromRGBData, coordsToRGB, Vector, addToAutomaticDrawing){
    
    function LightningHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, opts, coords, shouldAnimateLg, ShaderLibrary, noiseTextureData, coordsSamplerVal){
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
       
        //CHANGE AFTER
        this._padding = 0.06 * this._canvasHeight;
        this.setLightningCoords(coords);   
        this.shouldAnimateLg = shouldAnimateLg;
    }
    
    //inherit from Handler
    LightningHandler.prototype = Object.create(Handler.prototype);
    LightningHandler.prototype.constructor = LightningHandler; 
    

    LightningHandler.prototype.update = function(){
        if(this.shouldAnimateLg){
            Handler.prototype.update.call(this);
        }
    }
    
    //path can only contain two points (x1, y1, x2, y2)
    LightningHandler.prototype._addToPath = function(path){
        var x = path[0] - this._padding;
        var y = path[1] - this._padding;
        var width = (path[2] + this._padding) - x;
        var height = (path[3] + this._padding) - y;

        x /= this._canvasWidth;
        y /= this._canvasHeight;
        width /= this._canvasWidth;
        height /= this._canvasHeight;

        this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getGLCoordsFromNormalizedShaderCoords(getVerticesUnNormalized(x, y, width, height)) );
    }
    
    LightningHandler.prototype.setToBorderPath = function(gl){
        this._attributes.vertexPosition = [];
        var width = this._canvasWidth, height = this._canvasHeight;
        var lightningCoords = [this._padding, this._padding, width - this._padding, this._padding, 
                               width - this._padding, this._padding * 3, width - this._padding, height - this._padding,
                               this._padding, height - this._padding, width - (this._padding * 3), height - this._padding,
                               this._padding, this._padding * 3, this._padding, height - (this._padding * 3)                              
                              ];

//        this._addToPath( [this._padding, this._padding, width - this._padding, this._padding] );
//        this._addToPath( [width - this._padding, this._padding * 3, width - this._padding, height - this._padding] );
//        this._addToPath( [this._padding, height - this._padding, width - (this._padding * 3), height - this._padding] );
//        this._addToPath( [this._padding, this._padding * 3, this._padding, height - (this._padding * 3)] );        
        
        this._addToPath([ lightningCoords[0], lightningCoords[1], lightningCoords[2], lightningCoords[3] ]);
        this._addToPath([ lightningCoords[4], lightningCoords[5], lightningCoords[6], lightningCoords[7] ]);
        this._addToPath([ lightningCoords[8], lightningCoords[9], lightningCoords[10], lightningCoords[11] ]);
        this._addToPath([ lightningCoords[12], lightningCoords[13], lightningCoords[14], lightningCoords[15] ]);
        
        var coordsInRGB = coordsToRGB(lightningCoords, this._canvasWidth, this._canvasHeight);
        this._uniforms.coords.texture = getGLTextureToPassInfoFromRGBData(coordsInRGB, gl);
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

            var dirVec = (endCoord.subtract(startCoord)).getNormalized().multiplyWithScalar(this._padding);
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
        
        addToAutomaticDrawing.addToAutomaticDrawing(this, 500, function(time){
            this._uniforms.completion.value[0] = time / 500;
        }, function(){
            this._shouldDraw = false; 
        });
    }
    
    return LightningHandler;
});