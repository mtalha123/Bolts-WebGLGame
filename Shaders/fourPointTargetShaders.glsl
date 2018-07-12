//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float lgGlowFactor;

varying vec2 centerUV;
varying float radiusUV;
varying float lgGlowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    lgGlowFactorUV = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
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
uniform float aspectRatio;
uniform float iGlobalTime;
uniform vec4 guardPref;
uniform float angle;
uniform float capturedBool;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;
varying float lgGlowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    vec4 color = vec4(0.0);    
    
    uv = rotateCoord(uv, -angle, centerUV);
    
    float angleMultipleDeg = 360.0 / 4.0;
    float UVAngleDeg = getUVAngleDeg(uv, centerUV);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );    
	vec2 centerOfGuardPoint = rotateCoord(vec2(centerUV.x + radiusUV, centerUV.y), closestAngleMultiple, centerUV); 
    
    //handle guard points
    float distToCirclePiece = getDistToCirclePiece(uv, centerOfGuardPoint, 0.008, 0.04, 20.0, iGlobalTime, iResolution, aspectRatio);	
    float m = (1.0 / distToCirclePiece) * 0.0007;
    vec3 guardColor = getCurrentGuardColor(closestAngleMultiple, guardPref);
    color = vec4( guardColor * m, m );
    
    //handle lightning
    color += genLightningAndGetColor(uv, centerUV, centerOfGuardPoint, 0.0008, 0.009, 2.0, noise, iGlobalTime, iResolution, vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 0.7), lgGlowFactorUV);
    
    if(capturedBool == 1.0){
        color.r = 1.0;
        color.a = pow(color.a, 1.6);
    }
    
	gl_FragColor = color;
}