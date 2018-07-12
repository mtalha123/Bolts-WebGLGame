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
uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float angleCompletion;

varying vec2 centerUV;
varying float radiusUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    
    float angleOfCompletion = angleCompletion * (2.0 * PI);   
    float uvAngle = getUVAngle(uv, centerUV);
    vec2 pointOnRing = centerUV + (normalize(uv - centerUV) * radiusUV);
    vec4 color;
    if(uvAngle >= angleOfCompletion){
        color = vec4(primaryColor, 1.0) * (1.0 / distance(pointOnRing, uv)) * 0.005;
    }else{
        color = vec4(secondaryColor, 1.0) * (1.0 / distance(pointOnRing, uv)) * 0.005;
    }
    
    gl_FragColor = color;
}