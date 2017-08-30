//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795 

uniform vec2 iResolution;
uniform vec2 startCoord;
uniform vec2 endCoord;
uniform float glowFactor;
uniform vec3 lifeBarColor;
uniform vec3 lifeBarBackgroundColor;
uniform float completion;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    vec2 startCoord = startCoord.xy / iResolution.xy;
    vec2 endCoord = endCoord.xy / iResolution.xy;
    float glowFactor = glowFactor / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    startCoord.x *= aspectRatio;
    endCoord.x *= aspectRatio;
    
    vec2 pointOnLifeBar = vec2(clamp(uv.x, startCoord.x, endCoord.x), startCoord.y);
    float dist = distance(uv, pointOnLifeBar);
    float m = (1.0 / dist) * glowFactor;
    
    vec4 color;
    if(length(pointOnLifeBar - startCoord) <= (completion * length(endCoord - startCoord))){
        color = vec4(lifeBarColor * m, m);        
    }else{
        color = vec4(lifeBarBackgroundColor * m, m);
    }

	gl_FragColor = color;
}