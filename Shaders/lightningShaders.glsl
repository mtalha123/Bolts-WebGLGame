//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

#define PI 3.1415926535897932384626433832795

const int MAX_ITERATIONS = 10;

float lightningCos(float value, float lengthOfLightning){
    return ((-cos( ((2.0 * PI) / lengthOfLightning) * value) + 1.0) / 2.0);
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform int numCoords;
uniform float widthOfCoordsTexture;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform vec3 boltColor;
uniform vec3 glowColor;
uniform sampler2D noise;
uniform sampler2D coords;

void main(){
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    float aspectRatio = iResolution.x / iResolution.y;
    
    uv.x *= aspectRatio;
        
    float lightningAmount = 0.025 * iResolution.x;
    float lineWidthUV = lineWidth / iResolution.y; 
    vec2 uv_t;
    vec2 lightningStart, lightningEnd; 
    float lengthOfLightning;
    float testDistance, distanceToPoint = 1000.0;
    vec3 finalColor = vec3(1.0);
    float xClamped, yNoiseVal;
    vec2 pointOnLightning;
       
    for(int i = 0; i < MAX_ITERATIONS; i++){
        if(i == (numCoords - 1)){
            break;
        }
        
        lightningStart = texture2D(coords, vec2(float(i) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        lightningEnd = texture2D(coords, vec2((float(i)+1.0) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        
        if(lightningStart.x > lightningEnd.x){
        	float temp = lightningStart.x;
            lightningStart.x = lightningEnd.x;
            lightningEnd.x = temp;
        }

        lightningStart.x *= aspectRatio;
        lightningEnd.x *= aspectRatio;
        
        lengthOfLightning = distance(lightningStart, lightningEnd);
        
        float angle = asin( (lightningEnd.y - lightningStart.y) / distance(lightningStart, lightningEnd) );
        angle *= (-1.0);
        mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        
        uv_t = (uv - lightningStart) * rotationMatrix;
        
        xClamped = clamp(uv_t.x, 0.0, lengthOfLightning);
        float pureNoiseVal = texture2D(noise, (vec2(clamp(uv_t.x / aspectRatio, 0.0, lengthOfLightning), iGlobalTime / 1024.0))).r;
        pureNoiseVal = map(0.0, 1.0, -1.0, 1.0, pureNoiseVal);
    	yNoiseVal = pureNoiseVal * ( (fluctuation * lightningCos(xClamped, lengthOfLightning)) / iResolution.x);
    	pointOnLightning = vec2(xClamped, clamp(uv_t.y, yNoiseVal - lineWidthUV, yNoiseVal + lineWidthUV)); 
    	testDistance = distance(uv_t, pointOnLightning);
        
        if(testDistance < distanceToPoint){
            distanceToPoint = testDistance;
        }
    }
    
    float invertedDistance = smoothstep(0.0, 220.0, 1.0 / distanceToPoint);
    float multiplier = invertedDistance;
    
    float alpha = 1.0;
    
    if(distanceToPoint <= lineWidthUV){
        finalColor = boltColor;
    }else{
        finalColor = vec3(1.0, 1.0, 0.7);
        alpha *= multiplier;
    }

	gl_FragColor = vec4(finalColor, alpha);
}




//float rand(vec2 co){
//    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
//}
//
//vec2 getProjectionVector(vec2 a, vec2 bNormalized){
//	return ( dot(a, bNormalized) / dot(bNormalized, bNormalized) ) * bNormalized;
//}
//
//vec2 getPerpVec(vec2 vec){
//	return vec2(vec.y * (-1.0), vec.x);
//}
//
//vec2 ls = vec2(0.2);
//vec2 le = vec2(0.8);
//
//void mainImage( out vec4 fragColor, in vec2 fragCoord )
//{
//	vec2 uv = fragCoord.xy / iResolution.xy;
//    vec3 color;
//    
//    vec2 lgDirVec = normalize(le - ls);
//    vec2 lsToUV = uv - ls;
//    vec2 projectionVec = getProjectionVector(lsToUV, lgDirVec);
//    projectionVec = clamp(ls + projectionVec, ls, le) - ls; 
//    vec2 perpVec = getPerpVec(lgDirVec) * 0.1;
//    
//    float minDist = length(uv - (perpVec + ls + projectionVec));    
//    color = vec3(1.0) * (1.0 / minDist) * 0.01;
//	fragColor = vec4(color, 1.0);
//}