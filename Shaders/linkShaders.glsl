//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795 

vec2 getProjectedVector(vec2 a, vec2 bNorm){
    return (dot(a, bNorm) / dot(bNorm, bNorm)) * bNorm;
}

vec2 getPointOnSegment(vec2 startCoord, vec2 endCoord, vec2 projVec){
//    if(normalize(projVec) == normalize(endCoord - startCoord)){
//        //same direction
//        
//        if(length(projVec) > length(endCoord - startCoord)){
//            return endCoord;  
//        }else{
//            return startCoord + projVec;
//        }
//    }else{
//        return startCoord;
//    }
    
    return clamp(startCoord + projVec, min(startCoord, endCoord), max(startCoord, endCoord));
}

uniform vec2 iResolution;
uniform vec2 startCoord;
uniform vec2 endCoord;
uniform float glowFactor;
uniform vec3 color1;
uniform vec3 color2;
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
    
    vec2 startToUV = uv - startCoord;
    vec2 projVec = getProjectedVector(startToUV, normalize(endCoord - startCoord));
    vec2 pointOnSegment = getPointOnSegment(startCoord, endCoord, projVec);
    
    float dist = distance(startCoord + startToUV, pointOnSegment);
    float m = (1.0 / dist) * 0.002;
    
    vec4 color;
    if(length(pointOnSegment - startCoord) < (completion * length(endCoord - startCoord))){
        color = vec4(color2 * m, m);        
    }else{
        color = vec4(color1 * m, m);
    }

	gl_FragColor = color;
}