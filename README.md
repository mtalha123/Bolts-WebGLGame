# Bolts - A WebGL Game
Bolts is an arcade-style browser-based game coded completely in WebGL (and GLSL for the shading language). It can be played at the URL: https://mtalha123.github.io/Bolts/

## Some Notes
Due to the fact that this game had many shader files and other assets, it became necessary to seperate the shader code and assets into their own files (rather than embedding shader code in html for example). However, when making an XMLHttpRequest in Javascript, it cannot access the local file system for security reasons. So, I found it better to simply run a local web server on port 5000 from which all files could be served. The web server I decided to use for this was Nginx as it is lightweight, powerful and easy to set up. The Nginx configuration file is located in the repository. However, any web server will work as long as it's using port 5000 (this is the port I reference in loading assets, so to change this to another port make sure to change AssetManager accordingly).
