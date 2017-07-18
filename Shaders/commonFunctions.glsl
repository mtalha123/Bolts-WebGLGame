#define PI 3.1415926535897932384626433832795

float sinPositive(float value){
	return (sin(value) + 1.0) / 2.0;
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

float lightningCos(float value, float lengthOfLightning){
    return (-cos( ((2.0 * PI) / lengthOfLightning) * value) + 1.0) / 2.0;
}

//returns angle between 0 and 360
float getUVAngleDeg(vec2 uv, vec2 center){
	vec2 uv_t = uv - center;
    
    if(uv_t.x == 0.0){
        if(uv_t.y >= 0.0){
        	return 90.0;
        }
        
        if(uv_t.y < 0.0){
        	return -90.0;
        }
    }
    
    float angle;
    angle = atan(uv_t.y, uv_t.x);
    //convert to degrees
    angle = degrees(angle);
    
    if(angle < 0.0){
    	angle = 180.0 + (180.0 - abs(angle));
    }
    return angle;
}

float genLightningAndGetDist(vec2 currentUV, vec2 lgStartUV, vec2 lgEndUV, float lineWidthUV, float fluctuationUV, float noiseXMultiplier, sampler2D noise, float iGlobalTime, vec2 iResolution){
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
    vec2 pointOnLightning = vec2(xClamped, clamp(currentUV_t.y, yNoiseVal - lineWidthUV, yNoiseVal + lineWidthUV)); 
    return distance(currentUV_t, pointOnLightning);
}