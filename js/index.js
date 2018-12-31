
window.addEventListener('load', init, false);

function init(){

	// Add control GUI
	display_controls();

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
	black: 0x171a1c,
	yellow: 0xFDD235
};

function display_controls(){

	// function addControlGui(controlObject) {
	// 	var gui = new dat.GUI();
	// 	gui.add(controlObject, 'rotationSpeed', -0.01, 0.01);
	// 	gui.add(controlObject, 'opacity', 0.1, 1);
	// 	gui.addColor(controlObject, 'color');
	// }

	// control = new function() {
	// 	this.rotationSpeed = 0.005;
	// 	this.opacity = 0.6;
	// 	this.color = cubeMaterial.color.getHex();
	// };

	// addControlGui(control);

}

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

function deg2rad(angle){
	return angle*Math.PI/180;
}

function create_character(angle=20, world_angle=70, world_radius=600){

	car = new Car(angle);

	var car_scale = 1;
	var curve_offset = 1;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	// Calculate position depending on world_angle using trigonometry
	car.mesh.position.z = Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset) - 600;

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

	

	car.update();

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

function Car(angle=10){

	this.mesh = new THREE.Object3D();

	this.angle = angle;

	this.body_width = 50;	
	this.body_height = 10;
	this.body_length = 90;

	this.cockpit_height = 50;
	this.cockpit_bevel = 20;
	this.cockpit_length = this.body_length/5;
	this.cockpit_border_thickness = 3;

	this.wheel_radius = 15;
	this.wheel_thickness = 5;
	this.wheel_offset = -2;
	this.interwheel_distance = 2*this.body_length/5;

	this.rim_scale = 5;

	this.wheel_mesh_array = [];

	this.headlight_width = this.body_width/5;
	this.headlight_height = 2*this.body_height/5;
	this.headlight_inset = 3;

	this.left_headlight_target = new THREE.Object3D();
	this.right_headlight_target = new THREE.Object3D();

	this.ground_offset = this.body_height/2 + this.wheel_radius/2;

	this.left_headlight_mesh;
	this.right_headlight_mesh;

	var body_geometry = new THREE.BoxGeometry(this.body_width, this.body_height, this.body_length, 1, 1, 1);
	var body_material = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading});
	var body_mesh = new THREE.Mesh(body_geometry, body_material);


	// HEADLIGHT DESIGN
	// =================
	// Add headlights
	var headlight_geometry = new THREE.BoxGeometry(this.headlight_width, this.headlight_height, 1, 1, 1, 1);
	var headlight_material = new THREE.MeshPhongMaterial({color: Colors.yellow, shading: THREE.FlatShading});
	this.left_headlight_mesh = new THREE.Mesh(headlight_geometry, headlight_material);
	this.right_headlight_mesh = new THREE.Mesh(headlight_geometry, headlight_material);

	var headlight_horizontal_offset = this.body_width/2 - this.headlight_width/2 - this.headlight_inset;

	this.left_headlight_mesh.position.x = -headlight_horizontal_offset;
	this.right_headlight_mesh.position.x = headlight_horizontal_offset;

	this.left_headlight_mesh.position.z = -this.body_length/2;
	this.right_headlight_mesh.position.z = -this.body_length/2;

	// COCKPIT DESIGN
	// =========================

	// Cockpit extrusion shapes
	var cockpit_shape = new THREE.Shape();
	cockpit_shape.moveTo( 0,0 );
	cockpit_shape.lineTo( 0, this.cockpit_length);
	cockpit_shape.lineTo( this.body_width - this.cockpit_bevel, this.cockpit_length );
	cockpit_shape.lineTo( this.body_width - this.cockpit_bevel, 0 );
	cockpit_shape.lineTo( 0, 0 );

	var longitudinal_extrusion = new THREE.Shape();
	longitudinal_extrusion.moveTo( this.cockpit_border_thickness ,-40 );
	longitudinal_extrusion.lineTo( this.cockpit_border_thickness , this.cockpit_length + 40);
	longitudinal_extrusion.lineTo( this.body_width - this.cockpit_border_thickness - this.cockpit_bevel, this.cockpit_length + 40 );
	longitudinal_extrusion.lineTo( this.body_width - this.cockpit_border_thickness - this.cockpit_bevel, -40 );
	longitudinal_extrusion.lineTo( this.cockpit_border_thickness, -40 );

	var horizontal_extrusion = new THREE.Shape();
	horizontal_extrusion.moveTo( -40 ,this.cockpit_border_thickness );
	horizontal_extrusion.lineTo( -40, this.cockpit_length - this.cockpit_border_thickness );
	horizontal_extrusion.lineTo( this.body_width + 20 - this.cockpit_bevel, this.cockpit_length - this.cockpit_border_thickness );
	horizontal_extrusion.lineTo( this.body_width + 20 - this.cockpit_bevel, this.cockpit_border_thickness );
	horizontal_extrusion.lineTo( -40, this.cockpit_border_thickness );

	

	var cockpit_glass_material = new THREE.MeshPhongMaterial( { 
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
		bevelThickness: this.cockpit_height - 5,
		bevelSize: this.cockpit_bevel/2 ,
		bevelSegments: 1
	};

	// Create red cockpit that will become borders only
	var cockpit_geometry = new THREE.ExtrudeGeometry( cockpit_shape, cockpit_extrude_settings );
	var cockpit_extrusion_geometry_1 = new THREE.ExtrudeGeometry( longitudinal_extrusion, cockpit_extrusion_geometry_settings );
	var cockpit_extrusion_geometry_2 = new THREE.ExtrudeGeometry( horizontal_extrusion, cockpit_extrusion_geometry_settings );


	// Create glass cockpit mesh (slightly smaller than cockpit geometry, scale factor)
	var cockpit_glass_mesh = new THREE.Mesh( cockpit_geometry, cockpit_glass_material ) ;
	var cockpit_extrusion_mesh_1 = new THREE.Mesh( cockpit_extrusion_geometry_1, cockpit_glass_material ) ;
	var cockpit_extrusion_mesh_2 = new THREE.Mesh(cockpit_extrusion_geometry_2, cockpit_glass_material);


	// Cut out excess geometry from extrude
	var intersection_geometry = new THREE.BoxGeometry(this.cockpit_height*2, this.body_width*2, this.body_length, 1, 1, 1);
	intersection_geometry.applyMatrix( new THREE.Matrix4().makeTranslation(this.cockpit_height/2, this.body_width/2, this.body_length/2 ));


	// Helper objects (visual reference for development)
	// var object = new THREE.Mesh( intersection_geometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
	// var box = new THREE.BoxHelper( object, 0xffff00 );
	// this.mesh.add( box );

	// var object2 = new THREE.Mesh( cockpit_mesh.geometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
	// var box2 = new THREE.BoxHelper( object2, 0xffff00 );
	// this.mesh.add( box2 );


	// Geometry boolean operations to create boder geometry and cut out excess
	var c1 = THREE.CSG.toCSG(cockpit_glass_mesh.geometry);
	var c2 = THREE.CSG.toCSG(cockpit_extrusion_mesh_1.geometry);
	var c3 = THREE.CSG.toCSG(cockpit_extrusion_mesh_2.geometry);
	var c4 = THREE.CSG.toCSG(intersection_geometry);

	var cockpit_border_geometry = c1.subtract(c2);
	cockpit_border_geometry = cockpit_border_geometry.subtract(c3);
	cockpit_border_geometry = cockpit_border_geometry.subtract(c4);
	var cockpit_border_mesh = new THREE.Mesh(THREE.CSG.fromCSG( cockpit_border_geometry ), body_material) 
 	
 	var b1 = THREE.CSG.toCSG(cockpit_glass_mesh.geometry);
 	var cockpit_glass_geometry = b1.subtract(c4);
 	var cockpit_glass_mesh = new THREE.Mesh(THREE.CSG.fromCSG(cockpit_glass_geometry), cockpit_glass_material);
	

 	// Scale, rotation, position adjustments 
	cockpit_glass_mesh.scale.set(0.9,0.9,0.9);
	cockpit_glass_mesh.rotation.x = Math.PI/2;
	cockpit_glass_mesh.position.x = -(this.body_width - this.cockpit_bevel)/2 + 2;
	cockpit_glass_mesh.position.z = this.cockpit_length/4;
	cockpit_glass_mesh.position.y = this.body_height/2;

	cockpit_border_mesh.rotation.x = Math.PI/2;
	cockpit_border_mesh.position.x = -(this.body_width - this.cockpit_bevel)/2;
	cockpit_border_mesh.position.z = this.cockpit_length/4;
	cockpit_border_mesh.position.y = this.body_height/2;

	

	// WHEEL DESIGN
	// =============

	// Create wheels array
	var radial_segments = 15;
	var height_segments = 10;


	for(var i = 0; i < 4; i++){

		var wheel = new THREE.Object3D();

		var wheel_geometry = new THREE.CylinderGeometry( this.wheel_radius/2, this.wheel_radius/2, this.wheel_thickness, radial_segments, height_segments);
		var wheel_material = new THREE.MeshLambertMaterial({color: Colors.black, shading:THREE.FlatShading});
		var wheel_mesh = new THREE.Mesh(wheel_geometry, wheel_material);
		
		var rim_geometry = new THREE.CylinderGeometry(this.wheel_radius/this.rim_scale, this.wheel_radius/this.rim_scale, this.wheel_thickness+0.5, radial_segments, height_segments);
		var rim_material = new THREE.MeshLambertMaterial({color:Colors.white, shading: THREE.FlatShading});
		var rim_mesh = new THREE.Mesh(rim_geometry, rim_material);

		rim_mesh.position.y -= 0.5;

		wheel.add(wheel_mesh);
		wheel.add(rim_mesh);

		wheel.rotation.z = Math.PI/2;
		wheel.position.y = -this.body_height/2;

		this.wheel_mesh_array.push(wheel);

	}
	
	var longitudinal_position = this.interwheel_distance - this.wheel_radius/2;
	var horizontal_position = this.body_width/2 + this.wheel_thickness/2 + this.wheel_offset;

	this.wheel_mesh_array[0].position.z = longitudinal_position;
	this.wheel_mesh_array[0].position.x = horizontal_position;

	this.wheel_mesh_array[1].position.z = longitudinal_position;
	this.wheel_mesh_array[1].position.x = -horizontal_position;
	this.wheel_mesh_array[1].rotation.y = Math.PI;
	
	this.wheel_mesh_array[2].position.z = -longitudinal_position;
	this.wheel_mesh_array[2].position.x = -horizontal_position;
	this.wheel_mesh_array[2].rotation.y = Math.PI;

	this.wheel_mesh_array[3].position.z = -longitudinal_position;
	this.wheel_mesh_array[3].position.x = horizontal_position;

	
	
	

	// HEADLIGHT LIGHTING
	//===================

	// Headlight targets
	this.left_headlight_target = new THREE.Mesh(new THREE.BoxBufferGeometry(2,2,2), new THREE.MeshBasicMaterial( {color: 0x00ff00} ));
	this.right_headlight_target = new THREE.Mesh(new THREE.BoxBufferGeometry(2,2,2), new THREE.MeshBasicMaterial( {color: 0x00ff00} ));

	this.left_headlight_target.position.x = this.left_headlight_mesh.position.x;
	this.left_headlight_target.position.z = this.left_headlight_mesh.position.z - this.body_length/2;

	this.right_headlight_target.position.x = this.right_headlight_mesh.position.x;
	this.right_headlight_target.position.z = this.right_headlight_mesh.position.z - this.body_length/2;


	// Adding spotlights
	this.left_headlight = new THREE.SpotLight(0xffffff);
	// var right_headlight = new THREE.SpotLight(0xffffff);

	this.left_headlight.angle = Math.PI/12;

	this.left_headlight.castShadow = true;
	this.left_headlight.shadow.mapSize.width = 1024;
	this.left_headlight.shadow.mapSize.height = 1024;
	this.left_headlight.shadow.camera.near = 1;
	this.left_headlight.shadow.camera.far = 100;
	this.left_headlight.shadow.camera.fov = 30;


	// this.left_headlight.target = this.left_headlight_target;


	this.spotLightHelper = new THREE.SpotLightHelper( this.left_headlight );
	scene.add( this.spotLightHelper );


	

	// ADDING FINALIZED LIGHTS
	scene.add(this.left_headlight);
	scene.add(this.left_headlight_target);


	// ADDING FINALIZED MESHES
	// Add meshes to Car mesh
	this.mesh.add(body_mesh);

	this.mesh.add(this.left_headlight_mesh);
	this.mesh.add(this.right_headlight_mesh);
	this.mesh.add(this.left_headlight_target);
	this.mesh.add(this.right_headlight_target);

	this.mesh.add(cockpit_glass_mesh);
	this.mesh.add(cockpit_border_mesh);

	this.mesh.add(this.wheel_mesh_array[0]);
	this.mesh.add(this.wheel_mesh_array[1]);
	this.mesh.add(this.wheel_mesh_array[2]);
	this.mesh.add(this.wheel_mesh_array[3]);

	this.mesh.rotation.y = deg2rad(this.angle);


	this.update = function(){

		

		// Back wheel rotation animation
		this.wheel_mesh_array[0].rotation.x -= 0.08;
		this.wheel_mesh_array[1].rotation.x -= 0.08;	

		// Front wheel rotation animation
		this.wheel_mesh_array[2].rotation.x -= 0.08;
		this.wheel_mesh_array[3].rotation.x -= 0.08;	



		// Headlight position update
		this.spotLightHelper.update(); 
		
		this.left_headlight_target.position.z = this.left_headlight_mesh.position.z - this.body_length/2;
		this.left_headlight_target.position.x = this.left_headlight_mesh.position.x;

		this.right_headlight_target.position.z = this.right_headlight_mesh.position.z - this.body_length/2;
		this.right_headlight_target.position.x = this.right_headlight_mesh.position.x;

		this.left_headlight.position.set(
			this.mesh.position.x + this.left_headlight_mesh.position.x - this.body_width/2,
			this.mesh.position.y + this.left_headlight_mesh.position.y + 3*this.body_height/2,
			this.mesh.position.z + this.left_headlight_mesh.position.z + this.body_height
		);
		
		this.left_headlight.lookAt(
			this.mesh.position.x + this.left_headlight_target.position.x,
			this.mesh.position.y + this.left_headlight_target.position.y,
			this.mesh.position.z + this.left_headlight_target.position.z
		);
		 
	}


}



