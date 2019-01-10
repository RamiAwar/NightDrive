// Contains all elements of the environment (Clouds, sky, road)
var COLLIDERS_VISIBLE = false;


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
		// c.mesh.castShadow = true;
		this.mesh.add(c.mesh);
	}
}

function Tree(){

	this.mesh = new THREE.Object3D();

	var trunk_geometry = new THREE.ConeGeometry(10, 50, 5, 6);
	var trunk_material = new THREE.MeshPhongMaterial({color: Colors.brown, shading:THREE.FlatShading});
	var trunk = new THREE.Mesh(trunk_geometry, trunk_material);

	trunk.castShadow=true;
	trunk.receiveShadow=false;
	trunk.position.y = -5;

	this.mesh.add(trunk);

	var radius = 35;
	var height = 50;

	var radial_segments = 6;
	var height_segments = 5;

	var n_layers = 4 + Math.floor(Math.floor(Math.random()*2));
	var random_color = Colors.green;

	for(var i = 1; i < n_layers; i++){
		
		var instance_radius = -7*i + 40;
		var instance_height = -4*i + 40;

		if(Math.random() < i*0.2){
			random_color = Colors.white;
		}

		var cone_geometry = new THREE.ConeGeometry(instance_radius, instance_height, radial_segments, height_segments);
		var cone_material = new THREE.MeshPhongMaterial({color: random_color, shading:THREE.FlatShading});

		var cone = new THREE.Mesh(cone_geometry, cone_material);

		cone.castShadow = true;
		cone.receiveShadow = false;

		cone.position.y = 14*(i-1);
		
		this.mesh.add(cone);

	}

	var t = 0;
	if(COLLIDERS_VISIBLE) t = 1; 
	this.collision_box = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height), 
								new THREE.MeshBasicMaterial({
									transparent: true,
									opacity: t,
									color: 0x00ff00
								}));

	// Add collision box to main mesh
	this.mesh.add(this.collision_box);

}

function Collectable(size=20, offset=10){

	this.size = size;

	var box_geometry = new THREE.BoxGeometry(size, size, size);

	var map;
	var textures = ['textures/gift/cubes.jpg', 'textures/gift/snowflakes.jpg', 'textures/gift/trees.jpg'];
	var n_rand = Math.random();
	var n_maps = textures.length;

	for(var i = 0; i < n_maps; i++){
	
		if(n_rand > (1/n_maps)*i && n_rand < (1/n_maps)*(i+1)){
			map = new THREE.TextureLoader().load(textures[i]);
		}
	}
	

	var side_material = new THREE.MeshBasicMaterial({
		map: map, 
		color: 0xffffff,
		shading: THREE.FlatShading, 
		side: THREE.DoubleSide
	});

	var cube_materials = [
		side_material, // RIGHT
		side_material, // LEFT
		side_material, // TOP
		side_material, // BOTTOM
		side_material, // FRONT
		side_material // BACK
	];

	var t = 0;
	if(COLLIDERS_VISIBLE) t = 1; 
	this.collision_box = new THREE.Mesh(new THREE.BoxGeometry(size + offset, size + offset, size+offset), 
								new THREE.MeshBasicMaterial({
									transparent: true,
									opacity: t,
									color: 0x00ff00
								}));

	this.mesh = new THREE.Mesh(box_geometry, cube_materials);
	this.mesh.castShadow = true;

}


