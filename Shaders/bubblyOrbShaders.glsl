//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float circleGlowFactor;
uniform float particleGlowFactor;

varying vec2 centerUV;
varying float radiusUV;
varying float circleGlowFactorUV;
varying float particleGlowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    circleGlowFactorUV = circleGlowFactor / iResolution.y;
    particleGlowFactorUV = particleGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
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
uniform float iGlobalTime;
uniform float particlesBool;
uniform float aspectRatio;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;
varying float circleGlowFactorUV;
varying float particleGlowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    uv.x *= aspectRatio;
    vec4 color = vec4(0.0);    

    float noiseVal;
    float angle = getUVAngleDeg(uv, centerUV);
    float arcLength = radians(angle) * radiusUV;
    float halfCircumference = (PI * (radiusUV * 2.0)) / 2.0;
    if(angle <= 180.0){
        noiseVal = cnoise(vec2(arcLength * 300.0 * radiusUV, iGlobalTime / 8.5));
        //noiseVal = texture2D( noise, vec2(arcLength * 10.0 * radiusUV, iGlobalTime / 2000.0) ).r;
    }else{
        float leftOverArc = radians((angle - 180.0)) * radiusUV; 
        noiseVal = cnoise(vec2((halfCircumference - leftOverArc) * 300.0 * radiusUV, iGlobalTime / 8.5));
        
        //noiseVal = texture2D( noise, vec2((halfCircumference - leftOverArc) * 10.0 * radiusUV, iGlobalTime / 2000.0) ).r;
    }
    noiseVal *= 0.25 * radiusUV;
    vec2 closestPoint = centerUV + (normalize(uv - centerUV) * radiusUV); 
    vec2 uvToCenterDirVec = normalize(centerUV - uv);
    vec2 lightningPoint = closestPoint + (uvToCenterDirVec * noiseVal);
    color += vec4(0.0, 0.3, 1.0, 1.0) * (1.0/distance(lightningPoint, uv)) * circleGlowFactorUV;
    
    color += vec4(0.0, 0.1, 0.7, 1.0) * (1.0 - smoothstep(distance(centerUV, lightningPoint) - 0.001, distance(centerUV, lightningPoint), distance(uv, centerUV))); 
    
    if(particlesBool == 1.0){
        float distFromParticle = getDistToParticle(uv, centerUV, radiusUV / 2.0, iGlobalTime);    
        float particleMult = (1.0 / distFromParticle) * particleGlowFactorUV;
        color += vec4( (particleMult * vec3(1.0, 1.0, 0.0)) * 0.8, particleMult);
    }
    
	gl_FragColor = color;
}