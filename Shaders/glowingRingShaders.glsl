//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

uniform vec2 iResolution;
uniform vec2 center;
uniform float radius;
uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float angleCompletion;

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
    
    
    float angleOfCompletion = angleCompletion * (2.0 * PI);
    uv = rotateCoord(uv, abs((PI / 2.0) - angleOfCompletion), center);    
    float uvAngle = getUVAngle(uv, center);
    vec2 pointOnRing = center + (normalize(uv - center) * radius);
    vec4 color;
    if(uvAngle >= angleOfCompletion){
        color = vec4(primaryColor, 1.0) * (1.0 / distance(pointOnRing, uv)) * 0.005;
    }else{
        color = vec4(secondaryColor, 1.0) * (1.0 / distance(pointOnRing, uv)) * 0.005;
    }
    
    gl_FragColor = color;
}