function Road(spawn=false, radius=600, height=800, radial_segments=100, height_segments=10, num_obstacles=20){

	this.mesh = new THREE.Object3D();
	this.angular_speed = 0.011;
	this.ground_offset = 25;
	this.spawn = spawn;

	// TODO: Check weird bug in floor on game start, just below camera
	
	

	var geometry = new THREE.CylinderGeometry( radius, radius, height, radial_segments, height_segments );	

	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI/2));

	var material = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		transparent: false
	});

	var ground_mesh = new THREE.Mesh(geometry, material);
	ground_mesh.castShadow = true;
	ground_mesh.receiveShadow = true;
	this.mesh.add(ground_mesh);
	this.mesh.receiveShadow = true;

	this.obstacles = [];
	this.collectables = [];

	this.num_obstacles = num_obstacles;

	//TODO: (1) Method that initializes road with initial obstacles/collectables
	this.initialize = function(){

		for(var i = 0; i < this.num_obstacles; i++){

			var tree = new Tree();
			var angle = i*Math.PI*2/this.num_obstacles;
			

			tree.mesh.position.y = (radius + this.ground_offset)*Math.cos(angle); 
			tree.mesh.position.z = (radius + this.ground_offset)*Math.sin(angle);
			tree.mesh.position.x = Math.random()*300 - 150; 
			tree.mesh.rotation.y = Math.random()*Math.PI;
			
			tree.mesh.rotation.x = angle;

			// Create collectable with probability 
			this.collectables.push({
				collectable: null,
				hit: false,
				old: false,
				empty: true
			});
			


			var obstacle = {
				tree: tree,
				initial_angle: angle,
				angle: angle,
				global_x: tree.mesh.position.x,
				global_y: tree.mesh.position.y,
				global_z: tree.mesh.position.z,
				old: true,
				hit: false
			}

			this.obstacles.push(obstacle);
		}
	}

	this.initialize();


	// TODO: (1) Function that clears the road of obstacles/collectables
	this.clear = function(){
		
		for(var i = 0; i < this.obstacles.length; i++){
			this.mesh.remove(this.obstacles[i].tree.mesh);
		}

		
		for(var i = 0; i < this.collectables.length; i++){
			this.mesh.remove(this.collectables[i].collectable.mesh);
		}

		this.obstacles = [];
		this.collectables = [];
	}

	// Class methods
	this.set_speed = function(speed){
		this.angular_speed = speed;
	}

	this.impulse = function(strength){
		this.mesh.rotation.x -= strength;
	}

	this.update = function(){

		// Rotate surface 
		road.mesh.rotation.x += this.angular_speed;
 
		// Only spawn new obstacles in a certain window (at a certain angle)

		// SCENE.scene.add(box.mesh);
		
		// Dead zone
		
		for(var i = 0; i < this.obstacles.length; i++){

			if(!this.obstacles[i].old && this.obstacles[i].global_y > -200 ) this.obstacles[i].old = true;

			// Update global position
			this.obstacles[i].angle += this.angular_speed;
			this.obstacles[i].global_y = (radius + this.ground_offset)*Math.cos(this.obstacles[i].angle);
			this.obstacles[i].global_z = (radius + this.ground_offset)*Math.sin(this.obstacles[i].angle);

			// Check if obstacle is collided with
			if(this.obstacles[i].hit){
				
				this.obstacles[i].tree.mesh.rotation.x -= 0.05*(this.obstacles[i].tree.mesh.rotation.x - (this.obstacles[i].initial_angle - Math.PI/2));

			}else{
				this.obstacles[i].tree.mesh.rotation.x = this.obstacles[i].initial_angle;
			}

			// Check if obstacle is in dead zone
			var obstacle = this.obstacles[i];
			
			if(obstacle.global_y < -300 && obstacle.old){

				this.mesh.remove(obstacle.tree.mesh);
				
				if(!this.collectables[i].empty){
					this.mesh.remove(this.collectables[i].collectable.mesh);
					this.mesh.remove(this.collectables[i].collectable.collision_box);
				}

				if(this.spawn == true){
					// Create another tree at the initial angle
					var tree = new Tree();

					tree.mesh.position.y = (radius + this.ground_offset)*Math.cos(obstacle.initial_angle); 
					tree.mesh.position.z = (radius + this.ground_offset)*Math.sin(obstacle.initial_angle);
					tree.mesh.position.x = Math.random()*300 - 150; 
					tree.mesh.rotation.y = Math.random()*Math.PI;

					this.obstacles[i].tree = tree;
					this.obstacles[i].old = false;
					this.obstacles[i].hit = false;

					// Create collectable with probability 
					if(Math.random() < this.spawn_rate){

						// Create colelctable
						var collectable = new Collectable();

						// Take whichever side has more space
						if(tree.mesh.position.x > 0){
							collectable.mesh.position.x = (tree.mesh.position.x - 150)/ 2;
						}else{
							collectable.mesh.position.x = ( 150 + tree.mesh.position.x)/2;
						}

						collectable.mesh.position.y = tree.mesh.position.y;
						collectable.mesh.position.z = tree.mesh.position.z;
						collectable.mesh.rotation.x = this.obstacles[i].angle;

						collectable.collision_box.position.x = collectable.mesh.position.x;
						collectable.collision_box.position.y = collectable.mesh.position.y;
						collectable.collision_box.position.z = collectable.mesh.position.z;
						collectable.collision_box.rotation.x = collectable.mesh.rotation.x;

						this.collectables[i].collectable = collectable;
						this.collectables[i].hit = false;
						this.collectables[i].old = false;
						this.collectables[i].empty = false;

			 			this.mesh.add(collectable.mesh);
			 			this.mesh.add(collectable.collision_box);

					}else{
						this.collectables[i].empty = true;
					}

					this.mesh.add(tree.mesh);
				}

			}

		}
		
	}
	


}
