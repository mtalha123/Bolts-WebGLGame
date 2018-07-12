//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 lightningStart;
uniform vec2 lightningEnd;
uniform float fluctuation;
uniform float lineWidth;
uniform float glowFactor;

varying vec2 lightningStartUV;
varying vec2 lightningEndUV;
varying float fluctuationUV;
varying float lineWidthUV;
varying float glowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    lightningStartUV = lightningStart.xy / iResolution.xy;
    lightningEndUV = lightningEnd.xy / iResolution.xy;
    fluctuationUV = fluctuation / iResolution.y;
    lineWidthUV = lineWidth / iResolution.y;
    glowFactorUV = glowFactor / iResolution.y;
    
    //take aspect ratio into account
    lightningStartUV.x *= aspectRatio;
    lightningEndUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

const int NUM_COORDS = 5;

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform float aspectRatio;
uniform float completion;
uniform float jaggedFactor;
uniform vec3 boltColor;
uniform sampler2D noise;

varying vec2 lightningStartUV;
varying vec2 lightningEndUV;
varying float fluctuationUV;
varying float lineWidthUV;
varying float glowFactorUV;

void main(){
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    uv.x *= aspectRatio;
    vec4 finalColor = vec4(0.0);   
    
    vec3 glowColor = boltColor + vec3(0.7);
    finalColor = genLightningAndGetColor(uv, lightningStartUV, lightningEndUV, lineWidthUV, fluctuationUV, jaggedFactor, noise, iGlobalTime, iResolution, boltColor, glowColor, glowFactorUV);
    
    vec2 projVec = getProjectedVector(uv - lightningStartUV, lightningEndUV - lightningStartUV);
    if(length(projVec) > (completion * length(lightningEndUV - lightningStartUV)) && completion < 1.0){
        finalColor.a = 0.0;
    }
    
	gl_FragColor = finalColor;
}