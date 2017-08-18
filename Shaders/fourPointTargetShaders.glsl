//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

float getClosestMultipleOfRadius(vec2 uv, vec2 center, vec2 iResolution, float minRadius, float maxRadius, float aspectRatio){
    iResolution.x /= aspectRatio;
	vec2 screenCoord = uv * iResolution;
    float distFromCenter = distance(uv * iResolution, center * iResolution); 
    float multiple = ((maxRadius - minRadius) * iResolution.y) / 3.0;
    if(distFromCenter >= minRadius * iResolution.y && distFromCenter <= (maxRadius * iResolution.y) - (multiple / 2.0)){
        return getClosestMultiple( int(distFromCenter), int(multiple) ) / iResolution.y;
    }else{
    	return minRadius;
    }   
}

float getDistToCurve(vec2 uv, vec2 center, float radius, float uvAngleDeg, float angleOfRect, float angleAmount){
    float angleOfRectDeg = degrees(angleOfRect);
	float angleClamped = clamp(uvAngleDeg, angleOfRectDeg - (angleAmount / 2.0), angleOfRectDeg + (angleAmount / 2.0));
    vec2 pointOnCurve = rotateCoord(vec2(center.x + radius, center.y), radians(angleClamped), center);
    return distance(uv, pointOnCurve);
}

float getDistToCirclePiece(vec2 uv, vec2 center, float minRadius, float maxRadius, float angleAmount, float iGlobalTime, vec2 iResolution, float aspectRatio){
    float radius = getClosestMultipleOfRadius(uv, center, iResolution, minRadius, maxRadius, aspectRatio);
    uv = rotateCoord(uv, -0.02 * iGlobalTime, center);
    float angleMultipleDeg = 360.0 / 9.0;
    float UVAngleDeg = getUVAngleDeg(uv, center);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
    
    return getDistToCurve(uv, center, radius, UVAngleDeg, closestAngleMultiple, 20.0);
}

vec3 getCurrentGuardColor(float closestAngleMultiple, vec4 guardPref){
    vec3 guardColor = vec3(0.0, 0.3, 1.0);
    if( (degrees(closestAngleMultiple) == 0.0 || degrees(closestAngleMultiple) == 360.0) && (guardPref.r == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    if( degrees(closestAngleMultiple) == 90.0 && (guardPref.g == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    if( degrees(closestAngleMultiple) == 180.0 && (guardPref.b == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    if( degrees(closestAngleMultiple) == 270.0 && (guardPref.a == 1.0) ){
        guardColor = vec3(1.0, 1.0, 0.0);
    }
    
    return guardColor;
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;
uniform vec4 guardPref;
uniform float lgGlowFactor;
uniform float angle;
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
    
    float angleMultipleDeg = 360.0 / 4.0;
    float UVAngleDeg = getUVAngleDeg(uv, center);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );    
	vec2 centerOfGuardPoint = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center); 
    
    //handle guard points
    float distToCirclePiece = getDistToCirclePiece(uv, centerOfGuardPoint, 0.008, 0.04, 20.0, iGlobalTime, iResolution, aspectRatio);	
    float m = (1.0 / distToCirclePiece) * 0.0007;
    vec3 guardColor = getCurrentGuardColor(closestAngleMultiple, guardPref);
    color = vec4( guardColor * m, m );
    
    //handle lightning
    color += genLightningAndGetColor(uv, center, centerOfGuardPoint, 0.0008, 0.009, 2.0, noise, iGlobalTime, iResolution, vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 0.7), lgGlowFactor);
    
	gl_FragColor = color;
}