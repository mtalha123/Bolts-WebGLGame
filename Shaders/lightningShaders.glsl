//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}


//FRAGMENT SHADER
precision mediump float;

const int NUM_COORDS = 5;

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform float widthOfCoordsTexture;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform vec3 boltColor;
uniform vec3 glowColor;
uniform float spikedLgBool;
uniform float completion;
uniform sampler2D noise;
uniform sampler2D coords;

void main(){
	vec2 uv = gl_FragCoord.xy / iResolution.xy; 
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    float lineWidthUV = lineWidth / iResolution.y; 
    float fluctuationUV = fluctuation / iResolution.y;
    float glowFactor = glowFactor / iResolution.y;
    
    //take into account aspect ratio    
    uv.x *= aspectRatio;
        
    vec2 uv_t;
    vec2 lightningStart, lightningEnd; 
    float lengthOfLightning;
    float testDistance, distanceToPoint = 1000.0;
    vec3 finalColor = vec3(1.0);
    float xClamped, yNoiseVal;
    vec2 pointOnLightning;
       
    for(int i = 0; i < NUM_COORDS; i++){
        lightningStart = texture2D(coords, vec2(float(i) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        lightningEnd = texture2D(coords, vec2((float(i)+1.0) * (1.0/widthOfCoordsTexture), 0.5) ).xy;
        
        lightningStart.x *= aspectRatio;
        lightningEnd.x *= aspectRatio;

        testDistance = genLightningAndGetDist(uv, lightningStart, lightningEnd, lineWidthUV, fluctuationUV, 0.3, spikedLgBool, noise, iGlobalTime, iResolution);
        
        if(testDistance < distanceToPoint){
            distanceToPoint = testDistance;
        }
    }
    
    float alpha = 1.0;
    
    if(distanceToPoint == 0.0){
        distanceToPoint = 0.0000001;
    }
    
    if(spikedLgBool == 1.0){
        lineWidthUV *= (1.0 - completion);
        glowFactor *= (1.0 - completion);
        
        float edgeBlurWidth = min(lineWidthUV, 0.005);
        float smthVal = 1.0 - smoothstep(lineWidthUV - edgeBlurWidth, lineWidthUV, distanceToPoint);  
        float invertedDist = 1.0 / (distanceToPoint - ((1.0 - smthVal) * (lineWidthUV - edgeBlurWidth)));
        float glowMultiplier = invertedDist * glowFactor;

        finalColor = (smthVal * boltColor) + ((1.0 - smthVal) * glowColor * glowMultiplier); 
        alpha = glowMultiplier;
    }else{
        float invertedDistance = smoothstep(0.0, 220.0, 1.0 / distanceToPoint);
        float multiplier = invertedDistance;
        
        if(distanceToPoint <= lineWidthUV){
            finalColor = boltColor;
        }else{
            finalColor = glowColor;
            alpha = multiplier;
        }
    }    

	gl_FragColor = vec4(finalColor, alpha);
}