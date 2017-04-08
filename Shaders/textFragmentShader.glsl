precision mediump float;

varying vec2 v_texCoord;

uniform vec2 iResolution;
uniform sampler2D fontTexture;
uniform vec3 textColor;

void main(){
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    vec4 texel = texture2D(fontTexture, v_texCoord);
    float distance = 1.0 - texel.a;
    float alpha = 1.0 - smoothstep(0.6, 0.7, distance);
    
    gl_FragColor = vec4(textColor, alpha);
}