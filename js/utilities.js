
// Contains common functions and classes to be used


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


function deg2rad(angle){
	return angle*Math.PI/180;
}

function map(value, min_value, max_value, min_target, max_target){
	return min_target + ((Math.max(Math.min(value, max_value), min_value) - min_value)/(max_value-min_value))*(max_target-min_target);
}