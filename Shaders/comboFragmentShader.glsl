precision mediump float;

#define PI 3.1415926535897932384626433832795

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
    angle *= (180.0 / PI);
    
    if(angle < 0.0){
    	angle = 180.0 + (180.0 - abs(angle));
    }
    return angle;
}

float sinPositive(float x){
	return (sin(x) + 1.0) / 2.0;
}

float map(float in_min, float in_max, float out_min, float out_max, float number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

uniform vec2 uniformCenter;
uniform float completion;
uniform vec2 iResolution;
uniform float radius;
uniform float lineWidth;
uniform vec4 firstTextCoords;
uniform vec4 secondTextCoords;
uniform float gap;
uniform sampler2D fontTexture;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = (iResolution.x / iResolution.y);
    vec2 center = uniformCenter;
    uv.x *= aspectRatio;
    center.x *= aspectRatio;
    vec4 color = vec4(0.0, 0.0, 1.0, 0.0);
    
    float distToCenter = distance(uv, center);
    float angleOfCompletion = (PI/ 2.0) +  ( (-2.0 * PI) * completion );
    float uvAngle = getUVAngleDeg(uv, center) * (PI / 180.0);
    
    if(uvAngle > (PI / 2.0)){
    	uvAngle -= (2.0 * PI);
    }
    
    
    if(distToCenter > (radius - lineWidth) && distToCenter < (radius + lineWidth)){
        if(uvAngle <= (PI / 2.0) && uvAngle >= angleOfCompletion){
            //color = vec4(1.0);
        }else{
            float distFromCircOutline = abs(distToCenter - radius);
            float alpha = 1.0 - smoothstep(lineWidth - 0.003, lineWidth, distFromCircOutline);
        	color = vec4(vec3(0.0, 0.59, 0.79), alpha);
        }
    }
    
    vec2 firstCharStart = vec2( center.x - (radius / 2.0), center.y - (radius / 2.0) );
    vec2 firstCharEnd = vec2( center.x - (radius / 2.0) + 0.04, center.y + (radius / 2.0) );
    
    if(uv.x >= firstCharStart.x && uv.x <= firstCharEnd.x){
        if(uv.y >= firstCharStart.y && uv.y <= firstCharEnd.y){
            float xMapped = map(firstCharStart.x, firstCharEnd.x, firstTextCoords.r, firstTextCoords.b, uv.x);
            float yMapped = map(firstCharStart.y, firstCharEnd.y, firstTextCoords.g, firstTextCoords.a, uv.y);
            vec4 texel = texture2D(fontTexture, vec2(xMapped, yMapped));
            float dist = 1.0 - texel.a;
            float alpha = 1.0 - smoothstep(0.5, 0.6, dist);
            color = vec4(vec3(1.0, 0.0, 0.0), alpha); 
        }
    }
    
    vec2 secondCharStart = vec2( center.x - (radius / 2.0) + 0.04, center.y - (radius / 2.0) );
    vec2 secondCharEnd = vec2( center.x + (radius / 2.0), center.y + (radius / 4.0) );
    
    if(uv.x >= secondCharStart.x && uv.x <= secondCharEnd.x){
        if(uv.y >= secondCharStart.y && uv.y <= secondCharEnd.y){
            float xMapped = map(secondCharStart.x, secondCharEnd.x, secondTextCoords.r, secondTextCoords.b, uv.x);
            float yMapped = map(secondCharStart.y, secondCharEnd.y, secondTextCoords.g, secondTextCoords.a, uv.y);
            vec4 texel = texture2D(fontTexture, vec2(xMapped, yMapped));
            float dist = 1.0 - texel.a;
            float alpha = 1.0 - smoothstep(0.5, 0.6, dist);
            color = vec4(vec3(1.0, 0.0, 0.0), alpha); 
        }
    }
    
	gl_FragColor = color;//vec4(color.rgb, 1.0);
}