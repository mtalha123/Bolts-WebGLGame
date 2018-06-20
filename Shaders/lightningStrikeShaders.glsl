//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

const int NUM_COORDS = 5;

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform float completion;
uniform float jaggedFactor;
uniform vec2 lightningStart;
uniform vec2 lightningEnd;
uniform vec3 boltColor;
uniform sampler2D noise;

void main(){
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    float aspectRatio = iResolution.x / iResolution.y;
    vec4 finalColor = vec4(0.0);
    
    //normalize
    float lineWidth = lineWidth / iResolution.y; 
    float fluctuation = fluctuation / iResolution.y;
    float glowFactor = glowFactor / iResolution.y;
    vec2 lightningStart = lightningStart.xy / iResolution.xy;
    vec2 lightningEnd = lightningEnd.xy / iResolution.xy;
    
    //take into account aspect ratio    
    uv.x *= aspectRatio;
    lightningStart.x *= aspectRatio;
    lightningEnd.x *= aspectRatio;
    
    vec3 glowColor = boltColor + vec3(0.7);
    finalColor = genLightningAndGetColor(uv, lightningStart, lightningEnd, lineWidth, fluctuation, jaggedFactor, noise, iGlobalTime, iResolution, boltColor, glowColor, glowFactor);
    
    vec2 projVec = getProjectedVector(uv - lightningStart, lightningEnd - lightningStart);
    if(length(projVec) > (completion * length(lightningEnd - lightningStart)) && completion < 1.0){
        finalColor.a = 0.0;
    }
    
	gl_FragColor = finalColor;
}