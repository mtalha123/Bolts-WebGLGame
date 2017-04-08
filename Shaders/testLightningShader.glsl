precision mediump float;

uniform float iGlobalTime;
uniform vec2 iResolution;
uniform int lengthArray;
uniform float glowFactor;
uniform float fluctuation;
uniform float lineWidth;
uniform vec3 boltColor;
uniform vec3 glowColor;
uniform sampler2D coords;

float getSlope(vec2 first, vec2 second){
    if((first.x - second.x) == 0.0){
    	return -1.0;
    }
   
	return (second.y - first.y) / (second.x - first.x);
}

float findYIntercept(float slope, vec2 point){
	return point.y - (slope * point.x);
}

vec2 getIntersectionPoint(float m1, float b1, float m2, float b2){
    float x = (b2 - b1) / (m1 - m2);
    float y = (m1 * x) + b1;
    
    return vec2(x, y);
}

float getClosestPoint(vec2 uv){
    float dist = 1000.0;

    float b = 0.0;
    for(int i = 0; i < 55-1; i++){
        vec2 startCoord, endCoord;

        startCoord = texture2D( coords, vec2(b * (1.0/64.0), 0.5) ).xy;
        endCoord = texture2D( coords, vec2((b+1.0) * (1.0/64.0), 0.5) ).xy;        
        
        b+=1.0;
        
        float m1 = getSlope(startCoord, endCoord);
        if(m1 == -1.0){
            vec2 clampedCoord = clamp(vec2(startCoord.x, uv.y), startCoord, endCoord); 
        	dist = min(dist, distance(uv, clampedCoord));
            continue;
        }
        
        if(m1 == 0.0){
            vec2 clampedCoord = clamp(vec2(uv.x, startCoord.y), startCoord, endCoord); 
        	dist = min(dist, distance(uv, clampedCoord));
            continue;
        }
        float b1 = findYIntercept(m1, startCoord);

        float p = (1.0 / m1) * (-1.0);
        float b2 = findYIntercept(p, uv);
        
        if(startCoord.x > endCoord.x){
            float temp = startCoord.x;
            startCoord.x = endCoord.x;
            endCoord.x = temp;
        }
         if(startCoord.y > endCoord.y){
            float temp = startCoord.y;
            startCoord.y = endCoord.y;
            endCoord.y = temp;
        }

        vec2 intersectionPoint = clamp(getIntersectionPoint(m1, b1, p, b2), startCoord, endCoord);
        dist = min(dist, distance(uv, intersectionPoint));
    }
    
    return dist;
}

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float dist = getClosestPoint(uv);
   	float invertedDist = 1.0 / dist;
    invertedDist *= 0.005;
    
    vec3 finalColor = invertedDist * glowColor;
    
    
	gl_FragColor = vec4(finalColor, invertedDist);
}