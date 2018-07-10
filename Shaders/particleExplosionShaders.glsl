//VERTEX SHADER
#define PI 3.1415926535897932384626433832795 

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

vec2 shaderCoordsToGLCoords(vec2 shaderCoord, vec2 iResolution){
    vec2 normalizedCoord = shaderCoord.xy / iResolution.xy;
    return vec2( map(0.0, 1.0, -1.0, 1.0, normalizedCoord.x), map(0.0, 1.0, -1.0, 1.0, normalizedCoord.y) );
}

vec2 explosionParticleFX(vec2 center, float radiusOfExplosion, float iGlobalTime, vec4 randVals, float maxLifetime){
    float timeInCurrLifetime = iGlobalTime;
    float randVal = randVals.x;
    float randomAngle = randVal * PI * 2.0;
    float velMagnitude = (timeInCurrLifetime / maxLifetime) * radiusOfExplosion;
    vec2 velocity = vec2(cos(randomAngle), sin(randomAngle)) * velMagnitude;
    return center + velocity;
}

attribute vec2 vertexPosition;
attribute vec4 randVals;
uniform mediump float maxLifetime;
uniform mediump float iGlobalTime;
uniform mediump vec2 center;
uniform mediump float radiusOfExplosion;
uniform mediump vec2 iResolution;
varying vec2 particleCenter;
varying float sizeFactor;

void main(){
    sizeFactor = 1.0 - map(0.0, maxLifetime, 0.0, 1.0, iGlobalTime); // for fragment shader
    particleCenter = explosionParticleFX(center, radiusOfExplosion, iGlobalTime, randVals, maxLifetime);
    
    vec2 translateVector = particleCenter - center;    
    vec2 vPos = vertexPosition + translateVector;
    vPos = shaderCoordsToGLCoords(vPos, iResolution);
    gl_Position = vec4(vPos, 0.0, 1.0);
}

//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform vec2 iResolution;
varying vec2 particleCenter;
uniform float iGlobalTime;
varying float sizeFactor;
uniform vec3 particlesColor;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    vec4 color = vec4(1.0);
    
    //normalize
    vec2 particleCenter = particleCenter.xy / iResolution.xy;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    particleCenter.x *= aspectRatio;
        
    float dist = distance(uv, particleCenter);
    float m = (1.0 / dist) * 0.003 * sizeFactor;
    color = vec4(m * particlesColor, m);
    
	gl_FragColor = color;
}