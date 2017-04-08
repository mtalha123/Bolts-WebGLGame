define(['ShaderLibrary', 'Custom Utility/getVertices', 'Custom Utility/getTextInfo', 'Custom Utility/map', 'Custom Utility/convertToGLCoordinate'], function(ShaderLibrary, getVertices, getTextInfo, map, convertToGLCoordinate){
    var allHandlers = [];
    
    function requestEffect(effect){
        var handler;
    
        switch(effect){
            case ShaderLibrary.LIGHTNING:
                handler = {
                    _shaderProgram: ShaderLibrary.requestProgram(effect),
                    _radius: 8000,
                    _shouldDraw: false,
                    _uniforms: {
                        iResolution: {
                            type: "vec2",
                            value: [1920, 800]
                        },
                        iGlobalTime: {
                            type: "float",
                            value: [1]
                        },
                        lengthArray: {
                            type: "int",
                            value: [10]
                        },
                        fluctuation: {
                            type: "float",
                            value: [40.0]
                        },
                        glowFactor: {
                            type: "float",
                            value: [6.5]
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
                            value: 1,
                            texture: null
                        },
                        noise: {
                            type: "sampler2D",
                            value: 0,
                            texture: null
                        }
                    }, 
                    _attributes: {
                        vertexPosition: getVertices(-1.0, -1.0, 2.0, 2.0) 
                    },
                    //path can only contain two points (x1, y1, x2, y2)
                    _addToPath: function(path){
                        var x = path[0] - this._radius;
                        var y = path[1] - this._radius;
                        var width = (path[2] + this._radius) - x;
                        var height = (path[3] + this._radius) - y;

                        x /= this._uniforms.iResolution.value[0];
                        y /= this._uniforms.iResolution.value[1];
                        width /= this._uniforms.iResolution.value[0];
                        height /= this._uniforms.iResolution.value[1];

                        this._attributes.vertexPosition = this._attributes.vertexPosition.concat(getVertices(x, y, width, height));

                        //transform coordinates to opengl space, i.e. [(-1, -1) to (1, 1)]
                        for(var a = (this._attributes.vertexPosition.length - 12); a < (this._attributes.vertexPosition.length - 1); a+=2){
                            this._attributes.vertexPosition[a] = (this._attributes.vertexPosition[a] * 2) - 1;
                            this._attributes.vertexPosition[a+1] = (this._attributes.vertexPosition[a+1] * 2) - 1;
                        }
                    },
                    setToBorderPath: function(width, height){
                        this._attributes.vertexPosition = [];
                        //this._uniforms.coords.value = [];
                        
                        this._addToPath( [this._radius, this._radius, width - this._radius, this._radius] );
                        this._addToPath( [width - this._radius, this._radius * 3, width - this._radius, height - this._radius] );
                        this._addToPath( [this._radius, height - this._radius, width - (this._radius * 3), height - this._radius] );
                        this._addToPath( [this._radius, this._radius * 3, this._radius, height - (this._radius * 3)] );

//                        this._uniforms.coords.value = [this._radius, this._radius, width - this._radius, this._radius,
//                                                       width - this._radius, height - this._radius,
//                                                       this._radius, height - this._radius,
//                                                       this._radius, this._radius                                                     
//                                                      ]
                    },
                    setFluctuation: function(newFluctuation){
                        this._uniforms.fluctuation.value = [newFluctuation];
                    },
                    setGlow: function(newGlowFactor){
                        this._uniforms.glowFactor.value = [newGlowFactor];
                    },
                    setLineWidth: function(newLineWidth){
                        this._uniforms.lineWidth.value = [newLineWidth];
                    },
                    setTime: function(newTime){
                       this._uniforms.iGlobalTime.value = [newTime];
                    },
                    setResolution: function(width, height){
                        this._uniforms.iResolution.value = [width, height];
                    },
                    getNumVertices: function(){
                        return this._attributes.vertexPosition.length / 2;
                    },
                    setLightningCoords: function(coords, gl, length){
                        this._uniforms.coords.texture = gl.createTexture();
                        var image = new Uint8Array(coords);

                        gl.bindTexture(gl.TEXTURE_2D, this._uniforms.coords.texture);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, length, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.bindTexture(gl.TEXTURE_2D, null);

                    },
                    setNoiseTexture(noiseData, gl, width, height){
                        this._uniforms.noise.texture = gl.createTexture();
                        var image = new Uint8Array(noiseData);

                        gl.bindTexture(gl.TEXTURE_2D, this._uniforms.noise.texture);
                        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1024, 1024, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    },
                    setGlowColor: function(newGlowColor){
                        this._uniforms.glowColor.value = newGlowColor;
                    },
                    setBoltColor: function(newBoltColor){
                        this._uniforms.boltColor.value = newBoltColor;
                    },
                    shouldDraw: function(shoulddraw){
                        this._shouldDraw = shoulddraw;
                    }
                };          
                break;
                
            case ShaderLibrary.TARGET:
                handler = {
                    _shaderProgram: ShaderLibrary.requestProgram(effect),
                    _shouldDraw: false,
                    _uniforms: {
                        iResolution: {
                            type: "vec2",
                            value: [1920, 950]
                        },
                        iGlobalTime: {
                            type: "float",
                            value: [1]
                        },
                        fluctuation: {
                            type: "float",
                            value: [20.0]
                        },
                        glowFactor: {
                            type: "float",
                            value: [6.5]
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
                        center: {
                            type: "vec2",
                            value: [960, 475]
                        },
                        radius: {
                            type: "float",
                            value: [150] 
                        },
                        circleLineWidth: {
                            type: "float",
                            value: [10]
                        },
                        circleGlowFactor: {
                            type: "float",
                            value: [60]
                        },
                        noise: {
                            type: "sampler2D",
                            value: 0,
                            texture: null
                        }
                    },
                    _attributes: {
                        vertexPosition: getVertices(-0.083 * 1.2, -0.083 * 2.5, 0.083 * 2.4, 0.083 * 5)  
                    },
                    setX: function(newX){
                        this._uniforms.center.value[0] = newX;
                        this._generateVerticesFromCenterCoords();
                    },
                    setY: function(newY){
                        this._uniforms.center.value[1] = newY;
                        this._generateVerticesFromCenterCoords();
                    },
                    setFluctuation: function(newFluctuation){
                        this._uniforms.fluctuation.value = [newFluctuation];
                    },
                    setLightningGlow: function(newGlowFactor){
                        this._uniforms.glowFactor.value = [newGlowFactor];
                    },
                    setLightningLineWidth: function(newLineWidth){
                        this._uniforms.lineWidth.value = [newLineWidth];
                    },
                    setTime: function(newTime){
                       this._uniforms.iGlobalTime.value = [newTime];
                    },
                    setResolution: function(width, height){
                        this._uniforms.iResolution.value = [width, height];
                    },
                    getNumVertices: function(){
                        return this._attributes.vertexPosition.length / 2;
                    },
                    setNoiseTexture(noiseData, gl, width, height){
                        this._uniforms.noise.texture = gl.createTexture();
                        var image = new Uint8Array(noiseData);

                        gl.bindTexture(gl.TEXTURE_2D, this._uniforms.noise.texture);
                        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1024, 1024, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    },
                    setLightningGlowColor: function(newGlowColor){
                        this._uniforms.glowColor.value = newGlowColor;
                    },
                    setLightningBoltsColor: function(newBoltColor){
                        this._uniforms.boltColor.value = newBoltColor;
                    },
                    setRadius: function(newRadius){
                        this._uniforms.radius.value[0] = newRadius;
                        this._generateVerticesFromCenterCoords();
                    },
                    _generateVerticesFromCenterCoords: function(){
                        var radius_t = this._uniforms.radius.value[0] + this._uniforms.circleLineWidth.value[0] + this._uniforms.circleGlowFactor.value[0];
                        var centerX_t = this._uniforms.center.value[0];
                        var centerY_t = this._uniforms.center.value[1];
                        
                        //this._attributes.vertexPosition = getVertices(centerX_t - (radius_t * 1.2), centerY_t - (radius_t * 2.5),radius_t * 2.4, radius_t * 5);
                        this._attributes.vertexPosition = [
                            centerX_t + radius_t, centerY_t + radius_t,
                            centerX_t - radius_t, centerY_t + radius_t,
                            centerX_t - radius_t, centerY_t - radius_t,

                            centerX_t - radius_t, centerY_t - radius_t,
                            centerX_t + radius_t, centerY_t - radius_t,
                            centerX_t + radius_t, centerY_t + radius_t,
                        ];//getVertices(centerX_t - radius_t, centerY_t - (radius_t), radius_t * 2, radius_t * 2);
                        
                        //testing
                        for(var i = 0; i < this._attributes.vertexPosition.length-1; i+=2){
                            this._attributes.vertexPosition[i] = convertToGLCoordinate(this._attributes.vertexPosition[i] / this._uniforms.iResolution.value[0]);
                            this._attributes.vertexPosition[i+1] = convertToGLCoordinate(this._attributes.vertexPosition[i+1] / this._uniforms.iResolution.value[1]);
                        }
                    },
                    setCircleGlowFactor: function(newGlowFactor){
                        this._uniforms.circleGlowFactor.value[0] = newGlowFactor;
                        this._generateVerticesFromCenterCoords();
                    },
                    shouldDraw: function(shoulddraw){
                        this._shouldDraw = shoulddraw;
                    }
                };          
                break;
            case ShaderLibrary.SCORE_TEXT:
                handler = {
                    _shaderProgram: ShaderLibrary.requestProgram(ShaderLibrary.SCORE_TEXT),
                    _x: 100,
                    _y: 100,
                    width: null,
                    canvasWidth: null,
                    canvasHeight: null,
                    _shouldDraw: false,
                    _uniforms: {
                        fontTexture: {
                            type: "sampler2D",
                            value: 2,
                            texture: null
                        },
                        textColor: {
                            type: "vec3",
                            value: [1.0, 1.0, 0.0]
                        }
                    },
                    _attributes: {
                        vertexPosition: [],
                        texCoord: []
                    },
                    setFontTexture: function(image, gl, width, height){
                        this._uniforms.fontTexture.texture = gl.createTexture();

                        gl.bindTexture(gl.TEXTURE_2D, this._uniforms.fontTexture.texture);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    },
                    setText: function(string, canvasWidth, canvasHeight){
                        this._attributes.vertexPosition = [];
                        var textObject = getTextInfo(string);
                        this._attributes.texCoord = [];
                        this.width = 0;
                        
                        var textCursorX = convertToGLCoordinate(this._x / canvasWidth);
                        var textCursorY = convertToGLCoordinate(this._y / canvasHeight);
                        
                        for(var i = 0; i < string.length; i++){                            
                            var x = textObject[string[i]].x;
                            var y = 512 - textObject[string[i]].y;
                            var width = textObject[string[i]].width;
                            var height = textObject[string[i]].height;
                            
                            var xOffset = textObject[string[i]].xoffset / canvasWidth;
                            var yOffset = textObject[string[i]].yoffset / canvasHeight;
                            var xAdvance = textObject[string[i]].xadvance / canvasWidth;
                            
                            y -= height;

                            x /= 512;
                            y /= 512;
                            width /= 512;
                            height /= 512;

                            this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getVertices(textCursorX, textCursorY + height, xAdvance, height) );

                            this._attributes.texCoord.push(x + width);
                            this._attributes.texCoord.push(y);

                            this._attributes.texCoord.push(x);
                            this._attributes.texCoord.push(y);

                            this._attributes.texCoord.push(x);
                            this._attributes.texCoord.push(y + height);

                            this._attributes.texCoord.push(x);
                            this._attributes.texCoord.push(y + height);

                            this._attributes.texCoord.push(x + width);
                            this._attributes.texCoord.push(y + height);

                            this._attributes.texCoord.push(x + width);
                            this._attributes.texCoord.push(y);
                            
                            textCursorX += xAdvance;
                            this.width += (xAdvance * canvasWidth);
                        }
                        console.log("WIDTH: " + this.width);
                    },
                    getNumVertices: function(){
                        return this._attributes.vertexPosition.length / 2;
                    },
                    setX: function(newX){
                        var prevX_t = convertToGLCoordinate(this._x / this.canvasWidth);
                        var newX_t = convertToGLCoordinate(newX / this.canvasWidth);
                        
                        var moveX = 0;

                        if(newX_t < prevX_t){
                            moveX = Math.abs(newX_t - prevX_t) * -1;
                        }else if(newX_t > prevX_t){
                            moveX = Math.abs(newX_t - prevX_t);
                        }
                        
                        for(var i = 0; i < (this._attributes.vertexPosition.length-1); i+=2){
                            this._attributes.vertexPosition[i] += moveX;
                        }
                        
                        this._x = newX;
                    },
                    setY: function(newY){
                        var prevY_t = convertToGLCoordinate(this._y / this.canvasHeight);
                        var newY_t = convertToGLCoordinate(newY / this.canvasHeight);
                        
                        var moveY = 0;

                        if(newY_t < prevY_t){
                            moveY = Math.abs(newY_t - prevY_t) * -1;
                        }else if(newY_t > prevY_t){
                            moveY = Math.abs(newY_t - prevY_t);
                        }
                        
                        for(var i = 1; i < this._attributes.vertexPosition.length; i+=2){
                            this._attributes.vertexPosition[i] += moveY;
                        }
                        
                        this._y = newY;
                    },
                    setTextColor: function(r, g, b){
                        this._uniforms.textColor.value = [r, g, b];
                    },
                    shouldDraw: function(shoulddraw){
                        this._shouldDraw = shoulddraw;
                    }
                };
                break;
                
                case ShaderLibrary.CURSOR:
                    handler = {
                        _shaderProgram: ShaderLibrary.requestProgram(ShaderLibrary.CURSOR),
                        _x: 0,
                        _y: 0,
                        canvasWidth: null,
                        canvasHeight: null,
                        _shouldDraw: false,
                        _uniforms: {
                            iResolution: {
                                type: "vec2",
                                value: [1920, 950]
                            },
                            mouseCoords: {
                                type: "vec2",
                                value: [this._x, this._y]
                            },
                            clicked: {
                                type: "float",
                                value: [0.0]
                            }
                        },
                        _attributes: {
                            vertexPosition: getVertices(-0.1, -0.1, 0.1, 0.1),
                        },
                        getNumVertices: function(){
                            return this._attributes.vertexPosition.length / 2;
                        },
                        setX: function(newX){
                            this._uniforms.mouseCoords.value[0] = newX;
                            
                            var x_t = convertToGLCoordinate(newX / this.canvasWidth);
                            var y_t = convertToGLCoordinate(this._y / this.canvasHeight);
                            this._attributes.vertexPosition = getVertices(x_t - 0.1, y_t - 0.1, 0.2, 0.2);
                            
                            this._x = newX;
                        },
                        setY: function(newY){
                            this._uniforms.mouseCoords.value[1] = newY;
                            
                            var x_t = convertToGLCoordinate(this._x / this.canvasWidth);
                            var y_t = convertToGLCoordinate(newY / this.canvasHeight);
                            this._attributes.vertexPosition = getVertices(x_t - 0.1, y_t - 0.1, 0.2, 0.2);
                            
                            this._y = newY;
                        },
                        setClicked: function(clicked){
                            if(clicked){
                                this._uniforms.clicked.value[0] = 1.0;
                            }else{
                                this._uniforms.clicked.value[0] = 0.0;
                            }
                        },
                        shouldDraw: function(shoulddraw){
                            this._shouldDraw = shoulddraw;
                        }
                };
                break;
        }
        
        allHandlers.push(handler);
        return handler;
    }
    
//    function update(gl){
//        var allVertices = [];
//        for(var i = 0; i < allHandlers.length; i++){
//            allVertices = allVertices.concat(allHandlers[i]._vertices);
//            //console.log("vertices: " + allVertices);
//        }
//        
//        var vertexBuffer = gl.createBuffer();
//        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVertices), gl.STATIC_DRAW);
//        
//        for(var i = 0; i < allHandlers.length; i++){          
//            gl.useProgram(allHandlers[i]._shaderProgram);
//            var shaderVarLocation = gl.getAttribLocation(allHandlers[i]._shaderProgram, "vertexPosition");
//            gl.enableVertexAttribArray(shaderVarLocation);
//            gl.vertexAttribPointer(shaderVarLocation, 2, gl.FLOAT, false, 0, 0);
//            
//            if(allHandlers[i].varyings != undefined){
//                var varyingBuffer = gl.createBuffer();
//                gl.bindBuffer(gl.ARRAY_BUFFER, varyingBuffer);
//                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allHandlers[i].varyings.value), gl.STATIC_DRAW);
//                allHandlers[i].varyings.attribLocation = gl.getAttribLocation(allHandlers[i]._shaderProgram, "texCoord");
//                gl.enableVertexAttribArray(allHandlers[i].varyings.attribLocation);
//                gl.vertexAttribPointer(allHandlers[i].varyings.attribLocation, 2, gl.FLOAT, false, 0, 0);
//            }
//        }
//    }
    
    function getHandlers(){
        var handlersToReturn = [];
        
        for(var i = 0; i < allHandlers.length; i++){
            if(allHandlers[i]._shouldDraw){
                handlersToReturn.push(allHandlers[i]);
            }
        }
        return handlersToReturn;
    }
    
    function setUpUniforms(gl, handler){
        for(var uniformVar in handler._uniforms){
            var uniformLocation = gl.getUniformLocation(handler._shaderProgram, uniformVar);
            switch(handler._uniforms[uniformVar].type){
                case "int":
                    gl.uniform1iv(uniformLocation, handler._uniforms[uniformVar].value);
                    break;
                case "float":
                    gl.uniform1fv(uniformLocation, handler._uniforms[uniformVar].value);
                    break;
                case "vec2":
                    gl.uniform2fv(uniformLocation, handler._uniforms[uniformVar].value);
                    break;
                case "vec3":
                    gl.uniform3fv(uniformLocation, handler._uniforms[uniformVar].value);
                    break;
                case "vec4":
                    gl.uniform4fv(uniformLocation, handler._uniforms[uniformVar].value);
                    break;
                case "sampler2D":
                    if(handler._uniforms[uniformVar].value === 0){
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, handler._uniforms.noise.texture);
                        gl.uniform1i(uniformLocation, 0);
                    }else if(handler._uniforms[uniformVar].value === 1){
                        gl.activeTexture(gl.TEXTURE1);
                        gl.bindTexture(gl.TEXTURE_2D, handler._uniforms.coords.texture);
                        gl.uniform1i(uniformLocation, 1);
                    }else if(handler._uniforms[uniformVar].value === 2){
                        gl.activeTexture(gl.TEXTURE2);
                        gl.bindTexture(gl.TEXTURE_2D, handler._uniforms.fontTexture.texture);
                        gl.uniform1i(uniformLocation, 2);
                    }
                    break;
            }
        }
    }
    
    function setUpAttributesAndUniforms(gl, handler){
        for(var attribute in handler._attributes){
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(handler._attributes[attribute]), gl.STATIC_DRAW);
            
            //console.log("index: " + index + "        "  + handler._attributes[attribute].length);
            
            var attribLocation = gl.getAttribLocation(handler._shaderProgram, attribute);
            gl.enableVertexAttribArray(attribLocation);
            gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
        }
        
        setUpUniforms(gl, handler);
    }
    
    return {
        requestEffect: requestEffect,
        getHandlers: getHandlers,
        setUpAttributesAndUniforms: setUpAttributesAndUniforms
    };
    
});