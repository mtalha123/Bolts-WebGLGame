define(['Custom Utility/getTextInfo', 'Custom Utility/map', 'Handlers/LightningHandler', 'Handlers/TargetHandler', 'Handlers/TextHandler', 'Handlers/CursorHandler', 'Handlers/ComboHandler'], function(getTextInfo, map, LightningHandler, TargetHandler, TextHandler, CursorHandler, ComboHandler){
    var allHandlers = [];
    
    var ShaderLibrary;
    var fontTexture;
    var spiderWebTexture;
    var noiseTexture;
    var appMetaData;
    
    
    function initialize(p_ShaderLibrary, p_appMetaData, AssetManager){
        ShaderLibrary = p_ShaderLibrary;
        appMetaData = p_appMetaData;
        
        fontTexture = AssetManager.getTextureAsset("arial");
        spiderWebTexture = AssetManager.getTextureAsset("spiderWeb");
        noiseTexture = AssetManager.getTextureAsset("noise");
    }    
    
    function addHandler(handler){
        if(allHandlers.length === 0){
            allHandlers.push(handler);
            return;
        }
        for(var i = 0; i < allHandlers.length; i++){
            if(handler.getZOrder() <= allHandlers[i].getZOrder()){
                allHandlers.splice(i, 0, handler);
                return;
            }   
        }
        
        allHandlers.push(handler);
    }
    
    function requestLightningEffect(shouldDraw, gl, zOrder, opts, coords){
        var handler = new LightningHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, coords, ShaderLibrary, {noiseTexture: noiseTexture, width: 1024, height: 1024, sampler: 0}, 1);
        
        addHandler(handler);
        return handler;
    }

    function requestTargetEffect(shouldDraw, gl, zOrder, x, y, opts){
        var handler = new TargetHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {noiseTexture: noiseTexture, width: 1024, height: 1024, sampler: 0});
        
        addHandler(handler);
        return handler;
    }

    function requestTextEffect(shouldDraw, gl, zOrder, opts, x, y, text){
        var handler = new TextHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, x, y, text);
        
        addHandler(handler);
        return handler;
    }

    function requestCursorEffect(shouldDraw, zOrder, opts, gl, x, y){
        var handler = new CursorHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, opts, ShaderLibrary, x, y);
        
        addHandler(handler);
        return handler;
    }
    
    function requestComboEffect(shouldDraw, gl, zOrder, x, y, opts, text){
        var handler = new ComboHandler(shouldDraw, appMetaData.getCanvasWidth(), appMetaData.getCanvasHeight(), gl, zOrder, x, y, opts, ShaderLibrary, {fontTexture: fontTexture, width: 512, height: 512, sampler: 0}, {effectTexture: spiderWebTexture, width: 1024, height: 1024, sampler: 1}, text);
        
        addHandler(handler);
        return handler;
    }
    
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
        var uniforms = handler.getUniforms();
        
        for(var uniformVar in uniforms){
            var uniformLocation = gl.getUniformLocation(handler.getShaderProgram(), uniformVar);
            switch(uniforms[uniformVar].type){
                case "int":
                    gl.uniform1iv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "float":
                    gl.uniform1fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec2":
                    gl.uniform2fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec3":
                    gl.uniform3fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "vec4":
                    gl.uniform4fv(uniformLocation, uniforms[uniformVar].value);
                    break;
                case "sampler2D":
                    if(uniforms[uniformVar].value === 0){
                        gl.activeTexture(gl.TEXTURE0);
                    }else if(uniforms[uniformVar].value === 1){
                        gl.activeTexture(gl.TEXTURE1);
                    }else if(uniforms[uniformVar].value === 2){
                        gl.activeTexture(gl.TEXTURE2);
                    }else if(uniforms[uniformVar].value === 3){
                        gl.activeTexture(gl.TEXTURE3);
                    }else if(uniforms[uniformVar].value === 4){
                        gl.activeTexture(gl.TEXTURE4);
                    }else if(uniforms[uniformVar].value === 5){
                        gl.activeTexture(gl.TEXTURE5);
                    }
                    
                    gl.bindTexture(gl.TEXTURE_2D, uniforms[uniformVar].texture);
                    gl.uniform1i(uniformLocation, uniforms[uniformVar].value);
                    break;
            }
        }
    }
    
    function setUpAttributesAndUniforms(gl, handler){
        var attributes = handler.getAttributes();
        
        for(var attribute in attributes){
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes[attribute]), gl.STATIC_DRAW);
            
            var attribLocation = gl.getAttribLocation(handler.getShaderProgram(), attribute);
            gl.enableVertexAttribArray(attribLocation);
            gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
        }
        
        setUpUniforms(gl, handler);
    }
    
    return {
        initialize: initialize,
        getHandlers: getHandlers,
        setUpAttributesAndUniforms: setUpAttributesAndUniforms,
        requestLightningEffect: requestLightningEffect,
        requestTargetEffect: requestTargetEffect,
        requestTextEffect: requestTextEffect,
        requestCursorEffect: requestCursorEffect,
        requestComboEffect: requestComboEffect
    };
    
});