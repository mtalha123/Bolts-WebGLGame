define(['Custom Utility/getTextResource', 'AssetManager'], function(getTextResource, AssetManager){
    var LIGHTNING = "LIGHTNING";
    var BACKGROUND_FIELD = "BACKGROUND_FIELD";
    var TARGET = "TARGET";
    var TEXT = "TEXT"; 
    var CURSOR = "CURSOR";
    var COMBO = "COMBO";
    var LIGHTNING_ORB = "LIGHTNING_ORB";
    var ORB_LIGHTNING_STREAK = "ORB_LIGHTNING_STREAK";
    var BUBBLY_ORB = "BUBBLY_ORB";
    var TRIANGULAR_TARGET = "TRIANGULAR_TARGET";
    var FOUR_POINT_TARGET = "FOUR_POINT_TARGET";
    var ENEMY_SPIKE = "ENEMY_SPIKE";
    var PARTICLE = "PARTICLE";
    var LINK = "LINK";
    var FULL_SCREEN_COLOR = "FULL_SCREEN_COLOR";
    var LIFEBAR = "LIFEBAR";
    
    var allPrograms = {};    
    
    function initialize(gl){
        var allShaderSources = AssetManager.getShaderAsset(null, true);
        var commonFunctionsSource = allShaderSources["commonFunctions"];
        delete allShaderSources["commonFunctions"];        
        
        for(var shaderSource in allShaderSources){      
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            
            var currShaderSource = allShaderSources[shaderSource];
            var indexBeginFragShader = currShaderSource.indexOf("precision mediump float;");
            
            var vertexShaderSource = currShaderSource.substring(0, indexBeginFragShader);
            var fragmentShaderSource = currShaderSource.substring(indexBeginFragShader);
            fragmentShaderSource = [fragmentShaderSource.slice(0, "precision mediump float;".length), commonFunctionsSource, fragmentShaderSource.slice("precision mediump float;".length)].join("\n");
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
        COMBO: COMBO,
        LIGHTNING_ORB: LIGHTNING_ORB,
        ORB_LIGHTNING_STREAK: ORB_LIGHTNING_STREAK,
        BUBBLY_ORB: BUBBLY_ORB,
        TRIANGULAR_TARGET: TRIANGULAR_TARGET,
        FOUR_POINT_TARGET: FOUR_POINT_TARGET,
        ENEMY_SPIKE: ENEMY_SPIKE,
        PARTICLE: PARTICLE,
        LINK: LINK,
        FULL_SCREEN_COLOR: FULL_SCREEN_COLOR,
        LIFEBAR: LIFEBAR
    };
});