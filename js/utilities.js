
// Contains common functions and classes to be used


var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	green: 0x689C80,
	pink:0xF5986E,
	darkBlue:0x231951,
	blue:0x68c3c0,
	darkerBlue:0x529997,
	black: 0x171a1c,
	yellow: 0xFDD235,
	fog: 0x151719
};

function deg2rad(angle){
	return angle*Math.PI/180;
}

function map(value, min_value, max_value, min_target, max_target){
	return min_target + ((Math.max(Math.min(value, max_value), min_value) - min_value)/(max_value-min_value))*(max_target-min_target);
}