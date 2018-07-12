//VERTEX SHADER
precision mediump float;

uniform vec2 iResolution;
uniform float aspectRatio;
uniform vec2 center;
uniform float radius;

varying vec2 centerUV;
varying float radiusUV;

attribute vec2 vertexPosition;

void main(){
    // FOR FRAGMENT SHADER --------------------------------
    
    //normalize
    centerUV = center.xy / iResolution.xy;
    radiusUV = radius / iResolution.y;
    
    //take aspect ratio into account
    centerUV.x *= aspectRatio;
    
    // ----------------------------------------------------
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}



//FRAGMENT SHADER
precision mediump float;

float tentacleCos(float value, float lengthOfLightning){
    return (-cos( ((2.0 * PI) / (lengthOfLightning * 1.5)) * value) + 1.0) / 2.0;
}

//used to give more tentacle-like look
float tentacleCos2(float value, float lengthOfLightning){
    return (-cos( ((2.0 * PI) / (lengthOfLightning * 1.5)) * (value + (lengthOfLightning / 2.0))) + 1.0) / 2.0;
}

float genTentacleAndGetDist(vec2 uv, vec2 start, vec2 end, float tentacleWidth, float fluctuation, float iGlobalTime, sampler2D noise){
    float angle = atan(end.y - start.y, end.x - start.x);
    angle *= (-1.0);
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    float tentacleLength = distance(start, end);

    vec2 uv_t = (uv - start) * rotationMatrix;

    float xClamped = clamp(uv_t.x, 0.0, tentacleLength);
    float yNoiseVal = map(0.0, 1.0, -1.0, 1.0, texture2D(noise, vec2(xClamped, iGlobalTime / 2048.0)).r) * fluctuation * tentacleCos(xClamped, tentacleLength);
    float tentacleWidthDampened = tentacleWidth * pow(tentacleCos2(xClamped, tentacleLength), 5.0);
    vec2 pointOnLightning = vec2(xClamped, clamp(uv_t.y, yNoiseVal - tentacleWidthDampened, yNoiseVal + tentacleWidthDampened));
    return distance(uv_t, pointOnLightning);
}

uniform vec2 iResolution;
uniform float aspectRatio;
uniform float iGlobalTime;
uniform sampler2D noise;
uniform vec4 yellowColorPrefs;
uniform vec4 tentaclesToShow;
uniform vec4 completionsForTentacleGrabs;
uniform vec2 tentaclesGrabPositions[4];
float tentacleLength = 0.09;
float numTentacles = 4.0;
float fluctuation = 0.02;

varying vec2 centerUV;
varying float radiusUV;


vec3 getTentacleColourContrib(vec2 uv, vec2 center, float radius, float closestAngleMultiple, float completion, vec2 tentacleGrabPos, float aspectRatio, vec3 color){
    vec2 tentacleStart = rotateCoord(vec2(center.x + radius, center.y), closestAngleMultiple, center);
    vec2 tentacleEnd;

    if(completion > 0.0){
        //NOTE: tentacleGrabPos wasn't normalized or transformed for aspect ratio to increase efficiency. Therefore, its
        //done now.
        vec2 tentacleGrabPos = tentacleGrabPos.xy / iResolution.xy;
        tentacleGrabPos.x *= aspectRatio;
        tentacleEnd = tentacleStart + ((tentacleGrabPos - tentacleStart) * completion);
        
        //since uv is rotated, need to orient tentacleEnd too. This is needed because tentacleGrabPos is coming
        //from outside and to get positioning to match, need to orient it to match uv's rotation
        tentacleEnd = rotateCoord(tentacleEnd, -(PI / 4.0), center);
    }else{
        tentacleEnd = rotateCoord(vec2(center.x + radius + tentacleLength, center.y), closestAngleMultiple, center);
    }

    float dist = genTentacleAndGetDist(uv, tentacleStart, tentacleEnd, 0.001, fluctuation, iGlobalTime, noise);    

    return (1.0 / dist) * color * 0.003;
}


void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= aspectRatio;
    
    //orient tentacles
    uv = rotateCoord(uv, -(PI / 4.0), centerUV);
    
    vec3 color = vec3(1.0, 0.0, 0.0), finalColor;
    
    float angleMultipleDeg = 360.0 / numTentacles;
    float UVAngleDeg = getUVAngleDeg(uv, centerUV);
    float closestAngleMultiple = radians( getClosestMultiple(int(UVAngleDeg), int(angleMultipleDeg)) );
    float closestAngleMultipleDeg = degrees(closestAngleMultiple);
    
    if(closestAngleMultipleDeg == 0.0 || closestAngleMultipleDeg == 360.0){
        if(yellowColorPrefs.r == 1.0){
            color = vec3(1.0, 1.0, 0.0);   
        }
        
        if(tentaclesToShow.r == 1.0){
            finalColor = getTentacleColourContrib(uv, centerUV, radiusUV, closestAngleMultiple, completionsForTentacleGrabs.r, tentaclesGrabPositions[0], aspectRatio, color);
        }
    }else if(closestAngleMultipleDeg == 90.0){
        if(yellowColorPrefs.g == 1.0){
            color = vec3(1.0, 1.0, 0.0);   
        }
        
        if(tentaclesToShow.g == 1.0){
            finalColor = getTentacleColourContrib(uv, centerUV, radiusUV, closestAngleMultiple, completionsForTentacleGrabs.g, tentaclesGrabPositions[1], aspectRatio, color);
        }
    }else if(closestAngleMultipleDeg == 180.0){
        if(yellowColorPrefs.b == 1.0){
            color = vec3(1.0, 1.0, 0.0);   
        }
        
        if(tentaclesToShow.b == 1.0){
            finalColor = getTentacleColourContrib(uv, centerUV, radiusUV, closestAngleMultiple, completionsForTentacleGrabs.b, tentaclesGrabPositions[2], aspectRatio, color);
        }
    }else if(closestAngleMultipleDeg == 270.0){
        if(yellowColorPrefs.a == 1.0){
            color = vec3(1.0, 1.0, 0.0);   
        }
        
        if(tentaclesToShow.a == 1.0){
           finalColor = getTentacleColourContrib(uv, centerUV, radiusUV, closestAngleMultiple, completionsForTentacleGrabs.a, tentaclesGrabPositions[3], aspectRatio, color);
        }
    } 
    
    //make circle rim glow
    float distToCircleEdge = distance( centerUV + (normalize(uv - centerUV) * (radiusUV)), uv);     
    finalColor += (1.0 / distToCircleEdge) * color * 0.004;

    //makes circle solid
    if(distance(centerUV, uv) <= radiusUV){
        finalColor = color;
    }
    
    //drops off glow faster
    finalColor = vec3( pow(finalColor.r, 3.8), pow(finalColor.g, 3.8), pow(finalColor.b, 3.8) );
    
	gl_FragColor = vec4(finalColor, 1.0);
}