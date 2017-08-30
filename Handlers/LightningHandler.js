define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Custom Utility/getGLTextureToPassInfoFromRGBData', 'Custom Utility/coordsToRGB'], function(Handler, getVerticesUnNormalized, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, getGLTextureToPassInfoFromRGBData, coordsToRGB){
    
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
                value: [40]
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
        
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight, opts); 
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIGHTNING);
       
        //CHANGE AFTER
        this._padding = 0.06 * this._canvasHeight;
        this.setLightningCoords(coords, gl);        
    }
    
    //inherit from Handler
    LightningHandler.prototype = Object.create(Handler.prototype);
    LightningHandler.prototype.constructor = LightningHandler; 
    

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

    LightningHandler.prototype.setLightningCoords = function(coords, gl){
        var coordsInRGB = coordsToRGB(coords, this._canvasWidth, this._canvasHeight);
        this._uniforms.coords.texture = getGLTextureToPassInfoFromRGBData(coordsInRGB, gl);
        this._generateVerticesFromCoords(coords);
    }
    
    LightningHandler.prototype._generateVerticesFromCoords = function(coords){
        var vertices = [];

        var startX, startY, endX, endY;
        for(var i = 0; i < coords.length - 2; i += 2){
            startX = coords[i];
            startY = coords[i+1];
            endX = coords[i+2];
            endY = coords[i+3];
            
            if(startX > endX || startY > endY){
                var tempX = startX;
                startX = endX;
                endX = tempX;
                
                var tempY = startY;
                startY = endY;
                endY = tempY;
            }
            
            var width = (endX - startX) + (this._padding * 2);
            var height = (endY - startY) + (this._padding * 2);
            
            vertices = vertices.concat( getGLCoordsFromNormalizedShaderCoords(getVerticesNormalized(startX - this._padding, startY - this._padding, width, height, this._canvasWidth, this._canvasHeight)) );
        }
        
         this._attributes.vertexPosition = vertices;
    }
    
    return LightningHandler;
});