
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

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}