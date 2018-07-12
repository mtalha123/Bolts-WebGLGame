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

float getDistToCurve(vec2 uv, vec2 center, float radius, float uvAngleDeg, float angleOfRect, float angleAmount){
    float angleOfRectDeg = degrees(angleOfRect);
	float angleClamped = clamp(uvAngleDeg, angleOfRectDeg - (angleAmount / 2.0), angleOfRectDeg + (angleAmount / 2.0));
    vec2 pointOnCurve = rotateCoord(vec2(center.x + radius, center.y), radians(angleClamped), center);
    return distance(uv, pointOnCurve);
}

uniform vec2 iResolution;
uniform float aspectRatio;
uniform float iGlobalTime;
uniform float angle;
uniform vec3 guardPref;
uniform float lgBool;
uniform float autoRotationBool;
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
    
    float angle = angle;
    if(autoRotationBool == 1.0){
        angle = iGlobalTime * -0.05;
    }
    uv = rotateCoord(uv, -angle, centerUV);
    
    float angleMultipleDeg = 360.0 / 3.0;
    float UVAngleDeg = getUVAngleDeg(uv, centerUV);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(centerUV.x + radiusUV, centerUV.y), closestAngleMultiple, centerUV);
	
    float distToCurve = getDistToCurve(uv, centerUV, radiusUV, UVAngleDeg, closestAngleMultiple, 30.0);
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
    if(distance(uv, centerUV) <= radiusUV && lgBool == 1.0){
//        float distToLg = genLightningAndGetDist(uv, centerUV, rotatedCoord, 0.0002, 0.008, 2.0, noise, iGlobalTime, iResolution);
//        float m2 = (1.0 / distToLg) * 0.003;
//        m2 = pow(m2, 1.3);
//        color += vec4( m2 * vec3(1.0, 1.0, 0.0), m2);
        
         color += pow( genLightningAndGetColor(uv, centerUV, rotatedCoord, 0.0005, 0.009, 2.0, noise, iGlobalTime, iResolution, vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 0.7), lgGlowFactorUV), vec4(1.3) );
    }

    if(capturedBool == 1.0){
        color.r = 1.0;
        color.a = pow(color.a, 1.6);
    }
    
	gl_FragColor = color;
}