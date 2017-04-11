precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform int lengthArray;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform vec3 boltColor;
uniform vec3 glowColor;
uniform sampler2D noise;
uniform sampler2D coords;



float improvedSin(float value){
	return (sin(value) + 1.0) / 2.0;
}

float lightningCos(float value, float lengthOfLightning){
    return ((-cos( ((2.0 * PI) / lengthOfLightning) * value) + 1.0) / 2.0);
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

float transformToAspectRatioMeasurement(float aspectRatio, float baseMeasurement, float uvAngle){
    return baseMeasurement + ( cos(abs(uvAngle)) * (aspectRatio - 1.0) * baseMeasurement );
}

void main(){
	vec2 currentUV = gl_FragCoord.xy / iResolution.xy; 
    float aspectRatio = iResolution.x / iResolution.y;
    
    currentUV.x *= aspectRatio;
        
    float lightningAmount = 0.025 * iResolution.x;
    float lineWidthUV, lineWidthUV_t; 
    
    vec2 t_currentUV_t, currentUV_t;
    vec2 lightningStartCoord, lightningEndCoord, t_lightningStartUV, t_lightningEndUV; 
    vec2 lightningStartUV, lightningEndUV; 
    float t_lengthOfLightning, lengthOfLightning;
    
    float testDistance, distanceToPoint = 1000.0;
    vec3 finalColor = vec3(1.0);
    
    vec2 t_lightningStartUV_t, lightningStartUV_t;

    float t_xClamped, t_yNoiseVal;
    float xClamped, yNoiseVal;
    vec2 t_pointOnLightning, pointOnLightning;
    
    float b = 0.0;
    for(int i = 0; i < 6-1; i++){
        t_lightningStartUV = texture2D(coords, vec2(b * (1.0/8.0), 0.5) ).xy;
        t_lightningEndUV = texture2D(coords, vec2((b+1.0) * (1.0/8.0), 0.5) ).xy;
        
        if(t_lightningStartUV.x > t_lightningEndUV.x){
        	float temp = t_lightningStartUV.x;
            t_lightningStartUV.x = t_lightningEndUV.x;
            t_lightningEndUV.x = temp;
        }

        t_lightningStartUV.x *= aspectRatio;
        t_lightningEndUV.x *= aspectRatio;
        
        t_lengthOfLightning = distance(t_lightningStartUV, t_lightningEndUV);
        
        float angle = asin( (t_lightningEndUV.y - t_lightningStartUV.y) / distance(t_lightningStartUV, t_lightningEndUV) );
        angle *= (-1.0);
        mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        
        lineWidthUV_t = lineWidth / iResolution.y;//transformToAspectRatioMeasurement(aspectRatio, lineWidth / iResolution.y, angle);
        
        t_lightningStartUV_t = t_lightningStartUV * rotationMatrix;
        t_currentUV_t = (currentUV - t_lightningStartUV) * rotationMatrix;
        
        t_xClamped = clamp(t_currentUV_t.x, 0.0, t_lengthOfLightning);
        float pureNoiseVal = texture2D(noise, (vec2(clamp(t_currentUV_t.x / aspectRatio, 0.0, t_lengthOfLightning), iGlobalTime / 1024.0))).r;
        pureNoiseVal = map(0.0, 1.0, -1.0, 1.0, pureNoiseVal);
    	t_yNoiseVal = pureNoiseVal * ( (fluctuation * lightningCos(t_xClamped, t_lengthOfLightning)) / iResolution.x);
    	t_pointOnLightning = vec2(t_xClamped, clamp(t_currentUV_t.y, t_yNoiseVal - lineWidthUV_t, t_yNoiseVal + lineWidthUV_t)); 
    	testDistance = distance(t_currentUV_t, t_pointOnLightning);
        
        if(testDistance < distanceToPoint){
        	lightningStartUV = t_lightningStartUV;
            lightningEndUV = t_lightningEndUV;
            lengthOfLightning = t_lengthOfLightning;
            currentUV_t = t_currentUV_t;
            xClamped = t_xClamped;
            yNoiseVal = t_yNoiseVal;
            pointOnLightning = t_pointOnLightning;
            lineWidthUV = lineWidthUV_t;
            
            distanceToPoint = testDistance;
        }
        b+=1.0;
    }
    
    float invertedDistance = clamp(1.0 / distanceToPoint, 1.0, 300.0);
    float multiplier = invertedDistance * (glowFactor / iResolution.x);
    
    if( (currentUV_t.y >= (yNoiseVal - lineWidthUV)) && (currentUV_t.y <= (yNoiseVal + lineWidthUV)) ){
        finalColor = multiplier * glowColor;
        
        //finalColor = clamp(finalColor, 0.1, 1.0);
        //float rr = map(0.1, 1.0, 0.65, 1.0, finalColor.r);
        //float gg = map(0.1, 1.0, 0.65, 1.0, finalColor.g);
        //float bb = map(0.1, 1.0, 0.65, 1.0, finalColor.b);
        //finalColor = vec3(rr,gg, bb);
        if( (currentUV_t.x >= 0.0) && (currentUV_t.x <= lengthOfLightning) ){
        	finalColor = boltColor;
        }//else if(distance(currentUV, lightningEndUV) <= lineWidthUV){
        //	finalColor = boltColor;
       // }
    }else{
        finalColor = multiplier * glowColor;
      //  finalColor = clamp(finalColor, 0.1, 1.0);

      //  float rr = map(0.1, 1.0, 0.65, 1.0, finalColor.r);
      //  float gg = map(0.1, 1.0, 0.65, 1.0, finalColor.g);
      //  float bb = map(0.1, 1.0, 0.65, 1.0, finalColor.b);
       // finalColor = vec3(rr,gg, bb);
    }  
    
    
	//STILL TESTINGGGGGG----------
    float gFactor = 0.1;
    
    if(finalColor.r < gFactor){
    	//finalColor.r = gFactor;
    }
    
    if(finalColor.g < gFactor){
    	//finalColor.g = gFactor;
    }
    
    if(finalColor.b < gFactor){
    	//finalColor.b = gFactor;
    }
    
    //-------------------------------
   float alpha = 1.0 - smoothstep(0.001, 0.02, distanceToPoint);
   finalColor = vec3(1.0, 1.0, 0.0);
   if(alpha < 1.0){
        finalColor = vec3(1.0, 1.0, 0.9);
   }
	gl_FragColor = vec4(finalColor, alpha);//0.5 * multiplier);
}