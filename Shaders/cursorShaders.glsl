//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

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

uniform vec2 iResolution;
uniform float clicked;
uniform vec2 mouseCoords;
uniform float iGlobalTime;
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
    
    vec2 mousecoords = mouseCoords / iResolution.xy;
    mousecoords.x *= aspectRatio;
    
    vec2 center = mousecoords;   
    vec4 color;
    color = vec4(1.0, 1.0, 0.0, 1.0) * (1.0/distance(uv, mousecoords)) * 0.003;
    
    if(clicked == 1.0){
        float noiseVal;
        float angle = getUVAngleDeg(uv, center);
        float arcLength = radians(angle) * radius;
        float halfCircumference = (PI * (radius * 2.0)) / 2.0;
        if(angle <= 180.0){
            noiseVal = cnoise(vec2(arcLength * 105.0, iGlobalTime / 4.0));
        }else{
            float leftOverArc = radians((angle - 180.0)) * radius; 
            noiseVal = cnoise(vec2((halfCircumference - leftOverArc) * 105.0, iGlobalTime / 4.0));
        }
        noiseVal *= 0.01;
        vec2 closestPoint = center + (normalize(uv - center) * radius); 
        vec2 uvToCenterDirVec = normalize(center - uv);
        vec2 lightningPoint = closestPoint + (uvToCenterDirVec * noiseVal);
        color += vec4(1.0, 1.0, 0.0, 1.0) * (1.0/distance(lightningPoint, uv)) * 0.002;
    }
    gl_FragColor = color;
}