//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;
uniform float lineLength;
uniform float lgGlowFactor;

varying vec2 centerUV;
varying float radiusUV;
varying float lineLengthUV;
varying float lgGlowFactorUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    lineLengthUV = lineLength / iResolution.y;
    lgGlowFactorUV = lgGlowFactor / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795 

float rand(vec2 co)
{
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(co.xy ,vec2(a,b));
    float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float genLightningAndGetDist(vec2 currentUV, vec2 lgStartUV, vec2 lgEndUV, float lineWidthUV, float fluctuationUV, float noiseXMultiplier, float iGlobalTime, sampler2D noise){
    if(lgStartUV.x > lgEndUV.x){
        float temp = lgStartUV.x;
        lgStartUV.x = lgEndUV.x;
        lgEndUV.x = temp;

        temp = lgStartUV.y;
        lgStartUV.y = lgEndUV.y;
        lgEndUV.y = temp;
    }

	float lengthOfLightning = distance(lgStartUV, lgEndUV);

    float angle = asin( (lgEndUV.y - lgStartUV.y) / distance(lgStartUV, lgEndUV) );
    angle *= (-1.0);
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    vec2 currentUV_t = (currentUV - lgStartUV) * rotationMatrix;

    float xClamped = clamp(currentUV_t.x, 0.0, lengthOfLightning);
    float yNoiseVal = map(0.0, 1.0, -1.0, 1.0, texture2D(noise, vec2(noiseXMultiplier * xClamped, iGlobalTime / 1024.0)).r) * (fluctuationUV * lightningCos(xClamped, lengthOfLightning));
    yNoiseVal += (0.007 * lightningCos(xClamped, lengthOfLightning)) * map(0.0, 1.0, -1.0, 1.0, texture2D(noise, vec2(noiseXMultiplier * xClamped, iGlobalTime / 1024.0)).r);
    vec2 pointOnLightning = vec2(xClamped, clamp(currentUV_t.y, yNoiseVal - lineWidthUV, yNoiseVal + lineWidthUV)); 
    return distance(currentUV_t, pointOnLightning);
}

float getOverallLightningDist(vec2 uv, vec2 center, float radius, float numLightningStrands, float lineLength, float iGlobalTime, sampler2D noise){
    float randVals[5];
    for(int a = 0; a < 5; a++){
    	randVals[a] = rand(vec2(iGlobalTime,a+60));
    }
    
    float testDist = 0.0, minDist = 100.0;
    for(int i = 0; i < 5; i++){
    	vec2 startCoord = rotateCoord(vec2(center.x + radius, center.y), texture2D(noise, (vec2(iGlobalTime / 3.0, randVals[i] * 10.0))).r * (2.0*PI), center);
        vec2 endCoord = center + (  normalize(startCoord - center) * ( radius + ((lineLength * randVals[i]) + 0.004) )  );
        testDist = genLightningAndGetDist(uv, startCoord, endCoord, randVals[i] * 0.0001, 0.008, 3.0, iGlobalTime, noise);
        minDist = min(testDist, minDist);
    }
    
    if(minDist == 0.0){
        minDist = 0.00001;
    }
    
    return minDist;
}

uniform vec2 iResolution;
uniform float aspectRatio;
uniform float iGlobalTime;
uniform float lightningOn;
uniform sampler2D noise;

varying vec2 centerUV;
varying float radiusUV;
varying float lineLengthUV;
varying float lgGlowFactorUV;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    
	float numLightningStrands = 6.0;
    
    vec2 closestPt = centerUV + (normalize(uv - centerUV) * radiusUV);    
    float invertedDist = 1.0 / distance(uv, closestPt);    
   	float multiplier = invertedDist * 0.003;
   
    vec4 color;
    if(distance(uv, centerUV) <= radiusUV){
		color = vec4(1.0, 1.0, 1.0, 1.0);
    }else{
        //circle
    	color = vec4(vec3(1.0, 1.0, 1.0) * multiplier, multiplier);
        
        //lightning
        if(lightningOn == 1.0){
            float m = (1.0 / getOverallLightningDist (uv, centerUV, radiusUV, numLightningStrands, lineLengthUV, iGlobalTime, noise) ) * lgGlowFactorUV;
            color += vec4(m * vec3(1.0, 1.0, 1.0), m);
        }
    }
    
    
	gl_FragColor = color;
}