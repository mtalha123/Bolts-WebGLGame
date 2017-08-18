//VERTEX SHADER

//float map(float in_min, float in_max, float out_min, float out_max, float number) {
//    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
//}

attribute vec2 vertexPosition;
//uniform mediump vec2 iResolution;

void main(){
//    vec2 vPos = vertexPosition / iResolution;
//    vPos.x = map(0.0, 1.0, -1.0, 1.0, vPos.x);
//    vPos.y = map(0.0, 1.0, -1.0, 1.0, vPos.y);
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

float getDistToCurve(vec2 uv, vec2 center, float radius, float uvAngleDeg, float angleOfRect, float angleAmount){
    float angleOfRectDeg = degrees(angleOfRect);
	float angleClamped = clamp(uvAngleDeg, angleOfRectDeg - (angleAmount / 2.0), angleOfRectDeg + (angleAmount / 2.0));
    vec2 pointOnCurve = rotateCoord(vec2(center.x + radius, center.y), radians(angleClamped), center);
    return distance(uv, pointOnCurve);
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;
uniform float angle;
uniform vec3 guardPref;
uniform float lgGlowFactor;
uniform sampler2D noise;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y; 
    vec4 color = vec4(0.0); 
    
    //normalize
    vec2 center = center.xy / iResolution.xy;
    float radius = radius / iResolution.y;
    float lgGlowFactor = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    center.x *= aspectRatio;
    
    uv = rotateCoord(uv, -angle, center);
    
    float angleMultipleDeg = 360.0 / 3.0;
    float UVAngleDeg = getUVAngleDeg(uv, center);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
	
    float distToCurve = getDistToCurve(uv, center, radius, UVAngleDeg, closestAngleMultiple, 30.0);
    float smthVal = 1.0 - smoothstep(0.01 - 0.005, 0.01, distToCurve); 
    float invertedDist = 1.0 / (distToCurve - ((1.0 - smthVal) * (0.01 - 0.005)));
    float m = pow(invertedDist * 0.007, 1.3);
    vec3 guardColor = vec3(0.0, 0.3, 1.0);
    if( (degrees(closestAngleMultiple) == 0.0 || degrees(closestAngleMultiple) == 360.0) && (guardPref.x == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    if( degrees(closestAngleMultiple) == 120.0 && (guardPref.y == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    if( degrees(closestAngleMultiple) == 240.0 && (guardPref.z == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    color.rgb = smthVal * vec3(1.0) + ((1.0 - smthVal) * guardColor * m);
    color.a = m;
    
    //handle lightning
    if(distance(uv, center) <= radius){
//        float distToLg = genLightningAndGetDist(uv, center, rotatedCoord, 0.0002, 0.008, 2.0, noise, iGlobalTime, iResolution);
//        float m2 = (1.0 / distToLg) * 0.003;
//        m2 = pow(m2, 1.3);
//        color += vec4( m2 * vec3(1.0, 1.0, 0.0), m2);
        
         color += pow( genLightningAndGetColor(uv, center, rotatedCoord, 0.0005, 0.009, 2.0, noise, iGlobalTime, iResolution, vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 0.7), lgGlowFactor), vec4(1.3) );
    }
    
	gl_FragColor = color;
}