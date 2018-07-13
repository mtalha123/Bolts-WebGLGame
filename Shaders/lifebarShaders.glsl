//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 startCoord;
uniform vec2 endCoord;
uniform float glowFactor;

varying vec2 startCoordUV;
varying vec2 endCoordUV;
varying float glowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // --------------FOR FRAGMENT SHADER------------------

    //normalize
    startCoordUV = startCoord.xy / iResolution.xy;
    endCoordUV = endCoord.xy / iResolution.xy;
    glowFactorUV = glowFactor / iResolution.y;
    
    //take into account aspect ratio
    startCoordUV.x *= aspectRatio;
    endCoordUV.x *= aspectRatio;

    // ----------------------------------------------------
    
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795 

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec3 lifeBarColor;
uniform vec3 lifeBarBackgroundColor;
uniform float completion;

varying vec2 startCoordUV;
varying vec2 endCoordUV;
varying float glowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    
    vec2 pointOnLifeBar = vec2(clamp(uv.x, startCoordUV.x, endCoordUV.x), startCoordUV.y);
    float dist = distance(uv, pointOnLifeBar);
    float m = (1.0 / dist) * glowFactorUV;
    
    vec4 color;
    if(length(pointOnLifeBar - startCoordUV) <= (completion * length(endCoordUV - startCoordUV))){
        color = vec4(lifeBarColor * m, m);        
    }else{
        color = vec4(lifeBarBackgroundColor * m, m);
    }
    
    color = vec4(pow(color.r, 1.3), pow(color.g, 1.3), pow(color.b, 1.3), pow(color.a, 1.3));

	gl_FragColor = color;
}