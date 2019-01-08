// Entry point
window.addEventListener('load', init, false);


// Global variables
var SCENE;

var road, sky;
var mouse = {x:0, y:0};
var context;

var world_angle=60, 
 	world_radius=600;

var GAME;

function init(){

	// Initialize audio
	context = new AudioContext();

	// set up SCENE.scene, camera, SCENE.renderer
	SCENE = create_scene('world', true);

	GAME = initialize_game();

	document.addEventListener('click', context.resume().then(() => {console.log("Audio context resumed.")}));


	// set up lighting
	create_lights(SCENE.scene);

	// add objects
	create_character(0);
	create_environment();

	// Input handler
	document.addEventListener('mousemove', input_handler, false);

	

	// start game loop
	game_loop();
	
}











function create_character(){

	car = new Car();

	// Add car lights to SCENE.scene
	for(var i = 0; i < car.lights.length; i++){
		SCENE.scene.add(car.lights[i]);
	}

	var car_scale = 1;
	var curve_offset = 1;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	// Calculate position depending on world_angle using trigonometry
	car.mesh.position.z = Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset) - 600;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;
	car.mesh.rotation.x = Math.atan(slope) + Math.PI/2;
	car.mesh.castShadow=true;
	car.mesh.receiveShadow = true;

	SCENE.scene.add(car.mesh);

	SCENE.sfx.engine_loop_sfx.play();

}



function create_environment(world_radius=600, world_width=400){

	road = new Road(true, world_radius, world_width);
	road.mesh.position.y = -world_radius;
	road.mesh.receiveShadow = true;
	SCENE.scene.add(road.mesh);

	road.set_speed(0.005);

	sky = new Sky(60, 1000, 800, 50);
	sky.mesh.position.y = -world_radius;
	SCENE.scene.add(sky.mesh);


	// var box = new Collectable();
	// box.mesh.position.y += 10;
	// SCENE.scene.add(box.mesh);

	// tree = new Tree(0,0,0);
	// tree.mesh.position.x = 0;
	// tree.mesh.position.y = 30;
	// tree.mesh.position.z = 0;
	// tree.mesh.rotation.y = Math.PI/6;
	// SCENE.scene.add(tree.mesh);


}



function game_loop(){

	requestAnimationFrame(game_loop);
	
	var collided = check_collision(car.mesh.children[0]);
	if(true){

	
		road.update();

		sky.mesh.rotation.x += 0.003;

		// TODO: Combine these in a smart way (minimizing coupling)
		car.update();
		car_movement();
	}	

	SCENE.renderer.render(SCENE.scene, camera);
}

function input_handler(event){

	// normalize mouse input value
	var x = (event.clientX/SCENE.WIDTH)*2 - 1; // value between -1 and 1
	var y = (event.clientY/SCENE.HEIGHT)*2 - 1;// value between -1 and 1

	mouse = {x:x, y:y};

}


function car_movement(){

	var speed = 0.03;

	var target_x = map(mouse.x, -1, 1, -150, 150);
	var target_y = map(mouse.y, -1, 1, 25, 175);

	var error = target_x - car.mesh.position.x;

	car.mesh.position.x += error*speed;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;

	var target_angle = Math.atan(slope) + Math.PI/2;
	car.mesh.rotation.x -= 0.1*(car.mesh.rotation.x - target_angle);


	car.mesh.position.z -= 0.04*(car.mesh.position.z - Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - 1));
	car.mesh.position.y -= 0.04*(car.mesh.position.y - Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - 1) + 600);


	car.wheel_mesh_array[2].rotation.y = -error*error*error*0.0000003 + Math.PI;
	car.wheel_mesh_array[3].rotation.y = -error*error*error*0.0000003;
	
	car.set_angle(-(target_x - car.mesh.position.x)*0.002);
	
}

function make_transparent(object, opacity){
	object.material.transparent = true;
	object.material.opacity = opacity;
}

function check_collision(Player){

	// TODO: Improve collision system such as to have custom collision effects.
	//  depending on which side of the car the collision occured

	// var Player = SCENE.scene.getObjectByName('car');
	var originPoint = car.mesh.position.clone();
	for (var vertexIndex = 0; vertexIndex < Player.geometry.vertices.length; vertexIndex++){       
	    
	    var localVertex = Player.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(Player.matrix);
        var directionVector = globalVertex.sub(Player.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

        // Check obstacle collision
	    for(var tree_index = 1; tree_index < road.obstacles.length; tree_index++){

	    	// For performance increase, check less collisions, only imminent
	    	// This can be further reduced to a smaller window
	    	if(road.obstacles[tree_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.obstacles[tree_index].tree.mesh.children[0]);
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.obstacles[tree_index].hit){
	            
            		c = SCENE.sfx.hit_sfx.cloneNode();
            		c.play();

            		car.mesh.rotation.x += Math.PI/14;
            		car.mesh.position.z += 60;
            		car.mesh.position.y -= 20;

	            	road.obstacles[tree_index].hit = true;
	            	var obj = road.obstacles[tree_index].tree.mesh;
					for(var j = 0; j < obj.children.length; j++){
						make_transparent(obj.children[j], 0.4);
					}	        	

					
				}
	        }
	    }

	    // Check collectable collision
	    for(var collectable_index = 0; collectable_index < road.collectables.length; collectable_index++){

	    	// Obstacles and collectables have same y and z values
	    	if(road.collectables[collectable_index].empty) continue;
	    	if(road.obstacles[collectable_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.collectables[collectable_index].collectable.collision_box);
	    	
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.collectables[collectable_index].hit){
	            	

            		// SCENE.sfx.ding_sfx.stop();
            		c = SCENE.sfx.ding_sfx.cloneNode();
            		c.play();

            		console.log("OK");

	            	road.collectables[collectable_index].hit = true;
	            	var obj = road.collectables[collectable_index].collectable.mesh;

	            	// Do something with object
					        	

					
				}
	        }
	    }

	}
}








