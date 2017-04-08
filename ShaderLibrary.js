define(['Custom Utility/getTextResource'], function(getTextResource){
    var LIGHTNING = 0;
    var BACKGROUND_FIELD = 1;
    var TARGET = 2;
    var SCORE_TEXT = 3; 
    var CURSOR = 4;
    
    var vertexShaderSources = [], fragmentShadersInfo = [];
    var allPrograms = [];
        
    getTextResource("http://192.168.0.17:4000/Shaders/vertexShader.glsl", vertexShaderLoaded, 0);
    getTextResource("http://192.168.0.17:4000/Shaders/textVertexShader.glsl", vertexShaderLoaded, 1);
    getTextResource("http://192.168.0.17:4000/Shaders/lightningFragmentShader.glsl", fragmentShaderLoaded, {vertexShaderId: 0, effect: LIGHTNING});
    getTextResource("http://192.168.0.17:4000/Shaders/targetFragmentShader.glsl", fragmentShaderLoaded, {vertexShaderId: 0, effect: TARGET});
    getTextResource("http://192.168.0.17:4000/Shaders/textFragmentShader.glsl", fragmentShaderLoaded, {vertexShaderId: 1, effect: SCORE_TEXT});
    getTextResource("http://192.168.0.17:4000/Shaders/cursorFragmentShader.glsl", fragmentShaderLoaded, {vertexShaderId: 0, effect: CURSOR});
    
    
    function vertexShaderLoaded(error, text, index){
        vertexShaderSources[index] = text;
        //console.log("VERTEX SHADER SOURCE: " + vertexShaderSource);
    }
    
    function fragmentShaderLoaded(error, text, info){
        var obj = {
            vertexShaderId: info.vertexShaderId,
            effect: info.effect,
            text: text
        };
        fragmentShadersInfo.push(obj);
        //console.log("FRAGMENT SHADER SOURCE: " + fragmentShaderSource);
    }
    
    function initialize(gl){
        for(var i = 0; i < fragmentShadersInfo.length; i++){
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            
            var vertexShaderSource = vertexShaderSources[fragmentShadersInfo[i].vertexShaderId];
            var fragmentShaderSource = fragmentShadersInfo[i].text;

            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.shaderSource(fragmentShader, fragmentShaderSource);

            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert("Could not compile vertex shader: " + gl.getShaderInfoLog(vertexShader));
            }

            gl.compileShader(fragmentShader);

            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                alert("Could not compile fragment shader: " + gl.getShaderInfoLog(fragmentShader));
            }


            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not link shaders: " + gl.getProgramInfoLog(shaderProgram));
            }

            allPrograms[fragmentShadersInfo[i].effect] = shaderProgram;
        }
    }
    
    function requestProgram(request){
        switch(request){
            case LIGHTNING:
                return allPrograms[LIGHTNING];
                break;
            case BACKGROUND_FIELD:
                return allPrograms[BACKGROUND_FIELD];
                break;
            case TARGET:
                return allPrograms[TARGET];
                break;
            case SCORE_TEXT:
                return allPrograms[SCORE_TEXT];
            case CURSOR:
                return allPrograms[CURSOR];
        }
    }
    
    return {
        initialize: initialize,
        requestProgram: requestProgram,
        LIGHTNING: LIGHTNING,
        BACKGROUND_FIELD: BACKGROUND_FIELD,
        TARGET: TARGET,
        SCORE_TEXT: SCORE_TEXT,
        CURSOR: CURSOR
    };
});