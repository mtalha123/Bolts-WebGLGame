define(['Custom Utility/getTextResource', 'AssetManager'], function(getTextResource, AssetManager){
    var LIGHTNING = "LIGHTNING";
    var BACKGROUND_FIELD = "BACKGROUND_FIELD";
    var TARGET = "TARGET";
    var TEXT = "TEXT"; 
    var CURSOR = "CURSOR";
    var COMBO = "COMBO";
    
    var vertexShaderSources = [], fragmentShadersInfo = [];
    var allPrograms = {};    
    
    function vertexShaderLoaded(error, text, index){
        vertexShaderSources[index] = text;
    }
    
    function fragmentShaderLoaded(error, text, info){
        var obj = {
            vertexShaderId: info.vertexShaderId,
            effect: info.effect,
            text: text
        };
        fragmentShadersInfo.push(obj);
    }
    
    function initialize(gl){
        var allShaderSources = AssetManager.getShaderAsset(null, true);
        var commonFunctionsSource = allShaderSources["commonFunctions"];
        delete allShaderSources["commonFunctions"];
        
       // var commonFunctionsCompiled = gl.createShader(gl.FRAGMENT_SHADER);
       // gl.shaderSource(commonFunctionsCompiled, commonFunctionsSource);
       // gl.compileShader(commonFunctionsCompiled);
//        if (!gl.getShaderParameter(commonFunctionsCompiled, gl.COMPILE_STATUS)) {
//            alert("Could not compile fragment shader: " + gl.getShaderInfoLog(commonFunctionsCompiled));
//        }
        
        
        for(var shaderSource in allShaderSources){      
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            
            var currShaderSource = allShaderSources[shaderSource];
            var indexBeginFragShader = currShaderSource.indexOf("precision mediump float;");
            
            var vertexShaderSource = currShaderSource.substring(0, indexBeginFragShader);
            var fragmentShaderSource = currShaderSource.substring(indexBeginFragShader);
            fragmentShaderSource = [fragmentShaderSource.slice(0, "precision mediump float;".length), commonFunctionsSource, fragmentShaderSource.slice("precision mediump float;".length)].join("\n")
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.shaderSource(fragmentShader, fragmentShaderSource);

            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert(shaderSource + " shaders: " + "Could not compile vertex shader: " + gl.getShaderInfoLog(vertexShader));
            }

            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                var shaderErrLog = gl.getShaderInfoLog(fragmentShader);
                var errorLineNumIndexStart = shaderErrLog.indexOf("ERROR: 0:") + "ERROR: 0:".length;
                var errorLineNumIndexEnd = shaderErrLog.indexOf(":", errorLineNumIndexStart);
                var errorLineNumber = parseInt(shaderErrLog.slice(errorLineNumIndexStart, errorLineNumIndexEnd));
                alert(shaderSource.toUpperCase() + " shaders: " + "Could not compile fragment shader: " + shaderErrLog + "\n on line " + errorLineNumber + ": " + fragmentShaderSource.split("\n")[errorLineNumber-1]);
            }


            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not link shaders: " + gl.getProgramInfoLog(shaderProgram));
            }

            allPrograms[shaderSource.toUpperCase()] = shaderProgram;
        }
    }
    
    function requestProgram(request){
        return allPrograms[request];
    }
    
    return {
        initialize: initialize,
        requestProgram: requestProgram,
        LIGHTNING: LIGHTNING,
        BACKGROUND_FIELD: BACKGROUND_FIELD,
        TARGET: TARGET,
        TEXT: TEXT,
        CURSOR: CURSOR,
        COMBO: COMBO
    };
});