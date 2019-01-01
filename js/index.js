






// Global variables
var scene, field_of_view, aspect_ratio, near_plane, far_plane, HEIGHT, WIDTH, renderer, container;
var hemisphere_light, shadow_light;
var road, sky;
var mouse = {x:0, y:0};
var context;


window.addEventListener('load', init, false);


function init(){

	context = new AudioContext();
	

	// set up scene, camera, renderer
	create_scene();

	// set up lighting
	create_lights();

	// add objects
	create_character(0);
	create_environment();

	// Input handler
	document.addEventListener('mousemove', input_handler, false);

	// start game loop
	game_loop();


	
}




function create_scene(){

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	// Add fog effect
	scene.fog = new THREE.Fog(Colors.fog, 100, 1100);

	// Create camera
	aspect_ratio = WIDTH/HEIGHT;
	field_of_view = 60; // degrees
	near_plane = 1;
	far_plane = 10000;
	camera = new THREE.PerspectiveCamera(
		field_of_view, 
		aspect_ratio, 
		near_plane, 
		far_plane
	);

	camera.position.x = 0;
	camera.position.z = 400;
	camera.position.y = 0;

	renderer = new THREE.WebGLRenderer({
		// Allow transparency to show gradient css background
		alpha:true,

		// Enable anti-aliasing
		antialias: true 
	});

	// Fill entire screen
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

	// Attach variable to DOM element
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);


	// Change renderer and camera properties upon resize to prevent unwanted scaling effects
	window.addEventListener('resize', function(){
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}, false);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.lookAt(0, 0, -200);

}


function create_lights(){

	// Create hemisphere light
	hemisphere_light = new THREE.HemisphereLight(0xffffff, Colors.blue, 0.1);
	scene.add(hemisphere_light);


	ambientLight = new THREE.AmbientLight(0xcc907e, .4);
	scene.add(ambientLight);

	// Create spotlight
	shadow_light = new THREE.SpotLight(0xffffff, 0.2);
	

	// Set light direction
	shadow_light.position.set(0, 800, 800);
	
	shadow_light.castShadow=true;
	shadow_light.shadowDarkness = 0.5;



	shadow_light.shadow.camera.left = -1000;
	shadow_light.shadow.camera.right = 1000;
	shadow_light.shadow.camera.bottom = -1000;
	shadow_light.shadow.camera.top = 1000;
	shadow_light.shadow.camera.near = 1;
	shadow_light.shadow.camera.far = 2000;
	shadow_light.shadow.mapSize.width = 2048;
	shadow_light.shadow.mapSize.height = 2048;
	shadow_light.shadowCameraVisible = true;

	shadow_light.target.position.set( 0, 50, 100 );

	scene.add(shadow_light);

	// Shadow light helper
	// var helper = new THREE.SpotLightHelper( shadow_light, 50 );
	// scene.add( helper );

}



function create_character(angle=0, world_angle=60, world_radius=600){

	car = new Car(angle);

	// Add car lights to scene
	for(var i = 0; i < car.lights.length; i++){
		scene.add(car.lights[i]);
	}

	var car_scale = 1;
	var curve_offset = 1;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	// Calculate position depending on world_angle using trigonometry
	car.mesh.position.z = Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset) - 600;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;
	console.log(slope);

	car.mesh.rotation.x = Math.atan(slope) + Math.PI/2;
	car.mesh.castShadow=true;
	car.mesh.receiveShadow = true;
	scene.add(car.mesh);

	var listener = new THREE.AudioListener();
	camera.add( listener );

	// var sound = new THREE.Audio(listener);
	// var audioLoader = new THREE.AudioLoader();
	// audioLoader.load( 'sounds/engine_loop.ogg', function( buffer ) {
	// 	sound.setBuffer( buffer );
	// 	sound.setLoop(true);
	// 	sound.setVolume(0.2);
	// 	sound.play();
	// });
}



function create_environment(world_radius=600, world_width=400){

	road = new Road(world_radius, world_width);
	road.mesh.position.y = -world_radius;
	road.mesh.receiveShadow = true;
	scene.add(road.mesh);

	sky = new Sky(60, 900, 800, 50);
	sky.mesh.position.y = -world_radius;
	scene.add(sky.mesh);

	// cloud = new Cloud();
	// cloud.mesh.position.y = 200;
	// scene.add(cloud.mesh);

	// Debugger cube
	// var geometry = new THREE.BoxGeometry(1, 1, 1);
	// var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	// var cube = new THREE.Mesh(geometry, material);
	// scene.add(cube);

}



function game_loop(){

	requestAnimationFrame(game_loop);

	road.mesh.rotation.x += 0.01;
	sky.mesh.rotation.x += 0.003;

	// TODO: Combine these in a smart way (minimizing coupling)
	car.update();
	car_movement();

	renderer.render(scene, camera);
}

function input_handler(event){

	context.resume().then(() => {
	    console.log("ok")
	});

	// normalize mouse input value
	var x = (event.clientX/WIDTH)*2 - 1; // value between -1 and 1
	var y = (event.clientY/HEIGHT)*2 - 1;// value between -1 and 1

	mouse = {x:x, y:y};

}


function car_movement(){

	var target_x = map(mouse.x, -1, 1, -100, 100);
	var target_y = map(mouse.y, -1, 1, 25, 175);

	var error = target_x - car.mesh.position.x;

	car.mesh.position.x += error*0.05;


	car.wheel_mesh_array[2].rotation.y = -error*error*error*0.000001 + Math.PI;
	car.wheel_mesh_array[3].rotation.y = -error*error*error*0.000001;
	
	car.mesh.rotation.y = -(target_x - car.mesh.position.x)*0.002;
	
}











