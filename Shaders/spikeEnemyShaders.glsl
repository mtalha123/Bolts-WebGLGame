//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795
#define RIGHT_ANGLE PI / 2.0

//returns angle between 0 and 2.0 * PI
float getUVAngle(vec2 uv, vec2 center){
    return radians(getUVAngleDeg(uv, center));
}

float getQuadrantNum(vec2 uv, vec2 center, float radius){
	float uvAngle = getUVAngle(uv, center);
    if(uvAngle <= RIGHT_ANGLE){
    	return 1.0;
    }
    
    if(uvAngle > RIGHT_ANGLE && uvAngle <= PI){
    	return 2.0;
    }
    
    if(uvAngle > PI && uvAngle <= (3.0 * PI / 2.0)){
    	return 3.0;
    }
    
    if(uvAngle > (3.0 * PI / 2.0)){
    	return 4.0;
    }
}

vec4 getSpikeColor(vec2 uv, vec2 start, float angle, float radius){
    uv.y += radius * 4.0;
    float uvAngle = getUVAngle(uv, start);    
    vec2 pointOnSpike = vec2(radius * 4.0 * cos(uvAngle), radius * 4.0 * sin(uvAngle));
    pointOnSpike += vec2(start.x, start.y);
    float dist = distance(uv, pointOnSpike);
    
    float lineWidth = 0.05; 
    vec4 color = vec4(0.0);
    if( (uvAngle <= RIGHT_ANGLE) && (dist <= lineWidth) ){
        float m = (1.0 / dist) * 0.005;
    	return vec4( m * vec3(1.0, 0.0, 0.0), m );
    }
    
    return color;
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;


void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
   	vec4 color = vec4(1.0);
    
    //normalize
    vec2 center = center.xy / iResolution.xy;
    float radius = radius / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    center.x *= aspectRatio;
    
    uv = rotateCoord(uv, -0.01 * iGlobalTime, center);
    float quadrantNum = getQuadrantNum(uv, center, radius);
    float angleToReverseRotate = (quadrantNum - 1.0) * RIGHT_ANGLE;
    vec2 uv_t = rotateCoord(uv, -angleToReverseRotate, center);
    
    vec2 closestPtToCircle = normalize(uv_t - center) * radius;
    uv_t -= closestPtToCircle;
    color = getSpikeColor(uv_t, center, PI/2.0, radius);
    
    gl_FragColor = color;
}