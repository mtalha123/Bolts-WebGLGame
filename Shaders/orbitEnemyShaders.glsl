//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;

varying vec2 centerUV;
varying float radiusUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform float iGlobalTime;

varying vec2 centerUV;
varying float radiusUV;

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;

    vec4 finalColor;
    
    float distToCircEdge = distance(uv, centerUV + (normalize(uv - centerUV) * radiusUV));
   	finalColor = (1.0 / distToCircEdge) * vec4(1.0, 0.0, 0.0, 1.0) * 0.003;
    
    uv = rotateCoord(uv, iGlobalTime / 12.0, centerUV);
    
    vec2 dirVec = vec2(1.0, 0.0);
    vec2 projVec = getProjectedVector(uv - centerUV, dirVec);
    vec2 pointOnMiddleThing = clamp(centerUV + projVec, vec2(centerUV.x - radiusUV, centerUV.y), vec2(centerUV.x + radiusUV, centerUV.y));
    float distToMiddleThing = distance(uv, pointOnMiddleThing);
    finalColor += (1.0 / distToMiddleThing) * vec4(1.0, 0.0, 0.0, 1.0) * 0.005;
    
	gl_FragColor = finalColor;
}