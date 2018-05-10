//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

vec2 getProjectedVector(vec2 a, vec2 bNorm){
    return (dot(a, bNorm) / dot(bNorm, bNorm)) * bNorm;
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    vec2 center = center.xy / iResolution.xy;
    float radius = radius / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    center.x *= aspectRatio;

    vec4 finalColor;
    
    float distToCircEdge = distance(uv, center + (normalize(uv - center) * radius));
   	finalColor = (1.0 / distToCircEdge) * vec4(1.0, 0.0, 0.0, 1.0) * 0.003;
    
    uv = rotateCoord(uv, iGlobalTime / 12.0, center);
    
    vec2 dirVec = vec2(1.0, 0.0);
    vec2 projVec = getProjectedVector(uv - center, dirVec);
    vec2 pointOnMiddleThing = clamp(center + projVec, vec2(center.x - radius, center.y), vec2(center.x + radius, center.y));
    float distToMiddleThing = distance(uv, pointOnMiddleThing);
    finalColor += (1.0 / distToMiddleThing) * vec4(1.0, 0.0, 0.0, 1.0) * 0.005;
    
	gl_FragColor = finalColor;
}