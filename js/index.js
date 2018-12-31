
window.addEventListener('load', init, false);

function init(){

	// set up scene, camera, renderer
	create_scene();

	// set up lighting
	create_lights();

	// add objects
	create_character();
	create_environment();

	// start game loop
	game_loop();

	
}

// Global variables
var scene, field_of_view, aspect_ratio, near_plane, far_plane, HEIGHT, WIDTH, renderer, container;
var hemisphere_light, shadow_light;
var road, sky;

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

function create_scene(){

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	// Add fog effect
	scene.fog = new THREE.Fog(0x8DA593, 200, 1100);

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
	hemisphere_light = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.5);
	scene.add(hemisphere_light);


	// Create directional light
	shadow_light = new THREE.DirectionalLight(0xffffff, 0.4);
	
	// Set light direction
	shadow_light.position.set(150, 350, 350);

	shadow_light.shadow.camera.left = -400;
	shadow_light.shadow.camera.right = 400;
	shadow_light.shadow.camera.bottom = -400;
	shadow_light.shadow.camera.top = 400;
	shadow_light.shadow.camera.near = 1;
	shadow_light.shadow.camera.far = 1000;
	shadow_light.shadow.mapSize.width = 2048;
	shadow_light.shadow.mapSize.height = 2048;

	scene.add(shadow_light);

	// Shadow light helper
	// var helper = new THREE.DirectionalLightHelper( shadow_light, 10 );
	// scene.add( helper );

}

function create_character(angle=70, world_radius=600){

	car = new Car();
	var car_scale = 1;
	var curve_offset = 1.5;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	
	// Calculate position depending on angle using trigonometry
	car.mesh.position.z = Math.cos(angle* Math.PI / 180)*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(angle* Math.PI / 180)*(world_radius + car.ground_offset - curve_offset) - 600;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;
	console.log(slope);

	car.mesh.rotation.x = Math.atan(slope) + Math.PI/2;

	scene.add(car.mesh);
}

function create_environment(world_radius=600, world_width=400){

	road = new Road(world_radius, world_width);
	road.mesh.position.y = -world_radius;
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

	// Back wheel rotation animation
	car.wheel_mesh_array[0].rotation.x -= 0.08;
	car.wheel_mesh_array[1].rotation.x -= 0.08;	

	// Front wheel rotation animation
	car.wheel_mesh_array[2].rotation.x -= 0.08;
	car.wheel_mesh_array[3].rotation.x -= 0.08;	

	renderer.render(scene, camera);
}






function Road(radius=600, height=800, radial_segments=100, height_segments=10){

	var geometry = new THREE.CylinderGeometry( radius, radius, height, radial_segments, height_segments );	

	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI/2));

	var material = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		transparent: false,
		opacity: 0.8,
		flatShading:THREE.FlatShading
	});

	this.mesh = new THREE.Mesh(geometry, material);
	this.mesh.receiveShadow = true;
}


function Cloud(min_clouds=5, n_cloud_spread=3){

	// Create empty container to hold parts of cloud
	this.mesh = new THREE.Object3D();

	// Create cube geometry 
	var geometry = new THREE.BoxGeometry(20, 20, 20);

	// Create a material
	var material = new THREE.MeshPhongMaterial({
		color: Colors.white,
	});

	// Create random number of small cubes positioned and oriented randomly
	var n_blocs = min_clouds + Math.floor(Math.random() * n_cloud_spread);

	for(var i = 0; i < n_blocs; i++){

		var m = new THREE.Mesh(geometry, material);

		m.position.x = i*15*0.8;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10 - 5;

		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;

		// set size of cube randomly
		var s = 0.1 + Math.random()*0.5 + 0.1*(n_blocs/2 -Math.pow((i-n_blocs/2), 2)/n_blocs);
		m.scale.set(s, s, s);

		// allow casting and receiving of shadows
		m.castShadow = true;
		m.receiveShadow = true;

		// add cube to container
		this.mesh.add(m);
	}
}


