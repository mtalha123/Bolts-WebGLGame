//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float circleGlowFactor;
uniform float particleGlowFactor;
uniform float lgGlowFactor;

varying vec2 centerUV;
varying float radiusUV;
varying float circleGlowFactorUV;
varying float particleGlowFactorUV;
varying float lgGlowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    circleGlowFactorUV = circleGlowFactor / iResolution.y;
    particleGlowFactorUV = particleGlowFactor / iResolution.y;
    lgGlowFactorUV = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

float getHorDistToCircle(float radius, float vertDist){
	return sqrt(pow(radius, 2.0) - pow(abs(vertDist - radius), 2.0));
}

vec4 getStartAndEndPtsOnCirc(float radius, float completion, vec2 center){
	vec2 pointAlongCenter = vec2(center.x, (center.y + radius) - (completion * radius * 2.0));
    float vertDist = length( pointAlongCenter - vec2(center.x, pointAlongCenter.y + (completion * radius * 2.0)) );
    float hDist = getHorDistToCircle(radius, vertDist);
    return vec4(vec2(center.x - hDist, pointAlongCenter.y), vec2(center.x + hDist, pointAlongCenter.y));
}

float getDistToParticle(vec2 uv, vec2 center, float radius, float iGlobalTime){
    uv = rotateCoord(uv, -0.05 * iGlobalTime, center);
    float angleMultipleDeg = 360.0 / 5.0;
    float UVAngleDeg = getUVAngleDeg(uv, center);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
	vec2 rotatedCoord = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
    
    return distance(uv, rotatedCoord);
}
uniform vec2 iResolution;
uniform float aspectRatio;
uniform float iGlobalTime;
uniform float lightningTurnedOn;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;
varying float circleGlowFactorUV;
varying float particleGlowFactorUV;
varying float lgGlowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;    
    uv.x *= aspectRatio;
    vec4 color = vec4(0.0);

    if(lightningTurnedOn == 1.0){
        float completion = sinPositive(iGlobalTime / 20.0);   
        vec4 startAndEndPts = getStartAndEndPtsOnCirc(radiusUV - 0.005, completion, centerUV);
        float dist = genLightningAndGetDist(uv, startAndEndPts.rg, startAndEndPts.ba, 0.0005, 0.02, 3.0, 0.0, noise, iGlobalTime, iResolution);
        float m = pow((1.0 / dist) * lgGlowFactorUV, 1.5);
        color = vec4( vec3(1.0, 1.0, 0.0) * m, m);
    }
    
    vec2 closestPoint = centerUV + (normalize(uv - centerUV) * radiusUV);
    float dist2 = distance(uv, closestPoint);
 	float m2 = (1.0 / dist2) * circleGlowFactorUV;
  	color += vec4( m2 * vec3(0.0, 0.4, 1.0), m2 );
    
    float dist3 = getDistToParticle(uv, centerUV, radiusUV / 2.0, iGlobalTime);
    float m3 = (1.0 / dist3) * particleGlowFactorUV;
  	color += vec4( (m3 * vec3(1.0, 1.0, 0.0)) * 0.8, m3);
    
    color += vec4(0.0, 0.0, 0.1, 0.0);
    
    color.a = pow(color.a, 1.5);
    
    gl_FragColor = color;
}