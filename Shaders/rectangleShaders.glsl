//VERTEX SHADER
attribute vec2 vertexPosition;

void main(){
   gl_Position = vec4(vertexPosition, 0.0, 1.0);
}

//FRAGMENT SHADER
precision mediump float;

uniform vec4 color;

void main()
{
    gl_FragColor = color;
}