define(['Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords){ 
    var vertexBuffers;
    
    function Handler(shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts){
        this._shouldDraw = shouldDraw;
        this._width = 300;
        this._height = 300;
        this._attributes = {
            vertexPosition: {
                value: []
            }
        };
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._zOrder = zOrder;
        this._handlers = [this];
        this._time = 1;     
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        //clone uniforms
        this._uniformsDefault = {};
        for(var uniform in this._uniforms){
            if(uniform === "noise"){
                continue;
            }
            
            this._uniformsDefault[uniform] = {value: []};
            for(var i = 0; i < this._uniforms[uniform].value.length; i++){
                this._uniformsDefault[uniform].value[i] = this._uniforms[uniform].value[i];
            }
        }
        
        for(var uniform in this._uniforms){
            this._uniforms[uniform].location = gl.getUniformLocation(this._shaderProgram, uniform);
        }
        
        for(var attribute in this._attributes){
            this._attributes[attribute].location = gl.getAttribLocation(this._shaderProgram, attribute);
        }
        
        this._vertexBuffers = [gl.createBuffer()];
        
       // this._changedUniforms = [];
      //  for(var uniform in this._uniforms){
     //       this._changedUniforms.push(uniform);
     //   }
    }
    
    Handler.prototype.shouldDraw = function(shouldDrawOrNot){
        this._shouldDraw = shouldDrawOrNot;
    }
    
    Handler.prototype.getUniforms = function(){
        return this._uniforms;
    }
    
    Handler.prototype.getAttributes = function(){
        return this._attributes;
    }
    
    Handler.prototype.getNumVertices = function(){
        return this._attributes.vertexPosition.value.length / 2;
    }
    
    Handler.prototype.getShaderProgram = function(){
        return this._shaderProgram;
    }
    
    Handler.prototype.getZOrder = function(){
        return this._zOrder;
    }
    
    Handler.prototype.getAllHandlers = function(){
        return this._handlers;
    }
    
    Handler.prototype.update = function(gl){
        this._time++;
        this._uniforms.iGlobalTime.value[0] = this._time;
    }
    
    Handler.prototype.isDrawing = function(){
        return this._shouldDraw;
    }
    
    Handler.prototype.resetProperties = function(opts){
        this._setToDefaultUniforms(opts);
    }
    
    Handler.prototype._setToDefaultUniforms = function(opts){
        for(var uniform in this._uniformsDefault){
            for(var i = 0; i < this._uniformsDefault[uniform].value.length; i++){
                this._uniforms[uniform].value[i] = this._uniformsDefault[uniform].value[i];
            }
        }
    }
    
    Handler.prototype.setUpAttributes = function(gl){
        var bufferIndex = 0;
        for(var attribute in this._attributes){            
            var vertexBuffer = this._vertexBuffers[bufferIndex];
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._attributes[attribute].value), gl.STATIC_DRAW);
            var attribLocation = this._attributes[attribute].location;
            gl.enableVertexAttribArray(attribLocation);
            if(attribute === "randVals"){
                gl.vertexAttribPointer(attribLocation, 4, gl.FLOAT, false, 0, 0);
            }else{
                gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
            }
            
            bufferIndex++;
        }
    }
    
    Handler.prototype.setUpUniforms = function(gl){
        for(var uniform in this._uniforms){
     //   for(var i = 0; i < this._changedUniforms.length; i++){
            var uniformLocation = this._uniforms[uniform].location;
            switch(this._uniforms[uniform].type){
                case "int":
                    gl.uniform1iv(uniformLocation, this._uniforms[uniform].value);
                    break;
                case "float":
                    gl.uniform1fv(uniformLocation, this._uniforms[uniform].value);
                    break;
                case "vec2":
                    gl.uniform2fv(uniformLocation, this._uniforms[uniform].value);
                    break;
                case "vec3":
                    gl.uniform3fv(uniformLocation, this._uniforms[uniform].value);
                    break;
                case "vec4":
                    gl.uniform4fv(uniformLocation, this._uniforms[uniform].value);
                    break;
                case "sampler2D":
                    if(this._uniforms[uniform].value === 0){
                        gl.activeTexture(gl.TEXTURE0);
                    }else if(this._uniforms[uniform].value === 1){
                        gl.activeTexture(gl.TEXTURE1);
                    }else if(this._uniforms[uniform].value === 2){
                        gl.activeTexture(gl.TEXTURE2);
                    }else if(this._uniforms[uniform].value === 3){
                        gl.activeTexture(gl.TEXTURE3);
                    }else if(this._uniforms[uniform].value === 4){
                        gl.activeTexture(gl.TEXTURE4);
                    }else if(this._uniforms[uniform].value === 5){
                        gl.activeTexture(gl.TEXTURE5);
                    }
                    
                    gl.bindTexture(gl.TEXTURE_2D, this._uniforms[uniform].texture);
                    gl.uniform1i(uniformLocation, this._uniforms[uniform].value);
                    break;
            }
        }
        
        //this._changedUniforms = [];
    }
    
    return Handler;
});