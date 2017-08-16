//VERTEX SHADER
#define PI 3.1415926535897932384626433832795 
const int NUM_RAND_VALS = 2;

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

vec2 shaderCoordsToGLCoords(vec2 shaderCoord, vec2 iResolution){
    vec2 normalizedCoord = shaderCoord / iResolution;
    return vec2( map(0.0, 1.0, -1.0, 1.0, normalizedCoord.x), map(0.0, 1.0, -1.0, 1.0, normalizedCoord.y) );
}

vec2 explosionParticleFX(vec2 center, float iGlobalTime, vec4 randVals, float velMagnitude){
    float timeInCurrLifetime = iGlobalTime;
    float randVal = randVals.x;
    float randomAngle = randVal * PI * 2.0;
    vec2 velocity = (vec2(cos(randomAngle), sin(randomAngle)) * velMagnitude);
    return (center + (velocity * timeInCurrLifetime));
}

vec2 toDestPtParticleFX(vec2 center, float iGlobalTime, float maxLifetime, vec4 randVals, vec2 destinationPt, float velMagnitude, float accelerationMagnitude){
    float overallLifetime = dot(randVals, vec4(maxLifetime));
   
    float timeModded = mod(iGlobalTime, overallLifetime);
    
    //find index of randVals
    float timeInCurrLifetime;
    float randVal;
    if( (randVals.x * maxLifetime) >= timeModded){
        randVal = randVals.x;
        timeInCurrLifetime = timeModded;        
    }else if( dot(randVals.xy, vec2(maxLifetime)) >= timeModded){
        randVal = randVals.y;
        timeInCurrLifetime = timeModded - (randVals.x * maxLifetime);        
    }else if( dot(randVals.xyz, vec3(maxLifetime))  >= timeModded){
        randVal = randVals.z;
        timeInCurrLifetime = timeModded - ( dot(randVals.xy, vec2(maxLifetime)) );        
    }else if(  dot(randVals.rgba, vec4(maxLifetime))  >= timeModded){
        randVal = randVals.a;
        timeInCurrLifetime = timeModded - ( dot(randVals.xyz, vec3(maxLifetime)) );        
    }      
    
    float randomAngle = randVal * PI * 2.0;
    vec2 velocity = vec2(cos(randomAngle), sin(randomAngle)) * velMagnitude;
    vec2 acceleration = normalize(destinationPt - (velocity * timeInCurrLifetime)) * accelerationMagnitude;
    velocity = (vec2(cos(randomAngle), sin(randomAngle)) * velMagnitude) + (timeInCurrLifetime * acceleration);
    
    return (center + (velocity * timeInCurrLifetime));
}

attribute vec2 vertexPosition;
attribute vec4 randVals;
uniform float particleFX;
uniform float maxLifetime;
uniform mediump float iGlobalTime;
uniform float velocityMagnitude;
uniform float accelerationMagnitude;
uniform mediump vec2 center;
uniform mediump vec2 iResolution;
varying vec2 particleCenter;
varying float sizeFactor;

void main(){
    //for fragment shader
    sizeFactor = 1.0 - map(0.0, maxLifetime, 0.0, 0.95, iGlobalTime);
    
    if(particleFX == 1.0){
        particleCenter = explosionParticleFX(center, iGlobalTime, randVals, velocityMagnitude);
    }else if(particleFX == 2.0){
        particleCenter = toDestPtParticleFX(center, iGlobalTime, maxLifetime, randVals, vec2(600, 700), velocityMagnitude, accelerationMagnitude);
    }
    vec2 translateVector = particleCenter - center;
    
    vec2 vPos = vertexPosition + translateVector;
    vPos = shaderCoordsToGLCoords(vPos, iResolution);
    gl_Position = vec4(vPos, 0.0, 1.0);
}

//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform vec2 iResolution;
uniform float radius;
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
    float radius = radius / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    particleCenter.x *= aspectRatio;
        
    float dist = distance(uv, particleCenter);
    float m = (1.0 / dist) * 0.007 * sizeFactor;
    color = vec4(m * particlesColor, m);
    
	gl_FragColor = color;
}