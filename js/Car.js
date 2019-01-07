

// Useful link: https://stemkoski.github.io/Three.js/Color-Explorer.html

function Car(angle=0){

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

	this.lights = [];

	var body_geometry = new THREE.BoxGeometry(this.body_width, this.body_height, this.body_length, 1, 1, 1);
	var body_material = new THREE.MeshPhongMaterial({color: Colors.red});
	this.body_mesh = new THREE.Mesh(body_geometry, body_material);


	// HEADLIGHT DESIGN
	// =================
	// Add headlights
	var headlight_geometry = new THREE.BoxGeometry(this.headlight_width, this.headlight_height, 1, 1, 1, 1);
	var headlight_material = new THREE.MeshStandardMaterial({
			color: Colors.yellow, 
			shading: THREE.FlatShading,
			emissive: 0xfbffca
	});
	var taillight_material = new THREE.MeshStandardMaterial({
			color: Colors.yellow, 
			shading: THREE.FlatShading,
			emissive: 0xd93535,
			specular: 0xffffff
	});
	
	this.left_headlight_mesh = new THREE.Mesh(headlight_geometry, headlight_material);
	this.right_headlight_mesh = new THREE.Mesh(headlight_geometry, headlight_material);

	this.left_taillight_mesh = new THREE.Mesh(headlight_geometry, taillight_material);
	this.right_taillight_mesh = new THREE.Mesh(headlight_geometry, taillight_material);

	var headlight_horizontal_offset = this.body_width/2 - this.headlight_width/2 - this.headlight_inset;

	this.left_headlight_mesh.position.x = -headlight_horizontal_offset;
	this.right_headlight_mesh.position.x = headlight_horizontal_offset;
	this.left_taillight_mesh.position.x = -headlight_horizontal_offset;
	this.right_taillight_mesh.position.x = headlight_horizontal_offset;

	this.left_headlight_mesh.position.z = -this.body_length/2;
	this.right_headlight_mesh.position.z = -this.body_length/2;
	this.left_taillight_mesh.position.z = this.body_length/2;
	this.right_taillight_mesh.position.z = this.body_length/2;

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
	this.left_headlight_target = new THREE.Mesh(new THREE.BoxBufferGeometry(2,2,2), new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent:true, opacity:0} ));
	this.right_headlight_target = new THREE.Mesh(new THREE.BoxBufferGeometry(2,2,2), new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity:0} ));

	this.left_headlight_target.position.x = this.left_headlight_mesh.position.x;
	this.left_headlight_target.position.z = this.left_headlight_mesh.position.z - this.body_length/2;
	this.left_headlight_target.position.y = this.left_headlight_mesh.position.y - 2*this.body_height;

	this.right_headlight_target.position.x = this.right_headlight_mesh.position.x;
	this.right_headlight_target.position.z = this.right_headlight_mesh.position.z - this.body_length/2;
	this.right_headlight_target.position.y = this.right_headlight_mesh.position.y - 2*this.body_height;

	// Adding spotlights
	var light_angle = Math.PI/8;

	this.left_headlight = new THREE.SpotLight(0xffffff);
	this.right_headlight = new THREE.SpotLight(0xffffff);

	this.left_headlight.angle = light_angle;

	this.left_headlight.castShadow = true;
	this.left_headlight.shadow.mapSize.width = 256;
	this.left_headlight.shadow.mapSize.height = 256;
	this.left_headlight.shadow.camera.near = 1;
	this.left_headlight.shadow.camera.far = 3000;
	this.left_headlight.shadow.camera.fov = 30;

	this.right_headlight.angle = light_angle;

	this.right_headlight.castShadow = true;
	this.right_headlight.shadow.mapSize.width = 256;
	this.right_headlight.shadow.mapSize.height = 256;
	this.right_headlight.shadow.camera.near = 1;
	this.right_headlight.shadow.camera.far = 3000;
	this.right_headlight.shadow.camera.fov = 30;


	// Spotlight Helper for visual aid while developing
	// this.spotLightHelper = new THREE.SpotLightHelper( this.right_headlight );
	// this.lights.push( this.spotLightHelper );


	// ADDING FINALIZED LIGHTS
	this.lights.push(this.left_headlight);
	this.lights.push(this.left_headlight_target);
	
	this.lights.push(this.right_headlight);
	this.lights.push(this.right_headlight_target);


	// ADDING FINALIZED MESHES
	// Add meshes to Car mesh
	this.mesh.add(this.body_mesh);

	this.mesh.add(this.left_headlight_mesh);
	this.mesh.add(this.left_headlight_target); 

	this.mesh.add(this.right_headlight_mesh);
	this.mesh.add(this.right_headlight_target);

	this.mesh.add(this.left_taillight_mesh);
	this.mesh.add(this.right_taillight_mesh);

	this.mesh.add(cockpit_glass_mesh);
	this.mesh.add(cockpit_border_mesh);

	this.mesh.add(this.wheel_mesh_array[0]);
	this.mesh.add(this.wheel_mesh_array[1]);
	this.mesh.add(this.wheel_mesh_array[2]);
	this.mesh.add(this.wheel_mesh_array[3]);

	this.body_mesh.castShadow=true;
	this.body_mesh.receiveShadow=true;

	// Set angle function
	this.set_angle = function(angle){
		this.angle = angle;
	}


	// Update function to be called once per frame
	this.update = function(){

		this.mesh.rotation.y = this.angle;

		// Headlight position update
		// this.spotLightHelper.update(); 

		var target_distance = this.body_length/2;

		this.left_headlight_target.position.setFromMatrixPosition(this.left_headlight_mesh.matrixWorld);
		this.left_headlight_target.position.y = this.left_headlight_mesh.position.y - 4*this.body_height;
		this.left_headlight_target.position.x -= target_distance*Math.sin(this.angle);
		this.left_headlight_target.position.z -= target_distance + target_distance*Math.cos(this.angle);

		this.right_headlight_target.position.setFromMatrixPosition(this.right_headlight_mesh.matrixWorld);
		this.right_headlight_target.position.y = this.right_headlight_mesh.position.y - 4*this.body_height;
		this.right_headlight_target.position.x -= target_distance*Math.sin(this.angle);
		this.right_headlight_target.position.z -= target_distance + target_distance*Math.cos(this.angle);

		this.left_headlight.position.setFromMatrixPosition(this.left_headlight_mesh.matrixWorld);
		this.left_headlight.position.z -= 10;
		this.right_headlight.position.setFromMatrixPosition(this.right_headlight_mesh.matrixWorld);
		this.right_headlight.position.z -= 10;

		this.left_headlight.target = this.left_headlight_target;
		this.right_headlight.target = this.right_headlight_target;
	}


}