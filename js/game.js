var road, car, GAME;

function initialize_game(){

	var GAME = {};

	GAME.started = false;


	// Set initial speed and current speed
	GAME.initial_speed = 0.005;
	GAME.speed = GAME.initial_speed;

	// Set level
	GAME.level = 0;

	GAME.health = 100;

	// Keep track of covered distance
	GAME.distance = 0;

	// Keep track of score
	GAME.score = 0; // increases on gift collection
	GAME.score_multiplier = 1;

	


	return GAME;


}

function start_game(GAME, car, road){

	GAME.started = true;
	GAME.level = 0;
	GAME.score = 0;
	GAME.distance = 0;
	GAME.initial_speed = 0.005;
	GAME.speed = GAME.initial_speed;
	GAME.score_multiplier = 1;
	GAME.health = 100;

	GAME.spawn_rate = 0.3;

	road = road;
	car = car;

	road.spawn = true;
	road.spawn_rate = GAME.spawn_rate;

	return GAME;

}

function increase_difficulty(GAME){

	// handle level increase mechanic
	GAME.speed += 0.001; 

	road.set_speed(GAME.speed);

	GAME.score_multiplier += 0.5;

	// DESIGN: Any new ideas for level increase?
	// 
	
	return GAME;

}
function decrease_difficulty(GAME){

	// handle level increase mechanic
	GAME.speed -= 0.001; 

	road.set_speed(GAME.speed);

	GAME.score_multiplier -= 0.5;

	// DESIGN: Any new ideas for level increase?
	
	return GAME;


}


// TODO: Endgame condition 
function update_game(){



}