// Cloud spawner and positioner
function Sky(n_clouds=20, cloud_height=1000, horizontal_spread=800, vertical_spread=200){

	// Create an empty container
	this.mesh = new THREE.Object3D();

	// Number of clouds in sky
	this.n_clouds = n_clouds;

	// Step angle to distribute clouds in sky
	var step_angle = Math.PI*2 / this.n_clouds;

	for(var i=0; i < this.n_clouds; i++){
		var c = new Cloud(5, 5);

		var a = step_angle*i; // final angle of the cloud
		var h = cloud_height + Math.random()*vertical_spread;

		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.z = Math.cos(a)*h;

		c.mesh.rotation.x = a + Math.PI/2;
		c.mesh.rotation.z = Math.random()*Math.PI/8;

		// Horizontal cloud spread
		c.mesh.position.x = -horizontal_spread + Math.random()*horizontal_spread*2;

		// Randomly scale each cloud
		var s = 1 + Math.random()*2;
		c.mesh.scale.set(s, s, s);
 
		// Add cloud to main mesh container
		c.mesh.castShadow = true;
		this.mesh.add(c.mesh);
	}
}

function Car(){

	this.mesh = new THREE.Object3D();

	this.wheel_radius = 30;
	this.wheel_thickness = 15;
	this.body_width = 50;	
	this.body_height = 20;
	this.body_length = 100;

	this.cockpit_height = 60;
	this.cockpit_bevel = 10;

	this.ground_offset = this.body_height/2 + this.wheel_radius/2;

	var body_geometry = new THREE.BoxGeometry(this.body_width, this.body_height, this.body_length, 1, 1, 1);
	var body_material = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading});
	var body_mesh = new THREE.Mesh(body_geometry, body_material);


	// Cockpit extrusion shapes
	var cockpit_shape = new THREE.Shape();
	cockpit_shape.moveTo( 0,0 );
	cockpit_shape.lineTo( 0, this.body_length/2);
	cockpit_shape.lineTo( this.body_width - this.cockpit_bevel, this.body_length/2 );
	cockpit_shape.lineTo( this.body_width - this.cockpit_bevel, 0 );
	cockpit_shape.lineTo( 0, 0 );

	var longitudinal_extrusion = new THREE.Shape();
	longitudinal_extrusion.moveTo( 5 ,-40 );
	longitudinal_extrusion.lineTo( 5 , this.body_length/2 + 40);
	longitudinal_extrusion.lineTo( this.body_width - 5 - this.cockpit_bevel, this.body_length/2 + 40 );
	longitudinal_extrusion.lineTo( this.body_width - 5 - this.cockpit_bevel, -40 );
	longitudinal_extrusion.lineTo( 5, -40 );

	var horizontal_extrusion = new THREE.Shape();
	horizontal_extrusion.moveTo( -40 ,5 );
	horizontal_extrusion.lineTo( -40, this.body_length/2 - 5 );
	horizontal_extrusion.lineTo( this.body_width + 20 - this.cockpit_bevel, this.body_length/2 - 5 );
	horizontal_extrusion.lineTo( this.body_width + 20 - this.cockpit_bevel, 5 );
	horizontal_extrusion.lineTo( -40, 5 );

	

	var cockpit_material = new THREE.MeshPhongMaterial( { 
		color: Colors.white,
		transparent: true,
		opacity: 0.8,
		flatShading:THREE.FlatShading 
	} );

	// Extrusion settings
	var cockpit_extrude_settings = {
		steps: 2,
		depth: 1,
		bevelEnabled: true,
		bevelThickness: this.cockpit_height,
		bevelSize: this.cockpit_bevel/2,
		bevelSegments: 1
	};

	var cockpit_extrusion_geometry_settings = {
		steps: 1,
		depth: 5,
		bevelEnabled: true,
		bevelThickness: this.cockpit_height - 6,
		bevelSize: this.cockpit_bevel/2 ,
		bevelSegments: 1
	};

	var cockpit_geometry = new THREE.ExtrudeGeometry( cockpit_shape, cockpit_extrude_settings );
	var cockpit_extrusion_geometry_1 = new THREE.ExtrudeGeometry( longitudinal_extrusion, cockpit_extrusion_geometry_settings );
	var cockpit_extrusion_geometry_2 = new THREE.ExtrudeGeometry( horizontal_extrusion, cockpit_extrusion_geometry_settings );

	var cockpit_mesh = new THREE.Mesh( cockpit_geometry, cockpit_material ) ;
	var cockpit_extrusion_mesh_1 = new THREE.Mesh( cockpit_extrusion_geometry_1, cockpit_material ) ;
	var cockpit_extrusion_mesh_2 = new THREE.Mesh(cockpit_extrusion_geometry_2, cockpit_material);

	var intersection_geometry = new THREE.BoxGeometry(this.body_width*3, this.cockpit_height*2, this.body_length*3, 1, 1, 1);

	intersection_geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, -this.cockpit_height, 0) );

	var object = new THREE.Mesh( intersection_geometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
	var box = new THREE.BoxHelper( object, 0xffff00 );
	this.mesh.add( box );

	var object2 = new THREE.Mesh( cockpit_extrusion_mesh_2.geometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
	var box2 = new THREE.BoxHelper( object2, 0xffff00 );
	this.mesh.add( box2 );

	var c1 = THREE.CSG.toCSG(cockpit_mesh.geometry);
	var c2 = THREE.CSG.toCSG(cockpit_extrusion_mesh_1.geometry);
	var c3 = THREE.CSG.toCSG(cockpit_extrusion_mesh_2.geometry);
	var c4 = THREE.CSG.toCSG(intersection_geometry);

	var cockpit_border_geometry = c1.subtract(c2);
	cockpit_border_geometry = cockpit_border_geometry.subtract(c3);
	cockpit_border_geometry = cockpit_border_geometry.union(c4);
	var cockpit_border_mesh = new THREE.Mesh(THREE.CSG.fromCSG( cockpit_border_geometry ), body_material) 
 	
	
	cockpit_mesh.scale.set(0.9,0.9,0.9);
	cockpit_mesh.rotation.x = Math.PI/2;

	cockpit_mesh.position.x = -(this.body_width - this.cockpit_bevel)/2 + 2;
	cockpit_mesh.position.z = -this.body_length/4 + 3;
	cockpit_mesh.position.y = this.body_height/2;

	cockpit_border_mesh.rotation.x = Math.PI/2;

	cockpit_border_mesh.position.x = -(this.body_width - this.cockpit_bevel)/2;
	cockpit_border_mesh.position.z = -this.body_length/4;
	cockpit_border_mesh.position.y = this.body_height/2;

	
	

	var radial_segments = 15;
	var height_segments = 10;

	this.wheel_mesh_array = [];
	for(var i = 0; i < 4; i++){
		var wheel_geometry = new THREE.CylinderGeometry( this.wheel_radius/2, this.wheel_radius/2, this.wheel_thickness, radial_segments, height_segments);
		var wheel_material = new THREE.MeshPhongMaterial({color: Colors.white, shading:THREE.FlatShading});
		var wheel_mesh = new THREE.Mesh(wheel_geometry, wheel_material);
		
		wheel_mesh.rotation.z = Math.PI/2;
		wheel_mesh.position.y = -this.body_height/2;

		this.wheel_mesh_array.push(wheel_mesh);
	}
	
	var longitudinal_position = this.body_length/2 - this.wheel_radius/2;
	var horizontal_position = this.body_width/2 + this.wheel_thickness/2;

	this.wheel_mesh_array[0].position.z = longitudinal_position;
	this.wheel_mesh_array[0].position.x = horizontal_position;

	this.wheel_mesh_array[1].position.z = longitudinal_position;
	this.wheel_mesh_array[1].position.x = -horizontal_position;
	
	this.wheel_mesh_array[2].position.z = -longitudinal_position;
	this.wheel_mesh_array[2].position.x = -horizontal_position;
	
	this.wheel_mesh_array[3].position.z = -longitudinal_position;
	this.wheel_mesh_array[3].position.x = horizontal_position;
	
	

	this.mesh.add(body_mesh);
	this.mesh.add(cockpit_mesh)
	this.mesh.add(cockpit_mesh);
	this.mesh.add(cockpit_border_mesh);

	this.mesh.add(this.wheel_mesh_array[0]);
	this.mesh.add(this.wheel_mesh_array[1]);
	this.mesh.add(this.wheel_mesh_array[2]);
	this.mesh.add(this.wheel_mesh_array[3]);

}