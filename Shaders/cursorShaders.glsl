//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
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


float getClosestMultiple(int number, int multiple){
    if(number == 0){
    	return 0.0;
    }
	int remainder = int(mod(float(number), float(multiple)));
    
    if(remainder < (multiple / 2)){
    	return float(number - remainder);
    }else{
    	return float(number + (multiple - remainder)); 
    } 
    
}

vec2 rotateCoord(vec2 point, float angle, vec2 center){
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    return ((point - center) * rotationMatrix) + center;
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

vec4 generateLightning(vec2 currentUV, vec2 iResolution, vec2 startCoord, vec2 endCoord, float lineWidth, float time, float glowFactor){    
    vec2 lightningStartUV = startCoord; 
    vec2 lightningEndUV = endCoord; 
    float lengthOfLightning;
    
    float distanceToPoint;
    vec3 colorToReturn = vec3(0.0);
    
    float xClamped, ySinVal;
    vec2 pointOnLightning;
        
    if(lightningStartUV.x > lightningEndUV.x){
        float temp = lightningStartUV.x;
        lightningStartUV.x = lightningEndUV.x;
        lightningEndUV.x = temp;
        
        temp = lightningStartUV.y;
        lightningStartUV.y = lightningEndUV.y;
        lightningEndUV.y = temp;
    }

	lengthOfLightning = distance(lightningStartUV, lightningEndUV);

    float angle = asin( (lightningEndUV.y - lightningStartUV.y) / distance(lightningStartUV, lightningEndUV) );
    angle *= (-1.0);
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    vec2 currentUV_t = (currentUV - lightningStartUV) * rotationMatrix;

    xClamped = clamp(currentUV_t.x, 0.0, lengthOfLightning);
  //  ySinVal = map(0.0, 1.0, -1.0, 1.0, texture2D(noise, vec2(xClamped * 6.0, iGlobalTime / 1024.0)).r) * ( (fluctuation_t * lightningCos(xClamped, lengthOfLightning)) / iResolution.x);
    ySinVal = 0.01 * sin( ((2.0 * PI)/(lengthOfLightning / 2.0)) * (xClamped - time * 0.008));
    pointOnLightning = vec2(xClamped, clamp(currentUV_t.y, ySinVal - lineWidth, ySinVal + lineWidth)); 
    distanceToPoint = distance(currentUV_t, pointOnLightning);

    float invertedDistance = 1.0 / distanceToPoint;
    float multiplier = invertedDistance * (glowFactor / iResolution.x); 
    
    if(distanceToPoint <= lineWidth){
        return vec4(1.0, 1.0, 0.0, 1.0);
    }else{
        return vec4(vec3(1.0, 1.0, 0.0), multiplier);
    }
}

uniform vec2 iResolution;
uniform float clicked;
uniform vec2 mouseCoords;
uniform float time;
uniform float radius;
float numBolts = 5.0;
float lineWidth = 0.001;
float glowFactor = 4.0;

void main()
{
 	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    
    //normalize
    float radius = radius / iResolution.y;
    
    //take into account aspect ratio
    uv.x *= aspectRatio;
//    
    vec2 mousecoords = mouseCoords / iResolution.xy;
    mousecoords.x *= aspectRatio;
//    vec4 finalColor = vec4(0.4, 0.4, 0.4, 0.0);
//    
//    if(distance(uv, mousecoords) < radius){
//        finalColor = vec4(0.6, 0.6, 0.0, (1.0/distance(uv, mousecoords)) * 0.003);
//        if(clicked == 1.0){
//            float angleMultipleDeg = 360.0 / numBolts;
//            float UVAngleDeg = getUVAngleDeg(uv, mousecoords);
//            float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
//            vec2 rotatedCoord = rotateCoord(vec2(mousecoords.x + radius, mousecoords.y), closestAngleMultiple, mousecoords);
//            finalColor = generateLightning(uv, iResolution, rotatedCoord, mousecoords, lineWidth, time, glowFactor);
//            
//            finalColor = vec4(1.0, 1.0, 0.0, (1.0/distance(uv, mousecoords)) * 0.003);
//        }
//    }
//    
//	gl_FragColor = finalColor;
    
    vec2 center = mousecoords;   
    vec4 color;
    color = vec4(1.0, 1.0, 0.0, 1.0) * (1.0/distance(uv, mousecoords)) * 0.003;
    
    if(clicked == 1.0){
        float noiseVal;
        float angle = getUVAngleDeg(uv, center);
        float arcLength = radians(angle) * radius;
        float halfCircumference = (PI * (radius * 2.0)) / 2.0;
        if(angle <= 180.0){
            noiseVal = cnoise(vec2(arcLength * 105.0, time / 4.0));
        }else{
            float leftOverArc = radians((angle - 180.0)) * radius; 
            noiseVal = cnoise(vec2((halfCircumference - leftOverArc) * 105.0, time / 4.0));
        }
        noiseVal *= 0.01;
        vec2 closestPoint = center + (normalize(uv - center) * radius); 
        vec2 uvToCenterDirVec = normalize(center - uv);
        vec2 lightningPoint = closestPoint + (uvToCenterDirVec * noiseVal);
        color += vec4(1.0, 1.0, 0.0, 1.0) * (1.0/distance(lightningPoint, uv)) * 0.002;
    }
    gl_FragColor = color;
}





//
//#define PI 3.1415926535897932384626433832795
//
//vec4 mod289(vec4 x)
//{
//  return x - floor(x * (1.0 / 289.0)) * 289.0;
//}
//
//vec4 permute(vec4 x)
//{
//  return mod289(((x*34.0)+1.0)*x);
//}
//
//vec4 taylorInvSqrt(vec4 r)
//{
//  return 1.79284291400159 - 0.85373472095314 * r;
//}
//
//vec2 fade(vec2 t) {
//  return t*t*t*(t*(t*6.0-15.0)+10.0);
//}
//
//// Classic Perlin noise
//float cnoise(vec2 P)
//{
//  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
//  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
//  Pi = mod289(Pi); // To avoid truncation effects in permutation
//  vec4 ix = Pi.xzxz;
//  vec4 iy = Pi.yyww;
//  vec4 fx = Pf.xzxz;
//  vec4 fy = Pf.yyww;
//
//  vec4 i = permute(permute(ix) + iy);
//
//  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
//  vec4 gy = abs(gx) - 0.5 ;
//  vec4 tx = floor(gx + 0.5);
//  gx = gx - tx;
//
//  vec2 g00 = vec2(gx.x,gy.x);
//  vec2 g10 = vec2(gx.y,gy.y);
//  vec2 g01 = vec2(gx.z,gy.z);
//  vec2 g11 = vec2(gx.w,gy.w);
//
//  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
//  g00 *= norm.x;
//  g01 *= norm.y;
//  g10 *= norm.z;
//  g11 *= norm.w;
//
//  float n00 = dot(g00, vec2(fx.x, fy.x));
//  float n10 = dot(g10, vec2(fx.y, fy.y));
//  float n01 = dot(g01, vec2(fx.z, fy.z));
//  float n11 = dot(g11, vec2(fx.w, fy.w));
//
//  vec2 fade_xy = fade(Pf.xy);
//  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
//  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
//  return 2.3 * n_xy;
//}
//
//float getUVAngleDeg(vec2 uv, vec2 center){
//	vec2 uv_t = uv - center;
//    
//    if(uv_t.x == 0.0){
//        if(uv_t.y >= 0.0){
//        	return 90.0;
//        }
//        
//        if(uv_t.y < 0.0){
//        	return -90.0;
//        }
//    }
//    
//    float angle;
//    angle = atan(uv_t.y, uv_t.x);
//    //convert to degrees
//    angle = degrees(angle);
//    
//    if(angle < 0.0){
//    	angle = 180.0 + (180.0 - abs(angle));
//    }
//    return angle;
//}
//
//void mainImage( out vec4 fragColor, in vec2 fragCoord )
//{
//	vec2 uv = fragCoord.xy / iResolution.xy;
//    float aspectRatio = iResolution.x / iResolution.y;
//    vec2 center = iMouse.xy / iResolution.xy;
//    uv.x *= aspectRatio;
//    center.x *= aspectRatio;    
//    vec3 color = vec3(1.0, 1.0, 0.0);
//    float radius = 0.32 * (sin(iGlobalTime) + 1.0) / 2.0;
//    
//    float noiseVal;
//    float angle = getUVAngleDeg(uv, center);
//    float arcLength = radians(angle) * radius;
//    float halfCircumference = (PI * (radius * 2.0)) / 2.0;
//    if(angle <= 180.0){
//    	noiseVal = cnoise(vec2(arcLength * 45.0, iGlobalTime * 10.0));
//    }else{
//        float leftOverArc = radians((angle - 180.0)) * radius; 
//    	noiseVal = cnoise(vec2((halfCircumference - leftOverArc) * 45.0, iGlobalTime * 10.0));
//    }
//    noiseVal *= 0.1;
//    vec2 closestPoint = center + (normalize(uv - center) * radius); 
//    vec2 uvToCenterDirVec = normalize(center - uv);
//    vec2 lightningPoint = closestPoint + (uvToCenterDirVec * noiseVal);
//    color *= (1.0/distance(lightningPoint, uv)) * 0.005;
//    
//	fragColor = vec4(color, 1.0);
//}