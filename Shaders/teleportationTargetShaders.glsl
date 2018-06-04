//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 getProjectedVector(vec2 a, vec2 b){
    return (dot(a, b) / dot(b, b)) * b;
}

float getAngleBetweenVecs(vec2 a, vec2 b){
    return acos(dot(a, b) / (length(a) * length(b)));
}

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 center;
uniform float radius;
uniform vec2 dirVec;
uniform vec2 portalLocation;
uniform float portalActivated;
uniform float appearing;
uniform float capturedBool;
uniform sampler2D noise;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y; 
    
    //normalize
    vec2 center = center.xy / iResolution.xy;
    float radius = radius / iResolution.y;
    
    //take aspect ratio into account
    uv.x *= aspectRatio;
    center.x *= aspectRatio;
    
    float iGlobalTime = iGlobalTime / 100.0;
    float distToEdge = distance(center + (normalize(uv - center) * radius), uv);
    float noiseVal1 = max(0.3, snoise(uv + vec2(iGlobalTime)));
    float noiseVal2 = max(0.3, snoise(uv + vec2(iGlobalTime + 5.0)));
    float noiseVal3 = max(0.3, snoise(uv + vec2(iGlobalTime + 10.0)));
    float multiplyFactor = (1.0 / distToEdge) * 0.01;    
    vec4 color = multiplyFactor * vec4(pow(noiseVal1, 4.0), pow(noiseVal2, 2.0), noiseVal3, 1.0);
    iGlobalTime *= 100.0;
    
    vec4 lightningContribution = vec4(0.0);
    if(distance(uv, center) <= radius){
        /* Dealing with lightning */
        
        // rotating effect
        uv = rotateCoord(uv, iGlobalTime / 15.0, center);

        float numBolts = 3.0;
        float angleMultipleDeg = 360.0 / numBolts;
        float UVAngleDeg = getUVAngleDeg(uv, center);
        float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
        vec2 rotatedCoord = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
        vec2 lgStartCoord = center;
        float lgLineWidth = 1.0 / iResolution.y;
        float fluctuation = 5.0 / iResolution.y;
        float lgGlowFactor = 3.0 / iResolution.y;

        float distToLg = genLightningAndGetDist(uv, lgStartCoord, rotatedCoord, lgLineWidth, fluctuation, 4.0, 0.0, noise, iGlobalTime, iResolution);
        distToLg = max(distToLg, 0.0000001);

        vec3 glowColor = vec3(1.0, 1.0, 0.7);
        vec3 solidColor = vec3(1.0, 1.0, 0.0);

        float edgeBlurWidth = min(lgLineWidth, 0.005);
        float smthVal = 1.0 - smoothstep(lgLineWidth - edgeBlurWidth, lgLineWidth, distToLg);  
        float invertedDist = 1.0 / (distToLg - ((1.0 - smthVal) * (lgLineWidth - edgeBlurWidth)));
        float glowMultiplier = pow(invertedDist * lgGlowFactor, 1.5);

        lightningContribution.rgb = (smthVal * solidColor) + ((1.0 - smthVal) * glowColor * glowMultiplier); 
        lightningContribution.a = glowMultiplier;
        
        // undo rotating effect
        uv = rotateCoord(uv, -(iGlobalTime / 15.0), center);
    }

    color += lightningContribution;
    
    if(portalActivated == 1.0){
        vec2 portalLocation = portalLocation.xy / iResolution.xy;
        vec2 dirVec = dirVec.xy / iResolution.xy;
        
        portalLocation.x *= aspectRatio;
        dirVec.x *= aspectRatio;
        
        vec4 portalColor = vec4(0.0, 0.5, 1.0, 1.0);
        vec2 perpVec = vec2(-dirVec.y, dirVec.x);
        vec2 projVec = getProjectedVector(uv - portalLocation, perpVec);
        float dist = distance(uv, portalLocation + projVec);
        float portalAmountToDrawOnSideDisappearing = 0.01;
        
        if(dist > portalAmountToDrawOnSideDisappearing && getAngleBetweenVecs(portalLocation - uv, dirVec) > (PI / 2.0) && appearing == 0.0){ // if disappearing
            color = vec4(0.0);    
        }else if(dist > portalAmountToDrawOnSideDisappearing && getAngleBetweenVecs(portalLocation - uv, dirVec) < (PI / 2.0) && appearing == 1.0){ // if appearing
            color = vec4(0.0);
        }else{
            if((length(projVec) > (radius * 1.3))){
                portalColor = vec4(0.0);
            }else{
                float multFactor = (1.0 / dist) * 0.007;
                multFactor = pow(multFactor, 1.5);
                portalColor *= multFactor;
            }
            color += portalColor;
        }
    }
    
    if(capturedBool == 1.0){
        color.r = 1.0;
        color.a = pow(color.a, 2.0);
    }
    
	gl_FragColor = color;
}