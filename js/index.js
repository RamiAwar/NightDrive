


var scene = new THREE.Scene();

// Param1 : Degrees field of view
// Param2 : Aspect ratio - width / height to get unscaled image
// Param3,4 : Near/Far clipping plane - normal: 0.1, 1000 
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();

// Size at which to render app - for performance intensive set to smaller size, i.e. lower res
renderer.setSize(window.innerWidth, window.innerHeight);

// Add renderer element to HTML document (simply a canvas element)
document.body.appendChild(renderer.domElement);


// Update viewport on window resize
window.addEventListener('resize', function(){

	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

});

// Controls implementation
controls = new THREE.OrbitControls(camera, renderer.domElement);



// Create shape
var geometry = new THREE.BoxGeometry(1, 1, 1);

// PHONG vs LAMBERT vs BLINN

// Create MeshBasicMaterial for each face of the cube
var cubeMaterials = [
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}), // RIGHT
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}), // LEFT
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}), // TOP
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}), // BOTTOM
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}), // FRONT
	new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('img/cube/1.jpg'), side: THREE.DoubleSide}) // BACK
];

var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );

// var cube = new THREE.Mesh(geometry, material);
var cube = new THREE.Mesh(geometry, cubeMaterials);

scene.add(cube);

camera.position.z = 3




// Lighting 
// =========
// Ambient Light
// var light = new THREE.AmbientLight( 0x404040, 3.0 ); // soft white light
// scene.add(light);

// Directional Light
// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
// directionalLight.position.set(1, 9, 1);
// scene.add(directionalLight)

// Point Light
var pointLight = new THREE.PointLight(0x404040, 3, 50);
pointLight.position.set(3, 1, 3);
scene.add(pointLight);


// Game loop
var update = function(){

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
}


// Draw loop
var render = function(){
	

	renderer.render(scene, camera);

}


// Main loop
var main = function(){

	requestAnimationFrame(main);

	update();
	render();

}

main();