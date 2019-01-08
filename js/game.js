var road, car, GAME;

function initialize_game(){

	var GAME = {};

	GAME.started = false;

	// Set level
	GAME.level = 0;

	// Keep track of covered distance
	GAME.distance = 0;

	// Keep track of score
	GAME.score = 0; // increases on gift collection


	


	return GAME;


}

function start_game(GAME, car, road){

	GAME.started = true;
	GAME.level = 0;
	GAME.score = 0;
	GAME.distance = 0;

	road = road;
	car = car;

	road.spawn = true;

	return GAME;

}

function increase_difficulty(){

	// TODO: handle level increase mechanic

}

function update_game(){



}